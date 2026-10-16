local strategy_reference = require("strategy_reference")
local M = {}

-- none passes the input record through unchanged (the pass-through rule for
-- empty mappings). A nil input maps to absent; false is a value.
function M.apply(config: any, env: any): (any, string?, string?)
    local e = type(env) == "table" and env or {}
    return (e :: { [string]: any }).input, nil, nil
end

-- describe declares no resource reference: the strategy is pure.
function M.describe(_config: any): ({ any }?, string?)
    return {}, nil
end

M.bind_apply, M.bind_describe = strategy_reference.binding(M)

return M
