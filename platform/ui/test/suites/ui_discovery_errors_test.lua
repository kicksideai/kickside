local test = require("test")
local declarations = require("declarations")
local contributions = require("contributions")
local discovery = require("discovery")
local source = require("source")
local function define_tests()
    test.describe("UI declaration discovery", function()
        for _, item in ipairs({
            {"registry navigation", function() return declarations.list({}) end},
            {"generic contributions", function() return contributions.list("ui.command") end},
            {"collected contributions", function() return contributions.collect({"ui.command"}) end},
            {"shell declarations", function() return discovery.discover("ui.nav_item") end},
        }) do
            test.it(item[1], function()
                local value, err = item[2]()
                test.is_nil(value)
                test.eq(err, source.failure)
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
