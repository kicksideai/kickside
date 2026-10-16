local sql = require("sql")
local json = require("json")
local security = require("security")

local DB = "app:db"

local M = {}

-- Records each targeted notify with the realtime authorization decision the
-- production binding applies: the actor's own hub, or realtime.notify authority.
function M.notify(args: any): any
    args = args or {}
    if type(args.data) == "table" and args.data.fail_realtime then
        return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "injected realtime failure", details = { code = "test_realtime_unavailable" } })
    end
    local db, db_err = sql.get(DB)
    if db_err then return nil, db_err end
    local _, count_err = db:execute("CREATE TABLE IF NOT EXISTS kickside_component_notify_calls (n INTEGER NOT NULL)")
    if count_err then db:release(); return nil, count_err end
    local _, insert_err = db:execute("INSERT INTO kickside_component_notify_calls (n) VALUES (1)")
    db:release()
    if insert_err then return nil, insert_err end
    for _, user_id in ipairs(args.user_ids or { args.user_id }) do
        local result, err = M.deliver(user_id, args)
        if err or not result.success then return result, err end
    end
    return { success = true }
end

function M.deliver(user_id: string, args: any): any
    local actor = security.actor()
    local authorized = (actor ~= nil and actor:id() == user_id)
        or security.can("realtime.notify", "kickside.realtime:user:" .. user_id) == true
    local db, db_err = sql.get(DB)
    if db_err or not db then
        return { success = false, error = "db unavailable: " .. tostring(db_err) }
    end
    local data = type(args.data) == "table" and args.data or {}
    local encoded, json_err = json.encode(data)
    if json_err then
        db:release()
        return { success = false, error = tostring(json_err) }
    end
    -- Suites that do not inspect deliveries still notify through this binding.
    local _, table_err = db:execute([[
        CREATE TABLE IF NOT EXISTS kickside_component_notify_access_realtime_events (
            user_id TEXT NOT NULL, topic TEXT NOT NULL, event TEXT NOT NULL,
            data TEXT NOT NULL, authorized TEXT NOT NULL)
    ]])
    if table_err then
        db:release()
        return { success = false, error = tostring(table_err) }
    end
    local _, err = db:execute([[
        INSERT INTO kickside_component_notify_access_realtime_events (user_id, topic, event, data, authorized)
        VALUES ($1, $2, $3, $4, $5)
    ]], { user_id, tostring(args.topic or ""), tostring(data.event or ""), encoded, authorized and "yes" or "no" })
    db:release()
    if err then
        return { success = false, error = tostring(err) }
    end
    if not authorized then return { success = false, error = "access denied" } end
    return { success = true }
end

function M.broadcast(): any
    error("component.notify_access must not broadcast")
end

return M
