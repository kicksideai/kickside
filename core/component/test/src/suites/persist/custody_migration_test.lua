-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")

local DB = "app:metadata_migration_db"
local SCHEMA = "17_custody_schema"
local BACKFILL = "19_custody_backfill"
local INDEXES = "20_custody_indexes"

local function migrate(name: string): any
    return assert(funcs.call("kickside.component.migrations:" .. name, {database_id = DB, id = name, direction = "up"}))
end

local function id(index: integer): string
    return string.format("00000000-0000-4000-8000-%012x", index)
end

local function read(db, component_id: string): any
    return assert(db:query([[SELECT component_id,secrets_incarnation,owner_type,owner_kind,owner_id,deleting_at
        FROM kickside_components WHERE component_id=$1]], {component_id}))[1]
end

return {run = test.run_cases(function()
    test.describe("typed custody upgrade", function()
        test.it("keeps ambiguous and paged-delete rows unresolved and resumes the incarnation backfill", function()
            for _, name in ipairs({"01_create_components_table", "02_create_component_meta_table",
                "07_identity_fence", "16_component_secrets"}) do
                test.eq(migrate(name).failed, 0)
            end
            local db = assert(sql.get(DB))
            local postgres = db:type() == sql.type.POSTGRES
            local adopted, ambiguous, marked = id(1), id(2), id(201)
            local incarnation = uuid.v4()
            for index = 1, 201 do
                assert(db:execute("INSERT INTO kickside_components(component_id,impl_id) VALUES ($1,'test:legacy')",
                    {id(index)}))
            end
            assert(db:execute("UPDATE kickside_components SET secrets_incarnation=$1 WHERE component_id=$2", {incarnation, adopted}))
            local record = [[{"outcome":"adopted","request_id":"adopt:fixture","component_id":"]] .. adopted
                .. [[","authorizer":"user:operator","new_principal":"user:operator"}]]
            assert(db:execute([[INSERT INTO kickside_execution_identity_audit
                (component_id,identity_generation,request_id,record_json,created_at)
                VALUES ($1,1,'adopt:fixture',$2,'2026-01-01T00:00:00Z')]], {adopted, record}))
            assert(db:execute([[INSERT INTO kickside_component_meta(meta_id,component_id,key,value)
                VALUES ($1,$2,'owner','mutable-display-owner')]], {uuid.v7(), ambiguous}))
            assert(db:execute("UPDATE kickside_components SET deleting_at='legacy-mark' WHERE component_id=$1", {marked}))

            test.eq(migrate(SCHEMA).failed, 0)
            -- Refuse the first write on page two. The real migration runner
            -- rolls back this page and records the previous page's cursor.
            if postgres then
                assert(db:execute([[CREATE FUNCTION reject_custody_page() RETURNS trigger AS $$
                    BEGIN RAISE EXCEPTION 'hold page two'; END; $$ LANGUAGE plpgsql]]))
                assert(db:execute("CREATE TRIGGER reject_custody_page BEFORE UPDATE ON kickside_components FOR EACH ROW"
                    .. " WHEN (OLD.component_id='" .. marked .. "') EXECUTE FUNCTION reject_custody_page()"))
            else
                assert(db:execute("CREATE TRIGGER reject_custody_page BEFORE UPDATE ON kickside_components"
                    .. " WHEN OLD.component_id='" .. marked .. "' BEGIN SELECT RAISE(ABORT,'hold page two'); END"))
            end

            local interrupted = migrate(BACKFILL)
            test.eq(interrupted.failed, 1)
            test.is_true(tostring(interrupted.error):find("hold page two", 1, true) ~= nil, tostring(interrupted.error))
            local first = read(db, ambiguous)
            test.eq(first.owner_type, "unresolved")
            test.is_nil(first.owner_id)
            test.not_nil(first.secrets_incarnation)
            test.eq(read(db, adopted).owner_id, "operator")
            test.eq(read(db, adopted).owner_kind, "user")
            test.eq(read(db, adopted).secrets_incarnation, incarnation)
            test.is_nil(read(db, marked).secrets_incarnation)
            test.eq(assert(db:query("SELECT cursor FROM _migration_progress WHERE id=$1", {BACKFILL}))[1].cursor, id(200))

            if postgres then
                assert(db:execute("DROP TRIGGER reject_custody_page ON kickside_components"))
                assert(db:execute("DROP FUNCTION reject_custody_page()"))
            else
                assert(db:execute("DROP TRIGGER reject_custody_page"))
            end
            test.eq(migrate(BACKFILL).failed, 0)
            test.eq(migrate(SCHEMA).failed, 0)
            test.eq(migrate(BACKFILL).failed, 0)
            test.eq(migrate(INDEXES).failed, 0)
            test.eq(migrate(INDEXES).failed, 0)
            local index_query = postgres
                and [[SELECT indexname AS name FROM pg_indexes WHERE schemaname=current_schema()
                      AND tablename='kickside_components' AND indexname LIKE 'idx_kickside_components_custody_%' ORDER BY name]]
                or [[SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='kickside_components'
                      AND name LIKE 'idx_kickside_components_custody_%' ORDER BY name]]
            local indexes = assert(db:query(index_query))
            test.eq(#indexes, 2)
            test.eq(indexes[1].name, "idx_kickside_components_custody_component")
            test.eq(indexes[2].name, "idx_kickside_components_custody_principal")
            test.eq(read(db, ambiguous).secrets_incarnation, first.secrets_incarnation)
            local last = read(db, marked)
            test.not_nil(last.secrets_incarnation)
            test.eq(last.deleting_at, "legacy-mark")
            test.eq(last.owner_type, "unresolved")
            test.eq(#assert(db:query("SELECT id FROM _migration_progress WHERE id=$1", {BACKFILL})), 0)
            assert(db:execute("DELETE FROM kickside_execution_identity_audit WHERE component_id=$1", {adopted}))
            assert(db:execute("DELETE FROM kickside_component_meta WHERE component_id=$1", {ambiguous}))
            assert(db:execute("DELETE FROM kickside_components WHERE impl_id='test:legacy'"))
            assert(db:release())
        end)
    end)
end)}
