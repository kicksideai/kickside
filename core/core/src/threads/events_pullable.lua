-- Thread events as a pullable source (CONTRACTS threads events_pullable).
--
-- The cursor is the last consumed sequence; a pull reads list_events from
-- cursor + 1 under the caller's READ access. Each item is one appended event (op upsert) keyed by its
-- event id, which is stable across replay. When cursor < max_pruned_seq the
-- events after the cursor are gone: the pull returns no items, keeps the cursor
-- and reports source_gap with the boundary and the earliest available sequence,
-- so the engine never skips pruned history silently.
-- Request event_type overrides config.event_type.

local sql = require("sql")
local json = require("json")
local time = require("time")
local env = require("threads_env")
local reader = require("threads_reader")
local error_envelope = require("error_envelope")

local M = {}

M.MAX_LIMIT = 500

-- Stored timestamp shapes: PostgreSQL TIMESTAMPTZ text and the SQLite TEXT forms.
local TIMESTAMP_LAYOUTS = {
    "2006-01-02T15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999-07",
    "2006-01-02 15:04:05.999999999",
}

local function data_error(code: string, message: string, cause: error?): table
    local err = cause or errors.new({kind = errors.INVALID, message = message,
        retryable = false, details = {code = code}})
    local envelope = error_envelope.encode(err)
    envelope.code, envelope.retriable, envelope.scope = code, false, "flow"
    return {success = false, error = envelope}
end

local function canonical_time(value: any): (string?, error?)
    local text = tostring(value)
    for _, layout in ipairs(TIMESTAMP_LAYOUTS) do
        local parsed, parse_err = time.parse(layout, text)
        if not parse_err and parsed then
            return (parsed :: any):utc():format(time.RFC3339) :: string, nil
        end
    end
    return nil, (errors.new({ message = "event created_at has an unknown shape: " .. text, kind = errors.INTERNAL }) :: error)
end

local function is_count(value: any, min: integer): boolean
    return type(value) == "number" and value == math.floor(value) and value >= min
end

function M.pull(request: any): (table?, error?)
    local req = type(request) == "table" and request or {}
    local config = type(req.config) == "table" and req.config or {}
    if type(config.thread_id) ~= "string" or config.thread_id == "" then
        return data_error("invalid_config", "config.thread_id is required"), nil
    end
    if config.event_type ~= nil and (type(config.event_type) ~= "string" or config.event_type == "") then
        return data_error("invalid_config", "config.event_type must be a non-empty string"), nil
    end
    local event_type = config.event_type
    if req.event_type ~= nil then
        if type(req.event_type) ~= "string" or req.event_type == "" then
            return data_error("invalid_request", "event_type must be a non-empty string"), nil
        end
        event_type = req.event_type
    end
    if not is_count(req.cursor, 0) then
        return data_error("invalid_request", "cursor must be an integer >= 0"), nil
    end
    if not is_count(req.limit, 1) then
        return data_error("invalid_request", "limit must be an integer >= 1"), nil
    end
    if type(req.idempotency_key) ~= "string" or req.idempotency_key == "" then
        return data_error("invalid_request", "idempotency_key is required"), nil
    end
    local cursor = math.floor(req.cursor) :: integer
    local limit = math.min(math.floor(req.limit), M.MAX_LIMIT) :: integer

    local db, db_err = sql.get(env.db_id() :: string)
    if db_err then return nil, (errors.wrap(db_err, "db unavailable") :: error) end
    if not db then
        return nil, errors.new({kind = errors.INTERNAL, message = "thread pullable database returns no handle",
            retryable = false, details = {code = "pullable_database_response"}})
    end
    local page, read_err = reader.list_events(db :: sql.DB, config.thread_id :: string, {
        from_seq = cursor + 1,
        limit = limit + 1,
        ascending = true,
        event_type = event_type,
    })
    db:release()
    if read_err then
        if errors.is(read_err, errors.NOT_FOUND) then return data_error("not_found", read_err:message(), read_err), nil end
        if errors.is(read_err, errors.PERMISSION_DENIED) then return data_error("permission_denied", read_err:message(), read_err), nil end
        if errors.is(read_err, errors.INVALID) then return data_error("invalid_config", read_err:message(), read_err), nil end
        return nil, read_err
    end
    local p = page :: table

    if p.source_gap then
        return {
            success = true,
            items = {},
            next_cursor = cursor,
            has_more = false,
            source_gap = { max_pruned_seq = p.source_gap.max_pruned_seq, earliest_seq = p.source_gap.earliest_seq },
        }, nil
    end

    local events = p.events :: { table }
    local items: { table } = {}
    local next_cursor = cursor
    for index = 1, math.min(#events, limit) do
        local event = events[index]
        local body, decode_err = json.decode(tostring(event.body))
        if decode_err then
            return nil, (errors.wrap(decode_err, "event " .. tostring(event.id) .. " body is not JSON") :: error)
        end
        local occurred_at, time_err = canonical_time(event.created_at)
        if time_err then return nil, time_err end
        local seq = math.floor(tonumber(event.seq) :: number) :: integer
        items[index] = {
            item_key = tostring(event.id),
            dedup_key = tostring(event.id),
            op = "upsert",
            -- The source declares the event body schema: transforms receive
            -- exactly that body. Event metadata belongs to the item envelope.
            payload = body,
            event_type = event.type,
            role = event.role,
            external_identity = event.external_source ~= nil and event.external_id ~= nil
                and { source = event.external_source, id = event.external_id, version = event.external_version } or nil,
            occurred_at = occurred_at,
            seq = seq,
        }
        next_cursor = seq
    end

    return { success = true, items = items, next_cursor = next_cursor, has_more = #events > limit }, nil
end

return M
