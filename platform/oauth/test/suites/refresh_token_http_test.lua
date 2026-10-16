local test = require("test")
local connector = require("connector")
local http = require("http_fixture")
local function define_tests()
    test.describe("OAuth generic refresh transport classification", function()
        test.it("keeps rate limits and service failures retriable even when an HTTP response arrived", function()
            for _, status in ipairs({ 429, 503 }) do
                http.response = { status_code = status, body = '{"error":"temporarily_unavailable"}' }
                local result = connector.handle({ refresh_token = "adapter-refresh" })
                test.is_false(result.success)
                test.is_true(result.response_received)
                test.is_false(result.requires_reauth)
            end
        end)
        test.it("requires reauthorization for invalid_grant and preserves only the safe provider error code", function()
            http.response = { status_code = 400, body = '{"error":"invalid_grant","error_description":"private account data"}' }
            local result = connector.handle({ refresh_token = "adapter-refresh" })
            test.is_true(result.requires_reauth)
            local private_data = result.error:find("private account data", 1, true)
            test.is_nil(private_data)
        end)
        test.it("does not request reconnection for invalid JSON or a malformed success response", function()
            for _, body in ipairs({ "not json", "{}" }) do
                http.response = { status_code = 200, body = body }
                local result = connector.handle({ refresh_token = "adapter-refresh" })
                test.is_false(result.success)
                test.is_true(result.requires_reauth ~= true)
            end
        end)
        test.it("accepts Google-style responses without a rotated refresh token and encodes reserved token characters", function()
            http.response = { status_code = 200, body = '{"access_token":"adapter-access","expires_in":3600}' }
            local result = connector.handle({ refresh_token = "adapter+refresh&=" })
            test.is_true(result.success)
            test.eq(result.access_token, "adapter-access")
            test.is_nil(result.refresh_token)
            test.not_nil(http.request.body:find("refresh_token=adapter%%2Brefresh%%26%%3D"))
        end)
    end)
end
return { run = test.run_cases(define_tests) }
