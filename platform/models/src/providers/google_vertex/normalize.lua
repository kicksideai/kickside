-- Provider-declared on-change normalization for Google Vertex. Declared on the
-- Vertex provider editor entry (on_change_func); the generic store invokes it via
-- funcs.call before persisting a profile with { provider_id, config, secret_config }.
-- When no explicit project is set, it derives one from the service-account
-- credentials' project_id and returns a { config = { project } } patch.
local base64 = require("base64")
local json = require("json")

local function decode_credentials(raw: any): any?
    if type(raw) ~= "string" or raw == "" then return nil end
    local decoded = raw
    if not decoded:match("^%s*{") then
        local ok, result = pcall(function() return base64.decode(decoded) end)
        if not ok or not result or result == "" then return nil end
        decoded = result
    end
    local parsed, err = json.decode(decoded)
    if err or type(parsed) ~= "table" then return nil end
    return parsed
end

local function handler(args: any): any
    args = type(args) == "table" and args or {}
    local config = type(args.config) == "table" and args.config or {}
    local secret_config = type(args.secret_config) == "table" and args.secret_config or {}

    local project = config.project
    if type(project) == "string" and project ~= "" then return {} end

    local credentials = decode_credentials(secret_config.google_credentials)
    if credentials and type(credentials.project_id) == "string" and credentials.project_id ~= "" then
        return { config = { project = credentials.project_id } }
    end

    return {}
end

return { handler = handler }
