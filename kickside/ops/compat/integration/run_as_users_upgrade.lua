local test = require("test")
local sql = require("sql")
local json = require("json")
local security = require("security")
local session = require("session")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local migration_runner = require("migration_runner")
local plan = require("plan")
local session_index = require("session_index")

local function await_migrations()
    local runner = migration_runner.setup("app:db")
    local _, find_err = runner:find_migrations()
    if find_err then error(tostring(find_err)) end
    local applied = runner:run()
    if applied.status == "error" or tonumber(applied.migrations_failed) > 0 then error(tostring(applied.error or "published migrations fail")) end
    local deadline = require("time").after("15s")
    while true do
        local status = runner:status()
        if status.status == "error" then error(tostring(status.error)) end
        if status.pending_migrations == 0 then return end
        local selected = require("channel").select({deadline:case_receive(), require("time").after("10ms"):case_receive()})
        if selected.channel == deadline then error("published migrations do not complete") end
    end
end

local function state_db()
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS compat_run_as_upgrade (id TEXT PRIMARY KEY, value TEXT NOT NULL)")
    if create_err then db:release(); error(tostring(create_err)) end
    return db
end

local function put(db, id, value)
    local _, err = db:execute("INSERT INTO compat_run_as_upgrade (id,value) VALUES ($1,$2)", {id, value})
    if err then error(tostring(err)) end
end

local function get(db, id)
    local rows, err = db:query("SELECT value FROM compat_run_as_upgrade WHERE id=$1", {id})
    if err or not rows or not rows[1] then error(tostring(err or "missing " .. id)) end
    return rows[1].value
end

local function account_bytes(db, user_id)
    local rows, err = db:query("SELECT user_id,email,full_name,password_hash,status,auth_generation,created_at,updated_at FROM app_users WHERE user_id=$1", {user_id})
    if err then error(tostring(err)) end
    test.eq(#rows, 1)
    return json.encode(rows[1])
end

local function membership_bytes(db, user_id)
    local rows, err = db:query("SELECT user_id,group_id,source,created_at FROM app_user_groups WHERE user_id=$1 ORDER BY group_id", {user_id})
    if err then error(tostring(err)) end
    return json.encode(rows)
end

return {run = test.run_cases(function()
    test.describe("published password session update", function()
        test.it("keeps the exact signed bearer valid across update and restart", function()
            await_migrations()
            local db = state_db()
            for _, role in ipairs({"member", "admin"}) do
                local user_id = "compat_run_as_" .. role
                if plan.phase == "baseline" then
                    local created, create_err = user_repo.create({user_id = user_id, email = user_id .. "@test.local", full_name = "Published " .. role, password = "testpass123", status = "active"})
                    test.is_nil(create_err, tostring(create_err)); test.not_nil(created)
                    local _, group_err = user_groups_repo.assign_user_to_group(user_id, "app.security:" .. (role == "admin" and "admin" or "user"))
                    test.is_nil(group_err, tostring(group_err))
                    local user, user_err = user_groups_repo.get_user_with_groups(user_id)
                    test.is_nil(user_err, tostring(user_err))
                    local minted, mint_err = session.mint(user)
                    test.is_nil(mint_err, tostring(mint_err)); test.not_nil(minted)
                    put(db, role .. ":bearer", minted.token)
                    put(db, role .. ":actor", json.encode({id = minted.actor:id(), meta = minted.actor:meta(), scope_id = minted.scope_id}))
                    local key, key_err = session_index.token_key(minted.token)
                    test.is_nil(key_err)
                    local rows, read_err = db:query("SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1", {key})
                    test.is_nil(read_err); test.eq(#rows, 1)
                    put(db, role .. ":snapshot", rows[1].token_value)
                    put(db, role .. ":account", account_bytes(db, user_id))
                    put(db, role .. ":memberships", membership_bytes(db, user_id))
                else
                    local bearer = get(db, role .. ":bearer")
                    local expected = json.decode(get(db, role .. ":actor"))
                    local store, store_err = security.token_store("kickside.users.security:tokens")
                    test.is_nil(store_err, tostring(store_err)); test.not_nil(store)
                    local actor, scope, validate_err = store:validate(bearer)
                    store:close()
                    test.is_nil(validate_err, tostring(validate_err)); test.not_nil(scope)
                    test.eq(actor:id(), expected.id)
                    test.eq(json.encode(actor:meta()), json.encode(expected.meta))
                    local key, key_err = session_index.token_key(bearer)
                    test.is_nil(key_err)
                    local rows, read_err = db:query("SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1", {key})
                    test.is_nil(read_err); test.eq(#rows, 1)
                    test.is_true(rows[1].token_value == get(db, role .. ":snapshot"), "stored session policy snapshot changes")
                    test.eq(account_bytes(db, user_id), get(db, role .. ":account"), "existing account bytes change")
                    test.eq(membership_bytes(db, user_id), get(db, role .. ":memberships"), "existing membership bytes change")
                    local markers, marker_err = db:query("SELECT COUNT(*) AS count FROM app_user_bot_accounts")
                    test.is_nil(marker_err)
                    test.eq(tonumber(markers[1].count), 0, "existing accounts receive bot markers")
                end
            end
            db:release()
        end)
    end)
end)}
