local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local registry = require("registry")

local DATABASE = "app:metadata_migration_db"
local PREFIX = "kickside.component.migrations:"
local UNIQUE = "13_unique_component_meta"

local function migrate(name: string, direction: string?, database_id: string?): any
    local result, err = funcs.call(PREFIX .. name, {
        database_id = database_id or DATABASE, id = name, direction = direction or "up",
    })
    test.is_nil(err)
    return result
end

local function execute(db: sql.DB, statement: string, arguments: { any }?)
    local _, err = db:execute(statement, arguments or {})
    if err then error(tostring(err)) end
end

local function rows(db: sql.DB): any
    local result, err = db:query("SELECT meta_id, value, created_at, updated_at FROM kickside_component_meta ORDER BY meta_id")
    if err then error(tostring(err)) end
    return result
end

local function seed(db: sql.DB, count: number): string
    local component = uuid.v7()
    execute(db, "INSERT INTO kickside_components (component_id, impl_id, position) VALUES ($1, 'test:meta', 'n')", { component })
    for index = 1, count do
        execute(db, "INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)"
            .. " VALUES ($1, $2, 'shared', $3, $4, $4)",
            { uuid.v7(), component, tostring(index), "2026-10-0" .. tostring(index) .. "T00:00:00Z" })
    end
    return component
end

