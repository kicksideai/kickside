-- The execution identity a component's declared projections run under
-- (IDENTITY-1 §4 T row), derived from the component's owner record and never
-- captured from a caller: the component's stored v2 execution identity, or for a
-- framework-created component that carries none, the framework system identity
-- owned by the maintenance actor recorded as its owner. The thread declaration
-- path reads the owner record through the component service; the component
-- lifecycle reads it inside the component transaction. Both derive here.

local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")

local M = {}

-- of_owner(stored, owner_key) -> ({ row?, system?, owner? }?, err?). stored is
-- the component's stored execution identity (nil when it carries none) and
-- owner_key the actor recorded as its owner. A stored identity that is not
-- valid v2 refuses.
function M.of_owner(stored: any, owner_key: any): ({ [string]: any }?, error?)
    if stored ~= nil then
        local row, row_err = execution_identity.to_row(stored)
        row, row_err = error_envelope.binding(row, row_err, nil,
            "materialize declared execution identity", "declared_identity_row_missing")
        if row_err then return nil, row_err end
        return { row = row }, nil
    end
    if execution_identity.is_maintenance_key(owner_key) then
        return { system = true, owner = owner_key }, nil
    end
    return { system = true }, nil
end

return M
