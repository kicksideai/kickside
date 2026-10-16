-- Drop notifications of a thread teardown. A subscriber projection registered
-- on a source thread may declare drop_notify { thread_id, type, body }; when the
-- source thread is deleted or purged, a typed event lands on the subscriber's
-- own thread in the same transaction as the teardown, so the subscriber sees
-- "my source is gone" exactly when the source is gone.
--
-- hooks reads the declared hooks; append_tx appends them on the teardown
-- transaction. A subscriber thread that no longer exists has no one to notify.
-- A hook that cannot be read fails the teardown.

local sql = require("sql")
local json = require("json")
local time = require("time")
local append = require("threads_append")
local normalize = require("threads_normalize")

local M = {}

M.EXTERNAL_SOURCE = "kickside.threads.drop_notify"

type Hook = { thread_id: string, type: string, body: { [string]: any } }

local trim = normalize.trim

local function response_error(field: string): error
    return errors.new({message = "drop notification response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "drop_notify_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

-- hooks returns the drop hooks declared by the projections on thread_id, in
-- projection id order.
function M.hooks(db_or_tx: any, thread_id: string, limit: integer?): ({ Hook }?, error?)
    local statement = "SELECT id, body FROM kickside_projection WHERE thread_id = $1 ORDER BY id"
    if limit then statement = statement .. " LIMIT " .. tostring(limit) end
    local rows, err = db_or_tx:query(statement, { thread_id })
    local read_err = rows_error(rows, err, "failed to read drop hooks", "hooks.rows")
    if read_err then return nil, read_err end
    local out: { Hook } = {}
    for _, row in ipairs(rows :: { table }) do
        local decoded: any = row.body
        if type(decoded) == "string" then
            local value, decode_err = json.decode(decoded :: string)
            if decode_err then
                return nil, errors.wrap(decode_err, "projection " .. tostring(row.id) .. " body is not JSON")
            end
            decoded = value
        end
        if type(decoded) ~= "table" then return nil, response_error("projection.body") end
        local hook = (decoded :: table).drop_notify
        if hook ~= nil then
            if type(hook) ~= "table" then return nil, response_error("drop_notify") end
            local target = trim((hook :: any).thread_id)
            local event_type = trim((hook :: any).type)
            if target == "" or event_type == "" then
                return nil, response_error("drop_notify")
            end
            local body = (hook :: any).body
            if body ~= nil and type(body) ~= "table" then return nil, response_error("drop_notify.body") end
            out[#out + 1] = { thread_id = target, type = event_type, body = body or {} }
        end
    end
    return out, nil
end

-- targets returns the subscriber thread ids of hooks.
function M.targets(hooks: { Hook }): { string }
    local out: { string } = {}
    for _, hook in ipairs(hooks) do out[#out + 1] = hook.thread_id end
    return out
end

-- append_tx appends each hook's event onto its existing subscriber thread,
-- deduplicated on the source->subscriber pair. The caller holds the thread
-- locks of the source and every target, and publishes wake demand for the
-- returned wake keys. Returns the notified subscriber thread ids.
function M.append_tx(tx: sql.Transaction, hooks: { Hook }, source_thread_id: string): ({ string }?, error?)
    local notified: { string } = {}
    if #hooks == 0 then return notified, nil end
    local dropped_at = time.now():utc():format(time.RFC3339)
    for _, hook in ipairs(hooks) do
        local rows, exists_err = tx:query("SELECT deleting_at FROM kickside_thread WHERE id = $1", { hook.thread_id })
        local read_err = rows_error(rows, exists_err, "failed to read drop_notify subscriber thread", "subscriber.rows")
        if read_err then return nil, read_err end
        if #(rows :: { table }) == 1 and rows[1].deleting_at == nil then
            local body: { [string]: any } = {}
            for key, value in pairs(hook.body) do body[key] = value end
            body.source_thread_id = source_thread_id
            if body.dropped_at == nil then body.dropped_at = dropped_at end
            local body_json, encode_err = json.encode(body)
            if encode_err then return nil, errors.wrap(encode_err, "failed to encode drop_notify body") end
            if type(body_json) ~= "string" then return nil, response_error("event.body_json") end
            local result, append_err = append.append_events_tx(tx, hook.thread_id, { {
                type = hook.type,
                role = "system",
                body_json = body_json,
                external = {
                    external_source = M.EXTERNAL_SOURCE,
                    external_id = source_thread_id .. "->" .. hook.thread_id,
                    external_version = "1",
                },
            } }, { defer_wake = true })
            if append_err then return nil, append_err end
            if type(result) ~= "table" or type(result.inserted) ~= "number" or result.inserted < 0
                or result.inserted ~= math.floor(result.inserted) then return nil, response_error("append.inserted") end
            if (result :: any).inserted > 0 then notified[#notified + 1] = hook.thread_id end
        end
    end
    return notified, nil
end

return M
