local test = require("test")
local http_errors = require("http_errors")
local canonical_json = require("canonical_json")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN, "future_kind"}
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP response guard requires JSON result"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native HTTP response payloads", function()
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "not_found",
                            details = detailed and {code = "http_response_dependency", nested = {marker = "kept"}} or nil})
                        local body = http_errors.response(source)
                        test.eq(encoded(body), encoded({success = false, error = source:message(), kind = source:kind(),
                            retryable = source:retryable(), details = source:details()}))
                        test.eq(source:kind(), kind); test.eq(encoded(source:details()), encoded(detailed and {code = "http_response_dependency", nested = {marker = "kept"}} or nil))
                    end)
                end
            end
        end
        for _, message in ipairs({"bad_request", "forbidden", "not_found", "conflict", "server_error", "not found permission denied"}) do
            test.it("opaque failure/" .. message, function()
                local source = errors.new({kind = errors.UNKNOWN, message = message})
                local body = http_errors.response(message)
                test.eq(encoded(body), encoded({success = false, error = message, kind = source:kind(), retryable = source:retryable()}))
                test.eq(select(1, http_errors.classify(source)), 500)
            end)
        end
    end)
end)}
