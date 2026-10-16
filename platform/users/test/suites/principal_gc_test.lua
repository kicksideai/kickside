local test = require("test")
local sql = require("sql")
local security = require("security")
local time = require("time")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local session_index = require("session_index")
local delete_principal = require("delete_principal")
local profile_writer = require("profile_writer")

local function get_db(): sql.DB
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    if not db then error("app:db is unavailable") end
    return db
end

local function insert(db, table_name, values)
    local _, err = sql.builder.insert(table_name):set_map(values):run_with(db):exec()
    test.is_nil(err)
end

local function count(db, table_name, column, value)
    local rows, err = sql.builder.select("COUNT(*) AS n")
        :from(table_name):where(column .. " = ?", value):run_with(db):query()
    test.is_nil(err)
    return tonumber(rows[1].n)
end

local function create_user(id)
    local user, err = user_repo.create_passwordless({
        user_id = id, email = id .. "@test.local", full_name = id,
    })
    test.is_nil(err)
    test.not_nil(user)
end

local function define_tests()
    test.describe("principal owner GC", function()
        test.it("deletes account, memberships, token and session index while retaining another owner", function()
            local suffix = tostring(os.time())
            local owned, other = "gc_owned_" .. suffix, "gc_other_" .. suffix
            local owned_token, other_token = "gc_owned_token_" .. suffix, "gc_other_token_" .. suffix
            create_user(owned)
            create_user(other)

            local membership, membership_err = user_groups_repo.assign_user_to_group(owned, "app.security:user")
            test.is_nil(membership_err)
            test.not_nil(membership)
            local db = get_db()
            insert(db, "kickside_user_auth_tokens", { token_key = ":" .. owned_token, token_value = "seed" })
            insert(db, "kickside_user_auth_tokens", { token_key = ":" .. other_token, token_value = "seed" })
            db:release()

            local owned_index, owned_err = session_index.record_minted(owned_token .. ".signature", owned, 0)
            local other_index, other_err = session_index.record_minted(other_token .. ".signature", other, 0)
            test.is_nil(owned_err)
            test.is_nil(other_err)
            test.not_nil(owned_index)
            test.not_nil(other_index)

            local result = delete_principal.run({ principal_id = owned })
            test.is_true(result.success)
            test.is_true(result.deleted)
            db = get_db()
            for _, row in ipairs({
                { "app_users", "user_id" },
                { "app_user_groups", "user_id" },
                { "kickside_user_sessions", "user_id" },
            }) do
                test.eq(count(db, row[1], row[2], owned), 0)
            end
            test.eq(count(db, "kickside_user_auth_tokens", "token_key", ":" .. owned_token), 0)
            test.eq(count(db, "app_users", "user_id", other), 1)
            test.eq(count(db, "kickside_user_sessions", "user_id", other), 1)
            test.eq(count(db, "kickside_user_auth_tokens", "token_key", ":" .. other_token), 1)
            db:release()

            test.is_true(delete_principal.run({ principal_id = owned }).success)
            test.is_true(delete_principal.run({ principal_id = other }).success)
        end)

        test.it("deletes profile rows through the principal cleanup contract", function()
            local suffix = tostring(os.time())
            local owned, other = "gc_profile_owned_" .. suffix, "gc_profile_other_" .. suffix
            local db = get_db()
            for _, id in ipairs({ owned, other }) do
                insert(db, "kickside_profile", {
                    user_id = id, namespace = "kickside.profile", key = "display_name",
                    value = '"name"', value_type = "string",
                })
            end
            db:release()

            local result = profile_writer.cleanup_principal({ principal_id = owned })
            test.is_true(result.success)
            db = get_db()
            test.eq(count(db, "kickside_profile", "user_id", owned), 0)
            test.eq(count(db, "kickside_profile", "user_id", other), 1)
            db:release()
            test.is_true(profile_writer.cleanup_principal({ principal_id = owned }).success)
            test.is_true(profile_writer.cleanup_principal({ principal_id = other }).success)
        end)

        test.it("physically expires token rows and their ownership index", function()
            local id = "gc_ttl_" .. tostring(os.time())
            create_user(id)
            local policy, policy_err = security.policy("app:test_runtime")
            test.is_nil(policy_err)
            test.not_nil(policy)
            local scope = security.new_scope({ policy })
            local actor = security.new_actor(id, {})
            local store, store_err = security.token_store("kickside.users.security:tokens")
            test.is_nil(store_err)
            test.not_nil(store)
            local token, mint_err = store:create(actor, scope, { expiration = "1s" })
            store:close()
            test.is_nil(mint_err)
            test.not_nil(token)
            local indexed, index_err = session_index.record_minted(token, id, 0)
            test.is_nil(index_err)
            test.not_nil(indexed)
            local key, key_err = session_index.token_key(token)
            test.is_nil(key_err)
            local db = get_db()
            test.eq(count(db, "kickside_user_auth_tokens", "token_key", key), 1)
            test.eq(count(db, "kickside_user_sessions", "token_key", key), 1)
            db:release()

            local remaining = 1
            for _ = 1, 24 do
                time.sleep("250ms")
                db = get_db()
                remaining = count(db, "kickside_user_auth_tokens", "token_key", key)
                local index_rows = count(db, "kickside_user_sessions", "token_key", key)
                db:release()
                if remaining == 0 then
                    test.eq(index_rows, 0)
                    break
                end
            end
            test.eq(remaining, 0)
            test.is_true(delete_principal.run({ principal_id = id }).success)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
