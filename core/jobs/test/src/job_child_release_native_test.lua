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
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "child release guard requires JSON proof"})) end
    return out
end
local function invoke(): (table?, error?)
    local response = worker.run_job_child({job = {id = "job", worker_id = "worker", lease_token = "lease", execution_seq = 1}, run_id = "run"})
    return native_response(response)
end
local function counters(mode: string): ()
    test.eq(fixture.calls.database, 1); test.eq(fixture.calls.release, 1); test.eq(fixture.calls.execute, 1)
    test.eq(fixture.calls["lease.validate"], 1); test.eq(fixture.calls["lease.start"], 1); test.eq(fixture.calls["lease.stop"], 1)
    test.eq(fixture.calls.complete or 0, mode == "complete" and 1 or 0)
    test.eq(fixture.calls.finalize or 0, mode == "self" and 1 or 0)
end
return {run = test.run_cases(function()
    test.describe("native job child release after execution", function()
        local outcomes = {{mode = "complete", value = {}}, {mode = "self", value = {self_completed = true}},
            {mode = "settled", value = {self_completed = true, completion = {run_history_settled = true}}}}
        for _, outcome in ipairs(outcomes) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
                errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(outcome.mode .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque release refusal",
                                details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset("", nil, source); fixture.child_output = outcome.value; local output, actual = invoke()
                            test.is_nil(output)
                            if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "child release guard requires native outcome"})) end
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(encoded(actual:details()), encoded(source:details())); counters(outcome.mode)
                        end)
                    end
                end
            end
            test.it(outcome.mode .. "/healthy release retains child success", function()
                fixture.reset("", nil, nil); fixture.child_output = outcome.value; local output, err = invoke()
                test.not_nil(output); test.is_nil(err); test.is_nil(output.control)
                counters(outcome.mode)
            end)
        end
    end)
end)}
