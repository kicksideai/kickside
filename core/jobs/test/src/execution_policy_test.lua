-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local json = require("json")
local time = require("time")
local cfg = require("config")
local committed_policy = require("runtime_policy")
local claim = require("claim")
local lease = require("lease")
local lifecycle = require("lifecycle")
local cancel = require("cancel")
local reclaim = require("reclaim")
local fence = require("fence")
local worker = require("worker")
local store = require("store")
local fixture = require("job_fixture")
local DB = "app:private_queue_claim_policy"
local db, dialect
local function edit(values)
    local entry = assert(cfg.declaration())
    return assert(store.write(DB, values, {}, function(overrides)
        return cfg.effective(entry.meta, entry.data.defaults, overrides)
    end))
end
local function row(job)
    return assert(db:query("SELECT * FROM kickside_job WHERE id=$1", {job.id}))[1]
end
local function remaining(job, field)
    local expr = dialect == sql.type.POSTGRES and "EXTRACT(EPOCH FROM (" .. field .. "-NOW()))"
        or "(julianday(" .. field .. ")-julianday('now'))*86400"
    return tonumber(assert(db:query("SELECT " .. expr .. " AS seconds FROM kickside_job WHERE id=$1", {job.id}))[1].seconds)
end
local function enqueue(key)
    return assert(lifecycle.enqueue_job(db, dialect, {
        job_identity = {namespace = "policy", scope = "execution", key = key}, job_type = "policy.capture",
        owner_locator = {kind = "test", id = "policy.capture"}, payload = {}, max_attempts = 3}))
end
local function claimed(key, single)
    local id = enqueue(key)
    local job = single and assert(claim.claim_job(db, dialect)) or assert(claim.claim_batch(db, dialect, 1))[1]
    test.not_nil(job)
    test.eq(job.id, id)
    return job
end
local function edited_claim(key)
    local job = claimed(key)
    edit({["lease.timeout"] = "5s", ["lease.heartbeat"] = "2s", ["retry.retry_after_ms"] = 50000,
        ["retry.max_delay_ms"] = 60000, ["proc.max_execution"] = "1m"})
    return job
