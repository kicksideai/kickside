-- The automation identity writer (design v4 §6.2; IDENTITY-1 §2, §5): the
-- identity command's executor applies a selected execution identity through
-- it from any frame (the operator's call, the drive's round, the dispatcher).
--   write(args) -- runs under its own system identity, the trusted deferred
--                  owner that resolves the operator's live frame (self
--                  selection, rechecked by the Users resolver) and calls apply
--                  there
--   apply(args) -- under the operator's frame: the component's
--                  SET_EXECUTION_IDENTITY, which checks ADMIN, may_act_as and
--                  the identity generation fence and records the audit row
-- args = { component_id, operator_id, principal, request_id,
-- expected_identity_generation }.

local component = require("component")
local execution_identity = require("execution_identity")
local references = require("declaration_references")
local authority = require("declaration_authority")
local registry = require("registry")
local errors = require("errors")

local command = require("command")
local sql = require("sql")
local types = require("types")
local support = require("engine_support")

local M = {}

M.OWNER = "kickside.automation:identity_writer"
local APPLY = "kickside.automation:identity_apply"

type Map = { [string]: any }

function M.write(args: any): (any?, error?)
    local a: Map = type(args) == "table" and args or {}
    local operator, operator_err = execution_identity.principal_of_key(a.operator_id)
    if operator_err or not operator then return nil, operator_err end
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "automation database unavailable: " .. tostring(db_err)})
    end
    local pending, pending_err, reason = command.identity_pending(db, {
        automation_id = a.component_id, component_id = a.component_id, command_id = a.request_id,
        operator_id = a.operator_id, principal = a.principal,
        expected_identity_generation = a.expected_identity_generation, command_generation = a.command_generation,
    })
    db:release()
    if pending_err then return nil, pending_err end
    if not pending then return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = reason}) end
    local captured = pending.input.operator_identity
    local identity = captured or {
        version = execution_identity.VERSION,
        principal = operator,
        authorized_by = operator,
        component_id = a.component_id,
        captured_at = execution_identity.utc_now(),
    }
    local valid, identity_err = execution_identity.validate(identity)
    if not valid then return nil, identity_err end
    if (identity.component_id ~= nil and identity.component_id ~= a.component_id) or not execution_identity.same_principal(identity.principal, operator)
        or not execution_identity.same_principal(identity.authorized_by, operator) then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "identity command does not retain its authenticated operator"})
    end
    identity = support.copy_map(identity)
    identity.component_id = a.component_id
    local rows, rows_err = component.list_system({component_ids={a.component_id},limit=1})
    if rows_err then return nil, rows_err end
    if type(rows) ~= "table" or not rows[1] then
        return nil, errors.new({kind=errors.NOT_FOUND,message="automation component is unavailable"})
    end
    local kind, kind_err = registry.get(rows[1].impl_id)
    if kind_err then return nil, kind_err end
    if type(kind) ~= "table" then
        return nil, errors.new({kind=errors.INVALID,message="automation declaration kind is unavailable",
            details={error_kind="declaration"}})
    end
    local context, context_err = component.get_private_context(a.component_id)
    if context_err then return nil, context_err end
    local declared, declared_err = references.collect(type(kind.meta) == "table" and kind.meta.inputs or nil,
        type(context) == "table" and type(context._portable_input) == "table" and context._portable_input or {})
    if declared_err or not declared then return nil, declared_err end
    local selected = support.copy_map(identity)
    selected.principal = a.principal
    local valid, selected_err = authority.check(selected, execution_identity.actor_key(a.principal), declared, M.OWNER)
    if selected_err then return nil, selected_err end
    if not valid then
        return nil, errors.new({kind=errors.PERMISSION_DENIED,retryable=false,
            message="selected execution identity lacks a declared resource grant",details={error_kind="access"}})
    end
    return execution_identity.run_as(identity, APPLY, a, { deferred_owner = M.OWNER, execution_root = a.component_id })
end

function M.apply(args: any): (any?, error?)
    local a: Map = type(args) == "table" and args or {}
    return component.set_execution_identity(a.component_id, a.principal, a.request_id, a.expected_identity_generation)
end

return M
