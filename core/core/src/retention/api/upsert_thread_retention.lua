-- PUT /threads/{id}/retention — set a thread's retention policy. The body's
-- retention windows are validated; values below the floor are INVALID; omitted
-- fields fall to the defaults so a thread is never left ungoverned.
-- Response: { success, policy }.

local http = require("http")
local json = require("json")
local sql = require("sql")

local core_db = require("core_db")
local repo = require("repo")
local thread_access = require("thread_access")
local release_error = thread_access.release_error
local error_response = thread_access.error_response
local error_envelope = require("error_envelope")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local sql = deps.sql or sql
    local repo = deps.repo or repo
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

    local db, db_err = sql.get(core_db.id() :: string)
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

    local policy, upsert_err = repo.upsert(db, thread_id, data)
    if not upsert_err then policy, upsert_err = error_envelope.binding(policy, nil, nil, "write thread retention", "core_http_operation_response") end
    local err = release_error(db, upsert_err, upsert_err == nil)
    if err then
        local status, payload = error_response(err, err == upsert_err and tostring(upsert_err) or nil)
        res:set_status(status); res:write_json(payload)
        return
    end

    res:write_json({ success = true, policy = policy })
end

return { handler = handler }
end

local default = new()
default.new = new
return default
