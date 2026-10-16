-- POST /threads/{id}/projections/remove — delete a projection (by projection_id
-- or by kind + projection_key) and cascade its cursors. Response shape:
-- { success, removed }.

local http = require("http")
local json = require("json")
local sql = require("sql")

local core_db = require("core_db")
local writer = require("writer")
local thread_access = require("thread_access")
local release_error = thread_access.release_error
local error_response = thread_access.error_response
local error_envelope = require("error_envelope")

local function handler(): ()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)

    local thread_id = req:param("id")
    if type(thread_id) ~= "string" or thread_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "thread id is required" })
        return
    end

    local data: table = {}
    local raw = req:body()
    if type(raw) == "string" and raw ~= "" then
        local decoded, decode_err = json.decode(raw)
        if decode_err or type(decoded) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid JSON" })
            return
        end
        data = decoded
    end

    local db, db_err = sql.get(core_db.id())
    if not db_err then db, db_err = error_envelope.binding(db, nil, "release", "open thread database", "core_http_operation_response") end
    if db_err then
        local status, payload = error_response(db_err, "db unavailable: " .. tostring(db_err))
        res:set_status(status); res:write_json(payload)
        return
    end

    -- Gate the thread before writing: WRITE access required.
    local allowed, _status, gate_msg, _component_id, gate_err = thread_access.gate_thread_access(db, thread_id, thread_access.WRITE)
    if not allowed then
        local status, payload = thread_access.failure_response(db, gate_err :: error, gate_msg)
        res:set_status(status)
        res:write_json(payload)
        return
    end

    local removed, remove_err = writer.remove_projection(db, thread_id, data)
    if not remove_err then removed, remove_err = error_envelope.binding(removed, nil, nil, "remove projection", "core_http_operation_response") end
    local err = release_error(db, remove_err, remove_err == nil)
    if err then
        local status, payload = error_response(err, err == remove_err and tostring(remove_err) or nil)
        res:set_status(status); res:write_json(payload)
        return
    end

    res:write_json({ success = true, removed = removed })
end

return { handler = handler }
