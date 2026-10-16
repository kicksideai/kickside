local M: any = {}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.calls = stage, source, {}
    M.actor_id, M.meta = "user-1", {security_groups = {"group-a", "group-a", "", 42}}
    M.answer = {active = true, groups = {"directory-members", "directory-members", "", 42}}
end
local function result(stage, value)
    M.calls[#M.calls + 1] = stage
    if stage == M.stage then return nil, M.source end
    return value, nil
end
function M.actor()
    return result("actor", {
        id = function() return result("id", M.actor_id) end,
        meta = function() return result("meta", M.meta) end,
    })
end
function M.get(id)
    return result("get", {open = function()
        return result("open", {groups = function(self, input) return result("groups", M.answer) end})
    end})
end
return M
