local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local json = require("canonical_json")
local function native_response(response: table): (table?, error?)
    if response.ok == true then return response, nil end
    if response.ok == false then
        local err, decode_err = job_types.error_from_data(response.error_native)
        return nil, decode_err or err
    end
    return nil, errors.new({kind = errors.INVALID, retryable = false, message = "job child returned invalid status envelope"})
end
local function encoded(value: any): string
    local out, err = json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "child startup guard requires JSON proof"})) end
    return out
end
local function invoke(): error
    local response = worker.run_job_child({job = {id = "job", worker_id = "worker", lease_token = "lease", execution_seq = 1}, run_id = "run"})
    local output, err = native_response(response)
    test.is_nil(output)
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "child startup guard requires a native error"})) end
    return err
end
local function counters(stage: string): ()
    test.eq(fixture.calls.options, 1)
    test.eq(fixture.calls.registration or 0, stage == "options" and 0 or 1)
    test.eq(fixture.calls.database or 0, (stage == "options" or stage == "registration") and 0 or 1)
    test.eq(fixture.calls.release or 0, (stage == "database.type" or stage == "start") and 1 or 0)
    test.is_nil(fixture.calls.child); test.is_nil(fixture.calls.send)
    test.is_nil(fixture.calls.stop); test.is_nil(fixture.calls.unlisten); test.is_nil(fixture.calls.close)
    test.eq(fixture.calls.start or 0, stage == "start" and 1 or 0)
end
return {run = test.run_cases(function()
    test.describe("native job child startup", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"options", "registration", "database", "database.type", "start"}) do
            for _, kind in ipairs(kinds) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque child startup refusal",
                                details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset(stage, source, nil); local actual = invoke()
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(encoded(actual:details()), encoded(source:details())); counters(stage)
                        end)
                    end
                end
            end
        end
        for _, stage in ipairs({"database.type", "start"}) do
            for _, kind in ipairs(kinds) do
                test.it("release/" .. stage .. "/" .. kind, function()
                    local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque child startup refusal",
                        details = {code = "operation", nested = {marker = "primary"}}})
                    local secondary = errors.new({kind = kind, retryable = true, message = "opaque release refusal",
                        details = {code = "release", nested = {marker = "secondary"}}})
                    fixture.reset(stage, primary, secondary); local actual = invoke()
                    test.eq(actual:kind(), secondary:kind()); test.eq(actual:retryable(), secondary:retryable())
                    local details = actual:details()
                    test.eq(encoded(details.cause), encoded({kind = secondary:kind(), message = secondary:message(), retryable = secondary:retryable(), details = secondary:details()}))
                    test.eq(details.operation_error.kind, primary:kind()); test.eq(details.operation_error.retryable, primary:retryable())
                    test.eq(encoded(details.operation_error.details), encoded(primary:details())); counters(stage)
                end)
            end
        end
        for _, stage in ipairs({"options", "registration", "database", "database.type", "start"}) do
            test.it("missing completion/" .. stage, function()
                fixture.reset(stage, nil, nil); local actual = invoke()
                test.eq(actual:kind(), errors.INTERNAL); test.is_false(actual:retryable())
                test.eq(actual:details().code, "job_child_response"); test.eq(actual:details().field, stage); counters(stage)
            end)
        end
        test.it("confirmed stale start fence retains lease-loss classification", function()
            fixture.reset("", nil, nil); fixture.start_false = true; local actual = invoke()
            test.eq(actual:kind(), errors.CONFLICT); test.is_false(actual:retryable())
            test.eq(actual:details().code, job_types.ERROR_CODE.LEASE_LOST); counters("start")
        end)
        test.it("missing job retains native Invalid before all resources", function()
            fixture.reset("", nil, nil); local response = worker.run_job_child({})
            local output, actual = native_response(response)
            test.is_nil(output); test.eq(actual:kind(), errors.INVALID); test.is_nil(next(fixture.calls))
        end)
    end)
end)}
