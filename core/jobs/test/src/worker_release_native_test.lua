local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local process = require("process")
local canonical_json = require("canonical_json")
local function encoded(value: any): string
    local out, err = canonical_json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "release guard requires JSON proof"})) end
    return out
end
local function prepare(mode: string, source: error?, cleanup_errors: table?): ()
    fixture.reset("", nil, source, cleanup_errors)
    if mode == "settled" then
        fixture.release_at, fixture.send_reply = 2, true
        fixture.schedule = {
            {source = "assignment", value = {job = {id = "job", worker_id = "worker"}, run_ctx = {id = "run"}, epoch = 1}},
            {source = "events", value = {kind = process.event.CANCEL}},
        }
    end
end
local function failed(): error
    local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
    test.is_false(ok)
    if type(err) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "release guard requires a native error"})) end
    return err :: error
end
local function counts(mode: string): ()
    test.eq(fixture.calls.release, mode == "settled" and 2 or 1)
    test.eq(fixture.calls.stop, 1); test.eq(fixture.calls.unlisten, 1); test.eq(fixture.calls.close, 1)
    if mode == "settled" then
        test.eq(fixture.calls.send, 1); test.eq(fixture.calls.child, 1); test.eq(fixture.calls.marker, 1); test.eq(fixture.calls.database, 2)
    else
        test.is_nil(fixture.calls.send); test.is_nil(fixture.calls.child); test.is_nil(fixture.calls.marker); test.eq(fixture.calls.database, 1)
    end
end
return {run = test.run_cases(function()
    test.describe("native worker database release", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, mode in ipairs({"initial", "settled"}) do
            for _, kind in ipairs(kinds) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(mode .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque database release refusal",
                                details = detailed and {code = "release_dependency", nested = {marker = "kept"}} or nil})
                            prepare(mode, source, nil); local actual = failed()
                            test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                            test.eq(encoded(actual:details()), encoded(source:details())); counts(mode)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"stop", "unlisten", "close"}) do
                for _, kind in ipairs(kinds) do
                    for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it("cleanup/" .. mode .. "/" .. stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                                local primary = errors.new({kind = errors.CONFLICT, retryable = false, message = "opaque release refusal",
                                    details = {code = "release_dependency", nested = {marker = "primary"}}})
                                local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque cleanup refusal",
                                    details = detailed and {code = "cleanup_dependency", nested = {marker = "kept"}} or nil})
                                prepare(mode, primary, {[stage] = source}); local actual = failed()
                                test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                                local details = actual:details(); test.eq(encoded(details.cause), encoded({kind = source:kind(), message = source:message(), retryable = source:retryable(), details = source:details()}))
                                local operation = details.operation_error; test.eq(operation.kind, primary:kind()); test.eq(operation.retryable, primary:retryable())
                                test.eq(encoded(operation.details), encoded(primary:details())); counts(mode)
                            end)
                        end
                    end
                end
            end
        end
        test.it("healthy release keeps the completed child and both idle offers", function()
            prepare("settled", nil, nil)
            local ok, err = pcall(worker.run_loop, {dispatcher_pid = "dispatcher"})
            test.is_true(ok); test.is_nil(err); test.eq(fixture.calls.release, 2); test.eq(fixture.calls.send, 2)
            test.eq(fixture.calls.child, 1); test.eq(fixture.calls.marker, 1); test.eq(fixture.calls.database, 2)
            test.eq(fixture.calls.stop, 1); test.eq(fixture.calls.unlisten, 1); test.eq(fixture.calls.close, 1)
        end)
    end)
end)}
