local M: { [string]: any } = {}
function M.get(id: string): (any?, any?)
    if id == "kickside.core:read_models" and M.mode == "open" then return nil, M.failure end
    local definition: any = {}
    function definition:with_actor() return self end
    function definition:with_scope() return self end
    function definition:open()
        return {
            find = function() return { thread = { id = "scoped-inbox" } }, nil end,
            get = function() return nil, M.failure end,
        }, nil
    end
    return definition, nil
end
return M
