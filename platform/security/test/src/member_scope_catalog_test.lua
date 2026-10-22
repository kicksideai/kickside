local scope_writer = require("scope_writer")
local trigger_reconcile = require("trigger_reconcile")
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local store = require("scope_store")
local registry = require("registry")
local scope_catalog = require("scope_catalog")

local LIST = "kickside.security.binding:list_scopes_func"

local function listed(result)
    local ids = {}
    for _, scope in ipairs(result.scopes) do ids[#ids + 1] = scope.id end
    table.sort(ids)
    return table.concat(ids, ",")
end

local function define_tests()
    test.describe("member scope catalog", function()
        local projector
        test.before_all(function() projector = scope_writer.start_projector() end)
        test.after_all(function() scope_writer.stop_projector(projector) end)

        test.it("lists the same assignable scopes for a member who cannot read the selected policies", function()
            local slug = "member_catalog_selection"
            test.not_nil((store.upsert({slug = slug, policies = {"app:module_access"}}, "tester")))
            local ok, failure = pcall(function()
                local member = assert(security.new_scope({assert(security.policy("app:member_catalog_caller"))}))
                local actor = security.new_actor("member-catalog-caller", {})
                test.eq(member:evaluate(actor, "registry.get", "app:module_access"), "undefined")

                local reference, reference_err = funcs.new():with_actor(actor):call(LIST, {})
                test.is_nil(reference_err)
                local result, err = funcs.new():with_actor(actor):with_scope(member):call(LIST, {})
                test.is_nil(err)
                test.not_nil(result)
                test.is_true(listed(result):find("kickside.security.scopes:" .. slug, 1, true) ~= nil)
                test.eq(listed(result), listed(reference))
            end)
            store.delete(slug)
            if not ok then error(failure) end
        end)

        test.it("lists a stored scope whose selected policy an update retired", function()
            local slug = "retired_catalog_selection"
            local retired_id = "app:retired_catalog_before"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = retired_id, kind = "security.policy",
                data = {policy = {actions = "access", resources = "app:retired.catalog", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            test.not_nil((store.upsert({slug = slug, policies = {retired_id, "app:module_access"}}, "tester")))
            local ok, failure = pcall(function()
                changes = assert(registry.snapshot()):changes()
                changes:delete(retired_id)
                test.is_nil(select(2, changes:apply()))

                local scopes, err = scope_catalog.scopes()
                test.is_nil(err)
                local listed_scope
                for _, scope in ipairs(scopes or {}) do
                    if scope.id == "kickside.security.scopes:" .. slug then listed_scope = scope end
                end
                test.not_nil(listed_scope)
                test.eq(#listed_scope.policies, 1)
                test.eq(listed_scope.policies[1].id, "app:module_access")
                test.eq(table.concat(assert(store.get(slug)).policies, ","), retired_id .. ",app:module_access")

                local member = assert(security.new_scope({assert(security.policy("app:member_catalog_caller"))}))
                local result, list_err = funcs.new():with_actor(security.new_actor("member-catalog-caller", {}))
                    :with_scope(member):call(LIST, {})
                test.is_nil(list_err)
                test.is_true(listed(result):find("kickside.security.scopes:" .. slug, 1, true) ~= nil)
            end)
            store.delete(slug)
            if registry.get(retired_id) then
                changes = assert(registry.snapshot()):changes()
                changes:delete(retired_id)
                test.is_nil(select(2, changes:apply()))
            end
            if not ok then error(failure) end
        end)
    end)
end

return {run = test.run_cases(define_tests)}
