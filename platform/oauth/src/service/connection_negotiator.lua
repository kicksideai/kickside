local time = require("time")
local contract = require("contract")
local process = require("process")
local channel = require("channel")
local security = require("security")
local connection_manager = require("connection_manager")
local callback_reply = require("callback_reply")
local callback_names = require("callback_names")

-- Constants. Internal oauth ids stay inline; cross-module ports come from consts.
local NEGOTIATION_TIMEOUT = "5m"
local OAUTH_CONNECTOR_CONTRACT = "kickside.oauth:connector"
local CALLBACK_TOPIC = "oauth_callback"

local function current_runtime_identity()
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, "security actor and scope are required"
    end
    return actor, scope, nil
end

local function run(args)
    if not args or not args.state_token or not args.connection_data or not args.connector_info then
        return
    end

    local state_token = args.state_token
    local connection_data = args.connection_data
    local connector_info = args.connector_info
    local provider_name = connection_data.provider_name

    -- Register process
    local registry_name = callback_names.NEGOTIATOR_PREFIX .. state_token
    local registered, register_err = process.registry.register(registry_name, nil, process.registry.CONSISTENT)
    if register_err or not registered then
        return nil, register_err or errors.new({ kind = errors.UNAVAILABLE,
            message = "OAuth callback name registration failed" })
    end

    -- Set up channels
    local inbox = process.inbox()
    local events = process.events()
    local timeout_channel = time.after(NEGOTIATION_TIMEOUT)

    -- Wait for callback or timeout
    local result = channel.select({
        inbox:case_receive(),
        events:case_receive(),
        timeout_channel:case_receive()
    })

    -- Always unregister
    local removed, remove_err = process.registry.unregister(registry_name, process.registry.CONSISTENT)
    if not removed and not remove_err then
        remove_err = errors.new({ kind = errors.UNAVAILABLE,
            message = "OAuth callback name release failed" })
    end

    if result.channel == timeout_channel or result.channel == events then
        return nil, remove_err
    end

    -- Handle callback
    local message = result.value
    local reply_to = message:from()

    local function send_response(response_data)
        if reply_to then
            local _, reply_err = callback_reply.send(tostring(reply_to), response_data)
            if reply_err then
                return nil, remove_err and errors.wrap(reply_err, tostring(remove_err)) or reply_err
            end
        end
        return nil, remove_err
    end

    if message:topic() ~= CALLBACK_TOPIC then
        return nil, remove_err
    end

    local callback_data = message:payload():data()

    local actor, scope, security_err = current_runtime_identity()
    if security_err then
        return send_response({
            success = false,
            error = security_err
        })
    end

    -- Validate callback data
    if not callback_data.code or not callback_data.state then
        return send_response({
            success = false,
            error = "Invalid callback data"
        })
    end

    if callback_data.state ~= state_token then
        return send_response({
            success = false,
            error = "State token mismatch"
        })
    end

    -- Check OAuth errors. A missing query parameter can arrive as "" in the
    -- runtime, and Lua treats "" as truthy.
    if callback_data.error and callback_data.error ~= "" then
        return send_response({
            success = false,
            error = "OAuth provider error: " .. callback_data.error,
            oauth_error = true
        })
    end

    -- Get OAuth contract
    local oauth_contract, err = contract.get(OAUTH_CONNECTOR_CONTRACT)
    if err then
        return send_response({
            success = false,
            error = "Failed to get OAuth contract: " .. err
        })
    end

    -- Open OAuth instance
    local oauth_instance, err = oauth_contract
        :with_actor(actor)
        :with_scope(scope)
        :with_context(connector_info.context_values)
        :open(connector_info.implementation_id :: string)
    if err then
        return send_response({
            success = false,
            error = "Failed to open OAuth implementation: " .. err
        })
    end

    -- Handle callback
    local callback_result, err = oauth_instance:handle_callback({
        code = callback_data.code,
        state = callback_data.state,
        stored_data = connection_data.oauth_data
    })

    if err then
        return send_response({
            success = false,
            error = "OAuth callback failed: " .. err
        })
    end

    if not callback_result.success then
        return send_response({
            success = false,
            error = callback_result.error or "Token exchange failed",
            oauth_error = true
        })
    end

    -- Register component
    local component_id, register_err = connection_manager.register_authorized_connection({
        component_id = connection_data.component_id :: string,
        oauth_connection = callback_result.oauth_connection,
        user_context = callback_result.user_context,
        provider_name = provider_name :: string,
        connection_name = connection_data.connection_name :: string,
        connection_description = connection_data.connection_description :: string?,
    })

    if register_err then
        return send_response({
            success = false,
            error = register_err
        })
    end

    -- Send success response
    return send_response({
        success = true,
        component_id = component_id
    })
end

return { run = run }
