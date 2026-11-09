local test=require("test")
local sql=require("sql")
local funcs=require("funcs")
local time=require("time")
local json=require("json")
local h=require("round_harness")
local DB="app:history_upgrade_db"
local MIGRATION="17_bounded_delivery_storage"

local function migrate(name: string): any
    local result,err=funcs.call("kickside.automation.migrations:" .. name,{database_id=DB,id=name,direction="up"})
    test.is_nil(err,tostring(err))
    test.eq(result.failed,0,tostring(result.error))
    return result
end

return test.run_cases(function()
    test.describe("delivery storage upgrade",function()
        test.it("drops a large historical store before creating indexes and retains a million ledger identities",function()
            for _,name in ipairs({"06_trigger_item_ledger","10_drive_schema","11_delivery_provenance","12_delivery_history"}) do migrate(name) end
            local db,open_err=sql.get(DB)
            test.is_nil(open_err)
            local postgres=tostring(db:type()) == sql.type.POSTGRES
            local function execute(statement: string,params: {any}?): any
                local result,err=db:execute(statement,params or {})
                test.is_nil(err,tostring(err))
                return result
            end
            local function query(statement: string): any
                local result,err=db:query(statement)
                test.is_nil(err,tostring(err))
                return result
            end
            local numbers="WITH RECURSIVE n(x) AS (SELECT CAST($1 AS INTEGER) UNION ALL SELECT x+1 FROM n WHERE x<$2) "
            for first=1,1000000,100000 do
                execute(numbers .. "INSERT INTO kickside_automation_delivery_history"
                    .. " (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,execution_identity_json,round_at,expires_at)"
                    .. " SELECT 'owner','drive',CAST(x AS TEXT),'source',CAST(x AS TEXT),CAST(x AS TEXT),'resolved',$3"
                    .. ",'2000-01-01T00:00:00Z','2099-01-01T00:00:00Z' FROM n",{first,first+99999,string.rep("h",256)})
            end
            execute(numbers .. [[INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,identity_key,envelope_json,state,next_attempt_at,first_failed_at,last_failed_at,created_at,updated_at,delivery_order)
                SELECT 'owner','source',CAST(x AS TEXT),CAST(x AS TEXT),'{}',CASE WHEN x%2=0 THEN 'retrying' ELSE 'dead' END,
                    '2099-01-01T00:00:00Z','2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',
                    '2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',x FROM n]],{1,1000000})
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n),1000000)
            local function storage(): any
                if postgres then return query("SELECT pg_total_relation_size('kickside_automation_delivery_history') AS history_bytes,pg_total_relation_size('kickside_trigger_item_ledger') AS ledger_bytes") end
                return {page_count=query("PRAGMA page_count"),freelist_count=query("PRAGMA freelist_count"),page_size=query("PRAGMA page_size")}
            end
            local before=storage()
            local retained=query("SELECT owner_id,source_port,item_key,identity_key,envelope_json,state,next_attempt_at,delivery_order FROM kickside_trigger_item_ledger ORDER BY owner_id,source_port,item_key,identity_key LIMIT 50")
            local original=json.encode(retained)
            db:release()
            local started=time.now():unix_nano()
            migrate(MIGRATION)
            local history_ms=(time.now():unix_nano()-started)/1000000
            db=assert(sql.get(DB))
            local after_history=storage()
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n),0)
            db:release()
            started=time.now():unix_nano()
            migrate("18_ledger_eligibility")
            local ledger_ms=(time.now():unix_nano()-started)/1000000
            db=assert(sql.get(DB))
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n),0)
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger")[1].n),1000000)
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE eligible_at IS NOT NULL")[1].n),500000)
            local after=storage()
            test.eq(json.encode(query("SELECT owner_id,source_port,item_key,identity_key,envelope_json,state,next_attempt_at,delivery_order FROM kickside_trigger_item_ledger ORDER BY owner_id,source_port,item_key,identity_key LIMIT 50")),original)
            if postgres then
                test.is_true(tonumber(after_history[1].history_bytes)<1048576,"the empty replacement retains no old relation storage")
                test.is_true(tonumber(before[1].history_bytes)>=100000000,"the fixture exercises a populated physical relation")
            else
                local freed=(assert(tonumber(after_history.freelist_count[1].freelist_count))-assert(tonumber(before.freelist_count[1].freelist_count)))
                    *assert(tonumber(before.page_size[1].page_size))
                test.is_true(freed>=100000000,"drop reclaims populated history pages without vacuum or copying")
            end
            execute("INSERT INTO kickside_automation_delivery_history (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at) VALUES ('owner','drive','new','source','new','new','resolved','2026-01-01T00:00:00Z','2099-01-01T00:00:00Z')")
            db:release()
            local repeated=migrate(MIGRATION)
            test.eq(repeated.skipped,1,"an applied upgrade never clears new history")
            test.eq(migrate("18_ledger_eligibility").skipped,1)
            db=assert(sql.get(DB))
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n),1)
            local evidence=json.encode({engine=postgres and "postgres" or "sqlite",history_rows=1000000,ledger_rows=1000000,history_ms=history_ms,ledger_ms=ledger_ms,before=before,after_history=after_history,after=after})
            db:release()
            h.ensure_log()
            h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ('storage-upgrade','history','storage_upgrade',0,$1)",{evidence})
        end)
    end)
end)
