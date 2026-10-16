local test = require("test")
local fixture = require("fixture")
local canonical_json = require("canonical_json")
local routes = {
    {name = "create_thread", adapter = require("create_thread")},
    {name = "update_thread", adapter = require("update_thread")},
    {name = "delete_thread", adapter = require("delete_thread")},
    {name = "post_event", adapter = require("post_event")},
    {name = "post_message", adapter = require("post_message")},
    {name = "ingest_events_batch", adapter = require("ingest_events_batch")},
}
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP write guard requires JSON proof"})) end
    return result
end
local statuses = {[errors.NOT_FOUND] = 404, [errors.ALREADY_EXISTS] = 409, [errors.INVALID] = 400,
    [errors.PERMISSION_DENIED] = 403, [errors.UNAVAILABLE] = 503, [errors.CONFLICT] = 409,
    [errors.TIMEOUT] = 504, [errors.RATE_LIMITED] = 429}
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN, "future_kind"}
return {run = test.run_cases(function()
    test.describe("native Core HTTP mutation responses", function()
        for _, route in ipairs(routes) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.name .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "not_found",
                            details = {code = "http_write_dependency", nested = {marker = "kept"}}})
                        fixture.reset("failure", source); route.adapter.handler()
                        test.eq(fixture.status, statuses[kind] or 500); test.eq(fixture.calls, 1)
                        test.eq(encoded(fixture.body), encoded({success = false, error = source:message(), kind = source:kind(),
                            retryable = source:retryable(), details = source:details()}))
                    end)
                end
            end
            for _, message in ipairs({"bad_request", "forbidden", "not_found", "conflict", "server_error", "not found permission denied"}) do
                test.it(route.name .. "/opaque/" .. message, function()
                    fixture.reset("failure", message); route.adapter.handler()
                    local native = errors.new({kind = errors.UNKNOWN, message = message})
                    test.eq(fixture.status, 500); test.eq(fixture.calls, 1)
                    test.eq(encoded(fixture.body), encoded({success = false, error = message, kind = native:kind(), retryable = native:retryable()}))
                end)
            end
            test.it(route.name .. "/missing result", function()
                fixture.reset("missing_result", nil); route.adapter.handler()
                test.eq(fixture.status, 500); test.eq(fixture.calls, 1); test.is_false(fixture.body.success)
                test.eq(fixture.body.kind, errors.INTERNAL); test.is_false(fixture.body.retryable); test.not_nil(fixture.body.details.code)
            end)
            test.it(route.name .. "/healthy shape", function()
                fixture.reset("", nil); route.adapter.handler()
                test.eq(fixture.status, (route.name == "create_thread" or route.name == "post_event" or route.name == "post_message") and 201 or 200)
                local expected
                if route.name == "create_thread" then expected = {success = true, thread = {id = "thread", marker = "kept"}, component_id = "thread"}
                elseif route.name == "update_thread" then expected = {success = true, thread = {id = "thread", marker = "kept"}}
                elseif route.name == "delete_thread" then expected = {success = true, thread_id = "thread"}
                elseif route.name == "post_message" then expected = {success = true, event = {id = "event", seq = 1, body = {text = "kept"}}, duplicate = false}
                else expected = {success = true, inserted = 1, duplicates = 0, max_seq = 1} end
                test.eq(encoded(fixture.body), encoded(expected)); test.eq(fixture.calls, route.name == "post_message" and 2 or 1)
            end)
            if route.name ~= "create_thread" then
                test.it(route.name .. "/missing address", function()
                    fixture.reset("missing_id", nil); route.adapter.handler()
                    test.eq(fixture.status, 400); test.eq(fixture.calls, 0); test.is_false(fixture.body.success)
                    test.eq(fixture.body.kind, errors.INVALID); test.is_false(fixture.body.retryable); test.not_nil(fixture.body.details.code)
                end)
            end
            if route.name ~= "create_thread" and route.name ~= "delete_thread" then
                test.it(route.name .. "/missing required body", function()
                    fixture.reset("missing_body", nil); route.adapter.handler()
                    test.eq(fixture.status, 400); test.eq(fixture.calls, 0); test.eq(fixture.body.kind, errors.INVALID); test.is_false(fixture.body.retryable)
                    test.not_nil(fixture.body.details.code)
                end)
            end
            if route.name ~= "delete_thread" then
                test.it(route.name .. "/real malformed JSON preserves existing bad request", function()
                    fixture.reset("invalid_json", nil); route.adapter.handler()
                    test.eq(fixture.status, 400); test.eq(fixture.calls, 0); test.is_false(fixture.body.success)
                end)
            end
        end
        local message = require("post_message")
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("post_message/completed append/read failure/" .. kind .. "/" .. tostring(policy.retryable), function()
                    local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "appended_message_read", nested = {marker = "kept"}}})
                    fixture.reset("list_failure", source); message.handler()
                    test.eq(fixture.status, statuses[kind] or 500); test.eq(fixture.calls, 2); test.eq(fixture.list_calls, 1)
                    test.is_false(fixture.body.success); test.eq(fixture.body.kind, source:kind()); test.is_false(fixture.body.retryable)
                    test.eq(fixture.body.details.code, source:details().code); test.eq(fixture.body.details.nested.marker, "kept")
                    test.eq(fixture.body.details.cause.kind, source:kind()); test.eq(fixture.body.details.cause.retryable, source:retryable())
                    test.eq(encoded(fixture.body.details.cause.details), encoded(source:details()))
                end)
            end
        end
        test.it("real SDK wrap makes opaque failures native without message parsing", function()
            local wrapped = errors.wrap("not_found", "Read appended message")
            test.is_true(errors.is(wrapped, errors.UNKNOWN))
            test.eq(wrapped:message(), errors.new("not_found"):message())
            test.is_nil(wrapped:retryable()); test.is_nil(wrapped:details())
        end)
        for _, text in ipairs({"not_found", "conflict", "bad_request", "opaque failure"}) do
            test.it("post_message/completed append/opaque read/" .. text, function()
                fixture.reset("list_failure", text); message.handler()
                test.eq(fixture.status, 500); test.eq(fixture.calls, 2); test.eq(fixture.list_calls, 1)
                test.is_false(fixture.body.success); test.eq(fixture.body.kind, errors.UNKNOWN); test.is_false(fixture.body.retryable)
                test.eq(fixture.body.details.cause.kind, errors.UNKNOWN)
                test.is_nil(fixture.body.details.cause.retryable); test.is_nil(fixture.body.details.cause.details)
            end)
        end
        for _, stage in ipairs({"missing_events", "invalid_events"}) do
            test.it("post_message/missing appended collection proof/" .. stage, function()
                fixture.reset(stage, nil); message.handler()
                test.eq(fixture.status, 500); test.eq(fixture.calls, 2); test.is_false(fixture.body.success)
                test.eq(fixture.body.kind, errors.INTERNAL); test.is_false(fixture.body.retryable); test.not_nil(fixture.body.details.code)
            end)
        end
        test.it("post_message/missing appended read proof", function()
            fixture.reset("missing_list", nil); message.handler()
            test.eq(fixture.status, 500); test.eq(fixture.calls, 2); test.is_false(fixture.body.success)
            test.eq(fixture.body.kind, errors.INTERNAL); test.is_false(fixture.body.retryable); test.not_nil(fixture.body.details.code)
        end)
        test.it("post_message/duplicate keeps shape and skips follow-up read", function()
            fixture.reset("duplicate", nil); message.handler()
            test.eq(fixture.status, 201); test.eq(fixture.calls, 1); test.eq(fixture.list_calls, 0)
            test.eq(encoded(fixture.body), encoded({success = true, duplicate = true}))
        end)
        for _, stage in ipairs({"empty_text", "empty_events", "scalar_event"}) do
            test.it("originated input validation/" .. stage, function()
                fixture.reset(stage, nil)
                if stage == "empty_text" then message.handler() else require("ingest_events_batch").handler() end
                test.eq(fixture.status, 400); test.eq(fixture.calls, 0); test.eq(fixture.body.kind, errors.INVALID); test.is_false(fixture.body.retryable)
                test.not_nil(fixture.body.details.code)
            end)
        end
    end)
end)}
