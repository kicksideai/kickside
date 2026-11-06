-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local teardown = require("teardown")
local worker = require("worker")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
return {run = test.run_cases(function()
    test.describe("native deletion worker cleanup causes", function()
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, stage in ipairs({"cleanup", "worker_read", "unregister"}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. stage, function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                            details = {code = "inherited_cleanup", nested = {marker = "kept"}, discarded = 7,
                                cause = {original = "kept"}}})
                        fixture.reset(stage, source)
                        local finished, actual = worker.run({payload = {component_id = "component"}})
                        test.is_nil(finished)
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "inherited_cleanup"); test.eq(actual:details().nested.marker, "kept")
                        test.eq(actual:details().discarded, 7)
                        local pending, more = teardown.cleanup_pending(actual)
                        test.is_false(pending); test.is_false(more)
                        test.eq(actual:details().cause.original, "kept")
                        test.eq(fixture.abandons, 0)
                    end)
                end
                for _, exclusion in ipairs({"wait_for", "blocked_operation"}) do
                    test.it("pending exclusion/" .. exclusion .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local details: any = {code = "inherited_cleanup", cleanup_pending = true,
                            needs_continue = true, cause = {marker = "kept"}}
                        details[exclusion] = "dependency"
                        local source = errors.new({kind = kind, retryable = options.retryable,
                            message = "cleanup waits", details = details})
                        fixture.reset("cleanup", source)
                        local finished, actual = worker.run({payload = {component_id = "component"}})
                        test.is_nil(finished)
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "inherited_cleanup"); test.eq(actual:details().cause.marker, "kept")
                        local pending, more = teardown.cleanup_pending(actual); test.is_true(pending); test.is_false(more)
                        test.eq(actual:details()[exclusion], "dependency")
                        test.eq(fixture.unregisters, 0)
                    end)
                end
                test.it("existing pending/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup continues",
                        details = {code = "inherited_cleanup", cleanup_pending = true, needs_continue = true, cause = {marker = "kept"}}})
                    fixture.reset("cleanup", source)
                    local finished, actual = worker.run({payload = {component_id = "component"}})
                    test.is_nil(actual); test.eq(type(finished.rearm), "string")
                    test.is_true(finished.success); test.is_false(finished.deleted)
                    test.eq(fixture.unregisters, 0)
                    test.eq(source:details().code, "inherited_cleanup"); test.eq(source:details().cause.marker, "kept")
                    local pending, more = teardown.cleanup_pending(source); test.is_true(pending); test.is_true(more)
                    test.is_nil(source:details().wait_for)
                end)
            end
        end
    end)
end)}
