local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local migration_registry = require("migration_registry")

local DB = "app:jobs_migration_db"
local MIGRATION = "kickside.core.jobs.migrations:23_jobs_updated_at"

local function with_db(id: string, callback: (sql.DB) -> any): any
    local db, err = sql.get(id)
    if not db then error("migration database unavailable: " .. tostring(err)) end
    local ok, result = pcall(callback, db)
    db:release()
    if not ok then error(result) end
    return result :: any
end

local function postgres()
    return with_db("app:db", function(db) return tostring(db:type()) == sql.type.POSTGRES end)
end

local function execute(statement, params)
    return with_db(DB, function(db)
        local _, err = db:execute(statement, params or {})
        if err then error(tostring(err)) end
    end)
end

local function query(statement: string, params: {any}?): {table}
    return with_db(DB, function(db)
        local rows, err = db:query(statement, params or {})
        if err then error(tostring(err)) end
        return rows :: {table}
    end)
end

local function scratch_name(db)
    local rows, err = db:query("SELECT current_database() AS name")
    if err then error(tostring(err)) end
    return '"' .. tostring(rows[1].name):gsub('"', '""') .. '_jobs_mig"'
end

local function drop()
    if postgres() then
        with_db("app:db", function(db)
            local _, err = db:execute("DROP DATABASE IF EXISTS " .. scratch_name(db) .. " WITH (FORCE)")
            if err then error(tostring(err)) end
        end)
    end
end

local function reset()
    if postgres() then
        drop()
        with_db("app:db", function(db)
            local _, err = db:execute("CREATE DATABASE " .. scratch_name(db))
            if err then error(tostring(err)) end
        end)
    else
        execute("PRAGMA foreign_keys = OFF")
        for _, row in ipairs(query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")) do
            execute('DROP TABLE "' .. tostring(row.name):gsub('"', '""') .. '"')
        end
        execute("PRAGMA foreign_keys = ON")
    end
end

local function migrate(entry, direction)
    local result, err = funcs.new():call(entry, {
        database_id = DB, id = entry, direction = direction or "up",
    })
    test.is_nil(err)
    test.not_nil(result)
    test.eq(result.status, "complete", tostring(result.error
        or (result.migrations and result.migrations[1] and result.migrations[1].error)))
end

local function installation(include_new)
    -- The bootloader discovers all modules for the bound database in this order.
    local entries, err = migration_registry.find({target_db = "app:db"})
    test.is_nil(err)
    local positions = {}
    for i, entry in ipairs(entries) do positions[entry.id] = i end
    test.not_nil(positions[MIGRATION], "the forward migration is registered")
    test.is_true(positions["kickside.core.migrations:01_thread"]
        < positions["kickside.core.jobs.migrations:04_jobs"])
    test.is_true(positions["kickside.core.migrations:02_projection"]
        < positions["kickside.core.jobs.migrations:04_jobs"])
    test.is_true(positions["kickside.core.jobs.migrations:21_retire_upload_intent_slot"] < positions[MIGRATION])
    for _, entry in ipairs(entries) do
        if include_new or entry.id ~= MIGRATION then migrate(entry.id) end
    end
end

local function trigger_definition()
    return query([[SELECT pg_get_triggerdef(oid) AS definition FROM pg_trigger
        WHERE tgrelid='kickside_job'::regclass AND tgname='trg_kickside_job_updated_at']])[1].definition
end

local function core_definition()
    return query("SELECT pg_get_functiondef('core_set_updated_at()'::regprocedure) AS definition")[1].definition
end

local function assert_owner(name)
    local rows = query([[SELECT t.tgname, p.proname FROM pg_trigger t
        JOIN pg_proc p ON p.oid=t.tgfoid JOIN pg_class c ON c.oid=t.tgrelid
        JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname=current_schema() AND c.relname LIKE 'kickside_job%'
        AND NOT t.tgisinternal ORDER BY t.tgname]])
    test.eq(#rows, 1)
    test.eq(rows[1].tgname, "trg_kickside_job_updated_at")
    test.eq(rows[1].proname, name)
    test.is_true(string.find(trigger_definition(), "BEFORE UPDATE ON", 1, true) ~= nil)
    test.is_true(string.find(trigger_definition(), "FOR EACH ROW", 1, true) ~= nil)
end

local function insert_job()
    local id = uuid.v7()
    execute([[INSERT INTO kickside_job(id,job_type,job_identity,owner_kind,owner_id,created_at,updated_at)
        VALUES($1,'test.updated_at',$2,'test','migration','2000-01-01 00:00:00','2000-01-01 00:00:00')]], {id, id})
    return id
end

local function assert_update(id)
    if postgres() then
        -- A new transaction gets a later NOW() value without changing production semantics.
        query("SELECT pg_sleep(0.01)")
    end
    execute("UPDATE kickside_job SET priority=priority+1 WHERE id=$1", {id})
    local rows = query("SELECT 1 AS advanced FROM kickside_job WHERE id=$1 AND updated_at > created_at", {id})
    test.eq(#rows, 1)
    if postgres() then
        local before = query("SELECT updated_at::text AS value FROM kickside_job WHERE id=$1", {id})[1].value
        query("SELECT pg_sleep(0.01)")
        execute("UPDATE kickside_job SET priority=priority+1 WHERE id=$1", {id})
        test.eq(#query("SELECT 1 AS advanced FROM kickside_job WHERE id=$1 AND updated_at > $2::timestamptz", {id, before}), 1)
    end
end

return test.run_cases(function()
    test.describe("Jobs owns its updated_at trigger", function()
        test.after_each(drop)

        test.it("upgrades Jobs at 21, repeats up, and preserves Core's function and job rows", function()
            reset()
            installation(false)
            local id = insert_job()
            local original
            if postgres() then
                assert_owner("core_set_updated_at")
                original = core_definition()
            end
            migrate(MIGRATION)
            -- Applying again over existing objects succeeds: its function and trigger statements are idempotent.
            execute("DELETE FROM _migrations WHERE id = $1", { MIGRATION })
            migrate(MIGRATION)
            if postgres() then
                assert_owner("kickside_jobs_set_updated_at")
                test.eq(core_definition(), original)
            end
            assert_update(id)
        end)

        test.it("applies every real migration in installation order on a fresh database", function()
            reset()
            installation(true)
            if postgres() then assert_owner("kickside_jobs_set_updated_at") end
            assert_update(insert_job())
        end)

        test.it("restores the exact historical trigger on down and converges on up", function()
            reset()
            installation(false)
            local id = insert_job()
            local legacy
            if postgres() then legacy = trigger_definition() end
            migrate(MIGRATION)
            migrate(MIGRATION, "down")
            if postgres() then
                assert_owner("core_set_updated_at")
                test.eq(trigger_definition(), legacy)
                test.eq(#query([[SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                    WHERE n.nspname=current_schema() AND p.proname='kickside_jobs_set_updated_at']]), 0)
            end
            assert_update(id)
            migrate(MIGRATION)
            if postgres() then assert_owner("kickside_jobs_set_updated_at") end
            assert_update(id)
        end)

        test.it("updates Jobs after Core's trigger function is removed", function()
            if not postgres() then return end
            reset()
            installation(true)
            -- Only this disposable database loses Core triggers through CASCADE.
            execute("DROP FUNCTION core_set_updated_at() CASCADE")
            assert_owner("kickside_jobs_set_updated_at")
            assert_update(insert_job())
        end)
    end)
end)
