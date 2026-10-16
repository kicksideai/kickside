-- Agent tool results. Success is any value a tool returns without an error: a
-- record table, a list or a document string, returned as the tool produced it.
-- A failure takes one of two forms: an infrastructure or typed failure returns
-- (nil, err), and a domain outcome returns a structured domain error table
-- { success = false, error = <message>, <structured fields> }.

type Map = { [string]: any }

local M = {}

-- ok(value) returns value unchanged; tools return their value directly and
-- ok remains only until its remaining callers do.
function M.ok(value: any): any
    return value
end

function M.fail(kind: string, message: string, details: Map?): (nil, error)
    return nil, errors.new({ kind = kind, message = message, details = details })
end

function M.domain_error(message: any, fields: Map?): Map
    local out: Map = {}
    for key, value in pairs(fields or {}) do out[key] = value end
    out.success = false
    out.error = tostring(message)
    return out
end

function M.is_domain_error(value: any): boolean
    return type(value) == "table" and (value :: Map).success == false
end

return M
