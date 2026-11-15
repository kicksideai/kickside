local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local function binding(): table
    return {worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker",
        actor_id = "owner", actor_context = "stored identity"}
end
return {run = test.run_cases(function()
    test.describe("native projection executor configuration", function()
        test.it("reuses only the current maintenance frame and invalidates every authority key", function()
            fixture.reset("", nil)
            local b = {actor_id = "system:lifecycle", component_authority = {
                component_id = "first", maintenance_owner = "system:lifecycle", generation = 0}}
            local actor, scope, err = worker.resolve_binding_identity(b)
            test.is_nil(err); test.not_nil(actor); test.not_nil(scope)
            local repeated, _, repeated_err = worker.resolve_binding_identity(b)
            test.is_nil(repeated_err); test.eq(repeated, actor); test.eq(fixture.frames, 1)
            b.component_authority.generation = 2 -- Includes placement and change-away-and-back.
            test.not_nil(worker.resolve_binding_identity(b)); test.eq(fixture.frames, 2)
            b.component_authority.component_id = "second"
            test.not_nil(worker.resolve_binding_identity(b)); test.eq(fixture.frames, 3)
            b.actor_id = "system:kickside.jobs"; b.component_authority.maintenance_owner = b.actor_id
            test.not_nil(worker.resolve_binding_identity(b)); test.eq(fixture.frames, 4)
            fixture.revision = "updated"
            test.not_nil(worker.resolve_binding_identity(b)); test.eq(fixture.frames, 5)
            fixture.stage = "maintenance"; fixture.source = errors.new({kind = errors.PERMISSION_DENIED, message = "grant removed"})
            fixture.revision = "revoked"
            local denied, _, denied_err = worker.resolve_binding_identity(b)
            test.is_nil(denied); test.eq(denied_err:kind(), errors.PERMISSION_DENIED)
            test.eq(fixture.frames, 6)
        end)
        test.it("uses fresh snapshot access without another database read and never caches the answer", function()
            fixture.reset("", nil)
            local b = {worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker",
                actor_id = "system:lifecycle", maintenance_access_mask = 3, component_authority = {
                    component_id = "snapshot", maintenance_owner = "system:lifecycle", generation = 0}}
            local result, err = worker.run(b, {})
            test.is_nil(err); test.not_nil(result); test.eq(fixture.frames, 1)
            b.maintenance_access_mask = 0
            local denied, denied_err = worker.run(b, {})
            test.is_nil(denied); test.eq(denied_err:kind(), errors.PERMISSION_DENIED)
            test.eq(denied_err:details().code, "projection_component_access_denied")
            test.eq(fixture.frames, 1); test.eq(fixture.calls, 1)
        end)
        test.it("reuses the maintenance executor under the same frame and rebuilds after registry publication", function()
            fixture.reset("", nil)
            local b = {worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker",
                actor_id = "system:lifecycle", maintenance_access_mask = 3, component_authority = {
                    component_id = "executor", maintenance_owner = "system:lifecycle", generation = 0}}
            for _ = 1, 2 do
                local result, err = worker.run(b, {})
                test.is_nil(err); test.not_nil(result)
            end
            test.eq(fixture.actors, 1); test.eq(fixture.scopes, 1); test.eq(fixture.configures, 1); test.eq(fixture.calls, 2)
            fixture.revision = "executor-updated"
            local refreshed, refresh_err = worker.run(b, {})
            test.is_nil(refresh_err); test.not_nil(refreshed)
            test.eq(fixture.actors, 2); test.eq(fixture.scopes, 2); test.eq(fixture.configures, 2); test.eq(fixture.calls, 3)
        end)
        test.it("reuses callback admission only for the same cached maintenance frame", function()
            fixture.reset("", nil)
            local b = {worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker",
                actor_id = "system:lifecycle", maintenance_access_mask = 3, component_authority = {
                    component_id = "callback", maintenance_owner = "system:lifecycle", generation = 0}}
            local _, err, frame = worker.run(b, {})
            test.is_nil(err); test.not_nil(frame)
            b.maintenance_access_mask = 0
            local callback, callback_err, retained = worker.run(b, {}, frame)
            test.is_nil(callback_err); test.not_nil(callback); test.eq(retained, frame)
            test.eq(fixture.frames, 1); test.eq(fixture.configures, 1); test.eq(fixture.calls, 2)
            local denied, denied_err = worker.run(b, {})
            test.is_nil(denied); test.eq(denied_err:kind(), errors.PERMISSION_DENIED)
            for _, change in ipairs({"generation", "component", "owner", "registry"}) do
                if change == "generation" then b.component_authority.generation = 2
                elseif change == "component" then b.component_authority.component_id = "other-callback"
                elseif change == "owner" then b.actor_id = "system:kickside.jobs"; b.component_authority.maintenance_owner = b.actor_id
                else fixture.revision = "callback-updated" end
                local stale, stale_err = worker.run(b, {}, frame)
                test.is_nil(stale); test.eq(stale_err:kind(), errors.PERMISSION_DENIED)
            end
            test.eq(fixture.calls, 2)
        end)
        test.it("never reuses a v2 callback authority frame", function()
            fixture.reset("", nil)
            local _, err, frame = worker.run(binding(), {})
            test.is_nil(err); test.not_nil(frame)
            local result, callback_err = worker.run(binding(), {}, frame)
            test.is_nil(callback_err); test.not_nil(result); test.eq(fixture.resolves, 2)
            test.eq(fixture.configures, 2)
        end)
        test.it("does not cache v2 resolution or mint without a trusted binding", function()
            fixture.reset("", nil)
            for _ = 1, 2 do test.not_nil(worker.resolve_binding_identity(binding())) end
            test.eq(fixture.resolves, 2)
            local actor, _, err = worker.resolve_binding_identity({actor_id = "system:lifecycle"})
            test.is_nil(actor); test.eq(err:kind(), errors.PERMISSION_DENIED); test.eq(fixture.frames, 0)
        end)
        test.it("fails closed when the registry revision cannot be read", function()
            fixture.reset("revision", errors.new({kind = errors.UNAVAILABLE, message = "registry unavailable"}))
            local actor, _, err = worker.resolve_binding_identity({actor_id = "system:lifecycle", component_authority = {
                component_id = "first", maintenance_owner = "system:lifecycle", generation = 0}})
            test.is_nil(actor); test.eq(err:kind(), errors.UNAVAILABLE); test.eq(fixture.frames, 0)
        end)
        for _, stage in ipairs({"actor", "scope", "options"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable,
                            message = "executor configuration refuses", details = {code = "executor_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local result, err = worker.run(binding(), {})
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "executor_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.actors, 1)
                        test.eq(fixture.scopes, stage == "actor" and 0 or 1)
                        test.eq(fixture.configures, stage == "options" and 1 or 0)
                        test.eq(fixture.calls, 0)
                    end)
                end
            end
            test.it("missing executor proof/" .. stage, function()
                fixture.reset("missing_" .. stage, nil)
                local result, err = worker.run(binding(), {})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "projection_worker_executor_response")
                test.eq(err:details().field, stage)
                test.eq(fixture.calls, 0)
            end)
        end
        test.it("bounded actor executor configures one invocation", function()
            fixture.reset("", nil)
            local result, err = worker.run(binding(), {})
            test.is_nil(err)
            test.eq(type(result), "table")
            test.eq(fixture.actors, 1)
            test.eq(fixture.scopes, 1)
            test.eq(fixture.configures, 1)
            test.eq(fixture.max_attempts, 1)
            test.eq(fixture.calls, 1)
        end)
    end)
end)}
