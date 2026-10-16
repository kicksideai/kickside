local test = require("test")
local funcs = require("funcs")
local reaper = require("reaper_fixture")
local dependency = require("dependency_fixture")
local consts = require("lifecycle_consts")
local M = {}

function M.probe(input)
    dependency.configure({stage = "valid", kind = errors.INTERNAL})
    local result, err = reaper.run({thread_id = consts.thread_id(), range = {to_seq = 42},
        events = {{type = input.event_type, body = input.body}}})
    for _, name in ipairs({"scan", "delete", "discovery", "dispatch"}) do
        test.eq(dependency.calls[name], 0)
    end
    return result, err
end

M.run = test.run_cases(function()
    test.describe("native lifecycle event decoding", function()
        for _, event_type in ipairs({consts.EVENT.PRINCIPAL_DELETED, consts.EVENT.COMPONENT_DELETED}) do
            for _, input in ipairs({{name = "missing"}, {name = "empty", body = ""},
                {name = "malformed", body = "{bad"}, {name = "truncated", body = '{"subject_id":'},
                {name = "number", body = 42}, {name = "boolean", body = false},
                {name = "json-number", body = "42"}, {name = "json-string", body = '"owner"'},
                {name = "json-null", body = "null"}, {name = "json-boolean", body = "false"}}) do
                for _, boundary in ipairs({"library", "funcs"}) do
                    test.it(event_type .. "/" .. input.name .. "/" .. boundary, function()
                        local request = {event_type = event_type, body = input.body}
                        local result, err
                        if boundary == "library" then result, err = M.probe(request)
                        else result, err = funcs.call("app:reaper_body_native_probe", request) end
                        test.is_nil(result)
                        test.not_nil(err)
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, "persisted_data")
                        test.eq(err:details().field, "lifecycle.event.body")
                    end)
                end
            end
            for _, body in ipairs({{subject_id = "owner"}, '{"subject_id":"owner"}'}) do
                test.it(event_type .. "/valid/" .. type(body), function()
                    dependency.configure({stage = "valid", kind = errors.INTERNAL})
                    local result, err = reaper.run({thread_id = consts.thread_id(), range = {to_seq = 42},
                        events = {{type = event_type, body = body}}})
                    test.is_nil(err)
                    test.eq(result.last_seq, 42)
                    test.eq(result.body.stats.reaped, 0)
                    test.eq(dependency.calls.scan, 1)
                    test.eq(dependency.calls.delete, 0)
                    test.eq(dependency.calls.dispatch, event_type == consts.EVENT.PRINCIPAL_DELETED and 1 or 0)
                end)
            end
        end
        test.it("retains subject validation after successful decoding", function()
            local result, err = M.probe({event_type = consts.EVENT.PRINCIPAL_DELETED, body = {subject_id = {"owner"}}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
        end)
        test.it("ignores unrelated event bodies", function()
            local result, err = M.probe({event_type = "unrelated.event", body = "{bad"})
            test.is_nil(err)
            test.eq(result.last_seq, 42)
        end)
    end)
end)
return M
