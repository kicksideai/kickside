local test = require("test")
local discovery_envelope = require("discovery_envelope")

local function define_tests()
    test.describe("discover_resources response envelope", function()
        test.it("carries the provider rows and one picker item per row", function()
            local body = discovery_envelope.build("conn-1", {
                success = true,
                resources = {
                    { type = "gitlab_project", id = "35", name = "kickside/app", selectable = true },
                    { type = "bitbucket_workspace", id = "acme", name = "Acme", icon = "tabler:folder", drillable = true },
                    { type = "discord_channel", id = "c1", title = "general", parent_id = "g1" },
                },
            })

            test.is_true(body.success)
            test.eq(body.component_id, "conn-1")
            test.eq(#body.resources, 3)
            test.eq(#body.items, 3)
            test.eq(body.items[1].id, "35")
            test.eq(body.items[1].label, "kickside/app")
            test.eq(body.items[1].icon, "")
            test.is_true(body.items[1].selectable)
            test.is_true(body.items[1].drillable == false)
            test.eq(body.items[2].icon, "tabler:folder")
            test.is_true(body.items[2].selectable == false)
            test.is_true(body.items[2].drillable)
            test.eq(body.items[3].label, "general")
            test.eq(body.items[3].parent_id, "g1")
        end)

        test.it("forwards the provider's next_cursor", function()
            local body = discovery_envelope.build("conn-2", {
                success = true,
                resources = { { type = "github_repo", id = "octo/one", name = "octo/one", selectable = true } },
                next_cursor = "2",
            })

            test.eq(body.next_cursor, "2")
        end)

        test.it("omits next_cursor on the last page", function()
            local body = discovery_envelope.build("conn-3", { success = true, resources = {} })

            test.is_nil(body.next_cursor)
            test.eq(#body.resources, 0)
            test.eq(#body.items, 0)
        end)

        test.it("treats a missing resources list as an empty page", function()
            local body = discovery_envelope.build("conn-4", { success = true })

            test.eq(#body.resources, 0)
            test.eq(#body.items, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
