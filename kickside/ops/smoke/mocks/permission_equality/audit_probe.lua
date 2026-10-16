local http = require("http")
local security = require("security")
local registry = require("registry")
local funcs = require("funcs")
local json = require("json")

local function decision(value)
    local values = {allow = "A", deny = "D", undefined = "U"}
    assert(values[value], "unknown native decision: " .. tostring(value))
    return values[value]
end

return {run = function()
    local request, response = assert(http.request()), assert(http.response())
    assert(security.can("registry.get", "kickside.users.binding:subject_lookup"), "administrator required")
    if request:query("audit") == "catalog" then
        response:set_content_type(http.CONTENT.JSON)
        response:write_json({entries = assert(registry.find({}))})
        return
    end
    assert(request:query("audit") == "measure", "unknown audit mode")
    local input = assert(json.decode(assert(request:body())))
    assert(type(input.user_id) == "string" and input.user_id ~= "", "user_id is required")
    assert(type(input.pairs) == "table", "pairs is required")
    local row, err = funcs.call("kickside.users.binding:subject_lookup", {subject_id = input.user_id})
    assert(not err, tostring(err))
    assert(row, "subject lookup returns no result")
    if row.error then
        response:set_content_type(http.CONTENT.JSON)
        response:write_json({user_id = input.user_id, subject_refusal = row.error, error_kind = row.error_kind,
            groups = row.groups, policy_ids = {}, rules = {}, decisions = {}})
        return
    end
    local scope = assert(security.named_scope(row.scope_name))
    local actor = assert(security.new_actor(input.user_id, row.meta))
    local ids, rules = {}, {}
    for _, policy in ipairs(scope:policies()) do
        local id = tostring(policy:id())
        ids[#ids + 1] = id
        rules[id] = assert(registry.get(id)).data.policy
    end
    table.sort(ids)
    local decisions = {}
    for _, pair in ipairs(input.pairs) do
        assert(type(pair) == "table" and type(pair.action) == "string"
            and type(pair.resource) == "string", "pair needs action and resource")
        decisions[#decisions + 1] = decision(scope:evaluate(actor, pair.action, pair.resource))
    end
    response:set_content_type(http.CONTENT.JSON)
    response:write_json({user_id = input.user_id, count = #ids, policy_ids = ids, rules = rules,
        scope_name = row.scope_name, groups = row.groups, decisions = decisions})
end}
