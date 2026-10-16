local test = require("test")
local hooks = require("hooks")
local fixture = require("fixture")
local absent_and_invalid = {{name = "missing"}, {name = "false", value = false},
    {name = "true", value = true}, {name = "number", value = 42},
    {name = "empty", value = ""}, {name = "table", value = {}}}
local non_tables = {{name = "false", value = false}, {name = "true", value = true},
    {name = "number", value = 42}, {name = "string", value = "entry"}}
local function check(stage: string, value: any, field: string, module_owner: boolean?)
    fixture.reset(stage, nil, true, value)
    if module_owner then fixture.owners = {{id = "fixture:owner", meta = {module = "fixture"}}} end
    local ok, report, err = pcall(hooks.run)
    test.is_true(ok)
    if report then
        test.eq(report.deleted, 0)
        test.eq(#report.failures, 1)
        test.eq(report.failures[1].owner, "fixture:owner")
        err = report.failures[1].error
        test.eq(err:details().owner, "fixture:owner")
    end
    test.is_true(errors.is(err, errors.INTERNAL))
    test.eq(err:retryable(), false)
    test.eq(err:details().code, "retention_owner_discovery_response")
    test.eq(err:details().field, field)
    test.eq(fixture.calls, stage == "response" and 1 or 0)
    test.eq(fixture.releases, (stage == "response" or stage == "rows") and 1 or 0)
end
return {run = test.run_cases(function()
    test.describe("permanent native retention owner validation failures", function()
        for _, input in ipairs(absent_and_invalid) do
            test.it("owner id/" .. input.name, function()
                check("owners", {{id = input.value}}, "retention.owner.id")
            end)
            if input.name ~= "missing" then
                test.it("owner module/" .. input.name, function()
                    check("owners", {{id = "fixture:owner", meta = {module = input.value}}}, "retention.owner.module")
                end)
            end
            test.it("migration id/" .. input.name, function()
                check("migrations", {{id = input.value, meta = {target_db = "app:db"}}}, "retention.owner_migrations[]", true)
            end)
            test.it("migration target/" .. input.name, function()
                check("migrations", {{id = "fixture:migration", meta = {target_db = input.value}}}, "retention.owner_migrations[]", true)
            end)
            test.it("ledger id/" .. input.name, function()
                check("rows", {{id = input.value}}, "retention.migration_ids[].id")
            end)
            test.it("blocked component/" .. input.name, function()
                check("response", {success = true, deleted = 0, blocked = {{component_id = input.value,
                    error = errors.new({kind = errors.CONFLICT, message = "blocked"})}}}, "retention.owner.blocked[]")
            end)
            test.it("blocked error/" .. input.name, function()
                check("response", {success = true, deleted = 0, blocked = {{component_id = "component", error = input.value}}}, "retention.owner.blocked[]")
            end)
        end
        for _, input in ipairs(non_tables) do
            test.it("owner metadata/" .. input.name, function()
                check("owners", {{id = "fixture:owner", meta = input.value}}, "retention.owner.meta")
            end)
            test.it("migration entry/" .. input.name, function()
                check("migrations", {input.value}, "retention.owner_migrations[]", true)
            end)
            test.it("ledger entry/" .. input.name, function()
                check("rows", {input.value}, "retention.migration_ids[].id")
            end)
            test.it("blocked report/" .. input.name, function()
                check("response", {success = true, deleted = 0, blocked = input.value}, "retention.owner.blocked")
            end)
            test.it("blocked entry/" .. input.name, function()
                check("response", {success = true, deleted = 0, blocked = {input.value}}, "retention.owner.blocked[]")
            end)
        end
        test.it("owner definition is absent", function()
            check("definitions", {}, "retention.owner.namespace")
        end)
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
            {name = "true", value = true}, {name = "number", value = 42}, {name = "string", value = "result"},
            {name = "table", value = {}}}) do
            test.it("owner result/" .. input.name, function()
                check("response", input.value, "retention.owner.result")
            end)
        end
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
            {name = "true", value = true}, {name = "negative", value = -1}, {name = "fraction", value = 0.5},
            {name = "string", value = "0"}, {name = "table", value = {}}}) do
            test.it("owner deleted count/" .. input.name, function()
                check("response", {success = true, deleted = input.value}, "retention.owner.result")
            end)
        end
        for _, input in ipairs({{name = "number", value = 1}, {name = "string", value = "true"}, {name = "table", value = {}}}) do
            test.it("owner success flag/" .. input.name, function()
                check("response", {success = input.value, deleted = 0}, "retention.owner.result")
            end)
        end
        for _, value in ipairs({{success = true, deleted = 0}, {success = true, deleted = 2},
            {success = true, deleted = 0, blocked = {}},
            {success = true, deleted = 0, blocked = {{component_id = "component",
                error = errors.new({kind = errors.CONFLICT, retryable = false, message = "blocked",
                    details = {code = "eligibility", nested = {id = "component"}}})}}}}) do
            test.it("retains a valid count and blocked report/" .. tostring(value.deleted) .. "/" .. tostring(value.blocked ~= nil) .. "/" .. tostring(value.blocked and #value.blocked or 0), function()
                fixture.reset("response", nil, true, value)
                local report, err = hooks.run()
                test.is_nil(err)
                test.eq(report.deleted, value.deleted)
                test.eq(#report.failures, 0)
                test.eq(fixture.calls, 1)
                test.eq(fixture.releases, 1)
                if value.blocked and #value.blocked > 0 then
                    test.eq(#report.blocked, 1)
                    test.eq(report.blocked[1].owner, "fixture:owner")
                    test.is_true(errors.is(report.blocked[1].error, errors.CONFLICT))
                    test.eq(report.blocked[1].error:retryable(), false)
                    test.eq(report.blocked[1].error:details().code, "eligibility")
                    test.eq(report.blocked[1].error:details().nested.id, "component")
                end
            end)
        end
        test.it("retains an empty owner collection", function()
            fixture.reset("owners", nil, true, {})
            local report, err = hooks.run()
            test.is_nil(err)
            test.eq(report.deleted, 0)
            test.eq(#report.failures, 0)
            test.eq(fixture.calls, 0)
        end)
        test.it("does not require a database target from another namespace", function()
            fixture.reset("migrations", nil, true, {{id = "other:migration"}})
            local report, err = hooks.run()
            test.is_nil(err)
            test.eq(report.deleted, 1)
            test.eq(#report.failures, 0)
            test.eq(fixture.calls, 1)
            test.eq(fixture.gets, 0)
        end)
    end)
end)}
