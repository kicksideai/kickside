-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local component = require("component")
local http_errors = require("http_errors")
local env = require("env")
local process = require("process")
local security = require("security")
local runtime_config = require("runtime_config")
local funcs = require("funcs")
local consent_lifetime = require("consent_lifetime")

-- HTTP and agent callers share provider negotiation and callback readiness.
local function new(dependencies)
    local deps = dependencies or {}
    local contract = deps.contract or contract
    local component = deps.component or component
    local env = deps.env or env
    local process = deps.process or process
    local security = deps.security or security
    local funcs = deps.funcs or funcs
    local runtime_config = deps.runtime_config or runtime_config

    local function failure(status: integer, message: string): (any, integer)
        return {success = false, error = message}, status
    end

    local function start(provider_name: any, body: any)
        if type(provider_name) ~= "string" or provider_name == "" then
            return failure(400, "Provider name is required in URL path")
        end
        if type(body) ~= "table" then return failure(400, "Invalid request body") end
        if type(body.name) ~= "string" or body.name == "" then
            return failure(400, "Connection name is required")
        end
        if type(body.scopes) ~= "table" then return failure(400, "Scopes array is required") end
        for _, value in pairs(body.scopes) do
            if type(value) ~= "string" or value == "" then
                return failure(400, "Scopes must be non-empty strings")
            end
        end
        local actor, scope = security.actor(), security.scope()
        if not actor or not scope then return failure(401, "security actor and scope are required") end

        local is_reauthorization = body.component_id ~= nil and body.component_id ~= ""
        if is_reauthorization then
            local access, access_err = component.validate_access(body.component_id, component.ACCESS.WRITE)
            if access_err or not access or access == 0 then
                return failure(http_errors.classify(access_err), tostring(access_err or "access denied"))
            end
            local rows, read_err = component.query({component_ids = {body.component_id}, include = {meta = true}, limit = 1})
            local meta = rows and rows[1] and rows[1].meta
            local is_oauth = meta and (meta.oauth_connection == true or meta.oauth_connection == "true")
            if read_err or not is_oauth or meta.provider ~= provider_name then
                return failure(400, "Reconnect requires an OAuth connection for the same provider. Create a new connection to change providers or authentication type.")
            end
        end
        local base_url, env_err = env.get("PUBLIC_API_URL")
        if env_err or not base_url or base_url == "" then
            return failure(500, "Failed to build redirect URI: PUBLIC_API_URL environment variable not set")
        end
        local redirect_uri = base_url:gsub("/$", "") .. "/api/public/oauth/callback"
        local discovery, err = contract.get("kickside.oauth.discovery:provider_discovery")
        if err then return failure(500, "Discovery service not available: " .. tostring(err)) end
        local instance, open_err = discovery:with_actor(actor):with_scope(scope):open()
        if open_err then return failure(500, "Failed to open discovery service: " .. tostring(open_err)) end
        local provider, provider_err = instance:get_provider_info({oauth_provider = provider_name})
        if provider_err or not provider or provider.success == false then
            return failure(404, "Provider not found: " .. tostring(provider_err or (provider and provider.error) or provider_name))
        end
        local connector, connector_err = instance:get_connector_contract({oauth_provider = provider_name})
        if connector_err or not connector or connector.success == false then
            return failure(500, "Failed to get connector contract: " .. tostring(connector_err or (connector and connector.error) or provider_name))
        end
        local definition, definition_err = contract.get("kickside.oauth:connector")
        if definition_err then return failure(500, "OAuth contract not available: " .. tostring(definition_err)) end
        local oauth, oauth_err = definition:with_actor(actor):with_scope(scope)
            :with_context(connector.context_values):open(connector.implementation_id)
        if oauth_err then return failure(500, "Failed to open OAuth implementation: " .. tostring(oauth_err)) end
        local scopes, seen = {}, {}
        for _, group in ipairs({provider.default_scopes or {}, body.scopes}) do
            for _, value in ipairs(group) do
                if not seen[value] then scopes[#scopes + 1] = value; seen[value] = true end
            end
        end
        local result, init_err = oauth:init_oauth({redirect_uri = redirect_uri, scopes = scopes,
            provider_options = body.provider_options})
        if init_err then return failure(500, "Failed to initialize OAuth flow: " .. tostring(init_err)) end
        if not result or not result.success then
            return failure(400, (result and result.error) or "OAuth initialization failed")
        end
        local pid, spawn_err = process.spawn("kickside.oauth.service:connection_negotiator", runtime_config.process_host(), {
            state_token = result.state_token,
            connection_data = {provider_name = provider_name, connection_name = body.name,
                connection_description = body.description or "", component_id = body.component_id,
                oauth_data = result.storage_payload}, connector_info = connector,
        })
        if not pid then return failure(500, "Failed to create OAuth session: " .. tostring(spawn_err or "Unknown spawn error")) end
        local ready, ready_err = funcs.call("kickside.oauth.service:await_negotiator", {
            state_token = result.state_token, pid = tostring(pid),
        })
        if ready_err or not ready or ready.success ~= true then
            return failure(503, "OAuth callback session could not be initialized. Try again.")
        end
        return {success = true, authorization_url = result.authorization_url, state_token = result.state_token,
            expires_in = math.min(result.expires_in or consent_lifetime.CALLBACK_WAIT_SECONDS,
                consent_lifetime.CALLBACK_WAIT_SECONDS),
            redirect_uri = redirect_uri, is_reauthorization = is_reauthorization,
            provider = {name = provider.name, title = provider.title}}, 200
    end
    return {start = start}
end

local default = new()
default.new = new
return default
