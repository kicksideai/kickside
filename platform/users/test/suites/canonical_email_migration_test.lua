local test = require("test")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")

local DATABASE = "app:grant_migration_db"
local MIGRATION = "kickside.users.migrations:10_canonical_email_grants"

local function migrate(id: string): any
    local result, err = funcs.call(id, {database_id = DATABASE, id = id, direction = "up"})
    test.is_nil(err, tostring(err))
    test.not_nil(result)
    return result
end

local function execute(db: sql.DB, statement: string, arguments: {any}?)
    local _, err = db:execute(statement, arguments or {})
    if err then error(tostring(err)) end
end

local function grants(db: sql.DB): any
    local rows, err = db:query("SELECT subject_id, access_mask FROM kickside_component_access ORDER BY subject_id")
    if err then error(tostring(err)) end
    return rows
end

local function define_tests()
    test.describe("canonical email grants on the preceding schema", function()
        test.it("preserves and combines grants without reading later user schema", function()
            for _, id in ipairs({"kickside.users.migrations:01_create_app_user_tables",
                    "kickside.component.migrations:01_create_components_table",
                    "kickside.component.migrations:03_create_component_access_table"}) do
                test.eq(migrate(id).failed, 0)
            end
            local db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            local user, component = uuid.v7(), uuid.v7()
            execute(db, "INSERT INTO app_users (user_id, email, password_hash) VALUES ($1, 'member@example.test', 'unused')", {user})
            execute(db, "INSERT INTO kickside_components (component_id, impl_id) VALUES ($1, 'test:grant')", {component})
            for _, row in ipairs({{user, 1}, {"Member@Example.Test", 2}, {"unknown@example.test", 4}}) do
                execute(db, "INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask)"
                    .. " VALUES ($1, 'user', $2, $3, $4, $5)", {uuid.v7(), row[1], component, component, row[2]})
            end
            db:release()
            local result = migrate(MIGRATION)
            test.eq(result.failed, 0, tostring(result.error))
            db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            local rows = grants(db)
            test.eq(#rows, 2)
            local by_subject = {}
            for _, row in ipairs(rows) do by_subject[row.subject_id] = tonumber(row.access_mask) end
            test.eq(by_subject[user], 3)
            test.eq(by_subject["unknown@example.test"], 4)
            execute(db, "DELETE FROM _migrations WHERE id=$1", {MIGRATION})
            db:release()
            test.eq(migrate(MIGRATION).failed, 0)
            db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            test.eq(#grants(db), 2)
            db:release()
        end)
    end)
end

return {run = test.run_cases(define_tests)}
