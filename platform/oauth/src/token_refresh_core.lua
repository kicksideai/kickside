local time = require("time")
local oauth_read_repo = require("oauth_read_repo")
local contract = require("contract")
local logger = require("logger"):named("kickside.oauth.service.token_refresh")
local security = require("security")
local connection_manager = require("connection_manager")
local refresh_schedule = require("refresh_schedule")

-- Constants
local OAUTH_CONNECTOR_CONTRACT = "kickside.oauth:connector"
local PROVIDER_DISCOVERY_CONTRACT = "kickside.oauth.discovery:provider_discovery"

local function current_runtime_identity()
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, "security actor and scope are required"
    end
    return actor, scope, nil
end

local function handle(request_dto)
    local schedule_id = request_dto.schedule_id or "unknown"
    local args = request_dto.args or {}
    local raw_component_id = args.component_id

    if type(raw_component_id) ~= "string" or raw_component_id == "" then
        logger:error("Missing component_id in task arguments")
        return {
            success = false,
            error = "Missing component_id in task arguments",
            retriable = false
        }
    end
    local component_id: string = raw_component_id

    logger:debug("Token refresh started", {
        component_id = component_id,
        schedule_id = schedule_id
    })

    local actor, scope, security_err = current_runtime_identity()
    if security_err then
        logger:error("Token refresh missing security context", {
            component_id = component_id,
            schedule_id = schedule_id,
            error = security_err
        })
        return {
            success = false,
            error = security_err,
            retriable = false
        }
    end

    -- Get connection metadata (lightweight check)
    local connection_metadata, err = oauth_read_repo.get_connection_metadata(component_id)
    if err then
        logger:error("Failed to get connection metadata", {
            component_id = component_id,
            error = err
        })
        return {
            success = false,
            error = "Failed to get connection metadata: " .. err,
            retriable = true
        }
    end

    if not connection_metadata then return { success = false, error = "OAuth connection not found", retriable = false } end
    local provider_name = connection_metadata.provider

    logger:info("Token refresh required, starting process", {
        component_id = component_id,
        provider = provider_name,
        connection_name = connection_metadata.connection_name
    })

    -- Get full connection data
    local connection_data, err = oauth_read_repo.get_connection(component_id)
    if err then
        logger:error("Failed to get connection data", {
            component_id = component_id,
            error = err
        })
        return {
            success = false,
            error = "Failed to get connection data: " .. err,
            retriable = true
        }
    end

    local generation = request_dto.refresh_generation
    if generation == nil then generation = connection_data.refresh_wake_generation end

    -- Verify refresh token is available
    if not connection_data.tokens or not connection_data.tokens.refresh_token then
        logger:warn("No refresh token available for connection", {
            component_id = component_id,
            provider = provider_name
        })
        local mark_err, stale = connection_manager.mark_needs_reauth(component_id, "no refresh token", generation)
        if stale then return { success = true, stale = true } end
        if mark_err then
            return {
                success = false,
                error = "No refresh token available - manual re-authorization required; " .. mark_err,
                retriable = true
            }
        end
        return {
            success = false,
            error = "No refresh token available - manual re-authorization required",
            retriable = false
        }
    end

    -- Get provider connector
    local discovery_service, err = contract.get(PROVIDER_DISCOVERY_CONTRACT)
    if err then
        logger:error("Failed to get discovery service", { error = err })
        return {
            success = false,
            error = "Failed to get discovery service: " .. err,
            retriable = true
        }
    end

    local discovery_instance, err = discovery_service:with_actor(actor):with_scope(scope):open()
    if err then
        logger:error("Failed to open discovery service", { error = err })
        return {
            success = false,
            error = "Failed to open discovery service: " .. err,
            retriable = true
        }
    end

    local connector_info, err = discovery_instance:get_connector_contract({
        oauth_provider = provider_name
    })
    -- Discovery translates a registry miss into a {success=false} value with nil err.
    -- A missing/deregistered provider is permanent (no retry); a transport err is transient.
    if err or not connector_info or connector_info.success == false then
        local provider_missing = not err and connector_info ~= nil
        local detail = err or (connector_info and connector_info.error) or provider_name
        logger:error("Failed to get connector contract", {
            provider = provider_name,
            error = detail
        })
        return {
            success = false,
            error = "Failed to get connector contract: " .. detail,
            retriable = not provider_missing
        }
    end

    -- Get OAuth contract and instance
    local oauth_contract, err = contract.get(OAUTH_CONNECTOR_CONTRACT)
    if err then
        logger:error("Failed to get OAuth contract", { error = err })
        return {
            success = false,
            error = "Failed to get OAuth contract: " .. err,
            retriable = true
        }
    end

    local oauth_instance, err = oauth_contract
        :with_actor(actor)
        :with_scope(scope)
        :with_context(connector_info.context_values)
        :open(connector_info.implementation_id :: string)
    if err then
        logger:error("Failed to open OAuth implementation", {
            implementation_id = connector_info.implementation_id,
            error = err
        })
        return {
            success = false,
            error = "Failed to open OAuth implementation: " .. err,
            retriable = true
        }
    end

    -- Perform token refresh. Keep provider/connector bugs inside the scheduled
    -- task result so the scheduler records a structured failure instead of an
    -- unhandled Lua exception with only a line number.
    if request_dto.refresh_generation ~= nil then
        local current, read_err = refresh_schedule.read(component_id)
        if read_err then return { success = false, error = tostring(read_err), retriable = true } end
        if not current or current.refresh_wake_generation ~= request_dto.refresh_generation
            or current.refresh_enabled == false or current.refresh_enabled == 0 then return { success = true, stale = true } end
    end
    local refresh_result, err = oauth_instance:refresh_token({
        refresh_token = connection_data.tokens.refresh_token
    })

    if type(refresh_result) ~= "table" then
        logger:error("Token refresh returned invalid result", {
            component_id = component_id,
            provider = provider_name,
            result_type = type(refresh_result)
        })
        return {
            success = false,
            error = "Token refresh returned invalid result",
            retriable = true
        }
    end

    if type(err) == "table" then
        err = tostring(err)
    end

    if err then
        logger:error("Token refresh call failed", {
            component_id = component_id,
            provider = provider_name,
            error = err
        })
        return {
            success = false,
            error = "Token refresh call failed: " .. err,
            retriable = true  -- Contract call failures are generally retriable
        }
    end

    if not refresh_result.success then
        local error_msg = refresh_result.error or "Unknown error"
        -- Receiving an HTTP response does not prove the refresh grant is invalid.
        local is_retriable = refresh_result.requires_reauth ~= true

        logger:error("Token refresh failed", {
            component_id = component_id,
            provider = provider_name,
            error = error_msg,
            response_received = refresh_result.response_received,
            is_retriable = is_retriable
        })

        if not is_retriable then
            local mark_err, stale = connection_manager.mark_needs_reauth(component_id, error_msg, generation)
            if stale then return { success = true, stale = true } end
            if mark_err then
                return {
                    success = false,
                    error = "Token refresh failed: " .. error_msg .. "; " .. mark_err,
                    retriable = true
                }
            end
        end

        return {
            success = false,
            error = "Token refresh failed: " .. error_msg,
            retriable = is_retriable
        }
    end

    -- Calculate new expiration
    local new_expires_at = nil
    if refresh_result.expires_in ~= nil then
        if type(refresh_result.expires_in) ~= "number" or refresh_result.expires_in <= 0 then
            return {
                success = false,
                error = "Token refresh returned invalid expires_in",
                retriable = true
            }
        end
        new_expires_at = time.now():unix() + (refresh_result.expires_in :: number)
    end

    -- Prepare updated tokens
    local new_tokens = {
        access_token = refresh_result.access_token,
        refresh_token = refresh_result.refresh_token or connection_data.tokens.refresh_token,
        token_type = refresh_result.token_type or connection_data.tokens.token_type,
        scope = refresh_result.scope or connection_data.tokens.scope
    }

    local _, token_update_err = connection_manager.apply_refreshed_tokens({
        request_dto = request_dto,
        expected_generation = generation,
        component_id = component_id,
        connection_metadata = connection_metadata,
        provider_name = provider_name,
        connection_name = connection_metadata.connection_name,
        tokens = new_tokens,
        expires_at = new_expires_at,
        actor = actor,
        scope = scope,
        scopes_granted = refresh_result.scope or connection_metadata.scopes_granted or "",
    })
    if token_update_err then
        logger:error("Failed to apply refreshed tokens", {
            component_id = component_id,
            provider = provider_name,
            error = token_update_err
        })
        return {
            success = false,
            error = token_update_err,
            retriable = true
        }
    end

    logger:info("Token refresh completed successfully", {
        component_id = component_id,
        provider = provider_name,
        new_expires_at = new_expires_at,
        token_rotated = refresh_result.refresh_token ~= nil
    })

    return { success = true }
end

return { handle = handle }
