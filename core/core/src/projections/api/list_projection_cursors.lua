-- GET /threads/{id}/projections — list a thread's projections and their cursors.
-- Response shape: { success, projections, cursors, count }.

local http = require("http")
local sql = require("sql")

local core_db = require("core_db")
local http_params = require("http_params")
local reader = require("reader")
local page_cursor = require("page_cursor")
local thread_access = require("thread_access")
local release_error = thread_access.release_error
local error_response = thread_access.error_response
local error_envelope = require("error_envelope")

local function new(dependencies: any?): any
local deps = dependencies or {}
local http = deps.http or http
local sql = deps.sql or sql
local reader = deps.reader or reader
local thread_access = deps.thread_access or thread_access

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

    local limit, limit_err = http_params.query_int(req, "limit", 200, { min = 1, max = 500 })
    if limit_err then
        http_params.bad_request(res, limit_err:message(), limit_err)
        return
    end

    local projections_after, projections_after_err = page_cursor.decode(req:query("projections_cursor"), thread_id, "projections")
    local cursors_after, cursors_after_err = page_cursor.decode(req:query("cursors_cursor"), thread_id, "cursors")
    local cursor_err = projections_after_err or cursors_after_err
    if cursor_err then
        local status, payload = error_response(cursor_err, tostring(cursor_err))
        res:set_status(status); res:write_json(payload)
        return
    end

    local db, db_err = sql.get(core_db.id())
    if not db_err then db, db_err = error_envelope.binding(db, nil, "release", "open thread database", "core_http_operation_response") end
    if db_err then
        local status, payload = error_response(db_err, "db unavailable: " .. tostring(db_err))
        res:set_status(status); res:write_json(payload)
        return
    end

    -- Gate the thread before reading: READ access required.
    local allowed, _status, gate_msg, _component_id, gate_err = thread_access.gate_thread_access(db, thread_id, thread_access.READ)
    if not allowed then
        local status, payload = thread_access.failure_response(db, gate_err :: error, gate_msg)
        res:set_status(status)
        res:write_json(payload)
        return
    end

    local projections, projections_err, projections_page = reader.list_projections(db, thread_id, limit :: integer, projections_after)
    if projections_err then
        local err = release_error(db, projections_err) :: error
        local status, payload = error_response(err, err == projections_err and tostring(projections_err) or nil)
        res:set_status(status); res:write_json(payload)
        return
    end

    local cursors, cursors_err, cursors_page = reader.list_cursors(db, thread_id, limit :: integer, cursors_after)
    local err = release_error(db, cursors_err)
    if err then
        local status, payload = error_response(err, err == cursors_err and tostring(cursors_err) or nil)
        res:set_status(status); res:write_json(payload)
        return
    end
    local result, page_err = page_cursor.response(thread_id, projections or {}, cursors or {}, projections_page, cursors_page)
    if not page_err then result, page_err = error_envelope.binding(result, nil, nil, "render projection page", "core_http_operation_response") end
    if page_err then
        local status, payload = error_response(page_err, tostring(page_err))
        res:set_status(status); res:write_json(payload)
        return
    end
    result.success = true
    res:write_json(result)
end

return { handler = handler }
end

local default = new()
default.new = new
return default
