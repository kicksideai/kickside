-- The component lifecycle's single writer of the runtime-owned _rollback key
-- (design v4 §6.3: lifecycle/reaper owns _rollback). The chain is the ordered
-- list of cleanup steps { target, args } that teardown replays in reverse.
-- The privileged create path writes it, and a verified rollback upgrade
-- rewrites it; generic context writes refuse the key. Runs on the caller's
-- transaction under the component row lock.

local context_ops = require("context_ops")
local delete_ops = require("delete_ops")
local persisted_json = require("persisted_json")

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

-- upgrade_tx(tx, component_id, upgrade) -> { component_id, changes_made }:
-- applies upgrade(chain) -> (chain, changed) to the stored rollback chain under
-- the component row lock and writes the result when it changed. A stored
-- chain that already holds the upgraded shape is left as it is. A deletion
-- blocked on the old chain resumes through its original Jobs identity.
function M.upgrade_tx(tx: any, component_id: string, upgrade: any): (any?, error?)
    if type(upgrade) ~= "function" then return nil, invalid("rollback upgrade rule is required") end
    local stored, read_err = context_ops.lock_and_read_tx(tx, component_id)
    if read_err or not stored then return nil, read_err end
    local current, current_err = M.validate(stored._rollback or {})
    if current_err or not current then return nil, current_err end
    local upgraded, changed = upgrade(current)
    local result: any = { component_id = component_id, changes_made = false }
    if changed == true then
        local steps, invalid_err = M.validate(upgraded)
        if invalid_err then return nil, invalid_err end
        stored._rollback = steps
        local write_err
        result, write_err = context_ops.write_context_tx(tx, component_id, stored)
        if write_err then return nil, write_err end
    end
    local rows, fence_err = tx:query("SELECT deleting_at,delete_intent FROM kickside_components WHERE component_id=$1", {component_id})
    if fence_err then return nil, fence_err end
    if type(rows) ~= "table" or not rows[1] then return nil, invalid("rollback upgrade component fence is absent") end
    if rows[1].deleting_at ~= nil and rows[1].delete_intent ~= nil then
        local intent, intent_err = persisted_json.decode_table(rows[1].delete_intent, "component.delete_intent")
        if intent_err then return nil, intent_err end
        local dialect, dialect_err = tx:db_type()
        if dialect_err then return nil, dialect_err end
        local _, enqueue_err = delete_ops.enroll_delete_tx(tx, tostring(dialect), component_id, intent)
        if enqueue_err then return nil, enqueue_err end
    end
    return result, nil
end

return M
