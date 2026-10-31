local test = require("test")
local teardown = require("teardown")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(operation: string): (any, string?, error?)
    if operation == "begin" then return teardown.begin_delete("component", "actor", nil) end
    if operation == "unregister" then return teardown.unregister("component", nil, "lease-token") end
    return nil, nil, teardown.abandon_delete("component", "lease-token")
end
local function native(actual: error?, source: error)
    test.not_nil(actual); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "tx_cleanup"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native teardown transaction cleanup", function()
        for _, operation in ipairs({"begin", "unregister", "abandon"}) do
            local cases = operation == "abandon" and {"success_release", "work_release"}
                or {"begin_release", "work_rollback", "work_release", "work_both", "commit_release", "success_release"}
            for _, mode in ipairs(cases) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(operation .. "/" .. mode .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local primary = errors.new({kind = errors.INVALID, retryable = false, message = "operation refused",
                                details = {code = "tx_primary", nested = {marker = "primary"}}})
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                                details = {code = "tx_cleanup", nested = {marker = "kept"}}})
                            local stage = mode == "begin_release" and "begin" or (mode == "commit_release" and "commit"
                                or (mode == "success_release" and "" or (operation == "abandon" and "mark" or "tree")))
                            fixture.reset(operation, stage, primary)
                            if mode == "work_rollback" then fixture.rollback_source = source
                            else fixture.release_source = source end
                            if mode == "work_both" then fixture.rollback_source = primary end
                            local result, step, actual = invoke(operation); native(actual, source)
                            if operation == "begin" then test.is_false(result)
                            elseif operation == "unregister" then test.is_nil(result) end
                            if operation ~= "abandon" then
                                test.eq(step, mode == "begin_release" and "begin" or
                                    ((mode == "commit_release" or mode == "success_release") and "commit" or "delete"))
                            end
                            test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0); test.eq(fixture.purges, 0)
                            if mode ~= "success_release" then
                                local cause = actual:details().operation_error
                                test.not_nil(cause); test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                                test.eq(cause.details.code, "tx_primary"); test.eq(cause.details.nested.marker, "primary")
                                if mode == "work_both" then
                                    test.eq(cause.details.operation_error.kind, primary:kind())
                                    test.eq(cause.details.operation_error.details.code, "tx_primary")
                                end
                            end
                            if operation ~= "abandon" and mode:sub(1,4) == "work" then test.eq(fixture.rollbacks, 1) end
                        end)
                    end
                end
            end
            test.it(operation .. " healthy tuple and ordering", function()
                fixture.reset(operation, "", nil); local result, step, err = invoke(operation)
                test.is_nil(err); test.is_nil(step); test.eq(fixture.rollbacks, 0)
                if operation == "begin" then test.is_true(result); test.eq(fixture.commits, 1); test.eq(fixture.releases, 1)
                elseif operation == "unregister" then test.is_true(result.changes_made); test.eq(fixture.commits, 1)
                    test.eq(fixture.notifications, 1); test.eq(fixture.purges, 1); test.eq(fixture.releases, 2)
                else test.eq(fixture.releases, 1) end
            end)
        end
    end)
end)}
