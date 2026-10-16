-- Splash resolution + "seen" persistence.
--
-- A splash is a registry.entry with meta.type = ui.splash carrying { id,
-- component_tag, priority, audience, scope, presentation, title, icon }. The SPA
-- shows the resolved splash once, then marks it seen. Discovery is a registry
-- query, so any module contributes a splash by declaring an entry; this never
-- names them.
--
-- meta.scope decides who "once" means:
--   user (default) -- seen once per user. The record lives in the caller's
--     kickside.profile field kickside.ui:seen_splashes (a json list), so it
--     follows the user across devices and survives a browser wipe.
--   instance -- completed once for the whole instance (e.g. the setup wizard,
--     whose steps configure instance branding, modules and providers). The
--     record lives in the admin-editable setting kickside.ui:completed_splashes,
--     so once any targeted caller completes it, it resolves for nobody. Writing
--     it requires the splash's audience plus the settings write capability.
--
-- An unrecognized scope never resolves and cannot be marked.

local registry = require("registry")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local ui_types = require("ui_types")
local errors = require("errors")

local M = {}

-- UI-owned capability granted only to the host's injected administrator scope.
local ADMIN_GATE = "kickside.ui:system_onboarding"

-- DEV OVERRIDE: while true, every splash resolves on every load and dismissals
-- are NOT stored -- so the page can be iterated on without re-clearing seen state.
-- Production behavior: a splash shows until dismissed (per user or per instance,
-- by scope), then stays hidden; the Appearance editor's "Show setup again" clears it.
local DEV_ALWAYS_SHOW = false

local function always_show(): boolean
    return DEV_ALWAYS_SHOW
end

local function splash_scope(meta: any): string?
    local scope = meta.scope or ui_types.SPLASH_SCOPE.USER
    if scope == ui_types.SPLASH_SCOPE.USER or scope == ui_types.SPLASH_SCOPE.INSTANCE then
        return scope :: string
    end
    return nil
end

-- open_profile opens the profile contract under the caller's identity (per-user).
local function open_profile(): any
    local actor = security.actor()
    if not actor then return nil end
    local def = contract.get(ui_types.CONTRACT.PROFILE)
    if not def then return nil end
    return (def :: any):open()
end

-- open_settings opens the settings contract under the caller's identity; reads
-- for instance completion are admin-only, as are writes.
local function open_settings(): (any, string?)
    local def, derr = contract.get(ui_types.CONTRACT.SETTINGS)
    if not def then return nil, "settings contract: " .. tostring(derr) end
    local inst, oerr = (def :: any):open()
    if not inst then return nil, "settings open: " .. tostring(oerr) end
    return inst, nil
end

