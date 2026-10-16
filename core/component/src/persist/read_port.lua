-- read_port: translate the flat read-port filter DTO into a configured
-- component_reader, resolving the access scope in one fail-closed place. Backs
-- the query_components / count_components contract methods.
--
-- Access scope (no silent widening):
--   * Default: the read is scoped to the current security.actor() with
--     with_user(actor) + with_access_mask(access_mask or READ).
--   * actor_id (read as another user) and scope = "all" (unscoped) widen the
--     read and require the LIST_ALL capability on the components resource. A
--     non-privileged caller passing either gets an access error, never a
--     silently widened result.
--   * Omitting a field never widens: absence falls back to the current actor.

local security = require("security")
local component_reader = require("component_reader")
local component_types = require("component_types")
local access_policy = require("access_policy")
local access_subjects = require("access_subjects")

local M = {}

-- Indirection so tests can inject a fake actor source (mirrors access_subjects).
local function security_module()
    return (M :: any)._security or security
end

-- Build the configured reader from the DTO and resolve the access scope.
-- Returns (reader, error?). The error is structured via the global errors module.
function M.build(filter: component_types.QueryFilter?): (any, error?)
    local f: any = filter
    if f == nil then f = {} end
    if type(f) ~= "table" then
        return nil, (errors.new({ message = "filter must be a table", kind = errors.INVALID }) :: error)
    end

    local actor = security_module().actor()
    local current_id = actor and actor:id() or nil

    local want_scope_all = f.scope == component_types.SCOPES.ALL
    local want_actor_id = type(f.actor_id) == "string" and f.actor_id ~= "" and f.actor_id or nil
    local access_mask = component_types.ACCESS.READ

    if f.access_mask ~= nil then
        local normalized, mask_err = access_policy.normalize_access_mask(f.access_mask)
        if mask_err or not normalized or normalized <= component_types.ACCESS.NONE then
            return nil, (errors.new({
                message = "access_mask must be an integer between " .. tostring(component_types.ACCESS.READ) .. " and " .. tostring(component_types.ACCESS.FULL),
                kind = errors.INVALID,
            }) :: error)
        end
        access_mask = normalized
    end

    -- Widening (read as another user, or unscoped) is gated on the LIST_ALL
    -- capability; the default path stays scoped to the current actor.
    local widening = want_scope_all or (want_actor_id ~= nil and want_actor_id ~= current_id)
    if widening then
        -- Core invariant: a confined identity -- one carrying an access_filter, e.g. an
        -- MCP credential running as its owner -- can NEVER widen, regardless of any
        -- list-all capability its scope might grant. Widening bypasses both the access
        -- join and the filter, so the same marker that narrows reads disables the escape
        -- hatch at the source. A confined caller is hard-denied before the capability
        -- check, so no mis-scoped credential can ever read unscoped or as another user.
        if current_id and access_subjects.access_filter(current_id) ~= nil then
            return nil, (errors.new({
                message = "a confined identity cannot widen a component read",
                kind = errors.PERMISSION_DENIED,
            }) :: error)
        end
        if not security_module().can(component_types.AUTHZ.LIST_ALL, component_types.AUTHZ.COMPONENTS_RESOURCE) then
            return nil, (errors.new({
                message = "widening a component read (actor_id / scope=all) requires the list-all capability",
                kind = errors.PERMISSION_DENIED,
            }) :: error)
        end
    end

    local reader = component_reader.new()

    if want_scope_all then
        -- Unscoped/admin read: no with_user, so no access join is applied.
        reader = reader
    else
        local target_user = want_actor_id or current_id
        if not target_user or target_user == "" then
            return nil, (errors.new({ message = "no authenticated actor for component read", kind = errors.PERMISSION_DENIED }) :: error)
        end
        reader = reader:with_user(target_user)
        reader = reader:with_access_mask(access_mask)
    end

    if type(f.component_ids) == "table" and #f.component_ids > 0 then
        reader = reader:with_components(f.component_ids)
    end
    if type(f.impl_ids) == "table" and #f.impl_ids > 0 then
        reader = reader:with_impl_ids(f.impl_ids)
    end
    if f.match_ids ~= nil then
        local selected, match_err = reader:with_id_match(f.match_ids)
        if match_err then return nil, match_err end
        if not selected then
            return nil, (errors.new({ kind = errors.INTERNAL, message = "component identity selector returns no reader" }) :: error)
        end
        reader = selected
    end
    if type(f.meta) == "table" then
        reader = reader:with_meta(f.meta)
    end
    if type(f.text) == "string" and f.text ~= "" then
        reader = reader:with_text(f.text)
    end
    if f.parent_id ~= nil then
        reader = reader:with_parent(f.parent_id :: string)
    end
    if type(f.path_prefix) == "string" and f.path_prefix ~= "" then
        reader = reader:with_path_prefix(f.path_prefix)
    end

    if type(f.include) == "table" then
        local inc: component_types.QueryInclude = f.include
        if inc.private_context == true then
            if not security_module().can(component_types.AUTHZ.LIST_ALL, component_types.AUTHZ.COMPONENTS_RESOURCE) then
                return nil, (errors.new({
                    message = "including component private_context requires the list-all capability",
                    kind = errors.PERMISSION_DENIED,
                }) :: error)
            end
        end
        -- The DTO exposes `access`; the reader's include flag is `access_level`.
        reader = reader:include_options({
            meta = inc.meta,
            private_context = inc.private_context,
            access_level = inc.access,
            placement = inc.placement,
        })
    end

    return reader, nil
end

-- Apply ordering, limit, and offset (terminal-shaping for the listing path).
function M.shape(reader: any, filter: component_types.QueryFilter?): any
    local f: any = filter or {}

    local order = f.order_by
    if order == "position" then
        reader = reader:order_by_position()
    elseif type(order) == "table" and type(order.field) == "string" then
        reader = reader:order_by(order.field, order.direction)
    end

    if type(f.limit) == "number" and f.limit > 0 then
        local offset = type(f.offset) == "number" and f.offset or 0
        reader = reader:limit(f.limit, offset)
    end

    return reader
end

return M
