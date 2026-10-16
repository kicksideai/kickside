-- Harness deletable cleanup that fails with a typed error whose kind is the
-- component's private context `fail_kind`, so a delete can be checked to carry the
-- cleanup's own classification.
local ctx = require("ctx")

local function handle(_request: any): (any, error?)
    local kind = ctx.get("fail_kind")
    return nil, (errors.new({ message = "harness cleanup failed", kind = tostring(kind) }) :: error)
end

return { handle = handle }
