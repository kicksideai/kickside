-- Workflow libraries behind the agent tools fail with typed errors.
local test = require("test")
local repo = require("repo")
local flow_ref = require("flow_ref")

local function define_tests()
    test.describe("Workflow typed errors", function()
        test.it("refuses an inexact Flow reference as invalid", function()
            local ref, err = flow_ref.validate({ kind = "flow", id = "wf" })
            test.is_nil(ref)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "positive integer")
        end)

        test.it("refuses an out-of-range Flow list page as invalid", function()
            local rows, err = repo.list({ limit = 0 })
            test.is_nil(rows)
            test.is_true(errors.is(err, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
