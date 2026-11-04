local state = require("test_state")
local M = {}
function M.get(key: string): any
    local context = state.state.delete_context or {}
    return context[key], nil
end
function M.delete(id: string, rollback: any, options: any): (any?, error?)
    state.state.delete_call = {id = id, rollback = rollback, options = options}
    if state.state.delete_error then return nil, state.state.delete_error end
    state.state.delete_owned = nil
    return {replayed = 1, removed = {owned = 1}, discarded = {owned = 1}}, nil
end
return M
