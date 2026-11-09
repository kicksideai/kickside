-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local h = require("round_harness")
local history = require("round_history")
local ledger = require("round_ledger")
local automation_db = require("automation_db")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local json = require("json")

type Map = { [string]: any }
local PORT = "kickside.automation.round.fixture:records"
local NOW = "2026-01-01T00:00:00Z"
local FUTURE = "2099-01-01T00:00:00Z"
local UNRESOLVED = 1000
local TOTAL = 1000000
local DRIVES = 100

local function seed(owner: string, ledger_owner: string, first: integer, last: integer): ()
    local numbers = "WITH RECURSIVE n(x) AS (SELECT CAST($1 AS INTEGER) UNION ALL SELECT x+1 FROM n WHERE x<$2) "
    h.exec(numbers .. "INSERT INTO kickside_automation_delivery_history"
        .. " (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at)"
        .. " SELECT $3,'history-' || CAST(x%" .. tostring(DRIVES) .. " AS TEXT),CAST(x AS TEXT),$4,CAST(x AS TEXT),CAST(x AS TEXT),"
        .. " 'resolved','2000-01-01T00:00:00Z',$5 FROM n", { first, last, owner, PORT, FUTURE })
    h.exec(numbers .. "INSERT INTO kickside_trigger_item_ledger"
        .. " (owner_id,source_port,item_key,identity_key,envelope_json,state,attempts,first_failed_at,last_failed_at,"
        .. " next_attempt_at,created_at,updated_at,expires_at,delivery_order)"
        .. " SELECT $3,$4,CAST(x AS TEXT),CAST(x AS TEXT),'{}',CASE WHEN x<=$5 THEN 'retrying' ELSE 'dead' END,"
        .. " 1,'2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',CASE WHEN x<=$5 THEN $6 ELSE NULL END,"
        .. " '2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',$7,x FROM n",
        { first, last, ledger_owner, PORT, UNRESOLVED, FUTURE, FUTURE })
end

local function explain(postgres: boolean, statement: string, params: {any}): any
    return h.query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,WAL,FORMAT JSON) " or "QUERY PLAN ") .. statement, params)
end

local function runs(rows: {Map}, needle: string): boolean
    for _,row in ipairs(rows) do if tostring(row.detail):find(needle,1,true) then return true end end
    return false
end

local function postgres_rows(plan: any): number
    local largest = 0
    local function visit(node: Map): ()
        if tostring(node["Node Type"]):find("Scan",1,true) then
            local rows = (tonumber(node["Actual Rows"]) or 0) + (tonumber(node["Rows Removed by Filter"]) or 0)
            largest = math.max(largest, rows * (tonumber(node["Actual Loops"]) or 1))
        end
        for _,child in ipairs(node.Plans or {}) do visit(child) end
    end
    visit(json.decode(plan[1]["QUERY PLAN"])[1].Plan)
    return largest
end

