-- The jobs policy (design §8): one registry entry kickside.core.jobs:policy
-- whose meta holds the worker, lease, retry, proc and health shapes, overridable
-- through .wippy.yaml "kickside.core.jobs:policy:meta.<path>". config.resolve
-- validates a policy meta into the runtime values; config loads the registry
-- entry through it.

local test = require("test")
local registry = require("registry")
local config = require("config")

local function policy(overrides: table?): table
    local meta = {
        worker = { count_sqlite = 1, count_postgres = 20, awaited_slots = 1, claim_batch = 16 },
        lease = { timeout = "45s", heartbeat = "10s" },
        retry = { max_attempts = 3, retry_after_ms = 1000, max_delay_ms = 900000 },
        slot_retry = { retry_after_ms = 10000, max_delay_ms = 900000 },
        proc = { max_execution = "60m" },
        health = { overdue_grace = "120s" },
        fairness = { shares = { live = 6, backfill = 2, maintenance = 2 } },
        wake = { fanout_batch = 200 },
        limits = { max_row_bytes = 4194304 },
        retention = { jobs = "30d", job_runs = "30d",
            thread_cleanup_receipts = "30d", sweep_interval = "1h",
            batch = 500, thread_cleanup_batch = 100 },
    }
    for section, values in pairs(overrides or {}) do
        for key, value in pairs(values :: table) do meta[section][key] = value end
    end
    return meta
end

