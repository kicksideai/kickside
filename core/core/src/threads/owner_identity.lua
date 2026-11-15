-- The execution identity a component's declared projections run under
-- (IDENTITY-1 §4 T row), derived from the component's owner record and never
-- captured from a caller: the component's stored v2 execution identity, or for a
-- framework-created component that carries none, the framework system identity
-- owned by the maintenance actor recorded as its owner. The thread declaration
-- path reads the owner record through the component service; the component
-- lifecycle reads it inside the component transaction. Both derive here.

local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")
local json = require("json")
local lifecycle_log = require("lifecycle_log")
local autoinit = require("autoinit")
local component_identity_ops = require("component_identity_ops")

local registry = require("registry")

local M = {}

local function identity_hash(id: table): string
    return component_identity_ops.canonical_identity(id.principal, id.authorized_by, id.component_id,
        id.captured_at, id.credential_id, id.link_id)
end



-- of_owner(stored, owner_key) -> ({ row?, system?, owner? }?, err?). stored is
-- the component's stored execution identity (nil when it carries none) and
-- owner_key the actor recorded as its owner. A stored identity that is not
-- valid v2 refuses.
function M.of_owner(stored: any, owner_key: any): ({ [string]: any }?, error?)
    if stored ~= nil then
        local row, row_err = execution_identity.to_row(stored)
        row, row_err = error_envelope.binding(row, row_err, nil,
            "materialize declared execution identity", "declared_identity_row_missing")
        if row_err then return nil, row_err end
        return { row = row }, nil
    end
    if execution_identity.is_maintenance_key(owner_key) then
        return { system = true, owner = owner_key }, nil
    end
    return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
        message = "component has no trusted execution owner",
        details = {code = "component_execution_owner_missing", error_kind = "subject"}})
end

local function denied(code: string, message: string): error
    return errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
        message = message, details = {code = code, error_kind = "subject"}})
end

-- Keep only the most recent parsed kind; registry publication invalidates it.
local declaration_cache: table? = nil
local function projections_for_impl(impl_id: string): (table?, error?)
    local version, version_err = registry.current_version()
    if version_err then return nil, version_err end
    if not version then
        return nil, errors.new({kind = errors.UNAVAILABLE, message = "projection declaration registry revision is unavailable"})
    end
    local revision = tostring(version:id())
    local cached = declaration_cache
    if cached and cached.impl_id == impl_id and cached.revision == revision then return cached.declarations, nil end
    declaration_cache = nil
    local declarations, err = autoinit.projections_for_impl(impl_id)
    if err then return nil, err end
    declaration_cache = {impl_id = impl_id, revision = revision, declarations = declarations}
    return declarations, nil
end

function M.check_declaration(descriptor: table): (boolean, error?)
    local declarations, declaration_err = projections_for_impl(descriptor.impl_id)
    if declaration_err then return false, declaration_err end
    for _, declaration in ipairs(declarations) do
        local on = declaration.on or autoinit.PROJECTION_ON.THREAD
        local key = declaration.projection_key
        if type(key) ~= "string" or key == "" then key = "default" end
        if declaration.kind == descriptor.kind and key == descriptor.projection_key and on == descriptor.on then
            if declaration.worker_ref ~= descriptor.worker_ref then
                return false, denied("projection_owner_declaration_changed", "component projection declaration changes before execution")
            end
            return true, nil
        end
    end
    return false, nil
end

