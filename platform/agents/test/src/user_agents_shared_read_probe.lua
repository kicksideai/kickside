-- Test-only probe that drives user_agents.get / user_agents.update under the
-- calling actor, so a suite can exercise the access gates as different users.

local user_agents = require("user_agents")

local function run(args: any): any
    args = type(args) == "table" and args or {}
    local component_id = tostring(args.component_id or "")
    local op = tostring(args.op or "get")

    if op == "get" then
        return { ok = true, result = user_agents.get(component_id) }
    elseif op == "update" then
        local patch = type(args.patch) == "table" and args.patch or {}
        local result, failure = user_agents.update(component_id, patch)
        return { ok = true, result = result, error = failure and tostring(failure), kind = failure and failure:kind() }
    end
    return { ok = false, error = "unknown op: " .. op }
end

return { run = run }
