local test = require("test")
local fixture = require("fixture")
local canonical_json = require("canonical_json")
local routes = {
    {name = "get_thread", adapter = require("get_thread")},
    {name = "list_threads", adapter = require("list_threads")},
    {name = "list_children", adapter = require("list_children")},
    {name = "list_events", adapter = require("list_events")},
    {name = "list_jobs", adapter = require("list_jobs")},
    {name = "list_job_runs", adapter = require("list_job_runs")},
    {name = "get_graph", adapter = require("get_graph")},
}
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP read guard requires JSON result"})) end
    return result
end
local statuses = {[errors.NOT_FOUND] = 404, [errors.ALREADY_EXISTS] = 409, [errors.INVALID] = 400,
    [errors.PERMISSION_DENIED] = 403, [errors.UNAVAILABLE] = 503, [errors.CONFLICT] = 409,
    [errors.TIMEOUT] = 504, [errors.RATE_LIMITED] = 429}
return {run = test.run_cases(function()
    test.describe("native Core HTTP read responses", function()
        for _, route in ipairs(routes) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN, "future_kind"}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.name .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "not_found",
                            details = {code = "http_read_dependency", nested = {marker = "kept"}}})
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
                test.eq(fixture.status, route.name == "get_thread" and 404 or 500); test.eq(fixture.calls, 1)
                test.is_false(fixture.body.success); test.eq(fixture.body.kind, route.name == "get_thread" and errors.NOT_FOUND or errors.INTERNAL)
                test.is_false(fixture.body.retryable); test.not_nil(fixture.body.details and fixture.body.details.code)
            end)
            test.it(route.name .. "/healthy", function()
                fixture.reset("", nil); route.adapter.handler()
                test.eq(fixture.status, 200); test.eq(fixture.calls, 1); test.is_true(fixture.body.success)
                if route.name == "get_thread" then test.eq(fixture.body.thread.id, "thread")
                elseif route.name == "list_threads" then
                    test.eq(encoded(fixture.body.items), encoded({{id = "thread", label = "Title", icon = "icon"}})); test.eq(#fixture.body.threads, 1)
                elseif route.name == "list_children" then test.eq(#fixture.body.children, 0)
                elseif route.name == "list_events" then test.eq(#fixture.body.events, 0); test.eq(fixture.body.max_pruned_seq, 2); test.eq(fixture.body.next_seq, 3); test.is_true(fixture.body.source_gap)
                elseif route.name == "get_graph" then test.eq(fixture.body.thread_id, "thread"); test.eq(#fixture.body.edges, 0)
                else
                    test.eq(fixture.body.count, 0); test.is_false(fixture.body.has_more); test.eq(fixture.body.cursor, "cursor")
                    test.eq(fixture.args[1], route.name == "list_jobs" and "jobs" or "runs"); test.eq(fixture.args[3], 100)
                end
            end)
            if route.name ~= "list_threads" and route.name ~= "list_jobs" and route.name ~= "list_job_runs" then
                test.it(route.name .. "/missing id", function()
                    fixture.reset("missing_id", nil); route.adapter.handler()
                    test.eq(fixture.status, 400); test.eq(fixture.calls, 0); test.is_false(fixture.body.success)
                    test.eq(fixture.body.kind, errors.INVALID); test.is_false(fixture.body.retryable)
                    test.not_nil(fixture.body.details and fixture.body.details.code)
                end)
            end
            if route.name ~= "get_thread" then
                test.it(route.name .. "/invalid limit", function()
                    fixture.reset("invalid_limit", nil); route.adapter.handler()
                    test.eq(fixture.status, 400); test.eq(fixture.calls, 0); test.is_false(fixture.body.success)
                    test.eq(fixture.body.kind, errors.INVALID); test.is_false(fixture.body.retryable)
                end)
            end
        end
    end)
end)}
