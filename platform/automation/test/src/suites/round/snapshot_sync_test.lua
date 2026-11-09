-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local h=require("round_harness")
local json=require("json")
local automation_db=require("automation_db")
local commit=require("round_commit")
local ledger=require("round_ledger")
local provenance=require("round_provenance")
local round_write=require("round_write")
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
                applied_hash="snapshot-v1",
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

        test.it("settles an unchanged skip without prepared delete statements",function()
            local env=h.setup("snapshot_no_prepared","kickside.automation.round.fixture:snapshot_sync_kind")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="snapshot",source_kind="collection",
                applied={title="Snapshot sync",trigger={v=2,source=PORT},sink_port=STORE,sink_config={},transform={kind="none"},enabled=true},
                applied_hash="snapshot-v1",action={source_ref=PORT,config={}}})
            local job=h.running_job()
            local token="unchanged-snapshot"
            local item={item_key="unchanged",dedup_key="unchanged",op="upsert",payload={}}
            item.delivery_key=round_write.keys({automation_id=id,source_port=PORT},item).idempotency_key
            h.set_drive(id,"snapshot","round_token=$1,round_until=$2",{token,job.lease_until})
            local before=h.read_drive(id,"snapshot")
            local captured={round_token=token,round_until=job.lease_until,revision=before.revision,
                rewind_generation=before.rewind_generation,command_generation=before.command_generation}
            local admitted,admit_err=provenance.admit({automation_id=id,drive_key="snapshot",source_port=PORT,fence=captured},
                {item.delivery_key})
            test.is_nil(admit_err,tostring(admit_err));test.not_nil(admitted)
            local prepared_statements=0
            local reclaim=ledger.reclaim_prepared_tx
            ledger.reclaim_prepared_tx=function(tx,refs)
                local executor={db_type=function() return tx:db_type() end,
                    query=function(_,statement,params) return tx:query(statement,params) end,
                    execute=function(_,statement,params)
                        if statement:find("DELETE FROM kickside_automation_prepared",1,true) then
                            prepared_statements=prepared_statements+1
                        end
                        return tx:execute(statement,params)
                    end}
                return reclaim(executor,refs)
            end
            local result,err=automation_db.in_tx(function(tx)
                return commit.commit_tx(tx,{automation_id=id,drive_key="snapshot",source_port=PORT,receipt_port=PORT,
                    now=h.PAST,resolved_expires_at="2099-01-01T00:00:00Z",
                    captured=captured},
                    {outcomes={{item=item,state="resolved"}},receipts={{item=item,receipts={}}}})
            end)
            ledger.reclaim_prepared_tx=reclaim
            test.is_nil(err,tostring(err));test.is_true(result.committed)
            test.eq(prepared_statements,0,"an unchanged skip without prepared output issues no prepared statement")
            test.is_nil(next(h.read_drive(id,"snapshot").admission))
            h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
        end)

        test.it("redelivers an unchanged snapshot only when its applied declaration changes",function()
            local env=h.setup("snapshot_declaration","kickside.automation.round.fixture:snapshot_sync_kind")
            local id=env.automation_id
            local items: {Map}={ {item_key="one",dedup_key="one",op="upsert",payload={value=1}} }
            local function declaration(transform: Map, sink_config: Map, filter: string?): Map
                local trigger: Map={v=2,source=PORT}
                if filter then trigger.filter={expr=filter} end
                return {title="Snapshot declaration",trigger=trigger,sink_port=STORE,sink_config=sink_config,transform=transform,enabled=true}
            end
            local current=declaration({kind="none"},{})
            h.new_drive({automation_id=id,drive_key="snapshot",source_kind="collection",applied=current,applied_hash="snapshot-v1",
                action={source_ref=PORT,config={},schedule={type="interval",expression="5m"}}})
            local answer: Map={}
            local pass=0
            local function run_as(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then return {success=true,items=items,next_cursor={},has_more=false},nil end
                local result,err=env.run_as(identity,target,args,opts)
                if target == "kickside.automation:round_deliver" and result then answer=result.outcomes end
                return result,err
            end
            local function run(expected_calls: integer, expected_list: string): ()
                pass=pass+1
                answer={}
                local before=#h.query("SELECT id FROM round_fixture_log WHERE drive_key='sink'",{})
                h.set_drive(id,"snapshot","next_run_at=$1",{h.PAST})
                local _,err=env.run(id,"snapshot",run_as)
                test.is_nil(err,tostring(err))
                test.eq(#h.query("SELECT id FROM round_fixture_log WHERE drive_key='sink'",{})-before,expected_calls,
                    "sink calls for pass " .. tostring(pass) .. " (" .. expected_list .. ")")
                for _,name in ipairs({"delivered","skipped","waiting","uncertain","failed"}) do
                    test.eq(#(answer[name] or {}),name==expected_list and 1 or 0,h.encoded(answer))
                end
            end
            local function apply(next: Map, hash: string): ()
                current=next
                h.set_drive(id,"snapshot","applied_json=$1,applied_hash=$2",
                    {h.encoded({declaration=current,policy=h.drive_policy(nil)}),hash})
            end

            run(1,"delivered")
            run(0,"skipped")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{}),"snapshot-v2-transform")
            run(1,"delivered")
            local remapped=h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' ORDER BY id DESC LIMIT 1",{})[1]
            test.eq(json.decode(remapped.detail_json).directive,"remapped")
            run(0,"skipped")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{mapping="changed"}),"snapshot-v3-sink")
            run(1,"delivered")
            run(0,"skipped")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{mapping="changed"},"false"),"snapshot-v4-excluded")
            run(0,"skipped")
            test.eq(answer.skipped[1].reason,"filtered")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{mapping="changed"},"payload.value > 0"),"snapshot-v5-admitted")
            run(1,"delivered")
            run(0,"skipped")
            local receipt=h.query("SELECT delivery_key,declaration_hash FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='one'",{id})
            test.eq(#receipt,1)
            test.not_nil(receipt[1].delivery_key)
            test.eq(receipt[1].declaration_hash,"snapshot-v5-admitted")
        end)
    end)
end)
