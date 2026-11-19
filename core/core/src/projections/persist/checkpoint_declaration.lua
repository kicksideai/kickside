-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local autoinit = require("autoinit")
local component = require("component")
local execution_identity = require("execution_identity")
local register = require("register")
local trim = require("text_trim").trim

local M = {}
-- The function pool reuses parsed declarations for an installed registry
-- revision. An owner and its stored identity are read afresh on every check.
local indexed_revision: string? = nil
local kinds_by_owner: {[string]: {table}} = {}

local function installed_kinds(impl_id: string, revision: string): {table}
    if indexed_revision ~= revision then
        local grouped: {[string]: {table}} = {}
        for _, kind in ipairs(autoinit.declared_kinds()) do
            local owner_id = kind.component_impl_id
            if #kind.projections > 0 then
                local kinds = grouped[owner_id]
                if not kinds then
                    kinds = {}
                    grouped[owner_id] = kinds
                end
                kinds[#kinds + 1] = kind
            end
        end
        kinds_by_owner, indexed_revision = grouped, revision
    end
    return kinds_by_owner[impl_id] or {}
end

local function refused(message: string): error
    return errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = message})
end

local function same_identity(stored: any, cursor: table): (boolean, error?)
    if stored == nil then return false, nil end
    local valid, invalid = execution_identity.validate(stored)
    if not valid then return false, invalid end
    local identity, err = execution_identity.from_row(cursor.actor_id, cursor.execution_identity_json)
    if not identity then return false, err end
    return execution_identity.same_principal(identity.principal, stored.principal)
        and execution_identity.same_principal(identity.authorized_by, stored.authorized_by)
        and identity.component_id == stored.component_id and identity.credential_id == stored.credential_id
        and identity.link_id == stored.link_id, nil
end

-- This runs after Core releases its cursor read connection. Component may use
-- the same single-connection SQLite pool. The registered slot's generation and
-- execution lease still fence the subsequent write.
function M.check(cursor: table, registry_revision: string): error?
    local id = cursor.thread_id
    if type(id) ~= "string" or id == "" or id ~= cursor.component_id then
        return refused("private checkpoint requires its component's primary thread")
    end
    local rows, read_err = component.list_system({component_ids = {id}, limit = 1,
        include = {meta = false, private_context = true}})
    if read_err then return read_err end
    local owner = rows and rows[1]
    if not owner or owner.component_id ~= id or owner.deleting_at ~= nil then
        return refused("private checkpoint component is unavailable")
    end
    local context = owner.private_context or {}
    local matches, identity_err = same_identity(context[execution_identity.CONTEXT_KEY], cursor)
    if identity_err then return identity_err end
    if not matches then return refused("private checkpoint requires the component's execution identity") end

    for _, kind in ipairs(installed_kinds(owner.impl_id, registry_revision)) do
        if kind.class == cursor.thread_class or (kind.class == nil and kind.impl_id == owner.impl_id) then
            for _, declaration in ipairs(kind.projections) do
                local on = declaration.on
                if (on == nil or on == "" or on == autoinit.PROJECTION_ON.THREAD)
                    and trim(declaration.kind) == cursor.kind
                    and register.declaration_key(declaration.projection_key) == cursor.projection_key
                    and register.declaration_key(declaration.cursor_key) == cursor.cursor_key then
                    local body, body_err = register.declaration_body({worker_ref = declaration.worker_ref,
                        worker_input_mode = declaration.input_mode, worker_config = declaration.worker_config,
                        events = declaration.events})
                    if body_err then return body_err end
                    if body and register.declaration_matches(cursor.body, body) then return nil end
                end
            end
        end
    end
    return refused("private checkpoint requires the component's installed projection declaration")
end

return M
