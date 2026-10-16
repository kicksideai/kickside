local agent_context = require("agent_context")

local function run(args)
    args = args or {}
    local ctx = agent_context.new({ enable_cache = false })
    local agent, err = ctx:load_agent(args.agent_id, { model = args.model })
    if not agent then
        return { success = false, error = tostring(err or "agent load failed") }
    end
    return {
        success = true,
        agent = {
            id = agent.id,
            name = agent.name,
            model = agent.model,
        },
        current_agent_id = ctx.current_agent_id,
        current_model = ctx.current_model,
    }
end

return { run = run }
