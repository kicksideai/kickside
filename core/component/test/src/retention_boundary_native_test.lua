local test = require("test")
local retention = require("retention")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native component retention boundaries", function()
        for _, stage in ipairs({"pending", "reap", "audit"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "retention dependency refused",
                            details = {code = "retention_boundary_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local result = retention.run()
                        test.is_false(result.success); test.eq(type(result.error), "userdata")
                        test.eq(result.error:kind(), source:kind()); test.eq(result.error:retryable(), source:retryable())
                        test.eq(result.error:details().code, "retention_boundary_dependency"); test.eq(result.error:details().nested.marker, "kept")
                        test.eq(fixture.pending_calls, 1); test.eq(fixture.reap_calls, stage == "pending" and 0 or 1)
                        test.eq(fixture.audit_calls, stage == "audit" and 1 or 0)
                    end)
                end
            end
            test.it(stage .. "/missing result", function()
                fixture.reset(stage, nil); local result = retention.run()
                test.is_false(result.success); test.is_true(errors.is(result.error, errors.INTERNAL)); test.is_false(result.error:retryable())
                test.eq(result.error:details().code, "component_command_response")
                test.eq(fixture.reap_calls, stage == "pending" and 0 or 1); test.eq(fixture.audit_calls, stage == "audit" and 1 or 0)
            end)
        end
        test.it("preserves counts, audits and blocker continuation", function()
            fixture.reset("", nil); local result = retention.run()
            test.is_true(result.success); test.eq(result.deleted, 5); test.eq(result.audits.published, 7); test.eq(result.audits.pruned, 11)
            test.is_true(result.needs_continue); test.eq(#result.blocked, 2)
            test.eq(result.blocked[1].code, "pending_blocker"); test.eq(result.blocked[2].code, "reap_blocker")
            test.eq(fixture.limit, 50); test.is_nil(fixture.owner)
            test.eq(fixture.pending_calls, 1); test.eq(fixture.reap_calls, 1); test.eq(fixture.audit_calls, 1)
        end)
        test.it("retains targeted owner retry", function()
            fixture.reset("", nil); local result = retention.run({change = {owner_locator = {id = "owner"}}})
            test.is_true(result.success); test.eq(fixture.limit, 1); test.eq(fixture.owner, "owner")
        end)
    end)
end)}
