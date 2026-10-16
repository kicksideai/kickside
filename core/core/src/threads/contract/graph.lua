-- Thread children and relationships use per-thread READ checks.
-- The class vocabulary remains global.

local sql = require("sql")
local reader = require("threads_reader")
local common = require("contract_common")
local error_envelope = require("error_envelope")
local is_str = common.is_str
local normalize_int_arg = common.normalize_int_arg
local open_db = common.open_db

local M = {}

-- list_children returns the threads parented to thread_id (active parent edge).
function M.list_children(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local limit, limit_err = normalize_int_arg(args.limit, "limit", 1, 1000)
    if limit_err then return nil, limit_err end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local rows, read_err = reader.list_children(_db, args.thread_id :: string, limit)
    read_err = error_envelope.cleanup(function() return _db:release() end, read_err, "Release thread children database")
    if read_err then return nil, read_err end
    local verified, proof_err = error_envelope.binding(rows, nil, nil, "Read thread children", "thread_graph_read_response")
    if proof_err then return nil, proof_err end
    return { children = verified }, nil
end

-- list_edges returns a thread's relationship edges, after a READ check.
function M.list_edges(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local limit, limit_err = normalize_int_arg(args.limit, "limit", 1, 1000)
    if limit_err then return nil, limit_err end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local rows, read_err = reader.list_edges(_db, args.thread_id :: string, limit)
    read_err = error_envelope.cleanup(function() return _db:release() end, read_err, "Release thread edges database")
    if read_err then return nil, read_err end
    local verified, proof_err = error_envelope.binding(rows, nil, nil, "Read thread edges", "thread_graph_read_response")
    if proof_err then return nil, proof_err end
    return { edges = verified }, nil
end

-- list_classes returns the distinct thread classes present (no per-thread gate).
function M.list_classes(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local limit, limit_err = normalize_int_arg(args.limit, "limit", 1, 1000)
    if limit_err then return nil, limit_err end
    if args.cursor ~= nil and type(args.cursor) ~= "string" then
        return nil, errors.new({message = "cursor must be a string", kind = errors.INVALID})
    end
    local db, db_err = open_db()
    if db_err then return nil, db_err end
    local _db = db :: sql.DB

    local rows, read_err, next_cursor = reader.list_classes(_db, {limit = limit, cursor = args.cursor})
    read_err = error_envelope.cleanup(function() return _db:release() end, read_err, "Release thread classes database")
    if read_err then return nil, read_err end
    local verified, proof_err = error_envelope.binding(rows, nil, nil, "Read thread classes", "thread_graph_read_response")
    if proof_err then return nil, proof_err end
    return { classes = verified, next_cursor = next_cursor }, nil
end

return M
