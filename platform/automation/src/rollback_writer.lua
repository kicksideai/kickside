-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The automation rollback writer: the framework system actor that brings an
-- automation component's stored rollback chain to the current cleanup
-- targets. It first removes the trigger projections the chain's retired watch
-- teardown steps name from their source threads, then applies the engine's
-- rollback upgrade rule to the chain the component stores, under the
-- component row lock, so the chain it rewrites is the one the owner delete
-- replays.
--   upgrade({ component_id }) -> { component_id, changes_made, removed, retained }

local errors = require("errors")
local sql = require("sql")
local component = require("component")
local component_command = require("component_command")
local declaration = require("engine_declaration")
local projection_writer = require("projection_writer")
local core_db = require("core_db")

local M = {}

-- remove_projection(db, projection) -> error?: the trigger projection and its
-- cursors removed from the source thread. A projection or thread already gone
-- is the removed state.
local function remove_projection(db: any, projection: { [string]: any }): error?
    local _, err = projection_writer.remove_projection(db, projection.thread_id, { projection_id = projection.projection_id })
    if err and not errors.is(err, errors.NOT_FOUND) then return err end
    return nil
end

-- retire_watch_projections(chain) -> the { thread_id, projection_id } removed
-- for the chain's watch teardown steps.
local function retire_watch_projections(chain: any): ({ { [string]: any } }?, error?)
    local projections = declaration.watch_projections(chain)
    if #projections == 0 then return projections, nil end
    local db, db_err = sql.get(core_db.id())
    if db_err or not db then
        return nil, (errors.new({ message = "core database unavailable: " .. tostring(db_err), kind = errors.UNAVAILABLE,
            retryable = true }) :: error)
    end
    for _, projection in ipairs(projections) do
        local remove_err = remove_projection(db, projection)
        if remove_err then
            db:release()
            return nil, errors.wrap(remove_err, "legacy trigger projection " .. tostring(projection.projection_id)
                .. " removal failed")
        end
    end
    db:release()
    return projections, nil
end

function M.upgrade(input: any): (any?, error?)
    local id = type(input) == "table" and input.component_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local context, context_err = component.get_private_context(id)
    if context_err then return nil, context_err end
    if type(context) ~= "table" then
        return nil, (errors.new({ message = "automation " .. id .. " has no private context", kind = errors.NOT_FOUND }) :: error)
    end
    local removed_projections, retire_err = retire_watch_projections(context._rollback)
    if retire_err or not removed_projections then return nil, retire_err end
    local changes: any = { removed = {}, retained = {} }
    local result, err = component_command.upgrade_rollback({ component_id = id, automation_id = id },
        function(chain: any): (any, boolean)
            local upgraded, found = declaration.upgrade_rollback(chain, removed_projections)
            changes = found
            return upgraded, #found.removed > 0
        end)
    if err or not result then return nil, err end
    return { component_id = id, changes_made = result.changes_made == true,
        removed = changes.removed, retained = changes.retained }, nil
end

return M
