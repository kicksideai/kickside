-- Job queue fixtures shared by the jobs suites.
--
-- The shared app:db queue holds rows from every suite, so no test there calls
-- the global claim. A test that runs on app:db enqueues its job parked (no
-- claimer can select it) and leases exactly that row with lease_own.
--
-- A test whose subject is claim selection or a queue-wide sweep owns a private
-- queue instead: private_queue(queue_id) rebuilds its registered queue from
-- the live app:db schema. Each suite owns a separate resource, so rebuilding
-- one queue preserves the rows and schema of every other active suite.

local sql = require("sql")
local json = require("json")
local process = require("process")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local cfg = require("config")
local committed_policy = require("runtime_policy")
local wake = require("wake")

local fixture = {}

function fixture.process_registry(pid: string): any
    local names = {}
    return {
        register = function(name: string): (boolean?, error?)
            if names[name] then
                return nil, (errors.new({ kind = errors.ALREADY_EXISTS, message = "name already owned" }) :: error)
            end
            names[name] = pid
            return true, nil
        end,
        lookup = function(name: string): (string?, error?)
            if not names[name] then
                return nil, (errors.new({ kind = errors.NOT_FOUND, message = "name has no owner" }) :: error)
            end
            return names[name], nil
        end,
        unregister = function(name: string): (boolean, nil)
            local present = names[name] ~= nil
            names[name] = nil
            return present, nil
        end,
    }
end

local SHARED_DB = "app:db"

-- Pool process tests override only the sizing knobs they exercise. Keeping the
-- rest of the object from the registered Jobs policy makes those doubles obey
-- the same complete runtime shape as production without adding fallback policy
-- values to worker_pool.
function fixture.pool_policy(overrides: table?): table
    local resolved, err = cfg.policy()
    if err or not resolved then error("Jobs pool test policy unavailable: " .. tostring(err)) end
    local policy: table = {}
    for key, value in pairs(resolved :: table) do
        if key == "fairness_shares" then
            local shares: table = {}
            for tier, share in pairs(value :: table) do shares[tier] = share end
            policy[key] = shares
        else
            policy[key] = value
        end
    end
    for key, value in pairs(overrides or {}) do policy[key] = value end
    return policy
end

-- Pool control-flow tests own worker timers and inject their expected durable
-- deadline behavior. This double disables the independent retention cadence so
-- it cannot add an unrelated timer to those cases.
fixture.no_retention_schedule = {
    new = function()
        return { deadline = function() return nil end, run = function() end }
    end,
}

-- The queue closure, parents first: kickside_job_run references kickside_job.
local QUEUE_TABLES = { "kickside_job_policy_revision", "kickside_job_policy_override", "kickside_wake_fanout", "kickside_job_thread_cleanup", "kickside_job", "kickside_job_run",
    "kickside_job_worker", "kickside_job_worker_pulse" }

local IDENTIFIER = "^[a-z_][a-z0-9_]*$"

local function failure(message: string, cause: any?): error
    local text = message
    if cause ~= nil then text = text .. ": " .. tostring(cause) end
    return (errors.new({ message = text, kind = errors.INTERNAL }) :: error)
end

local function in_closure(name: string): boolean
    for _, table_name in ipairs(QUEUE_TABLES) do
        if table_name == name then return true end
    end
    return false
end

local function run_all(db: sql.DB, statements: { string }): error?
    for _, statement in ipairs(statements) do
        local _, err = db:execute(statement)
        if err then return failure("private queue statement failed (" .. statement .. ")", err) end
    end
    return nil
end

