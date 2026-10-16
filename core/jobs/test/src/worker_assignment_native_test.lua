local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local process = require("process")
local json = require("canonical_json")
local function encoded(value: any): string
    local out, err = json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "assignment guard requires JSON proof"})) end
    return out
end
local function assignment(): table
    return {job = {id = "job", worker_id = "worker"}, run_ctx = {id = "run"}, epoch = 1}
end
local function prepare(stage: string, source: error?, cleanup_stage: string?, secondary: error?): ()
    fixture.reset(stage == "marker" and stage or "", stage == "marker" and source or nil,
        cleanup_stage == "release" and secondary or nil, cleanup_stage and cleanup_stage ~= "release" and {[cleanup_stage] = secondary} or nil)
    fixture.release_at, fixture.send_reply = 2, true
    fixture.schedule = {{source = "assignment", value = assignment()}, {source = "events", value = {kind = process.event.CANCEL}}}
    if stage == "reopen" then fixture.reopen_active, fixture.reopen_error = true, source end
    if stage == "settle" then
        fixture.child_error = errors.new({kind = errors.INVALID, retryable = false, message = "child refuses execution"})
        fixture.settle_error = source
    end
end
local function failed(): error
    local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
    test.is_false(ok)
    if type(err) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "assignment guard requires native exit"})) end
    return err :: error
end
local function fields(actual: error, source: error): ()
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(encoded(actual:details()), encoded(source:details()))
end
local function counts(stage: string): ()
    test.eq(fixture.calls.send, 1); test.eq(fixture.calls.child, 1); test.eq(fixture.calls.database, 2)
    test.eq(fixture.calls.release, stage == "reopen" and 1 or 2)
    test.eq(fixture.calls.stop, 1); test.eq(fixture.calls.unlisten, 1); test.eq(fixture.calls.close, 1)
    if stage ~= "marker" then test.is_nil(fixture.calls.marker) else test.eq(fixture.calls.marker, 1) end
end
return {run = test.run_cases(function()
    test.describe("native worker assignment outcomes", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"reopen", "settle", "marker"}) do
            for _, kind in ipairs(kinds) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque assignment refusal",
                                details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil})
                            prepare(stage, source, nil, nil); fields(failed(), source); counts(stage)
                        end)
                    end
                end
            end
            for _, cleanup_stage in ipairs(stage == "reopen" and {"stop", "unlisten", "close"} or {"release", "stop", "unlisten", "close"}) do
                test.it(stage .. "/cleanup/" .. cleanup_stage, function()
                    local source = errors.new({kind = errors.CONFLICT, retryable = false, message = "opaque operation refusal",
                        details = {code = "operation", nested = {marker = "primary"}}})
                    local secondary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "opaque cleanup refusal",
                        details = {code = "cleanup", nested = {marker = "secondary"}}})
                    prepare(stage, source, cleanup_stage, secondary); local actual = failed()
                    test.eq(actual:kind(), secondary:kind()); test.eq(actual:retryable(), secondary:retryable())
                    local details = actual:details()
                    test.eq(encoded(details.cause), encoded({kind = secondary:kind(), message = secondary:message(), retryable = secondary:retryable(), details = secondary:details()}))
                    test.eq(details.operation_error.kind, source:kind()); test.eq(details.operation_error.retryable, source:retryable())
                    test.eq(encoded(details.operation_error.details), encoded(source:details())); counts(stage)
                end)
            end
        end
        test.it("missing reopen proof refuses permanently", function()
            prepare("reopen", nil, nil, nil); local err = failed()
            test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.eq(err:details().code, "job_worker_response")
            test.eq(err:details().field, "database"); counts("reopen")
        end)
        for i, value in ipairs({{value = nil}, {value = {}}, {value = {false}}, {value = {{}, {}}}, {value = {[2] = {}}}, {value = "invalid"}}) do
            test.it("missing/malformed marker proof/" .. tostring(i), function()
                prepare("marker", nil, nil, nil); fixture.marker_override, fixture.marker_value = true, value.value
                local err = failed(); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.eq(err:details().code, "job_worker_response"); test.eq(err:details().field, "assignment.marker"); counts("marker")
            end)
        end
        test.it("occupied marker refuses another idle offer", function()
            prepare("marker", nil, nil, nil); fixture.marker_override, fixture.marker_value = true, {{current_job_id = "job"}}
            local err = failed(); test.eq(err:kind(), errors.CONFLICT); test.is_false(err:retryable())
            test.eq(err:details().code, "job_worker_occupied"); counts("marker")
        end)
        for i, value in ipairs({{value = nil}, {value = {}}, {value = {job = {}, run_ctx = {id = "run"}, epoch = 1}},
            {value = {job = {worker_id = "worker"}, run_ctx = {}, epoch = 1}},
            {value = {job = {worker_id = "worker"}, run_ctx = {id = "run"}, epoch = 2}},
            {value = {job = {worker_id = "worker"}, run_ctx = {id = "run"}, epoch = "1"}}}) do
            test.it("invalid assignment/" .. tostring(i), function()
                prepare("", nil, nil, nil); fixture.schedule[1].value = value.value; local err = failed()
                test.eq(err:kind(), errors.INVALID); test.is_false(err:retryable()); test.eq(err:details().code, "job_worker_assignment")
                test.eq(fixture.calls.send, 1); test.is_nil(fixture.calls.child); test.is_nil(fixture.calls.marker)
                test.eq(fixture.calls.database, 1); test.eq(fixture.calls.release, 1)
                test.eq(fixture.calls.stop, 1); test.eq(fixture.calls.unlisten, 1); test.eq(fixture.calls.close, 1)
            end)
        end
        test.it("healthy assignment preserves both offers and one child", function()
            prepare("", nil, nil, nil)
            local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
            test.is_true(ok); test.is_nil(err); test.eq(fixture.calls.send, 2); test.eq(fixture.calls.child, 1)
            test.eq(fixture.calls.database, 2); test.eq(fixture.calls.release, 2); test.eq(fixture.calls.marker, 1)
        end)
    end)
end)}
