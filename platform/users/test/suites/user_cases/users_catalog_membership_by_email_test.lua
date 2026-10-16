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
        test.describe("group membership resolves by email (login parity)", function()
            local gid = ""
            local gemail = "grp_" .. tostring(os.time()) .. "@test.local"

            test.it("assign by email is visible under the canonical user_id", function()
                local created, cerr = user_repo.create({
                    email = gemail, full_name = "Grp", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                gid = tostring(created.user_id)

                local _, aerr = user_groups_repo.assign_user_to_group(gemail, "app.security:user")
                test.is_nil(aerr)

                local u, uerr = user_groups_repo.get_user_with_groups(gid)
                test.is_nil(uerr)
                local found = false
                for _, g in ipairs(u.security_groups) do
                    if g == "app.security:user" then found = true end
                end
                test.is_true(found)
            end)

            test.it("get_user_groups by email matches the canonical id", function()
                local by_email = user_groups_repo.get_user_groups(gemail)
                local by_id = user_groups_repo.get_user_groups(gid)
                test.eq(#by_id.groups, 1)
                test.eq(#by_email.groups, #by_id.groups)
            end)

            test.it("set_user_groups by email replaces under the canonical id", function()
                local _, serr = user_group_sources_repo.set_user_groups(gemail, { "app.security:user", "app.security:admin" })
                test.is_nil(serr)
                local u = user_groups_repo.get_user_with_groups(gid)
                test.eq(#u.security_groups, 2)
            end)

            test.it("assigning to an unknown identifier reports user-not-found", function()
                local _, aerr = user_groups_repo.assign_user_to_group("nobody_" .. tostring(os.time()) .. "@x.local", "app.security:user")
                test.not_nil(aerr)
            end)

            test.it("cleans up", function()
                if gid ~= "" then
                    user_groups_repo.remove_all_user_groups(gid)
                    user_lifecycle_repo.delete(gid)
                end
            end)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
