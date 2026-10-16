-- Locks the engine-owned stat formatting: each engine declares its stat labels
-- in meta.ui.stats and the API formats counts through engines.format_stats, so no
-- handler may branch on kb_type to label stats. Specs point at canonical public
-- meta fields maintained by the component's read-model owner.

local test = require("test")
local engines = require("engines")

local function define_tests()
    test.describe("engines.format_stats", function()
        test.it("resolves dotted paths and pluralizes by count", function()
            local spec = {
                { path = "document_count", singular = "document", plural = "documents" },
                { path = "embedding_count", singular = "embedding", plural = "embeddings" },
            }
            local items = engines.format_stats(
                { document_count = 1, embedding_count = 12 }, spec)
            test.eq(#items, 2)
            test.eq(items[1].value, 1)
            test.eq(items[1].label, "document")
            test.eq(items[2].value, 12)
            test.eq(items[2].label, "embeddings")
        end)

        test.it("formats counts stored as public meta strings", function()
            local spec = {
                { path = "document_count", singular = "document", plural = "documents" },
                { path = "embedding_count", singular = "embedding", plural = "embeddings" },
            }
            local items = engines.format_stats(
                { document_count = "1", embedding_count = "12" }, spec)
            test.eq(#items, 2)
            test.eq(items[1].value, 1)
            test.eq(items[1].label, "document")
            test.eq(items[2].value, 12)
            test.eq(items[2].label, "embeddings")
        end)

        test.it("treats a missing path as zero", function()
            local spec = { { path = "concept_count", singular = "concept", plural = "concepts" } }
            local items = engines.format_stats({}, spec)
            test.eq(items[1].value, 0)
            test.eq(items[1].label, "concepts")
        end)

        test.it("hides an entry below its min threshold but shows it at or above", function()
            local spec = { { path = "embedding_count", singular = "embedding", plural = "embeddings", min = 1 } }
            test.eq(#engines.format_stats({ embedding_count = 0 }, spec), 0)
            local shown = engines.format_stats({ embedding_count = 1 }, spec)
            test.eq(shown[1].value, 1)
            test.eq(shown[1].label, "embedding")
        end)

        test.it("carries the declared icon onto each item", function()
            local spec = { { path = "claim_count", singular = "claim", plural = "claims", icon = "tabler:bulb" } }
            test.eq(engines.format_stats({ claim_count = 3 }, spec)[1].icon, "tabler:bulb")
        end)

        test.it("returns an empty list for a nil or non-table spec", function()
            test.eq(#engines.format_stats({ claim_count = 3 }, nil), 0)
            test.eq(#engines.format_stats({}, {}), 0)
        end)

        test.it("carries engine-declared config maintenance through discovery", function()
            local engine, err = engines.resolve("wiki")
            test.is_nil(err)
            test.eq(engine.config_maintenance.schedule_resummarize[1], "outline_style")
            local ordinary, ordinary_err = engines.resolve("no_maintenance")
            test.is_nil(ordinary_err)
            test.is_nil(ordinary.config_maintenance)
        end)

        test.it("applies descriptor defaults under explicit config without mutation", function()
            local defaults = { summary_model = "class:fast", chunk_size = 1000, enabled = true }
            local config: any = { chunk_size = 500, name = "custom" }
            local effective = engines.apply_default_config(config, { default_config = defaults })

            test.eq("class:fast", effective.summary_model)
            test.eq(500, effective.chunk_size)
            test.eq("custom", effective.name)
            test.eq(true, effective.enabled)
            test.eq(1000, defaults.chunk_size)
            test.is_nil(config.summary_model)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
