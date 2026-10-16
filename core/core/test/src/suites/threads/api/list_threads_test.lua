-- thread_item label resolution. A thread row carries no name of its own; a
-- component-backed thread keeps its human title on the component's public meta
-- (surfaced as component_title/component_icon by the listing). The picker envelope
-- must label by that human title, falling back to a title/name recorded in the
-- thread attrs, then to the id -- so a scoped-but-unlabeled row never renders as a
-- bare UUID when a human field is present.

local test = require("test")
local list_threads = require("list_threads")

local function define_tests()
    test.describe("list_threads picker item", function()
        local thread_item = list_threads.thread_item

        test.it("labels a row by its component title", function()
            local item = thread_item({
                component_id = "61e4bd46",
                component_title = "dfdsf",
                component_icon = "tabler:layout-dashboard",
                attrs = '{"user_ids":["admin@wippy.local"]}',
            })
            test.eq(item.id, "61e4bd46")
            test.eq(item.label, "dfdsf")
            test.eq(item.icon, "tabler:layout-dashboard")
        end)

        test.it("falls back to the attrs title when the component has none", function()
            local item = thread_item({
                component_id = "t-1",
                attrs = '{"title":"DM: Example User"}',
            })
            test.eq(item.label, "DM: Example User")
        end)

        test.it("falls back to the id only when no human field exists", function()
            local item = thread_item({
                component_id = "no-title-uuid",
                attrs = '{"user_ids":["admin@wippy.local"]}',
            })
            test.eq(item.label, "no-title-uuid")
        end)

        test.it("prefers the component title over an attrs title", function()
            local item = thread_item({
                component_id = "t-2",
                component_title = "Knowledge injection",
                attrs = '{"title":"raw attrs title"}',
            })
            test.eq(item.label, "Knowledge injection")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
