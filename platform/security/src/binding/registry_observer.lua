local trigger_reconcile = require("trigger_reconcile")

-- Keeper calls registry observers after it applies a changeset and before the
-- changeset request returns, so a module install or update answers only after
-- its policies are projected into the security scopes.
local function run(args)
    local request_id = type(args) == "table" and tostring(args.request_id or "") or ""
    local stats, err = trigger_reconcile.trigger({source = "registry.observer"})
    if err then
        return nil, errors.wrap(err, "scope projection did not finish after registry changeset " .. request_id)
    end
    return stats, nil
end

return {run = run}
