-- GET /api/v1/connections [?provider=discord&limit=100&offset=0]
--
-- Lists the calling user's connection components through the canonical
-- connection registry contract. Display/status fields are projected from
-- component public meta; this endpoint does not fan out into provider/OAuth
-- private contracts on page render.

local http = require("http")
local contract = require("contract")
local registry = require("registry")
local security = require("security")
local conn_types = require("conn_types")
local query_params = require("query_params")
local create_policy = require("create_policy")

local REPLY_PROVIDER_CONTRACT = "kickside.connection:reply_provider"
local DEFAULT_LIMIT = 100
local MAX_LIMIT = 100

local function parse_pagination(req: any): (number?, number?, string?)
    local limit, limit_err = query_params.query_int(req, "limit", DEFAULT_LIMIT, { min = 1, max = MAX_LIMIT })
    if limit_err then return nil, nil, limit_err end
    local offset, offset_err = query_params.query_int(req, "offset", 0, { min = 0 })
    if offset_err then return nil, nil, offset_err end
    return limit :: number, offset :: number, nil
end

local function scope_list(scopes: any): { string }
    local out: { string } = {}
    if type(scopes) ~= "string" or scopes == "" then return out end
    for scope in scopes:gmatch("%S+") do out[#out + 1] = scope end
    return out
end

local function truthy(value: any): boolean
    return value == true or value == "true" or value == "1" or value == 1
end

-- A connection exposes channels (and can host a channel responder) when its
-- provider's connection binding implements reply_provider. The capability lives on
-- the binding, not the connection instance, so it is resolved from the provider's
-- binding (cached per provider). A dataflow connection (e.g. phantombuster) has no
-- reply_provider, so channel pickers skip it.
local provider_contract_cache: { [string]: { [string]: boolean } } = {}
local function provider_implements(provider: string, contract_id: string): boolean
    if type(provider) ~= "string" or provider == "" then return false end
    local cached = provider_contract_cache[provider]
    if cached and cached[contract_id] ~= nil then return cached[contract_id] == true end
    local has = false
    local entries = registry.find({ [".kind"] = "contract.binding", ["meta.provider"] = provider })
    for _, entry in ipairs(entries or {}) do
        local data: any = (entry :: any).data
        local contracts: any = data and data.contracts
        if type(contracts) == "table" then
            for _, c in ipairs(contracts :: { any }) do
                if (c :: any).contract == contract_id then has = true break end
            end
        end
        if has then break end
    end
    if not provider_contract_cache[provider] then provider_contract_cache[provider] = {} end
    provider_contract_cache[provider][contract_id] = has
    return has
end

local function provider_exposes_channels(provider: string): boolean
    return provider_implements(provider, REPLY_PROVIDER_CONTRACT)
end

-- The provider's connection declaration wins. Providers without a declared
-- icon use their first nonempty binding icon in registry id order.
local icon_cache: { [string]: string } = {}
local function provider_icon(provider: string): string
    if type(provider) ~= "string" or provider == "" then return "" end
    if icon_cache[provider] ~= nil then return icon_cache[provider] :: string end
    local found = ""
    local entries = registry.find({ [".kind"] = "contract.binding", ["meta.provider"] = provider })
    table.sort(entries or {}, function(a, b) return a.id < b.id end)
    for _, entry in ipairs(entries or {}) do
        local m: any = (entry :: any).meta or ((entry :: any).data and (entry :: any).data.meta)
        if type(m) == "table" and type(m.icon) == "string" and m.icon ~= "" then
            if create_policy.is_connection_binding(entry, conn_types.CONNECTION_CONTRACT) then
                found = m.icon :: string
                break
            end
            if found == "" then found = m.icon :: string end
        end
    end
    icon_cache[provider] = found
    return found
end

local function list_connections(actor: any, scope: any, provider: string?, name: string?, limit: number, offset: number): (any, string?)
    local def, derr = contract.get(conn_types.CONNECTIONS_CONTRACT)
    if derr or not def then
        return nil, "connections contract: " .. tostring(derr)
    end

    local inst, oerr = def:with_actor(actor):with_scope(scope):open()
    if oerr or not inst then
        return nil, "connections open: " .. tostring(oerr)
    end

    local args: any = {
        pagination = { limit = limit, offset = offset },
    }
    if provider and provider ~= "" then args.provider = provider end
    if name and name ~= "" then args.name = name end

    -- The registry list answers one shape: { connections, total_count, has_more }.
    -- A non-conforming page is a contract break, not a fallback case.
    local page, lerr = inst:list(args)
    if lerr then
        return nil, tostring(lerr)
    end
    if type(page) ~= "table" or type(page.connections) ~= "table" then
        return nil, "connections list returned a non-conforming page shape"
    end
    return page, nil
end

local function project_connection(row: any): any
    local meta = row.meta or {}
    local component_id = row.component_id

    local granted = meta.scopes_granted or ""
    local scopes = scope_list(granted)
    local provider = meta.provider or ""
    local name = meta.title or ""
    -- Emit the stored canonical connection_state verbatim. Expiry is derived
    -- client-side (from expires_at) so the initial list and the realtime meta
    -- relay resolve to the same display state.
    local state = conn_types.STATE_CONNECTED
    if type(meta.connection_state) == "string" and meta.connection_state ~= "" then
        state = meta.connection_state
    end

    local icon = provider_icon(provider)
    if icon == "" then icon = meta.icon or "" end

    return {
        component_id = component_id,
        name = name,
        provider = provider,
        icon = icon,
        connection_state = state,
        reauth_reason = meta.reauth_reason or "",
        reply_provider = provider_exposes_channels(provider),
        channel_context = false,
        expires_at = conn_types.timestamp(meta.expires_at),
        refresh_expires_at = conn_types.timestamp(meta.refresh_expires_at),
        last_token_refresh = meta.last_token_refresh or "",
        updated_at = meta.updated_at or row.updated_at or "",
        scope_count = #scopes,
        scopes_granted = scopes,
        oauth = truthy(meta.oauth_connection),
    }
end

-- Authn + endpoint authz are enforced by the router firewall; the registry
-- list runs under the request's actor scope.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = { message = "authentication required" } })
        return
    end

    local limit, offset, page_err = parse_pagination(req)
    if page_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = { message = page_err } })
        return
    end

    local page, lerr = list_connections(actor, scope, req:query("provider"), req:query("name"), limit :: number, offset :: number)
    if lerr then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = { message = tostring(lerr) } })
        return
    end

    local out = {}
    local items = {}
    for _, row in ipairs((page and page.connections) or {}) do
        if type(row) ~= "table" or type(row.component_id) ~= "string" or row.component_id == "" then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = { message = "connection row missing component_id" } })
            return
        end
        local c = project_connection(row)
        out[#out + 1] = c
        -- Canonical picker envelope: a connection is selectable when it can host a
        -- channel responder (reply_provider). provider is carried for the picker's
        -- per-provider filtering.
        items[#items + 1] = {
            id = c.component_id,
            label = c.name,
            icon = c.icon,
            provider = c.provider,
            reply_provider = c.reply_provider,
            channel_context = c.channel_context,
            selectable = c.reply_provider == true,
        }
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #out,
        total_count = page and page.total_count or #out,
        has_more = page and page.has_more == true,
        limit = limit,
        offset = offset,
        connections = out,
        items = items,
    })
end

return { handler = handler }
