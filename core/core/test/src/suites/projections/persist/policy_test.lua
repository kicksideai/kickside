-- Projections policy shape and the harness-owned registry override.

local test = require("test")
local registry = require("registry")
local policy = require("policy")

local function define_tests()
    test.describe("Projection Policy", function()
        test.it("resolves policy metadata into runtime values", function()
            local resolved, err = policy.resolve({
                apply = { batch_size = 200 },
                proc = { max_execution = "1s" },
            })
            test.is_nil(err)
            test.not_nil(resolved)
            test.eq((resolved :: any).apply_batch_size, 200)
            test.eq((resolved :: any).proc_max_execution_ms, 1000)
        end)

        test.it("refuses malformed policy without fallback values", function()
            for _, bad in ipairs({
                {},
                { apply = { batch_size = 0 } },
                { apply = { batch_size = -1 } },
                { apply = { batch_size = "200" } },
                { apply = { batch_size = 200 }, proc = { max_execution = "" } },
                { apply = { batch_size = 200 }, proc = { max_execution = "invalid" } },
                { apply = { batch_size = 200 }, proc = { max_execution = "0s" } },
                { apply = { batch_size = 200 }, proc = { max_execution = -100 } },
            }) do
                local resolved, err = policy.resolve(bad)
                test.is_nil(resolved)
                test.not_nil(err)
                test.eq((err :: error):kind(), errors.INVALID)
            end
        end)

        test.it("reads both values overridden by the Core test harness", function()
            local entry, get_err = registry.get(policy.ENTRY)
            test.is_nil(get_err)
            test.not_nil(entry)
            test.eq((entry :: any).meta.apply.batch_size, 23)
            test.eq((entry :: any).meta.proc.max_execution, "11m")
            local resolved, err = policy.policy()
            test.is_nil(err)
            test.not_nil(resolved)
            test.eq((resolved :: any).apply_batch_size, 23)
            test.eq((resolved :: any).proc_max_execution_ms, 660000)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
