-- Work other jobs wait on always finds a worker: with every general slot held
-- by a job that waits for another job, the awaited job still runs, so the
-- waiters finish with their own outcome instead of holding the pool forever.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local registry = require("registry")
local config = require("config")
local jobs = require("jobs")

local AWAITED = "app:awaited_job_probe"
local AWAITING = "app:awaiting_job_probe"
local SERVICE_ID = "app:awaited_capacity_pool"

local function query(statement: string, params: table): table
    local db, db_err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(db_err)) end
    if db_err or not db then error("awaited capacity test: db unavailable: " .. tostring(db_err)) end
    local rows, query_err = db:query(statement, params)
    db:release()
    if query_err then error("awaited capacity test: query failed: " .. tostring(query_err)) end
    return rows or {}
end

local function statuses(owner_id: string, job_type: string): { string }
    local out: { string } = {}
    for _, row in ipairs(query("SELECT status FROM kickside_job WHERE owner_kind='test' AND owner_id=$1 AND job_type=$2",
        { owner_id, job_type })) do
        out[#out + 1] = tostring(row.status)
    end
    return out
end

local function count_of(values: { string }, wanted: string): integer
    local n = 0
    for _, value in ipairs(values) do if value == wanted then n = n + 1 end end
    return n
end

-- wait_until(fn, ms) polls fn until it answers true or ms elapse.
local function wait_until(fn: () -> boolean, ms: integer): boolean
    local waited = 0
    while waited <= ms do
        if fn() then return true end
        time.sleep("100ms")
        waited = waited + 100
    end
    return false
end

local function general_slots(): integer
    local policy, policy_err = config.policy()
    if policy_err or not policy then error("jobs policy unavailable: " .. tostring(policy_err)) end
    local db, db_err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(db_err)) end
    if db_err or not db then error("awaited capacity test: db unavailable: " .. tostring(db_err)) end
    local dbtype = tostring(db:type())
    db:release()
    if dbtype == sql.type.POSTGRES then return (policy :: any).worker_count_postgres end
    return (policy :: any).worker_count_sqlite
end

local function diagnostics(): string
    local parts: { string } = {}
    for _, row in ipairs(query("SELECT status, queue_tier, COUNT(*) AS n FROM kickside_job GROUP BY status, queue_tier", {})) do
        parts[#parts + 1] = tostring(row.status) .. "/" .. tostring(row.queue_tier) .. "=" .. tostring(row.n)
    end
    for _, row in ipairs(query("SELECT job_type, owner_kind, owner_id, scheduled_at, concurrency_key, wake_enabled FROM kickside_job WHERE status='pending' LIMIT 30", {})) do
        parts[#parts + 1] = "pending " .. tostring(row.job_type) .. " " .. tostring(row.owner_kind) .. ":" .. tostring(row.owner_id)
            .. " at " .. tostring(row.scheduled_at) .. " key " .. tostring(row.concurrency_key)
    end
    for _, row in ipairs(query("SELECT r.status, r.error_text FROM kickside_job_run r JOIN kickside_job j ON j.id=r.job_id WHERE j.job_type=$1 LIMIT 5", { AWAITING })) do
        parts[#parts + 1] = "run " .. tostring(row.status) .. " " .. tostring(row.error_text)
    end
    for _, row in ipairs(query("SELECT id, current_job_id FROM kickside_job_worker", {})) do
        parts[#parts + 1] = "worker " .. tostring(row.id) .. " job " .. tostring(row.current_job_id)
    end
    return table.concat(parts, "; ")
end

local function enqueue(owner_id: string, job_type: string, payload: table): string
    local queued, err = jobs.enqueue({ namespace = "awaited-capacity-test", scope = owner_id,
        owner_locator = { kind = "test", id = owner_id }, key = uuid.v7(),
        job_type = job_type, immutable_payload = payload })
    if err or not queued then error("enqueue " .. job_type .. " failed: " .. tostring(err)) end
    return tostring(queued.id)
end

local function define_tests()
    test.describe("jobs awaited capacity", function()
        local restore_version: any? = nil
        test.after_each(function()
            if restore_version then
                local _, restore_err = registry.apply_version(restore_version)
                test.is_nil(restore_err)
                restore_version = nil
            end
        end)

        test.it("runs an awaited job while every general slot waits on it", function()
            local original, version_err = registry.current_version()
            test.is_nil(version_err)
            restore_version = original
            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create({
                id = SERVICE_ID, kind = "process.service",
                meta = { comment = "Test-owned jobs worker pool for the awaited capacity proof" },
                data = { process = "app:jobs_pool_root", host = "app:processes",
                    lifecycle = { auto_start = true, security = { groups = { "wippy.security:process" } } } },
            })
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)

            local waiters = general_slots()
            local waiter_owner = "awaiting-" .. uuid.v7()
            local awaited_owner = "awaited-" .. uuid.v7()
            for _ = 1, waiters do
                enqueue(waiter_owner, AWAITING, { awaited_owner = awaited_owner, wait_ms = 20000 })
            end
            local occupied = wait_until(function(): boolean
                return count_of(statuses(waiter_owner, AWAITING), "running") == waiters
            end, 15000)
            if not occupied then
                error("every general slot holds a waiting job: " .. table.concat(statuses(waiter_owner, AWAITING), ",")
                    .. " " .. diagnostics())
            end

            local awaited_id = enqueue(awaited_owner, AWAITED, {})
            local awaited_done = wait_until(function(): boolean
                local rows = query("SELECT status FROM kickside_job WHERE id=$1", { awaited_id })
                return rows[1] ~= nil and rows[1].status == "done"
            end, 10000)
            test.is_true(awaited_done, "the awaited job runs while every general slot waits on it")

            local released = wait_until(function(): boolean
                return count_of(statuses(waiter_owner, AWAITING), "done") == waiters
            end, 10000)
            test.is_true(released, "every waiter finishes once its awaited job is done")
            local failed = query([[SELECT COUNT(*) AS n FROM kickside_job_run r JOIN kickside_job j ON j.id=r.job_id
                WHERE j.owner_kind='test' AND j.owner_id=$1 AND r.status='failed']], { waiter_owner })
            test.eq(tonumber(failed[1].n), 0, "no waiter timed out waiting for its awaited job")
        end)
    end)
end

return test.run_cases(define_tests)
