local test = require("test")
local injection_config = require("injection_config")

local function define_tests()
    test.describe("injection_config.normalize_worker_config", function()
        test.it("rejects non-table input", function()
            local cfg, err = injection_config.normalize_worker_config("bad", "")
            test.is_nil(cfg)
            test.not_nil(err)
        end)

        test.it("rejects empty target_kb_ids", function()
            local cfg, err = injection_config.normalize_worker_config({ target_kb_ids = {} }, "")
            test.is_nil(cfg)
            test.not_nil(err)
        end)

        test.it("normalizes minimal config with defaults", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
            }, "test.plugin")
            test.is_nil(err)
            test.not_nil(cfg)
            test.eq(cfg.target_kb_ids[1], "kb-1")
            test.is_nil(cfg.model)
            test.eq(cfg.agent_ref, "kickside.knowledge.injection.agents:injection_agent")
            test.eq(cfg.max_content_chars, 50000)
            test.eq(cfg.max_iterations, 15)
            test.eq(cfg.plugin_id, "test.plugin")
        end)

        test.it("uses custom agent_ref when provided", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
                agent_ref = "kickside.agents:my_agent",
            }, "")
            test.is_nil(err)
            test.eq(cfg.agent_ref, "kickside.agents:my_agent")
        end)

        test.it("defaults agent_ref when empty string", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
                agent_ref = "",
            }, "")
            test.is_nil(err)
            test.eq(cfg.agent_ref, "kickside.knowledge.injection.agents:injection_agent")
        end)

        test.it("clamps max_content_chars to minimum 1000", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
                max_content_chars = 10,
            }, "")
            test.is_nil(err)
            test.eq(cfg.max_content_chars, 1000)
        end)

        test.it("clamps max_content_chars to maximum 200000", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
                max_content_chars = 999999,
            }, "")
            test.is_nil(err)
            test.eq(cfg.max_content_chars, 200000)
        end)

        test.it("clamps max_iterations to bounds", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
                max_iterations = 0,
            }, "")
            test.is_nil(err)
            test.eq(cfg.max_iterations, 1)

            local cfg2, err2 = injection_config.normalize_worker_config({
                target_kb_ids = { "kb-1" },
                max_iterations = 999,
            }, "")
            test.is_nil(err2)
            test.eq(cfg2.max_iterations, 50)
        end)

        test.it("trims kb_ids", function()
            local cfg, err = injection_config.normalize_worker_config({
                target_kb_ids = { "  kb-1  ", "", "kb-2" },
            }, "")
            test.is_nil(err)
            test.eq(#cfg.target_kb_ids, 2)
            test.eq(cfg.target_kb_ids[1], "kb-1")
            test.eq(cfg.target_kb_ids[2], "kb-2")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
