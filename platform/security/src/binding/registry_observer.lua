local trigger_reconcile = require("trigger_reconcile")

-- Keeper calls registry observers after it applies a changeset and before the
-- changeset request returns, so a module install or update answers only after
-- its policies are projected into the security scopes.
local function run(args)
    local request_id = type(args) == "table" and tostring(args.request_id or "") or ""
    local request = {source = "registry.observer"}
    local result = type(args) == "table" and args.result or nil
    if type(result) == "table" and result.success == true and result.version ~= nil then
        request.observed_registry_version = tostring(result.version)
    end
    local stats, err = trigger_reconcile.trigger(request)
    if err then
        return nil, errors.wrap(err, "scope projection did not finish after registry changeset " .. request_id)
    end
    return stats, nil
end

return {run = run}
