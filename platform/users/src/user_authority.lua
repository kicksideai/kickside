local M = {}
function M.epochs(user)
    local generation = user.delegation_generation == nil and 0 or tonumber(user.delegation_generation)
    if generation == nil or generation < 0 or generation ~= math.floor(generation) then
        return nil, errors.new({message = "invalid delegated authority generation", kind = errors.UNAVAILABLE,
            retryable = true, details = {error_kind = "infrastructure"}})
    end
    return {["kickside.users:" .. user.user_id] = generation}, nil
end
function M.initial_epochs(user) return {["kickside.users:" .. user.user_id] = 0} end
return M
