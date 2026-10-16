local test = require("test")
local fixture = require("fixture")
local http_errors = require("http_errors")
local canonical_json = require("canonical_json")
local adapters = {register = require("register"), pause = require("pause"), resume = require("resume"), remove = require("remove"), list = require("list"), retention_read = require("retention_read"), retention_write = require("retention_write")}
local routes = {"register", "pause", "resume", "remove", "list", "retention_read", "retention_write"}
local mutations = {register = true, pause = true, resume = true, remove = true, retention_write = true}
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP guard requires JSON proof"})) end
    return data
end
local function invoke(route: string): any
    if route == "register" then
        local status, body = adapters.register.register(fixture.id, {kind = "guard", worker_ref = "func://app:guard_worker"})
        return {status = status, body = body}
    end
    adapters[route].handler()
    return fixture.captured
end
local function retains(body: any, source: error): ()
    test.is_false(body.success); test.eq(body.kind, source:kind()); test.eq(body.retryable, source:retryable())
    test.eq(encoded(body.details), encoded(source:details())); test.eq(body.error, tostring(source))
end
return {run = test.run_cases(function()
    test.describe("native projection and retention HTTP operation boundaries", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    local function source(): error return errors.new({kind = kind, retryable = policy.retryable, message = "opaque dependency",
                        details = detailed and {code = "http_dependency", nested = {marker = "kept"}} or nil}) end
                    local label = kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed)
                    for _, route in ipairs(routes) do
                        test.it(route .. "/operation/" .. label, function()
                            local err = source(); fixture.reset("work", err, nil); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(err))); retains(result.body, err)
                            test.eq(fixture.releases, 1); test.eq(fixture.effects, 0)
                        end)
                        test.it(route .. "/get/" .. label, function()
                            local err = source(); fixture.reset("get", err, nil); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(err))); test.is_false(result.body.success)
                            test.eq(result.body.kind, err:kind()); test.eq(result.body.retryable, err:retryable()); test.eq(encoded(result.body.details), encoded(err:details()))
                            test.eq(result.body.error, "db unavailable: " .. tostring(err)); test.eq(fixture.releases, 0); test.eq(fixture.effects, 0)
                        end)
                        test.it(route .. "/release/" .. label, function()
                            local err = source(); fixture.reset("", nil, err); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(err))); test.is_false(result.body.success); test.eq(result.body.kind, err:kind())
                            if mutations[route] then
                                test.is_false(result.body.retryable); test.eq(result.body.details.cause.kind, err:kind()); test.eq(result.body.details.cause.retryable, err:retryable())
                                test.eq(encoded(result.body.details.cause.details), encoded(err:details()))
                            else test.eq(result.body.retryable, err:retryable()); test.eq(encoded(result.body.details), encoded(err:details())) end
                            test.eq(fixture.releases, 1); test.eq(fixture.effects, mutations[route] and 1 or 0)
                        end)
                        test.it(route .. "/operation and release/" .. label, function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation", details = {code = "primary"}})
                            local err = source(); fixture.reset("work", primary, err); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(err))); test.is_false(result.body.success); test.eq(result.body.kind, err:kind()); test.eq(result.body.retryable, err:retryable())
                            test.eq(result.body.details.operation_error.kind, primary:kind()); test.eq(result.body.details.operation_error.retryable, primary:retryable()); test.eq(result.body.details.operation_error.details.code, "primary")
                            test.eq(result.body.details.cause.kind, err:kind()); test.eq(result.body.details.cause.retryable, err:retryable()); test.eq(encoded(result.body.details.cause.details), encoded(err:details()))
                            test.eq(fixture.releases, 1); test.eq(fixture.effects, 0)
                        end)
                    end
                    for _, stage in ipairs({"parse", "validate", "capture", "cursor", "cursors", "page"}) do
                        test.it("other operation/" .. stage .. "/" .. label, function()
                            local route = (stage == "parse" or stage == "validate" or stage == "capture") and "register" or "list"
                            local err = source(); fixture.reset(stage, err, nil); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(err))); retains(result.body, err)
                            test.eq(fixture.releases, (stage == "parse" or stage == "validate" or stage == "cursor") and 0 or 1); test.eq(fixture.effects, 0)
                        end)
                    end
                end
            end
        end
        for _, route in ipairs(routes) do
            local stages = {"missing_get"}
            if mutations[route] then stages[#stages + 1] = "missing_work" end
            if route == "register" then stages[#stages + 1] = "missing_parse"; stages[#stages + 1] = "missing_validate"; stages[#stages + 1] = "missing_capture" end
            if route == "list" then stages[#stages + 1] = "missing_page" end
            for _, stage in ipairs(stages) do
                test.it(route .. "/" .. stage, function()
                    fixture.reset(stage, nil, nil); local result = invoke(route)
                    test.eq(result.status, 500); test.is_false(result.body.success); test.eq(result.body.kind, errors.INTERNAL)
                    test.is_false(result.body.retryable); test.eq(result.body.details.code, "core_http_operation_response")
                    test.eq(fixture.effects, 0); test.eq(fixture.releases, (stage == "missing_get" or stage == "missing_parse" or stage == "missing_validate") and 0 or 1)
                end)
            end
        end
        test.it("confirmed retention absence keeps defaults", function()
            fixture.reset("missing_work", nil, nil); local result = invoke("retention_read")
            test.is_true(result.body.success); test.is_true(result.body.is_default); test.eq(fixture.releases, 1)
        end)
        for _, route in ipairs(routes) do
            test.it(route .. "/healthy", function()
                fixture.reset("", nil, nil); local result = invoke(route); test.is_true(result.body.success)
                test.eq(result.status, route == "register" and 201 or 200); test.eq(fixture.releases, 1); test.eq(fixture.effects, mutations[route] and 1 or 0)
                if route == "register" then test.eq(result.body.kind, "guard") else test.is_nil(result.body.kind) end
                test.is_nil(result.body.retryable); test.is_nil(result.body.details)
            end)
            for _, stage in ipairs({"missing_release", "false_release"}) do
                test.it(route .. "/" .. stage, function()
                    fixture.reset(stage, nil, nil); local result = invoke(route); test.eq(result.status, 500); test.is_false(result.body.success)
                    test.eq(result.body.kind, errors.INTERNAL); test.is_false(result.body.retryable); test.not_nil(result.body.details.code); test.eq(fixture.releases, 1)
                end)
            end
        end
    end)
end)}
