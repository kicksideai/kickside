local test = require("test")
local codec = require("codec")
local fixture = require("fixture")
local json = require("json")
local function origin(err: error)
    test.is_true(errors.is(err, errors.INTERNAL))
    test.is_false(err:retryable())
    test.eq(err:details().code, "persisted_data")
    test.eq(err:details().error_kind, "persisted_data")
    test.eq(err:details().field, "fixture.payload")
end
local function same_details(actual, expected)
    test.eq(type(actual), type(expected))
    if type(expected) ~= "table" then
        test.eq(actual, expected)
        return
    end
    for key, value in pairs(expected) do same_details(actual[key], value) end
    for key, _ in pairs(actual) do test.not_nil(expected[key]) end
end
local function cause(err: error, source: error)
    origin(err)
    local encoded = err:details().cause
    test.eq(type(encoded), "table")
    test.eq(encoded.kind, source:kind())
    test.eq(encoded.retryable, source:retryable())
    test.eq(type(encoded.message), "string")
    same_details(encoded.details, source:details())
end
return {run = test.run_cases(function()
    test.describe("native causes of persisted JSON failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, nullable in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(nullable), function()
                        local source = errors.new({kind = kind, message = "decoder refusal", retryable = options.retryable,
                            details = {code = "decoder_dependency", nested = {marker = "kept"}}})
                        fixture.reset(source)
                        local value, err = codec.decode_table("{}", "fixture.payload", nullable)
                        test.is_nil(value)
                        cause(assert(err), source)
                        test.eq(source:details().code, "decoder_dependency")
                        test.eq(source:details().nested.marker, "kept")
                    end)
                end
            end
        end
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            test.it("absent source details/" .. kind, function()
                local source = errors.new({kind = kind, message = "decoder refusal"})
                fixture.reset(source)
                local value, err = codec.decode_table("{}", "fixture.payload")
                test.is_nil(value)
                cause(assert(err), source)
            end)
        end
        for _, raw in ipairs({"{", "}", "[1,"}) do
            for _, nullable in ipairs({false, true}) do
                test.it("real SDK decoder/" .. raw .. "/" .. tostring(nullable), function()
                    fixture.reset(nil)
                    local _, source = json.decode(raw)
                    test.not_nil(source)
                    local value, err = codec.decode_table(raw, "fixture.payload", nullable)
                    test.is_nil(value)
                    cause(assert(err), source)
                end)
            end
        end
        for _, raw in ipairs({"", "null", "false", "7", '"text"'}) do
            test.it("non-table storage remains permanent/" .. raw, function()
                fixture.reset(nil)
                local value, err = codec.decode_table(raw, "fixture.payload", true)
                test.is_nil(value)
                origin(assert(err))
                test.is_nil(err:details().cause)
            end)
        end
        test.it("declared SQL NULL and required SQL NULL retain behavior", function()
            fixture.reset(nil)
            local value, err = codec.decode_table(nil, "fixture.payload", true)
            test.is_nil(value)
            test.is_nil(err)
            value, err = codec.decode_table(nil, "fixture.payload")
            test.is_nil(value)
            origin(assert(err))
            test.is_nil(err:details().cause)
        end)
        test.it("decoded objects, arrays and supplied tables retain their contents", function()
            fixture.reset(nil)
            local value, err = codec.decode_table('{"count":2}', "fixture.payload")
            test.is_nil(err)
            test.eq(value.count, 2)
            value, err = codec.decode_table("[1,2]", "fixture.payload")
            test.is_nil(err)
            test.eq(value[2], 2)
            local supplied = {count = 2}
            value, err = codec.decode_table(supplied, "fixture.payload")
            test.is_nil(err)
            test.eq(value, supplied)
        end)
    end)
end)}
