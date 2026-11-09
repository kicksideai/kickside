-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local function migrate(name, direction, namespace)
    local result, err = funcs.call((namespace or "kickside.core.jobs.migrations") .. ":" .. name,
        {database_id = "app:policy_migration_db", direction = direction or "up", id = "test:policy:" .. name})
    test.is_nil(err)
    test.eq(result.status, "complete", tostring(result.error or (result.migrations and result.migrations[1].error)))
end
return {run = test.run_cases(function()
    test.describe("Jobs real migration upgrade", function()
        test.it("cancels pending legacy jobs, then adds execution snapshots up and down", function()
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
            migrate("24_lease_policy")
            db = assert(sql.get("app:policy_migration_db"))
            test.is_nil(assert(db:query("SELECT lease_policy FROM kickside_job WHERE id=$1", {running}))[1].lease_policy,
                "legacy execution snapshots remain NULL, including termination-fenced jobs")
            test.is_nil(assert(db:query("SELECT lease_policy FROM kickside_job WHERE id=$1", {fenced}))[1].lease_policy)
            db:release()
            migrate("24_lease_policy", "down")
            migrate("24_lease_policy")
            db = assert(sql.get("app:policy_migration_db"))
            test.is_nil(assert(db:query("SELECT lease_policy FROM kickside_job WHERE id=$1", {running}))[1].lease_policy)
            db:release()
        end)
    end)
end)}
