-- kickside.core:threads mutations on an ALREADY-EXISTING thread: update, delete,
-- list. Split out of resource.lua (the create/ensure/emit path, which carries the
-- output-authorization logic) to keep both files under the repo's size limit.
-- Re-exported onto the resource module so kickside.core.threads:contract_resource
-- stays one whole-module handle for its HTTP API callers.

local json = require("json")
local common = require("contract_common")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local is_str = common.is_str
local normalize_int_arg = common.normalize_int_arg
local actor_id = common.actor_id
local open_db = common.open_db
local emit_update = common.emit_update
local threads_reader = require("threads_reader")
local threads_teardown = require("threads_teardown")
local threads_thread_crud = require("threads_thread_crud")

local M = {}

function M.finish_mutation(db: sql.DB, value: any, primary: error?, operation: string, code: string): (any?, error?)
    local supplied_error = primary ~= nil
    value, primary = error_envelope.binding(value, primary, nil, operation, code)
    local unproven = not supplied_error and primary ~= nil
    local err = error_envelope.cleanup(function()
        local result, release_err = db:release()
        if release_err and (not primary or unproven) then release_err = committed_error.new(release_err) end
        return result, release_err
    end, primary, "release " .. operation .. " connection")
    if err then return nil, err end
    return value, nil
end

-- update patches a thread's state / thread_class / attrs. attrs is JSON-encoded
-- here so the writer stores a string. Returns { thread_id, thread }.
function M.update(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local params: { [string]: any } = {}
    if args.state ~= nil then
        params.has_state, params.state = true, args.state
    end
    if args.thread_class ~= nil then
        params.has_thread_class, params.thread_class = true, args.thread_class
    end
    if args.attrs ~= nil then
        params.has_attrs = true
        local attrs_json = args.attrs
        if type(args.attrs) ~= "string" then
            local encoded, encode_err = json.encode(args.attrs)
            if encode_err or not encoded then
                return nil, (errors.new({ message = "attrs must be JSON serializable", kind = errors.INVALID }) :: error)
            end
            attrs_json = encoded
        end
        params.attrs_json = attrs_json
    end

    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local thread, write_err = threads_thread_crud.update(_db, args.thread_id :: string, params, actor_id())
    thread, write_err = M.finish_mutation(_db, thread, write_err, "update thread", "thread_update_result_missing")
    if write_err then return nil, write_err end

    if params.has_thread_class then
        local _, marker_err = threads_thread_crud.ensure_thread_type(
            tostring((thread :: table).id), tostring((thread :: table).thread_class))
        if marker_err then return nil, committed_error.new(marker_err) end
    end

    local emit_err = emit_update(tostring((thread :: table).id), "kickside.threads:thread.updated")
    if emit_err then return nil, committed_error.new(emit_err) end
    return { thread_id = args.thread_id, thread = thread }, nil
end

-- delete removes a thread and its component (the writer cascades the kickside_*
-- rows then removes the component via the contract). Returns { thread_id }.
function M.delete(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local result, write_err = threads_teardown.delete(_db, args.thread_id :: string, actor_id())
    result, write_err = M.finish_mutation(_db, result, write_err, "delete thread", "thread_delete_result_missing")
    if write_err then return nil, write_err end

    local emit_err = emit_update(args.thread_id :: string, "kickside.threads:thread.deleted")
    if emit_err then return nil, committed_error.new(emit_err) end
    return result, nil
end

-- list returns readable threads, optionally filtered by thread class and implementation.
function M.list(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local limit, limit_err = normalize_int_arg(args.limit, "limit", 1, 1000)
    if limit_err then return nil, limit_err end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local rows, read_err = threads_reader.list(_db, {
        thread_class = args.thread_class,
        impl_id = args.impl_id,
        limit = limit,
    })
    local err = error_envelope.cleanup(function() return _db:release() end, read_err, "release thread list connection")
    if err then return nil, err end
    rows, err = error_envelope.binding(rows, nil, nil, "read thread list", "thread_list_result_missing")
    if err then return nil, err end
    return { threads = rows }, nil
end

return M
