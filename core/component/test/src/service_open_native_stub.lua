local M = {calls = {}}

function M.configure(stage, source)
    M.stage, M.source, M.calls = stage, source, {}
end

function M.get(id)
    table.insert(M.calls, "get")
    if M.stage == "get" then return nil, M.source end
    if M.stage == "missing" then return nil, nil end
    return {
        with_actor = function(self, actor)
            table.insert(M.calls, "actor")
            return self
        end,
        with_scope = function(self, scope)
            table.insert(M.calls, "scope")
            return self
        end,
        open = function()
            table.insert(M.calls, "open")
            if M.stage == "open" then return nil, M.source end
            return {service = id}, nil
        end,
    }, nil
end

return M
