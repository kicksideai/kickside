-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local trigger_reconcile = require("trigger_reconcile")

-- Keeper calls before_apply observers with the planned registry operations of a
-- changeset before it applies them. The scope projection plans against that
-- preview, and Keeper applies the returned scope operations in the same
-- registry version, so a module's endpoints and its member access start
-- together. Other callers get no operations.
local function run(args)
    if type(args) ~= "table" or args.phase ~= "before_apply" or type(args.planned) ~= "table"
        or #args.planned == 0 then
        return {ops = {}}, nil
    end
    local reply, err = trigger_reconcile.trigger({source = "registry.before_apply", plan = true,
        planned = args.planned})
    if err then
        return nil, errors.wrap(err, "scope projection plan failed for registry changeset "
            .. tostring(args.request_id or ""))
    end
    return {ops = reply.ops or {}, deferred = reply.deferred == true}, nil
end

return {run = run}
