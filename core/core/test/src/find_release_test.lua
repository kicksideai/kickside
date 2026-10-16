local test = require("test")
local fixture = require("fixture")
local resource = require("resource")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lookup guard requires JSON proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native thread lookup release", function()
        for _, route in ipairs({{name = "find", call = resource.find}, {name = "upsert", call = resource.upsert},
            {name = "ensure", call = resource.ensure_thread}, {name = "converge", call = resource.converge_thread}}) do
            for _, stage in ipairs({"open", "read", "release"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        if stage ~= "read" or (kind ~= errors.NOT_FOUND and kind ~= errors.PERMISSION_DENIED) then
                            test.it(route.name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "lookup_dependency", nested = {marker = "kept"}}})
                                fixture.reset(stage, source, nil, true)
                                local value, err = route.call({thread_id = "thread", impl_id = "implementation"})
                                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                                test.eq(encoded(err:details()), encoded(source:details())); test.eq(fixture.effects, 0)
                                test.eq(fixture.opens, 1); test.eq(fixture.reads, stage == "open" and 0 or 1); test.eq(fixture.releases, stage == "open" and 0 or 1)
                            end)
                        end
                    end
                end
            end
            for _, kind in ipairs({errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.TIMEOUT}) do
                for _, release_kind in ipairs({errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.CONFLICT}) do
                    test.it(route.name .. "/combined/" .. kind .. "/" .. release_kind, function()
                        local primary = errors.new({kind = kind, retryable = true, message = "read refusal", details = {code = "read", nested = {marker = "primary"}}})
                        local secondary = errors.new({kind = release_kind, retryable = false, message = "release refusal", details = {code = "release", nested = {marker = "secondary"}}})
                        fixture.reset("read", primary, secondary, true)
                        local value, err = route.call({thread_id = "thread", impl_id = "implementation"})
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.eq(err:retryable(), secondary:retryable())
                        test.eq(encoded(err:details().cause), encoded(error_envelope.encode(secondary)))
                        test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                        test.eq(fixture.effects, 0); test.eq(fixture.opens, 1); test.eq(fixture.releases, 1)
                    end)
                end
            end
        end
        for _, kind in ipairs({errors.NOT_FOUND, errors.PERMISSION_DENIED}) do
            for _, present in ipairs({false, true}) do
                test.it("find preserves soft read absence/" .. kind .. "/" .. tostring(present), function()
                    fixture.reset("read", errors.new({kind = kind, retryable = false, message = "read refusal"}), nil, present)
                    local value, err = resource.find({thread_id = "thread"})
                    test.is_nil(value); test.is_nil(err); test.eq(fixture.releases, 1); test.eq(fixture.effects, 0)
                end)
            end
        end
        test.it("strict upsert read retains denied access", function()
            local source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "read refusal", details = {code = "access"}})
            fixture.reset("read", source, nil, true); local value, err = resource.upsert({thread_id = "thread"})
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:details().code, "access"); test.eq(fixture.effects, 0)
        end)
        for _, route in ipairs({{name = "find", call = resource.find}, {name = "upsert", call = resource.upsert}, {name = "ensure", call = resource.ensure_thread}}) do
            test.it(route.name .. "/healthy existing row", function()
                fixture.reset("", nil, nil, true); local value, err = route.call({thread_id = "thread"})
                test.is_nil(err); test.not_nil(value)
                local thread = route.name == "find" and value or value.thread
                test.eq(thread.id, "thread"); test.eq(thread.marker, "kept"); test.eq(fixture.releases, 1); test.eq(fixture.effects, 0)
                if route.name ~= "find" then test.is_false(value.created) end
            end)
        end
        test.it("find preserves a successful absent row", function()
            fixture.reset("missing", nil, nil, false); local value, err = resource.find({thread_id = "thread"})
            test.is_nil(value); test.is_nil(err); test.eq(fixture.releases, 1)
        end)
    end)
end)}
