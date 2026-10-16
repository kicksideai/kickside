local security = require("security")
local execution_identity = require("execution_identity")
local component = require("component")

local M = {}

local function copy_principal(principal)
    assert(type(principal) == "table", "execution identity has no principal")
    return { kind = principal.kind, id = principal.id }
end

local function copy_identity(identity)
    assert(type(identity) == "table", "execution identity is missing")
    return {
        version = identity.version,
        principal = copy_principal(identity.principal),
        authorized_by = copy_principal(identity.authorized_by),
        component_id = identity.component_id,
        credential_id = identity.credential_id,
        link_id = identity.link_id,
        captured_at = identity.captured_at,
    }
end

-- Invoke this function through execution_identity.run_as with an admitted
-- identity. It proves the native bound frame retains that admission when a
-- nested owner captures more deferred work.
function M.capture()
    local actor = assert(security.actor(), "execution frame has no actor")
    local identity, capture_err = execution_identity.capture()
    assert(not capture_err, tostring(capture_err))
    return { actor_id = actor:id(), identity = copy_identity(identity) }
end

-- The receipt reads the persisted protected identity through Component's
-- existing owner API so the smoke scenario can assert adoption did not erase
-- credential or external-link restrictions.
function M.component_identity(input)
    assert(type(input) == "table" and type(input.component_id) == "string" and input.component_id ~= "",
        "component_id is required")
    local receipt, receipt_err = component.get_identity_receipt(input.component_id)
    assert(not receipt_err, tostring(receipt_err))
    return {
        component_id = receipt.component_id,
        identity_generation = receipt.identity_generation,
        identity_hash = receipt.identity_hash,
        identity = copy_identity(receipt.execution_identity),
    }
end

return M
