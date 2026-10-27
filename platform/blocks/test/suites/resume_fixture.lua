local destination = require("destination")
local M = {ids = destination.ids, failure = destination.failure}
type Map = { [string]: any }
M.state = {} :: Map

function M.get(): (any?, any?)
    if M.state.stage == "get" then return nil, M.state.failure end
    if M.state.dataflow_id then
        local flow, err = destination.get(M.state.dataflow_id)
        if err then return nil, err end
        if M.state.metadata then flow.metadata = M.state.metadata end
        return flow, nil
    end
    return { actor_id = M.state.actor and M.state.actor:id() or "blocks-owner", actor_context = {}, metadata = M.state.metadata or {} }, nil
end

function M.pending(): (any?, any?)
    if M.state.stage == "pending" then return nil, M.state.failure end
    return { node_id = "wait-node" }, nil
end

function M.reconstruct(): (any?, any?, any?)
    if M.state.stage == "identity" then return nil, nil, M.state.failure end
    return M.state.actor, M.state.scope, nil
end

function M.new(): (any?, any?)
    if M.state.stage == "new" then return nil, M.state.failure end
    local executor: any = {}
    function executor:with_actor(): any return self end
    function executor:with_scope(): any return self end
    function executor:call(): (any?, any?)
        if M.state.stage == "call" then return nil, M.state.failure end
        return { ok = true, commit_id = "commit-1" }, nil
    end
    function executor:signal(): (any?, any?)
        if M.state.stage == "signal" then return nil, M.state.failure end
        return { commit_id = "commit-1" }, nil
    end
    return executor, nil
end

function M.call(): (any?, any?) return M.state.handler_result, M.state.failure end
return M
