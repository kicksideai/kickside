-- Defect: the HTTP-status classifier keyed off error message PROSE. Correct
-- behavior: it branches on the typed error `kind`, mapping each kind to its status
-- independent of the message. These cases assert the kind -> status mapping, and
-- that the kind wins even when the prose would substring-match a different status.

local test = require("test")
local http = require("http")
local errors = require("errors")
local http_errors = require("http_errors")

local function define_tests()
    test.describe("http_errors.classify kind -> HTTP status", function()
        local cases: { { any } } = {
            { errors.NOT_FOUND, http.STATUS.NOT_FOUND },
            { errors.PERMISSION_DENIED, http.STATUS.FORBIDDEN },
            { errors.INVALID, http.STATUS.BAD_REQUEST },
            { errors.CONFLICT, http.STATUS.CONFLICT },
            { errors.ALREADY_EXISTS, http.STATUS.CONFLICT },
        }
        for _, c in ipairs(cases) do
            test.it("maps kind " .. tostring(c[1]) .. " -> " .. tostring(c[2]), function()
                local e = errors.new({ message = "opaque prose", kind = c[1] })
                local status, classification = http_errors.classify(e)
                test.eq(status, c[2])
                test.eq(classification.kind, c[1])
            end)
        end

        test.it("classifies by kind even when the prose would map elsewhere", function()
            -- Prose says "not found" (would substring-match 404) but the kind is
            -- PERMISSION_DENIED, so the typed kind must win with 403.
            local e = errors.new({ message = "widget not found", kind = errors.PERMISSION_DENIED })
            local status = http_errors.classify(e)
            test.eq(status, http.STATUS.FORBIDDEN)
        end)

        test.it("classifies a plain machine code as internal", function()
            local status = http_errors.classify("conflict")
            test.eq(status, http.STATUS.INTERNAL_ERROR)
        end)

        test.it("does not classify prose substrings", function()
            local status = http_errors.classify("widget not found")
            test.eq(status, http.STATUS.INTERNAL_ERROR)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