local function define_tests()
    test.describe("public metadata migration compatibility", function()
        test.it("fresh install establishes the unique component metadata key", function()
            test.eq(migrate("01_create_components_table").failed, 0)
            test.eq(migrate("02_create_component_meta_table").failed, 0)
            test.eq(migrate(UNIQUE).failed, 0)
            local db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            db = assert(db)
            local component = seed(db, 1)
            local _, duplicate_err = db:execute("INSERT INTO kickside_component_meta (meta_id, component_id, key, value) VALUES ($1, $2, 'shared', 'duplicate')", { uuid.v7(), component })
            test.not_nil(duplicate_err)
            test.eq(#rows(db), 1)
            execute(db, "DELETE FROM kickside_component_meta")
            execute(db, "DELETE FROM kickside_components")
            db:release()
            test.eq(migrate(UNIQUE, "down").failed, 0)
        end)

        test.it("updates the published non-unique schema without changing unique data", function()
            local db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            db = assert(db)
            seed(db, 1)
            local before = rows(db)
            test.eq(migrate(UNIQUE).failed, 0)
            local after = rows(db)
            test.eq(#after, #before)
            for index, original in ipairs(before) do
                test.eq(after[index].meta_id, original.meta_id)
                test.eq(after[index].value, original.value)
                test.eq(after[index].created_at, original.created_at)
                test.eq(after[index].updated_at, original.updated_at)
            end
            execute(db, "DELETE FROM kickside_component_meta")
            execute(db, "DELETE FROM kickside_components")
            db:release()
            test.eq(migrate(UNIQUE, "down").failed, 0)
        end)

        test.it("enforces the unique key through the database without rewriting duplicate rows", function()
            local db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            db = assert(db)
            local component = seed(db, 2)
            local before = rows(db)
            local result = migrate(UNIQUE)
            test.eq(result.failed, 1)
            test.eq(result.status, "error")
            test.not_nil((tostring(result.error):lower():find("unique", 1, true)))
            test.is_nil((tostring(result.error):find("C-SCRIPT-ADDITIONS.md", 1, true)))
            local after = rows(db)
            test.eq(#after, 2)
            for index, original in ipairs(before) do
                test.eq(after[index].meta_id, original.meta_id)
                test.eq(after[index].value, original.value)
                test.eq(after[index].created_at, original.created_at)
                test.eq(after[index].updated_at, original.updated_at)
            end
            execute(db, "INSERT INTO kickside_component_meta (meta_id, component_id, key, value) VALUES ($1, $2, 'shared', 'duplicate')", { uuid.v7(), component })
            test.eq(#rows(db), 3)
            local ledger, ledger_err = db:query("SELECT COUNT(*) AS n FROM _migrations WHERE id = $1", { UNIQUE })
            test.is_nil(ledger_err)
            test.eq(tonumber(ledger[1].n), 0)
            execute(db, "DELETE FROM kickside_component_meta")
            execute(db, "DELETE FROM kickside_components")
            db:release()
            test.eq(migrate(UNIQUE).failed, 0)
        end)
        test.it("adds delete leases to existing data and resumes a partially applied migration", function()
            local db = assert(sql.get(DATABASE))
            local cid = seed(db, 1)
            local metadata_before = rows(db)
            execute(db, "UPDATE kickside_components SET deleting_at='2026-01-01T00:00:00Z' WHERE component_id=$1", {cid})
            local before, read_err = db:query("SELECT * FROM kickside_components WHERE component_id=$1", {cid})
            test.is_nil(read_err)
            execute(db, "ALTER TABLE kickside_components ADD COLUMN lease_token TEXT")
            db:release()
            test.eq(migrate("14_delete_lease").failed, 0)
            test.eq(migrate("14_delete_lease").failed, 0)
            db = assert(sql.get(DATABASE))
            local after, after_err = db:query("SELECT * FROM kickside_components WHERE component_id=$1", {cid})
            test.is_nil(after_err)
            for key, value in pairs(before[1]) do test.eq(after[1][key], value, key) end
            test.is_nil(after[1].lease_token)
            test.is_nil(after[1].lease_until)
            local metadata_after = rows(db)
            test.eq(#metadata_after, 1)
            for key, value in pairs(metadata_before[1]) do test.eq(metadata_after[1][key], value, key) end
            execute(db, "DELETE FROM kickside_component_meta")
            execute(db, "DELETE FROM kickside_components")
            db:release()
        end)

        test.it("resumes delete lease migration on the PostgreSQL table selected by search_path", function()
            local admin = assert(sql.get(DATABASE))
            if admin:type() ~= sql.type.POSTGRES then admin:release(); return end
            local suffix = uuid.v7():gsub("-", "")
            local empty_schema = "lease_empty_" .. suffix
            local owner_schema = "lease_owner_" .. suffix
            local database_id = "app:lease_migration_" .. suffix
            execute(admin, 'CREATE SCHEMA "' .. empty_schema .. '"')
            execute(admin, 'CREATE SCHEMA "' .. owner_schema .. '"')
            local registered = false
            local isolated: any = nil
            local ok, failure = pcall(function()
                execute(admin, 'CREATE TABLE "' .. owner_schema .. '".kickside_components'
                    .. ' (component_id TEXT PRIMARY KEY, lease_token TEXT)')
                execute(admin, 'INSERT INTO "' .. owner_schema .. '".kickside_components'
                    .. " (component_id, lease_token) VALUES ('existing', 'preserved')")
                local entry = assert(registry.get(DATABASE))
                entry.id = database_id
                entry.data.options = entry.data.options or {}
                entry.data.options.search_path = empty_schema .. "," .. owner_schema
                local changes = assert(registry.snapshot()):changes()
                changes:create(entry)
                local applied, apply_err = changes:apply()
                test.is_nil(apply_err)
                test.ok(applied)
                registered = true

                local migrated = migrate("14_delete_lease", "up", database_id)
                test.eq(migrated.failed, 0, tostring(migrated.error))
                isolated = assert(sql.get(database_id))
                local after, read_err = isolated:query("SELECT component_id, lease_token, lease_until FROM kickside_components")
                test.is_nil(read_err)
                test.eq(#after, 1)
                test.eq(after[1].component_id, "existing")
                test.eq(after[1].lease_token, "preserved")
                test.is_nil(after[1].lease_until)
                -- Exercise the migration body again, rather than a ledger skip.
                execute(isolated, "DELETE FROM _migrations WHERE id=$1", {"14_delete_lease"})
                isolated:release()
                isolated = nil
                test.eq(migrate("14_delete_lease", "up", database_id).failed, 0)
            end)
            if isolated then isolated:release() end
            if registered then
                local cleanup = assert(registry.snapshot()):changes()
                cleanup:delete(database_id)
                local removed, remove_err = cleanup:apply()
                test.is_nil(remove_err)
                test.ok(removed)
            end
            execute(admin, 'DROP SCHEMA "' .. empty_schema .. '" CASCADE')
            execute(admin, 'DROP SCHEMA "' .. owner_schema .. '" CASCADE')
            admin:release()
            if not ok then error(failure, 0) end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
