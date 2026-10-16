local sql = require("sql")
local registry = require("registry")
local hash = require("hash")
local json = require("json")
local base64 = require("base64")
local settings_types = require("settings_types")
local ui_types = require("ui_types")

local M = {}

function M.url(): string
    local endpoint, err = registry.get("kickside.ui.api:get_branding.endpoint")
    if err then error(tostring(err)) end
    local router, rerr = registry.get(endpoint.meta.router)
    if rerr then error(tostring(rerr)) end
    return (router.data.prefix or "") .. "/branding/logo"
end

local function connect(): any
    local db, err = sql.get(settings_types.db_id())
    if err then error(tostring(err)) end
    return db
end

function M.save(bytes: string, content_type: string): any
    local db = connect()
    local etag = bytes and ('"' .. hash.sha256(bytes) .. '"')
    local value = json.encode({ bytes = bytes and base64.encode(bytes), content_type = content_type, etag = etag })
    local _, err = db:execute("INSERT INTO kickside_settings (namespace, key, value, value_type, updated_by) VALUES ('kickside.ui', 'branding_image', $1, 'json', 'kickside.ui:branding') ON CONFLICT (namespace, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at", { value })
    db:release()
    if err then error(tostring(err)) end
    return { bytes = bytes, content_type = content_type, etag = etag }
end

function M.read(): any
    local db = connect()
    local rows, err = db:query("SELECT value FROM kickside_settings WHERE namespace = 'kickside.ui' AND key = 'branding_image'", {})
    db:release()
    if err then error(tostring(err)) end
    if #rows > 0 then
        local logo, jerr = json.decode(rows[1].value)
        if jerr then error(tostring(jerr)) end
        if logo.bytes then
            local bytes, derr = base64.decode(logo.bytes)
            if derr then error(tostring(derr)) end
            logo.bytes = bytes
        end
        return logo
    end
    return nil
end

function M.resolve_url(value: any): string
    return ui_types.safe_logo_url(value)
end

return M
