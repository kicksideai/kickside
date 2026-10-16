local test = require("test")
local lease = require("lease")
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
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease stop guard requires JSON proof"})) end
    return out
end
local function fields(actual: error?, source: error): ()
    test.not_nil(actual)
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease stop guard requires native refusal"})) end
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(encoded(actual:details()), encoded(source:details()))
end
local function cancel(reply: any, source: error?): error?
    local original = lease._cancel
    local calls = 0
    lease._cancel = function(pid: string, grace: string): (any, error?)
        calls = calls + 1; test.eq(pid, "owned-heartbeat"); test.eq(grace, "1s")
        return reply, source
    end
    local ok, actual = pcall(lease.stop, "owned-heartbeat")
    lease._cancel = original
    if not ok then error(actual) end
    test.eq(calls, 1)
    return actual
end
local function child(source: error?, secondary: error?): (table?, error?)
    fixture.reset("", nil, secondary); fixture.lease_stop_error = source
    local response = worker.run_job_child({job = {id = "job", worker_id = "worker", lease_token = "lease", execution_seq = 1}, run_id = "run"})
    local out, err = native_response(response)
    test.eq(fixture.calls.execute, 1); test.eq(fixture.calls["lease.stop"], 1)
    test.eq(fixture.calls.complete, 1); test.eq(fixture.calls.release, 1)
    return out, err
end
return {run = test.run_cases(function()
    test.describe("native lease heartbeat cancellation", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    local function source(): error return errors.new({kind = kind, retryable = opts.retryable, message = "opaque cancellation refusal",
                        details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil}) end
                    test.it("direct/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                        local err = source(); fields(cancel(true, err), err)
                    end)
                    test.it("child/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                        local err = source(); local _, actual = child(err, nil); fields(actual, err)
                    end)
                    test.it("child cleanup/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                        local primary = source(); local secondary = errors.new({kind = errors.UNAVAILABLE, retryable = false,
                            message = "opaque release refusal", details = {code = "release", nested = {marker = "kept"}}})
                        local _, actual = child(primary, secondary); test.eq(actual:kind(), secondary:kind()); test.eq(actual:retryable(), secondary:retryable())
                        local details = actual:details(); test.not_nil(details)
                        if not details then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease stop guard requires cleanup causes"})) end
                        test.eq(encoded(details.cause), encoded({kind = secondary:kind(), message = secondary:message(), retryable = secondary:retryable(), details = secondary:details()}))
                        test.eq(encoded(details.operation_error), encoded({kind = primary:kind(), message = primary:message(), retryable = primary:retryable(), details = primary:details()}))
                    end)
                end
            end
        end
        for _, reply in ipairs({{value = false}, {}}) do
            test.it("missing cancellation completion/" .. tostring(reply.value), function()
                local actual = cancel(reply.value, nil); test.not_nil(actual)
                if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease stop guard requires completion refusal"})) end
                test.eq(actual:kind(), errors.INTERNAL); test.eq(actual:retryable(), false)
                test.eq((actual:details() or {}).code, "job_lease_response"); test.eq((actual:details() or {}).field, "process.cancel")
            end)
        end
        test.it("healthy cancellation and completion", function() local output, err = child(nil, nil); test.is_nil(cancel(true, nil)); test.not_nil(output); test.is_nil(err) end)
        test.it("absent heartbeat owns no cancellation", function()
            local original = lease._cancel; local calls = 0
            lease._cancel = function(...): (any, error?) calls = calls + 1; return true, nil end
            local ok, actual = pcall(lease.stop, nil); lease._cancel = original
            if not ok then error(actual) end
            test.is_nil(actual); test.eq(calls, 0)
        end)
    end)
end)}
