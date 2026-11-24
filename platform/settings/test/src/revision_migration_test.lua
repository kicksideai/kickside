-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local funcs = require("funcs")
local sql = require("sql")
local test = require("test")

local DATABASE = "app:revision_migration_db"

local function migrate(name: string)
    local result, err = funcs.call("kickside.settings.migrations:" .. name, {
        database_id = DATABASE, direction = "up", id = "test:settings:" .. name,
    })
    test.is_nil(err)
    test.eq(result.status, "complete", tostring(result.error or (result.migrations and result.migrations[1].error)))
end

local function define_tests()
    test.describe("Settings revision migration", function()
        test.it("gives overrides created before revision tracking a positive revision", function()
            local shared = assert(sql.get("app:db"))
            if shared:type() == sql.type.POSTGRES then
                assert(shared:execute("DROP SCHEMA IF EXISTS settings_revision_migration_test CASCADE"))
                assert(shared:execute("CREATE SCHEMA settings_revision_migration_test"))
            end
            shared:release()

            migrate("01_settings")
            local db = assert(sql.get(DATABASE))
            assert(db:execute([[INSERT INTO kickside_settings (namespace, key, value, value_type, updated_by)
                VALUES ('legacy', 'max_items', '42', 'int', 'admin')]]))
            db:release()

            migrate("02_settings_revision")
            db = assert(sql.get(DATABASE))
            local before = assert(db:query("SELECT revision FROM kickside_settings_revision WHERE id = 1"))
            db:release()
            test.eq(tonumber(before[1].revision), 0)

            migrate("03_settings_key_revision")
            db = assert(sql.get(DATABASE))
            local rows = assert(db:query([[SELECT value, revision FROM kickside_settings
                WHERE namespace = 'legacy' AND key = 'max_items']]))
            local global = assert(db:query("SELECT revision FROM kickside_settings_revision WHERE id = 1"))
            db:release()

            test.eq(rows[1].value, "42")
            test.is_true((tonumber(rows[1].revision) or 0) > 0)
            test.eq(tonumber(rows[1].revision), tonumber(global[1].revision))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
