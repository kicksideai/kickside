local test = require("test")
local registry = require("registry")
local security = require("security")
local projection = require("projection")
local fixture = require("registry_fixture")
local time = require("time")

local function define_tests()
    test.describe("Shared member scope contributions", function()
        test.it("binds opted module policies to the supplied scope without broadening Contract", function()
            test.not_nil((projection.reconcile()))
            local actor = assert(security.new_actor("shared-member", {}))
            local scope = assert(security.named_scope("app:unassigned_endpoints"))
            test.eq(scope:evaluate(actor, "access", "shared.module:list.endpoint"), "allow")
            test.eq(scope:evaluate(actor, "funcs.call", "shared.module:view"), "allow")
            test.eq(scope:evaluate(actor, "access", "shared.module:list.admin.endpoint"), "undefined")
            test.eq(scope:evaluate(actor, "access", "independent.module:list.endpoint"), "undefined")
            local unrelated = assert(security.named_scope("app:declared_members"))
            test.eq(unrelated:evaluate(actor, "access", "shared.module:list.endpoint"), "undefined")
            local baseline = assert(security.policy("kickside.contract.http:user_endpoint_access"))
            test.eq(baseline:evaluate(actor, "access", "shared.module:list.endpoint"), "undefined")
            local declaration, read_err = registry.get("kickside.contract.http:member_scope_composition")
            test.is_nil(read_err)
            test.not_nil(declaration)
            test.eq(#declaration.data.group_ids, 1)
            test.eq(declaration.data.group_ids[1], "app:unassigned_endpoints")
            test.eq(declaration.data.select["meta.member_scope"], "kickside.contract.http:user_security_scope")
        end)
        test.it("composes array bindings and accepts an explicitly empty group list", function()
            local id = "app:shared_scope_array_fixture"
            local applied, apply_err = fixture.apply(function(changes)
                changes:create({id = id, kind = "registry.entry",
                    meta = {type = "kickside.security.group_composition"},
                    data = {group_ids = {"app:shared_scope_left", "app:shared_scope_right"},
                        policies = {"app:shared_member_contributor"}}})
            end, time.now():add(time.SECOND * 5))
            test.is_nil(apply_err)
            test.not_nil(applied)
            local result, reconcile_err = projection.reconcile()
            local decisions = {}
            if result then
                local actor = assert(security.new_actor("shared-member", {}))
                for _, group in ipairs({"app:shared_scope_left", "app:shared_scope_right"}) do
                    decisions[#decisions + 1] = assert(security.named_scope(group)):evaluate(actor,
                        "access", "shared.module:list.endpoint")
                end
            end
            local changed, change_err = fixture.apply(function(changes)
                changes:update({id = id, kind = "registry.entry",
                    meta = {type = "kickside.security.group_composition"},
                    data = {group_ids = {}, policies = {"app:shared_member_contributor"}}})
            end, time.now():add(time.SECOND * 5))
            test.is_nil(change_err)
            local empty_result, empty_err = projection.reconcile()
            local removed, remove_err = fixture.apply(function(changes) changes:delete(id) end,
                time.now():add(time.SECOND * 5))
            test.is_nil(remove_err)
            test.not_nil((projection.reconcile()))
            test.is_nil(reconcile_err)
            test.not_nil(result)
            test.eq(#decisions, 2)
            test.eq(decisions[1], "allow")
            test.eq(decisions[2], "allow")
            test.is_nil(empty_err)
            test.not_nil(empty_result)
        end)
        test.it("retains the existing member default when the host omits the binding", function()
            local requirement = assert(registry.get("kickside.contract.http:user_security_scope"))
            test.eq(requirement.data.default, "kickside.security.groups:members")
        end)
    end)
end

local cases = test.run_cases(define_tests)
return {run = function(options) return cases(options) end}
