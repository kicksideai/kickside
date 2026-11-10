-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local h=require("round_harness")
local json=require("json")
local automation_db=require("automation_db")
local commit=require("round_commit")
local ledger=require("round_ledger")
local provenance=require("round_provenance")
local round_write=require("round_write")
local time=require("time")
local drive=require("drive")
local canonical_json=require("canonical_json")
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
            local declaration={title="Snapshot sync",trigger={v=2,source=PORT},sink_port=STORE,sink_config={},transform={kind="none"},enabled=true}
            h.new_drive({automation_id=id,drive_key="snapshot",source_kind="collection",
                applied=declaration,
                applied_hash=assert(canonical_json.hash(declaration)),
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

        for _,sample in ipairs({{pages=1,size=100,reference=false},{pages=1,size=10000,reference=true},
            {pages=100,size=100,reference=true}}) do
            test.it("settles unchanged unprepared admissions with one probe per commit: " .. h.encoded(sample),function()
                local env=h.setup("snapshot_no_prepared","kickside.automation.round.fixture:snapshot_sync_kind")
                local id=env.automation_id
                local declaration={title="Snapshot sync",trigger={v=2,source=PORT},sink_port=STORE,sink_config={},transform={kind="none"},enabled=true}
                h.new_drive({automation_id=id,drive_key="snapshot",source_kind="collection",
                    applied=declaration,
                    applied_hash=assert(canonical_json.hash(declaration)),action={source_ref=PORT,config={}}})
                local job=h.running_job()
                local prepared_deletes=0
                local prepared_probes=0
                local prepared_locks=0
                local commit_ms=0
                for page=1,sample.pages do
                    local token="unchanged-snapshot-" .. tostring(page)
                    h.set_drive(id,"snapshot","round_token=$1,round_until=$2",{token,job.lease_until})
                    local before=h.read_drive(id,"snapshot")
                    local captured={round_token=token,round_until=job.lease_until,revision=before.revision,
                        rewind_generation=before.rewind_generation,command_generation=before.command_generation}
                    local keys: {string}={}
                    local outcomes: {Map}={}
                    local receipts: {Map}={}
                    for index=1,sample.size do
                        local key=tostring((page-1)*sample.size+index)
                        local item={item_key=key,dedup_key=key,op="upsert",payload={}}
                        item.delivery_key=round_write.keys({automation_id=id,source_port=PORT},item).idempotency_key
                        keys[#keys+1]=item.delivery_key
                        outcomes[#outcomes+1]={item=item,state="resolved"}
                        receipts[#receipts+1]={item=item,receipts={}}
                    end
                    if sample.size == 10000 then
                        local journal: Map={}
                        for _,key in ipairs(keys) do journal[key]={prepared_key=key} end
                        h.set_drive(id,"snapshot","admission_json=$1",{h.encoded(journal)})
                    else
                        local admitted,admit_err=provenance.admit({automation_id=id,drive_key="snapshot",source_port=PORT,fence=captured},keys)
                        test.is_nil(admit_err,tostring(admit_err));test.not_nil(admitted)
                        if not sample.reference then
                            for _,key in ipairs(keys) do admitted.deliveries[key].prepared_key=nil end
                            h.set_drive(id,"snapshot","admission_json=$1",{h.encoded(admitted.deliveries)})
                        end
                    end
                    local started=time.now():unix_nano()
                    local result,err=automation_db.in_tx(function(tx)
                        local executor={db_type=function() return tx:db_type() end,
                            query=function(_,statement,params)
                                if statement == "SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1 LIMIT 1" then
                                    prepared_probes=prepared_probes+1
                                    test.eq(params[1],id)
                                elseif statement:find("FROM kickside_automation_prepared",1,true) then
                                    prepared_locks=prepared_locks+1
                                end
                                return tx:query(statement,params)
                            end,
                            execute=function(_,statement,params)
                                if statement:find("DELETE FROM kickside_automation_prepared",1,true) then
                                    prepared_deletes=prepared_deletes+1
                                    test.is_true(#params<=400,"prepared deletion binds at most 100 candidates")
                                end
                                return tx:execute(statement,params)
                            end}
                        local lock=drive.lock_tx
                        local update=drive.update_cas_tx
                        drive.lock_tx=function(_,owner,keys) return lock(tx,owner,keys) end
                        drive.update_cas_tx=function(_,owner,key,fence,fields) return update(tx,owner,key,fence,fields) end
                        local answer,commit_err=commit.commit_tx(executor,{automation_id=id,drive_key="snapshot",source_port=PORT,receipt_port=PORT,
                            now=h.PAST,resolved_expires_at="2099-01-01T00:00:00Z",captured=captured},
                            {outcomes=outcomes,receipts=receipts})
                        drive.lock_tx=lock
                        drive.update_cas_tx=update
                        return answer,commit_err
                    end)
                    commit_ms=commit_ms+(time.now():unix_nano()-started)/1000000
                    test.is_nil(err,tostring(err));test.is_true(result.committed)
                    test.is_nil(next(h.read_drive(id,"snapshot").admission))
                end
                h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'snapshot','unprepared_reclaim',0,$2)",
                    {id,h.encoded({items=sample.pages*sample.size,commits=sample.pages,reference=sample.reference,
                        prepared_deletes=prepared_deletes,prepared_probes=prepared_probes,prepared_locks=prepared_locks,commit_ms=commit_ms})})
                test.eq(prepared_probes,sample.reference and sample.pages or 0,
                    "only resolved journal references require one automation prefix probe per commit")
                test.eq(prepared_deletes,0,"an automation without prepared output issues no prepared delete")
                test.eq(prepared_locks,0,"an automation without prepared output locks no prepared keys")
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0)
                test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
                test.eq(#h.query("SELECT 1 FROM kickside_automation_receipt WHERE owner_id=$1",{id}),0)
                test.eq(#h.query("SELECT 1 FROM kickside_automation_delivery_history WHERE automation_id=$1",{id}),0)
                h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
            end)
        end

        test.it("redelivers an unchanged snapshot only when its applied declaration changes",function()
            local env=h.setup("snapshot_declaration","kickside.automation.round.fixture:snapshot_sync_kind")
            local items: {Map}={ {item_key="one",dedup_key="one",op="upsert",payload={value=1}} }
            local function declaration(transform: Map, sink_config: Map, filter: string?): Map
                local trigger: Map={v=2,source=PORT,backfill="all",schedule={type="interval",expression="5m"}}
                if filter then trigger.filter={expr=filter} end
                return {title="Snapshot declaration",trigger=trigger,sink_port="kickside.automation.round.fixture:idempotent_store",sink_config=sink_config,transform=transform,enabled=true}
            end
            local current=declaration({kind="none"},{})
            local manage="kickside.automation.agent:automations_manage"
            local installed,install_err=env.caller:call(manage,{action="install",type="kickside.sync:sync",input=current})
            test.is_nil(install_err,tostring(install_err));test.is_true(installed.success)
            local id=installed.id
            local initial=h.read_drive(id,"main")
            test.eq(h.encoded(initial.applied.declaration),h.encoded(current))
            test.eq(initial.applied_hash,assert(canonical_json.hash(current)))
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
                h.set_drive(id,"main","next_run_at=$1",{h.PAST})
                local _,err=env.run(id,"main",run_as)
                test.is_nil(err,tostring(err))
                test.eq(#h.query("SELECT id FROM round_fixture_log WHERE drive_key='sink'",{})-before,expected_calls,
                    "sink calls for pass " .. tostring(pass) .. " (" .. expected_list .. "): " .. h.encoded(answer))
                for _,name in ipairs({"delivered","skipped","waiting","uncertain","failed"}) do
                    test.eq(#(answer[name] or {}),name==expected_list and 1 or 0,h.encoded(answer))
                end
            end
            local function apply(next: Map): ()
                local result,err=env.caller:call(manage,{action="reconfigure",id=id,input=next})
                test.is_nil(err,tostring(err));test.is_true(result.success)
                current=next
                local applied=h.read_drive(id,"main")
                test.eq(h.encoded(applied.applied.declaration),h.encoded(current))
                test.eq(applied.applied_hash,assert(canonical_json.hash(current)))
            end

            run(1,"delivered")
            run(0,"skipped")
            local original=h.read_drive(id,"main").delivery_revision
            local original_key=h.query("SELECT delivery_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})[1].delivery_key
            current.title="Renamed snapshot"
            apply(current)
            run(0,"delivered")
            run(0,"skipped")
            test.eq(h.read_drive(id,"main").delivery_revision,original)
            test.eq(h.query("SELECT delivery_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})[1].delivery_key,original_key)
            current.trigger.schedule={type="interval",expression="15m"}
            apply(current)
            run(0,"delivered")
            test.eq(h.read_drive(id,"main").delivery_revision,original)
            test.eq(h.query("SELECT delivery_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})[1].delivery_key,original_key)
            current.enabled=false
            apply(current)
            current.enabled=true
            apply(current)
            run(0,"skipped")
            test.eq(h.read_drive(id,"main").delivery_revision,original)
            test.eq(h.query("SELECT delivery_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})[1].delivery_key,original_key)
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{}))
            run(1,"delivered")
            test.eq(h.read_drive(id,"main").delivery_revision,original+1)
            test.is_true(h.query("SELECT delivery_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})[1].delivery_key ~= original_key)
            local remapped=h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' ORDER BY id DESC LIMIT 1",{})[1]
            test.eq(json.decode(remapped.detail_json).directive,"remapped")
            run(0,"skipped")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{mapping="changed"}))
            run(1,"delivered")
            run(0,"skipped")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{mapping="changed"},"false"))
            run(0,"skipped")
            test.eq(answer.skipped[1].reason,"filtered")
            apply(declaration({kind="expr",expr='{"directive":"remapped"}'},{mapping="changed"},"payload.value > 0"))
            run(1,"delivered")
            run(0,"skipped")
            local receipt=h.query("SELECT delivery_key,declaration_hash FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='one'",{id})
            test.eq(#receipt,1)
            test.not_nil(receipt[1].delivery_key)
            test.eq(receipt[1].declaration_hash,assert(canonical_json.hash(current)))
            test.eq(#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND state='dead'",{id}),0)
            local accepted=h.query("SELECT item_key FROM round_fixture_log WHERE drive_key='idempotent-sink'",{})
            test.eq(#accepted,4)
            for i=1,#accepted do for j=i+1,#accepted do test.is_true(accepted[i].item_key ~= accepted[j].item_key) end end
            local revision=h.read_drive(id,"main").delivery_revision
            apply(current)
            test.eq(h.read_drive(id,"main").delivery_revision,revision)
            h.new_drive({automation_id=id,drive_key="reconcile",source_kind="reconcile",action={source_ref=PORT}})
            h.set_drive(id,"reconcile","reconcile_pass_id=$1",{"reconfigured-pass"})
            run(0,"skipped")
            local seen=h.query("SELECT delivery_key,pass_id FROM kickside_automation_receipt WHERE owner_id=$1",{id})[1]
            test.eq(seen.delivery_key,receipt[1].delivery_key)
            test.eq(seen.pass_id,"reconfigured-pass")
            items={{item_key="one",dedup_key="one",op="delete",payload={}}}
            run(1,"delivered")
            test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id}),0)
            run(0,"skipped")
            test.eq(answer.skipped[1].reason,"no destination")
        end)
    end)
end)
