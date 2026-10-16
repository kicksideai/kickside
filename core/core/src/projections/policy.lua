-- The projections owner's one runtime policy reader (design §8). Hosts override
-- kickside.core.projections:policy through .wippy.yaml; malformed declarations
-- return typed errors and never fall back to code defaults.

local registry = require("registry")
local time = require("time")

local M = {}
M.ENTRY = "kickside.core.projections:policy"

type Resolved = {
    apply_batch_size: integer,
    proc_max_execution_ms: integer,
}

local function invalid(message: string): error
    return (errors.new({ message = M.ENTRY .. " " .. message, kind = errors.INVALID, retryable = false }) :: error)
end

local function count(value: any, path: string, min: integer, max: integer): (integer?, error?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < min or value > max then
        return nil, invalid(path .. " must be an integer in [" .. tostring(min) .. ", " .. tostring(max) .. "]")
    end
    return math.floor(value) :: integer, nil
end

local function duration_ms(value: any, path: string): (integer?, error?)
    if type(value) ~= "string" or value == "" then
        return nil, invalid(path .. " must be a duration such as 10m")
    end
    local parsed, err = time.parse_duration(value)
    if err then
        return nil, errors.wrap(err, M.ENTRY .. " " .. path .. " duration parsing failed")
    end
    if not parsed then
        return nil, errors.new({message = M.ENTRY .. " duration parser returned no duration", kind = errors.INTERNAL,
            retryable = false, details = {code = "projection_policy_response", field = path}})
    end
    local ms = math.floor((parsed :: any):milliseconds())
    if ms < 1 then
        return nil, invalid(path .. " must be positive")
    end
    return ms :: integer, nil
end

function M.resolve(meta: any): (Resolved?, error?)
    if type(meta) ~= "table" then
        return nil, invalid("meta must be an object")
    end
    local apply = meta.apply
    if type(apply) ~= "table" then
        return nil, invalid("apply section is required")
    end
    local batch_size, bs_err = count(apply.batch_size, "apply.batch_size", 1, 100000)
    if bs_err then return nil, bs_err end

    local proc = meta.proc
    if type(proc) ~= "table" then
        return nil, invalid("proc section is required")
    end
    local max_exec_ms, me_err = duration_ms(proc.max_execution, "proc.max_execution")
    if me_err then return nil, me_err end

    return {
        apply_batch_size = batch_size :: integer,
        proc_max_execution_ms = max_exec_ms :: integer,
    }, nil
end

function M.policy(): (Resolved?, error?)
    local entry, get_err = registry.get(M.ENTRY)
    if get_err then
        return nil, errors.wrap(get_err, M.ENTRY .. " policy lookup failed")
    end
    if type(entry) ~= "table" then
        return nil, errors.new({message = M.ENTRY .. " registry returned no policy entry", kind = errors.INTERNAL,
            retryable = false, details = {code = "projection_policy_response", field = M.ENTRY .. ".entry"}})
    end
    return M.resolve((entry :: any).meta)
end

return M
