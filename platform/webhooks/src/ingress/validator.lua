-- Validates a webhook's inbound payload against the webhook's declared JSON Schema.
-- Delegates to the runtime's native json.validate (full JSON Schema, SHA256-cached).
--
-- The public validate(schema, value) -> (ok, err) seam is what the ingress depends on:
-- an absent / non-table schema accepts anything (the ingress already rejects a
-- non-object body upstream), a conforming payload returns (true, nil), and a mismatch
-- returns (false, message).

local json = require("json")

local M = {}

-- validate(schema, value) -> (ok: boolean, err: string?). An absent or empty schema
-- (the JSON Schema "match anything" case) accepts any value without invoking the
-- validator, which also avoids the empty-table encoding ambiguity.
function M.validate(schema: any, value: any): (boolean, string?)
    if type(schema) ~= "table" or next(schema :: any) == nil then return true, nil end
    local ok, err = json.validate(schema, value)
    if ok then return true, nil end
    return false, tostring(err)
end

return M
