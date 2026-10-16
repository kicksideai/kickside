-- The automation timer source (A18, A28.10). The round supplies its stamped
-- occurrence; the source reads no database.
local json = require("json")
local time = require("time")

local M = {}

local function invalid(code, message)
    return { success = false, error = { code = code, message = message, retriable = false, scope = "flow" } }
end

local function nonempty(value)
    return type(value) == "string" and value ~= ""
end

function M.pull(request)
    if type(request) ~= "table" then return invalid("invalid_request", "request is required"), nil end
    if type(request.limit) ~= "number" or request.limit < 1 or request.limit ~= math.floor(request.limit) then
        return invalid("invalid_request", "limit must be a positive integer"), nil
    end
    if not nonempty(request.idempotency_key) then
        return invalid("invalid_request", "idempotency_key is required"), nil
    end
    local config = request.config
    if type(config) ~= "table" or not nonempty(config.automation_id) or not nonempty(config.drive_key) then
        return invalid("invalid_config", "automation_id and drive_key are required"), nil
    end
    local occurrence = config.occurrence
    if type(occurrence) ~= "table" or type(occurrence.occurrence_seq) ~= "number"
        or occurrence.occurrence_seq < 1 or occurrence.occurrence_seq ~= math.floor(occurrence.occurrence_seq) then
        return invalid("invalid_config", "persisted occurrence sequence is required"), nil
    end
    local key = config.drive_key .. ":" .. tostring(occurrence.occurrence_seq)
    if occurrence.occurrence_key ~= key then
        return invalid("invalid_config", "occurrence key does not match drive and sequence"), nil
    end
    local due = occurrence.occurrence_due_at
    if not nonempty(due) then return invalid("invalid_config", "occurrence due time is required"), nil end
    local parsed, parse_err = time.parse(time.RFC3339, due)
    if parse_err or not parsed or parsed:utc():format(time.RFC3339) ~= due then
        return invalid("invalid_config", "occurrence due time must be canonical UTC"), nil
    end
    if not nonempty(occurrence.occurrence_payload_json) then
        return invalid("invalid_config", "persisted occurrence payload is required"), nil
    end
    local payload, decode_err = json.decode(occurrence.occurrence_payload_json)
    if decode_err or type(payload) ~= "table" or payload.fired_at ~= due then
        return invalid("invalid_config", "occurrence payload must contain its persisted fired_at"), nil
    end
    return {
        success = true,
        items = { { item_key = key, dedup_key = key, op = "upsert", payload = payload, occurred_at = due } },
        next_cursor = key,
        has_more = false,
    }, nil
end

return M
