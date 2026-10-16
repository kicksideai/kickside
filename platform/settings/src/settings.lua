-- The settings service. Each contract method maps to one of these functions via
-- the kickside.settings:settings binding. Reads merge the declared defaults with
-- the override cache (store.memory, warmed once at boot by the cache bootloader)
-- and never touch the DB; the boot warm is the sole cache owner, so a read never
-- provisions the cache. A read that finds a cold cache means boot warming did not
-- run: it surfaces as an error rather than a silent DB reload. Every write
-- delegates to the canonical writer (the single mutation path).

local defs = require("settings_defs")
local cache = require("settings_cache")
local writer = require("settings_writer")
local settings_types = require("settings_types")

local M = {}
local ADMIN_LIST_RESOURCE = "kickside.settings.api:list_settings.endpoint"
local ADMIN_WRITE_RESOURCE = "kickside.settings.api:put_settings.endpoint"

-- The current override map, served from the boot-warmed cache. A cold cache is an
-- infrastructure failure (boot warming did not run), surfaced as an error; a read
-- never reloads it from the DB.
local function overrides(): (settings_types.OverrideMap?, string?)
    local map = cache.read()
    if map then return map, nil end
    return nil, "settings cache is not warmed"
end

-- Effective value for one declared key: a coerced override, else the default.
local function effective_value(def: settings_types.Definition, map: settings_types.OverrideMap): (settings_types.SettingValue?, string?)
    local rec = map[tostring(def.namespace) .. "\0" .. tostring(def.key)]
    if rec ~= nil then
        if rec.error then return nil, rec.error end
        return defs.coerce(def, (rec :: any).value)
    end
    return def.default
end

local function current_actor_id(): string?
    local security = require("security")
    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if type(actor_id) == "string" and actor_id ~= "" then return actor_id end
    return nil
end

local function can_access(resource: string): boolean
    local security = require("security")
    return security.can("access", resource) == true
end

local function require_admin_list(): string?
    if can_access(ADMIN_LIST_RESOURCE) then return nil end
    return "admin settings list access is required"
end

local function require_admin_write(): string?
    if can_access(ADMIN_WRITE_RESOURCE) then return nil end
    return "admin settings write access is required"
end

-- Read restrictions are declared independently from UI visibility. The read
-- functions retain the caller's actor/scope and add only cache/registry access.
local function can_read(def: settings_types.Definition): boolean
    if def.read_access == nil then return true end
    if def.read_access == "admin" then return can_access(ADMIN_LIST_RESOURCE) end
    return false
end

-- get({ namespace, key }) -> { success, value, error? }.
function M.get(args: any): settings_types.GetResponse
    args = args or {}
    local def = defs.find(args.namespace, args.key)
    if not def then return { success = false, error = "undeclared setting" } end
    if not can_read(def) then return { success = false, error = "admin settings read access is required" } end
    local map, oerr = overrides()
    if not map then return { success = false, error = oerr } end
    local value, err = effective_value(def, map)
    if err then return { success = false, error = err } end
    return { success = true, value = value }
end

-- get_namespace({ namespace }) -> { success, values = { key = value } }.
function M.get_namespace(args: any): settings_types.NamespaceResponse
    args = args or {}
    local declared = defs.all()[args.namespace] or {}
    local map, oerr = overrides()
    if not map then return { success = false, error = oerr } end
    local values: { [string]: any } = {}
    for key, def in pairs(declared) do
        if can_read(def) then
            local value, err = effective_value(def, map)
            if err then return { success = false, error = err } end
            values[key] = value
        end
    end
    return { success = true, values = values }
end

-- set({ namespace, key, value }) -> { success, error? }. Delegates to
-- the canonical writer; never writes the DB or cache directly.
function M.set(args: any): settings_types.BasicResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then
        return { success = false, error = "authenticated actor is required" }
    end
    local auth_err = require_admin_write()
    if auth_err then return { success = false, error = auth_err } end
    local ok, err = writer.set(args.namespace, args.key, args.value, actor_id)
    if not ok then return { success = false, error = err } end
    return { success = true }
end

-- unset({ namespace, key }) -> { success, error? }. Reverts to the default.
function M.unset(args: any): settings_types.BasicResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then
        return { success = false, error = "authenticated actor is required" }
    end
    local auth_err = require_admin_write()
    if auth_err then return { success = false, error = auth_err } end
    local ok, err = writer.clear(args.namespace, args.key, actor_id)
    if not ok then return { success = false, error = err } end
    return { success = true }
end

-- list({ namespace? }) -> { success, settings = [...] } merging declarations with
-- overrides + provenance, so the admin UI renders every declared setting.
function M.list(args: any): settings_types.ListResponse
    args = args or {}
    local auth_err = require_admin_list()
    if auth_err then return { success = false, error = auth_err } end
    local map, oerr = overrides()
    if not map then return { success = false, error = oerr } end
    local out: { settings_types.SettingListRow } = {}
    for dns, keys in pairs(defs.all()) do
        if type(args.namespace) ~= "string" or dns == args.namespace then
            for key, def in pairs(keys) do
                -- Backend-only (visible=false) settings are excluded from the
                -- listing: they stay readable/writable through the contract but
                -- the admin UI never renders them.
                if def.visible ~= false then
                    local rec = map[dns .. "\0" .. key]
                    local secret = settings_types.SECRET_TYPES[def.value_type] == true
                    local updated_by: string? = rec and rec.updated_by or nil
                    local updated_at: any? = rec and rec.updated_at or nil
                    local row: settings_types.SettingListRow = {
                        namespace = dns, key = key,
                        is_secret = secret,
                        value_type = def.value_type,
                        is_default = rec == nil, description = def.description,
                        scope = def.scope, editable = def.editable,
                        -- Per-setting JSON-schema for UI rendering + validation.
                        schema = def.schema,
                        title = def.title, category = def.category, order = def.order,
                        ui = def.ui, owner = def.owner,
                        updated_by = updated_by,
                        updated_at = updated_at,
                        error = rec and rec.error or nil,
                    }
                    -- Never surface a secret's value or default in a listing: report
                    -- only whether one is set. The plaintext is reachable only via
                    -- get. Non-secrets carry their effective value + default.
                    if secret then
                        row.has_value = rec ~= nil
                    else
                        row.value, row.error = effective_value(def, map)
                        row.default = def.default
                    end
                    out[#out + 1] = row
                end
            end
        end
    end
    return { success = true, settings = out }
end

return M
