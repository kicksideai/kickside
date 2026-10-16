local sql = require("sql")
local time = require("time")
local component = require("component")
local ops = require("component_ops")
local types = require("conn_types")

local executor = require("capacity_executor")

local M = {}

local function invalid(code: string, message: string): error
    return (errors.new({ kind = errors.INVALID, retryable = false, message = message,
        details = { code = code } }) :: error)
end

local function integer(value: any): integer?
    local number = tonumber(value)
    if number == nil or number ~= math.floor(number) or number < 0 or number == math.huge then return nil end
    return number :: integer
end

function M.new(dependencies: any?): any
    local deps = dependencies or {}
    local now_ms = deps.now_ms or function(): integer return time.now():unix_nano() // 1000000 end
    local owner = {}

    function owner.floor(component_id: string): (integer?, error?)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, invalid("connection_capacity_id_required", "connection ID is required")
        end
        local rows, read_err = component.query({ component_ids = { component_id },
            meta = { class = types.CONNECTION_CLASS }, include = { meta = true }, limit = 1 })
        if read_err then return nil, read_err end
        if not rows or not rows[1] then
            return nil, (errors.new({ kind = errors.PERMISSION_DENIED, retryable = false,
                message = "connection not found or access denied",
                details = { code = "connection_capacity_access_denied" } }) :: error)
        end
        local stored = rows[1].meta and rows[1].meta[types.CAPACITY_META_KEY]
        if stored == nil then return nil, nil end
        local floor = integer(stored)
        if floor == nil then
            return nil, (errors.new({ kind = errors.INTERNAL, retryable = false,
                message = "stored connection capacity floor is invalid",
                details = { code = "connection_capacity_floor_invalid" } }) :: error)
        end
        return floor, nil
    end

    function owner.check(component_id: string): (boolean?, error?)
        local floor, floor_err = owner.floor(component_id)
        if floor_err then return nil, floor_err end
        local now = now_ms()
        if floor ~= nil and now < floor then
            return nil, (errors.new({ kind = errors.RATE_LIMITED, retryable = true,
                message = "connection capacity is unavailable until its retry floor",
                details = { code = "connection_capacity_wait", scope = "capacity",
                    connection_id = component_id, retry_at_ms = floor, retry_after_ms = floor - now } }) :: error)
        end
        return true, nil
    end

    function owner.record(component_id: string, failure: error): (integer?, error?)
        if not errors.is(failure, errors.RATE_LIMITED) then return nil, nil end
        local details = failure:details()
        if type(details) ~= "table" or details.scope ~= "capacity" then return nil, nil end
        local now = now_ms()
        local absolute = integer(details.retry_at_ms)
        local delay = integer(details.retry_after_ms)
        if absolute == nil and delay == nil then
            return nil, invalid("connection_capacity_deadline_required", "capacity failure requires a retry deadline")
        end
        local floor = absolute or (now + (delay :: integer))
        local _, access_err = owner.floor(component_id)
        if access_err then return nil, access_err end
        local db, db_err = sql.get(ops.db_id())
        if db_err then return nil, db_err end
        local tx, tx_err = db:begin()
        if tx_err then db:release(); return nil, tx_err end
        local raised, raise_err = ops.raise_meta_floor(tx, component_id, types.CAPACITY_META_KEY, floor)
        if raise_err then
            local _, rollback_err = tx:rollback()
            db:release()
            if rollback_err then return nil, errors.wrap(rollback_err, "capacity rollback fails after " .. tostring(raise_err)) end
            return nil, raise_err
        end
        local _, commit_err = tx:commit()
        db:release()
        if commit_err then return nil, commit_err end
        return raised, nil
    end

    owner.invoke = executor.new({ check = owner.check, record = owner.record, now_ms = now_ms }).invoke

    return owner
end

function M.check(args: any): (boolean?, error?)
    if type(args) ~= "table" then return nil, invalid("connection_capacity_id_required", "connection ID is required") end
    return M.new().check(args.connection_id)
end

function M.record(args: any): (integer?, error?)
    if type(args) ~= "table" then return nil, invalid("connection_capacity_error_required", "capacity recording requires a structured native error") end
    local component_id, failure = args.connection_id, args.error
    if type(failure) ~= "table" or type(failure.kind) ~= "string" or type(failure.message) ~= "string" then
        return nil, invalid("connection_capacity_error_required", "capacity recording requires a structured native error")
    end
    return M.new().record(component_id, errors.new({ kind = failure.kind, message = failure.message,
        retryable = failure.retryable, details = failure.details }))
end

return M
