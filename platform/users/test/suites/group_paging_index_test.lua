-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local registry = require("registry")
local migration_runner = require("migration_runner")
local sql = require("sql")
local json = require("json")
local MIGRATION = "kickside.users.migrations:15_group_member_paging"
local DATABASE = "app:group_paging_migration_db"
local INDEX = "idx_app_user_groups_group_user"

local function execute(db: any, statement: string, args: {any}?)
    local result, err = db:execute(statement, args or {})
    test.is_nil(err, tostring(err))
    return result
end
local function query(db: any, statement: string, args: {any}?): any
    local result, err = db:query(statement, args or {})
    test.is_nil(err, tostring(err))
    return result
end
local function migrate(id: string): any
    local result, err = funcs.call(id, { database_id = DATABASE, id = id, direction = "up" })
    test.is_nil(err, tostring(err))
    test.not_nil(result)
    test.eq(result.failed, 0, tostring(result.error))
    return result
end
local function index_exists(db: any): boolean
    if db:type() == "postgres" then
        return #query(db, "SELECT indexname FROM pg_indexes WHERE tablename='app_user_groups' AND indexname=$1", { INDEX }) == 1
    end
    return #query(db, "SELECT name FROM sqlite_master WHERE type='index' AND name=$1", { INDEX }) == 1
end

return { run = test.run_cases(function()
    test.describe("Group member paging migration", function()
        test.it("installs and updates through the injected Users database", function()
            local entry = assert(registry.get(MIGRATION))
            test.eq(entry.meta.target_db, "app:db")
            local db = assert(sql.get("app:db"))
            test.is_true(index_exists(db), "normal installation applies the index")
            local before = assert(json.encode(query(db, "SELECT * FROM app_user_groups ORDER BY group_id,user_id")))
            execute(db, "DROP INDEX " .. INDEX)
            execute(db, "DELETE FROM _migrations WHERE id=$1", { MIGRATION })
            db:release()
            local runner = migration_runner.setup(entry.meta.target_db)
            local _, find_err = runner:find_migrations()
            test.is_nil(find_err, tostring(find_err))
            local result = runner:run()
            test.eq(result.status, "complete")
            test.eq(result.migrations_failed, 0)
            test.eq(result.migrations_applied, 1)
            db = assert(sql.get("app:db"))
            test.is_true(index_exists(db), "update uses requirement wiring without database_id")
            test.eq(assert(json.encode(query(db, "SELECT * FROM app_user_groups ORDER BY group_id,user_id"))), before)
            db:release()
        end)
        test.it("indexes populated earlier data, repeats safely and rolls back without changing membership", function()
            migrate("kickside.users.migrations:01_create_app_user_tables")
            local db = assert(sql.get(DATABASE))
            local tx = assert(db:begin())
            for i = 1, 16384 do
                local id = string.format("member-%05d", i)
                execute(tx, "INSERT INTO app_users (user_id,email,password_hash) VALUES ($1,$2,'unused')", { id, id .. "@example.test" })
                execute(tx, "INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)", { id, i % 32 == 0 and "team" or ("team-" .. tostring(i % 32)) })
            end
            assert(tx:commit())
            test.is_false(index_exists(db))
            local before = assert(json.encode(query(db, "SELECT * FROM app_user_groups ORDER BY group_id,user_id")))
            db:release()
            migrate(MIGRATION)
            db = assert(sql.get(DATABASE))
            test.is_true(index_exists(db))
            test.eq(assert(json.encode(query(db, "SELECT * FROM app_user_groups ORDER BY group_id,user_id"))), before)
            execute(db, "DELETE FROM _migrations WHERE id=$1", { MIGRATION })
            db:release()
            migrate(MIGRATION)
            db = assert(sql.get(DATABASE))
            test.is_true(index_exists(db))
            if db:type() == "postgres" then
                execute(db, "VACUUM ANALYZE app_user_groups")
                execute(db, "VACUUM ANALYZE app_users")
            else
                execute(db, "ANALYZE app_user_groups")
                execute(db, "ANALYZE app_users")
            end
            local statement = "SELECT DISTINCT ug.user_id FROM app_user_groups ug JOIN app_users u ON u.user_id=ug.user_id"
                .. " WHERE ug.group_id=$1 AND ug.user_id>$2 ORDER BY ug.user_id ASC LIMIT $3"
            local plan = query(db, (db:type() == "postgres" and "EXPLAIN (ANALYZE, BUFFERS) " or "EXPLAIN QUERY PLAN ") .. statement,
                { "team", "member-00400", 9 })
            local encoded = assert(json.encode(plan))
            print("GROUP_MEMBER_PAGING_PLAN " .. encoded)
            test.is_true(encoded:find(INDEX, 1, true) ~= nil, encoded)
            test.is_true(encoded:find("TEMP B-TREE", 1, true) == nil, encoded)
            test.is_true(encoded:find("Sort Key", 1, true) == nil, encoded)
            local page = query(db, statement, { "team", "member-00400", 9 })
            test.eq(#page, 9)
            test.eq(page[1].user_id, "member-00416")
            -- DDL is transactional on both engines: reverting an index-only
            -- transaction preserves every row from the earlier schema.
            tx = assert(db:begin())
            execute(tx, "DROP INDEX " .. INDEX)
            assert(tx:rollback())
            test.is_true(index_exists(db))
            test.eq(assert(json.encode(query(db, "SELECT * FROM app_user_groups ORDER BY group_id,user_id"))), before)
            execute(db, "DROP INDEX " .. INDEX)
            tx = assert(db:begin())
            execute(tx, "CREATE INDEX IF NOT EXISTS " .. INDEX .. " ON app_user_groups(group_id, user_id)")
            assert(tx:rollback())
            test.is_false(index_exists(db), "rolling back index installation removes only the new index")
            test.eq(assert(json.encode(query(db, "SELECT * FROM app_user_groups ORDER BY group_id,user_id"))), before)
            execute(db, "DELETE FROM _migrations WHERE id=$1", { MIGRATION })
            db:release()
            migrate(MIGRATION)
        end)
    end)
end) }
