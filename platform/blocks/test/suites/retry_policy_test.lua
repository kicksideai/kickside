-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local blocks = require("blocks")
local lower = require("lower")
local retry = require("retry")
local json = require("json")

local function declaration(execution)
    return { id = "example:retry_step", kind = "registry.entry", meta = { type = "kickside.block" },
        data = { block = { api_version = "kickside.block/v1",
            input = { type = "object" }, config = { type = "object" }, output = { type = "object" },
            ports = { { id = "result", direction = "out" } }, execution = execution } } }
end

local function define_tests()
    test.describe("Block retry policy", function()
        test.it("accepts function declarations and copies native retry configuration", function()
            local execution = { kind = "function", function_id = "example:run", retry_policy = {
                initial_interval = "20ms", maximum_attempts = 3 }, start_to_close_timeout = "2s", schedule_to_close_timeout = 5000 }
            local entry = declaration(execution)
            test.is_nil(blocks.validate(entry))
            local plan, err = lower.plan(entry, { config = {} })
            test.is_nil(err)
            test.eq(plan.config.retry_policy.maximum_attempts, 3)
            test.eq(plan.config.retry_policy.initial_interval, "20ms")
            test.eq(plan.config.start_to_close_timeout, "2s")
            test.eq(plan.config.schedule_to_close_timeout, 5000)
            plan.config.retry_policy.maximum_attempts = 9
            test.eq(execution.retry_policy.maximum_attempts, 3)
        end)
        test.it("replaces policy objects and each timeout independently", function()
            local entry = declaration({ kind = "function", function_id = "example:run", retry_policy = {
                initial_interval = "20ms", maximum_attempts = 3 }, start_to_close_timeout = "2s", schedule_to_close_timeout = "5s" })
            local plan, err = lower.plan(entry, { retry_policy = { maximum_attempts = 5 }, start_to_close_timeout = "1s" })
            test.is_nil(err)
            test.eq(plan.config.retry_policy.maximum_attempts, 5)
            test.is_nil(plan.config.retry_policy.initial_interval)
            test.eq(plan.config.start_to_close_timeout, "1s")
            test.eq(plan.config.schedule_to_close_timeout, "5s")
        end)
        test.it("applies the same native overrides to public tools", function()
            local plan, err = lower.plan_descriptor({ id = "app:public_tool_table", execution = {
                kind = "tool", tool_id = "app:public_tool_table" } }, { retry_policy = { maximum_attempts = 2 },
                start_to_close_timeout = 1000, schedule_to_close_timeout = "3s", config = { account_id = "example" } })
            test.is_nil(err)
            test.eq(plan.config.retry_policy.maximum_attempts, 2)
            test.eq(plan.config.start_to_close_timeout, 1000)
            test.eq(plan.config.schedule_to_close_timeout, "3s")
            test.eq(plan.config.args.account_id, "example")
        end)
        test.it("forwards retry overrides through the public plan library for Blocks and tools", function()
            for _, block_id in ipairs({ "app:public_block", "app:public_tool_table" }) do
                local plan, err = blocks.plan({ block_id = block_id, config = {},
                    retry_policy = { maximum_attempts = 4 }, start_to_close_timeout = "2s", schedule_to_close_timeout = 7000 })
                test.is_nil(err)
                test.not_nil(plan.config.retry_policy)
                test.eq(plan.config.retry_policy.maximum_attempts, 4)
                test.eq(plan.config.start_to_close_timeout, "2s")
                test.eq(plan.config.schedule_to_close_timeout, 7000)
                local invalid, invalid_err = blocks.plan({ block_id = block_id, retry_policy = { maximum_attempts = -1 } })
                local _, expected = retry.validate({ retry_policy = { maximum_attempts = -1 } }, "func")
                test.is_nil(invalid)
                test.contains(tostring(invalid_err), expected)
            end
        end)
        test.it("lowers empty declared and instance policies as objects", function()
            local entry = declaration({kind = "function", function_id = "example:run", retry_policy = {}})
            local declared, declared_err = lower.plan(entry, {})
            test.is_nil(declared_err)
            test.eq(json.encode(declared.config.retry_policy), "{}")
            local overridden, override_err = blocks.plan({block_id = "app:public_block", retry_policy = {}})
            test.is_nil(override_err)
            test.eq(json.encode(overridden.config.retry_policy), "{}")
        end)
        test.it("uses Dataflow validation messages for declarations and overrides", function()
            for _, config in ipairs({ { retry_policy = { maximum_attempts = -1 } },
                { retry_policy = { maximum_interval = "1ms", initial_interval = "1s" } },
                { start_to_close_timeout = 0 }, { schedule_to_close_timeout = "bad" } }) do
                local _, expected = retry.validate(config, "func")
                local execution = { kind = "function", function_id = "example:run" }
                for k, v in pairs(config) do execution[k] = v end
                test.contains(blocks.validate(declaration(execution)), expected)
                local plan, err = lower.plan(declaration({ kind = "function", function_id = "example:run" }), config)
                test.is_nil(plan)
                test.contains(err, expected)
            end
        end)
        test.it("rejects declarations and instance overrides for agent and wait executions", function()
            for _, execution in ipairs({ { kind = "agent", agent_id = "example:agent" }, { kind = "wait" } }) do
                for _, field in ipairs({ "retry_policy", "start_to_close_timeout", "schedule_to_close_timeout" }) do
                    local value = field == "retry_policy" and {} or "1s"
                    execution[field] = value
                    test.contains(blocks.validate(declaration(execution)), "supported only on func nodes")
                    execution[field] = nil
                    local plan, err = lower.plan(declaration(execution), { [field] = value })
                    test.is_nil(plan)
                    test.contains(err, "supported only on func nodes")
                end
            end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
