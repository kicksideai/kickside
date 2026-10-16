local registry = require("registry")
local test = require("test")
local policy = require("retention_policy")

local function meta(): table
    return { retention = { events = "90d", receipts_orphan = "30d" },
        sweep = { batch_events = 5000, batch_receipts = 500 }, limits = { max_row_bytes = 4194304 } }
end

local function define_tests()
    test.describe("core retention policy", function()
        test.it("validates once per registry version without sharing mutable values or caching invalid policies", function()
            local version = assert(registry.current_version())
            local entry = assert(registry.get(policy.ENTRY))
            local original_resolve = policy.resolve
            local resolutions = 0
            policy.resolve = function(value)
                resolutions = resolutions + 1
                return original_resolve(value)
            end
            local ok, failure = pcall(function()
                local snapshot = assert(registry.snapshot())
                local changes = snapshot:changes()
                changes:update({ id = entry.id, kind = entry.kind, meta = meta(), data = entry.data })
                local _, apply_err = changes:apply()
                test.is_nil(apply_err)
                for _ = 1, 20 do
                    local result, err = policy.policy()
                    test.is_nil(err)
                    test.eq(result.events_ms, 90 * 86400000)
                    result.events_ms = 1
                end
                test.eq(resolutions, 1)
                snapshot = assert(registry.snapshot())
                changes = snapshot:changes()
                local invalid_meta = meta()
                invalid_meta.retention.events = "invalid"
                changes:update({ id = entry.id, kind = entry.kind, meta = invalid_meta, data = entry.data })
                local _, invalid_apply_err = changes:apply()
                test.is_nil(invalid_apply_err)
                for _ = 1, 2 do
                    local invalid, invalid_err = policy.policy()
                    test.is_nil(invalid)
                    test.not_nil(invalid_err)
                end
                test.eq(resolutions, 3)
            end)
            policy.resolve = original_resolve
            local _, restore_err = registry.apply_version(version)
            test.is_nil(restore_err)
            if not ok then error(failure) end
            local restored, restore_policy_err = policy.policy()
            test.is_nil(restore_policy_err)
            test.eq(restored.events_ms, 90 * 86400000)
        end)

        test.it("resolves event and receipt retention windows and the row size limit", function()
            local resolved, err = policy.resolve(meta())
            test.is_nil(err)
            test.eq(resolved.events_ms, 90 * 86400000)
            test.eq(resolved.receipts_orphan_ms, 30 * 86400000)
            test.eq(resolved.batch_events, 5000)
            test.eq(resolved.batch_receipts, 500)
            test.eq(resolved.max_row_bytes, 4194304)
        end)

        test.it("reads only age windows and the row size limit from the registered policy", function()
            local resolved, err = policy.policy()
            test.is_nil(err)
            test.eq(resolved.events_ms, 90 * 86400000)
            test.eq(resolved.receipts_orphan_ms, 30 * 86400000)
            test.eq(resolved.max_row_bytes, 4194304)
            for key in pairs(resolved) do
                test.is_nil(key:find("_per_", 1, true))
                test.is_nil(key:find("blocked", 1, true))
            end
        end)

        test.it("refuses one row above the size limit and accepts one at it", function()
            test.is_nil(policy.check_row("scope", 4194304, "append_events"))
            local refused = policy.check_row("scope", 4194305, "append_events")
            test.not_nil(refused)
            test.eq(refused:kind(), errors.INVALID)
            test.eq(refused:details().reason, "row_too_large")
            test.eq(refused:details().cap, 4194304)
            test.eq(refused:details().used, 4194305)
            test.eq(refused:details().operation, "append_events")
        end)

        test.it("rejects zero, fractional and unbounded row limits and malformed sweeps", function()
            for _, value in ipairs({ 0, 1.5, math.huge }) do
                local input = meta()
                input.limits.max_row_bytes = value
                local result, err = policy.resolve(input)
                test.is_nil(result)
                test.eq(err:kind(), errors.INVALID)
            end
            local malformed = meta()
            malformed.sweep.batch_receipts = 501
            local invalid_policy, policy_err = policy.resolve(malformed)
            test.is_nil(invalid_policy)
            test.eq(policy_err:kind(), errors.INVALID)
        end)
    end)
end

return test.run_cases(define_tests)
