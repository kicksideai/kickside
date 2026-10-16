local test = require("test")
local cleanup = require("cleanup")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
    errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(actual: error?, source: error)
    test.not_nil(actual); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "grant_cleanup_dependency"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native principal grant cleanup failures", function()
        for _, stage in ipairs({"open", "begin", "scan", "delete", "commit", "release"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "grant cleanup refused",
                            details = {code = "grant_cleanup_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local result = cleanup.run({principal_id = "principal"})
                        test.is_false(result.success); native(result.error, source)
                        test.eq(fixture.deletes, (stage == "delete" or stage == "commit" or stage == "release") and 1 or 0)
                        test.eq(fixture.releases, stage == "open" and 0 or 1)
                        test.eq(fixture.rollbacks, (stage == "scan" or stage == "delete") and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"rollback", "release"}) do
            for _, kind in ipairs(kinds) do
                test.it("scan and " .. stage .. "/" .. kind, function()
                    local primary = errors.new({kind = errors.INVALID, retryable = false, message = "scan refused",
                        details = {code = "scan_primary", nested = {marker = "primary"}}})
                    local source = errors.new({kind = kind, retryable = true, message = "cleanup refused",
                        details = {code = "grant_cleanup_dependency", nested = {marker = "kept"}}})
                    fixture.reset("scan", primary)
                    if stage == "rollback" then fixture.rollback_source = source else fixture.release_source = source end
                    local result = cleanup.run({principal_id = "principal"})
                    test.is_false(result.success); native(result.error, source)
                    test.eq(result.error:details().operation_error.kind, primary:kind())
                    test.is_false(result.error:details().operation_error.retryable)
                    test.eq(result.error:details().operation_error.details.code, "scan_primary")
                    test.eq(result.error:details().operation_error.details.nested.marker, "primary")
                    test.eq(fixture.deletes, 0); test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1)
                end)
            end
        end
        for _, stage in ipairs({"open", "begin", "scan", "commit"}) do
            test.it("missing/" .. stage, function()
                fixture.reset(stage, nil); local result = cleanup.run({principal_id = "principal"})
                test.is_false(result.success); test.is_true(errors.is(result.error, errors.INTERNAL)); test.is_false(result.error:retryable())
                test.eq(result.error:details().code, "component_grant_cleanup_response")
            end)
        end
        test.it("healthy cleanup deletes one page and commits once", function()
            fixture.reset("", nil); local result = cleanup.run({principal_id = "principal"})
            test.is_true(result.success); test.eq(result.deleted, 1); test.eq(fixture.deletes, 1)
            test.eq(fixture.commits, 1); test.eq(fixture.releases, 1); test.eq(fixture.rollbacks, 0)
        end)
        test.it("empty grant scan remains successful and inert", function()
            fixture.reset("", nil); fixture.rows = {}; local result = cleanup.run({principal_id = "principal"})
            test.is_true(result.success); test.eq(result.deleted, 0); test.eq(fixture.deletes, 0); test.eq(fixture.commits, 1)
        end)
        test.it("a further page carries a retryable native Conflict", function()
            fixture.reset("", nil); fixture.rows = {}
            for index = 1, 51 do fixture.rows[index] = {access_id = "access-" .. tostring(index)} end
            local result = cleanup.run({principal_id = "principal"})
            test.is_false(result.success); test.is_true(errors.is(result.error, errors.CONFLICT)); test.is_true(result.error:retryable())
            test.eq(result.error:details().code, "component_grant_cleanup_pending")
            test.eq(fixture.deletes, 50); test.eq(fixture.commits, 1); test.eq(fixture.releases, 1)
        end)
        test.it("invalid principal stops before database access", function()
            fixture.reset("", nil); local result = cleanup.run({})
            test.is_false(result.success); test.is_true(errors.is(result.error, errors.INVALID)); test.eq(fixture.opens, 0)
        end)
    end)
end)}
