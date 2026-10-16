local http = require("http")
local contract = require("contract")
local component = require("component")
local http_errors = require("http_errors")
local env = require("env")
local logger = require("logger"):named("kickside.oauth.api.init")
local process = require("process")
local security = require("security")
local runtime_config = require("runtime_config")

local STATUS = http.STATUS
local CONTENT = http.CONTENT
local OAUTH_CONNECTOR_CONTRACT = "kickside.oauth:connector"
local PROVIDER_DISCOVERY_CONTRACT = "kickside.oauth.discovery:provider_discovery"
local CONNECTION_NEGOTIATOR_PROCESS = "kickside.oauth.service:connection_negotiator"

local function handler()
    local req = http.request()
    local res = http.response()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(CONTENT.JSON)

    if req:method() ~= "POST" then
        res:set_status(STATUS.METHOD_NOT_ALLOWED)
        res:write_json({ success = false, error = "Method not allowed. Use POST." })
        return
    end

    local provider_name = req:param("provider_name")
    if not provider_name or provider_name == "" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Provider name is required in URL path" })
        return
    end

    local body, parse_err = req:body_json()
    if parse_err or type(body) ~= "table" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON request body: " .. tostring(parse_err or "expected a JSON object") })
        return
    end

    if not body.name or body.name == "" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Connection name is required" })
        return
    end

    if not body.scopes or type(body.scopes) ~= "table" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Scopes array is required" })
        return
    end

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        res:set_status(STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "security actor and scope are required" })
        return
    end

    -- A component_id marks this as a re-authorization of an existing connection.
    -- Re-authorization overwrites that connection's tokens on callback, so the
    -- caller must hold WRITE on the component — otherwise any authenticated
    -- user could re-auth (and hijack) another user's connection.
    local is_reauthorization = body.component_id and body.component_id ~= ""
    if is_reauthorization then
        local _, access_err = component.validate_access((body.component_id :: string), component.ACCESS.WRITE)
        if access_err then
            local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
            res:set_status(status)
            res:write_json({ success = false, error = msg })
            return
        end
    end

    logger:debug("OAuth connection initialization started", {
        provider_name = provider_name,
        connection_name = body.name,
        scopes_count = #body.scopes,
        is_reauthorization = is_reauthorization,
        component_id = body.component_id or "new"
    })

    -- The callback lands on the shared public endpoint under PUBLIC_API_URL.
    local base_url, env_err = env.get("PUBLIC_API_URL")
    if env_err or not base_url or base_url == "" then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to build redirect URI: PUBLIC_API_URL environment variable not set" })
        return
    end
    if base_url:sub(-1) == "/" then
        base_url = base_url:sub(1, -2)
    end
    local redirect_uri = base_url .. "/api/public/oauth/callback"

    local discovery_service, err = contract.get(PROVIDER_DISCOVERY_CONTRACT)
    if err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Discovery service not available: " .. err })
        return
    end

    local discovery_instance, err = discovery_service:with_actor(actor):with_scope(scope):open()
    if err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to open discovery service: " .. err })
        return
    end

    local provider_info, err = discovery_instance:get_provider_info({
        oauth_provider = provider_name
    })

    -- Discovery translates a registry miss into a {success=false} value with nil err.
    if err or not provider_info or provider_info.success == false then
        res:set_status(STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "Provider not found: " .. (err or (provider_info and provider_info.error) or provider_name) })
        return
    end

    local connector_info, err = discovery_instance:get_connector_contract({
        oauth_provider = provider_name
    })
    if err or not connector_info or connector_info.success == false then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to get connector contract: " .. (err or (connector_info and connector_info.error) or provider_name) })
        return
    end

    local oauth_contract, err = contract.get(OAUTH_CONNECTOR_CONTRACT)
    if err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "OAuth contract not available: " .. err })
        return
    end

    local oauth_instance, err = oauth_contract
        :with_actor(actor)
        :with_scope(scope)
        :with_context(connector_info.context_values)
        :open(connector_info.implementation_id :: string)
    if err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to open OAuth implementation: " .. err })
        return
    end

    -- Provider default scopes are always included; requested scopes are appended
    -- with duplicates dropped.
    local default_scopes = provider_info.default_scopes or {}
    local requested_scopes = body.scopes or {}
    local final_scopes = {}
    local scope_set = {}
    for _, scopes in ipairs({ default_scopes, requested_scopes }) do
        for _, s in ipairs(scopes) do
            if not scope_set[s] then
                table.insert(final_scopes, s)
                scope_set[s] = true
            end
        end
    end

    logger:debug("Scope merging completed", {
        provider_name = provider_name,
        default_scopes = default_scopes,
        requested_scopes = requested_scopes,
        final_scopes = final_scopes,
        total_scope_count = #final_scopes,
        is_reauthorization = is_reauthorization
    })

    local init_result, err = oauth_instance:init_oauth({
        redirect_uri = redirect_uri,
        scopes = final_scopes
    })
    if err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to initialize OAuth flow: " .. err })
        return
    end
    if not init_result.success then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = init_result.error or "OAuth initialization failed" })
        return
    end

    -- The negotiator process holds the pending state and completes the callback
    -- + token exchange; component_id routes it to an update on re-authorization.
    local connection_data = {
        provider_name = provider_name,
        connection_name = body.name,
        connection_description = body.description or "",
        component_id = body.component_id or nil,
        oauth_data = init_result.storage_payload,
    }

    local process_host = runtime_config.process_host()
    local negotiator_pid, spawn_err = process.spawn(
        CONNECTION_NEGOTIATOR_PROCESS,
        process_host,
        {
            state_token = init_result.state_token,
            connection_data = connection_data,
            connector_info = connector_info
        }
    )
    if not negotiator_pid then
        logger:debug("Failed to spawn OAuth negotiator process", {
            state_token = init_result.state_token,
            provider_name = provider_name,
            process_id = CONNECTION_NEGOTIATOR_PROCESS,
            host = process_host,
            spawn_error = spawn_err or "No error message"
        })
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "Failed to create OAuth session: " .. (spawn_err or "Unknown spawn error") })
        return
    end

    logger:debug("OAuth negotiator process spawned", {
        state_token = init_result.state_token,
        provider_name = provider_name,
        negotiator_pid = negotiator_pid,
        expires_in = init_result.expires_in,
        is_reauthorization = is_reauthorization,
        final_scopes = final_scopes
    })

    res:set_status(STATUS.OK)
    res:write_json({
        success = true,
        authorization_url = init_result.authorization_url,
        state_token = init_result.state_token,
        expires_in = init_result.expires_in,
        redirect_uri = redirect_uri,
        is_reauthorization = is_reauthorization,
        provider = {
            name = provider_info.name,
            title = provider_info.title
        }
    })
end

return { handler = handler }
