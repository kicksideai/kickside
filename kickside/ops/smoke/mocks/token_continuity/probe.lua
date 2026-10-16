local http = require("http")
local security = require("security")

local function decisions(scope, actor)
    local result = {}
    for _, resource in ipairs({"retained", "removed", "added"}) do
        result[resource] = scope:evaluate(actor, "smoke.continuity",
            "kickside.users.continuity:" .. resource) == "allow"
    end
    return result
end

local function handler()
    local actor = assert(security.actor())
    local live = assert(security.named_scope("app.security:user"))
    local result = {
        saved = decisions(assert(security.scope()), actor),
        live = decisions(live, actor),
    }
    if http.request():query("policy_ids") == "1" then
        result.policy_ids = {}
        for _, policy in ipairs(live:policies()) do
            result.policy_ids[#result.policy_ids + 1] = tostring(policy:id())
        end
        table.sort(result.policy_ids)
    end
    http.response():write_json(result)
end

return {handler = handler}
