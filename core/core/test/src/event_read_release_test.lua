local test = require("test")
local events = require("events")
local fixture = require("fixture")
local error_envelope = require("error_envelope")
local canonical_json = require("canonical_json")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "event read guard requires JSON result"})) end
    return result
end
local function call(route: string, args: any): (any, error?)
    if route == "list" then return events.list_events(args) end
    if route == "boundary" then return events.prune_boundary(args) end
    return events.find_event_by_external(args)
end
local args = {thread_id = "thread", event_type = "event.type", external_source = "source", external_id = "external"}
local function assert_native(err: error?, source: error)
    test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, source:details().code); test.eq(err:details().nested.marker, source:details().nested.marker)
end
return {run = test.run_cases(function()
    test.describe("native Core event read cleanup", function()
        for _, route in ipairs({"list", "boundary", "external"}) do
            local stages = {"open", "read", "release"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                                details = {code = "event_read_dependency", nested = {marker = "kept"}}})
                            fixture.reset(stage, source, nil)
                            local result, err = call(route, args)
                            test.is_nil(result); assert_native(err, source)
                            test.eq(fixture.opens, 1); test.eq(fixture.reads, stage == "open" and 0 or 1)
                            test.eq(fixture.releases, stage == "open" and 0 or 1)
                            test.eq(fixture.authorizations, 0)
                        end)
                    end
                end
            end
            test.it(route .. "/complete read and cleanup causes", function()
                local primary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "read refusal", details = {code = "read", nested = {marker = "primary"}}})
                local secondary = errors.new({kind = errors.CONFLICT, retryable = false, message = "release refusal", details = {code = "release", nested = {marker = "secondary"}}})
                fixture.reset("read", primary, secondary)
                local result, err = call(route, args)
                test.is_nil(result); assert_native(err, secondary)
                test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                test.eq(encoded(err:details().cause), encoded(error_envelope.encode(secondary)))
                test.eq(fixture.reads, 1); test.eq(fixture.releases, 1); test.eq(fixture.authorizations, 0)
            end)
            test.it(route .. "/healthy", function()
                fixture.reset("", nil, nil); local result, err = call(route, args)
                test.is_nil(err); test.not_nil(result); test.eq(fixture.reads, 1); test.eq(fixture.releases, 1)
                if route == "list" then test.eq(result.next_seq, 3); test.eq(#result.events, 0)
                elseif route == "boundary" then test.eq(result.thread_id, "thread"); test.eq(result.max_pruned_seq, 2); test.eq(fixture.authorizations, 1)
                else test.eq(result.event.id, "event") end
            end)
            test.it(route .. "/absent reply", function()
                fixture.reset("missing", nil, nil); local result, err = call(route, args)
                if route == "external" then test.is_nil(err); test.is_nil(result.event)
                else test.is_nil(result); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code) end
                test.eq(fixture.reads, 1); test.eq(fixture.releases, 1); test.eq(fixture.authorizations, 0)
            end)
            test.it(route .. "/validation", function()
                fixture.reset("", nil, nil); local result, err = call(route, {})
                test.is_nil(result); test.not_nil(err); test.eq(err:kind(), errors.INVALID); test.eq(fixture.opens, 0)
            end)
        end
        test.it("denied boundary authority retains the permission decision", function()
            fixture.reset("denied", nil, nil); local result, err = call("boundary", args)
            test.is_nil(result); test.not_nil(err); test.eq(err:kind(), errors.PERMISSION_DENIED)
            test.eq(fixture.releases, 1); test.eq(fixture.authorizations, 1)
        end)
    end)
end)}
