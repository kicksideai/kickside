-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local h=require("round_harness")
local json=require("json")
type Map = {[string]:any}
local PORT="kickside.automation.round.fixture:records"
local STORE="kickside.automation.round.fixture:store"
return test.run_cases(function()
    test.describe("snapshot sync repeated passes",function()
        test.it("delivers once and skips the same live items without history or ledger writes",function()
            local env=h.setup("snapshot_sync","kickside.automation.round.fixture:snapshot_sync_kind")
            local id=env.automation_id
            local count=5
            local items: {Map}={}
            for i=1,count do items[i]={item_key=tostring(i),dedup_key=tostring(i),op="upsert",payload={value=i}} end
            h.new_drive({automation_id=id,drive_key="snapshot",source_kind="collection",
                applied={title="Snapshot sync",trigger={v=2,source=PORT},sink_port=STORE,sink_config={},transform={kind="none"},enabled=true},
                action={source_ref=PORT,config={},schedule={type="interval",expression="5m"}}})
            local passes={}
            local previous_receipts=""
            for pass=1,3 do
                local answer: Map={}
                local before=#h.query("SELECT id FROM round_fixture_log WHERE drive_key='sink'",{})
                local function run_as(identity: any,target: string,args: any,opts: any): (any?,any)
                    if target == "kickside.automation:round_acquire" then
                        return {success=true,items=items,next_cursor={},has_more=false},nil
                    end
                    local result,err=env.run_as(identity,target,args,opts)
                    if target == "kickside.automation:round_deliver" and result then answer=result.outcomes end
                    return result,err
                end
                h.set_drive(id,"snapshot","next_run_at=$1",{h.PAST})
                local _,err=env.run(id,"snapshot",run_as)
                test.is_nil(err,tostring(err))
                local calls=#h.query("SELECT id FROM round_fixture_log WHERE drive_key='sink'",{})-before
                local receipts=h.encoded(h.query("SELECT * FROM kickside_automation_receipt WHERE owner_id=$1 ORDER BY item_key,map_slot",{id}))
                local history=#h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})
                local ledger=#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})
                local lists: Map={}
                for _,name in ipairs({"delivered","skipped","waiting","uncertain","failed"}) do
                    lists[name]=#(answer[name] or {})
                    test.eq(lists[name],((pass==1 and name=="delivered") or (pass>1 and name=="skipped")) and count or 0)
                end
                test.eq(calls,pass==1 and count or 0)
                test.eq(history,count)
                test.eq(ledger,0)
                if pass>1 then test.eq(receipts,previous_receipts,"unchanged passes rewrite no receipt bytes or timestamp") end
                previous_receipts=receipts
                passes[#passes+1]={pass=pass,sink_calls=calls,outcomes=lists,history_rows=history,ledger_rows=ledger,receipt_writes=pass==1 and count or 0}
                local seq=h.read_drive(id,"snapshot").round_seq
                local _,idle_err=env.run(id,"snapshot",run_as)
                test.is_nil(idle_err,tostring(idle_err))
                test.eq(h.read_drive(id,"snapshot").round_seq,seq,"idle drives run no intervening rounds")
            end
            h.new_drive({automation_id=id,drive_key="reconcile",source_kind="reconcile",action={source_ref=PORT}})
            h.set_drive(id,"reconcile","reconcile_pass_id=$1",{"active-pass"})
            local function repeated(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then return {success=true,items=items,next_cursor={},has_more=false},nil end
                return env.run_as(identity,target,args,opts)
            end
            for pass=1,2 do
                h.set_drive(id,"snapshot","next_run_at=$1",{h.PAST})
                local _,err=env.run(id,"snapshot",repeated)
                test.is_nil(err,tostring(err))
                local seen=h.query("SELECT pass_id,delivery_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})
                test.eq(#seen,count)
                for _,row in ipairs(seen) do test.eq(row.pass_id,"active-pass");test.not_nil(row.delivery_key) end
                if pass == 1 then
                    h.exec("UPDATE kickside_automation_receipt SET updated_at='2000-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                else
                    for _,row in ipairs(h.query("SELECT updated_at FROM kickside_automation_receipt WHERE owner_id=$1",{id})) do
                        test.eq(row.updated_at,"2000-01-01T00:00:00Z","an observed current pass rewrites no receipt")
                    end
                end
                test.eq(#h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1",{id}),count)
            end
            h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'snapshot','snapshot_passes',0,$2)",{id,h.encoded(passes)})
        end)
    end)
end)
