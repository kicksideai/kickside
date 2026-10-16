local test = require("test")
local api_errors = require("api_errors")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end
return test.run_cases(function()
    test.describe("Automation canonical status and envelope", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
            { errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
            { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
            { errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves metadata for " .. row[1], function()
                for _, retry in ipairs({ { value = true }, { value = false }, {} }) do
                    local failure = errors.new({ kind = row[1], message = "opaque", retryable = retry.value, details = { marker = "kept" } })
                    local status, payload = api_errors.status(failure, "internal_error", "fallback")
                    test.eq(status, row[2])
                    local codes = { [errors.INVALID] = "invalid_request", [errors.PERMISSION_DENIED] = "access_denied",
                        [errors.NOT_FOUND] = "not_found", [errors.CONFLICT] = "conflict", [errors.UNAVAILABLE] = "unavailable" }
                    test.eq(encode(payload), encode({ code = codes[row[1]] or "internal_error",
                        message = tostring(failure), retryable = failure:retryable(), details = failure:details() }))
                end
            end)
        end
        test.it("never selects status from a fallback code for an unknown failure", function()
            local status, payload = api_errors.status("opaque", "access_denied", "fallback")
            test.eq(status, 500)
            test.eq(encode(payload), encode({ code = "access_denied", message = "opaque" }))
        end)
    end)
end)
