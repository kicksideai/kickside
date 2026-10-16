local test = require("test")
local h = require("round_harness")
local history = require("round_history")
local errors = require("errors")
local json = require("json")
local uuid = require("uuid")
local commit = require("round_commit")
local automation_db = require("automation_db")
local sql = require("sql")

type Map = { [string]: any }
local NOW = "2026-10-11T00:00:00Z"
local EXPIRY = "2026-11-11T00:00:00Z"

local function round(id: string): Map
    return {automation_id=id,drive_key="history",source_port="source",now=NOW,
        resolved_expires_at=EXPIRY,captured={round_token=uuid.v7()}}
end

local function item(key: string, evidence: string?): Map
    return {item={item_key=key,delivery_key=key},state="resolved",execution_identity_json=evidence}
end


local function rows(id: string): {Map}
    return h.query("SELECT * FROM kickside_automation_delivery_history WHERE automation_id=$1 ORDER BY drive_key,round_token,source_port,item_key,identity_key",{id})
end

local function define_tests()
    test.describe("AUTOMATION-DELIVERY-HISTORY atomic append and retention",function()
        test.before_each(function() h.ensure_log() end)

        test.it("stores absent, unresolved and inferred evidence exactly without a current identity read",function()
            local id=uuid.v7()
            local unresolved=json.encode({unresolved=true,generation=9})
            local inferred=json.encode({inferred={reason="original_generation"},identity={principal={id="older"}}})
            local _,err=automation_db.in_tx(function(tx)
                return true,history.record_tx(tx,round(id),{item("absent"),item("unresolved",unresolved),item("inferred",inferred)})
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
            local _,err=automation_db.in_tx(function(tx) return true,history.record_tx(tx,r,outcomes) end)
            test.is_nil(err,tostring(err))
            test.eq(#rows(id),205)
            r.drive_key="another-drive"
            local _,next_err=automation_db.in_tx(function(tx) return true,history.record_tx(tx,r,{item("1","{}")}) end)
            test.is_nil(next_err,tostring(next_err))
            test.eq(#rows(id),206)
        end)

        test.it("rolls back all batches on a conflicting append and leaves original bytes immutable",function()
            local id=uuid.v7()
            local r=round(id)
            local _,err=automation_db.in_tx(function(tx) return true,history.record_tx(tx,r,{item("z","{\"generation\":1}")}) end)
            test.is_nil(err,tostring(err))
            local original=h.encoded(rows(id))
            local outcomes: {Map}={}
            for index=1,105 do outcomes[#outcomes+1]=item("a" .. tostring(index),"{}") end
            outcomes[#outcomes+1]=item("z","{\"generation\":2}")
            local _,conflict=automation_db.in_tx(function(tx) return true,history.record_tx(tx,r,outcomes) end)
            test.not_nil(conflict)
            test.eq(h.encoded(rows(id)),original)
        end)

        test.it("propagates storage errors and refuses an oversized row before writes",function()
            local outage=errors.new({kind=errors.UNAVAILABLE,message="history unavailable"})
            local _,err=automation_db.in_tx(function(tx)
                return true,history.record_tx({execute=function() return nil,outage end},round(uuid.v7()),{item("one","{}")})
            end)
            test.not_nil(err)
            test.is_true(tostring(err):find("history unavailable",1,true) ~= nil)
            local id=uuid.v7()
            local _,bound_err=automation_db.in_tx(function(tx)
                return true,history.record_tx(tx,round(id),{item("large",string.rep("x",20*1024*1024))})
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
            local _,err=automation_db.in_tx(function(tx) return true,history.record_tx(tx,r,{item("a"),item("b"),item("c")}) end)
            test.is_nil(err,tostring(err))
            h.exec("UPDATE kickside_automation_delivery_history SET expires_at=$1 WHERE automation_id=$2 AND item_key='c'",{"2099-01-01T00:00:00Z",id})
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
            local trigger="history_failure_" .. uuid.v4():gsub("-","")
            local db=h.db()
            local dialect=tostring(db:type())
            db:release()
            if dialect == sql.type.POSTGRES then
                h.exec("CREATE FUNCTION " .. trigger .. "() RETURNS trigger AS $body$ BEGIN IF NEW.automation_id='"
                    .. id .. "' THEN RAISE EXCEPTION 'history commit unavailable'; END IF; RETURN NEW; END $body$ LANGUAGE plpgsql")
                h.exec("CREATE TRIGGER " .. trigger .. " BEFORE INSERT ON kickside_automation_delivery_history FOR EACH ROW EXECUTE FUNCTION " .. trigger .. "()")
            else
                h.exec("CREATE TRIGGER " .. trigger .. " BEFORE INSERT ON kickside_automation_delivery_history WHEN NEW.automation_id='"
                    .. id .. "' BEGIN SELECT RAISE(ABORT,'history commit unavailable'); END")
            end
            local result,err=automation_db.in_tx(function(tx)
                return commit.commit_tx(tx,r,{outcomes={failure}})
            end)
            if dialect == sql.type.POSTGRES then
                h.exec("DROP TRIGGER " .. trigger .. " ON kickside_automation_delivery_history")
                h.exec("DROP FUNCTION " .. trigger .. "()")
            else
                h.exec("DROP TRIGGER " .. trigger)
            end
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("history commit unavailable",1,true) ~= nil)
            test.eq(h.encoded(h.read_drive(id,"main")),h.encoded(before))
            test.eq(#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
            test.eq(#rows(id),0)
            h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
        end)

        test.it("rejects invalid prune bounds and propagates missing storage proof",function()
            local writes=0
            local seam={execute=function(): (any?,any) writes=writes+1;return {},nil end}
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
