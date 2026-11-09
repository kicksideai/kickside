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
local PORT="kickside.automation.round.fixture:records"
local NOW = "2026-01-01T00:00:00Z"
local FUTURE = "2099-01-01T00:00:00Z"

local function seed(id: string, first: integer, last: integer): ()
    local db=h.db()
    local postgres=tostring(db:type()) == sql.type.POSTGRES
    db:release()
    local at=postgres and [[to_char((CASE WHEN n%2=0 THEN TIMESTAMP '2000-01-01' ELSE TIMESTAMP '2020-01-01' END)
        + CAST((n-1)/50 AS INTEGER) * INTERVAL '1 second','YYYY-MM-DD"T"HH24:MI:SS"Z"')]]
        or [[strftime('%Y-%m-%dT%H:%M:%SZ',CASE WHEN n%2=0 THEN '2000-01-01' ELSE '2020-01-01' END,
        '+' || CAST((n-1)/50 AS INTEGER) || ' seconds')]]
    local numbers="WITH RECURSIVE numbers(n) AS (SELECT CAST($1 AS INTEGER) UNION ALL SELECT n+1 FROM numbers WHERE n<$2)"
    h.exec(numbers .. " INSERT INTO kickside_automation_delivery_history"
        .. " (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at)"
        .. " SELECT $3,CASE WHEN n%2=0 THEN 'history' ELSE 'other' END,CAST(n AS TEXT),'kickside.automation.round.fixture:records',CAST(n AS TEXT),CAST(n AS TEXT),"
        .. "'resolved'," .. at .. ",$4 FROM numbers",
        {first,last,id,FUTURE})
    h.exec(numbers .. " INSERT INTO kickside_trigger_item_ledger"
        .. " (owner_id,source_port,item_key,identity_key,envelope_json,state,attempts,first_failed_at,last_failed_at,"
        .. "next_attempt_at,created_at,updated_at,delivery_order)"
        .. " SELECT $3,'kickside.automation.round.fixture:records',CAST(n AS TEXT),CAST(n AS TEXT),'{}',CASE WHEN n%2=0 THEN 'retrying' ELSE 'dead' END,"
        .. "1,$4,$4,$5,$4,$4,n FROM numbers",{first,last,id,NOW,FUTURE})
end