local function define_tests()
    test.describe("AUTOMATION-ROUND-SCALE bounded work across growing tables",function()
        test.it("uses bounded indexed history and unresolved-ledger work at one million rows",function()
            h.ensure_log()
            local env=h.setup("round_scale","kickside.automation.round.fixture:snapshot_sync_kind")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="history",source_kind="collection",applied_hash="scale-declaration",
                applied={title="Snapshot sync",trigger={v=2,source=PORT},sink_port="kickside.automation.round.fixture:store",sink_config={},transform={kind="none"},enabled=true},
                action={source_ref=PORT,config={items={}},schedule={type="interval",expression="1h"}}})
            local ledger_env=h.setup("scale_pending")
            local ledger_owner=ledger_env.automation_id
            h.new_drive({automation_id=ledger_owner,drive_key="pending",source_kind="collection",unresolved_count=UNRESOLVED,
                action={source_ref=PORT,config={items={}},schedule={type="interval",expression="1h"}}})
            local stable: {Map}={}
            for index=1,50 do
                local key="stable-" .. tostring(index)
                stable[#stable+1]={item_key=key,dedup_key=key,delivery_key=key,op="upsert",payload={value=index}}
            end
            local function source(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then return {success=true,items=stable,next_cursor={},has_more=false},nil end
                return env.run_as(identity,target,args,opts)
            end
            local function round(): number
                h.set_drive(id,"history","next_run_at=$1",{h.PAST})
                local started=time.now():unix_nano()
                local _,err=env.run(id,"history",source)
                test.is_nil(err,tostring(err))
                return (time.now():unix_nano()-started)/1000000
            end
            local before_history=tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n)
            local before_ledger=tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].n)
            round()
            test.eq(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n),(before_history :: number)+50)
            test.eq(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].n),before_ledger)

            local db=h.db()
            local postgres=tostring(db:type()) == sql.type.POSTGRES
            db:release()
            local samples: {Map}={}
            local previous=0
            for _,size in ipairs({10000,100000,TOTAL}) do
                seed(id,ledger_owner,previous+1,size)
                previous=size
                h.exec("ANALYZE kickside_automation_delivery_history")
                h.exec("ANALYZE kickside_trigger_item_ledger")
                local sample: Map={size=size,plans={}}
                local function measure(name: string, operation: (any) -> (any?,any)): ()
                    local opened=h.db()
                    local calls: {Map}={}
                    local executor={db_type=function() return opened:type(),nil end,
                        query=function(_,statement,params)
                            calls[#calls+1]={sql=statement,params=params}
                            return opened:query(statement,params)
                        end}
                    local started=time.now():unix_nano()
                    local _,err=operation(executor)
                    sample[name .. "_ms"]=(time.now():unix_nano()-started)/1000000
                    opened:release()
                    test.is_nil(err,tostring(err))
                    for _,call in ipairs(calls) do call.plan=explain(postgres,call.sql,call.params) end
                    sample.plans[name]=calls
                end
                measure("history_deadline",function(executor) return history.oldest(executor) end)
                measure("ledger_retention_deadline",function(executor) return ledger.retention_deadlines(executor,100) end)
                measure("ledger_retention",function(executor) return ledger.prune_tx(executor,NOW,100) end)
                measure("ledger_legacy_retention",function(executor) return ledger.prune_orphans_tx(executor,NOW,100) end)
                local requested: {Map}={}
                for index=1,50 do
                    local key=tostring(index)
                    requested[#requested+1]={item_key=key,delivery_key=key,dedup_key=key}
                end
                measure("admit",function(executor) return ledger.admit(executor,ledger_owner,PORT,requested,1) end)
                measure("provenance",function(executor): (any?,any)
                    local params: {any}={ledger_owner,PORT}
                    local marks: {string}={}
                    for index=1,50 do params[#params+1]=tostring(index);marks[#marks+1]="$" .. tostring(#params) end
                    return executor:query("SELECT item_key,identity_key,execution_identity_json,created_at FROM kickside_trigger_item_ledger"
                        .. " WHERE owner_id=$1 AND source_port=$2 AND identity_key IN (" .. table.concat(marks,",") .. ")",params)
                end)
                h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND source_port=$3 AND state='retrying' AND item_key IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50')",{NOW,ledger_owner,PORT})
                measure("due",function(executor)
                    local rows,err=ledger.due_tx(executor,ledger_owner,PORT,NOW,50)
                    if rows then test.eq(#rows,50) end
                    return rows,err
                end)
                measure("next",function(executor) return ledger.next_attempt(executor,ledger_owner,PORT,NOW) end)
                h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND source_port=$3 AND state='retrying'",{FUTURE,ledger_owner,PORT})
                measure("idle_due",function(executor)
                    local rows,err=ledger.due_tx(executor,ledger_owner,PORT,NOW,50)
                    if rows then test.eq(#rows,0) end
                    return rows,err
                end)
                local outcomes: {Map}={}
                local deliveries: {Map}={}
                for index=1,50 do
                    local key="delivery-" .. tostring(index)
                    outcomes[#outcomes+1]={item={item_key=key,dedup_key=key,delivery_key=key},state="resolved"}
                    deliveries[#deliveries+1]={key=key}
                end
                local r={automation_id=id,drive_key="history-0",source_port=PORT,now=NOW,
                    resolved_expires_at=FUTURE,captured={round_token=uuid.v7()}}
                local started=time.now():unix_nano()
                local _,record_err=automation_db.in_tx(function(tx) return true,history.record_tx(tx,r,outcomes,deliveries) end)
                sample.append_ms=(time.now():unix_nano()-started)/1000000
                test.is_nil(record_err,tostring(record_err))
                measure("history_replay",function(executor)
                    return history.evidence(executor,id,{drive_key=r.drive_key,round_token=r.captured.round_token,source_port=PORT,
                        item_key="delivery-1",identity_key="delivery-1",round_at=NOW},"2000-01-01T00:00:00Z")
                end)
                local prune_statements={}
                started=time.now():unix_nano()
                local count,prune_err=automation_db.in_tx(function(tx)
                    local executor={query=function(_,statement,params)
                        prune_statements[#prune_statements+1]={sql=statement,params=params}
                        return tx:query(statement,params)
                    end,execute=function(_,statement,params)
                        prune_statements[#prune_statements+1]={sql=statement,params=params}
                        return tx:execute(statement,params)
                    end}
                    return history.prune_tx(executor,NOW,50)
                end)
                sample.prune_ms=(time.now():unix_nano()-started)/1000000
                test.is_nil(prune_err,tostring(prune_err));test.eq(count,50)
                -- EXPLAIN DELETE runs inside a rollback so plan evidence removes no data.
                for _,call in ipairs(prune_statements) do
                    local _,plan_err=automation_db.in_tx(function(tx)
                        local plan,err=tx:query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,WAL,FORMAT JSON) " or "QUERY PLAN ") .. call.sql,call.params)
                        call.plan=plan
                        if err then return nil,err end
                        return nil,errors.new({kind=errors.CONFLICT,message="plan rollback"})
                    end)
                    test.not_nil(call.plan,tostring(plan_err))
                end
                sample.plans.prune=prune_statements
                local list_sql="SELECT round_at,drive_key,round_token,source_port,item_key,identity_key FROM kickside_automation_delivery_history"
                    .. " WHERE automation_id=$1 AND round_at>$2 ORDER BY round_at DESC,drive_key DESC,round_token DESC,source_port DESC,item_key DESC,identity_key DESC LIMIT $3"
                measure("list",function(executor): (any?,any)
                    return executor:query(list_sql,{id,"2000-01-01T00:00:00Z",51})
                end)
                sample.round_ms={round(),round(),round()}
                samples[#samples+1]=sample
            end
            test.eq(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND state IN ('retrying','waiting','uncertain','parked')",{ledger_owner})[1].n),UNRESOLVED)
            local before_history_rows=tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n)
            local before_ledger_rows=tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1",{ledger_owner})[1].n)
            local idle={}
            for _=1,3 do idle[#idle+1]=round() end
            test.eq(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n),before_history_rows)
            test.eq(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1",{ledger_owner})[1].n),before_ledger_rows)
            local drain={}
            for _,batch in ipairs({100,100,100,100,100,1000,1000,1000,1000,1000}) do
                if not postgres then h.query("PRAGMA wal_checkpoint(TRUNCATE)") end
                local started=time.now():unix_nano()
                local statements: {Map}={}
                local count,err=automation_db.in_tx(function(tx)
                    local executor={query=function(_,statement,params) return tx:query(statement,params) end,
                        execute=function(_,statement,params)
                            statements[#statements+1]={sql=statement,params=params}
                            return tx:execute(statement,params)
                        end}
                    return history.prune_tx(executor,NOW,batch)
                end)
                test.is_nil(err,tostring(err));test.eq(count,batch)
                local elapsed=(time.now():unix_nano()-started)/1000000
                for _,call in ipairs(statements) do
                    local _,plan_err=automation_db.in_tx(function(tx)
                        local plan,read_err=tx:query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,WAL,FORMAT JSON) " or "QUERY PLAN ") .. call.sql,call.params)
                        call.plan=plan
                        if read_err then return nil,read_err end
                        return nil,errors.new({kind=errors.CONFLICT,message="plan rollback"})
                    end)
                    test.not_nil(call.plan,tostring(plan_err))
                end
                local wal: Map?=nil
                if not postgres then
                    local checkpoint=h.query("PRAGMA wal_checkpoint(PASSIVE)")[1]
                    local frames=assert(tonumber(checkpoint.log))
                    test.is_true(frames>0,"the measured delete emits WAL frames")
                    local page_size=assert(tonumber(h.query("PRAGMA page_size")[1].page_size))
                    wal={frames=frames,bytes=32+frames*(page_size+24)}
                end
                local round_ms=round()
                drain[#drain+1]={rows=count,ms=elapsed,round_ms=round_ms,statements=statements,wal=wal}
            end
            h.exec("UPDATE kickside_trigger_item_ledger SET state='dead',next_attempt_at=NULL WHERE owner_id=$1 AND state='retrying'",{ledger_owner})
            -- Keep the million-row fixture within its budget: 100,000 dead items
            -- retain output; all other tombstones remain outside the cutoff.
            h.exec([[INSERT INTO kickside_automation_prepared
                (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                SELECT owner_id,identity_key,'hash','{}',updated_at FROM kickside_trigger_item_ledger
                WHERE owner_id=$1 AND state='dead' AND delivery_order>$2 AND delivery_order<=$3]],
                {ledger_owner,UNRESOLVED,UNRESOLVED+100000})
            h.exec([[UPDATE kickside_trigger_item_ledger SET expires_at=$1
                WHERE owner_id=$2 AND state='dead' AND delivery_order>$3 AND delivery_order<=$4]],
                {NOW,ledger_owner,UNRESOLVED,UNRESOLVED+90000})
            h.exec([[UPDATE kickside_trigger_item_ledger SET expires_at=NULL
                WHERE owner_id=$1 AND state='dead' AND delivery_order>$2 AND delivery_order<=$3]],
                {ledger_owner,UNRESOLVED+90000,UNRESOLVED+100000})
            h.exec("ANALYZE kickside_trigger_item_ledger")
            h.exec("ANALYZE kickside_automation_prepared")
            -- Pending controls do not hold expired dead work or hide its deadline.
            h.exec([[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,pending_input_json,pending_drives_json,pending_step)
                VALUES ($1,1,'pending-replay','digest','control','{}','[]','control')
                ON CONFLICT(automation_id) DO UPDATE SET pending_request_id=excluded.pending_request_id,
                    pending_digest=excluded.pending_digest,pending_kind=excluded.pending_kind,
                    pending_input_json=excluded.pending_input_json,pending_drives_json=excluded.pending_drives_json,pending_step=excluded.pending_step]],{ledger_owner})
            local dead_drain={}
            local candidate_plans={}
            local prepared_plans={}
            local deadline_plans={}
            local opened=h.db()
            local _,deadline_err=ledger.retention_deadlines({query=function(_,statement,params)
                deadline_plans[#deadline_plans+1]={sql=statement,params=params,plan=explain(postgres,statement,params)}
                return opened:query(statement,params)
            end},100)
            opened:release()
            test.is_nil(deadline_err,tostring(deadline_err))
            for pass=1,100 do
                local legacy=pass>90
                local size=1000
                local started=time.now():unix_nano()
                local count,err=automation_db.in_tx(function(tx)
                    local executor={db_type=function() return tx:db_type() end,query=function(_,statement,params)
                        if statement:find("SELECT owner_id,source_port,item_key,identity_key",1,true) and (pass==1 or pass==91) then
                            local plan,plan_err=tx:query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,WAL,FORMAT JSON) " or "QUERY PLAN ") .. statement,params)
                            if plan_err then return nil,plan_err end
                            candidate_plans[#candidate_plans+1]={sql=statement,params=params,plan=plan}
                        end
                        return tx:query(statement,params)
                    end,execute=function(_,statement,params)
                        if #prepared_plans==0 and statement:find("DELETE FROM kickside_automation_prepared",1,true) then
                            local _,save_err=tx:execute("SAVEPOINT prepared_plan")
                            if save_err then return nil,save_err end
                            local plan,plan_err=tx:query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,WAL,FORMAT JSON) " or "QUERY PLAN ") .. statement,params)
                            if plan_err then return nil,plan_err end
                            local _,rollback_err=tx:execute("ROLLBACK TO SAVEPOINT prepared_plan")
                            if rollback_err then return nil,rollback_err end
                            local _,release_err=tx:execute("RELEASE SAVEPOINT prepared_plan")
                            if release_err then return nil,release_err end
                            prepared_plans[#prepared_plans+1]={sql=statement,params=params,plan=plan}
                        end
                        return tx:execute(statement,params)
                    end}
                    if legacy then return ledger.prune_orphans_tx(executor,NOW,size) end
                    return ledger.prune_tx(executor,NOW,size)
                end)
                local ms=(time.now():unix_nano()-started)/1000000
                test.is_nil(err,tostring(err));test.eq(count,size,"each batch reaches expired prepared items")
                local round_ms=nil
                if pass%10==0 then round_ms=round() end
                dead_drain[#dead_drain+1]={pass=pass,legacy=legacy,rows=count,ms=ms,round_ms=round_ms}
            end
            test.eq(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_prepared WHERE automation_id=$1",{ledger_owner})[1].n),0)
            for _,call in ipairs(candidate_plans) do
                if postgres then test.is_true(postgres_rows(call.plan)<=1000,"prune examines only its indexed expired page")
                else
                    local encoded=h.encoded(call.plan)
                    test.is_true(encoded:find("idx_trigger_ledger_gc",1,true)~=nil or encoded:find("idx_trigger_ledger_legacy_retention",1,true)~=nil)
                    test.is_false(encoded:find("TEMP B-TREE",1,true)~=nil,"no unexpired population is sorted")
                end
            end
            test.eq(#prepared_plans,1)
            local prepared_index=postgres and "kickside_automation_prepared_pkey" or "sqlite_autoindex_kickside_automation_prepared_1"
            test.is_true(h.encoded(prepared_plans[1].plan):find(prepared_index,1,true)~=nil,
                "prepared cleanup uses bounded primary-key probes")
            if postgres then
                test.is_true(postgres_rows(prepared_plans[1].plan)<=100,"prepared reference checks examine only their candidate keys")
            else
                local plan=h.encoded(prepared_plans[1].plan)
                test.is_true(plan:find("idx_trigger_ledger_identity",1,true)~=nil,"identity references use the existing identity index")
                test.is_true(plan:find("owner_id=? AND source_port=? AND item_key=?",1,true)~=nil,
                    "replay aliases use the same item primary-key range")
            end
            local dead_proof={prepared_items=100000,total_ledger_items=TOTAL,remaining_prepared=0,pending_command=true,
                candidate_plans=candidate_plans,prepared_plans=prepared_plans,deadline_plans=deadline_plans,batches=dead_drain}
            local violations: {string}={}
            local last=samples[#samples]
            if postgres then
                for _,name in ipairs({"admit","due","next","idle_due","history_deadline","provenance","ledger_retention_deadline","ledger_retention","ledger_legacy_retention","history_replay","list"}) do
                    for _,call in ipairs(last.plans[name]) do
                        if postgres_rows(call.plan)>UNRESOLVED then violations[#violations+1]=name .. " visits more than max_unresolved rows" end
                    end
                end
                for _,call in ipairs(last.plans.prune) do
                    if postgres_rows(call.plan)>1000 then violations[#violations+1]="history prune examines more than its page bound" end
                end
            else
                for _,name in ipairs({"due","next","idle_due"}) do
                    local encoded=h.encoded(last.plans[name])
                    if encoded:find("SCAN",1,true) then violations[#violations+1]=name .. " scans the ledger" end
                end
                local last_prune=last.plans.prune[#last.plans.prune].plan
                if not runs(last_prune,"automation_id=? AND round_at<?") then violations[#violations+1]="history prune misses its age range" end
                if runs(last_prune,"TEMP B-TREE FOR ORDER BY") then violations[#violations+1]="history prune sorts the retained window" end
                if not runs(last.plans.list[1].plan,"automation_id=?") then violations[#violations+1]="history list misses its page index" end
            end
            h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'history-0','scale',0,$2)",
                {id,h.encoded({engine=postgres and "postgres" or "sqlite",history_rows=TOTAL,ledger_rows=TOTAL,
                    unresolved_rows=UNRESOLVED,dead_retention=dead_proof,samples=samples,idle_round_ms=idle,unchanged_writes=0,drain=drain})})
            test.eq(#violations,0,table.concat(violations,"; "))
            h.exec("DELETE FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})
            h.exec("DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1",{ledger_owner})
            h.exec("DELETE FROM kickside_automation_command WHERE automation_id=$1",{ledger_owner})
        end)
    end)
end

local run_cases=test.run_cases(define_tests)
return {run=function(options: any): any return run_cases(options) end}
