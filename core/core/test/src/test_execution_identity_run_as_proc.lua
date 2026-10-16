-- Real proc:// caller for the execution-identity argument-boundary regression
-- test. This mirrors the trigger worker's important shape: code executes in a
-- process context, rebuilds an actor from durable columns, then calls a func
-- through execution_identity.run_as.

local execution_identity = require("execution_identity")

local function run(input: any): any
    local i = type(input) == "table" and input or {}
    local identity, ierr = execution_identity.from_row(i.actor_id, i.actor_context)
    if ierr or not identity then error("test proc identity: " .. tostring(ierr)) end
    local result, rerr = execution_identity.run_as(identity, tostring(i.target_id or ""), i.args)
    if rerr then error("test proc run_as: " .. tostring(rerr)) end
    return result
end

return { run = run }
