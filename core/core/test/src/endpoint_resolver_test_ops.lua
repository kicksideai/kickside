-- Test-only helper: dispatch an endpoint write through the resolver from inside a
-- funcs:call frame so the resolver's thread branch inherits the call's actor/scope
-- ambiently (the same way an automation invokes it at runtime). Registered as a
-- function entry the endpoint_resolver_test calls via funcs.new():with_actor():call.

local resolver = require("endpoint_resolver")

local M = {}

function M.write(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    return resolver.write(args.endpoint, args.body, args.owning)
end

return M
