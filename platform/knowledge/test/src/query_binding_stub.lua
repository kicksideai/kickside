local M = { result = { success = true, items = { { id = "third", content = "full", meta = {} } }, count = 1, next_offset = 3 } }
local definition = {}
definition.with_actor = function() return definition end
definition.with_scope = function() return definition end
definition.open = function()
    return { query = function(_, request) M.request = request; return M.result end }
end
M.get = function() return definition end
return M
