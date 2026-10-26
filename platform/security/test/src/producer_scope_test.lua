local scope_writer = require("scope_writer")
local trigger_reconcile = require("trigger_reconcile")
local source_scope = require("source_scope")
local test = require("test")
local security = require("security")
local catalog = require("scope_catalog")
local store = require("scope_store")
local projection = require("scope_projection")

local function define_tests()
    test.describe("service producer capabilities", function()
        local projector
        test.before_all(function() projector = scope_writer.start_projector() end)
        test.after_all(function() scope_writer.stop_projector(projector) end)

        test.it("admits the module service identity and excludes member groups", function()
            local reconciled, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(reconciled)
            local service, err = source_scope.resolve("app:producer_service")
            test.is_nil(err)
            test.not_nil(service)
            test.eq(service:evaluate(security.new_actor("producer"), "threads.output.publish", "app:producer_event"), "allow")
            for _, group in ipairs({ "app.security:user", "app:declared_members" }) do
                local member, member_err = source_scope.resolve(group)
                test.is_nil(member_err)
                test.not_nil(member)
                test.eq(member:evaluate(security.new_actor("member"), "threads.output.publish", "app:producer_event"), "undefined")
            end
            for _, policy in ipairs(catalog.policies()) do
                test.is_false(policy.id == "app:producer_capability")
            end
        end)
        for _, selected in ipairs({ "app:producer_capability", "app:producer_wrapper" }) do
            test.it("rejects admin composition of " .. selected .. " before storing a member grant", function()
                local slug = "producer_scope_rejection"
                local row, err = store.upsert({ slug = slug, policies = { selected } }, "administrator")
                if row then
                    local deleted, delete_err = store.delete(slug)
                    test.is_nil(delete_err)
                    test.is_true(deleted)
                end
                test.is_nil(row)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "policy_service_only")
                local result, reconcile_err = trigger_reconcile.trigger()
                test.is_nil(reconcile_err)
                test.not_nil(result)
            end)
        end
    end)
end
return { run = test.run_cases(define_tests) }
