local test = require("test")
local http_errors = require("http_errors")
local time = require("time")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end

local matrix = {
    { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 },
    { errors.NOT_FOUND, 404 }, { errors.CONFLICT, 409 },
    { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
    { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 },
    { errors.CANCELED, 500 }, { errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 },
}

local function define_tests()
    test.describe("Canonical HTTP errors", function()
        test.it("retains published HTTP method contracts alongside typed classification", function()
            for _, row in ipairs({ { "bad_request", 400 }, { "NOT_FOUND", 404 }, { "forbidden", 403 }, { "conflict", 409 }, { "not found prose", 500 } }) do
                local status, message = http_errors.status(row[1], "fallback")
                test.eq(status, row[2])
                test.eq(message, row[1])
            end
            local status, message = http_errors.status(nil, "fallback")
            test.eq(status, 500)
            test.eq(message, "fallback")
            for _, row in ipairs(matrix) do
                local err = errors.new({kind = row[1], message = "opaque"})
                local expected = row[1] == errors.INVALID and 400 or row[1] == errors.NOT_FOUND and 404
                    or row[1] == errors.PERMISSION_DENIED and 403 or row[1] == errors.CONFLICT and 409 or 500
                test.eq(http_errors.for_error(err), expected)
            end
        end)
        for _, row in ipairs(matrix) do
            test.it("classifies " .. row[1] .. " independently of message and retryability", function()
                for _, message in ipairs({ "opaque", "not found permission denied conflict invalid" }) do
                    for _, retry in ipairs({ { value = true }, { value = false }, {} }) do
                        local err = errors.new({ message = message, kind = row[1], retryable = retry.value,
                            details = { marker = "preserved", nested = { value = 7 } } })
                        for _, value in ipairs({ err, errors.wrap(err, "boundary context") }) do
                            local status, classification = http_errors.classify(value)
                            test.eq(status, row[2])
                            test.eq(status % 1, 0)
                            test.eq(classification.kind, row[1])
                            test.eq(classification.retryable, value:retryable())
                            test.eq(encode(classification.details), encode(value:details()))
                        end
                    end
                end
            end)
        end
        test.it("leaves absent metadata absent", function()
            local err = errors.new({ message = "opaque", kind = errors.UNKNOWN })
            local status, classification = http_errors.classify(err)
            test.eq(status, 500)
            test.eq(classification.kind, errors.UNKNOWN)
            test.eq(classification.retryable, err:retryable())
            test.is_nil(classification.details)
        end)
        test.it("never calls methods on untyped values", function()
            local function forbidden() error("untyped error method called") end
            local values = { "bad_request", "BAD_REQUEST", "forbidden", "Forbidden", "not_found",
                "conflict", "server_error", "not found permission denied invalid conflict", 1, false,
                {}, { kind = errors.INVALID, message = "opaque" },
                { kind = forbidden, retryable = forbidden, details = forbidden }, time.now() }
            for _, value in ipairs(values) do
                local status, classification = http_errors.classify(value)
                test.eq(status, 500)
                test.is_nil(next(classification))
            end
            local status, classification = http_errors.classify(nil)
            test.eq(status, 500)
            test.is_nil(next(classification))
        end)
        test.it("does not recognize a future typed kind", function()
            local err = errors.new({ message = "opaque", kind = "future_kind", retryable = true,
                details = { marker = "future" } })
            local status, classification = http_errors.classify(err)
            test.eq(status, 500)
            test.is_nil(next(classification))
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
