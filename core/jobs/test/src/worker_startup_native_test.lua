local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local canonical_json = require("canonical_json")
local function encoded(value: any): string
    local out, err = canonical_json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "startup guard requires JSON proof"})) end
    return out
end
local function failed(args: table): error
    local ok, actual = pcall(worker.run_loop, args)
    test.is_false(ok)
    if type(actual) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "startup guard requires a native raised error"})) end
    return actual :: error
end
local function cleanup(stage: string): ()
    test.eq(fixture.calls.release or 0, (stage == "subscription" or stage == "database") and 0 or 1)
    test.eq(fixture.calls.close or 0, stage == "subscription" and 0 or 1)
    test.eq(fixture.calls.unlisten or 0, stage == "subscription" and 0 or 1)
    test.eq(fixture.calls.stop or 0, stage == "subscription" and 0 or 1)
    test.is_nil(fixture.calls.send)
    if stage ~= "heartbeat.id" then test.is_nil(fixture.calls["heartbeat.id"]) end
end
return {run = test.run_cases(function()
    test.describe("native worker startup failures", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"subscription", "database", "database.type", "version", "heartbeat.mark", "heartbeat.id"}) do
            for _, kind in ipairs(kinds) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque startup refusal",
                                details = detailed and {code = "startup_dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset(stage, source, nil); local actual = failed({dispatcher_pid = "dispatcher"})
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(encoded(actual:details()), encoded(source:details())); cleanup(stage)
                        end)
                    end
                end
            end
        end
        for _, stage in ipairs({"database.type", "version", "heartbeat.mark", "heartbeat.id"}) do
            for _, kind in ipairs(kinds) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it("release/" .. stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local primary = errors.new({kind = errors.CONFLICT, retryable = false, message = "opaque startup refusal",
                                details = {code = "startup_dependency", nested = {marker = "primary"}}})
                            local secondary = errors.new({kind = kind, retryable = opts.retryable, message = "opaque release refusal",
                                details = detailed and {code = "release_dependency", nested = {marker = "secondary"}} or nil})
                            fixture.reset(stage, primary, secondary); local actual = failed({dispatcher_pid = "dispatcher"})
                            test.eq(actual:kind(), secondary:kind()); test.eq(actual:retryable(), secondary:retryable())
                            local details = actual:details(); test.eq(encoded(details.cause), encoded({kind = secondary:kind(), message = secondary:message(), retryable = secondary:retryable(), details = secondary:details()}))
                            local operation = details.operation_error; test.eq(operation.kind, primary:kind()); test.eq(operation.retryable, primary:retryable())
                            test.eq(encoded(operation.details), encoded(primary:details())); cleanup(stage)
                        end)
                    end
                end
            end
        end
        for _, stage in ipairs({"subscription", "database", "database.type", "version", "heartbeat.id"}) do
            test.it("requires startup proof/" .. stage, function()
                fixture.reset(stage, nil, nil); local actual = failed({dispatcher_pid = "dispatcher"})
                test.eq(actual:kind(), errors.INTERNAL); test.is_false(actual:retryable()); test.eq(actual:details().code, "job_worker_response")
                test.eq(actual:details().field, stage); cleanup(stage)
            end)
        end
        for _, args in ipairs({{}, {dispatcher_pid = ""}, {dispatcher_pid = false}, {dispatcher_pid = {}}}) do
            test.it("requires a dispatcher identity/" .. encoded(args), function()
                fixture.reset("", nil, nil); local actual = failed(args)
                test.eq(actual:kind(), errors.INVALID); test.is_false(actual:retryable()); test.eq(actual:details().code, "job_worker_identity")
                test.is_nil(next(fixture.calls))
            end)
        end
    end)
end)}
