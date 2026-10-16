local test = require("test")
local worker = require("worker")
local real_worker = require("real_worker")
local fixture = require("fixture")
local config = require("config")
local canonical_json = require("canonical_json")
local process = require("process")
local channel = require("channel")
local time = require("time")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "idle guard requires JSON proof"})) end
    return data
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "idle guard requires a native error"})) end
    return err
end
return {run = test.run_cases(function()
    test.describe("native worker idle offer boundary", function()
        local payload = {worker_id = "worker", kind = "idle", version = "version", epoch = 7}
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque idle refusal",
                            details = detailed and {code = "idle_dependency", nested = {marker = "kept"}} or nil})
                        fixture.reset(nil, source)
                        local accepted, err = worker.send_idle("dispatcher", payload)
                        test.is_false(accepted); local actual = required(err)
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable()); test.eq(encoded(actual:details()), encoded(source:details()))
                        test.eq(fixture.sends, 1); test.eq(fixture.destination, "dispatcher"); test.eq(fixture.topic, config.IDLE_TOPIC); test.eq(encoded(fixture.payload), encoded(payload))
                    end)
                end
            end
        end
        test.it("requires the successful send proof", function()
            for _, reply in ipairs({{}, {value = false}}) do
                fixture.reset(reply.value, nil); local accepted, err = worker.send_idle("dispatcher", payload)
                test.is_false(accepted); local actual = required(err); test.eq(actual:kind(), errors.INTERNAL); test.is_false(actual:retryable())
                test.eq(actual:details().code, "job_idle_report_response"); test.eq(fixture.sends, 1)
            end
        end)
        test.it("keeps a successful offer and every payload field", function()
            fixture.reset(true, nil); local accepted, err = worker.send_idle("dispatcher", payload)
            test.is_true(accepted); test.is_nil(err); test.eq(fixture.sends, 1); test.eq(fixture.destination, "dispatcher")
            test.eq(fixture.topic, config.IDLE_TOPIC); test.eq(encoded(fixture.payload), encoded(payload))
        end)
        test.it("delivers the SDK idle refusal through the monitored loop exit", function()
            local destination = "0:missing-worker"
            local _, sdk_err = process.send(destination, config.IDLE_TOPIC, payload)
            local source = required(sdk_err)
            local lifecycle = process.events()
            local pid, spawn_err = process.spawn_monitored("kickside.core.jobs.service:loop", "app:processes",
                {dispatcher_pid = destination})
            test.is_nil(spawn_err)
            if type(pid) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "idle guard requires a child pid"})) end
            local deadline = time.after("15s")
            while true do
                local selected = channel.select({lifecycle:case_receive(), deadline:case_receive()})
                if selected.channel ~= lifecycle then
                    local _, stop_err = process.terminate(pid)
                    test.is_nil(stop_err)
                    error(errors.new({kind = errors.TIMEOUT, retryable = false, message = "idle loop exit does not arrive"}))
                end
                local event = selected.value
                if type(event) == "table" and event.kind == process.event.EXIT and tostring(event.from) == pid then
                    local result = event.result
                    if type(result) ~= "table" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "idle guard requires an exit result"})) end
                    local actual = required(result.error)
                    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                    test.eq(encoded(actual:details()), encoded(source:details()))
                    break
                end
            end
        end)
        test.it("keeps the real SDK send failure across the worker wrapper", function()
            local destination = "0:missing-worker"
            local _, sdk_err = process.send(destination, config.IDLE_TOPIC, payload)
            local source = required(sdk_err)
            local accepted, err = real_worker.send_idle(destination, payload)
            test.is_false(accepted); local actual = required(err)
            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable()); test.eq(encoded(actual:details()), encoded(source:details()))
        end)
    end)
end)}
