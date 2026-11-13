local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local time = require("time")
local scratch = require("migration_scratch")
local sweeper = require("sweeper")
local repo = require("retention_repo")
local migration_under_test = require("migration_under_test")
local registry_fixture = require("registry_fixture")

return test.run_cases(function()
    test.describe("Inherited retention upgrade", function()
        test.it("converts untouched defaults in bounded pages and preserves chosen windows", function()
            scratch.reset()
            for _, name in ipairs({"00_encoding", "01_thread", "02_projection", "05_retention",
                "07_retention_pins", "08_write_receipts"}) do
                scratch.migrate("kickside.core.migrations:" .. name)
            end
            scratch.migrate("kickside.core.migration_tests:legacy_component_schema")
            local function seed(impl, days, updated)
                local id = uuid.v7()
                scratch.exec("INSERT INTO kickside_components(component_id,impl_id) VALUES($1,$2)", {id,impl})
                scratch.exec("INSERT INTO kickside_thread(id,component_id,thread_class) VALUES($1,$2,'test')", {id,id})
                scratch.exec([[INSERT INTO kickside_retention_policy
                    (id,thread_id,event_hot_retention_days,created_at,updated_at)
                    VALUES($1,$1,$2,'2026-01-01 00:00:00',$3)]], {id,days,updated or "2026-01-01 00:00:00"})
                return id
            end
            local implicit = seed("kickside.core.retention.pin_tests:inherited_retention_decl",90)
            local declared = seed("app:provision_test_decl",90)
            local api = seed("kickside.core.retention.pin_tests:inherited_retention_decl",90)
            local api_db = assert(sql.get("app:migration_db"))
            test.is_nil(select(2,repo.upsert(api_db,api,{event_hot_retention_days=90})))
            api_db:release()
            local same_second = seed("kickside.core.retention.pin_tests:inherited_retention_decl",90,"2026-01-01 00:00:00.500000")
            local descriptor = seed("kickside.core.retention.pin_tests:inherited_retention_binding",90)
            local custom = seed("kickside.core.retention.pin_tests:inherited_retention_decl",7)
            local disabled = seed("kickside.core.retention.pin_tests:inherited_retention_decl",90)
            scratch.exec("UPDATE kickside_retention_policy SET archive_mode='hard_delete',enabled="
                .. (scratch.postgres() and "false" or "0") .. " WHERE thread_id=$1", {disabled})
            local before = scratch.query("SELECT * FROM kickside_retention_policy ORDER BY id")
            for _=1,260 do seed("kickside.core.retention.pin_tests:inherited_retention_decl",90) end
            scratch.migrate("kickside.core.migrations:13_retention_default")
            registry_fixture.reset(257)
            local refused = migration_under_test.migrate({database_id="app:migration_db",
                id="kickside.core.migrations:14_inherited_retention"})
            test.eq(refused.status,"error")
            test.is_true(tostring(refused.error):find("declaration lookup refuses",1,true)~=nil)
            local committed = tonumber(scratch.query([[SELECT COUNT(*) AS n FROM kickside_retention_policy
                WHERE event_hot_retention_days IS NULL]])[1].n)
            test.is_true(committed>0 and committed<263)
            registry_fixture.reset(0)
            local result, err = funcs.call("kickside.core.migrations:14_inherited_retention", {
                database_id="app:migration_db",id="kickside.core.migrations:14_inherited_retention"})
            test.is_nil(err)
            test.eq(result.status,"complete",tostring(result.error or (result.migrations and result.migrations[1].error)))
            test.eq(result.retention.converted+committed,263)
            test.eq(tonumber(scratch.query([[SELECT COUNT(*) AS n FROM kickside_retention_policy
                WHERE event_hot_retention_days IS NULL]])[1].n),263)
            for _, old in ipairs(before) do
                local row = scratch.query("SELECT * FROM kickside_retention_policy WHERE id=$1", {old.id})[1]
                for key,value in pairs(old) do
                    if key == "event_hot_retention_days" and (tostring(old.id)==implicit or tostring(old.id)==disabled or tostring(old.id)==same_second) then
                        test.is_nil(row[key])
                    else test.eq(row[key],value,key) end
                end
            end
            local replay, replay_err = funcs.call("kickside.core.migrations:14_inherited_retention", {
                database_id="app:migration_db",id="kickside.core.migrations:14_inherited_retention"})
            test.is_nil(replay_err)
            test.eq(replay.skipped,1)
            test.eq(replay.retention.converted,0)
            local at = time.now():add(-60*24*time.HOUR):utc()
            local stamp = scratch.postgres() and at:format(time.RFC3339) or at:format("2006-01-02 15:04:05.000000")
            for _,id in ipairs({implicit,declared,api,disabled}) do
                scratch.exec([[INSERT INTO kickside_event(id,thread_id,type,role,body,seq,created_at)
                    VALUES($1,$2,'test','user','{}',1,$3)]], {uuid.v7(),id,stamp})
                scratch.exec("UPDATE kickside_thread SET event_count=1 WHERE id=$1", {id})
            end
            local db = assert(sql.get("app:migration_db"))
            local resolved, resolve_err = repo.find_by_thread(db,implicit)
            test.is_nil(resolve_err)
            test.eq(resolved.event_hot_retention_days,30)
            local deadline, deadline_err = sweeper.next_deadline_ms(db)
            test.is_nil(deadline_err)
            test.is_true(deadline < math.floor(time.now():unix_nano()/1000000))
            local swept, sweep_err = sweeper.run(db)
            db:release()
            test.is_nil(sweep_err)
            test.eq(swept.events,1)
            for _,id in ipairs({declared,api,disabled}) do
                test.eq(#scratch.query("SELECT seq FROM kickside_event WHERE thread_id=$1",{id}),1)
            end
            test.eq(#scratch.query("SELECT seq FROM kickside_event WHERE thread_id=$1",{implicit}),0)
            test.eq(tonumber(scratch.query("SELECT max_pruned_seq FROM kickside_thread WHERE id=$1",{implicit})[1].max_pruned_seq),1)
            scratch.drop()
        end)
    end)
end)
