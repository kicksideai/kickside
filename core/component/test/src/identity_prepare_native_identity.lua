local native = require("native")
local fixture = require("fixture")
local M: any = {}
for key, value in pairs(native) do M[key] = value end
function M.capture(input)
    fixture.captures = fixture.captures + 1
    return {version = 2, principal = input.principal, authorized_by = {kind = "user", id = "user-1"},
        component_id = input.component_id, captured_at = "2026-01-01T00:00:00Z"}, nil
end
return M
