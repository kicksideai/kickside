local test_state = require("test_state")
local M = {}

function M.actor()
    return { id = function() return "system:channel-test" end }
end

function M.scope()
    return { id = "app:test" }
end

function M.can(action, _resource)
    if action == "security.actor.create" and test_state.state.actor_create_denied then return false end
    return true
end

function M.new_actor(actor_id, meta)
    return { id = function() return actor_id end, meta = function() return meta end }, nil
end

function M.named_scope(name)
    return { id = name }, nil
end

return M
