local test = require("test")
local codec = require("codec")
local fixture = require("fixture")
local native_codec = require("native_codec")
return {run = test.run_cases(function()
    test.describe("native canonical codec dependencies", function()
        for _, stage in ipairs({"encode", "hash"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, message = "canonical dependency failure",
                            retryable = policy.retryable, details = {code = "canonical_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, false, nil)
                        local value, err = codec.hash(42)
                        test.is_nil(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "canonical_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.encodes, 1)
                        test.eq(fixture.hashes, stage == "hash" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"encode", "hash"}) do
            for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
                {name = "numeric", value = 42}, {name = "table", value = {}}}) do
                test.it(stage .. "/malformed/" .. input.name, function()
                    fixture.reset(stage, nil, true, input.value)
                    local value, err = codec.hash(42)
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "canonical_dependency_response")
                    test.eq(err:details().field, stage == "hash" and "hash.sha256" or "json.encode")
                    test.eq(fixture.encodes, 1)
                    test.eq(fixture.hashes, stage == "hash" and 1 or 0)
                end)
            end
        end
        for _, digest in ipairs({"", string.rep("a", 63), string.rep("a", 65)}) do
            test.it("rejects wrong digest length/" .. #digest, function()
                fixture.reset("hash", nil, true, digest)
                local value, err = codec.hash(42)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "canonical_dependency_response")
                test.eq(err:details().field, "hash.sha256")
            end)
        end
        test.it("retains canonical encode and digest behavior", function()
            fixture.reset("", nil, false, nil)
            local input = {b = 2, a = 1}
            local text, err = codec.encode(input)
            test.is_nil(err)
            test.eq(text, '{"a":1,"b":2}')
            local digest, hash_err = codec.hash(input)
            test.is_nil(hash_err)
            local expected, expected_err = native_codec.hash(input)
            test.is_nil(expected_err)
            test.eq(digest, expected)
        end)
        test.it("retains digest case normalization", function()
            fixture.reset("hash", nil, true, string.rep("A", 64))
            local value, err = codec.hash(42)
            test.is_nil(err)
            test.eq(value, string.rep("a", 64))
        end)
        test.it("invalid cycles never call a dependency", function()
            fixture.reset("", nil, false, nil)
            local cycle = {}; cycle.self = cycle
            local value, err = codec.hash(cycle)
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:retryable(), false)
            test.eq(fixture.hashes, 0)
        end)
    end)
end)}