local function string_list(value: any): { string }
    local out: { string } = {}
    if type(value) ~= "table" then return out end
    for _, v in ipairs(value :: { any }) do
        if type(v) == "string" then out[#out + 1] = v :: string end
    end
    return out
end

-- seen_list reads the caller's seen-splash ids; an unset/absent value is empty.
local function seen_list(inst: any): { string }
    if not inst then return {} end
    local r: any = inst:get({ namespace = ui_types.PROFILE_NS, key = ui_types.SEEN_SPLASHES_KEY })
    if r and r.success then return string_list(r.value) end
    return {}
end

-- completed_list reads the instance-completed splash ids.
local function completed_list(inst: any): ({ string }?, string?)
    local r: any = inst:get({ namespace = ui_types.SETTINGS_NS, key = ui_types.COMPLETED_SPLASHES_KEY })
    if not (r and r.success) then
        return nil, (r and tostring(r.error)) or "failed to read completed splashes"
    end
    return string_list(r.value), nil
end

local function write_completed(inst: any, list: { string }): (boolean, string?)
    local r: any = inst:set({ namespace = ui_types.SETTINGS_NS, key = ui_types.COMPLETED_SPLASHES_KEY, value = list })
    if not (r and r.success) then
        return false, (r and tostring(r.error)) or "failed to persist completed splashes"
    end
    return true
end

-- audience_ok decides whether the current caller is targeted by a splash.
-- "all" (default) targets everyone; "admin" targets admins. Unknown audiences
-- (e.g. an unrecognized group spec) deny by default.
local function audience_ok(meta: any): boolean
    local audience = meta.audience or "all"
    if audience == "all" then return true end
    if audience == "admin" then return security.can("access", ADMIN_GATE) == true end
    return false
end

type DeclaredSplash = { id: string, meta: any }

local function declared_splashes(): ({ DeclaredSplash }?, error?)
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = ui_types.SPLASH_TYPE })
    if err then
        return nil, errors.new({ message = "splash discovery failed: " .. tostring(err), kind = errors.UNAVAILABLE })
    end
    local out: { DeclaredSplash } = {}
    for _, entry in ipairs(entries or {}) do
        local e = entry :: { id: string, meta: any }
        local meta = e.meta or {}
        local _, presentation_err = ui_types.splash_presentation(meta.presentation)
        if presentation_err then
            return nil, errors.new({ message = tostring(e.id) .. ": " .. presentation_err, kind = errors.INVALID })
        end
        local id = tostring(meta.id or e.id or "")
        if id ~= "" and not meta.private then out[#out + 1] = { id = id, meta = meta } end
    end
    return out, nil
end

-- declared_splash finds the declared splash with this id, or nil for an id no
-- module declares (such an id is recorded per user).
local function declared_splash(id: string): (any, error?)
    local splashes, err = declared_splashes()
    if err then return nil, err end
    for _, s in ipairs(splashes or {}) do
        if s.id == id then return s.meta, nil end
    end
    return nil, nil
end

-- steps_for discovers the ordered steps declared for a splash. Each step is its
-- own registry entry (ui.splash.step) naming the splash it belongs to, so a module
-- contributes a step declaratively -- the wizard shell composes whatever is found.
local function steps_for(splash_id: string): { any }
    local out: { any } = {}
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = ui_types.SPLASH_STEP_TYPE })
    if err or type(entries) ~= "table" then return out end
    for _, entry in ipairs(entries) do
        local e = entry :: { id: string, meta: any }
        local meta = e.meta or {}
        if not meta.private and tostring(meta.splash or "") == splash_id then
            out[#out + 1] = {
                id = tostring(meta.id or e.id or ""),
                order = tonumber(meta.order) or 500,
                chip = meta.chip,
                title = meta.title,
                subtitle = meta.subtitle,
                icon = meta.icon,
                component_tag = meta.component_tag,
                optional = meta.optional == true,
                field = meta.field,
                placeholder = meta.placeholder,
            }
        end
    end
    table.sort(out, function(a: any, b: any): boolean
        if a.order == b.order then return tostring(a.id) < tostring(b.id) end
        return a.order < b.order
    end)
    return out
end

local function as_set(list: { string }): { [string]: boolean }
    local out: { [string]: boolean } = {}
    for _, id in ipairs(list) do out[id] = true end
    return out
end

-- resolve returns the highest-priority splash targeted at the caller that is not
-- yet seen in its scope, or nil. Read-only. When the instance completion record
-- cannot be read, instance splashes stay unresolved: an unknown completion state
-- never re-opens the instance wizard.
function M.resolve(): (any, error?)
    if not security.actor() then return nil, nil end
    local splashes, splashes_err = declared_splashes()
    if splashes_err then return nil, splashes_err end
    if #(splashes :: { DeclaredSplash }) == 0 then return nil, nil end

    -- Dev override skips both seen filters so every splash resolves.
    local seen: { [string]: boolean } = {}
    local completed: { [string]: boolean }? = {}
    if not always_show() then
        seen = as_set(seen_list(open_profile()))
        if security.can("access", ADMIN_GATE) == true then
            local settings = open_settings()
            local list = settings and completed_list(settings) or nil
            completed = list and as_set(list) or nil
        else
            completed = nil
        end
    end

    local function eligible(meta: any): (boolean, error?)
        local admitted, access_err = ui_types.splash_access(meta.required_access, function(resource)
            return security.can("access", resource) == true
        end)
        if access_err then return false, access_err end
        if not admitted then return false, nil end
        if meta.eligibility == nil then return true, nil end
        if type(meta.eligibility) ~= "string" or meta.eligibility == "" then
            return false, errors.new({ message = "splash eligibility must be a function reference", kind = errors.INVALID })
        end
        local value, err = funcs.call(meta.eligibility)
        if err then return false, errors.wrap(err, "splash eligibility " .. meta.eligibility) end
        if type(value) ~= "boolean" then
            return false, errors.new({ message = "splash eligibility must return a boolean", kind = errors.INVALID })
        end
        return value, nil
    end

    local best: any = nil
    local best_priority = -1
    for _, s in ipairs(splashes :: { DeclaredSplash }) do
        local meta = s.meta
        local scope = splash_scope(meta)
        local done: boolean
        if scope == ui_types.SPLASH_SCOPE.INSTANCE then
            done = security.can("access", ADMIN_GATE) ~= true
                or completed == nil or (completed :: { [string]: boolean })[s.id] == true
        else
            done = scope == nil or seen[s.id] == true
        end
        local is_eligible = false
        if not done and audience_ok(meta) then
            local ok, eligibility_err = eligible(meta)
            if eligibility_err then return nil, eligibility_err end
            is_eligible = ok
        end
        if is_eligible then
            local priority = tonumber(meta.priority) or 0
            if priority > best_priority then
                best_priority = priority
                best = {
                    id = s.id,
                    presentation = (ui_types.splash_presentation(meta.presentation)),
                    component_tag = meta.component_tag,
                    title = meta.title,
                    icon = meta.icon,
                    steps = steps_for(s.id),
                }
            end
        end
    end
    return best, nil
