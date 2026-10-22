-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local planner = require("planner")
local planner_llm = require("planner_llm")

local FILES = {
    { upload_id = "upload-a", filename = "one.pdf" },
    { upload_id = "upload-b", filename = "two.pdf" },
}

local COMPLETE_RESULT = [[{"kb_name":"Project notes","kb_description":"Documents for the project.","files":[{"upload_id":"upload-a","title":"One","category":"Project"},{"upload_id":"upload-b","title":"Two","category":"Project"}]}]]

local function with_llm(fake: any, fn: () -> ())
    local previous = planner_llm.generate
    planner_llm.generate = fake.generate
    local ok, err = pcall(fn)
    planner_llm.generate = previous
    if not ok then error(err, 0) end
end

local function define_tests()
    test.describe("knowledge organize planner", function()
        test.it("reads the complete plan from response.result", function()
            with_llm({ generate = function()
                return { result = COMPLETE_RESULT }, nil
            end }, function()
                local result, err = planner.plan(FILES)
                test.is_nil(err)
                test.eq(result.kb_name, "Project notes")
                test.eq(result.kb_description, "Documents for the project.")
                test.eq(result.assignments["upload-a"].title, "One")
                test.eq(result.assignments["upload-b"].category, "Project")
            end)
        end)

        test.it("returns the planner source error", function()
            with_llm({ generate = function()
                return nil, "planner source unavailable"
            end }, function()
                local result, err = planner.plan(FILES)
                test.is_nil(result)
                test.eq(err, "planner source unavailable")
            end)
        end)

        test.it("preserves typed LLM errors and their retry details", function()
            local failure = errors.new({ kind = errors.RATE_LIMITED, message = "planner provider busy",
                retryable = true, details = { retry_after = 30 } })
            with_llm({ generate = function()
                return nil, failure
            end }, function()
                local result, err = planner.plan(FILES)
                test.is_nil(result)
                test.eq(err, failure)
                test.is_true(errors.is(err, errors.RATE_LIMITED))
                test.is_true(err:retryable())
                test.eq(err:details().retry_after, 30)
            end)
        end)

        test.it("retains string validation errors", function()
            local result, err = planner.plan({})
            test.is_nil(result)
            test.eq(err, "no files to plan")
        end)

        test.it("rejects a response without result text", function()
            with_llm({ generate = function()
                return { content = COMPLETE_RESULT }, nil
            end }, function()
                local result, err = planner.plan(FILES)
                test.is_nil(result)
                test.not_nil(err)
            end)
        end)

        test.it("rejects a plan that omits a requested file", function()
            with_llm({ generate = function()
                return { result = [[{"kb_name":"Project notes","kb_description":"Documents for the project.","files":[{"upload_id":"upload-a","title":"One","category":"Project"}]}]] }, nil
            end }, function()
                local result, err = planner.plan(FILES)
                test.is_nil(result)
                test.not_nil(err)
            end)
        end)

        test.it("rejects a plan without a knowledge-base name", function()
            with_llm({ generate = function()
                return { result = [[{"kb_description":"Documents for the project.","files":[{"upload_id":"upload-a","title":"One","category":"Project"},{"upload_id":"upload-b","title":"Two","category":"Project"}]}]] }, nil
            end }, function()
                local result, err = planner.plan(FILES)
                test.is_nil(result)
                test.not_nil(err)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
