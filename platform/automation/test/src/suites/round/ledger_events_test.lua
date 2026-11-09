-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local test = require("test")
local h = require("round_harness")
local ledger = require("round_ledger")
local history = require("round_history")
local automation_db = require("automation_db")
local uuid = require("uuid")

local NOW = "2026-01-01T00:00:00Z"
local EXPIRY = "2026-02-01T00:00:00Z"
type Map = { [string]: any }

return test.run_cases(function()
    test.describe("round event storage", function()
        test.it("stores no ledger payload or history for a first resolved skip", function()
            local owner = uuid.v7()
            local item = {item_key="large",dedup_key="large",payload=string.rep("x",20*1024*1024)}
            local _,err = automation_db.in_tx(function(tx)
                local outcomes = {{item=item,state="resolved"}}
                local delta,record_err,_,prior = ledger.record_tx(tx,owner,"source",outcomes,NOW,EXPIRY)
                if record_err then return nil,record_err end
                test.eq(delta,0)
                return true,history.record_tx(tx,{automation_id=owner,drive_key="main",source_port="source",
                    now=NOW,resolved_expires_at=EXPIRY,captured={round_token=uuid.v7()}},outcomes,{},prior)
            end)
            test.is_nil(err,tostring(err))
            test.eq(#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{owner}),0)
            test.eq(#h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1",{owner}),0)
        end)

        test.it("keeps retries mutable and records only the first failure and final outcome", function()
            local owner=uuid.v7()
            local item={item_key="retry-series",dedup_key="retry-series",payload={value="source"}}
            local states={"retrying","retrying","waiting","waiting","retrying","dead"}
            for index,state in ipairs(states) do
                local _,err=automation_db.in_tx(function(tx)
                    local outcomes={{item=item,state=state,next_attempt_at=EXPIRY,error={code="refused",retriable=state~="dead"}}}
                    local _,record_err,_,prior=ledger.record_tx(tx,owner,"source",outcomes,NOW,EXPIRY)
                    if record_err then return nil,record_err end
                    return true,history.record_tx(tx,{automation_id=owner,drive_key="main",source_port="source",
                        now=NOW,resolved_expires_at=EXPIRY,captured={round_token=uuid.v7()}},outcomes,{},prior)
                end)
                test.is_nil(err,tostring(err))
                local rows=h.query("SELECT state,error_json FROM kickside_automation_delivery_history WHERE automation_id=$1 ORDER BY round_token",{owner})
                test.eq(#rows,index==#states and 2 or 1,"intermediate retries and waits append no events")
                test.eq(rows[1].state,"retrying")
                if index==#states then test.eq(rows[2].state,"dead");test.eq(tonumber(json.decode(rows[2].error_json).attempts),4) end
                test.eq(#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{owner}),1)
            end
        end)

        test.it("reads fronts in one batch and preserves a represented item's retry deadline", function()
            local owner = uuid.v7()
            local item = {item_key="failed",dedup_key="failed",op="upsert"}
            local observed,err = automation_db.in_tx(function(tx)
                local _,record_err=ledger.record_tx(tx,owner,"source",{{item=item,state="retrying",next_attempt_at=EXPIRY}},NOW,EXPIRY)
                if record_err then return nil,record_err end
                local reads=0
                local executor={query=function(_,statement,params)
                    reads=reads+1
                    return tx:query(statement,params)
                end}
                local items={item}
                for i=1,50 do items[#items+1]={item_key=tostring(i),delivery_key=tostring(i)} end
                local admitted,admit_err=ledger.admit(executor,owner,"source",items,2,NOW)
                if admit_err then return nil,admit_err end
                return {front=admitted.fronts.failed,reads=reads,items=#admitted.items},nil
            end)
            test.is_nil(err,tostring(err))
            test.eq(observed.front.next_attempt_at,EXPIRY)
            test.eq(observed.items,50,"a stored retry before its deadline creates no outcome or ledger write")
            test.eq(observed.reads,2,"admission reads identities and fronts in bounded page batches")
        end)

        test.it("expires settled failure tombstones and releases their successful payload", function()
            local owner=uuid.v7()
            local item={item_key="retry",dedup_key="retry",payload={value="source"}}
            local observed,err=automation_db.in_tx(function(tx)
                local _,first_err=ledger.record_tx(tx,owner,"source",{{item=item,state="retrying"}},NOW,EXPIRY)
                if first_err then return nil,first_err end
                local _,resolve_err=ledger.record_tx(tx,owner,"source",{{item=item,state="resolved"}},NOW,EXPIRY)
                if resolve_err then return nil,resolve_err end
                local rows,read_err=tx:query("SELECT expires_at,envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{owner})
                if read_err then return nil,read_err end
                local count,prune_err=ledger.prune_tx(tx,EXPIRY,1)
                return {row=rows[1],count=count},prune_err
            end)
            test.is_nil(err,tostring(err))
            test.eq(observed.row.expires_at,EXPIRY)
            test.eq(observed.row.envelope_json,"{}")
            test.eq(observed.count,1)
        end)
    end)
end)
