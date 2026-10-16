local test = require("test")
local provider_errors = require("provider_errors")

local function define_tests()
    test.describe("OAuth provider error redaction", function()
        test.it("keeps compact OAuth error codes", function()
            test.eq(provider_errors.safe_code("invalid_grant"), "invalid_grant")
            test.eq(provider_errors.safe_code("temporarily-unavailable"), "temporarily-unavailable")
        end)

        test.it("rejects long or structured provider error values", function()
            test.is_nil(provider_errors.safe_code(string.rep("a", 129)))
            test.is_nil(provider_errors.safe_code("invalid grant: account alice@example.com"))
            test.is_nil(provider_errors.safe_code({ code = "invalid_grant" }))
        end)

        test.it("extracts only the safe provider code from a JSON body", function()
            local code = provider_errors.from_body('{"error":"invalid_grant","error_description":"refresh token for alice@example.com expired"}')
            test.eq(code, "invalid_grant")
        end)

        test.it("requires reconnect only for a rejected grant, never a temporary HTTP failure", function()
            test.is_true(provider_errors.requires_reauth(400, "invalid_grant"))
            test.is_false(provider_errors.requires_reauth(503, "temporarily_unavailable"))
            test.is_false(provider_errors.requires_reauth(503, "invalid_grant"))
            test.is_false(provider_errors.requires_reauth(429, "invalid_grant"))
            test.is_false(provider_errors.requires_reauth(401, "invalid_client"))
            test.is_false(provider_errors.requires_reauth(400, nil))
        end)

        test.it("formats HTTP failures without raw provider body text", function()
            local msg = provider_errors.http_failure("Failed", 400, "invalid_grant")
            test.eq(msg, "Failed: HTTP 400 (invalid_grant)")
            test.is_true(string.find(msg, "alice@example.com", 1, true) == nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
