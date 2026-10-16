local test_state = require("test_state")

local M = {}

function M.trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

function M.normalize(args: any, opts: any): (any?, string?)
    if type(args) ~= "table" then return nil, "invalid inbound" end
    local inbound = {
        provider = M.trim(args.provider),
        reply_component_id = M.trim(args.reply_component_id),
        reply_resource_id = M.trim(args.reply_resource_id),
        channel_id = M.trim(args.channel_id),
        external_message_id = M.trim(args.external_message_id),
        external_user_id = M.trim(args.external_user_id),
        external_username = M.trim(args.external_username),
        external_display_name = M.trim(args.external_display_name),
        text = M.trim(args.text),
    }
    if inbound.provider == "" then return nil, "provider is required" end
    if opts and opts.require_external_user and inbound.external_user_id == "" then
        return nil, "external_user_id is required"
    end
    return inbound, nil
end

function M.session_admission(identity: any): (any?, string?)
    if type(identity) ~= "table" or type(identity.link_id) ~= "string" or identity.link_id == "" then
        return nil, "DM link is required"
    end
    return { owner_id = "channel.session", generation = 1, link_id = identity.link_id,
        identity = identity }, nil
end

function M.route_turn(_inbound: any, spec: any): any
    test_state.set_route(spec)
    return { accepted = true, status = "routed" }
end

function M.accept_notice(inbound: any, principal: any): (any?, string?)
    local route = {
        session_provider = inbound.provider,
        execution_ref = { owner_id = "channel.notice", record_id = inbound.external_message_id, generation = 1 },
        thread = { role = "notice" },
        reply = { component_id = inbound.reply_component_id, resource_id = inbound.reply_resource_id },
        inbound = { external_message_id = inbound.external_message_id },
    }
    test_state.set_accepted({ route = route, principal = principal })
    return { turn_id = "turn-1", provider = inbound.provider,
        connection_id = inbound.reply_component_id,
        external_conversation_id = inbound.reply_resource_id,
        inbound_message_id = inbound.external_message_id,
        reply_op = "send_reply", principal = principal }, nil
end

function M.send_hub(message: any)
    test_state.set_hub_message(message)
end

return M
