-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local sql=require("sql")
local funcs=require("funcs")
local time=require("time")
local json=require("json")
local h=require("round_harness")
local ledger=require("round_ledger")
local DB="app:history_upgrade_db"
local MIGRATION="18_ledger_eligibility"

local function migrate(name: string): any
    local result,err=funcs.call("kickside.automation.migrations:" .. name,{database_id=DB,id=name,direction="up"})
    test.is_nil(err,tostring(err))
    test.eq(result.failed,0,tostring(result.error))
    return result
end

return test.run_cases(function()
    test.describe("delivery storage upgrade",function()
        test.it("preserves a large historical store while indexing bounded unresolved state",function()
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
                SELECT 'owner','source',CAST(x AS TEXT),CAST(x AS TEXT),'{}',CASE WHEN x<=1000 THEN 'retrying' ELSE 'dead' END,
                    '2099-01-01T00:00:00Z','2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',
                    '2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',x FROM n]],{1,1000000})
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n),1000000)
            local function main_bytes(table_name: string): string
                return "pg_relation_size('" .. table_name .. "') + COALESCE((SELECT SUM(pg_relation_size(indexrelid)) FROM pg_index WHERE indrelid='" .. table_name .. "'::regclass),0)"
            end
            local function storage(): any
                if postgres then return query("SELECT " .. main_bytes("kickside_automation_delivery_history") .. " AS history_bytes,"
                    .. main_bytes("kickside_trigger_item_ledger") .. " AS ledger_bytes,pg_total_relation_size('kickside_automation_delivery_history') AS history_total_bytes") end
                return {page_count=query("PRAGMA page_count"),freelist_count=query("PRAGMA freelist_count"),page_size=query("PRAGMA page_size")}
            end
            local schema=postgres and "SELECT c.relname,c.relfilenode,pg_relation_size(c.oid) AS main_bytes FROM pg_class c WHERE c.oid='kickside_automation_delivery_history'::regclass OR c.oid IN (SELECT indexrelid FROM pg_index WHERE indrelid='kickside_automation_delivery_history'::regclass) ORDER BY c.relname"
                or "SELECT name,rootpage,sql FROM sqlite_master WHERE tbl_name='kickside_automation_delivery_history' ORDER BY name"
            local schema_before=json.encode(query(schema))
            local before=storage()
            local retained=query("SELECT owner_id,source_port,item_key,identity_key,envelope_json,state,next_attempt_at,delivery_order FROM kickside_trigger_item_ledger ORDER BY owner_id,source_port,item_key,identity_key LIMIT 50")
            local original=json.encode(retained)
            db:release()
            local started=time.now():unix_nano()
            migrate(MIGRATION)
            local ledger_ms=(time.now():unix_nano()-started)/1000000
            db=assert(sql.get(DB))
            local after=storage()
            test.eq(json.encode(query(schema)),schema_before,"the update changes no history table or index storage")
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n),1000000)
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger")[1].n),1000000)
            test.eq(json.encode(query("SELECT owner_id,source_port,item_key,identity_key,envelope_json,state,next_attempt_at,delivery_order FROM kickside_trigger_item_ledger ORDER BY owner_id,source_port,item_key,identity_key LIMIT 50")),original)
            if postgres then test.eq(after[1].history_bytes,before[1].history_bytes) end
            execute("INSERT INTO kickside_automation_receipt (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at) VALUES ('owner','source','mapped','','record','{}','2000-01-01T00:00:00Z')")
            for first=1,999999,100000 do
                execute(numbers .. "INSERT INTO kickside_automation_receipt (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)"
                    .. " SELECT 'owner','source',CAST(x AS TEXT),'','record','{}','2000-01-01T00:00:00Z' FROM n",{first,math.min(first+99999,999999)})
            end
            local receipt_schema=postgres and "SELECT c.relname,c.relfilenode,pg_relation_size(c.oid) AS main_bytes FROM pg_class c WHERE c.oid='kickside_automation_receipt'::regclass OR c.oid IN (SELECT indexrelid FROM pg_index WHERE indrelid='kickside_automation_receipt'::regclass) ORDER BY c.relname"
                or "SELECT name,rootpage FROM sqlite_master WHERE tbl_name='kickside_automation_receipt' ORDER BY name"
            local receipt_schema_before=json.encode(query(receipt_schema))
            local receipt_bytes_before=postgres and query("SELECT " .. main_bytes("kickside_automation_receipt") .. " AS bytes")[1].bytes or query("PRAGMA page_count")[1].page_count
            db:release()
            started=time.now():unix_nano()
            migrate("19_receipt_delivery_identity")
            local receipt_ms=(time.now():unix_nano()-started)/1000000
            db=assert(sql.get(DB))
            local mapped=query("SELECT identity_key,dest_ref_json,delivery_key,declaration_hash FROM kickside_automation_receipt WHERE owner_id='owner' AND item_key='mapped'")[1]
            test.eq(mapped.identity_key,"record");test.eq(mapped.dest_ref_json,"{}")
            test.is_nil(mapped.delivery_key,"existing mappings retain their data with an absent delivery identity")
            test.is_nil(mapped.declaration_hash,"existing mappings retain their data with an absent applied declaration")
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_automation_receipt")[1].n),1000000)
            local receipt_schema_after=json.encode(query(receipt_schema))
            local receipt_bytes_after=postgres and query("SELECT " .. main_bytes("kickside_automation_receipt") .. " AS bytes")[1].bytes or query("PRAGMA page_count")[1].page_count
            test.eq(receipt_schema_after,receipt_schema_before,"nullable ADD COLUMN rewrites no receipt table or index")
            test.eq(receipt_bytes_after,receipt_bytes_before,"nullable ADD COLUMN adds no receipt data pages")
            test.eq(json.encode(query(schema)),schema_before)
            local receipt_params: {any}={"owner","source"}
            local receipt_marks: {string}={}
            for index=1,50 do receipt_params[#receipt_params+1]=tostring(index);receipt_marks[#receipt_marks+1]="$" .. tostring(#receipt_params) end
            execute("ANALYZE kickside_automation_receipt")
            local receipt_lookup="SELECT item_key,map_slot,identity_key,dest_ref_json,dest_version,delivery_key,declaration_hash,pass_id FROM kickside_automation_receipt WHERE owner_id=$1 AND source_port=$2 AND item_key IN (" .. table.concat(receipt_marks,",") .. ") ORDER BY item_key,map_slot"
            local receipt_plan,receipt_plan_err=db:query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,FORMAT JSON) " or "QUERY PLAN ") .. receipt_lookup,receipt_params)
            test.is_nil(receipt_plan_err,tostring(receipt_plan_err))
            test.eq(#assert(db:query(receipt_lookup,receipt_params)),50)
            if postgres then
                local function bounded(node: any): ()
                    if tostring(node["Node Type"]):find("Scan",1,true) then
                        local visited=((tonumber(node["Actual Rows"]) or 0)+(tonumber(node["Rows Removed by Filter"]) or 0))*(tonumber(node["Actual Loops"]) or 1)
                        test.is_true(visited<=50,"receipt reads visit only the requested batch")
                    end
                    for _,child in ipairs(node.Plans or {}) do bounded(child) end
                end
                bounded(json.decode(receipt_plan[1]["QUERY PLAN"])[1].Plan)
            else
                test.contains(json.encode(receipt_plan),"owner_id=? AND source_port=? AND item_key=?")
            end
            local legacy_plans={}
            local tx=assert(db:begin())
            started=time.now():unix_nano()
            local executor={db_type=function() return tx:db_type() end,query=function(_,statement,params)
                    legacy_plans[#legacy_plans+1]={sql=statement,params=params}
                    return tx:query(statement,params)
                end,execute=function(_,statement,params)
                    if #legacy_plans<2 then legacy_plans[#legacy_plans+1]={sql=statement,params=params} end
                    return tx:execute(statement,params)
                end}
            local pruned,prune_err=ledger.prune_orphans_tx(executor,"2026-01-01T00:00:00Z",1000)
            if prune_err then tx:rollback() else local _,commit_err=tx:commit();prune_err=commit_err end
            local legacy_ms=(time.now():unix_nano()-started)/1000000
            test.is_nil(prune_err,tostring(prune_err));test.eq(pruned,1000)
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE state='retrying'")[1].n),1000)
            for _,call in ipairs(legacy_plans) do
                local plan,plan_err=db:query("EXPLAIN " .. (postgres and "" or "QUERY PLAN ") .. call.sql,call.params)
                test.is_nil(plan_err,tostring(plan_err));call.plan=plan
            end
            local schema_after=json.encode(query(schema))
            db:release()
            test.eq(migrate(MIGRATION).skipped,1)
            test.eq(migrate("19_receipt_delivery_identity").skipped,1)
            local evidence=json.encode({engine=postgres and "postgres" or "sqlite",history_rows=1000000,ledger_rows=1000000,ledger_ms=ledger_ms,receipt_ms=receipt_ms,receipt_rows=1000000,receipt_plan=receipt_plan,receipt_schema_before=receipt_schema_before,receipt_schema_after=receipt_schema_after,receipt_bytes_before=receipt_bytes_before,receipt_bytes_after=receipt_bytes_after,legacy_ms=legacy_ms,legacy_rows_pruned=pruned,legacy_plans=legacy_plans,before=before,after=after,schema_before=schema_before,schema_after=schema_after})
            h.ensure_log()
            h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ('storage-upgrade','history','storage_upgrade',0,$1)",{evidence})
        end)
    end)
end)
