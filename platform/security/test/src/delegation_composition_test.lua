local scope_writer = require("scope_writer")
local trigger_reconcile = require("trigger_reconcile")
local source_scope = require("source_scope")
local test = require("test")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")
local scopes = require("scopes")
local projection = require("projection")
local owned = {}
local original
local policy = "app:managed_execution_delegation"
local wrapper = "app:delegation_composition_wrapper"

local function invoke(args, grants)
    local policies = {}
    for _, id in ipairs(grants or {"app:delegation_composition_admin"}) do
        policies[#policies + 1] = assert(security.policy(id))
    end
    return funcs.new():with_actor(security.new_actor("configuring-operator", {}))
        :with_scope(security.new_scope(policies)):call("app:delegation_composition_probe", args)
end

local function slug()
    local value = "delegation_composition_" .. uuid.v7():gsub("-", "")
    owned[#owned + 1] = value
    return value
end

return {run = test.run_cases(function()
    test.describe("managed delegation policy composition admission", function()
        local projector
        test.before_all(function() projector = scope_writer.start_projector() end)
        test.after_all(function() scope_writer.stop_projector(projector) end)

        test.before_each(function()
            test.not_nil((trigger_reconcile.trigger()))
            original = assert(registry.current_version())
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = policy, kind = "security.policy", meta = {
                managed_by = "kickside.security", intent = "execution_delegation", private = true},
                data = {policy = {actions = "security.actor.delegate", resources = "*", effect = "allow",
                    conditions = {{field = "resource", operator = "eq", value = "canonical-delegation-resource"}}}}})
            changes:create({id = wrapper, kind = "security.policy", meta = {includes = {policy}},
                data = {policy = {actions = "access", resources = "app:module.endpoint", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
        end)
        test.after_each(function()
            for _, value in ipairs(owned) do test.is_true((scopes.delete(value))) end
            owned = {}
            test.not_nil((trigger_reconcile.trigger()))
            test.is_true((registry.apply_version(original)))
            test.not_nil((trigger_reconcile.trigger()))
        end)
        for _, selected in ipairs({policy, wrapper}) do
            for _, grants in ipairs({{"app:delegation_composition_admin"},
                {"app:delegation_composition_writer"}, {"app:delegation_composition_component_admin"}}) do
                test.it("RA-H06 refuses managed attachment of " .. selected .. " with " .. grants[1], function()
                    local value = slug()
                    local row, err = invoke({slug = value, policies = {selected}}, grants)
                    test.is_nil(row)
                    test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                    test.eq(err:retryable(), false)
                    test.is_nil((scopes.get(value)))
                end)
            end
        end
        test.it("RA-H06 native Security administration plus policy-write authority permits attachment", function()
            local value = slug()
            local row, err = invoke({slug = value, policies = {wrapper}},
                {"app:delegation_composition_admin", "app:delegation_composition_writer"})
            test.is_nil(err)
            test.not_nil(row)
            test.not_nil((trigger_reconcile.trigger()))
            local group = assert(source_scope.resolve("kickside.security.scopes:" .. value))
            test.eq(group:evaluate(security.new_actor("operator"), "security.actor.delegate",
                "canonical-delegation-resource"), "allow")
            test.eq(group:evaluate(security.new_actor("operator"), "security.actor.delegate",
                "different-root-resource"), "undefined")
        end)
        for _, operation in ipairs({"replace", "delete"}) do
            test.it("RA-H06 refuses " .. operation .. " of an attached managed policy without policy-write authority", function()
                local value = slug()
                test.not_nil((scopes.upsert({slug = value, policies = {policy}}, "test-admin")))
                local result, err = invoke({slug = value, policies = {}, operation = operation})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                test.eq(assert(scopes.get(value)).policies[1], policy)
            end)
        end
        for _, operation in ipairs({"replace", "delete"}) do
            test.it("RA-H48 concurrent policy attachment fences a prior " .. operation .. " authorization", function()
                local value = slug()
                test.not_nil((scopes.upsert({slug = value, policies = {}}, "test-admin")))
                local result, err = invoke({slug = value, policies = {"app:module_access"}, operation = operation, race = true})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.CONFLICT))
                test.eq(err:retryable(), true)
                test.eq(err:details().code, "scope_mutation_conflict")
                test.eq(assert(scopes.get(value)).policies[1], policy)
            end)
        end
        for _, selected in ipairs({policy, wrapper}) do
            test.it("RA-H06 entry-scoped native policy-write authority permits managed attachment through " .. selected, function()
                local value = slug()
                local row, err = invoke({slug = value, policies = {selected}},
                    {"app:delegation_composition_admin", "app:delegation_composition_scoped_writer"})
                test.is_nil(err)
                test.not_nil(row)
                local removed, remove_err = invoke({slug = value, operation = "delete"},
                    {"app:delegation_composition_admin", "app:delegation_composition_scoped_writer"})
                test.is_nil(remove_err)
                test.is_true(removed)
            end)
        end
        test.it("RA-H06 native write authority for another policy cannot attach a managed source", function()
            local value = slug()
            local row, err = invoke({slug = value, policies = {policy}},
                {"app:delegation_composition_admin", "app:delegation_composition_other_writer"})
            test.is_nil(row)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.is_nil((scopes.get(value)))
        end)
        test.it("RA-C12 ordinary policy composition keeps existing endpoint-only administration", function()
            local value = slug()
            local row, err = invoke({slug = value, policies = {"app:module_access"}})
            test.is_nil(err)
            test.not_nil(row)
            local deleted, delete_err = invoke({slug = value, operation = "delete"})
            test.is_nil(delete_err)
            test.is_true(deleted)
        end)
        for _, operation in ipairs({"replace", "delete"}) do
            test.it("RA-C12 " .. operation .. " retains cleanup after a policy source disappears", function()
                test.not_nil((trigger_reconcile.trigger()))
                local changes = assert(registry.snapshot()):changes()
                local source = {id = "app:withdrawn_composition_source", kind = "security.policy",
                    data = {policy = {actions = "access", resources = "app:module.endpoint", effect = "allow"}}}
                changes:create(source)
                test.is_nil(select(2, changes:apply()))
                local value = slug()
                test.not_nil((scopes.upsert({slug = value, policies = {"app:withdrawn_composition_source"}}, "test-admin")))
                test.not_nil((trigger_reconcile.trigger()))
                changes = assert(registry.snapshot()):changes()
                changes:delete("app:withdrawn_composition_source")
                test.is_nil(select(2, changes:apply()))
                local result, err = invoke({slug = value, policies = {}, operation = operation})
                test.not_nil((trigger_reconcile.trigger()))
                changes = assert(registry.snapshot()):changes()
                changes:create(source)
                test.is_nil(select(2, changes:apply()))
                test.is_nil(err)
                test.not_nil(result)
                if operation == "delete" then test.is_nil((scopes.get(value)))
                else test.eq(#assert(scopes.get(value)).policies, 0) end
            end)
        end
        test.it("RA-C12 existing unmanaged delegation policy composition stays unchanged", function()
            test.not_nil((trigger_reconcile.trigger()))
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = "app:legacy_delegation", kind = "security.policy",
                data = {policy = {actions = "security.actor.delegate", resources = "legacy", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            local row, err = invoke({slug = slug(), policies = {"app:legacy_delegation"}})
            test.is_nil(err)
            test.not_nil(row)
        end)
    end)
end)}
