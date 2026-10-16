local test = require("test")
local boot = require("boot")
local fixture = require("fixture")
local json = require("canonical_json")
local process = require("process")
local channel = require("channel")
local time = require("time")
local function encoded(value: any): string
    local out, err = json.encode(value)
    if err then error(err) end
    if not out then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "boot guard requires JSON proof"})) end
    return out
end
local function fields(actual: any, source: error): ()
    test.eq(type(actual), "userdata")
    if type(actual) ~= "userdata" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "boot guard requires native failure"})) end
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(encoded(actual:details()), encoded(source:details()))
end
local function invoke(): error
    local ok, result = pcall(boot.main, nil); test.is_false(ok)
    return result
end
local function counters(stage: string): ()
    test.eq(fixture.calls.actor, 1); test.eq(fixture.calls.scope, 1)
    test.eq(fixture.calls.provision or 0, stage ~= "scope" and 1 or 0)
    test.eq(fixture.calls.converge or 0, (stage == "converge" or stage == "options") and 1 or 0)
    test.eq(fixture.calls.options or 0, 1)
    test.eq(fixture.calls.events or 0, stage == "options" and 0 or 1); test.eq(fixture.calls.receive or 0, stage == "options" and 0 or 1)
end
return {run = test.run_cases(function()
    test.describe("native lifecycle boot refusals", function()
        for _, stage in ipairs({"scope", "provision", "converge", "options"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
                errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = opts.retryable, message = "opaque boot refusal",
                                details = detailed and {code = "dependency", nested = {marker = "kept"}} or nil})
                            fixture.reset(stage, source); fields(invoke(), source); counters(stage)
                        end)
                    end
                end
            end
            for _, reply in ipairs({{}, {value = false}}) do
                test.it(stage .. "/missing mandatory reply/" .. tostring(reply.value), function()
                    fixture.reset(stage, nil, reply.value); local actual = invoke()
                    test.eq(actual:kind(), errors.INTERNAL); test.eq(actual:retryable(), false)
                    test.eq((actual:details() or {}).code, "lifecycle_boot_response"); test.eq((actual:details() or {}).field, stage)
                    counters(stage)
                end)
            end
            test.it(stage .. "/native monitored process exit", function()
                local events = process.events()
                local source = {kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque boot refusal",
                    details = {code = "dependency", nested = {marker = "kept"}}}
                local pid, spawn_err = process.spawn_monitored("app:lifecycle_boot_native_exit", "app:processes", {stage = stage, source = source})
                test.is_nil(spawn_err)
                if type(pid) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "boot guard requires owned child pid"})) end
                local deadline = time.after("15s")
                while true do
                    local selected = channel.select({events:case_receive(), deadline:case_receive()})
                    if selected.channel ~= events then
                        local _, stop_err = process.terminate(pid); test.is_nil(stop_err)
                        error(errors.new({kind = errors.TIMEOUT, retryable = false, message = "boot guard requires monitored exit"}))
                    end
                    local event = selected.value
                    if type(event) == "table" and event.kind == process.event.EXIT and tostring(event.from) == pid then
                        local result = event.result
                        if type(result) ~= "table" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "boot guard requires exit result"})) end
                        fields(result.error, errors.new(source)); break
                    end
                end
            end)
        end
        test.it("healthy boot retains one count and graceful closure", function()
            fixture.reset("", nil); local out = boot.main(nil); test.is_true(out.ok); test.eq(out.count, 1)
            for _, step in ipairs({"actor", "scope", "provision", "converge", "options", "events", "receive"}) do test.eq(fixture.calls[step], 1) end
        end)
    end)
end)}
