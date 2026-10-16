local test = require("test")
local planner = require("planner")
local fixture = require("fixture")
local guard = require("guard")
local function run()
    test.describe("Users update introduces Security", function()
        test.it("binds all transitive host requirements without a Security install", function()
            guard.verify(planner, fixture.component, fixture.requirements, fixture.db_kind, fixture.users_resources)
        end)
    end)
end
return {run = test.run_cases(run)}