-- Component-derived registrations copy authority; neither copy is an authority
-- source. Declaration keys and the framework thread relationship select the owner.
function M.from_snapshot(row: table): (table?, error?)
    local attrs: table = {}
    if type(row.thread_attrs) == "string" then
        local decoded, err = json.decode(row.thread_attrs)
        if err then return nil, err end
        if type(decoded) == "table" then attrs = decoded end
    elseif type(row.thread_attrs) == "table" then attrs = row.thread_attrs end
    local lifecycle = row.thread_component_id == nil or row.thread_component_id == ""
    if lifecycle and (attrs.lifecycle ~= true or type(attrs.component_id) ~= "string"
        or lifecycle_log.thread_id(attrs.component_id) ~= row.thread_id) then return nil, nil end
    local impl_id = row.owner_impl_id or (lifecycle and attrs.class or nil)
    if type(impl_id) ~= "string" then return nil, nil end
    local own, declaration_err = M.check_declaration({impl_id = impl_id,
        on = lifecycle and autoinit.PROJECTION_ON.LIFECYCLE or autoinit.PROJECTION_ON.THREAD,
        kind = row.kind, projection_key = row.projection_key,
        worker_ref = type(row.body.meta) == "table" and row.body.meta.worker_ref or nil})
    if declaration_err then return nil, declaration_err end
    if not own then
        if lifecycle and row.execution_identity_json == nil then
            local config = type(row.body.worker_config) == "table" and row.body.worker_config or {}
            if config.child_component_id == attrs.component_id and config.child_impl_id == attrs.class
                and type(config.parent_component_id) == "string" and config.parent_component_id ~= attrs.component_id
                and type(config.parent_impl_id) == "string" and row.actor_id == nil
                and row.projection_actor_id == nil and row.projection_actor_context == nil then
                local declarations, parent_err = projections_for_impl(config.parent_impl_id)
                if parent_err then return nil, parent_err end
                for _, declaration in ipairs(declarations) do
                    local base = declaration.projection_key
                    local key = type(base) == "string" and base ~= "" and base .. ":parent:" .. config.parent_component_id
                        or "parent:" .. config.parent_component_id
                    if declaration.on == autoinit.PROJECTION_ON.CHILD_LIFECYCLE and declaration.kind == row.kind
                        and key == row.projection_key and type(row.body.meta) == "table"
                        and declaration.worker_ref == row.body.meta.worker_ref then return nil, nil end
                end
            end
            return nil, denied("projection_framework_binding_missing", "lifecycle projection has no trusted framework registration")
        end
        return nil, nil
    end
    if row.owner_component_id == nil or (row.owner_context_readable ~= true and row.owner_context_readable ~= 1) then
        return nil, denied("projection_owner_missing", "component projection owner record is missing or invalid")
    end
    local stored: any = nil
    if row.owner_execution_identity ~= nil then
        local err: error?
        stored, err = json.decode(row.owner_execution_identity)
        if err then return nil, err end
        if stored == nil then return nil, denied("projection_owner_invalid", "component execution identity is invalid") end
    end
    -- The reserved owner record is the authority. A materialized binding must
    -- match it; the binding itself never proves ownership.
    local maintenance_owner: string? = nil
    if stored ~= nil then
        local valid, valid_err = execution_identity.validate(stored)
        if valid ~= true then return nil, valid_err end
        local cursor, cursor_err = execution_identity.from_row(row.actor_id, row.execution_identity_json)
        if cursor_err then return nil, cursor_err end
        local projection, projection_err: any = cursor, nil
        if row.actor_id ~= row.projection_actor_id or row.execution_identity_json ~= row.projection_actor_context then
            projection, projection_err = execution_identity.from_row(row.projection_actor_id, row.projection_actor_context)
        end
        if projection_err then return nil, projection_err end
        if not cursor or not projection or not execution_identity.identities_equal(cursor, stored)
            or not execution_identity.identities_equal(projection, stored) then
            return nil, denied("projection_owner_binding_changed", "component projection binding differs from its current owner")
        end
    else
        if type(row.owner_key) ~= "string" or row.owner_key == "" then
            return nil, denied("component_execution_owner_missing", "component has no trusted execution owner")
        end
        -- The worker validates the actor declaration while constructing its
        -- generation- and registry-bound frame; the snapshot proves ownership.
        maintenance_owner = row.owner_key
        if row.actor_id ~= maintenance_owner or row.projection_actor_id ~= maintenance_owner
            or row.execution_identity_json ~= nil or row.projection_actor_context ~= nil then
            return nil, denied("projection_owner_binding_changed", "component projection binding differs from its current owner")
        end
    end
    local generation = tonumber(row.owner_identity_generation)
    if generation == nil or generation < 0 or generation ~= math.floor(generation) then
        return nil, denied("projection_owner_generation_invalid", "component identity generation is invalid")
    end
    return {component_id = row.owner_component_id, impl_id = impl_id,
        generation = generation, identity = stored, maintenance_owner = maintenance_owner,
        declaration = {impl_id = impl_id, kind = row.kind, projection_key = row.projection_key,
            on = lifecycle and autoinit.PROJECTION_ON.LIFECYCLE or autoinit.PROJECTION_ON.THREAD,
            worker_ref = row.body.meta.worker_ref}}, nil
end

-- The component hash is maintained with its private v2 record. Legacy records
-- without that fence are compared with the private record itself.
function M.binding_matches(owner_hash: any, owner_key: any, legacy_identity: any, actor_id: any, context: any, maintenance_owners: {[string]: boolean}?): boolean
    local expected = owner_hash
    if expected == nil and legacy_identity ~= nil then
        local id, decode_err = json.decode(legacy_identity)
        if decode_err then return false end
        local valid = execution_identity.validate(id)
        if valid ~= true then return false end
        expected = identity_hash(id)
    end
    if expected == nil then
        if context ~= nil or actor_id ~= owner_key then return false end
        if not maintenance_owners or type(owner_key) ~= "string" then
            return execution_identity.is_maintenance_key(owner_key)
        end
        local recognized = maintenance_owners[owner_key]
        if recognized == nil then
            recognized = execution_identity.is_maintenance_key(owner_key)
            maintenance_owners[owner_key] = recognized
        end
        return recognized
    end
    local id, err = execution_identity.from_row(actor_id, context)
    return err == nil and id ~= nil and identity_hash(id) == expected
end

return M
