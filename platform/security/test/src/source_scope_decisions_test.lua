-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")

local cases = {
    {name = "combines split native grants", rules = {
        {actions = "read", resources = {"a", "b"}, effect = "allow"},
        {actions = "write", resources = "a", effect = "allow"},
        {actions = "write", resources = "b", effect = "allow"}},
        checks = {{"read", "a", "allow"}, {"write", "b", "allow"}, {"delete", "a", "undefined"}}},
    {name = "retains wildcard exclusions", rules = {
        {actions = "*", resources = "*", effect = "allow", conditions = {{field = "action", operator = "nin", value = {"private.read"}}}}},
        checks = {{"public.read", "a", "allow"}, {"private.read", "a", "undefined"}}},
    {name = "combines conditional wildcard and explicit grants", rules = {
        {actions = "*", resources = "*", effect = "allow", conditions = {{field = "action", operator = "nin", value = {"private.read"}}}},
        {actions = "private.read", resources = "a", effect = "allow"}},
        checks = {{"private.read", "a", "allow"}, {"private.read", "b", "undefined"}}},
    {name = "uses native action prefix matching", rules = {{actions = "tools.*", resources = "a", effect = "allow"}},
        checks = {{"tools.read", "a", "allow"}, {"toolshed.read", "a", "allow"}, {"tool.read", "a", "undefined"}}},
    {name = "retains actor constraints", rules = {{actions = "read", resources = "a", effect = "allow",
        conditions = {{field = "actor.id", operator = "eq", value = "selected"}}}},
        checks = {{"read", "a", "allow", "selected"}, {"read", "a", "undefined", "other"}}},
    {name = "keeps resource prefix boundaries", rules = {{actions = "read", resources = "documents:*", effect = "allow"}},
        checks = {{"read", "documents:one", "allow"}, {"read", "documents_extra:one", "undefined"}, {"write", "documents:one", "undefined"}}},
    {name = "keeps native deny precedence", rules = {{actions = "*", resources = "*", effect = "allow"},
        {actions = "read", resources = "a", effect = "deny"}},
        checks = {{"read", "a", "deny"}, {"write", "a", "allow"}, {"read", "b", "allow"}}},
}
return {run = test.run_cases(function()
    test.describe("native source policy decisions", function()
        for index, case in ipairs(cases) do
            test.it(case.name, function()
                local original = assert(registry.current_version())
                local changes = assert(registry.snapshot()):changes()
                local ids = {}
                for i, rule in ipairs(case.rules) do
                    local id = "app:source_decision_" .. index .. "_" .. i
                    ids[#ids + 1] = id
                    changes:create({id = id, kind = "security.policy", data = {policy = rule}})
                end
                test.not_nil(assert(changes:apply()))
                local ok, failure = pcall(function()
                    local policies = {}
                    for _, id in ipairs(ids) do policies[#policies + 1] = assert(security.policy(id)) end
                    local scope = assert(security.new_scope(policies))
                    test.eq(#scope:policies(), #ids)
                    for _, check in ipairs(case.checks) do
                        local actor = assert(security.new_actor(check[4] or "member"))
                        test.eq(scope:evaluate(actor, check[1], check[2]), check[3])
                    end
                end)
                test.is_true(assert(registry.apply_version(original)))
                if not ok then error(failure) end
            end)
        end
    end)
end)}
