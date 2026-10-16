local test = require("test")
local jobs = require("jobs")
local fixture = require("fixture")
local routes = {"get", "lease", "sweep", "page"}
local function invoke(route): (any, error?)
    if route == "get" then return jobs.get_job("job") end
    if route == "lease" then return jobs.lease_valid("job", {token = "token", execution_seq = 1}) end
    if route == "sweep" then return jobs.retention_sweep() end
    return jobs.cleanup_thread_page("thread", 0)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "scope guard requires an error"})) end
    return err
end
local function fields(actual: any, source: error)
    test.eq(actual.kind, source:kind()); test.eq(actual.retryable, source:retryable())
    if source:details() then test.eq(actual.details.code, "scope_dependency"); test.eq(actual.details.nested.marker, "kept")
    else test.is_nil(actual.details) end
end
local function retains(actual: error, source: error, committed: boolean, annotated: boolean?)
    test.is_true(errors.is(actual, source:kind()))
    if committed then test.is_false(actual:retryable()); fields(actual:details().cause, source)
    else test.eq(actual:retryable(), source:retryable()) end
    if source:details() then test.eq(actual:details().code, "scope_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not committed and not annotated then test.is_nil(actual:details()) end
end
local function group(index: integer)
    local route = routes[index]
    return test.run_cases(function()
        test.describe("native Jobs resource scope/" .. route, function()
            for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        local function source(): error
                            return errors.new({kind = kind, retryable = policy.retryable, message = "scope dependency refusal",
                                details = detailed and {code = "scope_dependency", nested = {marker = "kept"}} or nil})
                        end
                        for _, stage in ipairs({"get", "type", "operation", "release"}) do
                            test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local cause = source(); fixture.reset(route, stage, cause, nil)
                                local result, err = invoke(route)
                                if route == "lease" and stage == "operation" then test.is_false(result) else test.is_nil(result) end
                                retains(required(err), cause, stage == "release" and (route == "sweep" or route == "page"))
                                test.eq(fixture.releases, stage == "get" and 0 or 1)
                                test.eq(fixture.operations, (stage == "get" or stage == "type") and 0 or 1)
                            end)
                        end
                        for _, stage in ipairs({"type", "operation"}) do
                            test.it("secondary/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local cleanup = source()
                                local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "operation refusal", details = {code = "scope_primary"}})
                                fixture.reset(route, stage, primary, cleanup)
                                local result, err = invoke(route)
                                if route == "lease" and stage == "operation" then test.is_false(result) else test.is_nil(result) end
                                local actual = required(err); retains(actual, cleanup, false, true)
                                fields(actual:details().cause, cleanup)
                                test.eq(actual:details().operation_error.kind, primary:kind())
                                test.eq(actual:details().operation_error.retryable, primary:retryable())
                                test.eq(actual:details().operation_error.details.code, "scope_primary")
                                test.eq(fixture.releases, 1)
                            end)
                        end
                    end
                end
            end
            for _, stage in ipairs({"get", "type"}) do
                for index, response in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                    test.it("missing response/" .. stage .. "/" .. tostring(index), function()
                        fixture.reset(route, stage, nil, nil); fixture.missing, fixture.value = true, response.value
                        local ok, result, err = pcall(function() return invoke(route) end)
                        test.is_true(ok); test.is_nil(result)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_scope_response")
                        test.eq(fixture.operations, 0)
                    end)
                end
            end
            test.it("valid scope", function()
                fixture.reset(route, "", nil, nil)
                local result, err = invoke(route); test.is_nil(err); test.not_nil(result)
                test.eq(fixture.releases, 1); test.eq(fixture.operations, 1)
            end)
        end)
    end)
end
return {run = group(1), lease = group(2), sweep = group(3), page = group(4)}