end

-- instance_splash returns the meta of a declared instance-scoped splash with this
-- id, (nil, nil) when the id is recorded per user, or an error for a declared
-- splash with an unrecognized scope.
local function instance_splash(id: string): (any, string?)
    local meta, declared_err = declared_splash(id)
    if declared_err then return nil, tostring(declared_err) end
    if not meta then return nil, nil end
    local scope = splash_scope(meta)
    if scope == nil then return nil, "splash scope is not recognized" end
    if scope == ui_types.SPLASH_SCOPE.INSTANCE then return meta, nil end
    return nil, nil
end

-- mark_instance adds or removes id in the instance completion list. The caller
-- must be in the splash's audience; the settings service enforces its own admin
-- write capability. Idempotent.
local function mark_instance(meta: any, id: string, completed: boolean): (boolean, string?)
    if security.can("access", ADMIN_GATE) ~= true then return false, "administrator access is required" end
    if not audience_ok(meta) then return false, "splash is not targeted at the caller" end
    local inst, oerr = open_settings()
    if not inst then return false, oerr end
    local list, lerr = completed_list(inst)
    if not list then return false, lerr end

    local next_list: { string } = {}
    local present = false
    for _, v in ipairs(list) do
        if v == id then present = true end
        if v ~= id then next_list[#next_list + 1] = v end
    end
    if present == completed then return true end
    if completed then next_list[#next_list + 1] = id end
    return write_completed(inst, next_list)
end

-- mark_seen records that the caller dismissed a splash: in the instance
-- completion list for an instance splash, else in the caller's seen list. The
-- profile/settings contracts have no append op (set replaces the whole value),
-- so this is read-modify-write. Idempotent.
function M.mark_seen(id: any): (boolean, string?)
    if type(id) ~= "string" or id == "" then return false, "splash id is required" end
    -- Dev override: accept the dismissal but do not persist it, so it re-shows.
    if always_show() then return true end
    if not security.actor() then return false, "authenticated actor is required" end

    local meta, serr = instance_splash(id)
    if serr then return false, serr end
    if meta then return mark_instance(meta, id, true) end

    local inst = open_profile()
    if not inst then return false, "authenticated actor is required" end
    local list = seen_list(inst)
    for _, v in ipairs(list) do
        if v == id then return true end
    end
    list[#list + 1] = id :: string

    local r: any = inst:set({ namespace = ui_types.PROFILE_NS, key = ui_types.SEEN_SPLASHES_KEY, value = list })
    if not (r and r.success) then
        return false, (r and tostring(r.error)) or "failed to persist seen splash"
    end
    return true
end

-- mark_unseen clears the seen record for id in its scope so the splash resolves
-- again (a "replay setup" action). Clearing an instance splash has the same gate
-- as completing it.
function M.mark_unseen(id: any): (boolean, string?)
    if type(id) ~= "string" or id == "" then return false, "splash id is required" end
    if not security.actor() then return false, "authenticated actor is required" end

    local meta, serr = instance_splash(id)
    if serr then return false, serr end
    if meta then return mark_instance(meta, id, false) end

    local inst = open_profile()
    if not inst then return false, "authenticated actor is required" end
    local kept: { string } = {}
    local removed = false
    for _, v in ipairs(seen_list(inst)) do
        if v == id then removed = true else kept[#kept + 1] = v end
    end
    if not removed then return true end

    local r: any = inst:set({ namespace = ui_types.PROFILE_NS, key = ui_types.SEEN_SPLASHES_KEY, value = kept })
    if not (r and r.success) then
        return false, (r and tostring(r.error)) or "failed to clear seen splash"
    end
    return true
end

-- reset reopens instance setup for administrators. Personal splashes retain
-- their per-user completion; an individual user splash can be replayed by id.
function M.reset(): (boolean, string?)
    if not security.actor() then return false, "authenticated actor is required" end
    if security.can("access", ADMIN_GATE) ~= true then return false, "administrator access is required" end
    local splashes, splashes_err = declared_splashes()
    if splashes_err then return false, tostring(splashes_err) end
    for _, s in ipairs(splashes or {}) do
        if splash_scope(s.meta) == ui_types.SPLASH_SCOPE.INSTANCE and audience_ok(s.meta) then
            local ok, err = mark_instance(s.meta, s.id, false)
            if not ok then return false, err end
        end
    end
    return true
end

return M
