local test = require("test")
local binding = require("binding")
local fixture = require("fixture")
local worker = require("worker")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(result: any, source: error)
    test.is_false(result.success); test.eq(result.kind, source:kind()); test.eq(result.retryable, source:retryable())
    test.eq(result.details.code, "gated_delete_dependency"); test.eq(result.details.nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native gated component deletion causes", function()
        for _, stage in ipairs({"read", "access_check", "access", "commit", "cleanup"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "dependency refused",
                            details = {code = "gated_delete_dependency", nested = {marker = "kept"}, discarded = 3}})
                        fixture.reset(stage, source)
                        local result = binding.handle({component_id = "component", child_policy = "reparent_root"})
                        if stage == "cleanup" then
                            test.is_true(result.in_progress)
                            local finished, worker_err = worker.run({payload = {component_id = "component"}})
                            test.is_nil(finished)
                            result = {success = false, kind = worker_err:kind(), retryable = worker_err:retryable(), details = worker_err:details(), deleted = false, discarded = worker_err:details().discarded}
                        end
                        native(result, source); test.eq(fixture.unregisters, 0)
                        test.eq(fixture.cleanups, stage == "cleanup" and 1 or 0)
                        test.eq(fixture.abandons, 0)
                        if stage == "cleanup" then test.eq(result.discarded, 3); test.is_false(result.deleted) end
                    end)
                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("failed replay keeps the mark/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup replay refused",
                        details = {code = "gated_delete_dependency", nested = {marker = "kept"}}})
                    fixture.reset("cleanup_replay", source)
                    local accepted = binding.handle({component_id = "component"})
                    test.is_true(accepted.in_progress)
                    local finished, worker_err = worker.run({payload = {component_id = "component"}})
                    test.is_nil(finished)
                    native({success = false, kind = worker_err:kind(), retryable = worker_err:retryable(), details = worker_err:details()}, source)
                    test.eq(fixture.abandons, 0); test.eq(fixture.unregisters, 0)
                end)
            end
        end
        for _, stage in ipairs({"pending", "purge"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup outcome",
                            details = {code = "gated_delete_dependency", nested = {marker = "kept"}, discarded = 3,
                                cleanup_pending = stage == "pending", wait_for = stage == "pending" and "dependency" or nil}})
                        fixture.reset(stage, source); local result = binding.handle({component_id = "component"})
                        test.is_true(result.success); test.is_true(result.in_progress)
                        test.is_false(result.deleted); test.is_true(result.cleanup_pending)
                        local finished, worker_err = worker.run({payload = {component_id = "component"}})
                        test.is_nil(finished); test.not_nil(worker_err)
                        test.eq(worker_err:kind(), source:kind()); test.eq(worker_err:retryable(), source:retryable())
                        test.eq(worker_err:details().code, "gated_delete_dependency")
                        test.eq(worker_err:details().nested.marker, "kept")
                        test.eq(worker_err:details().discarded, 3)
                        test.eq(fixture.unregisters, stage == "purge" and 1 or 0); test.eq(fixture.abandons, 0)
                    end)
                end
            end
        end
        test.it("denied access without dependency failure keeps the refusal", function()
            fixture.reset("access", nil); local result = binding.handle({component_id = "component"})
            test.is_false(result.success); test.eq(result.kind, errors.PERMISSION_DENIED); test.eq(fixture.cleanups, 0)
        end)
        test.it("absent component keeps existence concealed", function()
            fixture.reset("", nil); fixture.absent = true; local result = binding.handle({component_id = "component"})
            test.is_false(result.success); test.eq(result.kind, errors.PERMISSION_DENIED); test.eq(fixture.begins, 0)
        end)
        test.it("healthy gated delete retains its response", function()
            fixture.reset("", nil); local result = binding.handle({component_id = "component", child_policy = "reparent_root"})
            test.is_true(result.success); test.is_true(result.in_progress); test.is_false(result.deleted); test.eq(result.component_id, "component")
            test.eq(fixture.unregisters, 0); test.eq(fixture.policy, "reparent_root"); test.eq(fixture.user, "actor")
        end)
    end)
end)}
