-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Owners retire exact subject names only after permanently fencing their entity
-- identities. Event expiry is not proof of entity death (see the module SPEC).
local sql = require("sql")
local security = require("security")
local common = require("contract_common")
local subjects = require("subjects")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")

local M = {}
local PAGE = 100

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, retryable = false, message = message})
end

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "subject retirement returns no valid " .. field .. " proof",
        details = {code = "subject_retirement_response", field = field}})
end

function M.retire_subjects(args: any): (any?, error?)
    if type(args) ~= "table" or not common.is_str(args.thread_id) then
        return nil, invalid("thread_id is required")
    end
    local names = args.subjects
    if type(names) ~= "table" or #names < 1 or #names > PAGE then
        return nil, invalid("subjects must be an array of 1 to 100 distinct subject names")
    end
    local seen: {[string]: boolean} = {}
    local marks, params = {}, {args.thread_id}
    local count = 0
    for key, name in pairs(names) do
        if type(key) ~= "number" or key ~= math.floor(key) or key < 1 or key > #names then
            return nil, invalid("subjects must be a dense array")
        end
        local err = subjects.validate_subject(name)
        if err then return nil, err end
        if seen[name] then return nil, invalid("subjects must be distinct") end
        seen[name] = true
        count = count + 1
    end
    if count ~= #names then return nil, invalid("subjects must be a dense array") end
    for _, name in ipairs(names) do
        params[#params + 1] = name
        marks[#marks + 1] = "$" .. tostring(#params)
    end

    local db, db_err = common.open_db()
    if db_err then return nil, db_err end
    local result, err = sql_boundary.transaction(db :: sql.DB, function(tx: sql.Transaction): (any?, error?)
        local dialect, dialect_err = tx:db_type()
        if dialect_err then return nil, errors.wrap(dialect_err, "subject retirement dialect failed") end
        if dialect ~= sql.type.SQLITE and dialect ~= sql.type.POSTGRES then return nil, response_error("dialect") end
        local lock = dialect == sql.type.POSTGRES and " FOR UPDATE" or ""
        local rows, read_err = tx:query("SELECT thread_class,deleting_at FROM kickside_thread WHERE id=$1" .. lock,
            {args.thread_id})
        rows, read_err = sql_boundary.bounded_rows(rows, read_err, "lock subject retirement thread",
            "thread rows", 0, 1, response_error)
        if read_err then return nil, read_err end
        if #rows == 0 then
            return nil, errors.new({kind = errors.NOT_FOUND, retryable = false, message = "thread not found"})
        end
        local thread = rows[1]
        if type(thread.thread_class) ~= "string" or thread.thread_class == "" then return nil, response_error("thread class") end
        if security.can("threads.subjects.retire", thread.thread_class) ~= true then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "subject retirement denied"})
        end
        if thread.deleting_at ~= nil then
            return nil, errors.new({kind = errors.CONFLICT, retryable = false, message = "thread deletion is in progress"})
        end
        local deleted, delete_err = tx:execute("DELETE FROM kickside_thread_subject WHERE thread_id=$1 AND subject IN ("
            .. table.concat(marks, ",") .. ")", params)
        local retired, proof_err = sql_boundary.bounded_row_count(deleted, delete_err, "retire thread subjects",
            "retired count", #names, response_error)
        if proof_err then return nil, proof_err end
        return {thread_id = args.thread_id, retired = retired}, nil
    end, "retire thread subjects", response_error)
    local committed = err == nil
    err = error_envelope.cleanup(function(): (any, error?)
        local released, release_err = (db :: sql.DB):release()
        if not release_err and released ~= true then release_err = response_error("release") end
        if release_err and committed then release_err = committed_error.new(release_err) end
        return released, release_err
    end, err, "release subject retirement database")
    if err then return nil, err end
    return result, nil
end

return M
