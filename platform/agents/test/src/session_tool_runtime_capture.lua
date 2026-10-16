local json = require("json")
local message_handlers = require("message_handlers")
local tool_caller = require("tool_caller")

local function fake_reader()
    return {
        state = function()
            return {
                meta = {},
                config = {
                    agent_id = "agent:a",
                    model = "model:a",
                },
            }
        end,
        get_full_context = function()
            return {
                workspace_id = "workspace:one",
            }, nil
        end,
        get_context = function()
            return nil
        end,
    }
end

local function fake_writer(captured: table)
    return {
        add_message = function(self, message_type, data, metadata)
            local id = "msg:" .. tostring(#captured.added + 1)
            captured.added[#captured.added + 1] = {
                id = id,
                type = message_type,
                data = data,
                metadata = metadata,
            }
            return id, nil
        end,
        update_message_meta = function(self, message_id, meta)
            captured.message_meta_updates[#captured.message_meta_updates + 1] = {
                message_id = message_id,
                meta = meta,
            }
            return true, nil
        end,
    }
end

local function fake_upstream()
    return {
        send_message_update = function() end,
    }
end

local function install_tool_schema()
    tool_caller._tools = {
        get_tool_schema = function(registry_id)
            if registry_id ~= "app:delegate_capture" then
                return nil, "unexpected tool " .. tostring(registry_id)
            end
            return {
                id = registry_id,
                name = "capture",
                meta = {},
            }, nil
        end,
    }
end

local function reset_tool_schema()
    tool_caller._tools = nil
end

local function handler()
    install_tool_schema()
    local captured = {
        added = {},
        message_meta_updates = {},
    }
    local ctx = {
        session_id = "session:one",
        user_id = "user:one",
        reader = fake_reader(),
        writer = fake_writer(captured),
        upstream = fake_upstream(),
        config = {
            agent_id = "agent:a",
            model = "model:a",
        },
    }
    local tool_calls = {
        {
            id = "call:one",
            name = "capture",
            registry_id = "app:delegate_capture",
            arguments = {
                message = "hello",
            },
        },
    }
    local host = { kind = "session", session_id = ctx.session_id }
    local agent = { id = ctx.config.agent_id, model = ctx.config.model }
    local caller = tool_caller.new()
    caller:set_wrapper_context({
        host = host,
        agent = agent,
        run_context = {
            contract = "wippy.agent:run_context",
            binding = "wippy.session.run_context:binding",
            host = host,
            agent = agent,
        },
    })
    local validated_tools, validation_err = caller:validate(tool_calls)
    if validation_err then
        reset_tool_schema()
        return nil, validation_err
    end

    local result, err = message_handlers.process_tools(ctx, {
        tool_calls = caller:get_last_tool_calls(),
        call_message_ids = { ["call:one"] = "message:call:one" },
        caller = caller,
        validated_tools = validated_tools,
        agent = agent,
        message_id = "user:message",
        request_id = "request:one",
    })
    reset_tool_schema()

    if err then
        return nil, err
    end

    local update = captured.message_meta_updates[1]
    local payload = update and update.meta and update.meta.result or {}
    if type(payload) == "string" then
        local decoded = json.decode(payload)
        if type(decoded) == "table" then
            payload = decoded
        end
    end

    return {
        completed = result and result.completed,
        next_ops = result and #(result.next_ops or {}),
        tool_actor_id = payload.actor_id,
        tool_workspace_id = payload.workspace_id,
        tool_host_kind = payload.host_kind,
        tool_call_id = payload.call_id,
    }, nil
end

return { handler = handler }
