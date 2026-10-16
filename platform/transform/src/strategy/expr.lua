local strategy_reference = require("strategy_reference")
local expr = require("expr")

local M = {}

-- expr evaluates config.expr once in the single frozen environment. The raw
-- result is returned as is; nil maps to absent and false stays a value.
function M.apply(config: any, env: any): (any, string?, string?)
    local c = type(config) == "table" and config or {}
    local text = tostring((c :: { [string]: any }).expr or "")
    if text == "" then return nil, "expr transform requires expr", "invalid_expression" end
    local out, eerr = expr.eval(text, type(env) == "table" and env or {})
    if eerr ~= nil then return nil, "expr transform failed: " .. tostring(eerr), "invalid_expression" end
    return out, nil, nil
end

-- describe declares no resource reference: the strategy is pure.
function M.describe(_config: any): ({ any }?, string?)
    return {}, nil
end

M.bind_apply, M.bind_describe = strategy_reference.binding(M)

return M
