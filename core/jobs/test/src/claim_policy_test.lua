-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local claim = require("claim")
local lease = require("lease")
local cfg = require("config")
local jobs = require("jobs")
local fixture = require("job_fixture")
local lifecycle = require("lifecycle")
return {run = test.run_cases(function()
    test.describe("Claim-time runtime snapshot", function()
        test.it("retains the captured lease pair, execution ceiling and retry delays after an edit before dispatch", function()
            local db, dialect, fixture_err = fixture.private_queue("app:private_queue_claim_policy")
            test.is_nil(fixture_err)
            local id = assert(lifecycle.enqueue_job(db, dialect,
                {job_identity = {namespace = "policy", scope = "claim", key = "capture"}, job_type = "policy.capture", owner_locator = {kind = "test", id = "policy.capture"}, payload = {}}))
            local old = assert(cfg.runtime({["lease.timeout"] = "60s", ["lease.heartbeat"] = "40s",
                ["proc.max_execution"] = "30m", ["retry.retry_after_ms"] = 2500}))
            local batch = assert(claim.claim_batch(db, dialect, 1, nil, nil, nil, nil,
                {awaited_types = {}, general_capacity = 1, tier_step = 0, policy = old}))
            test.eq(batch[1].id, id)
            local job = batch[1]
            assert(jobs.set_policy_overrides({["lease.timeout"] = "30s", ["lease.heartbeat"] = "20s",
                ["proc.max_execution"] = "60m", ["retry.retry_after_ms"] = 1000}))
            local active, err = lease.validate_for_dispatch(db, dialect, job)
            test.is_nil(err)
            test.is_true(active)
            local rows
            if dialect == sql.type.POSTGRES then
                rows = assert(db:query("SELECT EXTRACT(EPOCH FROM (lease_until-NOW())) AS seconds FROM kickside_job WHERE id=$1", {id}))
            else
                rows = assert(db:query("SELECT (julianday(lease_until)-julianday('now'))*86400 AS seconds FROM kickside_job WHERE id=$1", {id}))
            end
            test.is_true(tonumber(rows[1].seconds) > 55, "dispatch renewal retains the 60s lease for its 40s heartbeat")
            test.eq(job.lease_policy.lease_heartbeat_ms, 40000)
            test.eq(job.lease_policy.proc_max_execution_ms, 1800000)
            test.eq(job.lease_policy.retry_after_ms, 2500)
            test.is_nil(job.lease_policy.worker_count_postgres)
            test.is_nil(job.lease_policy.fields)
            assert(jobs.set_policy_overrides({}, {"lease.timeout", "lease.heartbeat", "proc.max_execution", "retry.retry_after_ms"}))
            assert(db:execute("DELETE FROM kickside_job WHERE id=$1", {id}))
            db:release()
        end)
    end)
end)}
