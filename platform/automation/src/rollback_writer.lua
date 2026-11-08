-- The automation rollback writer: the framework system actor that brings an
-- automation component's stored rollback chain to the current cleanup
-- targets. It applies the engine's rollback upgrade rule to the chain the
-- component stores, under the component row lock, so the chain it rewrites is
-- the one the owner delete replays.
--   upgrade({ component_id }) -> { component_id, changes_made, removed, retained }

local errors = require("errors")
local component_command = require("component_command")
local declaration = require("engine_declaration")

local M = {}

function M.upgrade(input: any): (any?, error?)
    local id = type(input) == "table" and input.component_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local changes: any = { removed = {}, retained = {} }
    local result, err = component_command.upgrade_rollback({ component_id = id, automation_id = id },
        function(chain: any): (any, boolean)
            local upgraded, found = declaration.upgrade_rollback(chain)
            changes = found
            return upgraded, #found.removed > 0
        end)
    if err or not result then return nil, err end
    return { component_id = id, changes_made = result.changes_made == true,
        removed = changes.removed, retained = changes.retained }, nil
end

return M
