local test = require("test")
local errors = require("errors")
local api_errors = require("api_errors")

local function define_tests()
    test.describe("automation API error vocabulary", function()
        test.it("maps a typed not-found error to the not_found API code", function()
            local status, payload = api_errors.status(errors.new({
                kind = errors.NOT_FOUND,
                message = "component not found or access denied: a-1",
            }), "access_denied", "delete access required")
            test.eq(status, 404)
            test.eq(payload.code, "not_found")
            test.eq(payload.message, "component not found or access denied: a-1")
        end)

        test.it("normalizes the runtime PermissionDenied kind to access_denied", function()
            local status, payload = api_errors.status(errors.new({
                kind = errors.PERMISSION_DENIED,
                message = "Component not found or access denied",
            }), "internal_error", "request failed")
            test.eq(status, 403)
            test.eq(payload.code, "access_denied")
            test.eq(payload.message, "Component not found or access denied")
        end)

        test.it("maps typed invalid, conflict and unavailable kinds to their API codes", function()
            for _, case in ipairs({
                { kind = errors.INVALID, code = "invalid_request", status = 400 },
                { kind = errors.CONFLICT, code = "conflict", status = 409 },
                { kind = errors.UNAVAILABLE, code = "unavailable", status = 503 },
            }) do
                local status, payload = api_errors.status(errors.new({ kind = case.kind, message = "typed " .. case.code }),
                    "internal_error", "request failed")
                test.eq(status, case.status)
                test.eq(payload.code, case.code)
                test.eq(payload.message, "typed " .. case.code)
            end
        end)

        test.it("does not derive a status from message text", function()
            local status, payload = api_errors.status("automation not found", "internal_error", "request failed")
            test.eq(status, 500)
            test.eq(payload.code, "internal_error")
            test.eq(payload.message, "automation not found")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
