local test = require("test")
local api = require("api")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local methods = {"register_projection", "list_projections", "get_projection_cursor", "catch_up_projection",
    "pause_projection", "resume_projection", "remove_projection"}
local mutations = {register_projection = true, pause_projection = true, resume_projection = true, remove_projection = true}
local stages = {
    register_projection = {"gate", "identity", "validate", "register"},
    list_projections = {"gate", "projections", "cursors"},
    get_projection_cursor = {"gate", "find"}, catch_up_projection = {"gate", "select"},
    pause_projection = {"gate", "pause"}, resume_projection = {"gate", "resume"}, remove_projection = {"gate", "remove"},
}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "projection guard requires an error"})) end
    return err
end
local function retains(err: error, source: error): ()
    test.is_true(errors.is(err, source:kind()))
    test.eq(err:retryable(), source:retryable())
    if source:details() then
        test.eq(err:details().code, source:details().code)
        test.eq(err:details().nested.marker, "kept")
    else test.is_nil(err:details()) end
end
local function envelope(value: any, source: error): ()
    test.eq(value.kind, source:kind())
    test.eq(value.message, source:message())
    test.eq(value.retryable, source:retryable())
    if source:details() then
        test.eq(value.details.code, source:details().code)
        test.eq(value.details.nested.marker, "kept")
    else test.is_nil(value.details) end
end
local function invoke(method: string): (any, error?)
    return api[method]({thread_id = "thread", kind = "kind", worker_ref = "func://app:worker"})
end
return {run = test.run_cases(function()
    test.describe("projection contract native SQL boundaries", function()
        for _, kind in ipairs(kinds) do
            for _, retry in ipairs({"absent", "false", "true"}) do
                for _, detailed in ipairs({false, true}) do
                    local policy: boolean? = nil
                    if retry ~= "absent" then policy = retry == "true" end
                    local label = kind .. "/" .. retry .. "/" .. tostring(detailed)
                    local function source(): error
                        return errors.new({kind = kind, retryable = policy, message = "projection dependency refusal",
                            details = detailed and {code = "projection_dependency", nested = {marker = "kept"}} or nil})
                    end
                    for _, method in ipairs(methods) do
                        test.it(method .. "/release/" .. label, function()
                            local cause = source()
                            fixture.reset("release", nil, cause)
                            local result, err = invoke(method)
                            test.is_nil(result)
                            local actual = required(err)
                            if mutations[method] then
                                test.is_true(errors.is(actual, cause:kind()))
                                test.is_false(actual:retryable())
                                envelope(actual:details().cause, cause)
                                if detailed then
                                    test.eq(actual:details().code, cause:details().code)
                                    test.eq(actual:details().nested.marker, "kept")
                                end
                                test.eq(cause:retryable(), policy)
                            else retains(actual, cause) end
                            test.eq(fixture.releases, 1)
                            test.eq(fixture.opens, 1)
                            test.eq(fixture.closes, 0)
                        end)
                        for _, stage in ipairs(stages[method]) do
                            test.it(method .. "/" .. stage .. "/secondary/" .. label, function()
                                local cleanup = source()
                                local primary = errors.new({kind = errors.CONFLICT, retryable = false, message = "projection operation refusal",
                                    details = {code = "operation_dependency", nested = {marker = "kept"}}})
                                fixture.reset(stage, primary, cleanup)
                                local result, err = invoke(method)
                                test.is_nil(result)
                                local actual = required(err)
                                test.is_true(errors.is(actual, cleanup:kind()))
                                test.eq(actual:retryable(), cleanup:retryable())
                                envelope(actual:details().cause, cleanup)
                                envelope(actual:details().operation_error, primary)
                                test.eq(fixture.releases, 1)
                                test.eq(primary:details().code, "operation_dependency")
                            end)
                        end
                    end
                    for _, stage in ipairs({"progress_release", "progress_read"}) do
                        test.it("catch-up/" .. stage .. "/" .. label, function()
                            local cause = source()
                            fixture.reset(stage, stage == "progress_read" and cause or nil, stage == "progress_release" and cause or nil)
                            local result, err = invoke("catch_up_projection")
                            test.is_nil(result)
                            retains(required(err), cause)
                            test.eq(fixture.releases, 2)
                            test.eq(fixture.opens, 2)
                            test.eq(fixture.closes, 1)
                        end)
                    end
                end
            end
        end
        test.it("progress cleanup retains both causes and closes its waiter once", function()
            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "read refusal", details = {code = "read", nested = {marker = "kept"}}})
            local cleanup = errors.new({kind = errors.TIMEOUT, retryable = true, message = "release refusal", details = {code = "release", nested = {marker = "kept"}}})
            fixture.reset("progress_read", primary, nil)
            fixture.progress_release_source = cleanup
            local result, err = invoke("catch_up_projection")
            test.is_nil(result)
            local actual = required(err)
            test.is_true(errors.is(actual, errors.TIMEOUT))
            envelope(actual:details().operation_error, primary)
            envelope(actual:details().cause, cleanup)
            test.eq(fixture.releases, 2)
            test.eq(fixture.closes, 1)
        end)
        for _, method in ipairs(methods) do
            test.it(method .. "/success", function()
                fixture.reset("", nil, nil)
                local result, err = invoke(method)
                test.is_nil(err)
                test.not_nil(result)
                test.eq(fixture.releases, method == "catch_up_projection" and 2 or 1)
                test.eq(fixture.closes, method == "catch_up_projection" and 1 or 0)
            end)
        end
        test.it("a missing lazy thread keeps a failed release instead of reporting an empty list", function()
            local primary = errors.new({kind = errors.NOT_FOUND, message = "thread absent"})
            local cleanup = errors.new({kind = errors.NOT_FOUND, retryable = false, message = "release refusal"})
            fixture.reset("gate", primary, cleanup)
            local result, err = invoke("list_projections")
            test.is_nil(result)
            local actual = required(err)
            test.is_true(errors.is(actual, errors.NOT_FOUND))
            test.is_false(actual:retryable())
            envelope(actual:details().operation_error, primary)
            envelope(actual:details().cause, cleanup)
            test.eq(fixture.releases, 1)
        end)
        test.it("system-identity refusal retains a failed release", function()
            local cleanup = errors.new({kind = errors.TIMEOUT, retryable = true, message = "release refusal"})
            fixture.reset("system", nil, cleanup)
            local result, err = invoke("register_projection")
            test.is_nil(result)
            local actual = required(err)
            test.is_true(errors.is(actual, errors.TIMEOUT))
            test.eq(actual:details().operation_error.kind, errors.PERMISSION_DENIED)
            envelope(actual:details().cause, cleanup)
            test.eq(fixture.releases, 1)
            test.eq(fixture.effects, 0)
        end)
        test.it("missing lazy thread preserves the published empty-list result", function()
            fixture.reset("gate", errors.new({kind = errors.NOT_FOUND, message = "thread absent"}), nil)
            local result, err = invoke("list_projections")
            test.is_nil(err)
            test.eq(result.event_count, 0)
            test.eq(result.count, 0)
            test.eq(fixture.releases, 1)
        end)
    end)
end)}
