-- Canonical implementation of `kickside.connection:reply_providers` registry contract.
--
-- A reply_provider is a connection that ALSO implements
-- `kickside.connection:reply_provider` (e.g., Discord, Telegram). The same
-- component implements both contracts; presence of `meta.class: reply_provider`
-- on the contract.binding indicates reply capability.
--
-- This registry filters the `connection` registry by class=reply_provider and
-- exposes send_reply per instance. Static reply capabilities (max_length, content
-- types, attachments, embeds) are declared in the binding's meta.reply block.

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
    if err then return nil, envelope.call_error(err, "component_service") end
    return svc, nil
end

-- Find a contract.binding implementing kickside.connection:reply_provider with
-- the given provider name.
local function resolve_reply_binding(provider: string): (string?, error?)
    if not is_str(provider) then return nil, errors.new({ kind = errors.INVALID, message = "provider is required" }) end
    local entries, err = registry.find({
        [".kind"] = "contract.binding",
        ["meta.provider"] = provider,
    })
    if err then return nil, envelope.call_error(err, "lookup") end

    for _, entry in ipairs(entries or {}) do
        local data: any = entry.data
        local contracts: any = data and data.contracts
        if type(contracts) == "table" then
            for _, c in ipairs(contracts) do
                local cc: any = c
                if cc.contract == conn_types.REPLY_PROVIDER_CONTRACT then
                    return entry.id :: string, nil
                end
            end
        end
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "no reply_provider binding for: " .. provider })
end

local function build_meta_filter(args: any): { [string]: string }
    local filter: { [string]: string } = { class = conn_types.REPLY_PROVIDER_CLASS }
    if args and is_str(args.provider) then filter.provider = args.provider :: string end
    if args and is_str(args.name) then filter.title = args.name :: string end
    return filter
end

-- ─── contract methods ──────────────────────────────────────────────────

-- create: register a reply_provider component (= a connection that also speaks
-- the reply_provider contract). Same shape as connections.register, plus the
-- reply_provider class is added to meta automatically.
function M.create(args: any): (conn_types.RegisterResult?, error?)
    args = args or {}
    if not is_str(args.provider) then return nil, errors.new({ kind = errors.INVALID, message = "provider is required" }) end
    if not is_str(args.name) then return nil, errors.new({ kind = errors.INVALID, message = "name is required" }) end
    if type(args.auth) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "auth must be a table" }) end

    local impl_id, perr = resolve_reply_binding(args.provider :: string)
    if not impl_id then return nil, perr end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local result, err = svc:register({
        impl_id = impl_id,
        private_context = args.auth,
        meta = {
            title = args.name,
            class = conn_types.REPLY_PROVIDER_CLASS,
            provider = args.provider,
        },
    })
    if err then return nil, envelope.call_error(err, "register_component") end
    local result_err = envelope.error_of(result, "register_component")
    if result_err then return nil, result_err end

    local component_id: string = result.component_id :: string
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

-- find: find one reply_provider by (provider, name?).
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

-- upsert: idempotent. Returns { reply_provider, created, rollback }.
function M.upsert(args: any): (conn_types.ReplyProviderUpsertResult?, error?)
    args = args or {}
    local existing, err = M.find({ provider = args.provider, name = args.name })
    if err then return nil, err end
    if existing then
        return ({ reply_provider = existing, created = false, rollback = nil }) :: conn_types.ReplyProviderUpsertResult, nil
    end
    local created, cerr = M.create(args)
    if cerr then return nil, cerr end
    local reply_provider, find_err = M.find({ provider = args.provider, name = args.name })
    if find_err then return nil, find_err end
    if not reply_provider then return nil, errors.new({ kind = errors.NOT_FOUND, message = "created reply_provider component not found: " .. created.component_id }) end
    return ({ reply_provider = reply_provider, created = true, rollback = created.rollback }) :: conn_types.ReplyProviderUpsertResult, nil
end

-- update: patch metadata (name only — auth/capabilities are immutable here).
function M.update(args: any): (conn_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, errors.new({ kind = errors.INVALID, message = "component_id is required" }) end
    if not is_str(args.name) then
        return nil, errors.new({ kind = errors.INVALID, message = "nothing to update (only name is mutable)" })
    end

    local ok, err = component.set_meta(args.component_id :: string, { title = args.name })
    if not ok then return nil, envelope.call_error(err or errors.new({ kind = errors.INTERNAL, message = "update failed" }), "update_component") end
    return ({ component_id = args.component_id }) :: conn_types.ComponentRef, nil
end

-- delete: remove the component (cascades plugin cleanup via deletable).
function M.delete(args: any): (conn_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, errors.new({ kind = errors.INVALID, message = "component_id is required" }) end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local result, err = svc:delete({ component_id = args.component_id })
    if err then return nil, envelope.call_error(err, "delete_component") end
    local result_err = envelope.error_of(result, "delete_component")
    if result_err then return nil, result_err end
    return ({ component_id = args.component_id }) :: conn_types.ComponentRef, nil
end

-- list: one offset page of reply_providers, newest first. Filters: provider?,
-- name?, text?. Output: { reply_providers, total_count, has_more }
function M.list(args: any): (any, error?)
    local request: any = { filters = { meta = build_meta_filter(args) } }
    if args and is_str(args.text) then request.filters.text = args.text end
    if args and type(args.pagination) == "table" then request.pagination = args.pagination end
    local svc, sverr = open_component_service()
    if not svc then return nil, envelope.call_error(sverr, "component_service") end
    local result, err = svc:list(request)
    if err then return nil, envelope.call_error(err, "list_components") end
    local result_err = envelope.error_of(result, "list_components")
    if result_err then return nil, result_err end
    return {
        reply_providers = result.components or {},
        total_count = result.total_count or #(result.components or {}),
        has_more = result.has_more == true,
    }, nil
end


return M
