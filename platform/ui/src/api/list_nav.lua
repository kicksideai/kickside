-- GET /nav/list — the effective navigation: the surfaces every bound nav_provider
-- contributes (the declared ui.nav_item entries among them) merged with the admin
-- system controls (kickside.ui settings), grouped into ordered categories with the
-- chosen layout. The SPA renders this verbatim; it holds no knowledge of which
-- surfaces or categories exist.

local http = require("http")
local contract = require("contract")
local registry = require("registry")
local security = require("security")
local logger = require("logger"):named("kickside.ui.nav")
local nav = require("nav")
local nav_providers = require("nav_providers")
local nav_badges = require("nav_badges")
local splash = require("splash")
local ui_types = require("ui_types")
local branding = require("branding")

local SETTINGS_CONTRACT = ui_types.CONTRACT.SETTINGS
local COMPONENT_SERVICE = ui_types.CONTRACT.COMPONENT
local NAV_PROVIDER_CONTRACT = ui_types.CONTRACT.NAV_PROVIDER
-- kickside.component ACCESS.READ. Named here to keep the ui module decoupled from
-- the component runtime: badges read component meta through the published service
-- contract, not a hard link to the component implementation.
local COMPONENT_READ = 1

-- Actor-scoped component read port, resolved from the component_service contract
-- (the module boundary), mirroring how kickside.component opens it. Returns nil in
-- minimal contexts where the contract is absent (e.g. the standalone nav harness),
-- so badges simply do not resolve rather than erroring the nav.
local function component_read_port(): any
    local def = contract.get(COMPONENT_SERVICE)
    if not def then return nil end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil end
    local inst = def:with_actor(actor):with_scope(scope):open()
    if not inst then return nil end
    return function(filter: any): (any, any)
        local envelope = inst:query(filter)
        if type(envelope) ~= "table" then return nil, "component query returned no result" end
        if envelope.success == false then return nil, envelope.error or "component query denied" end
        return envelope.components or {}, nil
    end
end

local function nav_provider_port(): (any, any?)
    local def, derr = contract.get(NAV_PROVIDER_CONTRACT)
    if derr or not def then return nil, derr or "nav_provider contract not found" end

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil, "caller context unavailable" end

    local function bindings(): (any, any?)
        local ids, err = (def :: any):implementations()
        if err or type(ids) ~= "table" then
            return nil, err or "nav_provider implementations returned no result"
        end

        local out: { any } = {}
        for _, raw_id in ipairs(ids :: { any }) do
            local id = tostring(raw_id)

            local entry, entry_err = registry.get(id)
            if entry_err then return nil, entry_err end
            local meta = (type(entry) == "table" and (entry :: any).meta) or {}
            out[#out + 1] = { id = id, priority = tonumber((meta :: any).priority) or 0 }
        end
        return out, nil
    end

    local function start(binding_id: string, args: any, _timeout_ms: number): (any, any?)
        local inst, oerr = (def :: any):with_actor(actor):with_scope(scope):open(binding_id)
        if oerr or not inst then return nil, oerr or "nav_provider binding did not open" end
        local future, cerr = inst:list_async(args)
        if cerr then return nil, cerr end
        return future, nil
    end

    return { bindings = bindings, start = start }, nil
end

local function caller_locale(): string
    local def = contract.get(ui_types.CONTRACT.PROFILE)
    if not def then return ui_types.DEFAULT_LOCALE end
    local inst = (def :: any):open()
    if not inst then return ui_types.DEFAULT_LOCALE end
    local r: any = inst:get({ namespace = ui_types.PROFILE_LOCALE_NS, key = ui_types.PROFILE_LOCALE_KEY })
    if r and r.success and type(r.value) == "string" and r.value ~= "" then return r.value :: string end
    return ui_types.DEFAULT_LOCALE
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() or not security.scope() then
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        res:write_json({success = false, error = "nav_unavailable"})
        return
    end

    -- ?manage=1 includes hidden items and the editable config for the appearance
    -- editor. Keep it behind the same endpoint permission as config writes.
    local include_hidden = req and req:query("manage") == "1"
        and security.can("access", "kickside.ui.api:set_config.endpoint")

    local def, settings_err = contract.get(SETTINGS_CONTRACT)
    if settings_err then return nil, settings_err end
    local inst, open_err = def:open()
    if open_err then return nil, open_err end
    local settings, read_err = inst:get_namespace({namespace = ui_types.SETTINGS_NS})
    if read_err then return nil, read_err end
    if not settings.success then return nil, settings.error end
    local cfg: any = settings.values

    if cfg.logo_url then cfg.logo_url = branding.resolve_url(cfg.logo_url) end

    local port, perr = nav_provider_port()
    local collected: nav_providers.Collected? = nil
    if port then collected, perr = nav_providers.collect(port, {
        locale = caller_locale(),
        manage = include_hidden and true or false,
    }) end
    if not collected then
        -- Keep raw dependency detail in logs. This endpoint is visible to every
        -- authenticated user and provider failures can contain sensitive backend
        -- context, so the wire response is deliberately stable and generic.
        logger:error("nav providers unavailable", { error = tostring(perr) })
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        res:write_json({ success = false, error = "nav_unavailable" })
        return
    end
    for binding_id, count in pairs(collected.dropped) do
        logger:warn("nav provider contributions dropped", { provider = binding_id, dropped = count })
    end
    for _, diagnostic in ipairs(collected.diagnostics) do logger:warn("nav provider skipped", diagnostic) end

    local resolved_splash, splash_err = splash.resolve()
    if splash_err then
        logger:error("splash resolution failed", { error = tostring(splash_err) })
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        res:write_json({ success = false, error = "nav_unavailable" })
        return
    end

    local result = nav.effective(cfg, collected.items, include_hidden, collected.categories)
    -- Resolve declared badges against live component meta. The ui -> component READ
    -- happens here (handler layer, via the service contract); nav.effective stays
    -- pure. items and categories share item tables, so this fills both. The actor id
    -- scopes each scope=actor badge to the actor's OWN component (an admin can READ
    -- many users' components of the same impl_id, but badges only their own).
    local actor = security.actor()
    local actor_id = actor and tostring(actor:id()) or nil
    nav_badges.resolve(result.items :: { any }, component_read_port(), COMPONENT_READ, actor_id)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        layout = result.layout,
        categories = result.categories,
        items = result.items,
        count = #result.items,
        home = ui_types.safe_home_path(cfg.home),
        config = include_hidden and cfg or nil,
        -- The full-screen splash (if any) the user has not yet seen; nil otherwise.
        -- Resolved here so the SPA needs no extra (state-leaking) endpoint.
        splash = resolved_splash,
    })
end

return { handler = handler }
