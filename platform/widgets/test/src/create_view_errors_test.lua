local test = require("test")
local resolver = require("resolver")
local registry = require("resolver_registry")
local http = require("http")
local function define_tests()
    test.describe("create view lookup", function()
        test.it("propagates failure to load a declared view without writing an absent-view success", function()
            registry.entries = {{meta = {class = "any-class", component = {create = {view = "any-view"}}}}}
            http.writes = 0
            local value, err = resolver.handler()
            registry.entries = nil
            test.is_nil(value)
            test.eq(err, registry.failure)
            test.eq(http.writes, 0)
        end)
        test.it("returns registry failure without reporting an absent view", function()
            local view, err = resolver.create_view_id("any-class")
            test.is_nil(view)
            test.eq(err, registry.failure)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)
    end)
end
return {run = test.run_cases(define_tests)}
