-- Canonical implementation of `kickside.connection:connections` registry contract.
--
-- This binding is the single orchestration layer for connection lifecycle.
-- It composes:
--   - kickside.component:component_service for storage/access (CRUD on components)
--   - kickside.connection:connection (per-plugin) for runtime dispatch (test_connection)
--
-- Plugin discovery: bindings advertise meta.provider (e.g., provider: jira).
-- Registry resolves provider -> impl_id, then delegates.

local registry = require("registry")
local component = require("component")
local conn_types = require("conn_types")
local envelope = require("envelope")

local M = {}

-- ─── helpers ───────────────────────────────────────────────────────────

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function open_component_service(): (any, error?)
    local svc, err = component.get_service()
    if err then return nil, envelope.call_error(err, "component_service contract") end
    return svc, nil
end

-- Find the unique contract.binding implementing kickside.connection:connection
-- with meta.provider == provider. Returns its registry id (impl_id).
local function resolve_provider(provider: string): (string?, error?)
    if not is_str(provider) then
        return nil, errors.new({ kind = errors.INVALID, message = "provider is required" })
    end

    local entries, err = registry.find({
        [".kind"] = "contract.binding",
        ["meta.provider"] = provider,
    })
    if err then
        return nil, envelope.call_error(err, "provider lookup failed")
    end

    -- Filter to ones that actually bind kickside.connection:connection.
    local matches: { string } = {}
    for _, entry in ipairs(entries or {}) do
        local data = entry.data
        local contracts: any = data and (data :: any).contracts
        if type(contracts) == "table" then
            for _, c in ipairs(contracts) do
                local cc: any = c
                if cc.contract == conn_types.CONNECTION_CONTRACT then
                    matches[#matches + 1] = entry.id :: string
                    break
                end
            end
        end
    end

    if #matches == 0 then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "no connection binding for provider: " .. provider })
    end
    if #matches > 1 then
        return nil, errors.new({ kind = errors.CONFLICT, message = "ambiguous provider " .. provider .. ": " .. tostring(#matches) .. " bindings" })
    end
    return matches[1], nil
end

-- Build a meta filter for component lookups; class is always pinned.
local function build_meta_filter(args: any): { [string]: string }
    local filter: { [string]: string } = { class = conn_types.CONNECTION_CLASS }
    if args and is_str(args.provider) then filter.provider = args.provider :: string end
    if args and is_str(args.name) then filter.title = args.name :: string end
    return filter
end

-- ─── contract methods ──────────────────────────────────────────────────

-- register: create a new connection. Reversible via delete.
-- Input:  { provider, name, auth, validate? }
-- Output: { component_id, provider, name, rollback }
function M.register(args: any): (conn_types.RegisterResult?, error?)
    args = args or {}
    if not is_str(args.provider) then return nil, errors.new({ kind = errors.INVALID, message = "provider is required" }) end
    if not is_str(args.name) then return nil, errors.new({ kind = errors.INVALID, message = "name is required" }) end
    if type(args.auth) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "auth must be a table (the plugin's private_context)" }) end

    local impl_id, perr = resolve_provider(args.provider :: string)
    if not impl_id then return nil, perr end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    -- A connection stores only its credentials -- it is shared transport and owns
    -- no execution identity. Background transports read the bot token at the system
    -- level; a DM runs as the linked user, never as the connection.
    local private_context = args.auth :: { [string]: any }

    local result, rerr = svc:register({
        impl_id = impl_id,
        private_context = private_context,
        meta = {
            title = args.name,
            class = conn_types.CONNECTION_CLASS,
            provider = args.provider,
        },
    })
    if rerr then return nil, envelope.call_error(rerr, "register_component") end
    local result_err = envelope.error_of(result, "register_component")
    if result_err then return nil, result_err end

    local component_id: string = result.component_id :: string

    -- Optional immediate validate via test_connection. Roll back on failure.
    if args.validate then
        local instance, oerr = component.open(component_id, component.ACCESS.WRITE, conn_types.CONNECTION_CONTRACT)
        if oerr or not instance then
            svc:delete({ component_id = component_id })
            return nil, envelope.call_error(oerr or errors.new({ kind = errors.INTERNAL, message = "no connection instance" }), "open after register")
        end
        local tres, terr = instance:test_connection({})
        local failed = terr ~= nil or (type(tres) == "table" and tres.success == false)
        if failed then
            svc:delete({ component_id = component_id })
            return nil, terr and envelope.call_error(terr, "test_connection") or envelope.error_of(tres, "test_connection")
        end
    end

    return ({
        component_id = component_id,
        provider = args.provider,
        name = args.name,
        rollback = {
            method = "delete",
            args = { component_id = component_id },
        },
    }) :: conn_types.RegisterResult, nil
end

-- find: find a single connection by filter. Read-only.
-- Input:  { provider, name? }
-- Output: { component_id, name, provider, ... } or nil if not found
function M.find(args: any): (conn_types.ComponentRow?, error?)
    args = args or {}
    if not is_str(args.provider) then return nil, errors.new({ kind = errors.INVALID, message = "provider is required" }) end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local result, err = svc:list({ filters = { meta = build_meta_filter(args) } })
    if err then return nil, envelope.call_error(err, "list_components") end
    local result_err = envelope.error_of(result, "list_components")
    if result_err then return nil, result_err end

    local list = ((result.components or {}) :: { conn_types.ComponentRow })
    if #list == 0 then return nil, nil end
    return list[1], nil
end

-- upsert: idempotent. Returns { connection, created, rollback }.
function M.upsert(args: any): (conn_types.ConnectionUpsertResult?, error?)
    args = args or {}
    local existing, err = M.find({ provider = args.provider, name = args.name })
    if err then return nil, err end
    if existing then
        return ({ connection = existing, created = false, rollback = nil }) :: conn_types.ConnectionUpsertResult, nil
    end
    local registered, rerr = M.register(args)
    if rerr then return nil, rerr end
    local connection, find_err = M.find({ provider = args.provider, name = args.name })
    if find_err then return nil, find_err end
    if not connection then return nil, errors.new({ kind = errors.NOT_FOUND, message = "created connection component not found: " .. registered.component_id }) end
    return ({ connection = connection, created = true, rollback = registered.rollback }) :: conn_types.ConnectionUpsertResult, nil
end

-- update: patch metadata only (name).
-- private_context is immutable on kickside.component:component_service —
-- credentials must be rotated via delete + register.
-- Input:  { component_id, name }
-- Output: { component_id }
function M.update(args: any): (conn_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, errors.new({ kind = errors.INVALID, message = "component_id is required" }) end
    if not is_str(args.name) then
        return nil, errors.new({ kind = errors.INVALID, message = "nothing to update (only name is mutable; rotate auth via delete+register)" })
    end

    local ok, err = component.set_meta(args.component_id :: string, { title = args.name })
    if not ok then return nil, envelope.call_error(err or errors.new({ kind = errors.INTERNAL, message = "update failed" }), "update_component") end
    return ({ component_id = args.component_id }) :: conn_types.ComponentRef, nil
end

-- delete: remove a connection. Cascades to plugin via kickside.contract:deletable
-- (component_service:delete_component invokes the per-plugin delete_*_func and then
-- removes the component row).
-- Input:  { component_id }
-- Output: { component_id }
function M.delete(args: any): (conn_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, errors.new({ message = "component_id is required", kind = errors.INVALID }) end

    local svc, sverr = open_component_service()
    if not svc then return nil, envelope.call_error(sverr, "component_service") end

    local result, err = svc:delete({ component_id = args.component_id })
    if err then return nil, envelope.call_error(err, "delete_component") end
    local result_err = envelope.error_of(result, "delete_component")
    if result_err then return nil, result_err end

    return ({ component_id = args.component_id }) :: conn_types.ComponentRef, nil
end

-- list: one offset page of connections, newest first by default. Filters:
-- provider?, name?, text?. Output: { connections, total_count, has_more }
function M.list(args: any): (any, error?)
    local request: any = { filters = { meta = build_meta_filter(args) } }
    if args and is_str(args.text) then request.filters.text = args.text end
    if args and type(args.pagination) == "table" then request.pagination = args.pagination end
    if args and type(args.ordering) == "table" then request.ordering = args.ordering end
    local svc, sverr = open_component_service()
    if not svc then return nil, envelope.call_error(sverr, "component_service") end
    local result, err = svc:list(request)
    if err then return nil, envelope.call_error(err, "list_components") end
    local result_err = envelope.error_of(result, "list_components")
    if result_err then return nil, result_err end
    return {
        connections = result.components or {},
        total_count = result.total_count or #(result.components or {}),
        has_more = result.has_more == true,
    }, nil
end

-- validate: call per-instance test_connection. This can touch external systems
-- using stored connection credentials, so it requires WRITE on the component.
-- Input:  { component_id }
-- Output: { ok, error? }
function M.validate(args: any): (conn_types.ValidateResult?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, errors.new({ kind = errors.INVALID, message = "component_id is required" }) end

    local instance, oerr = component.open(args.component_id :: string, component.ACCESS.WRITE, conn_types.CONNECTION_CONTRACT)
    if oerr or not instance then return nil, envelope.call_error(oerr or errors.new({ kind = errors.INTERNAL, message = "no connection instance" }), "open connection") end

    local tres, terr = instance:test_connection({})
    if terr then return nil, envelope.call_error(terr, "test_connection") end
    if type(tres) == "table" and tres.success == false then
        return ({ ok = false, error = tostring(tres.error or "test_connection failed") }) :: conn_types.ValidateResult, nil
    end
    local details = type(tres) == "table" and (tres :: any).details or nil
    return ({ ok = true, details = details }) :: conn_types.ValidateResult, nil
end

return M
