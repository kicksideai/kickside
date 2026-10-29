-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local applied_store = require("pool_applied")
local function migrate(name, direction, namespace)
    local result, err = funcs.call((namespace or "kickside.core.jobs.migrations") .. ":" .. name,
        {database_id = "app:policy_migration_db", direction = direction or "up", id = "test:policy:" .. name})
    test.is_nil(err)
    test.eq(result.status, "complete", tostring(result.error or (result.migrations and result.migrations[1].error)))
end
return {run = test.run_cases(function()
    test.describe("Jobs real migration upgrade", function()
        test.it("cancels pending legacy jobs before the override schema exists, then migrates policy up and down", function()
            local shared = assert(sql.get("app:db"))
            local engine = assert(shared:type())
            if engine == sql.type.POSTGRES then
                assert(shared:execute("DROP SCHEMA IF EXISTS jobs_policy_migration_test CASCADE"))
                assert(shared:execute("CREATE SCHEMA jobs_policy_migration_test"))
            end
            shared:release()
            -- An installation runs Core's migrations first; its trigger function backs the Jobs tables.
            migrate("01_thread", "up", "kickside.core.migrations")
            for _, name in ipairs({"04_jobs", "07_job_slots", "14_worker_pulse", "19_thread_cleanup", "20_dispatch_requests"}) do migrate(name) end
            local db = assert(sql.get("app:policy_migration_db"))
            local id = uuid.v7()
            assert(db:execute([[INSERT INTO kickside_job(id,job_type,job_identity,owner_kind,owner_id,status)
                VALUES ($1,'kickside.uploads.service:intent_reconcile',$2,'installation','legacy','pending')]], {id, id}))
            db:release()
            migrate("21_retire_upload_intent_slot")
            db = assert(sql.get("app:policy_migration_db"))
            local rows = assert(db:query("SELECT status FROM kickside_job WHERE id=$1", {id}))
            test.eq(rows[1].status, "cancelled")
            db:release()
            db = assert(sql.get("app:policy_migration_db"))
            local running = uuid.v7()
            local until_sql = engine == sql.type.POSTGRES and "NOW()+INTERVAL '90 seconds'" or "datetime('now','+90 seconds')"
            assert(db:execute("INSERT INTO kickside_job(id,job_type,job_identity,owner_kind,owner_id,status,lease_token,heartbeat_at,lease_until)"
                .. " VALUES ($1,'legacy.running',$2,'installation','legacy','running','old-token',CURRENT_TIMESTAMP," .. until_sql .. ")", {running, running}))
            local fenced = uuid.v7()
            assert(db:execute("INSERT INTO kickside_job(id,job_type,job_identity,owner_kind,owner_id,status,heartbeat_at,lease_until)"
                .. " VALUES ($1,'legacy.fenced',$2,'installation','legacy','running',CURRENT_TIMESTAMP," .. until_sql .. ")", {fenced, fenced}))
            db:release()
            migrate("22_policy_overrides")
            db = assert(sql.get("app:policy_migration_db"))
            test.is_nil(assert(db:query("SELECT lease_policy FROM kickside_job WHERE id=$1", {running}))[1].lease_policy,
                "legacy execution snapshots remain NULL, including termination-fenced jobs")
            test.is_nil(assert(db:query("SELECT lease_policy FROM kickside_job WHERE id=$1", {fenced}))[1].lease_policy)
            local applied = assert(db:query("SELECT * FROM kickside_job_pool_applied", {}))[1]
            test.eq(tonumber(applied.applied_revision), -1)
            test.eq(tonumber(applied.total), 0)
            test.is_nil(applied.apply_error)
            local state = {applied_revision = 3, total = 4, general = 2, awaited = 2, database = engine}
            local failure = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "Policy application unavailable", details = {code = "test_apply_error"}})
            test.is_nil(applied_store.write("app:policy_migration_db", state, failure))
            local failed = assert(applied_store.read("app:policy_migration_db"))
            test.eq(failed.applied_revision, 3)
            test.eq(failed.apply_error.kind, errors.UNAVAILABLE)
            test.eq(failed.apply_error.code, "test_apply_error")
            test.is_true(failed.apply_error.retryable)
            test.eq(failed.apply_error.details.code, "test_apply_error")
            test.is_nil(applied_store.write("app:policy_migration_db", state, nil))
            local recovered = assert(applied_store.read("app:policy_migration_db"))
            test.is_nil(recovered.apply_error, "successful application clears the durable error")
            test.eq(recovered.total, 4)
            test.not_nil(recovered.updated_at)
            test.eq(assert(db:query("SELECT revision FROM kickside_job_policy_revision", {}))[1].revision, 0)
            assert(db:execute("INSERT INTO kickside_job_policy_override (key,value) VALUES ('worker.count_postgres','20')", {}))
            db:release()
            migrate("22_policy_overrides", "down")
            migrate("22_policy_overrides")
            db = assert(sql.get("app:policy_migration_db"))
            test.eq(#assert(db:query("SELECT key FROM kickside_job_policy_override", {})), 0)
            db:release()
        end)
    end)
end)}
