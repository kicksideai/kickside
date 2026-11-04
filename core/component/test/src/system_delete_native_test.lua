local test = require("test")
local component = require("component")
local fixture = require("fixture")
local worker = require("worker")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
    errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(actual: error?, source: error)
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "system delete guard requires failure"})) end
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "system_delete_dependency"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native trusted component teardown", function()
        for _, stage in ipairs({"read", "preflight", "cleanup", "unregister", "pending", "purge"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "system teardown refusal", retryable = options.retryable,
                            details = {code = "system_delete_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source)
                        local ok, err
                        if stage == "read" or stage == "preflight" then
                            ok, err = component.system_delete("component", "reparent_root")
                            test.is_false(ok)
                        else
                            ok, err = worker.run({payload = {component_id = "component"}})
                            test.is_nil(ok)
                        end
                        native(err, source)
                        test.eq(fixture.cleanups, (stage == "read" or stage == "preflight") and 0 or 1)
                        test.eq(fixture.unregisters, (stage == "read" or stage == "preflight" or stage == "cleanup") and 0 or 1)
                    end)
                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("failed replay keeps the mark/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup replay refused",
                        details = {code = "system_delete_dependency", nested = {marker = "kept"}}})
                    fixture.reset("cleanup_replay", source)
                    local result, err = worker.run({payload = {component_id = "component"}})
                    test.is_nil(result); native(err, source)
                    test.eq(fixture.abandons, 0); test.eq(fixture.unregisters, 0)
                end)
            end
        end
        test.it("absent component remains an idempotent no-op", function()
            fixture.reset("", nil); fixture.absent = true; local ok, err = component.system_delete("component", "reparent_root")
            test.is_true(ok); test.is_nil(err); test.eq(fixture.begins, 0); test.eq(fixture.cleanups, 0); test.eq(fixture.unregisters, 0)
        end)
        test.it("healthy cleanup unregisters once under the trusted gate", function()
            fixture.reset("", nil); local ok, err = component.system_delete("component", "reparent_root")
            test.is_false(ok); test.is_true(err:details().cleanup_pending)
            test.eq(err:details().wait_for, "deletion_job")
            test.eq(fixture.cleanups, 0); test.eq(fixture.unregisters, 0)
            local finished, finish_err = worker.run({payload = {component_id = "component"}})
            test.is_nil(finish_err); test.is_true(finished.deleted)
            test.eq(fixture.cleanups, 1); test.eq(fixture.unregisters, 1)
            test.is_nil(fixture.user); test.eq(fixture.policy, "reparent_root")
        end)
    end)
end)}
