local http = require("http")
local registry = require("registry")
local logger = require("logger")

-- The sessions surface needs presentation data for a persisted provider id, not
-- connection instances. Keep this deliberately narrower than provider discovery:
-- no credential schema, OAuth configuration, component id, or account state ever
-- leaves the registry here.

local M = {}
local log = logger:named("provider_badges")

local MAX_PROVIDER_BYTES = 64
local MAX_TITLE_BYTES = 120
local MAX_ICON_BYTES = 96
local FALLBACK_ICON = "tabler:plug-connected"
local PUBLIC_UNAVAILABLE = "provider catalogue unavailable"

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function printable(value: string, max_bytes: number): boolean
    return value ~= "" and #value <= max_bytes and not value:find("[%z\1-\31\127]")
end

-- Provider ids are stable registry vocabulary, not free text. Dots remain
-- allowed for existing namespaced providers; the shape rules out whitespace,
-- control characters, path-like strings, and arbitrary metadata blobs.
local function canonical_provider(value: any): string?
    local provider = trim(value):lower()
    if not printable(provider, MAX_PROVIDER_BYTES) then return nil end
    if not provider:match("^[a-z0-9][a-z0-9._-]*$") then return nil end
    return provider
end

local function safe_title(value: any, provider: string): string
    local title = trim(value)
    if not printable(title, MAX_TITLE_BYTES) then return provider end
    return title
end

local function safe_icon(value: any): (string, boolean)
    local icon = trim(value):lower()
    if printable(icon, MAX_ICON_BYTES) and icon:match("^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_-]*$") then
        return icon, true
    end
    return FALLBACK_ICON, false
end

local function badge(entry: any): any?
    if type(entry) ~= "table" or entry.kind ~= "contract.binding" then return nil end
    local meta = type(entry.meta) == "table" and entry.meta or {}
    local provider = canonical_provider(meta.provider)
    if not provider then return nil end

    local raw_icon = meta.icon
    if trim(raw_icon) == "" and type(meta.component) == "table" then
        raw_icon = (meta.component :: any).icon
    end
    local icon, declared_icon = safe_icon(raw_icon)
    return {
        provider = provider,
        title = safe_title(meta.title, provider),
        icon = icon,
        declared_icon = declared_icon,
    }
end

local function better(candidate: any, current: any): boolean
    -- Providers can publish multiple bindings (connection, OAuth, reply, or
    -- channel). Prefer a binding that has a real icon; otherwise retain the first
    -- stable entry so registry ordering cannot change labels unpredictably.
    return current == nil or (current.declared_icon ~= true and candidate.declared_icon == true)
end

local function catalogue(entries: any): { any }
    local by_provider: { [string]: any } = {}
    for _, entry in ipairs(type(entries) == "table" and entries or {}) do
        local item = badge(entry)
        if item and better(item, by_provider[item.provider]) then
            by_provider[item.provider] = item
        end
    end

    local providers: { any } = {}
    for _, item in pairs(by_provider) do
        providers[#providers + 1] = { provider = item.provider, title = item.title, icon = item.icon }
    end
    table.sort(providers, function(a: any, b: any): boolean
        return tostring(a.provider) < tostring(b.provider)
    end)
    return providers
end

local function handler(registry_find: any, response: any, failure_log: any)
    local res = response()
    if not res then return nil, "no http response" end
    res:set_content_type(http.CONTENT.JSON)

    local entries, err = registry_find({
        [".kind"] = "contract.binding",
        ["*meta.provider"] = "",
    })
    if err then
        failure_log:error("provider catalogue registry lookup failed", { error = tostring(err) })
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = PUBLIC_UNAVAILABLE })
        return
    end

    local providers = catalogue(entries)

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, providers = providers })
end

function M.new(registry_find: any, response: any, failure_log: any): any
    return {
        handler = function(): any return handler(registry_find, response, failure_log) end,
    }
end

M.handler = M.new(registry.find, http.response, log).handler

return M
