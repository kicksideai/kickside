-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local clock = require("clock")
local jobs = require("jobs")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local fixture = require("fixture")
local query_jobs = require("query_jobs")
local eligibility = require("eligibility")
local query_fixture = require("query_fixture")

local function plan(db: sql.DB, dbtype: string, statement: string, params: table?): string
    local rows = assert(db:query((dbtype == sql.type.POSTGRES and "EXPLAIN (COSTS OFF) " or "EXPLAIN QUERY PLAN ") .. statement, params or {}))
    local lines: {string} = {}
    for _, row in ipairs(rows) do
        for _, value in pairs(row) do if type(value) == "string" then lines[#lines+1] = value end end
    end
    return table.concat(lines, "\n")
end

local function queue(fn: (sql.DB, string) -> ())
    local db, dbtype, err = fixture.private_queue("app:private_queue_health_bounded")
    if err or not db then error(err) end
    local ok, test_err = pcall(fn, db, dbtype)
    local _, release_err = db:release()
    if not ok then error(test_err) end
    if release_err then error(release_err) end
end

local function numbers(dbtype: string, total: integer): string
    return dbtype == sql.type.POSTGRES and "SELECT generate_series(1," .. tostring(total) .. ") AS n"
        or "WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<" .. tostring(total) .. ") SELECT n FROM seq"
end

local function seed(db: sql.DB, dbtype: string, total: integer)
    if total == 0 then return end
    local id = dbtype == sql.type.POSTGRES and "md5(n::text)::uuid" or "printf('%032d',n)"
    assert(db:execute([[INSERT INTO kickside_job (id,owner_kind,owner_id,job_type,status,job_identity,last_error)
        SELECT ]] .. id .. ",'test','health','test.health','pending',CAST(n AS TEXT),'failed' FROM (" .. numbers(dbtype,total) .. ") numbered"))
end

local function issue(health: table, code: string): table?
    for _, row in ipairs(health.issues) do if row.code == code then return row end end
    return nil
end

return {run = test.run_cases(function()
    test.describe("bounded Jobs diagnostics", function()
        test.it("reports only erroneous unscheduled pending one-shots as stranded", function()
            queue(function(db, dbtype)
                local ids = {}
                for _, spec in ipairs({{slot = false, parked = true}, {slot = false, parked = true},
                    {slot = false}, {slot = true, parked = true}, {slot = false, parked = true}}) do
                    local key = uuid.v7()
                    ids[#ids + 1] = assert(lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = {kind = "test", id = key}, job_type = "test.health_stranded",
                        job_identity = {namespace = "test", scope = key, key = "health"},
                        slot = spec.slot, parked = spec.parked,
                    }))
                end
                for index = 1, 4 do
                    assert(db:execute("UPDATE kickside_job SET last_error=$1 WHERE id=$2", {"worker output invalid", ids[index]}))
                end
                local health = assert(jobs.health())
                local found = issue(health, "stranded_jobs")
                test.not_nil(found)
                test.is_false(health.healthy)
                local named = {}
                for _, id in ipairs(found.job_ids) do named[id] = true end
                test.is_true(named[ids[1]] == true)
                test.is_true(named[ids[2]] == true)
                for index = 3, 5 do test.is_nil(named[ids[index]]) end
                for _, id in ipairs(ids) do assert(jobs.cancel(id)) end
                local cleared = assert(jobs.health())
                test.is_nil(issue(cleared, "stranded_jobs"))
            end)
        end)

        test.it("seeks legacy concurrency keys during capacity eligibility", function()
            queue(function(db, dbtype)
                seed(db, dbtype, 10000)
                assert(db:execute("UPDATE kickside_job SET status='running',capacity_group='capacity',concurrency_key=job_identity"))
                assert(db:execute("ANALYZE kickside_job"))
                local statement = "SELECT 1 FROM (SELECT CAST('absent' AS TEXT) AS concurrency_key,CAST('capacity' AS TEXT) AS capacity_group) j WHERE "
                    .. eligibility.available_key("'running'", "j")
                test.eq(#assert(db:query(statement)),1)
                local explain = plan(db, dbtype, statement)
                if dbtype == sql.type.SQLITE then
                    test.is_true(explain:find("uq_kickside_job_running_legacy_concurrency",1,true) ~= nil, explain)
                else
                    test.is_true(explain:find("Index Cond: (concurrency_key",1,true) ~= nil, explain)
                end
            end)
        end)
        test.it("caps status counts and samples independently at each boundary", function()
            queue(function(db, dbtype)
                for _, total in ipairs({0,16,17,1000,1001}) do
                    assert(db:execute("DELETE FROM kickside_job"))
                    seed(db,dbtype,total)
                    local health = assert(jobs.health())
                    test.eq(health.pending_jobs,math.min(total,1000))
                    test.eq(health.pending_jobs_capped,total>1000)
                    local stranded = issue(health,"stranded_jobs")
                    if total==0 then test.is_nil(stranded) else
                        test.not_nil(stranded)
                        test.eq(#stranded.job_ids,math.min(total,16))
                        test.is_nil(stranded.count)
                    end
                    assert(db:execute("UPDATE kickside_job SET status='running'"))
                    health=assert(jobs.health())
                    test.eq(health.running_jobs,math.min(total,1000))
                    test.eq(health.running_jobs_capped,total>1000)
                    test.eq(health.pending_jobs,0)
                    assert(db:execute("UPDATE kickside_job SET status='dead'"))
                    health=assert(jobs.health())
                    test.eq(health.dead_jobs,math.min(total,1000))
                    test.eq(health.dead_jobs_capped,total>1000)
                end
            end)
        end)
        test.it("counts due work even when concurrency or capacity blocks claims",function()
            queue(function(db,dbtype)
                seed(db,dbtype,1001)
                assert(db:execute("UPDATE kickside_job SET last_error=NULL,scheduled_at='2000-01-01 00:00:00',concurrency_key='blocked',capacity_group='app.capacity'"))
                local health=assert(jobs.health())
                test.eq(health.due_unclaimed_count,1000)
                test.is_true(health.due_unclaimed_count_capped)
                test.eq(health.overdue_unclaimed_count,1000)
                test.is_true(health.overdue_unclaimed_count_capped)
                test.is_true(issue(health,"due_work_unclaimed").capped)
                test.is_true(health.due_unclaimed_oldest_age_ms>700000000000)
                assert(db:execute("UPDATE kickside_job SET status='running',scheduled_at=NULL WHERE job_identity='1001'"))
                health=assert(jobs.health())
                test.eq(health.due_unclaimed_count,1000)
                test.is_false(health.due_unclaimed_count_capped)
                test.eq(health.overdue_unclaimed_count,1000)
                test.is_false(health.overdue_unclaimed_count_capped)
            end)
        end)
        test.it("uses an indexed deadline seek with 100k future jobs and mixed due work",function()
            queue(function(db,dbtype)
                seed(db,dbtype,100000)
                assert(db:execute("UPDATE kickside_job SET last_error=NULL,scheduled_at='2099-01-01 00:00:00',capacity_group='app.capacity',job_type='app:capacity_worker_a'"))
                test.eq(assert(jobs.health()).due_unclaimed_count,0)
                assert(db:execute("UPDATE kickside_job SET scheduled_at='2000-01-01 00:00:00' WHERE job_identity='1'"))
                assert(db:execute("ANALYZE kickside_job"))
                local health=assert(jobs.health())
                test.eq(health.due_unclaimed_count,1)
                test.eq(health.overdue_unclaimed_count,1)
                query_fixture.reset("",nil);query_fixture.dbtype=dbtype
                assert(query_jobs.health())
                for _, query in ipairs(query_fixture.queries) do
                    local explain=plan(db,dbtype,query.statement,query.params)
                    if not query.statement:find("kickside_job_worker",1,true) then
                    test.is_true(explain:find("Seq Scan on kickside_job",1,true)==nil,explain)
                    test.is_true(explain:find("SCAN kickside_job",1,true)==nil or explain:find("USING INDEX",1,true)~=nil,explain)
                        test.is_true(query.statement:find("lease_until",1,true)~=nil or explain:find("Sort",1,true)==nil,explain)
                        test.is_true(explain:find("USE TEMP B-TREE",1,true)==nil,explain)
                    end
                end
            end)
        end)
        test.it("reads no execution history or parked failure population",function()
            queue(function(db,dbtype)
                seed(db,dbtype,100000)
                assert(db:execute("UPDATE kickside_job SET slot=TRUE,last_error=NULL,wake_control_pending=TRUE"))
                assert(db:execute([[INSERT INTO kickside_job_run(id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status)
                    SELECT id,id,owner_kind,owner_id,job_type,1,execution_seq,'failed' FROM kickside_job]]))
                local health=assert(jobs.health())
                test.eq(health.pending_jobs,1000)
                test.is_nil(health.failed_slots)
                test.is_nil(health.degraded_jobs)
                test.is_nil(health.undelivered_wake_keys)
                test.is_nil(health.oldest_undelivered_control_wake_age_ms)
                test.is_nil(issue(health,"slots_failed"))
                query_fixture.reset("",nil);query_fixture.dbtype=dbtype
                assert(query_jobs.health())
                for _, query in ipairs(query_fixture.queries) do
                    test.is_true(query.statement:find("kickside_job_run",1,true)==nil)
                    test.is_true(query.statement:find("capacity",1,true)==nil)
                    test.is_true(query.statement:find("wake_control_pending",1,true)==nil)
                end
            end)
        end)
        test.it("filters a bounded pending window before emitting stranded sample ids",function()
            queue(function(db,dbtype)
                seed(db,dbtype,100000)
                assert(db:execute("UPDATE kickside_job SET last_error=NULL"))
                test.is_nil(issue(assert(jobs.health()),"stranded_jobs"))
                assert(db:execute("UPDATE kickside_job SET last_error='failed',priority=1 WHERE job_identity='1'"))
                test.eq(#issue(assert(jobs.health()),"stranded_jobs").job_ids,1)
                assert(db:execute("UPDATE kickside_job SET slot=TRUE WHERE job_identity='1'"))
                test.is_nil(issue(assert(jobs.health()),"stranded_jobs"))
                assert(db:execute("UPDATE kickside_job SET slot=FALSE,scheduled_at='2099-01-01 00:00:00' WHERE job_identity='1'"))
                test.is_nil(issue(assert(jobs.health()),"stranded_jobs"))
            end)
        end)
        test.it("seeks expired leases with 100k future running jobs before and after planner statistics",function()
            queue(function(db,dbtype)
                -- Keep the first plan genuinely unanalyzed: autoanalyze can
                -- otherwise sample the pending seed before its running update.
                if dbtype == sql.type.POSTGRES then
                    assert(db:execute("ALTER TABLE kickside_job SET (autovacuum_enabled=false)"))
                end
                seed(db,dbtype,100000)
                assert(db:execute("UPDATE kickside_job SET status='running',lease_until='2099-01-01 00:00:00'"))
                for _, analyzed in ipairs({false,true}) do
                    if analyzed then assert(db:execute("ANALYZE kickside_job")) end
                    query_fixture.reset("",nil);query_fixture.dbtype=dbtype
                    assert(query_jobs.health())
                    local query=query_fixture.queries[6]
                    test.is_true(query.statement:find("lease_until",1,true)~=nil)
                    local explain=plan(db,dbtype,query.statement,query.params)
                    test.is_true(explain:find(dbtype==sql.type.SQLITE and "idx_kickside_job_lease_reap (lease_until>? AND lease_until<?)"
                        or "Index Cond: (lease_until <",1,true)~=nil,explain)
                    if dbtype==sql.type.SQLITE then
                        test.is_true(explain:find("USE TEMP B-TREE",1,true)==nil,explain)
                    end
                    test.eq(assert(db:query(query.statement,query.params))[1].n,0)
                    local health=assert(jobs.health())
                    test.eq(health.expired_leases,0)
                    test.is_false(health.expired_leases_capped)
                end
            end)
        end)
        test.it("caps expired leases through the existing lease index",function()
            queue(function(db,dbtype)
                seed(db,dbtype,1001)
                assert(db:execute("UPDATE kickside_job SET status='running',lease_until='2000-01-01 00:00:00'"))
                local health=assert(jobs.health())
                test.eq(health.expired_leases,1000)
                test.is_true(health.expired_leases_capped)
                assert(db:execute("UPDATE kickside_job SET lease_until=NULL"))
                health=assert(jobs.health())
                test.eq(health.expired_leases,0)
                test.is_false(health.expired_leases_capped)
            end)
        end)
        test.it("caps fresh workers and retains the individual freshness bound",function()
            queue(function(db,dbtype)
                local id=dbtype==sql.type.POSTGRES and "LPAD(CAST(n AS TEXT),8,'0')" or "printf('%08d',n)"
                assert(db:execute("INSERT INTO kickside_job_worker(id,registry_version) SELECT "..id..",'test' FROM ("..numbers(dbtype,1002)..") numbered"))
                assert(db:execute("INSERT INTO kickside_job_worker_pulse(worker_id,registry_version,last_seen_at) SELECT id,registry_version,'2099-01-01 00:00:00' FROM kickside_job_worker"))
                assert(db:execute("UPDATE kickside_job_worker_pulse SET last_seen_at='2000-01-01 00:00:00' WHERE worker_id='00000001'"))
                local health=assert(jobs.health())
                test.eq(health.healthy_worker_count,1000)
                test.is_true(health.healthy_worker_count_capped)
                test.eq(#health.workers,256)
                test.is_false(health.workers[1].healthy)
                test.is_true(health.workers[2].healthy)
            end)
        end)
        test.it("does not count superseded historical failures",function()
            queue(function(db,dbtype)
                seed(db,dbtype,1)
                assert(db:execute("UPDATE kickside_job SET slot=TRUE,execution_seq=100001"))
                local id=dbtype==sql.type.POSTGRES and "md5(n::text)::uuid" or "printf('%032d',n)"
                assert(db:execute([[INSERT INTO kickside_job_run(id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status)
                    SELECT ]]..id..",j.id,j.owner_kind,j.owner_id,j.job_type,n,n,'failed' FROM ("..numbers(dbtype,100000)..") numbered CROSS JOIN kickside_job j"))
                local health=assert(jobs.health())
                test.eq(health.pending_jobs,1)
                test.is_nil(health.failed_slots)
                test.is_nil(issue(health,"slots_failed"))
            end)
        end)
        test.it("reads oldest due work independently of the pending priority sample",function()
            queue(function(db,dbtype)
                seed(db,dbtype,1002)
                assert(db:execute("UPDATE kickside_job SET last_error=NULL,scheduled_at='2001-01-01 00:00:00',priority=1"))
                assert(db:execute("UPDATE kickside_job SET scheduled_at='2000-01-01 00:00:00',priority=0 WHERE job_identity='1002'"))
                local observed = clock.now(dbtype)
                local original = clock.now
                clock.now = function() return observed end
                local ok, health = pcall(jobs.health)
                clock.now = original
                if not ok then error(health) end
                local expected=assert(db:query(dbtype==sql.type.POSTGRES
                    and "SELECT EXTRACT(EPOCH FROM (CAST($1 AS TIMESTAMPTZ)-'2000-01-01'::timestamptz))*1000 AS age"
                    or "SELECT (julianday($1)-julianday('2000-01-01'))*86400000 AS age", {observed}))[1].age
                test.eq(health.due_unclaimed_oldest_age_ms,math.floor(assert(tonumber(expected))))
                test.eq(health.due_unclaimed_count,1000)
                test.is_true(health.due_unclaimed_count_capped)
            end)
        end)
        test.it("leaves stored rows unchanged across repeated health reads",function()
            queue(function(db,dbtype)
                seed(db,dbtype,17)
                local before=assert(db:query("SELECT * FROM kickside_job ORDER BY id"))
                assert(jobs.health());assert(jobs.health())
                local after=assert(db:query("SELECT * FROM kickside_job ORDER BY id"))
                test.eq(#after,#before)
                for index,row in ipairs(before) do
                    for field,value in pairs(row) do test.eq(after[index][field],value) end
                end
            end)
        end)
        test.it("installs no diagnostic indexes or migration",function()
            queue(function(db,dbtype)
                local rows=assert(db:query(dbtype==sql.type.POSTGRES
                    and "SELECT indexname AS name FROM pg_indexes WHERE schemaname=current_schema()"
                    or "SELECT name FROM sqlite_master WHERE type='index'"))
                for _,row in ipairs(rows) do
                    test.is_true(row.name:find("health",1,true)==nil,row.name)
                    test.is_true(row.name:find("idx_job_capacity_due",1,true)==nil,row.name)
                    test.is_true(row.name~="idx_job_capacity_invalid_key",row.name)
                end
            end)
        end)
    end)
end)}
