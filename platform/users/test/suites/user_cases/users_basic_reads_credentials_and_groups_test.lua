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
        test.describe("SSO actor metadata integrity", function()
            test.it("keeps canonical identity fields authoritative during session mint", function()
                local uid = "sso_meta_" .. tostring(os.time())
                local email = uid .. "@test.local"
                local created, create_err = user_repo.create({
                    user_id = uid, email = email, full_name = "Canonical SSO Name",
                    password = "testpass123", status = "active",
                })
                test.is_nil(create_err)
                test.not_nil(created)
                local _, group_err = user_groups_repo.assign_user_to_group(uid, "app.security:user")
                test.is_nil(group_err)

                local minted = provisioning.mint_session({
                    identifier = uid,
                    meta = {
                        user_id = "forged-user",
                        email = "forged@example.invalid",
                        full_name = "forged prompt identity",
                        status = "suspended",
                        security_groups = { "app.security:admin" },
                        login_time = "forged-time",
                        scope_id = "app.security:admin",
                        provider_trace = "preserved",
                    },
                })
                test.eq(minted.ok, true)
                local token = minted.token
                if type(token) ~= "string" then error("session mint did not return a token") end
                local store, store_err = security.token_store("kickside.users.security:tokens")
                test.is_nil(store_err)
                test.not_nil(store)
                local actor, _, validate_err = store:validate(token)
                test.is_nil(validate_err)
                test.not_nil(actor)
                local meta: any = actor:meta() or {}
                test.eq(actor:id(), uid)
                test.eq(meta.user_id, uid)
                test.eq(meta.email, email)
                test.eq(meta.full_name, "Canonical SSO Name")
                test.eq(meta.status, "active")
                test.eq(meta.security_groups[1], "app.security:user")
                test.eq(meta.scope_id, "app.security:user")
                test.neq(meta.login_time, "forged-time")
                test.eq(meta.provider_trace, "preserved")
                store:close()

                session_index.invalidate_token(token)
                user_groups_repo.remove_all_user_groups(uid)
                user_lifecycle_repo.delete(uid)
            end)
        end)

        test.describe("get", function()
            test.it("retrieves existing user by id", function()
                local user, err = user_repo.get(TEST_USER_ID)
                test.is_nil(err)
                test.not_nil(user)
                test.eq(user.user_id, TEST_USER_ID)
                test.eq(user.email, TEST_EMAIL)
                test.eq(user.full_name, "Test User")
                test.eq(user.status, "active")
            end)

            test.it("returns error for non-existent user", function()
                local user, err = user_repo.get("nonexistent_user_xyz")
                test.is_nil(user)
                test.not_nil(err)
            end)
        end)

        test.describe("list", function()
            test.it("returns all users", function()
                local users, err = user_repo.list()
                test.is_nil(err)
                test.not_nil(users)
                test.ok(#users >= 1)
            end)

            test.it("includes the test user", function()
                local users, err = user_repo.list()
                test.is_nil(err)
                local found = false
                for _, u in ipairs(users) do
                    if u.user_id == TEST_USER_ID then
                        found = true
                        break
                    end
                end
                test.is_true(found)
            end)

            test.it("respects limit and offset", function()
                local ua = "list_pg_a_" .. tostring(os.time())
                local ub = "list_pg_b_" .. tostring(os.time())
                user_repo.create({ user_id = ua, email = ua .. "@test.local", full_name = "List PG A", password = "testpass123", status = "active" })
                user_repo.create({ user_id = ub, email = ub .. "@test.local", full_name = "List PG B", password = "testpass123", status = "active" })

                local one, e1 = user_repo.list({ limit = 1, offset = 0 })
                test.is_nil(e1)
                test.eq(#one, 1)

                local two, e2 = user_repo.list({ limit = 2, offset = 0 })
                test.is_nil(e2)
                test.eq(#two, 2)

                -- offset advances past the first page (no overlap with the first row).
                local next_page, e3 = user_repo.list({ limit = 1, offset = 1 })
                test.is_nil(e3)
                test.eq(#next_page, 1)
                test.neq(one[1].user_id, next_page[1].user_id)

                user_lifecycle_repo.delete(ua)
                user_lifecycle_repo.delete(ub)
            end)
        end)

        test.describe("verify_password", function()
            test.it("verifies correct password", function()
                local valid, user = user_credentials_repo.verify_password(TEST_USER_ID, "testpass123")
                test.is_true(valid)
                test.not_nil(user)
            end)

            test.it("rejects wrong password", function()
                local valid, err = user_credentials_repo.verify_password(TEST_USER_ID, "wrongpass")
                test.is_false(valid)
            end)
        end)

        test.describe("password hash formats and upgrades", function()
            local function to_hex(raw: string): string
                return (raw:gsub(".", function(c: string): string
                    return string.format("%02x", c:byte())
                end))
            end

            local function seed_hash(uid, stored)
                local db, derr = sql.get("app:db")
                if derr or not db then error("db: " .. tostring(derr)) end
                local _, err = sql.builder.update("app_users")
                    :where("user_id = ?", uid)
                    :set("password_hash", stored)
                    :run_with(db):exec()
                db:release()
                test.is_nil(err)
            end

            test.it("uses independent native password salts and requires the current secret to rotate", function()
                local hashes = {}
                for i = 1, 2 do
                    local uid = "consolidation_password_" .. tostring(i)
                    local created, create_err = user_repo.create({ user_id = uid,
                        email = uid .. "@test.local", password = "same-secret-123", status = "active" })
                    test.is_nil(create_err)
                    test.not_nil(created)
                    local before, read_err = user_repo.get(uid)
                    test.is_nil(read_err)
                    hashes[i] = before.password_hash
                    for _, candidate in ipairs({ "", "wrong-secret-123" }) do
                        local rotated, rotate_err = user_credentials_repo.update_self_password(uid,
                            candidate, { password = "replacement-secret-123" })
                        test.is_nil(rotated)
                        test.eq(rotate_err, "Invalid password")
                    end
                    local unchanged, unchanged_err = user_repo.get(uid)
                    test.is_nil(unchanged_err)
                    test.eq(unchanged.password_hash, before.password_hash)
                    local rotated, rotate_err = user_credentials_repo.update_self_password(uid,
                        "same-secret-123", { password = "replacement-secret-123" })
                    test.is_nil(rotate_err)
                    test.not_nil(rotated)
                    local valid, verified_user = user_credentials_repo.verify_password(uid, "replacement-secret-123")
                    test.is_true(valid)
                    test.eq(verified_user.user_id, uid)
                    local deleted, delete_err = user_lifecycle_repo.delete(uid)
                    test.is_nil(delete_err)
                    test.not_nil(deleted)
                end
                test.neq(hashes[1], hashes[2])
            end)

            test.it("writes interoperable PBKDF2-HMAC-SHA512 hashes", function()
                local uid = "pbk2_format_" .. tostring(os.time())
                local password = "format-password-123"
                local created, err = user_repo.create({
                    user_id = uid, email = uid .. "@test.local", full_name = "PBK2",
                    password = password, status = "active",
                })
                test.is_nil(err)
                test.not_nil(created)
                local user = user_repo.get(uid)
                local iters, salt, expected = tostring(user.password_hash)
                    :match("^pbk2%$(%d+)%$(%x+)%$(%x+)$")
                test.eq(iters, "210000")
                test.eq(#tostring(salt), 32)
                test.eq(#tostring(expected), 128)
                local raw, derive_err = crypto.pbkdf2(password, tostring(salt), 210000, 64, "sha512")
                test.is_nil(derive_err)
                test.eq(to_hex(raw), tostring(expected))
                local verified, verification_result = user_credentials_repo.verify_password(uid, password)
                test.is_true(verified, tostring(verification_result))
                local verified, verification_result = user_credentials_repo.verify_password(uid, "wrong-password")
                test.is_false(verified, tostring(verification_result))
                user_lifecycle_repo.delete(uid)
            end)


        end)

        test.describe("update", function()
            test.it("updates full name", function()
                local result, err = user_lifecycle_repo.update(TEST_USER_ID, { full_name = "Updated Name" })
                test.is_nil(err)
                test.not_nil(result)

                local user, err = user_repo.get(TEST_USER_ID)
                test.is_nil(err)
                test.eq(user.full_name, "Updated Name")
            end)

            test.it("updates status", function()
                local result, err = user_lifecycle_repo.update(TEST_USER_ID, { status = "suspended" })
                test.is_nil(err)
                test.not_nil(result)

                local user, err = user_repo.get(TEST_USER_ID)
                test.is_nil(err)
                test.eq(user.status, "suspended")
            end)

            test.it("updates password", function()
                local result, err = user_lifecycle_repo.update(TEST_USER_ID, { password = "newpass12345" })
                test.is_nil(err)
                test.not_nil(result)

                local valid, user = user_credentials_repo.verify_password(TEST_USER_ID, "newpass12345")
                test.is_true(valid)
                test.not_nil(user)
            end)

            test.it("rejects update with no data", function()
                local result, err = user_lifecycle_repo.update(TEST_USER_ID, {})
                test.is_nil(result)
                test.not_nil(err)
            end)
        end)

        test.describe("security groups", function()
            test.it("assigns user to a group", function()
                local result, err = user_groups_repo.assign_user_to_group(TEST_USER_ID, "app.security:user")
                test.is_nil(err)
                test.not_nil(result)
            end)

            test.it("retrieves user groups", function()
                local result, err = user_groups_repo.get_user_groups(TEST_USER_ID)
                test.is_nil(err)
                test.not_nil(result)
                test.not_nil(result.groups)
                test.ok(#result.groups >= 1)

                local found = false
                for _, g in ipairs(result.groups) do
                    if g == "app.security:user" then
                        found = true
                        break
                    end
                end
                test.is_true(found)
            end)

            test.it("sets user groups replacing existing", function()
                local result, err = user_group_sources_repo.set_user_groups(TEST_USER_ID, {
                    "app.security:admin",
                    "app.security:user",
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.groups_added, 2)

                local check, err = user_groups_repo.get_user_groups(TEST_USER_ID)
                test.is_nil(err)
                test.eq(#check.groups, 2)
            end)

            test.it("removes user from a group", function()
                local result, err = user_groups_repo.remove_user_from_group(TEST_USER_ID, "app.security:admin")
                test.is_nil(err)
                test.not_nil(result)
                test.is_true(result.removed)

                local check, err = user_groups_repo.get_user_groups(TEST_USER_ID)
                test.is_nil(err)
                test.eq(#check.groups, 1)
                test.eq(check.groups[1], "app.security:user")
            end)

            test.it("removes all user groups", function()
                local result, err = user_groups_repo.remove_all_user_groups(TEST_USER_ID)
                test.is_nil(err)
                test.not_nil(result)

                local check, err = user_groups_repo.get_user_groups(TEST_USER_ID)
                test.is_nil(err)
                test.eq(#check.groups, 0)
            end)
        end)

        test.describe("group pagination", function()
            local G1 = "app.security:user"
            local G2 = "app.security:admin"
            local G3 = "app.security:pgtest_a"
            local PG_GROUP = "app.security:pgtest_group_" .. tostring(os.time())
            local U2 = "pgtest_u2_" .. tostring(os.time())
            local U3 = "pgtest_u3_" .. tostring(os.time())

            test.it("get_user_groups paginates with limit and offset", function()
                user_group_sources_repo.set_user_groups(TEST_USER_ID, { G1, G2, G3 })

                local page1, e1 = user_groups_repo.get_user_groups(TEST_USER_ID, { limit = 2, offset = 0 })
                test.is_nil(e1)
                test.eq(#page1.groups, 2)

                local page2, e2 = user_groups_repo.get_user_groups(TEST_USER_ID, { limit = 2, offset = 2 })
                test.is_nil(e2)
                test.eq(#page2.groups, 1)

                -- The two pages together cover all three groups with no overlap.
                local seen = {}
                for _, g in ipairs(page1.groups) do seen[g] = true end
                for _, g in ipairs(page2.groups) do seen[g] = true end
                local count = 0
                for _ in pairs(seen) do count = count + 1 end
                test.eq(count, 3)
            end)

            test.it("get_user_groups clamps an over-large limit", function()
                local res, err = user_groups_repo.get_user_groups(TEST_USER_ID, { limit = 100000 })
                test.is_nil(err)
                test.ok(#res.groups <= 100)
                test.eq(#res.groups, 3)
            end)

            test.it("get_group_users paginates with limit and offset", function()
                user_repo.create({ user_id = U2, email = U2 .. "@test.local", full_name = "PG U2", password = "testpass123", status = "active" })
                user_repo.create({ user_id = U3, email = U3 .. "@test.local", full_name = "PG U3", password = "testpass123", status = "active" })
                user_groups_repo.assign_user_to_group(TEST_USER_ID, PG_GROUP)
                user_groups_repo.assign_user_to_group(U2, PG_GROUP)
                user_groups_repo.assign_user_to_group(U3, PG_GROUP)

                local p1, e1 = user_groups_repo.get_group_users(PG_GROUP, { limit = 2, offset = 0 })
                test.is_nil(e1)
                test.eq(#p1.users, 2)

                local p2, e2 = user_groups_repo.get_group_users(PG_GROUP, { limit = 2, offset = 2 })
                test.is_nil(e2)
                test.eq(#p2.users, 1)

                local seen = {}
                for _, u in ipairs(p1.users) do seen[u.user_id] = true end
                for _, u in ipairs(p2.users) do seen[u.user_id] = true end
                local count = 0
                for _ in pairs(seen) do count = count + 1 end
                test.eq(count, 3)

                -- Cleanup helper users + memberships.
                user_groups_repo.remove_all_user_groups(U2)
                user_groups_repo.remove_all_user_groups(U3)
                user_groups_repo.remove_user_from_group(TEST_USER_ID, PG_GROUP)
                user_lifecycle_repo.delete(U2)
                user_lifecycle_repo.delete(U3)
            end)

            test.it("clears test groups", function()
                user_groups_repo.remove_all_user_groups(TEST_USER_ID)
                local check = user_groups_repo.get_user_groups(TEST_USER_ID)
                test.eq(#check.groups, 0)
            end)
        end)

        -- Emails are case-insensitive but user_ids are exact. get() matches
        -- user_id against the original identifier (email lowercased);
        -- get_user_with_groups must do the same, not lowercase the user_id.
        test.describe("case-sensitive user_id resolution", function()
            local MIXED_ID = "Mixed_User_" .. tostring(os.time())
            local MIXED_EMAIL = "mixed_" .. tostring(os.time()) .. "@test.local"

            test.it("creates a user with a mixed-case id", function()
                local result, err = user_repo.create({
                    user_id = MIXED_ID, email = MIXED_EMAIL, full_name = "Mixed Case",
                    password = "testpass123", status = "active",
                })
                test.is_nil(err)
                test.not_nil(result)
            end)

            test.it("get() resolves the mixed-case user_id", function()
                local user, err = user_repo.get(MIXED_ID)
                test.is_nil(err)
                test.not_nil(user)
                test.eq(user.user_id, MIXED_ID)
            end)

            test.it("get_user_with_groups() resolves the same mixed-case user_id", function()
                local user, err = user_groups_repo.get_user_with_groups(MIXED_ID)
                test.is_nil(err)
                test.not_nil(user)
                test.eq(user.user_id, MIXED_ID)
            end)

            test.it("cleans up the mixed-case user", function()
                user_lifecycle_repo.delete(MIXED_ID)
            end)
        end)

        -- In this app user_id is an opaque UUID, never derived from the email.
        test.describe("user_id minting", function()
            local minted_id = ""
            test.it("mints a uuid when no user_id is given (not email-derived)", function()
                local email = "minted_" .. tostring(os.time()) .. "@test.local"
                local result, err = user_repo.create({
                    email = email, full_name = "Minted", password = "testpass123", status = "active",
                })
                test.is_nil(err)
                test.not_nil(result)
                minted_id = tostring(result.user_id)
                test.is_true(#minted_id >= 32)                 -- uuid-length opaque id
                test.is_true(minted_id:find("minted") == nil)  -- not the email local-part
                test.is_true(minted_id:find("_") == nil)       -- email-derive used "_"; a uuid does not
            end)
            test.it("cleans up the minted user", function()
                if minted_id ~= "" then user_lifecycle_repo.delete(minted_id) end
            end)
        end)

        -- Group membership must be addressable by email yet resolve under the
        -- canonical (opaque uuid) user_id that login joins on. An email-addressed
        -- assignment that keyed rows by the raw email would orphan the grant and
        -- silently break group-based sharing.
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
