-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local registry = require("registry")

local DATABASE = "app:prepared_upgrade_db"
local ROWS = 200
local INDEX_MIGRATION = "15_prepared_settlement_index"

local function migrate(name: string): any
    local result, err = funcs.call("kickside.automation.migrations:" .. name,
        {database_id=DATABASE,id=name,direction="up"})
    test.is_nil(err,name .. ": " .. tostring(err))
    test.eq(result.failed,0)
    return result
end

local function open(): any
    local db, err = sql.get(DATABASE)
    test.is_nil(err)
    return db
end

local function snapshot(db: any): any
    local rows, err = db:query("SELECT * FROM kickside_trigger_item_ledger"
        .. " ORDER BY owner_id,source_port,item_key,identity_key LIMIT 200")
    test.is_nil(err)
    return rows
end

return test.run_cases(function()
    test.describe("prepared settlement index upgrade",function()
        test.it("installs the lookup on the configured Automation database",function()
            local entry = registry.get("kickside.automation.migrations:" .. INDEX_MIGRATION)
            test.not_nil(entry)
            test.eq(entry.meta.target_db,"app:db","the migration must follow Automation's configured database")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local dialect = tostring(db:type())
            local indexes, index_err = db:query(dialect == sql.type.POSTGRES
                and "SELECT indexname AS name FROM pg_indexes WHERE schemaname=current_schema() AND tablename='kickside_trigger_item_ledger'"
                or "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='kickside_trigger_item_ledger'")
            db:release()
            test.is_nil(index_err)
            local present = false
            for _, index in ipairs(indexes) do
                if index.name == "idx_trigger_ledger_settled_delivery" then present = true end
            end
            test.is_true(present,"target_db must wire the lookup migration to Automation's database")
        end)
        test.it("preserves published ledger data and resumes an already applied index migration",function()
            -- These migrations are unchanged from automation-v0.1.133.
            for _, name in ipairs({"06_trigger_item_ledger","10_drive_schema",
                "11_delivery_provenance","12_delivery_history"}) do
                migrate(name)
            end
            local db = open()
            local _, seed_err = db:execute([[WITH RECURSIVE n(x) AS (
                SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<$1)
                INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                 first_failed_at,last_failed_at,created_at,updated_at,execution_identity_json)
                SELECT 'owner','source','item-' || CAST(x AS TEXT),'delivery-' || CAST(x AS TEXT),
                    'delivery-' || CAST(x AS TEXT),'{}','resolved','2000-01-01T00:00:00Z',
                    '2000-01-01T00:00:00Z','2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',
                    '{"retained":"identity"}' FROM n]],{ROWS})
            test.is_nil(seed_err)
            local before = snapshot(db)
            db:release()
            migrate(INDEX_MIGRATION)
            migrate(INDEX_MIGRATION)
            db = open()
            local after = snapshot(db)
            local count, count_err = db:query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger")
            test.is_nil(count_err)
            test.eq(tonumber(count[1].n),ROWS)
            test.eq(#after,#before)
            for i, row in ipairs(before) do
                for key, value in pairs(row) do test.eq(after[i][key],value) end
                for key, value in pairs(after[i]) do test.eq(row[key],value) end
            end
            local dialect = tostring(db:type())
            local indexes, index_err = db:query(dialect == sql.type.POSTGRES
                and "SELECT indexname AS name FROM pg_indexes WHERE schemaname=current_schema() AND tablename='kickside_trigger_item_ledger'"
                or "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='kickside_trigger_item_ledger'")
            db:release()
            test.is_nil(index_err)
            local present = false
            for _, index in ipairs(indexes) do
                if index.name == "idx_trigger_ledger_settled_delivery" then present = true end
            end
            test.is_true(present)
        end)
    end)
end)
