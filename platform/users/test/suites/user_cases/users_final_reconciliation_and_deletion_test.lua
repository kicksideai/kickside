local test = require("test")
local json = require("json")
local time = require("time")
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local security = require("security")
local user_repo = require("user_repo")
local user_credentials_repo = require("user_credentials_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_groups_repo = require("user_groups_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local admin_repo = require("admin_repo")
local provisioning = require("provisioning")
local directory = require("directory")
local scope_resolver = require("scope_resolver")
local execution_identity = require("execution_identity")
local set_user_groups = require("set_user_groups")
local delete_user = require("delete_user")
local delete_principal = require("delete_principal")
local update_user = require("update_user")
local list_users = require("list_users")
local lifecycle_report = require("lifecycle_report")
local session_index = require("session_index")

local TEST_USER_ID = "test_user_structure_suite"
local TEST_EMAIL = TEST_USER_ID .. "@test.local"

local function define_tests()
    test.describe("user management", function()
        test.describe("sourced group reconciliation", function()
            local sid = ""
            local SRC = "sso:test"
            local G_MANUAL = "app.security:user"
            local G_A = "app.security:admin"
            local G_B = "app.security:editor"

            test.it("adds sourced rows for the desired set", function()
                local created, cerr = user_repo.create({
                    email = "src_" .. tostring(os.time()) .. "@test.local",
                    full_name = "Src", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                sid = tostring(created.user_id)

                local res, err = provisioning.reconcile_sourced_groups(sid, SRC, { G_A, G_B })
                test.is_nil(err)
                test.eq(res.groups_added, 2)
                test.eq(res.groups_removed, 0)

                local check = user_groups_repo.get_user_groups(sid)
                test.eq(#check.groups, 2)
            end)

            test.it("removes only the no-longer-asserted sourced rows on a second call", function()
                local res, err = provisioning.reconcile_sourced_groups(sid, SRC, { G_B })
                test.is_nil(err)
                test.eq(res.groups_added, 0)
                test.eq(res.groups_removed, 1)

                local check = user_groups_repo.get_user_groups(sid)
                test.eq(#check.groups, 1)
                test.eq(check.groups[1], G_B)
            end)

            test.it("never deletes a manual grant when an SSO reconcile drops it", function()
                -- Reset this user's memberships, then hold G_MANUAL manually.
                user_groups_repo.remove_all_user_groups(sid)
                local _, aerr = user_groups_repo.assign_user_to_group(sid, G_MANUAL)
                test.is_nil(aerr)

                -- An SSO reconcile that also asserts G_MANUAL does not duplicate or
                -- take over the existing manual row; it only adds G_A under its source.
                local r1 = provisioning.reconcile_sourced_groups(sid, SRC, { G_MANUAL, G_A })
                test.eq(r1.groups_added, 1)
                test.eq(r1.groups_removed, 0)

                -- A later SSO reconcile to empty drops only the SSO-owned row (G_A);
                -- the manual G_MANUAL survives.
                local r2 = provisioning.reconcile_sourced_groups(sid, SRC, {})
                test.eq(r2.groups_removed, 1)

                local check = user_groups_repo.get_user_groups(sid)
                test.eq(#check.groups, 1)
                test.eq(check.groups[1], G_MANUAL)
            end)

            test.it("cleans up", function()
                if sid ~= "" then
                    user_groups_repo.remove_all_user_groups(sid)
                    user_lifecycle_repo.delete(sid)
                end
            end)
        end)

        -- A groups lookup failure must propagate as a 500, never be swallowed to an
        -- empty set: the edit form reads security_groups back, so "error" seen as
        -- "no groups" would let a save wipe a user's real memberships.
        test.describe("list_users propagates a groups lookup error", function()
            local function with_groups_repo(fake: any, body)
                local original = rawget(list_users, "_user_groups_repo")
                rawset(list_users, "_user_groups_repo", fake)
                local ok, err = pcall(body)
                rawset(list_users, "_user_groups_repo", original)
                if not ok then error(err) end
            end

            test.it("returns 500 with the groups error instead of empty groups", function()
                local created, cerr = user_repo.create({
                    email = "listgrp_" .. tostring(os.time()) .. "@test.local",
                    full_name = "List Grp", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                local uid = tostring(created.user_id)

                with_groups_repo({
                    get_user_groups_batch = function()
                        return nil, "groups backend unavailable"
                    end,
                }, function()
                    local status, resp = list_users.process(100, 0)
                    test.eq(status, 500)
                    test.is_false(resp.success)
                    test.eq(resp.error, "groups backend unavailable")
                    test.is_nil(resp.users)
                end)

                user_lifecycle_repo.delete(uid)
            end)

            test.it("attaches groups and succeeds when the lookup works", function()
                local status, resp = list_users.process(100, 0)
                test.eq(status, 200)
                test.is_true(resp.success)
                test.not_nil(resp.users)
            end)
        end)

        test.describe("delete", function()
            test.it("deletes existing user", function()
                local result, err = user_lifecycle_repo.delete(TEST_USER_ID)
                test.is_nil(err)
                test.not_nil(result)
            end)

            test.it("user no longer exists after delete", function()
                local user, err = user_repo.get(TEST_USER_ID)
                test.is_nil(user)
                test.not_nil(err)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
