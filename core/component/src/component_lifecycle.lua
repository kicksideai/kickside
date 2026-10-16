-- component_lifecycle: stable CRUD seam for canonical component lifecycle.
-- The host wires the concrete implementation into this import so CRUD can pass
-- the active transaction by reference without serializing it through a contract
-- call.

local lifecycle_impl = require("lifecycle_impl")
local envelope = require("envelope")

local M = {}

local function result_error(method: string, result: any, call_err: any): error?
    if call_err then
        if type(call_err) == "userdata" then
            return (errors.wrap(call_err, "component lifecycle " .. method .. " failed") :: error)
        end
        return (errors.new({ message = "component lifecycle " .. method .. " failed: " .. tostring(call_err), kind = errors.INTERNAL }) :: error)
    end
    if type(result) == "table" and (result :: any).success == false then
        return envelope.error_of(result, method, "component lifecycle " .. method .. " rejected")
    end
    return nil
end

function M.created(payload: table): error?
    local result, call_err = lifecycle_impl.created(payload)
    return result_error("created", result, call_err)
end

function M.updated(payload: table): error?
    local result, call_err = lifecycle_impl.updated(payload)
    return result_error("updated", result, call_err)
end

function M.deleted(payload: table): error?
    local result, call_err = lifecycle_impl.deleted(payload)
    return result_error("deleted", result, call_err)
end

-- Called once after a transaction that recorded lifecycle events commits, so
-- the work those events made due runs without waiting for unrelated activity.
function M.committed(): error?
    local result, call_err = lifecycle_impl.committed()
    return result_error("committed", result, call_err)
end

function M.publish_audit(payload: table): (any?, error?)
    local result, call_err = lifecycle_impl.publish_audit(payload)
    local err = result_error("publish_audit", result, call_err)
    if err then return nil, err end
    if type(result) ~= "table" then
        return nil, (errors.new({ message = "component lifecycle audit publication returned no proof",
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    return result, nil
end

return M
