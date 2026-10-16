-- The search endpoint reports a retrieval failure with the status of the error
-- the retrieval seam returned, and keeps the cause in the response.

local test = require("test")
local http = require("http")
local search = require("search")

local function exercise(failure: any): (any, any)
    local status, response
    local http_double = {
        request = function() return {
            param = function() return "kb-id" end,
            body = function() return '{"query":"return window","limit":5}', nil end,
        } end,
        response = function() return {
            set_content_type = function() end,
            set_status = function(_, value) status = value end,
            write_json = function(_, value) response = value end,
        } end,
        CONTENT = http.CONTENT, STATUS = http.STATUS,
    }
    local instance = search.new({
        http = http_double,
        security = { actor = function() return { id = function() return "search-test-user" end } end },
        component = { ACCESS = { READ = 1 }, validate_access = function() return true, nil end },
        kb_search = { query = function() return nil, failure end },
    })
    instance.handler()
    return status, response
end

local function define_tests()
    test.describe("search endpoint retrieval failures", function()
        test.it("answers an upstream model failure with its classified status and cause", function()
            local cause = "analysis model failed: Model failed to return valid JSON: jsontext: unexpected EOF"
            local status, response = exercise(errors.new({
                kind = errors.UNAVAILABLE, message = cause, retryable = true,
                details = { dependency = "llm", operation = "structured_output" },
            }))
            test.eq(status, 503)
            test.eq(response.success, false)
            test.eq(response.error, "search failed: " .. cause)
        end)

        test.it("answers upstream timeouts and rate limits with their own status", function()
            local timeout_status = exercise(errors.new({ kind = errors.TIMEOUT, message = "model timed out" }))
            test.eq(timeout_status, 504)
            local limited_status = exercise(errors.new({ kind = errors.RATE_LIMITED, message = "model busy" }))
            test.eq(limited_status, 429)
        end)

        test.it("answers an unclassified retrieval failure with 500", function()
            local status, response = exercise(errors.new({ kind = errors.INTERNAL, message = "store offline" }))
            test.eq(status, 500)
            test.eq(response.error, "search failed: store offline")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
