local test = require("test")
local component = require("component")
local fixture = require("fixture")
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
                        fixture.reset(stage, source); local ok, err = component.system_delete("component", "reparent_root")
                        test.eq(ok, stage == "purge"); native(err, source)
                        test.eq(fixture.cleanups, (stage == "read" or stage == "preflight") and 0 or 1)
                        test.eq(fixture.unregisters, (stage == "read" or stage == "preflight" or stage == "cleanup") and 0 or 1)
                    end)
                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("abandon/" .. kind .. "/" .. tostring(options.retryable), function()
                    local primary = errors.new({kind = errors.INVALID, retryable = false, message = "cleanup refused",
                        details = {code = "cleanup_primary", nested = {marker = "primary"}}})
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "abandon refused",
                        details = {code = "system_delete_dependency", nested = {marker = "kept"}}})
                    fixture.reset("cleanup", primary); fixture.abandon_source = source
                    local ok, err = component.system_delete("component", "reparent_root")
                    test.is_false(ok); native(err, source)
                    test.eq(err:details().operation_error.kind, primary:kind()); test.is_false(err:details().operation_error.retryable)
                    test.eq(err:details().operation_error.details.code, "cleanup_primary")
                    test.eq(err:details().operation_error.details.nested.marker, "primary")
                    test.eq(fixture.abandons, 1); test.eq(fixture.unregisters, 0)
                end)
            end
        end
        test.it("returns busy without cleanup when another attempt holds the lease", function()
            fixture.reset("busy", nil)
            local ok, err, busy = component.system_delete("component")
            test.is_false(ok); test.is_nil(err); test.is_true(busy)
            test.eq(fixture.cleanups, 0); test.eq(fixture.unregisters, 0); test.eq(fixture.abandons, 0)
        end)
        test.it("absent component remains an idempotent no-op", function()
            fixture.reset("", nil); fixture.absent = true; local ok, err = component.system_delete("component", "reparent_root")
            test.is_true(ok); test.is_nil(err); test.eq(fixture.begins, 0); test.eq(fixture.cleanups, 0); test.eq(fixture.unregisters, 0)
        end)
        test.it("healthy cleanup unregisters once under the trusted gate", function()
            fixture.reset("", nil); local ok, err = component.system_delete("component", "reparent_root")
            test.is_true(ok); test.is_nil(err); test.eq(fixture.cleanups, 1); test.eq(fixture.unregisters, 1)
            test.is_nil(fixture.user); test.eq(fixture.policy, "reparent_root")
        end)
    end)
end)}
