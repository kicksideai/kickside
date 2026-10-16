local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local heartbeat = require("heartbeat")
local real_heartbeat = require("real_heartbeat")
local heartbeat_fixture = require("heartbeat_fixture")
local canonical_json = require("canonical_json")
local process = require("process")
local function encoded(value: any): string
    local out, err = canonical_json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cleanup guard requires JSON proof"})) end
    return out
end
local function required(err: any): error
    if type(err) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cleanup guard requires a native error"})) end
    return err :: error
end
local function envelope(err: error): table
    return {kind = err:kind(), message = err:message(), retryable = err:retryable(), details = err:details()}
end
local function failed(): error
    local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
    test.is_false(ok); return required(err)
end
local function cleaned(): ()
    test.eq(fixture.calls.stop, 1); test.eq(fixture.calls.unlisten, 1); test.eq(fixture.calls.close, 1)
    test.eq(fixture.calls.release, 1)
end
return {run = test.run_cases(function()
    local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
        errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
    test.describe("native worker cleanup composition", function()
        for _, mode in ipairs({"idle_refusal", "control"}) do
            for _, stage in ipairs({"stop", "unlisten", "close"}) do
                for _, kind in ipairs(kinds) do
                    for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(mode .. "/" .. stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque cleanup refusal",
                                    details = detailed and {code = "cleanup_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset("", nil, nil, {[stage] = source})
                                if mode == "control" then fixture.control = {kind = process.event.CANCEL} end
                                local actual = failed(); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                                if mode == "idle_refusal" then
                                    local details = actual:details(); test.eq(encoded(details.cause), encoded(envelope(source)))
                                    test.eq(details.operation_error.kind, errors.INTERNAL); test.is_false(details.operation_error.retryable)
                                    test.eq(details.operation_error.details.code, "job_idle_report_response"); test.eq(fixture.calls.send, 1)
                                else
                                    test.eq(encoded(actual:details()), encoded(source:details())); test.is_nil(fixture.calls.send)
                                end
                                cleaned()
                            end)
                        end
                    end
                end
            end
        end
        test.it("retains every ordered cleanup cause after the primary refusal", function()
            local stop = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "stop refusal", details = {code = "stop_dependency"}})
            local unlisten = errors.new({kind = errors.CONFLICT, retryable = false, message = "unlisten refusal", details = {code = "unlisten_dependency"}})
            local close = errors.new({kind = errors.TIMEOUT, message = "close refusal", details = {code = "close_dependency"}})
            fixture.reset("", nil, nil, {stop = stop, unlisten = unlisten, close = close})
            local actual = failed(); test.eq(actual:kind(), close:kind()); test.eq(actual:retryable(), close:retryable())
            test.eq(encoded(actual:details().cause), encoded(envelope(close)))
            local middle = actual:details().operation_error; test.eq(middle.kind, unlisten:kind()); test.eq(encoded(middle.details.cause), encoded(envelope(unlisten)))
            local first = middle.details.operation_error; test.eq(first.kind, stop:kind()); test.eq(encoded(first.details.cause), encoded(envelope(stop)))
            test.eq(first.details.operation_error.kind, errors.INTERNAL); test.eq(first.details.operation_error.details.code, "job_idle_report_response")
            cleaned(); test.eq(fixture.calls.send, 1)
        end)
        test.it("keeps successful lifecycle cleanup and does not offer idle", function()
            fixture.reset("", nil, nil, nil); fixture.control = {kind = process.event.CANCEL}
            local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
            test.is_true(ok); test.is_nil(err); cleaned(); test.is_nil(fixture.calls.send)
        end)
    end)
    test.describe("native heartbeat cancellation", function()
        for _, kind in ipairs(kinds) do
            for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                        local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque cancellation refusal",
                            details = detailed and {code = "cancel_dependency", nested = {marker = "kept"}} or nil})
                        heartbeat_fixture.reset("stop", "cancel", source, "sqlite")
                        local actual = required(heartbeat.stop("heartbeat")); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(encoded(actual:details()), encoded(source:details())); test.eq(#heartbeat_fixture.trace, 1); test.eq(heartbeat_fixture.trace[1], "cancel")
                    end)
                end
            end
        end
        test.it("requires cancellation completion proof", function()
            for _, proof in ipairs({{}, {value = false}}) do
                heartbeat_fixture.reset("stop", "cancel", nil, "sqlite"); heartbeat_fixture.missing, heartbeat_fixture.proof = true, proof.value
                local actual = required(heartbeat.stop("heartbeat")); test.eq(actual:kind(), errors.INTERNAL); test.is_false(actual:retryable())
                test.eq(actual:details().code, "job_heartbeat_response"); test.eq(actual:details().field, "process.cancel"); test.eq(#heartbeat_fixture.trace, 1)
            end
        end)
        test.it("keeps cancellation success", function()
            heartbeat_fixture.reset("stop", "", nil, "sqlite"); test.is_nil(heartbeat.stop("heartbeat"))
            test.eq(#heartbeat_fixture.trace, 1); test.eq(heartbeat_fixture.trace[1], "cancel")
        end)
        test.it("does not cancel an absent heartbeat", function()
            heartbeat_fixture.reset("stop", "", nil, "sqlite"); test.is_nil(heartbeat.stop(nil)); test.eq(#heartbeat_fixture.trace, 0)
        end)
        test.it("keeps the real SDK cancellation refusal", function()
            local destination = "0:missing-worker"
            local _, sdk_err = process.cancel(destination, "1s")
            local source = required(sdk_err); local actual = required(real_heartbeat.stop(destination))
            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable()); test.eq(encoded(actual:details()), encoded(source:details()))
        end)
    end)
end)}
