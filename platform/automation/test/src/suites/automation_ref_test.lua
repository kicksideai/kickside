local test = require("test")
local automation_ref = require("automation_ref")

local function define_tests()
    test.describe("kickside.automation:automation_ref", function()
        test.it("accepts and copies one exact Automation binding revision", function()
            local input = { kind = "automation", id = "binding-1", revision = 7 }
            local ref, err = automation_ref.validate(input)
            test.is_nil(err)
            test.eq(ref.kind, "automation")
            test.eq(ref.id, "binding-1")
            test.eq(ref.revision, 7)
            test.ok(ref ~= input, "validation returns a canonical value, not the caller's table")
        end)

        test.it("rejects open or aliased shapes", function()
            local cases = {
                { value = { kind = "automation", id = "binding-1", revision = 1, binding_id = "binding-1" }, error = "only kind, id, and revision" },
                { value = { kind = "automation", id = "binding-1", revision = 1, version = 1 }, error = "only kind, id, and revision" },
                { value = { kind = "binding", id = "binding-1", revision = 1 }, error = "kind must be automation" },
                { value = { kind = "automation", id = " binding-1 ", revision = 1 }, error = "surrounding whitespace" },
                { value = { kind = "automation", id = "binding-1", revision = 0 }, error = "positive integer" },
                { value = { kind = "automation", id = "binding-1", revision = 1.5 }, error = "positive integer" },
                { value = { kind = "automation", id = "binding-1", revision = "1" }, error = "positive integer" },
            }
            for _, case in ipairs(cases) do
                local ref, err = automation_ref.validate(case.value)
                test.is_nil(ref)
                test.contains(tostring(err), case.error)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
