-- The component lifecycle's single writer of the runtime-owned _rollback key
-- (design v4 §6.3: lifecycle/reaper owns _rollback). The chain is the ordered
-- list of cleanup steps { target, args } that teardown replays in reverse.
-- Only the privileged create path calls it; generic context writes refuse the
-- key. Runs on the caller's transaction under the component row lock.

local context_ops = require("context_ops")

local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, details = { error_kind = "declaration" } }) :: error)
end

-- validate(chain) -> (steps?, err?): a dense array of { target: non-empty
-- string, args: object } steps, copied as plain data.
function M.validate(chain: any): ({ { target: string, args: { [string]: any } } }?, error?)
    if type(chain) ~= "table" then return nil, invalid("rollback chain must be an array") end
    local count = 0
    for _ in pairs(chain) do count = count + 1 end
    if count ~= #chain then return nil, invalid("rollback chain must be a dense array") end
    local steps: { { target: string, args: { [string]: any } } } = {}
    for index, step in ipairs(chain) do
        if type(step) ~= "table" or type(step.target) ~= "string" or step.target == "" then
            return nil, invalid("rollback step " .. tostring(index) .. " requires a target")
        end
        if step.args ~= nil and type(step.args) ~= "table" then
            return nil, invalid("rollback step " .. tostring(index) .. " args must be an object")
        end
        steps[index] = { target = step.target, args = step.args or {} }
    end
    return steps, nil
end

-- write_tx(tx, component_id, chain) replaces the component's rollback chain.
function M.write_tx(tx: any, component_id: string, chain: any): error?
    local steps, invalid_err = M.validate(chain)
    if invalid_err then return invalid_err end
    local stored, read_err = context_ops.lock_and_read_tx(tx, component_id)
    if read_err or not stored then return read_err end
    stored._rollback = steps
    local _, write_err = context_ops.write_context_tx(tx, component_id, stored)
    return write_err
end

return M
