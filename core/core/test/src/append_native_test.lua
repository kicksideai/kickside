local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "append guard requires JSON proof"})) end
    return data
end
local function call(options: any?): (any, error?)
    return api.append_events_tx(fixture.transaction(), "thread", {{id = "guard-event", seq = 1, subject = "guard", external = {external_source = "guard", external_id = "guard-external"}}}, options or {defer_wake = true})
end
return {run = test.run_cases(function()
    test.describe("native transactional append dependency failures", function()
        for _, field in ipairs({"external_source", "external_id", "external_version",
            "content_type", "content_mode", "content_ref_json", "content_hash", "content_bytes"}) do
            for _, value in ipairs({false, {}, 1.5}) do
                test.it("refuses malformed event metadata " .. field .. "/" .. type(value), function()
                    fixture.reset("", nil)
                    local event: table = {subject = "guard"}
                    if field:sub(1, 9) == "external_" then
                        event.external = {external_source = "source", external_id = "identity"}
                        event.external[field] = value
                    else
                        event.content = {[field] = value}
                    end
                    local result, err = api.append_events_tx(fixture.transaction(), "thread", {event}, {defer_wake = true})
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.is_false(err:retryable())
                    test.eq(fixture.queries, 0)
                    test.eq(fixture.inserts, 0)
                    test.eq(fixture.executes, 0)
                end)
            end
        end
        for _, field in ipairs({"content", "external"}) do
            for _, value in ipairs({false, "metadata", 12}) do
                test.it("refuses non-object " .. field .. "/" .. type(value), function()
                    fixture.reset("", nil)
                    local event = {subject = "guard", [field] = value}
                    local result, err = api.append_events_tx(fixture.transaction(), "thread", {event}, {defer_wake = true})
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(fixture.queries, 0)
                    test.eq(fixture.inserts, 0)
                    test.eq(fixture.executes, 0)
                end)
            end
        end
        for _, bytes in ipairs({-1, math.huge, 0/0, "12"}) do
            test.it("refuses invalid content byte counts " .. tostring(bytes), function()
                fixture.reset("", nil)
                local result, err = api.append_events_tx(fixture.transaction(), "thread",
                    {{subject = "guard", content = {content_bytes = bytes}}}, {defer_wake = true})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(fixture.queries, 0)
                test.eq(fixture.inserts, 0)
                test.eq(fixture.executes, 0)
            end)
        end
        for _, stage in ipairs({"dialect", "thread", "ids", "external", "sequences", "insert", "subject_write", "head", "created_at"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "append_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(encoded(err:details()), encoded(source:details()))
                        test.eq(fixture.inserts, (stage == "insert" or stage == "subject_write" or stage == "head") and 1 or 0)
                        test.eq(fixture.executes, stage == "head" and 2 or (stage == "subject_write" and 1 or 0))
                    end)
                end
            end
        end
        test.it("mismatched locked snapshot originates permanent Internal", function()
            fixture.reset("", nil); local value, err = call({defer_wake = true, locked_thread = {id = "other", event_count = 0}})
            test.is_nil(value); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
            test.eq(fixture.queries, 0); test.eq(fixture.inserts, 0); test.eq(fixture.executes, 0)
        end)
        test.it("healthy transaction preserves event answer", function()
            fixture.reset("", nil); local value, err = call()
            test.is_nil(err); test.eq(value.thread_id, "thread"); test.eq(value.inserted, 1); test.eq(value.duplicates, 0); test.eq(value.max_seq, 1)
            test.eq(value.events[1].event_id, "guard-event"); test.eq(value.events[1].subject, "guard"); test.eq(value.events[1].subject_version, 1)
            test.eq(fixture.inserts, 1); test.eq(fixture.executes, 2)
        end)
    end)
end)}