local function define_tests()
    test.describe("AUTOMATION-ROUND-SCALE bounded work across growing tables",function()
        test.it("keeps a fixed round batch bounded with a million items and history rows",function()
            h.ensure_log()
            local env=h.setup("round_scale")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="history",source_kind="collection",
                policy={round={max_unresolved=1000000}},
                action={source_ref=PORT,config={items={}},schedule={type="interval",expression="1h"}}})
            local stable: {Map}={}
            for index=1,50 do stable[#stable+1]={item_key="stable-" .. tostring(index),dedup_key="stable-" .. tostring(index),
                op="upsert",payload={directive="skip"}} end
            local function source(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then return {success=true,items=stable,next_cursor={},has_more=false},nil end
                return env.run_as(identity,target,args,opts)
            end
            local function run_round(): number
                h.set_drive(id,"history","next_run_at=$1",{h.PAST})
                local started=time.now():unix_nano()
                local _,err=env.run(id,"history",source)
                local elapsed=(time.now():unix_nano()-started)/1000000
                test.is_nil(err,tostring(err))
                return elapsed
            end
            run_round()
            local db=h.db()
            local postgres=tostring(db:type()) == sql.type.POSTGRES
            db:release()
            local samples: {Map}={}
            local previous=0
            for _,size in ipairs({10000,100000,1000000}) do
                seed(id,previous+1,size)
                previous=size
                h.set_drive(id,"history","unresolved_count=$1",{size // 2})
                h.exec("ANALYZE kickside_automation_delivery_history")
                h.exec("ANALYZE kickside_trigger_item_ledger")
                local sample: Map={size=size,statements={}}
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
                    for _,call in ipairs(calls) do
                        call.plan=h.query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,FORMAT JSON) " or "QUERY PLAN ") .. call.sql,call.params)
                    end
                    sample.statements[name]=calls
                end
                local admissions: {Map}={}
                for index=1,50 do admissions[#admissions+1]={item_key="lookup-" .. tostring(index),delivery_key="lookup-" .. tostring(index)} end
                measure("admit",function(executor) return ledger.admit(executor,id,PORT,admissions,1) end)
                local due_keys: {string}={}
                for index=1,50 do due_keys[#due_keys+1]="'" .. tostring(index*2) .. "'" end
                local selected=" WHERE owner_id=$2 AND source_port=$3 AND item_key IN (" .. table.concat(due_keys,",") .. ")"
                h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1" .. selected,{NOW,id,PORT})
                measure("due",function(executor)
                    local rows,err=ledger.due_tx(executor,id,PORT,NOW,50)
                    if rows then test.eq(#rows,50) end
                    return rows,err
                end)
                measure("next",function(executor) return ledger.next_attempt(executor,id,PORT,NOW) end)
                h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1" .. selected,{FUTURE,id,PORT})
                measure("idle_due",function(executor)
                    local rows,err=ledger.due_tx(executor,id,PORT,NOW,50)
                    if rows then test.eq(#rows,0) end
                    return rows,err
                end)
                local outcomes: {Map}={}
                local deliveries: {Map}={}
                for index=1,50 do
                    local key="fresh-" .. tostring(index)
                    outcomes[#outcomes+1]={item={item_key=key,dedup_key=key,delivery_key=key},state="resolved"}
                    deliveries[#deliveries+1]={key=key}
                end
                local r={automation_id=id,drive_key="history",source_port=PORT,now=NOW,
                    resolved_expires_at=FUTURE,captured={round_token=uuid.v7()}}
                local trim: Map?=nil
                local started=time.now():unix_nano()
                local _,append_err=automation_db.in_tx(function(tx)
                    local executor={query=function(_,statement,params) return tx:query(statement,params) end,
                        execute=function(_,statement,params)
                            if trim == nil and statement:find("DELETE FROM",1,true) then
                                local sub=statement:match(" IN %((SELECT .*)%)$")
                                trim={sql=sub,params=params}
                            end
                            return tx:execute(statement,params)
                        end}
                    return true,history.record_tx(executor,r,outcomes,deliveries)
                end)
                sample.append_ms=(time.now():unix_nano()-started)/1000000
                test.is_nil(append_err,tostring(append_err))
                if trim then
                    trim.plan=h.query("EXPLAIN " .. (postgres and "(ANALYZE,BUFFERS,FORMAT JSON) " or "QUERY PLAN ") .. trim.sql,trim.params)
                    sample.statements.trim={trim}
                end
                local before_history=h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n
                local before_ledger=h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].n
                local before_classification=h.encoded(h.query("SELECT * FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key LIKE 'stable-%' ORDER BY item_key",{id}))
                sample.round_ms={}
                for iteration=1,3 do sample.round_ms[#sample.round_ms+1]=run_round() end
                test.eq(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n,before_history)
                test.eq(h.query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].n,before_ledger)
                test.eq(h.encoded(h.query("SELECT * FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key LIKE 'stable-%' ORDER BY item_key",{id})),before_classification)
                h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'history','scale_sample',0,$2)",
                    {id,h.encoded(sample)})
                samples[#samples+1]=sample
            end
            -- Retained classification survives eviction of all outcome history.
            local skipped={item={item_key="unchanged",dedup_key="unchanged"},state="resolved",classification="skipped"}
            local _,seed_err=automation_db.in_tx(function(tx)
                local _,err=ledger.record_tx(tx,id,PORT,{skipped},NOW,FUTURE)
                return true,err
            end)
            test.is_nil(seed_err,tostring(seed_err))
            local before=h.encoded(h.query("SELECT * FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='unchanged'",{id}))
            local writes=0
            local r={automation_id=id,drive_key="history",source_port=PORT,now=NOW,
                resolved_expires_at=FUTURE,captured={round_token=uuid.v7()}}
            local _,err=automation_db.in_tx(function(tx)
                local executor={query=function(_,statement,params) return tx:query(statement,params) end,
                    execute=function(_,statement,params)
                        local result,write_err=tx:execute(statement,params)
                        if result and statement:find("INSERT INTO",1,true) then writes=writes+assert(tonumber(result.rows_affected)) end
                        return result,write_err
                    end}
                local _,record_err,_,prior=ledger.record_tx(tx,id,PORT,{skipped},NOW,FUTURE)
                if record_err then return nil,record_err end
                return true,history.record_tx(executor,r,{skipped},{},prior)
            end)
            test.is_nil(err,tostring(err))
            test.eq(h.encoded(h.query("SELECT * FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='unchanged'",{id})),before)
            h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'history','scale_result',0,$2)",
                {id,h.encoded({engine=postgres and "postgres" or "sqlite",rows=1000000,unchanged_writes=writes})})
            local violations: {string}={}
            if writes ~= 0 then violations[#violations+1]="unchanged outcomes outside the recent history window append" end
            local largest=samples[#samples]
            if postgres then
                local function scan(node: Map): ()
                    if tostring(node["Node Type"]):find("Scan",1,true) then
                        local visited=((tonumber(node["Actual Rows"]) or 0)+(tonumber(node["Rows Removed by Filter"]) or 0))
                            *(tonumber(node["Actual Loops"]) or 1)
                        if visited > 50 then violations[#violations+1]="ledger scan visits " .. tostring(visited) .. " rows for a 50-item batch" end
                    end
                    for _,child in ipairs(node.Plans or {}) do scan(child) end
                end
                for _,name in ipairs({"admit","due","next","idle_due"}) do
                    for _,call in ipairs(largest.statements[name]) do
                        local plan=json.decode(call.plan[1]["QUERY PLAN"])
                        scan(plan[1].Plan)
                    end
                end
                local function buffers(sample: Map): number
                    local plan=json.decode(sample.statements.trim[1].plan[1]["QUERY PLAN"])
                    return plan[1].Plan["Shared Hit Blocks"]+plan[1].Plan["Shared Read Blocks"]
                end
                if buffers(largest) > buffers(samples[2])*4 then
                    violations[#violations+1]="history trim buffer visits grow with unrelated drive history"
                end
            else
                for _,row in ipairs(largest.statements.next[1].plan) do
                    if tostring(row.detail):find("SCAN l",1,true) then violations[#violations+1]="next-attempt query scans the ledger" end
                end
                local bounded=false
                for _,row in ipairs(largest.statements.trim[1].plan) do
                    if tostring(row.detail):find("automation_id=? AND drive_key=?",1,true) then bounded=true end
                    if tostring(row.detail):find("TEMP B-TREE FOR ORDER BY",1,true) then
                        violations[#violations+1]="history trim sorts retained drive history"
                    end
                end
                if not bounded then violations[#violations+1]="history trim has no drive-bounded index range" end
            end
            test.eq(#violations,0,table.concat(violations,"; "))
        end)
    end)
end

local run_cases=test.run_cases(define_tests)
return {run=function(options: any): any return run_cases(options) end}