local function define_tests()
    test.describe("jobs.config policy", function()
        test.it("validates the host policy reconciliation interval", function()
            local resolved, err = config.resolve(policy({worker = {policy_check_interval = "5s"}}))
            test.is_nil(err)
            test.eq(resolved.worker_policy_check_ms, 5000)
            for _, interval in ipairs({"100ms", "2h", "invalid"}) do
                local invalid, invalid_err = config.resolve(policy({worker = {policy_check_interval = interval}}))
                test.is_nil(invalid)
                test.not_nil(invalid_err)
            end
        end)
        test.it("resolves a successful policy once per registry version and returns independent values", function()
            local original = config.resolve
            local resolutions = 0
            config.resolve = function(meta)
                resolutions = resolutions + 1
                return original(meta)
            end
            local first, first_err = config.policy()
            if first then first.fairness_shares.live = -1 end
            local second, second_err = config.policy()
            config.resolve = original
            test.is_nil(first_err)
            test.is_nil(second_err)
            test.not_nil(second)
            test.eq(second.worker_policy_check_ms, 30000)
            test.is_true(second.fairness_shares.live >= 0)
            test.eq(resolutions, 1)
        end)

        test.it("revalidates policy changes and refuses invalid versions without retaining an old policy", function()
            local version, version_err = registry.current_version()
            test.is_nil(version_err)
            local entry, entry_err = registry.get(config.POLICY)
            test.is_nil(entry_err)
            local snap, snap_err = registry.snapshot()
            test.is_nil(snap_err)
            local changes = snap:changes()
            local invalid_meta = policy({ worker = { count_postgres = 0 } })
            changes:update({ id = entry.id, kind = entry.kind, meta = invalid_meta, data = entry.data })
            local _, apply_err = changes:apply()
            local invalid, invalid_err = config.policy()
            local repeated, repeated_err = config.policy()
            local _, restore_err = registry.apply_version(version)
            local restored, restored_err = config.policy()
            test.is_nil(apply_err)
            test.is_nil(restore_err)
            test.is_nil(invalid)
            test.not_nil(invalid_err)
            test.is_nil(repeated)
            test.not_nil(repeated_err)
            test.is_nil(restored_err)
            test.not_nil(restored)
        end)

        test.it("resolves the policy shape into runtime values", function()
            local resolved, err = config.resolve(policy())
            test.is_nil(err)
            test.eq(resolved.worker_count_sqlite, 1)
            test.eq(resolved.worker_count_postgres, 20)
            test.eq(resolved.worker_awaited_slots, 1)
            test.eq(resolved.lease_timeout_seconds, 45)
            test.eq(resolved.lease_heartbeat_ms, 10000)
            test.eq(resolved.retry_max_attempts, 3)
            test.eq(resolved.retry_max_delay_ms, 900000)
            test.eq(resolved.retry_after_ms, 1000)
            test.eq(resolved.slot_retry_after_ms, 10000)
            test.eq(resolved.slot_retry_max_delay_ms, 900000)
            test.eq(resolved.worker_claim_batch, 16)
            test.eq(resolved.wake_fanout_batch, 200)
            test.eq(resolved.fairness_shares.live, 6)
            test.eq(resolved.fairness_shares.backfill, 2)
            test.eq(resolved.fairness_shares.maintenance, 2)
            test.eq(resolved.proc_max_execution_ms, 3600000)
            test.eq(resolved.health_overdue_grace_ms, 120000)
            test.eq(resolved.max_row_bytes, 4194304)
            for key in pairs(resolved :: any) do
                test.is_nil((tostring(key):find("_per_owner", 1, true)), tostring(key))
            end
            test.eq(resolved.retention_jobs_ms, 2592000000)
            test.eq(resolved.retention_job_runs_ms, 2592000000)
            test.eq(resolved.retention_thread_cleanup_receipts_ms, 2592000000)
            test.eq(resolved.retention_interval_ms, 3600000)
            test.eq(resolved.retention_batch, 500)
            test.eq(resolved.thread_cleanup_batch, 100)
        end)

        test.it("allows two SQLite execution slots so provider waits do not block another owner", function()
            local resolved, err = config.resolve(policy({worker={count_sqlite=2}}))
            test.is_nil(err)
            test.eq(resolved.worker_count_sqlite, 2)
        end)

        test.it("refuses a malformed policy instead of substituting a default", function()
            for _, bad in ipairs({
                { lease = { timeout = "soon" } },
                { lease = { heartbeat = "45s" } },
                { worker = { count_postgres = 0 } },
                { worker = { count_sqlite = 0 } },
                { worker = { count_sqlite = 3 } },
                { worker = { count_postgres = 257 } },
                { worker = { claim_batch = 0 } },
                { worker = { awaited_slots = 0 } },
                { worker = { awaited_slots = 257 } },
                { fairness = { shares = { live = 0, backfill = 0, maintenance = 0 } } },
                { fairness = { shares = { live = -1, backfill = 2, maintenance = 2 } } },
                { wake = { fanout_batch = 201 } },
                { slot_retry = { retry_after_ms = 0 } },
                { slot_retry = { max_delay_ms = "15m" } },
                { retry = { retry_after_ms = 0 } },
                { retry = { max_attempts = 0 } },
                { retry = { max_delay_ms = "15m" } },
                { proc = { max_execution = "" } },
                { health = { overdue_grace = "later" } },
                { limits = { max_row_bytes = 0 } },
                { retention = { jobs = "0d" } },
                { retention = { job_runs = "soon" } },
                { retention = { thread_cleanup_receipts = "0d" } },
                { retention = { sweep_interval = "0s" } },
                { retention = { batch = 0 } },
                { retention = { thread_cleanup_batch = 0 } },
            }) do
                local resolved, err = config.resolve(policy(bad))
                test.is_nil(resolved)
                test.not_nil(err)
                test.eq((err :: error):kind(), errors.INVALID)
            end
            local _, missing_err = config.resolve({})
            test.not_nil(missing_err)
        end)

        test.it("loads the registered policy", function()
            test.not_nil((registry.get(config.POLICY)))
            test.eq(config.db_id(), "app:db")
            local loaded, err = config.policy()
            test.is_nil(err)
            local expected = config.resolve(policy({worker={count_sqlite=2, count_postgres=4}, proc={max_execution="10m"}}))
            for key, value in pairs(expected :: table) do
                if key == "fairness_shares" then
                    local actual_shares = (loaded :: any).fairness_shares
                    test.eq(actual_shares.live, (value :: any).live, "fairness_shares.live")
                    test.eq(actual_shares.backfill, (value :: any).backfill, "fairness_shares.backfill")
                    test.eq(actual_shares.maintenance, (value :: any).maintenance, "fairness_shares.maintenance")
                else
                    test.eq((loaded :: any)[key], value, key)
                end
            end
        end)

        test.it("distributes tier shares through one policy-derived weighted cycle", function()
            local resolved = config.resolve(policy({ fairness = {
                shares = { live = 2, backfill = 1, maintenance = 1 },
            } })) :: table
            local step = 0
            local total = { live = 0, backfill = 0, maintenance = 0 }
            for _ = 1, 4 do
                local shares, next_step = config.distribute_shares(1, resolved.fairness_shares, step)
                step = next_step
                for tier in pairs(total) do total[tier] = total[tier] + shares[tier] end
            end
            test.eq(total.live, 2)
            test.eq(total.backfill, 1)
            test.eq(total.maintenance, 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
