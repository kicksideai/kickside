local test = require("test")
local sql = require("sql")
local funcs = require("funcs")

local MIGRATION = "kickside.uploads.migrations:05_scope_archive_deduplication"
local DATABASE = "app:dedup_migration_db"

local function execute(db: sql.DB, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function define_tests()
    test.describe("archive deduplication migration", function()
        test.it("scopes existing archive records and preserves data when downgrade conflicts", function()
            local db, db_err = sql.get(DATABASE)
            test.is_nil(db_err)
            execute(db, "CREATE TEMP TABLE kickside_uploads (uuid TEXT PRIMARY KEY, actor_id TEXT, content_sha256 TEXT, metadata TEXT)")
            execute(db, "CREATE UNIQUE INDEX idx_kickside_uploads_actor_content ON kickside_uploads(actor_id, content_sha256) WHERE content_sha256 IS NOT NULL")
            execute(db, [[INSERT INTO kickside_uploads VALUES ('member', 'owner', 'same-bytes', '{"parent_upload_id":"archive"}')]])
            local applied, apply_err = funcs.call(MIGRATION, { database_id = DATABASE, id = "archive-dedup-upgrade-test", direction = "up" })
            test.is_nil(apply_err)
            test.eq(applied.failed, 0)
            local rows, rows_err = db:query("SELECT dedup_scope FROM kickside_uploads WHERE uuid = 'member'")
            test.is_nil(rows_err)
            test.eq(rows[1].dedup_scope, "archive")
            execute(db, [[INSERT INTO kickside_uploads VALUES ('standalone', 'owner', 'same-bytes', '{}', '')]])
            local blocked, block_err = funcs.call(MIGRATION, { database_id = DATABASE, id = "archive-dedup-upgrade-test", direction = "down" })
            test.is_nil(block_err)
            test.eq(blocked.failed, 1)
            local intact, intact_err = db:query("SELECT uuid, dedup_scope FROM kickside_uploads ORDER BY uuid")
            test.is_nil(intact_err)
            test.eq(#intact, 2)
            test.eq(intact[1].dedup_scope, "archive")
            execute(db, "DELETE FROM kickside_uploads WHERE uuid = 'standalone'")
            local reverted, revert_err = funcs.call(MIGRATION, { database_id = DATABASE, id = "archive-dedup-upgrade-test", direction = "down" })
            test.is_nil(revert_err)
            test.eq(reverted.failed, 0)
            local duplicate, duplicate_err = db:execute([[INSERT INTO kickside_uploads VALUES ('duplicate', 'owner', 'same-bytes', '{}')]])
            test.not_nil(duplicate_err)
            db:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
