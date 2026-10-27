local test = require("test")
local json = require("json")
local time = require("time")
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local security = require("security")
local contract = require("contract")
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
        test.describe("scope resolver v2 explicit path", function()
            local sid = ""
            local semail = "scope_" .. tostring(os.time()) .. "@test.local"
            local other = ""

            local function fake_actor(id)
                return { id = function() return id end, meta = function() return {} end }
            end

            local function with_overrides(overrides, body)
                local saved = {}
                for key, value in pairs(overrides) do
                    saved[key] = rawget(scope_resolver, key)
                    rawset(scope_resolver, key, value)
                end
                local ok, err = pcall(body)
                for key, _ in pairs(overrides) do rawset(scope_resolver, key, saved[key]) end
                if not ok then error(err) end
            end

            local function self_security(id)
                return {
                    actor = function() return fake_actor(id) end,
                    can = function() return false end,
                    policy = function() return nil, "no policy" end,
                }
            end

            test.it("pins ID-22 vectors on the single core codec", function()
                test.eq(execution_identity.delegation_policy_id("group", "eng", "*"),
                    "kickside.delegate:010000000567726f757000000003656e67000000012a")
                local uuid = "123e4567-e89b-12d3-a456-426614174000"
                test.is_true(execution_identity.delegation_bytes("group", "eng", uuid)
                    ~= execution_identity.delegation_bytes("group", "eng:x", uuid))
                test.is_true(execution_identity.delegation_bytes("group", "eng", "*")
                    ~= execution_identity.delegation_bytes("group", "eng", uuid))
            end)

            test.it("defines no identity primitive of its own (single core owner)", function()
                test.is_nil((scope_resolver :: any).check_grant)
                test.is_nil((scope_resolver :: any).DELEGATE_ACTION)
                test.is_nil((scope_resolver :: any).KIND)
            end)

            test.it("cleans up the scope resolver users", function()
                if sid ~= "" then
                    user_groups_repo.remove_all_user_groups(sid)
                    user_lifecycle_repo.delete(sid)
                end
                if other ~= "" then
                    user_groups_repo.remove_all_user_groups(other)
                    user_lifecycle_repo.delete(other)
                end
            end)
        end)
        test.describe("email is case-insensitive", function()
            local cid = ""
            test.it("resolves a user by an upper-cased email", function()
                local lower = "case_" .. tostring(os.time()) .. "@test.local"
                local created, cerr = user_repo.create({
                    email = lower, full_name = "Case", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                test.not_nil(created)
                cid = tostring(created.user_id)
                local found, err = user_repo.get(lower:upper())
                test.is_nil(err)
                test.not_nil(found)
                test.eq(tostring(found.email), lower)
            end)
            test.it("cleans up the case-test user", function()
                if cid ~= "" then user_lifecycle_repo.delete(cid) end
            end)
        end)

        test.describe("user lookup precedence", function()
            local email_like_user_id = "collision_" .. tostring(os.time()) .. "@test.local"
            local email_owner_id = ""

            test.it("prefers an exact user_id over another user's email", function()
                local by_id, id_err = user_repo.create({
                    user_id = email_like_user_id,
                    email = "id_owner_" .. tostring(os.time()) .. "@test.local",
                    full_name = "Id Owner",
                    password = "testpass123",
                    status = "active",
                })
                test.is_nil(id_err)
                test.not_nil(by_id)

                local by_email, email_err = user_repo.create({
                    email = email_like_user_id,
                    full_name = "Email Owner",
                    password = "testpass123",
                    status = "active",
                })
                test.is_nil(email_err)
                test.not_nil(by_email)
                email_owner_id = tostring(by_email.user_id)

                local found, get_err = user_repo.get(email_like_user_id)
                test.is_nil(get_err)
                test.eq(found.user_id, email_like_user_id)

                local with_groups, groups_err = user_groups_repo.get_user_with_groups(email_like_user_id)
                test.is_nil(groups_err)
                test.eq(with_groups.user_id, email_like_user_id)
                local principals, resolve_err = directory.resolve({ refs = { { type = "user", id = email_like_user_id } } })
                test.is_nil(resolve_err)
                test.eq(principals.principals[1].id, email_like_user_id)
            end)

            test.it("cleans up lookup precedence users", function()
                if email_owner_id ~= "" then user_lifecycle_repo.delete(email_owner_id) end
                user_lifecycle_repo.delete(email_like_user_id)
            end)
        end)

        test.describe("directory resolves every member", function()
            test.it("resolves an email beyond the first page of users", function()
                local suffix = crypto.random.uuid()
                local uid = "older-member-" .. suffix
                local email = uid .. "@test.local"
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                db = assert(db)
                for i = 0, 50 do
                    local id = i == 0 and uid or ("newer-member-" .. suffix .. "-" .. i)
                    local _, insert_err = sql.builder.insert("app_users"):set_map({
                        user_id = id, email = id .. "@test.local", full_name = "Member", status = "active", password_hash = "fixture",
                        created_at = i == 0 and "2000-01-01T00:00:00Z" or "2099-01-01T00:00:00Z",
                    }):run_with(db):exec()
                    test.is_nil(insert_err)
                end
                local answer, resolve_err = directory.resolve({ refs = { { type = "user", id = email:upper() } } })
                local root, root_err = crypto.random.uuid()
                test.is_nil(root_err)
                local _, component_err = sql.builder.insert("kickside_components"):set_map({
                    component_id = root, impl_id = "test:directory-share",
                }):run_with(db):exec()
                test.is_nil(component_err)
                local access_id, access_id_err = crypto.random.uuid()
                test.is_nil(access_id_err)
                local _, access_err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = access_id, component_id = root, source_component_id = root,
                    subject_type = "user", subject_id = "app:test_runner", access_mask = 15, inherited = 0,
                }):run_with(db):exec()
                test.is_nil(access_err)
                db:release()
                local definition, contract_err = contract.get("kickside.component:component_service")
                test.is_nil(contract_err)
                local owner, open_err = definition:with_actor(security.new_actor("app:test_runner"))
                    :with_scope(security.scope()):open()
                test.is_nil(open_err)
                local granted, grant_err = owner:grant_subtree({ root_component_id = root,
                    subject = { subject_id = email:upper(), subject_type = "user" }, access_mask = 1 })
                test.is_nil(grant_err)
                test.is_true(granted.success, tostring(granted.error))
                local member, member_err = definition:with_actor(security.new_actor(uid)):with_scope(security.scope()):open()
                test.is_nil(member_err)
                local read, read_err = member:get_access_context({ component_id = root, access_mask = 1 })
                test.is_nil(read_err)
                test.is_true(read.success)
                local outsider, outsider_err = definition:with_actor(security.new_actor("outsider-" .. suffix))
                    :with_scope(security.scope()):open()
                test.is_nil(outsider_err)
                local denied, denied_err = outsider:get_access_context({ component_id = root, access_mask = 1 })
                test.is_nil(denied_err)
                test.is_false(denied.success)
                local revoked, revoke_err = owner:revoke_subtree({ root_component_id = root,
                    subject = { subject_id = email:upper(), subject_type = "user" } })
                test.is_nil(revoke_err)
                test.is_true(revoked.success)
                local after, after_err = member:get_access_context({ component_id = root, access_mask = 1 })
                test.is_nil(after_err)
                test.is_false(after.success)
                db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                db = assert(db)
                local _, component_cleanup_err = sql.builder.delete("kickside_components"):where("component_id = ?", root):run_with(db):exec()
                test.is_nil(component_cleanup_err)
                local _, cleanup_err = sql.builder.delete("app_users"):where("user_id LIKE ?", "%" .. suffix .. "%"):run_with(db):exec()
                db:release()
                test.is_nil(cleanup_err)
                test.is_nil(resolve_err)
                test.eq(answer.principals[1].id, uid)
            end)
        end)

        test.describe("directory exists (swappable seam for share grantee checks)", function()
            test.it("returns exists=true for a real user", function()
                local r = directory.exists({ type = "user", id = TEST_USER_ID })
                test.is_true(r.exists)
            end)

            test.it("returns exists=false for a phantom user", function()
                local r = directory.exists({ type = "user", id = "nope_" .. tostring(os.time()) })
                test.is_false(r.exists)
            end)

            test.it("returns exists=false for a blank id", function()
                local r = directory.exists({ type = "user", id = "" })
                test.is_false(r.exists)
            end)

            -- Groups are sourced from the security_scopes catalog, not from declared
            -- policies or existing memberships: a catalog scope exists even with no
            -- members, and an id absent from the catalog does not.
            test.it("returns exists=true for a built-in catalog group", function()
                local r = directory.exists({ type = "group", id = "app.security:user" })
                test.is_true(r.exists)
            end)

            test.it("returns exists=true for a custom catalog group with no members", function()
                local r = directory.exists({ type = "group", id = "kickside.security.scopes:editors" })
                test.is_true(r.exists)
            end)

            test.it("returns exists=false for a group absent from the catalog", function()
                local r = directory.exists({ type = "group", id = "app.security:not_a_scope" })
                test.is_false(r.exists)
            end)
        end)

        test.describe("directory groups (live memberships for grant resolution, A32)", function()
            test.it("returns an active user's group memberships", function()
                local uid = "dir_groups_" .. tostring(os.time())
                local _, create_err = user_repo.create({ user_id = uid, email = uid .. "@test.local", password = "testpass123", status = "active" })
                test.is_nil(create_err)
                user_groups_repo.assign_user_to_group(uid, "app.security:user")
                local r = directory.groups({ id = uid })
                test.is_true(r.active)
                test.eq(#r.groups, 1)
                test.eq(r.groups[1], "app.security:user")
                user_lifecycle_repo.delete(uid)
            end)

            test.it("answers an unknown or inactive user with no groups", function()
                local missing = directory.groups({ id = "nope_" .. tostring(os.time()) })
                test.is_false(missing.active)
                test.eq(#missing.groups, 0)
                local uid = "dir_inactive_" .. tostring(os.time())
                user_repo.create({ user_id = uid, email = uid .. "@test.local", password = "testpass123", status = "suspended" })
                user_groups_repo.assign_user_to_group(uid, "app.security:user")
                local inactive = directory.groups({ id = uid })
                test.is_false(inactive.active)
                test.eq(#inactive.groups, 0)
                user_lifecycle_repo.delete(uid)
            end)
        end)

        test.describe("directory search sources groups from the catalog", function()
            test.it("surfaces a custom catalog group even with zero members", function()
                local r = directory.search({ kinds = { "group" } })
                local found = false
                for _, p in ipairs(r.principals) do
                    if p.type == "group" and p.id == "kickside.security.scopes:editors" then
                        found = true
                        test.eq(p.label, "Editors")
                    end
                end
                test.is_true(found)
            end)

            test.it("resolve labels a group from the catalog", function()
                local r = directory.resolve({ refs = { { type = "group", id = "app.security:user" } } })
                test.eq(#r.principals, 1)
                test.eq(r.principals[1].label, "User")
            end)
        end)

        -- set_user_groups validates every requested group id against the assignable
        -- scope catalog before persisting; an unknown id is rejected, not stored.
        test.describe("set_user_groups validates group ids against the catalog", function()
            local vid = ""

            test.it("creates a user to assign groups to", function()
                local created, cerr = user_repo.create({
                    email = "setgrp_" .. tostring(os.time()) .. "@test.local",
                    full_name = "Set Grp", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                vid = tostring(created.user_id)
            end)

            test.it("rejects an unknown group id with 400", function()
                local status, body = set_user_groups.process(vid, json.encode({ groups = { "app.security:bogus" } }))
                test.eq(status, 400)
                test.is_false(body.success)
                test.eq(body.error, "unknown group: app.security:bogus")
            end)

            test.it("rejects internal system scopes that are not assignable roles", function()
                local status, body = set_user_groups.process(vid, json.encode({ groups = { "app.security:ingress" } }))
                test.eq(status, 400)
                test.is_false(body.success)
                test.eq(body.error, "unknown group: app.security:ingress")
            end)

            test.it("rejects duplicate group ids before persistence", function()
                local status, body = set_user_groups.process(vid, json.encode({
                    groups = { "app.security:user", "app.security:user" },
                }))
                test.eq(status, 400)
                test.is_false(body.success)
                test.eq(body.error, "duplicate group: app.security:user")

                local check = user_groups_repo.get_user_groups(vid)
                test.eq(#check.groups, 0)
            end)

            test.it("rejects a groups object instead of accepting it as an empty array", function()
                local status, body = set_user_groups.process(vid, '{"groups":{"group":"app.security:user"}}')
                test.eq(status, 400)
                test.is_false(body.success)
                test.eq(body.error, "groups must be an array")
            end)

            test.it("accepts a catalog group id", function()
                local status, body = set_user_groups.process(vid, json.encode({ groups = { "app.security:user" } }))
                test.eq(status, 200)
                test.is_true(body.success)

                local check = user_groups_repo.get_user_groups(vid)
                test.eq(#check.groups, 1)
                test.eq(check.groups[1], "app.security:user")
            end)

            test.it("cleans up", function()
                if vid ~= "" then
                    user_groups_repo.remove_all_user_groups(vid)
                    user_lifecycle_repo.delete(vid)
                end
            end)
        end)

        -- delete/update accept the {id} path param as a user_id OR an email and
        -- resolve it to the canonical user_id; an unknown id is a 404, not a 500.
        test.describe("delete/update are email-addressable", function()
            local demail = "del_email_" .. tostring(os.time()) .. "@test.local"
            local uemail = "upd_email_" .. tostring(os.time()) .. "@test.local"
            local uid = ""
            local queued_id = ""
            local retry_id = ""

            test.it("update by email resolves the canonical user", function()
                local created, cerr = user_repo.create({
                    email = uemail, full_name = "Upd Email", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                uid = tostring(created.user_id)

                local status, body = update_user.process(uemail, json.encode({ full_name = "Renamed" }))
                test.eq(status, 200)
                test.is_true(body.success)

                local user, get_err = user_repo.get(uid)
                test.is_nil(get_err)
                test.not_nil(user)
                test.eq((user :: any).full_name, "Renamed")
            end)

            test.it("update of an unknown id returns 404", function()
                local status, body = update_user.process("nobody_" .. tostring(os.time()) .. "@x.local", json.encode({ full_name = "X" }))
                test.eq(status, 404)
                test.is_false(body.success)
            end)

            test.it("delete by email durably queues the canonical user", function()
                lifecycle_report.reset()
                local created, cerr = user_repo.create({
                    email = demail, full_name = "Del Email", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                queued_id = tostring(created.user_id)
                local assigned, assign_err = user_groups_repo.assign_user_to_group(queued_id, "app.security:user")
                test.is_nil(assign_err)
                test.not_nil(assigned)

                local status, body = delete_user.process(demail)
                test.eq(status, 202)
                test.is_true(body.success)
                test.eq(body.result.user_id, queued_id)
                test.is_true(body.result.deletion_queued)
                test.eq(lifecycle_report.principal_deleted_calls, 1)
                test.eq(lifecycle_report.principal_deleted_events, 1)

                -- The request only owns the durable append. Destruction belongs to
                -- the reaper's cleanup handler, so the account still exists here.
                local user, get_err = user_repo.get(queued_id)
                test.is_nil(get_err)
                test.not_nil(user)
            end)

            test.it("the durable cleanup deletes once and replay is a no-op", function()
                local first = delete_principal.run({ principal_id = queued_id })
                test.is_true(first.success)
                test.is_true(first.deleted)

                local missing = user_repo.get(queued_id)
                test.is_nil(missing)

                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                db = assert(db)
                test.not_nil(db)
                if not db then error(tostring(db_err or "database unavailable")) end
                local rows, query_err = sql.builder.select("COUNT(*) AS count")
                    :from("app_user_groups")
                    :where("user_id = ?", queued_id)
                    :run_with(db):query()
                db:release()
                test.is_nil(query_err)
                test.eq(tonumber(rows[1].count), 0)

                local replay = delete_principal.run({ principal_id = queued_id })
                test.is_true(replay.success)
                test.is_false(replay.deleted)
            end)

            test.it("a report failure leaves the account present but safely inactive", function()
                lifecycle_report.reset()
                local created, cerr = user_repo.create({
                    email = "del_report_" .. tostring(os.time()) .. "@test.local",
                    full_name = "Del Report", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                retry_id = tostring(created.user_id)
                lifecycle_report.fail_principal_deleted = true
                local status, body = delete_user.process(retry_id)
                lifecycle_report.fail_principal_deleted = false
                test.eq(status, 500)
                test.is_false(body.success)
                test.is_true(tostring(body.error):find("principal deletion report failed", 1, true) ~= nil)
                test.eq(lifecycle_report.principal_deleted_calls, 1)
                test.eq(lifecycle_report.principal_deleted_events, 0)

                local user, get_err = user_repo.get(retry_id)
                test.is_nil(get_err)
                test.not_nil(user)
                test.eq(user.status, "inactive")
            end)

            test.it("retry converges on one event and one destructive delete", function()
                local status, body = delete_user.process(retry_id)
                test.eq(status, 202)
                test.is_true(body.success)

                -- A caller retry before the reaper drains the event uses the same
                -- external identity; the lifecycle seam accepts it idempotently.
                local duplicate_status, duplicate_body = delete_user.process(retry_id)
                test.eq(duplicate_status, 202)
                test.is_true(duplicate_body.success)
                test.eq(lifecycle_report.principal_deleted_calls, 3)
                test.eq(lifecycle_report.principal_deleted_events, 1)

                local first = delete_principal.run({ user_id = retry_id })
                local replay = delete_principal.run({ principal_id = retry_id })
                test.is_true(first.success)
                test.is_true(first.deleted)
                test.is_true(replay.success)
                test.is_false(replay.deleted)

                local missing = user_repo.get(retry_id)
                test.is_nil(missing)
            end)

            test.it("delete of an unknown id returns 404", function()
                local status, body = delete_user.process("nobody_" .. tostring(os.time()) .. "@x.local")
                test.eq(status, 404)
                test.is_false(body.success)
            end)

            test.it("cleans up", function()
                if uid ~= "" then user_lifecycle_repo.delete(uid) end
            end)
        end)

        -- SSO-managed memberships carry a `source` and are reconciled independently
        -- of manual ones: apply_sourced_groups only ever touches rows it owns.
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
