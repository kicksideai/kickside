-- Shared kickside.data:writable sink request helpers: input trim, the writing
-- origin every request names, and the DataError failure envelope every sink
-- answers with.
local M = {}

function M.trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

function M.fail(message: string, code: string?, retriable: boolean?, scope: string?, details: any?): any
    return { success = false, error = { code = code or "invalid_request", message = tostring(message),
        retriable = retriable == true, scope = scope or "item", details = details } }
end

-- origin(req) -> the writing origin a request names, or the failure envelope
-- of a request that names none or names an origin other than its
-- automation_ref's automation.
function M.origin(req: any): (string?, any)
    local r = type(req) == "table" and req or {}
    local origin = M.trim(r.origin)
    if origin == "" then return nil, M.fail("origin is required: the writing automation's id") end
    local ref = type(r.automation_ref) == "table" and r.automation_ref or nil
    if ref ~= nil and M.trim(ref.id) ~= origin then
        return nil, M.fail("origin " .. origin .. " is not the automation_ref automation " .. M.trim(ref.id))
    end
    return origin, nil
end

return M
