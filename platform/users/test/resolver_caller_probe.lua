local funcs = require("funcs")
local security = require("security")

local function run(args)
    local actor = assert(security.actor())
    local scope = assert(security.scope())
    local before = scope:evaluate(actor, "funcs.call", "kickside.users.binding:subject_lookup")
    local resolved, resolve_err = funcs.call("kickside.users.binding:scope_resolver_func",
        {principal = {kind = "user", id = args.subject_id}})
    local denied, denial = funcs.call("kickside.users.binding:scope_resolver_func",
        {principal = {kind = "user", id = args.other_id}})
    local direct, direct_err = funcs.call("kickside.users.binding:subject_lookup", {subject_id = args.subject_id})
    return {
        resolved = resolved,
        resolve_error = resolve_err and tostring(resolve_err) or nil,
        denied = denied,
        denial_permission = errors.is(denial, errors.PERMISSION_DENIED),
        direct = direct,
        direct_permission = errors.is(direct_err, errors.PERMISSION_DENIED),
        reader_before = before,
        reader_after = scope:evaluate(actor, "funcs.call", "kickside.users.binding:subject_lookup"),
        actor_after = assert(security.actor()):id(),
    }
end

return {run = run}
