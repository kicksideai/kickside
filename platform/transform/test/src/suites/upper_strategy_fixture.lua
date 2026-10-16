-- A test-only transform strategy declared as a kickside.transform:strategy
-- binding: apply upper-cases input.text; it declares no references.
local M = {}

function M.apply(request: any): (any, any)
    local env = type(request) == "table" and request.env or {}
    local input = type(env) == "table" and env.input or nil
    local text = type(input) == "table" and input.text or nil
    if type(text) ~= "string" then return { present = false }, nil end
    return { present = true, value = string.upper(text) }, nil
end

function M.describe(_request: any): (any, any)
    return { references = {} }, nil
end

return M