end
return {run = test.run_cases(function()
    test.describe("Durable execution policy", function()
        test.before_each(function()
            local err
            db, dialect, err = fixture.private_queue(DB)
            test.is_nil(err)
            edit({["lease.timeout"] = "120s", ["lease.heartbeat"] = "30s", ["retry.retry_after_ms"] = 2500,
                ["proc.max_execution"] = "30m", ["worker.claim_batch"] = 3,
                ["fairness.shares"] = {live = 0, backfill = 1, maintenance = 0}})
        end)
        test.after_each(function() if db then db:release(); db = nil end end)
        for _, single in ipairs({true, false}) do
            test.it("claims committed timing and persists its snapshot/" .. tostring(single), function()
                local job = claimed("entry", single)
                test.eq(job.lease_policy.lease_timeout_seconds, 120)
                test.eq(job.lease_policy.lease_heartbeat_ms, 30000)
                test.is_true(remaining(job, "lease_until") > 115)
                local stored = assert(json.decode(row(job).lease_policy))
                for key, value in pairs(job.lease_policy) do test.eq(stored[key], value) end
            end)
        end
        test.it("takes committed batch bounds and fairness without a pool reservation", function()
            enqueue("live")
            local id = assert(lifecycle.enqueue_job(db, dialect, {
                job_identity = {namespace = "policy", scope = "execution", key = "backfill"}, job_type = "policy.capture",
                queue_tier = "backfill", owner_locator = {kind = "test", id = "policy.capture"}, payload = {}}))
            test.eq(assert(claim.claim_batch(db, dialect, 1))[1].id, id)
            local result, err = claim.claim_batch(db, dialect, 4)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
        end)
        test.it("uses the captured heartbeat threshold and timeout at dispatch", function()
            local job = edited_claim("dispatch")
            assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2",
                {lifecycle.future_string(dialect, 50), job.id}))
            test.is_true(assert(lease.validate_for_dispatch(db, dialect, job)))
            test.is_true(remaining(job, "lease_until") > 115)
        end)
        test.it("renews a reloaded execution through both heartbeat entries", function()
            local job = edited_claim("heartbeat")
            test.is_true(assert(lease.extend_lease(db, dialect, job.id, job.lease_token, job.execution_seq)))
            test.is_true(remaining(job, "lease_until") > 115)
            test.is_nil(lifecycle.heartbeat_job(db, row(job), dialect))
            test.is_true(remaining(job, "lease_until") > 115)
        end)
        test.it("keeps the actual heartbeat process on its captured interval and timeout", function()
            test.is_nil(fixture.supervise_as_loop())
            local shared = assert(sql.get(cfg.db_id()))
            local original = assert(store.read_from(shared)).values
            local entry = assert(cfg.declaration())
            local function write(values, unset)
                return assert(store.write(cfg.db_id(), values, unset or {}, function(overrides)
                    return cfg.effective(entry.meta, entry.data.defaults, overrides)
                end))
            end
            local pid, id, before, after, seconds
            local ok, cause = pcall(function()
                write({["lease.timeout"] = "10s", ["lease.heartbeat"] = "100ms"})
                id = assert(lifecycle.enqueue_job(shared, dialect, {
                    job_identity = {namespace = "policy", scope = "heartbeat", key = "process"},
                    job_type = "test.heartbeat.snapshot", payload = {}, owner_locator = {kind = "test", id = "heartbeat"}}))
                local job = assert(claim.claim_batch(shared, dialect, 1, nil, nil, nil, {"test.heartbeat.snapshot"}))[1]
                test.eq(job.id, id)
                before = assert(shared:query("SELECT heartbeat_at FROM kickside_job WHERE id=$1", {id}))[1].heartbeat_at
                write({["lease.timeout"] = "120s", ["lease.heartbeat"] = "30s"})
                pid = assert(lease.start(job))
                time.sleep("350ms")
                after = assert(shared:query("SELECT heartbeat_at FROM kickside_job WHERE id=$1", {id}))[1].heartbeat_at
                local expr = dialect == sql.type.POSTGRES and "EXTRACT(EPOCH FROM (lease_until-NOW()))"
                    or "(julianday(lease_until)-julianday('now'))*86400"
                seconds = tonumber(assert(shared:query("SELECT " .. expr .. " AS seconds FROM kickside_job WHERE id=$1", {id}))[1].seconds)
            end)
            local stop_err = pid and lease.stop(pid) or nil
            if id then assert(shared:execute("DELETE FROM kickside_job WHERE id=$1", {id})) end
            local values, unset = {}, {}
            for _, key in ipairs({"lease.timeout", "lease.heartbeat"}) do
                if original[key] ~= nil then values[key] = original[key] else unset[#unset + 1] = key end
            end
            write(values, unset)
            shared:release()
            test.is_true(ok, tostring(cause))
            test.is_nil(stop_err)
            test.neq(after, before, "the captured 100ms interval renews after the edit to a 30s interval")
            test.is_true(seconds > 5 and seconds < 11, "renewal retains the captured ten-second timeout")
        end)
        test.it("holds an unconfirmed execution for its captured lease window", function()
            local job = edited_claim("fence")
            test.is_nil(fence.prepare_termination(db, job))
            test.is_nil(fence.hold_unconfirmed_execution(db, row(job)))
            test.is_true(remaining(job, "lease_until") > 115)
            test.is_nil(row(job).lease_token)
        end)
        test.it("rechecks living termination fences without reading editable policy per row", function()
            local jobs = {}
            for index = 1, 3 do jobs[index] = claimed("reclaim-" .. tostring(index)) end
            edit({["lease.timeout"] = "5s", ["lease.heartbeat"] = "2s"})
            for _, job in ipairs(jobs) do
                test.is_nil(fence.prepare_termination(db, job))
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2",
                    {lifecycle.future_string(dialect, -1), job.id}))
            end
            local original, reads = committed_policy.resolve_from, 0
            committed_policy.resolve_from = function(tx) reads = reads + 1; return original(tx) end
            local ok, count, err = pcall(reclaim.reclaim_terminated, db, dialect, nil, function() return true, nil end)
            committed_policy.resolve_from = original
            test.is_true(ok)
            test.is_nil(err)
            test.eq(count, 0)
            test.eq(reads, 1, "the default batch policy resolves once for all three rows")
            for _, job in ipairs(jobs) do test.is_true(remaining(job, "lease_until") > 115) end
        end)
        test.it("does not expire a running execution when the global lease becomes shorter", function()
            local job = edited_claim("expiry")
            test.eq(assert(reclaim.reclaim_expired(db, dialect, 3)), 0)
            test.eq(row(job).status, "running")
        end)
        test.it("settles a confirmed termination without replacing the captured policy", function()
            local job = edited_claim("confirmed")
            local snapshot = row(job).lease_policy
            test.is_nil(fence.prepare_termination(db, job))
            test.is_true(assert(reclaim.settle_confirmed(db, dialect,
                {id = job.id, token = job.lease_token, execution_seq = job.execution_seq})))
            test.eq(row(job).status, "pending")
            test.eq(row(job).lease_policy, snapshot)
        end)
        test.it("cancels and confirms the captured execution without adopting edited timing", function()
            local job = edited_claim("cancel")
            local snapshot = row(job).lease_policy
            test.is_true(assert(cancel.cancel_job(db, dialect, {id = job.id})))
            test.eq(row(job).lease_policy, snapshot)
            test.is_true(assert(cancel.finish_cancellation(db, dialect,
                {id = job.id, token = job.lease_token, execution_seq = job.execution_seq})))
            test.eq(row(job).status, "cancelled")
        end)
        test.it("completes a reloaded execution under its original lease", function()
            local job = edited_claim("complete")
            assert(db:execute("UPDATE kickside_job SET heartbeat_at=$1 WHERE id=$2",
                {lifecycle.future_string(dialect, -10), job.id}))
            test.is_nil(worker.complete_job(db, dialect, row(job), {}, nil))
            test.eq(row(job).status, "done")
        end)
        for _, path in ipairs({"heartbeat", "completion", "failure", "fence", "reclaim", "dispatch"}) do
            test.it("runs pre-upgrade NULL policy through " .. path, function()
                local job = edited_claim("legacy-" .. path)
                assert(db:execute("UPDATE kickside_job SET lease_policy=NULL WHERE id=$1", {job.id}))
                job.lease_policy = nil
                local legacy = assert(cfg.policy())
                if path == "heartbeat" then
                    test.is_true(assert(lease.extend_lease(db, dialect, job.id, job.lease_token, job.execution_seq)))
                    test.is_nil(lifecycle.heartbeat_job(db, row(job), dialect))
                elseif path == "dispatch" then
                    test.is_true(assert(lease.validate_for_dispatch(db, dialect, job)))
                    -- Force renewal on the dispatch path, with the registry threshold.
                    assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2",
                        {lifecycle.future_string(dialect, 1), job.id}))
                    test.is_true(assert(lease.validate_for_dispatch(db, dialect, job)))
                elseif path == "completion" then
                    test.is_nil(worker.complete_job(db, dialect, row(job), {}, nil))
                    test.eq(row(job).status, "done")
                elseif path == "failure" then
                    test.is_nil(lifecycle.fail_job(db, row(job), dialect, "temporary", "infrastructure"))
                    test.eq(row(job).status, "pending")
                    test.is_true(remaining(job, "scheduled_at") < legacy.retry_after_ms / 1000 + 2)
                else
                    test.is_nil(fence.prepare_termination(db, job))
                    if path == "fence" then
                        test.is_nil(fence.hold_unconfirmed_execution(db, row(job)))
                    else
                        assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2",
                            {lifecycle.future_string(dialect, -1), job.id}))
                        test.eq(assert(reclaim.reclaim_terminated(db, dialect, 3, function() return true, nil end)), 0)
                    end
                end
                if path ~= "completion" and path ~= "failure" then
                    local seconds = remaining(job, "lease_until")
                    test.is_true(seconds > legacy.lease_timeout_seconds - 3 and seconds <= legacy.lease_timeout_seconds + 1,
                        "legacy timing is registry/host, independent of admin overrides")
                end
                test.is_nil(row(job).lease_policy, "execution paths never invent a migrated snapshot")
            end)
        end
        test.it("uses captured retry delays when failure reloads the execution", function()
            local job = edited_claim("failure")
            test.is_nil(lifecycle.fail_job(db, row(job), dialect, "temporary", "infrastructure"))
            test.is_true(remaining(job, "scheduled_at") <= 4)
            test.eq(row(job).status, "pending")
        end)
    end)
end)}
