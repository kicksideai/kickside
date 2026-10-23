-- The one privileged create path (design v4 §6.3, OWNERSHIP A14). On the
-- caller's component transaction, for a creation token prepared by
-- declaration_ops.prepare_creation (framework system actor, verified reserved
-- install command, operator == execution subject):
--   1. the operator must hold WRITE on the target parent;
--   2. CREATE_COMPONENT with the operator as creator: its initial ADMIN grant
--      and its own v2 execution identity commit together (IDENTITY-1 §2);
--   3. the declaration command writes _portable_input at fence generation 1;
--   4. the lifecycle rollback writer records the install's rollback chain.
-- A repeated step of the same install command (same automation, command id,
-- generation and declaration hash on the component's fence) finds the component
-- already created and returns it unchanged; any other command for an existing
-- component is a conflict. Nothing here is callable as a user command.

local component_types = require("component_types")
local declaration_ops = require("declaration_ops")
local declaration_fence = require("declaration_fence")
local placement_ops = require("placement_ops")
local access_ops = require("access_ops")
local lifecycle_rollback = require("lifecycle_rollback")

local M = {}

local function conflict(message: string): error
    return (errors.new({ message = message, kind = errors.CONFLICT, retryable = false, details = { error_kind = "declaration" } }) :: error)
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, details = { error_kind = "access" } }) :: error)
end

-- create_tx(tx, db, token) -> ({ component_id, operator_id, impl_id, parent_id, meta, existing? }?, err?)
function M.create_tx(tx: any, db: any, token: any): (any?, error?)
    local creation, take_err = declaration_ops.take_creation(token)
    if take_err or not creation then return nil, take_err end
    local input = (creation :: any).input
    local receipt = (creation :: any).receipt
    local operator_id = receipt.operator_id :: string

    local fence, fence_err = declaration_fence.read(tx, input.component_id, receipt.automation_id)
    if fence_err then return nil, fence_err end
    if fence then
        if fence.applied_command_generation ~= receipt.generation or fence.command_id ~= receipt.command_id
            or fence.declaration_hash ~= receipt.declaration_hash then
            return nil, conflict("component " .. tostring(input.component_id) .. " was created by another declaration command")
        end
        return {
            component_id = input.component_id,
            operator_id = operator_id,
            impl_id = input.impl_id,
            parent_id = input.parent_id,
            meta = input.meta,
            existing = true,
        }, nil
    end

    if input.parent_id ~= nil then
        local allowed, access_err = access_ops.check_user_access(tx, operator_id, input.parent_id, component_types.ACCESS.WRITE)
        if access_err then return nil, access_err end
        if not allowed then return nil, denied("the operator lacks WRITE on the target parent") end
    end

    local _, create_err = placement_ops.create_component(tx, db, {
        type = component_types.COMMAND_TYPES.CREATE_COMPONENT,
        payload = {
            component_id = input.component_id,
            impl_id = input.impl_id,
            private_context = input.context,
            initial_meta = input.meta,
            actor_id = operator_id,
            parent_id = input.parent_id,
        },
    }, receipt.captured_identity)
    if create_err then return nil, create_err end

    local _, declaration_err = declaration_ops.write_declaration_tx(tx, receipt)
    if declaration_err then return nil, declaration_err end

    local rollback_err = lifecycle_rollback.write_tx(tx, input.component_id, input.rollback)
    if rollback_err then return nil, rollback_err end

    return {
        component_id = input.component_id,
        operator_id = operator_id,
        impl_id = input.impl_id,
        parent_id = input.parent_id,
        meta = input.meta,
    }, nil
end

return M
