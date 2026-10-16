local test = require("test")
local blocks = require("settings_blocks")

-- Unit-tests the block catalog composition: auto-block synthesis, explicit-block
-- precedence, humanized titles, and (group, order, title) ordering. Pure logic
-- over hand-built inputs — no registry or HTTP context required.
local function define_tests()
    test.describe("KickSide Settings Blocks", function()
        test.it("synthesizes an auto-block for a visible namespace with no explicit block", function()
            local out = blocks.build({}, { ["kickside.atlassian"] = true })
            test.eq(#out, 1)
            test.eq(out[1].namespace, "kickside.atlassian")
            test.eq(out[1].key, "kickside.atlassian")
            test.eq(out[1].title, "Atlassian")
            test.is_nil(out[1].component_tag)
        end)

        test.it("an explicit block suppresses the auto-block for the same namespace", function()
            local declared = { {
                key = "rasterize", title = "Rasterization",
                namespace = "kickside.uploads.rasterize", group = "Uploads",
            } }
            local out = blocks.build(declared, { ["kickside.uploads.rasterize"] = true })
            local count = 0
            for _, b in ipairs(out) do
                if b.namespace == "kickside.uploads.rasterize" then count = count + 1 end
            end
            test.eq(count, 1)
            test.eq(out[1].title, "Rasterization")
        end)

        test.it("a bespoke block claims its extra namespaces so none gets an auto-block", function()
            local declared = { {
                key = "storage", title = "Files & Uploads", group = "Uploads",
                component_tag = "kickside-settings-storage",
                namespaces = { "kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize" },
            } }
            local out = blocks.build(declared, {
                ["kickside.uploads"] = true,
                ["kickside.uploads.documents"] = true,
                ["kickside.uploads.rasterize"] = true,
                ["kickside.other"] = true,
            })
            -- Only the bespoke block + the one uncovered namespace's auto-block remain.
            test.eq(#out, 2)
            local has_storage, auto_other, upload_autoblocks = false, false, 0
            for _, b in ipairs(out) do
                if b.component_tag == "kickside-settings-storage" then has_storage = true end
                if b.namespace == "kickside.other" then auto_other = true end
                if type(b.namespace) == "string" and b.namespace:find("^kickside%.uploads") then
                    upload_autoblocks = upload_autoblocks + 1
                end
            end
            test.is_true(has_storage)
            test.is_true(auto_other)
            test.eq(upload_autoblocks, 0)
        end)

        test.it("keeps an explicit component block and still auto-blocks other namespaces", function()
            local declared = { {
                key = "sso", title = "Single sign-on",
                group = "Security", order = 10, component_tag = "kickside-sso-admin",
            } }
            local out = blocks.build(declared, { ["kickside.google"] = true })
            test.eq(#out, 2)
            -- Grouped explicit block leads; ungrouped auto-block trails.
            test.eq(out[1].component_tag, "kickside-sso-admin")
            test.eq(out[2].namespace, "kickside.google")
        end)

        test.it("orders by group, then order, then title", function()
            local declared = {
                { key = "b", title = "Beta", group = "Security", order = 20 },
                { key = "a", title = "Alpha", group = "Security", order = 10 },
            }
            local out = blocks.build(declared, {})
            test.eq(out[1].key, "a")
            test.eq(out[2].key, "b")
        end)

        test.it("humanizes a namespace into a readable title", function()
            test.eq(blocks.humanize("kickside.llm_ocr"), "Llm Ocr")
            test.eq(blocks.humanize("kickside.uploads.documents"), "Uploads Documents")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
