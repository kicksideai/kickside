local test = require("test")
local unlink_response = require("unlink_response")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end
return test.run_cases(function()
    test.describe("Identity unlink failure envelope", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
            { errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
            { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
            { errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves cleanup evidence for " .. row[1], function()
                local failure = errors.new({ kind = row[1], message = "opaque", retryable = false,
                    details = { discarded = { marker = "partial" } } })
                local status, payload = unlink_response.response_for("user", "provider", "external", {
                    unlink = function() return nil, failure end })
                test.eq(status, row[2])
                test.eq(encode(payload), encode({ success = false, error = tostring(failure),
                    kind = row[1], retryable = failure:retryable(), details = failure:details(), discarded = failure:details().discarded }))
            end)
        end
        test.it("leaves unknown plain failures internal without metadata", function()
            local status, payload = unlink_response.response_for("user", "provider", "external", {
                unlink = function() return nil, "not found permission denied" end })
            test.eq(status, 500)
            test.eq(encode(payload), encode({ success = false, error = "not found permission denied" }))
        end)
    end)
end)
