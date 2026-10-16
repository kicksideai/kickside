local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local json = require("canonical_json")
local function encoded(value: any): string
    local out, err = json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "options guard requires JSON proof"})) end
    return out
end
local function failed(): error
    local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
    test.is_false(ok)
    if type(err) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "options guard requires native exit"})) end
    return err :: error
end
local function counters(): ()
    test.eq(fixture.calls.options, 1); test.eq(fixture.calls.stop, 1)
    test.eq(fixture.calls.unlisten, 1); test.eq(fixture.calls.close, 1)
    test.is_nil(fixture.calls.database); test.is_nil(fixture.calls.release)
    test.is_nil(fixture.calls["heartbeat.id"]); test.is_nil(fixture.calls.send)
end
return {run = test.run_cases(function()
    test.describe("native worker process options", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                        local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque options refusal",
                            details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil})
                        fixture.reset("options", source, nil); local actual = failed()
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(encoded(actual:details()), encoded(source:details())); counters()
                    end)
                end
            end
        end
        for _, stage in ipairs({"stop", "unlisten", "close"}) do
            test.it("cleanup/" .. stage, function()
                local source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque options refusal",
                    details = {code = "operation", nested = {marker = "primary"}}})
                local secondary = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "opaque cleanup refusal",
                    details = {code = "cleanup", nested = {marker = "secondary"}}})
                fixture.reset("options", source, nil, {[stage] = secondary}); local actual = failed()
                test.eq(actual:kind(), secondary:kind()); test.eq(actual:retryable(), secondary:retryable())
                local details = actual:details()
                test.eq(encoded(details.cause), encoded({kind = secondary:kind(), message = secondary:message(), retryable = secondary:retryable(), details = secondary:details()}))
                test.eq(details.operation_error.kind, source:kind()); test.eq(details.operation_error.retryable, source:retryable())
                test.eq(encoded(details.operation_error.details), encoded(source:details())); counters()
            end)
        end
        test.it("missing options completion proof refuses permanently", function()
            fixture.reset("options", nil, nil); local actual = failed()
            test.eq(actual:kind(), errors.INTERNAL); test.is_false(actual:retryable())
            test.eq(actual:details().code, "job_worker_response"); test.eq(actual:details().field, "process.options"); counters()
        end)
        test.it("confirmed options keep the idle refusal classification", function()
            fixture.reset("", nil, nil); local actual = failed()
            test.eq(actual:kind(), errors.INTERNAL); test.is_false(actual:retryable())
            test.eq(actual:details().code, "job_idle_report_response")
            test.eq(fixture.calls.options, 1); test.eq(fixture.calls.database, 1); test.eq(fixture.calls.send, 1)
        end)
    end)
end)}
