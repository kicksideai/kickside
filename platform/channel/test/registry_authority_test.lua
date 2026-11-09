local test = require("test")
local funcs = require("funcs")
local uuid = require("uuid")

local function define_tests()
    test.describe("module singleton registry authority", function()
        test.it("lets the conversation bridge claim its module-owned name", function()
            local answer, err = funcs.new():call("app:bridge_registry_probe", { name = "kickside.channel.bridge:" .. uuid.v7() })
            test.is_nil(err, tostring(err))
            test.is_true(answer.claimed)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
