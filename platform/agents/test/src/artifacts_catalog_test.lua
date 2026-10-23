local test = require("test")
local catalog = require("catalog")
local state = require("state")
local artifact = require("artifact")
return { run = test.run_cases(function()
    test.describe("Artifacts catalog failures", function()
        test.before_each(function()
            state.components = { { id = "fixture:card", announced = true, auto_register = true, tag_name = "fixture-card" } }
            state.pages = { { id = "fixture:page", announced = true, kind = "component" } }
            state.component_error, state.page_error, state.metadata_error, state.projection_error = nil, nil, nil, nil
        end)
        for _, field in ipairs({ "component_error", "page_error" }) do
            test.it("propagates " .. field .. " without a partial catalog", function()
                local failure = errors.new({ kind = errors.UNAVAILABLE, message = "catalog unavailable" })
                state[field] = failure
                local result, err = catalog.execute()
                test.is_nil(result)
                test.eq(err, failure)
            end)
        end
        for _, field in ipairs({ "component_error", "metadata_error", "projection_error" }) do
            test.it("preserves " .. field .. " when authoring an artifact", function()
                local failure = errors.new({ kind = errors.UNAVAILABLE, message = "catalog unavailable" })
                state[field] = failure
                local result, err = artifact.handler({ title = "Card", tag_name = "fixture-card", props = {} })
                test.is_nil(result)
                test.eq(err, failure)
            end)
        end
        test.it("preserves page catalog errors when authoring an artifact", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "page catalog unavailable" })
            state.page_error = failure
            local result, err = artifact.handler({ title = "Page", resource_kind = "page", resource_id = "fixture:page" })
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("discovers declared identifiers without loading rendering metadata", function()
            state.metadata_error = errors.new({ kind = errors.UNAVAILABLE, message = "metadata unavailable" })
            local result, err = catalog.execute()
            test.is_nil(err)
            test.contains(result.prompt, "fixture-card")
            test.contains(result.prompt, "fixture:page")
        end)

        test.it("includes approved components and pages", function()
            local result, err = catalog.execute()
            test.is_nil(err)
            test.contains(result.prompt, "fixture-card")
            test.contains(result.prompt, "fixture:page")
            test.contains(result.prompt, "Never fabricate component or artifact tags")
            test.contains(result.prompt, "copy that exact tag")
        end)
    end)
end) }
