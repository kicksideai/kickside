local test = require("test")
local pending = require("pending")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
    errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(actual: error?, source: error)
    test.not_nil(actual); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "retry_dependency"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native component delete retry release failures", function()
        for _, stage in ipairs({"open", "scan", "release", "delete"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "retry dependency refusal",
                            details = {code = "retry_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local count, err = pending.run(1)
                        test.is_nil(count); native(err, source); test.eq(fixture.deletes, stage == "delete" and 1 or 0)
                        test.eq(fixture.releases, stage == "open" and 0 or 1)
                    end)
                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("scan and release/" .. kind .. "/" .. tostring(options.retryable), function()
                    local primary = errors.new({kind = errors.INVALID, retryable = false, message = "scan refused",
                        details = {code = "scan_primary", nested = {marker = "primary"}}})
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "release refused",
                        details = {code = "retry_dependency", nested = {marker = "kept"}}})
                    fixture.reset("scan", primary); fixture.release_source = source; local count, err = pending.run(1)
                    test.is_nil(count); native(err, source); test.eq(fixture.deletes, 0)
                    test.eq(err:details().operation_error.kind, primary:kind()); test.is_false(err:details().operation_error.retryable)
                    test.eq(err:details().operation_error.details.code, "scan_primary")
                    test.eq(err:details().operation_error.details.nested.marker, "primary")
                end)
            end
        end
        test.it("healthy retry counts one delete and retains the page continuation", function()
            fixture.reset("", nil); local count, err, more, blocked = pending.run(1)
            test.eq(count, 1); test.is_nil(err); test.is_true(more); test.eq(#blocked, 0)
            test.eq(fixture.deletes, 1); test.eq(fixture.releases, 1); test.eq(fixture.deleted_id, "component")
            test.eq(fixture.policy, "reparent_root")
        end)
        test.it("empty retry scan remains inert", function()
            fixture.reset("", nil); fixture.rows = {}; local count, err, more = pending.run(1)
            test.eq(count, 0); test.is_nil(err); test.is_false(more); test.eq(fixture.deletes, 0); test.eq(fixture.releases, 1)
        end)
        test.it("blocked native cleanup stays in the returned blocker", function()
            local source = errors.new({kind = errors.CONFLICT, retryable = true, message = "cleanup waits",
                details = {cleanup_pending = true, wait_for = "execution", code = "retry_dependency", nested = {marker = "kept"}}})
            fixture.reset("delete", source); local count, err, more, blocked = pending.run(1)
            test.eq(count, 0); test.is_nil(err); test.is_false(more); test.eq(#blocked, 1)
            test.eq(blocked[1].component_id, "component"); native(blocked[1].error, source)
        end)
        test.it("pending native cleanup requests another bounded page", function()
            local source = errors.new({kind = errors.CONFLICT, retryable = true, message = "cleanup continues",
                details = {cleanup_pending = true, needs_continue = true}})
            fixture.reset("delete", source); local count, err, more, blocked = pending.run(1)
            test.eq(count, 0); test.is_nil(err); test.is_true(more); test.eq(#blocked, 0)
        end)
    end)
end)}
