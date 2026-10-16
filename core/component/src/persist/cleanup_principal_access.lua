-- The component store owns direct grants. A principal deletion must also
-- remove its grants on components that remain owned by someone else.
-- The lifecycle reaper retries this callback without advancing its cursor
-- until every indexed page has been removed.
local sql = require("sql")
local component_types = require("component_types")
local error_envelope = require("error_envelope")

local BATCH = 50

local function failure(err: error): any
    return {success = false, error = err}
end

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "component grant cleanup response is invalid", details = {code = "component_grant_cleanup_response", field = field}})
end

local function run(request: any): any
    local principal_id = type(request) == "table" and request.principal_id or nil
    if type(principal_id) ~= "string" or principal_id == "" then
        return { success = false, error = errors.new({
            message = "principal_id is required", kind = errors.INVALID,
        }) }
    end

    local db, db_err = sql.get(component_types.db_id())
    if db_err then return failure(errors.wrap(db_err, "component database unavailable")) end
    if type(db) ~= "table" and type(db) ~= "userdata" then return failure(response_error("database")) end
    local tx, begin_err = db:begin()
    if not begin_err and type(tx) ~= "table" and type(tx) ~= "userdata" then begin_err = response_error("transaction") end
    if begin_err then
        local err = error_envelope.cleanup(function(): (any, error?) return db:release() end,
            errors.wrap(begin_err, "component grant cleanup transaction failed"), "release component grant cleanup database")
        return failure(err :: error)
    end

    local function abort(primary: error): any
        local err = error_envelope.cleanup(function(): (any, error?) return tx:rollback() end,
            primary, "rollback component grant cleanup")
        err = error_envelope.cleanup(function(): (any, error?) return db:release() end,
            err, "release component grant cleanup database")
        return failure(err :: error)
    end

    local rows, read_err = tx:query([[SELECT access_id FROM kickside_component_access
        WHERE subject_type = $1 AND subject_id = $2 LIMIT 51]], { "user", principal_id })
    if read_err then return abort(errors.wrap(read_err, "component grant cleanup scan failed")) end
    if type(rows) ~= "table" then return abort(response_error("rows")) end

    local count = math.min(#rows, BATCH)
    for index = 1, count do
        local _, delete_err = tx:execute([[DELETE FROM kickside_component_access
            WHERE access_id = $1 AND subject_type = $2 AND subject_id = $3]],
            { rows[index].access_id, "user", principal_id })
        if delete_err then return abort(errors.wrap(delete_err, "component grant cleanup delete failed")) end
    end

    local committed, commit_err = tx:commit()
    if not commit_err and committed ~= true then commit_err = response_error("commit") end
    commit_err = error_envelope.cleanup(function(): (any, error?) return db:release() end,
        commit_err, "release component grant cleanup database")
    if commit_err then return failure(errors.wrap(commit_err, "component grant cleanup commit failed")) end
    if #rows > BATCH then
        return failure(errors.new({kind = errors.CONFLICT, retryable = true,
            message = "component grant cleanup has another bounded page", details = {code = "component_grant_cleanup_pending"}}))
    end

    return { success = true, deleted = count }
end

return { run = run }