-- SQLite: replay the exact stored DDL of the closure's tables, indexes and
-- triggers into the private database.
local function rebuild_sqlite(shared: sql.DB, queue: sql.DB): error?
    local drops: { string } = {}
    for i = #QUEUE_TABLES, 1, -1 do drops[#drops + 1] = "DROP TABLE IF EXISTS " .. QUEUE_TABLES[i] end
    local drop_err = run_all(queue, drops)
    if drop_err then return drop_err end

    local tables: { string } = {}
    local objects: { string } = {}
    for _, name in ipairs(QUEUE_TABLES) do
        local fks, fk_err = shared:query("PRAGMA foreign_key_list(" .. name .. ")")
        if fk_err then return failure("private queue foreign keys of " .. name, fk_err) end
        for _, fk in ipairs(fks or {}) do
            local target = tostring((fk :: any).table)
            if not in_closure(target) then
                return failure("private queue table " .. name .. " references " .. target .. " outside the queue closure")
            end
        end
        local rows, ddl_err = shared:query(
            "SELECT type, sql FROM sqlite_master WHERE tbl_name = ? AND sql IS NOT NULL ORDER BY name", { name })
        if ddl_err then return failure("private queue schema of " .. name, ddl_err) end
        local found = false
        for _, row in ipairs(rows or {}) do
            local ddl = tostring((row :: any).sql)
            if (row :: any).type == "table" then
                tables[#tables + 1] = ddl
                found = true
            else
                objects[#objects + 1] = ddl
            end
        end
        if not found then return failure("private queue source table " .. name .. " is missing") end
    end
    local table_err = run_all(queue, tables)
    if table_err then return table_err end
    return run_all(queue, objects)
end

local function single_value(db: sql.DB, statement: string, column: string): (string?, error?)
    local rows, err = db:query(statement)
    if err then return nil, err end
    local value = rows and rows[1] and (rows[1] :: any)[column]
    if value == nil then return nil, failure(statement .. " returned no " .. column) end
    return tostring(value), nil
end

-- PostgreSQL: the private queue connects with search_path set to one private
-- schema. The schema is recreated with LIKE ... INCLUDING ALL copies of the
-- closure's tables, then their foreign keys and triggers are replayed from the
-- live definitions.
local function rebuild_postgres(shared: sql.DB, queue: sql.DB): error?
    local schema, path_err = single_value(queue, "SHOW search_path", "search_path")
    if path_err then return failure("private queue search_path", path_err) end
    local source, source_err = single_value(shared, "SELECT current_schema() AS name", "name")
    if source_err then return failure("shared queue schema", source_err) end
    if not string.match(schema :: string, IDENTIFIER) then
        return failure("private queue search_path must name exactly one schema", schema)
    end
    if not string.match(source :: string, IDENTIFIER) or source == schema then
        return failure("shared queue schema must differ from the private queue schema", source)
    end

    local statements: { string } = {
        "DROP SCHEMA IF EXISTS " .. schema .. " CASCADE",
        "CREATE SCHEMA " .. schema,
    }
    for _, name in ipairs(QUEUE_TABLES) do
        statements[#statements + 1] = "CREATE TABLE " .. schema .. "." .. name ..
            " (LIKE " .. source .. "." .. name .. " INCLUDING ALL)"
    end
    local create_err = run_all(queue, statements)
    if create_err then return create_err end

    -- Definitions are rendered on the shared connection; their unqualified
    -- table names resolve to the private copies when replayed on the private
    -- connection, and trigger functions are pinned to their own schema.
    local replays: { string } = {}
    for _, name in ipairs(QUEUE_TABLES) do
        local fks, fk_err = shared:query([[
            SELECT c.conname AS name, c.confrelid::regclass::text AS target, pg_get_constraintdef(c.oid) AS def
            FROM pg_constraint c
            WHERE c.contype = 'f' AND c.conrelid = $1::regclass
            ORDER BY c.conname]], { name })
        if fk_err then return failure("private queue foreign keys of " .. name, fk_err) end
        for _, fk in ipairs(fks or {}) do
            local target = tostring((fk :: any).target)
            if not in_closure(target) then
                return failure("private queue table " .. name .. " references " .. target .. " outside the queue closure")
            end
            replays[#replays + 1] = "ALTER TABLE " .. name .. " ADD CONSTRAINT " ..
                tostring((fk :: any).name) .. " " .. tostring((fk :: any).def)
        end

        local triggers, trigger_err = shared:query([[
            SELECT pg_get_triggerdef(t.oid) AS def, p.proname AS fn, n.nspname AS fn_schema
            FROM pg_trigger t
            JOIN pg_proc p ON p.oid = t.tgfoid
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE t.tgrelid = $1::regclass AND NOT t.tgisinternal
            ORDER BY t.tgname]], { name })
        if trigger_err then return failure("private queue triggers of " .. name, trigger_err) end
        for _, trigger in ipairs(triggers or {}) do
            local def = tostring((trigger :: any).def)
            local fn = tostring((trigger :: any).fn)
            local qualified = tostring((trigger :: any).fn_schema) .. "." .. fn
            -- The trigger target renders schema-qualified; retarget it to the
            -- private copy.
            local target = " ON " .. source .. "." .. name .. " "
            local on_at = string.find(def, target, 1, true)
            if not on_at then
                return failure("private queue trigger does not target " .. source .. "." .. name, def)
            end
            def = string.sub(def, 1, on_at - 1) .. " ON " .. name .. " " .. string.sub(def, on_at + #target)
            local call = "EXECUTE FUNCTION " .. fn .. "("
            local at = string.find(def, call, 1, true)
            if at then
                def = string.sub(def, 1, at - 1) .. "EXECUTE FUNCTION " .. qualified .. "(" .. string.sub(def, at + #call)
            elseif not string.find(def, "EXECUTE FUNCTION " .. qualified .. "(", 1, true) then
                return failure("private queue trigger function is not " .. qualified, def)
            end
            replays[#replays + 1] = def
        end
    end
    return run_all(queue, replays)
end

-- A suite that supervises job children, proc targets or heartbeats from its
-- own process stands in for the worker loop, so it traps links for its whole
-- life exactly as the loop does: a child it terminates reports LINK_DOWN as an
-- event instead of ending the supervising process.
function fixture.supervise_as_loop(): error?
    local _, err = process.set_options({ trap_links = true })
    if err then return failure("supervising test process could not trap links", err) end
    return nil
end

-- Rebuild the private queue empty from the live job schema and return a handle
-- to it with its dialect. The caller releases the handle.
function fixture.private_queue(queue_id: string): (sql.DB?, string?, error?)
    local shared, shared_err = sql.get(SHARED_DB)
    if shared_err or not shared then return nil, nil, failure("shared queue unavailable", shared_err) end
    local queue, queue_err = sql.get(queue_id)
    if queue_err or not queue then
        shared:release()
        return nil, nil, failure("private queue unavailable", queue_err)
    end
    local shared_type = tostring(shared:type())
    local dbtype = tostring(queue:type())
    local rebuild_err: error?
    if shared_type ~= dbtype then
        rebuild_err = failure("private queue dialect " .. dbtype .. " differs from shared " .. shared_type)
    elseif dbtype == sql.type.POSTGRES then
        rebuild_err = rebuild_postgres(shared, queue)
    else
        rebuild_err = rebuild_sqlite(shared, queue)
    end
    if not rebuild_err then
        local _, seed_err = queue:execute("INSERT INTO kickside_job_policy_revision (id,revision) VALUES (1,0)", {})
        rebuild_err = seed_err
    end
    shared:release()
    if rebuild_err then
        queue:release()
        return nil, nil, rebuild_err
    end
    return queue, dbtype, nil
end

-- Lease the pending row `id` exactly as a claim leases a selected row: running
-- under a fresh token and the production lease window, attempts and
-- execution_seq advanced by one. A claim only takes a due row, so a parked row
-- becomes due now. Returns the full leased row.
function fixture.lease_own(db: sql.DB, dbtype: string, id: string?): (table?, error?)
    if not id or id == "" then return nil, failure("job fixture requires a job id") end
    local policy, policy_err = committed_policy.resolve_from(db)
    if policy_err then return nil, policy_err end
    local now = lifecycle.now_string(dbtype)
    local due = dbtype == sql.type.POSTGRES and "COALESCE(scheduled_at, CAST(? AS TIMESTAMPTZ))"
        or "COALESCE(scheduled_at, ?)"
    local result, update_err = sql.builder.update("kickside_job")
        :set("status", "running")
        :set("lease_policy", assert(json.encode(cfg.capture(policy))))
        :set("attempts", sql.builder.expr("attempts + 1"))
        :set("execution_seq", sql.builder.expr("execution_seq + 1"))
        :set("lease_token", uuid.v7())
        :set("lease_until", lifecycle.future_string(dbtype, (policy :: any).lease_timeout_seconds))
        :set("heartbeat_at", now)
        :set("scheduled_at", sql.builder.expr(due, now))
        :where(sql.builder.eq({ id = id, status = "pending" }))
        :run_with(db):exec()
    if update_err then return nil, failure("lease of own job " .. id .. " failed", update_err) end
    if lifecycle.rows_affected(result) ~= 1 then
        return nil, (errors.new({ message = "own job " .. id .. " is not pending", kind = errors.CONFLICT }) :: error)
    end
    local rows, read_err = sql.builder.select("*"):from("kickside_job")
        :where(sql.builder.eq({ id = id })):run_with(db):query()
    if read_err then return nil, failure("leased job " .. id .. " unreadable", read_err) end
    if not rows or #rows ~= 1 then return nil, failure("leased job " .. id .. " is missing") end
    rows[1].lease_policy = cfg.capture(policy)
    return rows[1] :: table, nil
end

-- Enqueue a job parked, so no claimer can select it, and lease that row.
function fixture.enqueue_leased(db: sql.DB, dbtype: string, params: lifecycle.EnqueueParams): (table?, error?)
    if type(params.job_type) ~= "string" then error("job fixture requires job_type") end
    local own: lifecycle.EnqueueParams = {
        owner_locator = { kind = "test", id = "job_fixture" }, parked = true,
        job_type = params.job_type, thread_id = params.thread_id,
        worker_ref = params.worker_ref, concurrency_key = params.concurrency_key,
        payload = params.payload, queue_tier = params.queue_tier, priority = params.priority,
        max_attempts = params.max_attempts, idempotency_key = params.idempotency_key,
        scheduled_at = params.scheduled_at, trace_context = params.trace_context,
        job_identity = params.job_identity, slot = params.slot, wake_key = params.wake_key,
    }
    local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, own)
    if enqueue_err then return nil, enqueue_err end
    return fixture.lease_own(db, dbtype, tostring(id))
end

-- Lifecycle fixtures use the same claim snapshot path as execution fixtures;
-- an attempt-count setup changes only the counter under test.
function fixture.running_job(db: sql.DB, dbtype: string, thread_id: string?, attempts: integer, max_attempts: integer,
        owner_id: string?): (table?, error?)
    local scope = uuid.v7()
    local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = {kind = "test", id = owner_id or "lifecycle_test"},
        job_identity = {namespace = "oneshot", scope = scope, key = scope},
        thread_id = thread_id, job_type = "test.job", payload = {}, parked = true, max_attempts = max_attempts})
    if enqueue_err then return nil, enqueue_err end
    local job, claim_err = fixture.lease_own(db, dbtype, id)
    if claim_err then return nil, claim_err end
    local _, count_err = db:execute("UPDATE kickside_job SET attempts=$1 WHERE id=$2", {attempts, id})
    if count_err then return nil, count_err end
    job.attempts = attempts
    return job, nil
end

-- Test-only public-contract caller: publish wake demand in its transaction and
-- notify the pool only after that transaction commits.
function fixture.wake_key(db: sql.DB, dbtype: string, key: string): (table?, error?)
    local tx, begin_err = db:begin()
    if begin_err or not tx then return nil, failure("wake test transaction failed", begin_err) end
    local result, wake_err = wake.wake_tx(tx, key, dbtype)
    if wake_err then tx:rollback(); return nil, wake_err end
    local _, commit_err = tx:commit()
    if commit_err then return nil, failure("wake test commit failed", commit_err) end
    local _, nudge_err = wake.nudge_workers(db, dbtype)
    if nudge_err then return nil, nudge_err end
    return result, nil
end

function fixture.observe_db(db: sql.DB, on_query: (() -> ())?, on_begin: (() -> ())?): sql.DB
    return {
        type = function() return db:type() end,
        query = function(_, statement: string, ...)
            if on_query then on_query() end
            return db:query(statement, ...)
        end,
        execute = function(_, statement: string, ...) return db:execute(statement, ...) end,
        prepare = function(_, statement: string) return db:prepare(statement) end,
        begin = function(_, options)
            if on_begin then on_begin() end
            return db:begin(options)
        end,
        release = function() return db:release() end,
        stats = function() return db:stats() end,
    }
end


function fixture.observe_tx(tx: sql.Transaction, on_query: (string) -> (), on_execute: (() -> ())?): sql.Transaction
    return {
        query = function(_, statement: string, ...)
            local rows, err = tx:query(statement, ...)
            on_query(statement)
            return rows, err
        end,
        execute = function(_, statement: string, ...) if on_execute then on_execute() end; return tx:execute(statement, ...) end,
        prepare = function(_, statement: string) return tx:prepare(statement) end,
        savepoint = function(_, name: string) return tx:savepoint(name) end,
        rollback_to = function(_, name: string) return tx:rollback_to(name) end,
        release = function(_, name: string) return tx:release(name) end,
        db_type = function() return tx:db_type() end,
        commit = function() return tx:commit() end,
        rollback = function(_, name: string?) return tx:rollback(name) end,
    }
end


return fixture
