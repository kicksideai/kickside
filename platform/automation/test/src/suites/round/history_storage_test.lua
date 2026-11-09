local test = require("test")
local h = require("round_harness")
local history = require("round_history")
local errors = require("errors")
local json = require("json")
local uuid = require("uuid")
local commit = require("round_commit")
local automation_db = require("automation_db")
local sql = require("sql")
local registry = require("registry")
local time = require("time")
local runner = require("migration_runner")

type Map = { [string]: any }
local NOW = "2026-10-11T00:00:00Z"
local EXPIRY = "2026-11-11T00:00:00Z"

local owners: Map={}
local function cleanup(): ()
    for id in pairs(owners) do
        h.exec("DELETE FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})
    end
    owners={}
end

local function round(id: string): Map
    owners[id]=true
    return {automation_id=id,drive_key="history",source_port="source",now=NOW,
        resolved_expires_at=EXPIRY,captured={round_token=uuid.v7()}}
end

local function item(key: string, evidence: string?): Map
    return {item={item_key=key,delivery_key=key},state="resolved",execution_identity_json=evidence}
end


-- These storage tests append explicit delivered outcomes unless they supply
-- their own delivery classification.
local function record(tx: any,r: Map,outcomes: {Map},delivered: {Map}?,prior: Map?): error?
    if delivered == nil then
        delivered={}
        for _,outcome in ipairs(outcomes) do
            if outcome.state == "resolved" then delivered[#delivered+1]={key=outcome.item.delivery_key} end
        end
    end
    return history.record_tx(tx,r,outcomes,delivered,prior)
end

local function rows(id: string): {Map}
    return h.query("SELECT * FROM kickside_automation_delivery_history WHERE automation_id=$1 ORDER BY drive_key,round_token,source_port,item_key,identity_key",{id})
end

local function seed(id: string, count: integer, expiry: string, split_drive: boolean?): ()
    owners[id]=true
    local db=h.db()
    local postgres=tostring(db:type()) == sql.type.POSTGRES
    db:release()
    local at=postgres and [[to_char(TIMESTAMP '1800-01-01' + CAST((n-1)/50 AS INTEGER) * INTERVAL '1 second','YYYY-MM-DD"T"HH24:MI:SS"Z"')]]
        or [[strftime('%Y-%m-%dT%H:%M:%SZ','1800-01-01','+' || CAST((n-1)/50 AS INTEGER) || ' seconds')]]
    local drive=split_drive and "CASE WHEN n%2=0 THEN 'history' ELSE 'other' END" or "'history'"
    h.exec("WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<$1)"
        .. " INSERT INTO kickside_automation_delivery_history (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at)"
        .. " SELECT $2," .. drive .. ",'seed-' || CAST(CAST((n-1)/50 AS INTEGER) AS TEXT),'source',CAST(n AS TEXT),CAST(n AS TEXT),'resolved',"
        .. at .. ",$3 FROM numbers",{count,id,expiry})
end

local function define_tests()
    test.describe("AUTOMATION-DELIVERY-HISTORY atomic append and retention",function()
        test.before_each(function() h.ensure_log() end)
        test.after_each(cleanup)

        test.it("uses known ledger states without reading retained history",function()
            local id=uuid.v7()
            local queries=0
            local retry=item("attempt")
            retry.state="retrying"
            local _,err=automation_db.in_tx(function(tx)
                local executor={execute=function(_,statement,params) return tx:execute(statement,params) end,
                    query=function() queries=queries+1;return nil,errors.new({kind=errors.INTERNAL,message="known ledger states must not read history"}) end}
                return true,record(executor,round(id),{item("unchanged"),item("transition"),retry,item("delivery")},
                    {{key="delivery"}},{["unchanged\nunchanged"]={state="resolved"},["transition\ntransition"]={state="retrying"},
                        ["attempt\nattempt"]={state="retrying"},["delivery\ndelivery"]={state="resolved"}})
            end)
            test.is_nil(err,tostring(err))
            test.eq(queries,0)
            local states: Map={}
            for _,row in ipairs(rows(id)) do states[row.item_key]=row.state end
            test.eq(#rows(id),2)
            test.is_nil(states.unchanged)
            test.eq(states.transition,"resolved")
            test.is_nil(states.attempt,"an intermediate retry remains mutable")
            test.eq(states.delivery,"resolved")
        end)

        test.it("stores absent, unresolved and inferred evidence exactly without a current identity read",function()
            local id=uuid.v7()
            local unresolved=json.encode({unresolved=true,generation=9})
            local inferred=json.encode({inferred={reason="original_generation"},identity={principal={id="older"}}})
            local _,err=automation_db.in_tx(function(tx)
                return true,record(tx,round(id),{item("absent"),item("unresolved",unresolved),item("inferred",inferred)})
            end)
            test.is_nil(err,tostring(err))
            local found: Map={}
            for _,row in ipairs(rows(id)) do found[row.item_key]=row end
            test.eq(#rows(id),3)
            test.is_nil(found.absent.execution_identity_json)
            test.eq(found.unresolved.execution_identity_json,unresolved)
            test.eq(found.inferred.execution_identity_json,inferred)
        end)

        test.it("writes more than one bounded batch with distinct complete delivery keys",function()
            local id=uuid.v7()
            local outcomes: {Map}={}
            for index=1,205 do outcomes[#outcomes+1]=item(tostring(index),"{}") end
            local r=round(id)
            local _,err=automation_db.in_tx(function(tx) return true,record(tx,r,outcomes) end)
            test.is_nil(err,tostring(err))
            test.eq(#rows(id),205)
            r.drive_key="another-drive"
            local _,next_err=automation_db.in_tx(function(tx) return true,record(tx,r,{item("1","{}")}) end)
            test.is_nil(next_err,tostring(next_err))
            test.eq(#rows(id),206)
        end)

        test.it("rolls back all batches on a conflicting append and leaves original bytes immutable",function()
            local id=uuid.v7()
            local r=round(id)
            local _,err=automation_db.in_tx(function(tx) return true,record(tx,r,{item("z","{\"generation\":1}")}) end)
            test.is_nil(err,tostring(err))
            local original=h.encoded(rows(id))
            local outcomes: {Map}={}
            for index=1,105 do outcomes[#outcomes+1]=item("a" .. tostring(index),"{}") end
            outcomes[#outcomes+1]=item("z","{\"generation\":2}")
            local _,conflict=automation_db.in_tx(function(tx) return true,record(tx,r,outcomes) end)
            test.not_nil(conflict)
            test.eq(h.encoded(rows(id)),original)
        end)

        test.it("propagates storage errors and refuses an oversized row before writes",function()
            local outage=errors.new({kind=errors.UNAVAILABLE,message="history unavailable"})
            local _,err=automation_db.in_tx(function(tx)
                return true,record({query=function(_,statement,params) return tx:query(statement,params) end,execute=function() return nil,outage end},round(uuid.v7()),{item("one","{}")})
            end)
            test.not_nil(err)
            test.is_true(tostring(err):find("history unavailable",1,true) ~= nil)
            local id=uuid.v7()
            local _,bound_err=automation_db.in_tx(function(tx)
                return true,record(tx,round(id),{item("large",string.rep("x",20*1024*1024))})
            end)
            test.not_nil(bound_err)
            test.eq(#rows(id),0)
        end)

        test.it("prunes at expiry in bounded pages without touching live or unrelated work",function()
            local id=uuid.v7()
            local r=round(id)
            local cutoff="1900-01-01T00:00:00Z"
            r.now="1800-01-01T00:00:00Z"
            r.resolved_expires_at=cutoff
            local _,err=automation_db.in_tx(function(tx) return true,record(tx,r,{item("a"),item("b"),item("c")}) end)
            test.is_nil(err,tostring(err))
            h.exec("UPDATE kickside_automation_delivery_history SET round_at=$1 WHERE automation_id=$2 AND item_key='c'",{"2099-01-01T00:00:00Z",id})
            local _,first_err=automation_db.in_tx(function(tx)
                local count,prune_err=history.prune_tx(tx,cutoff,1)
                test.eq(count,1)
                return true,prune_err
            end)
            test.is_nil(first_err,tostring(first_err))
            test.eq(#rows(id),2)
            local _,second_err=automation_db.in_tx(function(tx)
                local count,prune_err=history.prune_tx(tx,cutoff,1)
                test.eq(count,1)
                return true,prune_err
            end)
            test.is_nil(second_err,tostring(second_err))
            test.eq(#rows(id),1)
            test.eq(rows(id)[1].item_key,"c")
        end)

        test.it("retains hot events without an append-time scan of other automations",function()
            local id,other=uuid.v7(),uuid.v7()
            seed(id,9990,"2099-01-01T00:00:00Z")
            seed(other,3,"2099-01-01T00:00:00Z")
            local outcomes: {Map}={}
            for index=1,205 do outcomes[#outcomes+1]=item("recent-" .. tostring(index)) end
            local _,err=automation_db.in_tx(function(tx) return true,record(tx,round(id),outcomes) end)
            test.is_nil(err,tostring(err))
            test.eq(#rows(id),10195)
            test.eq(#rows(other),3)
            local independent=round(id)
            independent.drive_key="independent"
            local _,independent_err=automation_db.in_tx(function(tx)
                return true,record(tx,independent,{item("another-drive")})
            end)
            test.is_nil(independent_err,tostring(independent_err))
            test.eq(#rows(id),10196)
            test.eq(#h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1 AND drive_key='history'",{id}),10195)
            test.eq(#h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1 AND drive_key='history' AND round_at=$2",{id,NOW}),205)
        end)

        test.it("drains a large retained table through bounded age pruning after an update",function()
            local id=uuid.v7()
            local cutoff="1750-01-01T00:00:00Z"
            seed(id,12050,cutoff)
            h.exec("UPDATE kickside_automation_delivery_history SET round_at='1700-01-01T00:00:00Z' WHERE automation_id=$1",{id})
            local total=0
            for page=1,13 do
                local count,err=automation_db.in_tx(function(tx) return history.prune_tx(tx,cutoff,1000) end)
                test.is_nil(err,tostring(err))
                test.is_true(count <= 1000)
                total=total+count
            end
            test.eq(total,12050)
            test.eq(#rows(id),0)
        end)

        test.it("retains a resolution after an intervening failure of the same delivery",function()
            local id=uuid.v7()
            for index,state in ipairs({"resolved","retrying","resolved"}) do
                local r=round(id)
                r.now="2026-10-11T00:00:0" .. tostring(index) .. "Z"
                local outcome=item("transition")
                outcome.state=state
                local _,err=automation_db.in_tx(function(tx) return true,record(tx,r,{outcome}) end)
                test.is_nil(err,tostring(err))
            end
            test.eq(#rows(id),3)
        end)

        test.it("does not retain outcomes from a round whose commit fence moves",function()
            local env=h.setup("history_fence")
            local result,err=automation_db.in_tx(function(tx)
                return commit.commit_tx(tx,{automation_id=env.automation_id,drive_key="main",source_port="source",
                    now=NOW,resolved_expires_at=EXPIRY,captured={round_token="stale",round_until=EXPIRY}},
                    {outcomes={item("ghost","{}")}})
            end)
            test.is_nil(err,tostring(err))
            test.is_false(result.committed)
            test.eq(#rows(env.automation_id),0)
        end)

        test.it("rolls back ledger and drive settlement when history storage fails in the native commit",function()
            local env=h.setup("history_atomic_commit")
            local id=env.automation_id
            local job=h.running_job()
            local token=uuid.v7()
            h.set_drive(id,"main","round_token=$1,round_until=$2",{token,job.lease_until})
            local before=h.read_drive(id,"main")
            local r={automation_id=id,drive_key="main",source_port="source",now=NOW,resolved_expires_at=EXPIRY,
                captured={round_token=token,round_until=job.lease_until,revision=before.revision,
                    rewind_generation=before.rewind_generation,command_generation=before.command_generation}}
            local failure=item("rollback","{}")
            failure.item.dedup_key="rollback"
            failure.state="retrying"
            local original=history.record_tx
            history.record_tx=function() return errors.new({kind=errors.UNAVAILABLE,message="history commit unavailable"}) end
            local result,err=automation_db.in_tx(function(tx) return commit.commit_tx(tx,r,{outcomes={failure}}) end)
            history.record_tx=original
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("history commit unavailable",1,true) ~= nil)
            test.eq(h.encoded(h.read_drive(id,"main")),h.encoded(before))
            test.eq(#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
            test.eq(#rows(id),0)
            h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
        end)

        test.it("updates a million retained rows without history DDL and bounds each append",function()
            local removed=registry.get("kickside.automation.migrations:17_delivery_history_lookup")
            test.is_nil(removed,"history updates must not build an index")
            local id=uuid.v7()
            local retained_before_seed=tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history")[1].n)
            seed(id,1000000,"2099-01-01T00:00:00Z",true)
            h.exec("ANALYZE kickside_automation_delivery_history")
            local db=h.db()
            local postgres=tostring(db:type()) == sql.type.POSTGRES
            db:release()
            local schema=postgres and "SELECT c.relname,c.relfilenode FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace"
                .. " WHERE n.nspname=current_schema() AND (c.oid='kickside_automation_delivery_history'::regclass"
                .. " OR c.oid IN (SELECT indexrelid FROM pg_index WHERE indrelid='kickside_automation_delivery_history'::regclass)) ORDER BY c.relname"
                or "SELECT name,rootpage,sql FROM sqlite_master WHERE tbl_name='kickside_automation_delivery_history' ORDER BY name"
            local storage=h.query(schema)
            test.eq(#storage,postgres and 4 or 4,"history keeps its original table and three indexes")
            local before=h.encoded(storage)
            local started=time.now():unix_nano()
            local result=runner.setup(h.DB):run()
            local update_ms=(time.now():unix_nano()-started)/1000000
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(result.migrations_applied,0)
            test.eq(h.encoded(h.query(schema)),before,"update changes history storage or indexes")
            local function count(): number
                return assert(tonumber(h.query("SELECT COUNT(*) AS n FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})[1].n))
            end
            test.eq(count(),1000000)
            local outcomes: {Map}={}
            local deliveries: {Map}={}
            for index=1,205 do
                local key="recent-" .. tostring(index)
                outcomes[#outcomes+1]=item(key)
                deliveries[#deliveries+1]={key=key}
            end
            local writes,trimmed,reads=0,0,0
            local plans: Map={}
            local function append(delivered: {Map}, prior: Map?): error?
                local _,err=automation_db.in_tx(function(tx)
                    local executor={execute=function(_,statement,params)
                        if statement:find("DELETE FROM",1,true) then
                            if plans.trim == nil then plans.trim=tx:query("EXPLAIN " .. (postgres and "" or "QUERY PLAN ") .. statement,params) end
                        end
                        local changed,write_err=tx:execute(statement,params)
                        if changed then
                            local affected=tonumber(changed.rows_affected)
                            test.is_true(affected <= 50,"a history write exceeds its batch bound")
                            if statement:find("DELETE FROM",1,true) then trimmed=trimmed+affected else writes=writes+affected end
                        end
                        return changed,write_err
                    end,query=function(_,statement,params)
                        local plan,plan_err=tx:query("EXPLAIN " .. (postgres and "" or "QUERY PLAN ") .. statement,params)
                        test.is_nil(plan_err,tostring(plan_err))
                        plans.lookup=plan
                        local page,read_err=tx:query(statement,params)
                        if page then test.is_true(#page <= 205);reads=reads+#page end
                        return page,read_err
                    end}
                    return true,record(executor,round(id),outcomes,delivered,prior)
                end)
                return err
            end
            started=time.now():unix_nano()
            local write_err=append(deliveries)
            local append_ms=(time.now():unix_nano()-started)/1000000
            test.is_nil(write_err,tostring(write_err))
            test.eq(writes,205)
            test.eq(trimmed,0)
            test.eq(reads,0)
            test.eq(count(),1000205)
            started=time.now():unix_nano()
            local prior: Map={}
            for _,outcome in ipairs(outcomes) do prior[outcome.item.item_key .. "\n" .. outcome.item.delivery_key]={state="resolved"} end
            local skip_err=append({},prior)
            local skip_ms=(time.now():unix_nano()-started)/1000000
            test.is_nil(skip_err,tostring(skip_err))
            test.eq(writes,205,"unchanged skips write no history")
            test.eq(trimmed,0,"unchanged skips trim no history")
            test.eq(reads,0)
            test.eq(count(),1000205)
            h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'history','scale',0,$2)",
                {id,h.encoded({engine=postgres and "postgres" or "sqlite",rows=1000000,
                update_ms=update_ms,append_ms=append_ms,skip_ms=skip_ms,writes=writes,trimmed=trimmed,reads=reads,plans=plans,
                migrations_applied=result.migrations_applied,storage_before=before,storage_after=h.encoded(h.query(schema))})})
            test.is_nil(plans.lookup,"prior classifications never read history")
            test.is_nil(plans.trim,"appends never scan or trim retained history")
            cleanup()
            if postgres then
                -- Release this bulk fixture's dead index entries before live-worker suites.
                h.exec("VACUUM (ANALYZE) kickside_automation_delivery_history")
                local remaining=retained_before_seed
                local heap_fetches=0
                local function visit(node: Map): ()
                    heap_fetches=heap_fetches+(tonumber(node["Heap Fetches"]) or 0)
                    for _,child in ipairs(node.Plans or {}) do visit(child) end
                end
                local _,oldest_err=history.oldest({query=function(_,statement,params)
                    local explained=h.query("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) " .. statement,params)
                    visit(json.decode(explained[1]["QUERY PLAN"])[1].Plan)
                    return h.query(statement,params),nil
                end})
                test.is_nil(oldest_err,tostring(oldest_err))
                test.is_true(heap_fetches<=3*(remaining :: number)+2,
                    "fixture cleanup leaves dead history tuples in later maintenance seeks: " .. tostring(heap_fetches)
                    .. " heap fetches for " .. tostring(remaining) .. " live rows")
            end
        end)

        test.it("rejects invalid prune bounds and propagates missing storage proof",function()
            local writes=0
            local seam={query=function() return {{automation_id="owner"}},nil end,execute=function(): (any?,any) writes=writes+1;return {},nil end}
            for _,args in ipairs({{now="",limit=1},{now=NOW,limit=0},{now=NOW,limit=1.5},{now=NOW,limit=1001}}) do
                local count,err=history.prune_tx(seam,args.now,args.limit :: any)
                test.is_nil(count)
                test.is_true(errors.is(err,errors.INVALID),tostring(err))
            end
            test.eq(writes,0)
            local count,err=history.prune_tx(seam,NOW,1)
            test.is_nil(count)
            test.not_nil(err)
            test.eq(writes,1)
        end)
    end)
end

local run_cases=test.run_cases(define_tests)
return {run=function(options: any): any return run_cases(options) end}
