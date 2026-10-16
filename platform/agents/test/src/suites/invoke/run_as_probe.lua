local agent_invoke = require("agent_invoke")
local security = require("security")

local function invoke(_args: any): any
    local observed: any = nil
    local result = agent_invoke.write({
        origin = "run-as-agent-invoke",
        config = { agent_id = "agent-1" },
        input = { content = "run" },
    }, {
        can_agent = function() return true end,
        flow = {
            create = function()
                local builder = {}
                function builder:with_title(_title: string): any return self end
                function builder:with_metadata(_metadata: any): any return self end
                function builder:with_input(_input: any): any return self end
                function builder:agent(_agent: any, _config: any): any return self end
                function builder:run(): (any?, any?)
                    local actor = security.actor()
                    observed = actor and actor:meta().execution_identity or nil
                    return { answer = "ok" }, nil
                end
                return builder
            end,
        },
    })
    local actor = security.actor()
    return { success = result.success, error = result.error, actor_id = actor and actor:id() or nil, identity = observed }
end

return { invoke = invoke }
