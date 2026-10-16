local test = require("test")
local meta_tools = require("meta_tools")
local surface = require("surface")

local function define_tests()
    test.describe("MCP meta-tool lists", function()
        local principal = {
            active_trait_ids = {},
            allowed_tool_ids = { ["app:dummy_tool"] = true, ["app:schema_tool"] = true },
            allowed_trait_ids = { ["app:trait_dummy"] = true, ["app:trait_wildcard"] = true },
            restrict_traits = true,
        }

        test.it("returns paged summaries and resolves whole tool and trait details", function()
            local protocol_tools, _names, protocol_err = surface.build(principal)
            test.is_nil(protocol_err)
            for _, descriptor in ipairs(protocol_tools) do
                if descriptor.name == "dummy" then test.eq(descriptor.inputSchema.type, "object") end
            end

            local first, first_err = meta_tools.handle("list_tools", { limit = 1 }, principal, nil)
            test.is_nil(first_err)
            test.eq(#first.tools, 1)
            test.not_nil(first.next_cursor)
            test.is_nil(first.tools[1].description)
            test.is_nil(first.tools[1].inputSchema)
            test.is_nil(first.tools[1].outputSchema)

            local second, second_err = meta_tools.handle("list_tools", { limit = 1, cursor = first.next_cursor }, principal, nil)
            test.is_nil(second_err)
            test.eq(#second.tools, 1)
            test.is_true(second.tools[1].name > first.tools[1].name)

            local tool, tool_err = meta_tools.handle("describe_tool", { id = "dummy" }, principal, nil)
            test.is_nil(tool_err)
            test.eq(tool.tool.name, "dummy")
            test.not_nil(tool.tool.description)
            test.eq(tool.tool.inputSchema.type, "object")

            local traits, traits_err = meta_tools.handle("list_traits", { limit = 1 }, principal, nil)
            test.is_nil(traits_err)
            test.eq(#traits.traits, 1)
            test.not_nil(traits.next_cursor)
            test.is_nil(traits.traits[1].description)
            test.not_nil(traits.traits[1].tool_count)

            local found, found_err = meta_tools.handle("find_traits", { limit = 1 }, principal, nil)
            test.is_nil(found_err)
            test.eq(#found.traits, 1)
            test.is_nil(found.traits[1].tool_ids)
            test.not_nil(found.next_cursor)

            local following, following_err = meta_tools.handle("find_traits", { limit = 1, cursor = found.next_cursor }, principal, nil)
            test.is_nil(following_err)
            test.eq(#following.traits, 1)
            test.is_true(following.traits[1].id > found.traits[1].id)

            local trait, trait_err = meta_tools.handle("describe_trait", { id = "app:trait_dummy" }, principal, nil)
            test.is_nil(trait_err)
            test.not_nil(trait.description)
            test.eq(trait.tool_ids[1], "app:dummy_tool")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
