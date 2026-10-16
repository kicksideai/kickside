local test = require("test")
local registry = require("registry")
local errors = require("errors")
local unwired = require("unwired")
local component_lifecycle = require("component_lifecycle")
local lifecycle_stub = require("lifecycle_stub")
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")

local function data(entry)
    return type(entry) == "table" and (entry.data or entry) or {}
end

local function define_tests()
    test.describe("component lifecycle ownership", function()
        test.it("rejects every unwired lifecycle operation, including payload-free commits", function()
            for _, name in ipairs({"created", "updated", "deleted", "publish_audit"}) do
                local result = unwired[name]({component_id = "unwired"})
                test.is_false(result.success)
                test.contains(result.error, "not wired")
            end
            local result = unwired.committed()
            test.is_false(result.success)
            test.contains(result.error, "not wired")
        end)

        test.it("owns the lifecycle injection seam and applies the host mapping", function()
            local requirement = data(registry.get("kickside.component:lifecycle_impl"))
            test.eq(requirement.default, "kickside.component:component_lifecycle_unwired")
            test.eq(#(requirement.targets or {}), 1)
            test.eq(requirement.targets[1].entry, "kickside.component:component_lifecycle")
            test.eq(requirement.targets[1].path, ".imports.lifecycle_impl")

            local lifecycle = data(registry.get("kickside.component:component_lifecycle"))
            test.eq(lifecycle.imports.lifecycle_impl, "app:component_lifecycle_test_impl")
        end)

        test.it("notifies committed lifecycle work once per committed mutation and never for a rolled-back one", function()
            local mailbox, listen_err = process.listen(lifecycle_stub.COMMIT_TOPIC, { message = true })
            test.is_nil(listen_err, tostring(listen_err))
            if not mailbox then error("commit probe mailbox is absent") end
            local _, register_err = process.registry.register(lifecycle_stub.COMMIT_PROBE)
            test.is_nil(register_err, tostring(register_err))
            local function notified(): integer
                local count = 0
                while channel.select({ mailbox:case_receive(), default = true }).channel == mailbox do
                    count = count + 1
                end
                return count
            end
            local policy, policy_err = security.policy("app:test_scope_policy")
            if not policy then error("test policy missing: " .. tostring(policy_err)) end
            local def, def_err = contract.get("kickside.component:component_service")
            if def_err or not def then error("component_service unavailable: " .. tostring(def_err)) end
            local svc, open_err = def:with_actor(security.new_actor("seam-" .. uuid.v4(), { security_groups = {} }))
                :with_scope(security.new_scope({ policy })):open()
            if open_err or not svc then error("component_service open failed: " .. tostring(open_err)) end

            local created, create_err = svc:register({ impl_id = "kickside.test:lifecycle_seam" })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            test.eq(notified(), 1)
            local id = created.component_id
            local updated, update_err = svc:set_meta({ component_id = id, fields = { status = "ready" } })
            test.is_nil(update_err, tostring(update_err))
            test.is_true(updated.success, tostring(updated.error))
            test.eq(notified(), 1)
            local refused = svc:register({ impl_id = lifecycle_stub.FAILING_CREATE_IMPL })
            test.is_false(refused.success)
            test.eq(notified(), 0)
            local deleted, delete_err = svc:delete({ component_id = id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted.success, tostring(deleted.error))
            test.eq(notified(), 1)

            local _, unregister_err = process.registry.unregister(lifecycle_stub.COMMIT_PROBE)
            process.unlisten(mailbox)
            test.is_nil(unregister_err, tostring(unregister_err))
        end)

        test.it("writes a registration's thread row through the create transaction", function()
            local policy, policy_err = security.policy("app:test_scope_policy")
            if not policy then error("test policy missing: " .. tostring(policy_err)) end
            local def, def_err = contract.get("kickside.component:component_service")
            if def_err or not def then error("component_service unavailable: " .. tostring(def_err)) end
            local svc, open_err = def:with_actor(security.new_actor("seam-" .. uuid.v4(), { security_groups = {} }))
                :with_scope(security.new_scope({ policy })):open()
            if open_err or not svc then error("component_service open failed: " .. tostring(open_err)) end

            local created, create_err = svc:register({ impl_id = "kickside.test:lifecycle_seam",
                thread = { thread_class = "test.thread", attrs = "{}" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            test.eq(created.thread_id, created.component_id)

            local plain = svc:register({ impl_id = "kickside.test:lifecycle_seam" })
            test.is_true(plain.success, tostring(plain.error))
            test.is_nil(plain.thread_id)

            local malformed = svc:register({ impl_id = "kickside.test:lifecycle_seam", thread = "row" })
            test.is_false(malformed.success)
            test.eq(malformed.kind, errors.INVALID)

            local refused_id = uuid.v7()
            local refused = svc:register({ component_id = refused_id, impl_id = "kickside.test:lifecycle_seam",
                thread = { thread_class = lifecycle_stub.REFUSED_THREAD_CLASS, attrs = "{}" } })
            test.is_false(refused.success)
            local found = svc:get({ component_id = refused_id })
            test.is_true(type(found) ~= "table" or found.component_id == nil)
        end)

        test.it("keeps a lifecycle implementation's typed error kind and retryability", function()
            local err = component_lifecycle.created({ component_id = "c-1", impl_id = lifecycle_stub.TYPED_CREATE_IMPL })
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.CONFLICT)
            test.is_true((err :: any):retryable())
            test.contains(tostring(err), "lifecycle thread append conflicted")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
