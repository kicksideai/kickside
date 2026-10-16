local test = require("test")
local time = require("time")
local store_state = require("store_state")
local admission = require("admission")

local function canonical(value: string): string
    local parsed, err = time.parse(time.RFC3339, value)
    test.is_nil(err)
    return parsed:utc():format(time.RFC3339)
end

local function define_tests()
    test.describe("workflow UTC timestamps", function()
        test.it("writes admission and definition timestamps in UTC", function()
            local definition_now = store_state.now()
            local admission_now = admission.now()
            test.eq(definition_now, canonical(definition_now))
            test.eq(admission_now, canonical(admission_now))
        end)
    end)
end

return test.run_cases(define_tests)
