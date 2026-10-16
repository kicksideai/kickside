local http = require("http")
local json = require("json")
local registry = require("registry")
local component = require("component")
local connection_manager = require("connection_manager")

local function handler()
    local req, res = http.request(), http.response()
    local body = json.decode(req:body())
    local entry, entry_err = registry.get(body.entry)
    if entry_err or not entry then error(tostring(entry_err or "provider descriptor absent")) end
    local data = entry.data or {}
    if entry.meta and entry.meta.oauth_provider then
        local component_id, oauth_err = connection_manager.register_authorized_connection({
            provider_name = body.provider,
            connection_name = "Provider icon fixture",
            oauth_connection = { access_token = "provider-icon-fixture-access", scopes_granted = "", connection_state = "connected", token_type = "Bearer" },
            user_context = {},
        })
        if oauth_err or not component_id then error(tostring(oauth_err or "OAuth fixture registration fails")) end
        local meta_err = connection_manager.set_public_meta(component_id, { icon = "tabler:question-mark" })
        if meta_err then error(tostring(meta_err)) end
        res:write_json({ component_id = component_id })
        return
    end
    local service, service_err = component.get_service()
    if service_err or not service then error(tostring(service_err or "component service absent")) end
    local result, register_err = service:register({
        impl_id = data.component_contract_id or entry.id,
        meta = { title = "Provider icon fixture", provider = body.provider, class = "connection", icon = "tabler:question-mark" },
        private_context = {},
    })
    if register_err or not result or not result.success then error(tostring(register_err or "connection fixture registration fails")) end
    res:write_json({ component_id = result.component_id })
end

return { handler = handler }
