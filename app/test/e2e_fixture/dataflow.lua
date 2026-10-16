local http = require("http")
local json = require("json")
local security = require("security")
local flow = require("flow")
local client = require("df_client")

local function echo(input)
    return input, nil
end

local function iteration(input)
    return { result = input.input, state = { completed = true }, continue = false }, nil
end

local function handler()
    local req, res = http.request(), http.response()
    res:set_content_type(http.CONTENT.JSON)
    local actor = security.actor()
    if not actor then
        res:set_status(401)
        res:write_json({ error = "authenticated member required" })
        return
    end
    local raw, body_err = req:body()
    if body_err then error(body_err) end
    local body, decode_err = json.decode(raw)
    if decode_err then
        res:set_status(400)
        res:write_json({ error = tostring(decode_err) })
        return
    end
    local c, client_err = client.new()
    if client_err then error(client_err) end
    if body.operation == "signal" then
        local ok, err = c:signal(body.dataflow_id, "member-release", { released = true })
        res:set_status(err and 403 or 200)
        res:write_json({ ok = ok, error = err and tostring(err), actor_id = actor:id() })
        return
    end
    if body.operation == "deny_spawn" then
        local pid, spawn_err = process.spawn("kickside.test.e2e:unrelated", "app:processes")
        if pid then error("member spawns an unrelated process") end
        if not spawn_err then error("spawn denial has no error") end
        res:write_json({ denied = true, error = tostring(spawn_err), actor_id = actor:id() })
        return
    end
    local template = flow.template():func("kickside.test.e2e:echo"):to("@success")
    local builder = flow.create():with_title("Member all-node regression")
        :with_input({ prompt = "Reply with MEMBER-ALL-NODES only.", items = { { n = 1 }, { n = 2 } } })
        :to("agent"):to("cycle"):to("parallel"):to("signal")
        :agent(body.agent_id, { arena = { model = body.model, max_iterations = 2 } }):as("agent"):to("join", "agent")
        :cycle({ func_id = "kickside.test.e2e:iteration", max_iterations = 1 }):as("cycle"):to("join", "cycle")
        :parallel({ source_array_key = "items", template = template, batch_size = 2 }):as("parallel"):to("join", "parallel")
        :signal({ signal_id = "member-release", timeout = "120s" }):as("signal"):to("join", "signal")
        :join({ inputs = { required = { "agent", "cycle", "parallel", "signal" } } }):as("join")
        :func("kickside.test.e2e:echo"):as("function"):to("@success")
    local id, err = builder:start()
    if err then error(err) end
    res:write_json({ dataflow_id = id, actor_id = actor:id() })
end

local function unrelated()
    error("member executes an unrelated process")
end

return { echo = echo, iteration = iteration, handler = handler, unrelated = unrelated }
