local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local registry = require("registry")
local uuid = require("uuid")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "declaration guard requires JSON proof"})) end
    return result
end
local function call(): (boolean, error?)
    return api.validate_event_types(fixture.database(), {{thread_id = fixture.ID, events = {{type = "guard:event", body = {marker = "kept"}}}}})
end
return {run = test.run_cases(function()
    test.describe("native event declaration dependency failures", function()
        for _, stage in ipairs({"read", "kind", "event", "output"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "event_declaration_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local allowed, err = call(); test.is_false(allowed); test.not_nil(err)
                        if kind == errors.NOT_FOUND and (stage == "kind" or stage == "event") then
                            test.eq(err:kind(), errors.INVALID); test.is_false(err:retryable()); test.not_nil(err:details().code)
                            test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else
                            test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                            test.eq(encoded(err:details()), encoded(source:details()))
                        end
                        test.eq(fixture.reads, 1)
                        test.eq(fixture.lookups, stage == "read" and 0 or stage == "kind" and 1 or stage == "event" and 2 or 3)
                    end)
                end
            end
        end
        test.it("healthy declared producer keeps the authority result", function()
            fixture.reset("", nil); local allowed, err = call(); test.is_true(allowed); test.is_nil(err)
            test.eq(fixture.reads, 1); test.eq(fixture.lookups, 4)
        end)
        for _, stage in ipairs({"absent_kind", "absent_event"}) do
            test.it("undeclared input keeps its invalid classification/" .. stage, function()
                fixture.reset(stage, nil); local allowed, err = call(); test.is_false(allowed); test.not_nil(err); test.eq(err:kind(), errors.INVALID)
            end)
        end
        test.it("real registry absence is native NotFound", function()
            local value, err = registry.get("app:missing_" .. uuid.v7())
            test.is_nil(value); test.not_nil(err); test.is_true(errors.is(err, errors.NOT_FOUND))
        end)
    end)
end)}
