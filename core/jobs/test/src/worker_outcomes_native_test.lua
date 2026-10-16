local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local json = require("canonical_json")
local types = require("job_types")
local function native_response(response: table): (table?, error?)
    if response.ok == true then return response, nil end
    if response.ok == false then
        local err, decode_err = types.error_from_data(response.error_native)
        return nil, decode_err or err
    end
    return nil, errors.new({kind = errors.INVALID, retryable = false, message = "job child returned invalid status envelope"})
end
local function encoded(value: any): string
    local out, err = json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker outcome guard requires JSON proof"})) end
    return out
end
local stages = {"run.start", "lease.validate", "lease.start", "failure", "completion", "self.finalize", "hold"}
local function setup(stage: string, source: error?, secondary: error?): ()
    fixture.reset("", nil, secondary)
    if stage == "run.start" then fixture.run_start_error = source
    elseif stage == "lease.validate" then fixture.validation_error = source
    elseif stage == "lease.start" then fixture.lease_start_error = source
    elseif stage == "failure" then
        fixture.execute_error = errors.new({kind = errors.INVALID, retryable = false, message = "opaque target refusal", details = {code = "target"}})
        fixture.settle_error = source
    elseif stage == "completion" then fixture.complete_error = source
    elseif stage == "self.finalize" then fixture.child_output = {self_completed = true}; fixture.finalize_error = source
    elseif stage == "hold" then fixture.proc_binding = {}; fixture.execution_control = "termination_unconfirmed"; fixture.hold_error = source
    end
end
local function invoke(child: boolean, stage: string): error?
    local job = {id = "job", worker_id = "worker", lease_token = "lease", execution_seq = 1}
    local run_id = stage ~= "run.start" and "run" or nil
    if not child then local _, actual = worker.process_job(fixture.database(), "sqlite", "worker", job, run_id); return actual end
    local response = worker.run_job_child({job = job, run_id = run_id})
    local output, actual = native_response(response); test.is_nil(output)
    test.eq(fixture.calls.release, 1)
    return actual
end
local function fields(actual: error?, source: error, composed: boolean): ()
    test.not_nil(actual)
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker outcome guard requires native failure"})) end
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    if composed then
        test.eq(encoded((actual:details() or {}).cause), encoded(types.error_to_data(source)))
        test.eq(encoded((actual:details() or {}).operation_error), encoded(types.error_to_data(fixture.execute_error)))
    else test.eq(encoded(actual:details()), encoded(source:details())) end
end
local function counters(stage: string): ()
    local executes = stage == "failure" or stage == "completion" or stage == "self.finalize" or stage == "hold"
    test.eq(fixture.calls.execute or 0, executes and 1 or 0)
    test.eq(fixture.calls["lease.stop"] or 0, executes and 1 or 0)
    test.eq(fixture.calls.complete or 0, stage == "completion" and 1 or 0)
    test.eq(fixture.calls.hold or 0, stage == "hold" and 1 or 0)
end
return {run = test.run_cases(function()
    test.describe("native worker persistence outcomes", function()
        for _, stage in ipairs(stages) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
                errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        for _, child in ipairs({false, true}) do
                            test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed) .. "/" .. tostring(child), function()
                                local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque dependency refusal",
                                    details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil})
                                setup(stage, source, nil); fields(invoke(child, stage), source, stage == "failure"); counters(stage)
                            end)
                        end
                    end
                end
            end
            test.it(stage .. "/owned release preserves both causes", function()
                local source = errors.new({kind = errors.CONFLICT, retryable = true, message = "opaque operation refusal", details = {code = "operation"}})
                local release = errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "opaque release refusal", details = {code = "release"}})
                setup(stage, source, release); local actual = invoke(true, stage); test.not_nil(actual)
                if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker outcome guard requires cleanup failure"})) end
                test.eq(actual:kind(), release:kind()); test.eq(actual:retryable(), release:retryable())
                test.eq(encoded((actual:details() or {}).cause), encoded(types.error_to_data(release)))
                local previous, err = types.error_from_data((actual:details() or {}).operation_error); test.is_nil(err)
                fields(previous, source, stage == "failure"); counters(stage)
            end)
        end
        for _, stage in ipairs({"run.start", "lease.start", "failure"}) do
            test.it(stage .. "/required completion reply", function()
                setup(stage, nil, nil)
                local field = "run.context"
                if stage == "run.start" then fixture.run_context = nil
                elseif stage == "lease.start" then fixture.heartbeat_id = nil; field = "heartbeat.id"
                else fixture.recorded_override = true; fixture.recorded_value = false; field = "failure.recorded" end
                local actual = invoke(false, stage); test.not_nil(actual)
                if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker outcome guard requires completion refusal"})) end
                test.eq(actual:kind(), errors.INTERNAL); test.eq(actual:retryable(), false)
                test.eq((actual:details() or {}).code, "job_worker_response"); test.eq((actual:details() or {}).field, field)
            end)
        end
        test.it("confirmed lost validation lease refuses before dispatch", function()
            setup("lease.validate", nil, nil); fixture.validation_live = false
            local actual = invoke(false, "lease.validate"); test.not_nil(actual)
            if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker outcome guard requires lease refusal"})) end
            test.is_true(types.is_lease_lost_error(actual)); counters("lease.validate")
        end)
        test.it("healthy completed target keeps existing control", function()
            setup("", nil, nil); local control, err = worker.process_job(fixture.database(), "sqlite", "worker", {id = "job"}, "run")
            test.is_nil(control); test.is_nil(err); test.eq(fixture.calls.execute, 1); test.eq(fixture.calls.complete, 1)
        end)
        test.it("persisted target failure has no boundary failure", function()
            setup("failure", nil, nil); local control, err = worker.process_job(fixture.database(), "sqlite", "worker", {id = "job"}, "run")
            test.is_nil(control); test.is_nil(err); test.eq(fixture.calls.execute, 1); test.eq(fixture.calls.settle, 1)
        end)
    end)
end)}
