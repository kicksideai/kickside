local process = require("process")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local contract = require("contract")
local component = require("component")
local execution_ref = require("execution_ref")
local witness = require("channel_receive_witness")
local hub_signal = require("hub_signal")

local M = {}

local function denied(message)
    return errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false })
end

local function unavailable(message)
    return errors.new({ message = message, kind = errors.UNAVAILABLE, retryable = true })
end

-- request asks the hub to publish one thread write for a bridge's admitted
-- turn, with the token the hub issued the bridge at spawn.
function M.request(key, turn_ref, method, args, bridge_token)
    local topic = "kickside.channel.publish:" .. uuid.v7()
    local replies, listen_err = process.listen(topic)
    if listen_err or not replies then return nil, listen_err or unavailable("publication reply channel is unavailable") end
    local sent, send_err = hub_signal.send({ kind = "publish", key = key, turn_ref = turn_ref, method = method,
        args = args, reply_topic = topic, bridge_token = bridge_token })
    if send_err or not sent then process.unlisten(replies); return nil, send_err or unavailable("publication request does not send") end
    local deadline = time.after("10s")
    local selected = channel.select({ replies:case_receive(), deadline:case_receive() })
    process.unlisten(replies)
    if selected.channel == deadline then
        return nil, errors.new({ message = "channel publication acknowledgement times out", kind = errors.UNAVAILABLE, retryable = true })
    end
    local response = selected.value
    if type(response) ~= "table" then return nil, denied("invalid channel publication acknowledgement") end
    if response.error then
        return nil, errors.new({ message = response.error, kind = response.kind or errors.INTERNAL, retryable = response.retryable == true })
    end
    if response.result == nil then return nil, unavailable("publication returns no result") end
    return response.result, nil
end

local function publish_route(route, request)
    local frame, resolve_err = execution_ref.resolve(route.execution_ref, route.thread.role, route)
    if resolve_err or not frame then return nil, resolve_err or denied("publication identity is unavailable") end
    local args = request.args
    if type(args) ~= "table" then return nil, denied("publication arguments are required") end
    local def, get_err = contract.get("kickside.core:threads")
    if get_err or not def then return nil, get_err or unavailable("threads contract is unavailable") end
    local actor_bound, actor_err = def:with_actor(frame.actor)
    if actor_err or not actor_bound then return nil, actor_err or denied("threads writer actor does not bind") end
    local threads, open_err = actor_bound:open()
    if open_err or not threads then return nil, open_err or unavailable("threads writer is unavailable") end
    local target
    if request.method == "append_event" then
        target = args.thread_id
        local scope_bound, scope_err = actor_bound:with_scope(frame.scope)
        if scope_err or not scope_bound then return nil, scope_err or denied("threads reader scope does not bind") end
        local reader, reader_err = scope_bound:open()
        if reader_err or not reader then return nil, reader_err or unavailable("threads reader is unavailable") end
        local thread, find_err = reader:find({ thread_id = target })
        if find_err or not thread then return nil, find_err or denied("conversation thread is unavailable") end
        local attrs = thread.attrs
        if type(attrs) ~= "table" or attrs.external_ref ~= route.key
            or thread.thread_class ~= route.thread.class then
            return nil, denied("publication target does not match its conversation")
        end
    elseif request.method == "emit" then
        target = args.component_id
        if target ~= route.start.component_id then
            return nil, denied("publication target does not match its responder")
        end
    else
        return nil, denied("publication method is not allowed")
    end
    local allowed, access_err = component.validate_principal_access(target, component.ACCESS.WRITE,
        frame.principal, frame.meta.security_groups, frame.meta.access_filter)
    if access_err or allowed ~= true then return nil, access_err or denied("publication principal has no target WRITE") end
    return threads[request.method](threads, args)
end

function M.publish(bridge, request, sender)
    local bridge_admitted = type(bridge) == "table" and sender ~= nil and bridge.pid == sender
        and type(bridge.token) == "string" and bridge.token == request.bridge_token
    if not bridge_admitted then return nil, denied("publication is outside its admitted bridge") end
    local route, load_err = execution_ref.load_turn(request.turn_ref)
    if load_err or not route then return nil, load_err or denied("publication turn is unavailable") end
    if route.key ~= request.key then return nil, denied("publication does not match its admitted conversation") end
    if type(request.args) ~= "table" then return nil, denied("publication arguments are required") end
    if route.session_id ~= bridge.session_id then return nil, denied("publication does not match its admitted session") end
    if request.method == "emit" and request.args.component_id ~= bridge.component_id then
        return nil, denied("publication target does not match its responder")
    end
    return publish_route(route, request)
end

-- write publishes the declined-message witness inbound of an accepted witness
-- turn from the ingress writer, which resolves the turn's identity itself.
function M.write(key, turn_ref, method, args)
    local route, load_err = execution_ref.load_turn(turn_ref)
    if load_err or not route then return nil, load_err or denied("publication turn is unavailable") end
    if route.key ~= key then return nil, denied("publication does not match its admitted conversation") end
    if route.delivery ~= "witness" or method ~= "append_event" or type(args) ~= "table"
        or type(args.event) ~= "table" or args.event.type ~= route.thread.inbound_event then
        return nil, denied("ingress publication is outside its admitted inbound")
    end
    return publish_route(route, { method = method, args = args })
end

function M.witness(turn_ref)
    local route, load_err = execution_ref.load_turn(turn_ref)
    if load_err or not route then return false, load_err or denied("witness turn is unavailable") end
    if route.delivery ~= "witness" then return false, denied("turn does not admit a declined-message witness") end
    return witness.record(route.inbound, route.execution_ref, function(value)
        return type(value) == "string" and value or ""
    end, function(method, args) return publish_route(route, { method = method, args = args }) end)
end

function M.response(result, err)
    if err == nil then return { result = result } end
    local typed = type(err) == "userdata"
    return { error = tostring(err), kind = typed and err:kind() or errors.INTERNAL,
        retryable = typed and err:retryable() or false,
        details = typed and err:details() or nil }
end

return M
