local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")

local DATABASE = "app:metadata_migration_db"
local PREFIX = "kickside.component.migrations:"
local UNIQUE = "13_unique_component_meta"

local function migrate(name: string, direction: string?): any
    local result, err = funcs.call(PREFIX .. name, {
        database_id = DATABASE, id = name, direction = direction or "up",
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
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
