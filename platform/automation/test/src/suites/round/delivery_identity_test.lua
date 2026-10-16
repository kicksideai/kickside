local test = require("test")
local h = require("h")
local round_write = require("round_write")
local component = require("component")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local uuid = require("uuid")
local json = require("json")
local execution_identity = require("execution_identity")
local time = require("time")
local ledger = require("ledger")

type Map = { [string]: any }
local STORE = "kickside.automation.round.fixture:store"

local function stamp(env: Map): Map
    local id = tostring(env.automation_id)
    local current = h.read_drive(id, "main")
    local job = h.running_job()
    local token = uuid.v7()
    h.set_drive(id, "main", "round_token=$1,round_until=$2", { token, job.lease_until })
    return { automation_id=id, drive_key="main", source_port="fixture:records", ledger_port="fixture:records",
        delivery_revision=current.delivery_revision, automation_revision=current.command_generation,
        fence={round_token=token,round_until=job.lease_until,revision=current.revision,
            rewind_generation=current.rewind_generation,command_generation=current.command_generation,job=job} }
end

local function caller_for(env: Map,id: string): any
    local actor, actor_err = security.new_actor(id,{security_groups={"automation_test"}})
    test.is_nil(actor_err,tostring(actor_err))
    local caller, caller_err = funcs.new()
    test.is_nil(caller_err,tostring(caller_err))
    local bound,bound_err=caller:with_actor(actor)
    test.is_nil(bound_err,tostring(bound_err))
    local scoped,scoped_err=bound:with_scope(env.scope)
    test.is_nil(scoped_err,tostring(scoped_err))
    return scoped
end

local function select_replacement(env: Map): (string,any)
    local replacement = "delivery_replacement_" .. uuid.v4():sub(1,8)
    local definition, definition_err = contract.get("kickside.component:component_service")
    test.is_nil(definition_err,tostring(definition_err))
    local service, open_err = definition:with_actor(env.actor):with_scope(env.scope):open()
    test.is_nil(open_err,tostring(open_err))
    local granted, grant_err = service:grant_subtree({root_component_id=env.automation_id,
        subject={subject_id=replacement,subject_type="user"},access_mask=15})
    test.is_nil(grant_err,tostring(grant_err))
    test.is_true(granted.success)
    local scoped=caller_for(env,replacement)
    local receipt, receipt_err = component.get_identity_receipt(env.automation_id)
    test.is_nil(receipt_err,tostring(receipt_err))
    local selected, select_err = scoped:call(
        "kickside.automation.agent:automations_manage",{action="set_execution_identity",id=env.automation_id,
            principal={kind="user",id=replacement},expected_identity_generation=receipt.identity_generation,request_id=uuid.v7()})
    test.is_nil(select_err,tostring(select_err))
    test.not_nil(selected)
    local current, current_err = component.get_identity_receipt(env.automation_id)
    test.is_nil(current_err,tostring(current_err))
    test.eq(current.principal.id,replacement)
    return replacement,scoped
end

local function prepare(held: Map, key: string): (any?, any)
    return round_write.prepare({drive=held,key=key,hash="payload-hash",prepared=true},
        function(): (any?, any) return {title="original prepared value"},nil end)
end

local function write(held: Map, key: string): Map
    local sink, sink_err = round_write.describe_sink(STORE)
    test.is_nil(sink_err,tostring(sink_err))
    return round_write.write(sink :: Map,{config={},sink_op="upsert",input={title="original prepared value"},
        identity_key=key,idempotency_key=key},held,{item_key=key,dedup_key=key,delivery_key=key})
end

local function writes(key: string): { Map }
    return h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' AND item_key=$1 ORDER BY id",{key})
end

local function run(env: Map, key: string): ()
    local _,run_err=env.run(env.automation_id,key,function(identity: any,target: string,args: any,opts: any): (any?,any)
        return execution_identity.run_as(identity,target,args,opts)
    end)
    test.is_nil(run_err,tostring(run_err))
end

local function legacy_ledger(env: Map, key: string): ()
    h.new_drive({automation_id=env.automation_id,drive_key=key,source_kind="collection",
        action={source_ref="kickside.automation.round.fixture:records",config={items={}},
            schedule={type="interval",expression="30m"}}})
    h.set_drive(env.automation_id,key,"next_run_at=$1,unresolved_count=1",{"2099-01-01T00:00:00Z"})
    local item: Map={item_key="legacy",dedup_key="legacy",op="upsert",payload={directive="observe_identity"},
        attempts=0,delivery_order=1}
    item.delivery_key=round_write.keys({automation_id=env.automation_id,
        source_port="kickside.automation.round.fixture:records",delivery_revision=1},item).idempotency_key
    local db=h.db()
    local tx,begin_err=db:begin()
    test.is_nil(begin_err,tostring(begin_err))
    local _,record_err=ledger.record_tx(tx,env.automation_id,"kickside.automation.round.fixture:records",
        {{item=item,state=ledger.STATE.WAITING,next_attempt_at=h.PAST}},h.PAST,"2099-01-01T00:00:00Z")
    local _,finish_err
    if record_err then _,finish_err=tx:rollback() else _,finish_err=tx:commit() end
    db:release()
    test.is_nil(finish_err,tostring(finish_err))
    test.is_nil(record_err,tostring(record_err))
end

return test.run_cases(function()
    test.describe("original delivery execution identity",function()
        test.it("redelivers unresolved work under its admitted identity after replacement",function()
            local env=h.setup("ledger_provenance")
            local key="unresolved"
            h.new_drive({automation_id=env.automation_id,drive_key=key,source_kind="collection",
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="record",directive="fail_retry"}}},
                    schedule={type="interval",expression="30m"}}})
            h.set_drive(env.automation_id,key,"next_run_at=$1",{h.PAST})
            run(env,key)
            test.eq(h.ledger_row(env.automation_id,"record").state,"retrying")
            local original_history=h.query("SELECT * FROM kickside_automation_delivery_history WHERE automation_id=$1 AND drive_key=$2",{env.automation_id,key})
            test.eq(#original_history,1)
            select_replacement(env)
            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2",{h.PAST,env.automation_id})
            run(env,key)
            local rows=h.log_rows(env.automation_id,key)
            test.eq(#rows,2)
            local retried=json.decode(rows[2].detail_json)
            test.eq(retried.principal.id,env.owner)
            test.eq(retried.actor_id,env.owner)
            test.eq(h.ledger_row(env.automation_id,"record").state,"resolved")
            local retained_history=h.query("SELECT * FROM kickside_automation_delivery_history WHERE automation_id=$1 AND drive_key=$2 ORDER BY round_at,round_token",{env.automation_id,key})
            test.eq(#retained_history,2)
            local kept: Map?=nil
            local resolved: Map?=nil
            for _,record in ipairs(retained_history) do
                if record.round_token == original_history[1].round_token then kept=record else resolved=record end
            end
            test.eq(h.encoded(kept),h.encoded(original_history[1]))
            test.eq(resolved.state,"resolved")
            test.eq(resolved.execution_identity_json,original_history[1].execution_identity_json)
            local evidence,decode_err=json.decode(resolved.execution_identity_json)
            test.is_nil(decode_err,tostring(decode_err))
            test.eq(evidence.identity.principal.id,env.owner)
            test.eq(evidence.identity.authorized_by.id,env.owner)
        end)

        test.it("retries prepared output under its admitted identity after replacement",function()
            local env=h.setup("prepared_provenance")
            local held=stamp(env)
            local key=uuid.v7()
            local first,first_err=prepare(held,key)
            test.is_nil(first_err,tostring(first_err))
            select_replacement(env)
            held=stamp(env)
            local again,again_err=prepare(held,key)
            test.is_nil(again_err,tostring(again_err))
            test.eq(again.title,first.title)
            test.eq(write(held,key).state,"delivered")
            local sent=writes(key)
            test.eq(#sent,1)
            test.eq(json.decode(sent[1].detail_json).actor_id,env.owner)
            test.eq(json.decode(sent[1].detail_json).idempotency_key,key)
        end)

        test.it("parks revoked original prepared authority without substituting the replacement",function()
            local env=h.setup("revoked_prepared_provenance")
            local held=stamp(env)
            local key=uuid.v7()
            local _,first_err=prepare(held,key)
            test.is_nil(first_err,tostring(first_err))
            select_replacement(env)
            h.exec("INSERT INTO round_authority_revocation (principal_id,error_kind) VALUES ($1,'subject')",{env.owner})
            held=stamp(env)
            local _,retry_err=prepare(held,key)
            test.not_nil(retry_err)
            test.is_true(errors.is(retry_err,errors.PERMISSION_DENIED))
            test.eq(retry_err:details().error_kind,"subject")
            test.eq(#writes(key),0)
            test.eq(#h.query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{env.automation_id,key}),1)
        end)

        test.it("retains admission when preparation fails before output persistence",function()
            local env=h.setup("preparation_crash_provenance")
            local held=stamp(env)
            local key=uuid.v7()
            local _,first_err=round_write.prepare({drive=held,key=key,hash="payload-hash",prepared=true},
                function(): (any?,any) return nil,errors.new({kind=errors.UNAVAILABLE,retryable=true,message="preparation stops"}) end)
            test.not_nil(first_err)
            test.eq(#h.query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1",{env.automation_id}),0)
            select_replacement(env)
            held=stamp(env)
            local _,retry_err=prepare(held,key)
            test.is_nil(retry_err,tostring(retry_err))
            test.eq(write(held,key).state,"delivered")
            test.eq(json.decode(writes(key)[1].detail_json).actor_id,env.owner)
        end)

        test.it("keeps historical authority debt parked until explicit resume",function()
            local env=h.setup("historical_park_provenance")
            local key="historical"
            h.new_drive({automation_id=env.automation_id,drive_key=key,source_kind="collection",
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="record",directive="fail_retry"}}},
                    schedule={type="interval",expression="30m"}}})
            h.set_drive(env.automation_id,key,"next_run_at=$1",{h.PAST})
            run(env,key)
            select_replacement(env)
            h.exec("INSERT INTO round_authority_revocation (principal_id,error_kind) VALUES ($1,'subject')",{env.owner})
            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2",{h.PAST,env.automation_id})
            run(env,key)
            test.eq(h.ledger_row(env.automation_id,"record").state,"parked")
            h.exec("DELETE FROM round_authority_revocation WHERE principal_id=$1",{env.owner})
            run(env,key)
            test.eq(h.ledger_row(env.automation_id,"record").state,"parked")
            test.eq(#h.log_rows(env.automation_id,key),1)
            local resumed,resume_err=env.caller:call("kickside.automation.agent:automations_manage",
                {action="control",id=env.automation_id,control="resume",drive_key=key,request_id=uuid.v7()})
            test.is_nil(resume_err,tostring(resume_err))
            test.is_true(resumed.success)
            run(env,key)
            test.eq(h.ledger_row(env.automation_id,"record").state,"resolved")
            local rows=h.log_rows(env.automation_id,key)
            test.eq(#rows,2)
            test.eq(json.decode(rows[2].detail_json).actor_id,env.owner)
        end)

        test.it("requires an audited explicit resolution for changed legacy waiting work",function()
            local env=h.setup("legacy_resolution_provenance")
            legacy_ledger(env,"legacy")
            local replacement,caller=select_replacement(env)
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"parked")
            local current,current_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(current_err,tostring(current_err))
            local request_id=uuid.v7()
            local result,result_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="legacy",keys={"legacy"},
                    request_id=request_id,resolve_identity={identity_generation=current.identity_generation}}})
            test.is_nil(result_err,tostring(result_err))
            test.is_true(result.success)
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"resolved")
            local rows=h.log_rows(env.automation_id,"legacy")
            test.eq(#rows,2)
            test.eq(json.decode(rows[1].detail_json).actor_id,replacement)
            local audit=h.query("SELECT outcome_json FROM kickside_automation_op WHERE automation_id=$1 AND request_id=$2",{env.automation_id,request_id})
            test.eq(#audit,1)
            test.eq(json.decode(audit[1].outcome_json).identity_resolution.identity_generation,current.identity_generation)
            test.eq(json.decode(audit[1].outcome_json).identity_resolution.item_keys[1],"legacy")
            test.eq(json.decode(audit[1].outcome_json).identity_resolution.operator_id,replacement)
            test.eq(json.decode(audit[1].outcome_json).identity_resolution.principal.id,replacement)
        end)

        test.it("resolves only unproven legacy preparation through explicit ADMIN replay",function()
            local env=h.setup("legacy_prepared_resolution")
            local held=stamp(env)
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),h.PAST})
            local replacement,caller=select_replacement(env)
            held=stamp(env)
            local _,refused=prepare(held,key)
            test.not_nil(refused)
            local current,current_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(current_err,tostring(current_err))
            local result,result_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="main",request_id=uuid.v7(),
                    resolve_identity={identity_generation=current.identity_generation,delivery_keys={key}}}})
            test.is_nil(result_err,tostring(result_err))
            test.is_true(result.success)
            held=stamp(env)
            local value,value_err=prepare(held,key)
            test.is_nil(value_err,tostring(value_err))
            test.eq(value.title,"legacy prepared value")
            test.eq(write(held,key).state,"delivered")
            test.eq(json.decode(writes(key)[1].detail_json).actor_id,replacement)
            local _,forbidden_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="main",request_id=uuid.v7(),
                    resolve_identity={identity_generation=current.identity_generation,delivery_keys={key}}}})
            test.not_nil(forbidden_err)
            test.is_true(errors.is(forbidden_err,errors.CONFLICT))
        end)

        test.it("keeps inferred legacy admission immutable across drive controls",function()
            local env=h.setup("legacy_cross_drive_admission")
            local held=stamp(env)
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),h.PAST})
            local value,value_err=prepare(held,key)
            test.is_nil(value_err,tostring(value_err))
            test.eq(value.title,"legacy prepared value")
            h.new_drive({automation_id=env.automation_id,drive_key="other",source_kind="collection",
                action={source_ref="kickside.automation.round.fixture:records",config={items={}},
                    schedule={type="interval",expression="30m"}}})
            local _,caller=select_replacement(env)
            local receipt,receipt_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(receipt_err,tostring(receipt_err))
            local _,resolution_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="other",request_id=uuid.v7(),
                    resolve_identity={identity_generation=receipt.identity_generation,delivery_keys={key}}}})
            test.not_nil(resolution_err)
            test.is_true(errors.is(resolution_err,errors.CONFLICT))
        end)

        test.it("applies authorized legacy resolution to every retained drive journal",function()
            local env=h.setup("legacy_cross_drive_resolution")
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),h.PAST})
            h.new_drive({automation_id=env.automation_id,drive_key="other",source_kind="collection",
                action={source_ref="kickside.automation.round.fixture:records",config={items={}},
                    schedule={type="interval",expression="30m"}}})
            local replacement,caller=select_replacement(env)
            local _,refused=prepare(stamp(env),key)
            test.not_nil(refused)
            test.is_true(errors.is(refused,errors.PERMISSION_DENIED))
            local receipt,receipt_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(receipt_err,tostring(receipt_err))
            local resolved,resolve_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="other",request_id=uuid.v7(),
                    resolve_identity={identity_generation=receipt.identity_generation,delivery_keys={key}}}})
            test.is_nil(resolve_err,tostring(resolve_err))
            test.is_true(resolved.success)
            local held=stamp(env)
            local value,value_err=prepare(held,key)
            test.is_nil(value_err,tostring(value_err))
            test.eq(value.title,"legacy prepared value")
            test.eq(write(held,key).state,"delivered")
            test.eq(json.decode(writes(key)[1].detail_json).actor_id,replacement)
        end)

        test.it("resolves a legacy preparation and its waiting ledger as one delivery",function()
            local env=h.setup("legacy_pair_resolution")
            legacy_ledger(env,"legacy")
            local prior=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='legacy'",{env.automation_id})
            local key=prior[1].identity_key
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),h.PAST})
            local replacement,caller=select_replacement(env)
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"parked")
            local receipt,receipt_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(receipt_err,tostring(receipt_err))
            local resolved,resolve_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="legacy",request_id=uuid.v7(),
                    resolve_identity={identity_generation=receipt.identity_generation,delivery_keys={key}}}})
            test.is_nil(resolve_err,tostring(resolve_err))
            test.is_true(resolved.success)
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"resolved")
            local rows=h.log_rows(env.automation_id,"legacy")
            test.eq(#rows,2)
            test.eq(json.decode(rows[1].detail_json).actor_id,replacement)
        end)

        test.it("preserves inferred legacy preparation after admission settles into the ledger",function()
            local env=h.setup("legacy_pair_immutable")
            local key="legacy"
            h.new_drive({automation_id=env.automation_id,drive_key=key,source_kind="collection",
                applied={sink_port=STORE,replay_safe=false},
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="record",directive="capacity"}}},
                    schedule={type="interval",expression="30m"}}})
            h.set_drive(env.automation_id,key,"next_run_at=$1",{h.PAST})
            run(env,key)
            local prior=h.query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1",{env.automation_id})
            test.eq(#prior,1)
            h.exec("UPDATE kickside_automation_prepared SET execution_identity_json=NULL WHERE automation_id=$1",{env.automation_id})
            h.exec("UPDATE kickside_trigger_item_ledger SET execution_identity_json=NULL,next_attempt_at=$1 WHERE owner_id=$2",{h.PAST,env.automation_id})
            run(env,key)
            test.eq(h.ledger_row(env.automation_id,"record").state,"waiting")
            local owner=caller_for(env,env.owner)
            local replayed,replay_err=owner:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key=key,keys={"record"},request_id=uuid.v7()}})
            test.is_nil(replay_err,tostring(replay_err))
            test.is_true(replayed.success)
            run(env,key)
            test.eq(h.ledger_row(env.automation_id,"record").state,"waiting")
            local _,caller=select_replacement(env)
            local receipt,receipt_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(receipt_err,tostring(receipt_err))
            local _,resolution_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key=key,request_id=uuid.v7(),
                    resolve_identity={identity_generation=receipt.identity_generation,delivery_keys={prior[1].idempotency_key}}}})
            test.not_nil(resolution_err)
            test.is_true(errors.is(resolution_err,errors.CONFLICT))
        end)

        test.it("explicit replay retains prepared output and its original execution identity",function()
            local env=h.setup("explicit_prepared_provenance")
            local key="prepared_replay"
            h.new_drive({automation_id=env.automation_id,drive_key=key,source_kind="collection",
                applied={sink_port=STORE,replay_safe=false},
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="record",directive="capacity"}}},
                    schedule={type="interval",expression="30m"}}})
            h.set_drive(env.automation_id,key,"next_run_at=$1",{h.PAST})
            run(env,key)
            local before=h.query("SELECT idempotency_key,payload_hash,prepared_json FROM kickside_automation_prepared WHERE automation_id=$1",{env.automation_id})
            test.eq(#before,1)
            local _,caller=select_replacement(env)
            local replayed,replay_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key=key,keys={"record"},request_id=uuid.v7()}})
            test.is_nil(replay_err,tostring(replay_err))
            test.is_true(replayed.success)
            run(env,key)
            test.eq(#h.log_rows(env.automation_id,"transform"),1)
            local retained=h.query("SELECT idempotency_key,payload_hash,prepared_json FROM kickside_automation_prepared WHERE automation_id=$1",{env.automation_id})
            test.eq(#retained,1)
            test.eq(retained[1].idempotency_key,before[1].idempotency_key)
            test.eq(retained[1].payload_hash,before[1].payload_hash)
            test.eq(retained[1].prepared_json,before[1].prepared_json)
            local identity=round_write.keys({automation_id=env.automation_id,source_port="kickside.automation.round.fixture:records",delivery_revision=1},
                {item_key="record",dedup_key="record"}).identity_key
            local sent=writes(identity)
            test.eq(#sent,2)
            test.eq(json.decode(sent[2].detail_json).actor_id,env.owner)
        end)

        test.it("continues legacy work admitted after an earlier identity selection",function()
            local env=h.setup("legacy_after_selection")
            local replacement=select_replacement(env)
            local current,current_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(current_err,tostring(current_err))
            test.is_true(current.identity_generation > 0)
            local changed,parse_err=time.parse(time.RFC3339,current.execution_identity.captured_at)
            test.is_nil(parse_err,tostring(parse_err))
            local created=changed:add(time.SECOND):utc():format(time.RFC3339)
            legacy_ledger(env,"legacy")
            h.exec("UPDATE kickside_trigger_item_ledger SET created_at=$1 WHERE owner_id=$2",{created,env.automation_id})
            local held=stamp(env)
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),created})
            local value,value_err=prepare(held,key)
            test.is_nil(value_err,tostring(value_err))
            test.eq(value.title,"legacy prepared value")
            test.eq(write(held,key).state,"delivered")
            test.eq(json.decode(writes(key)[1].detail_json).actor_id,replacement)
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"resolved")
            local rows=h.log_rows(env.automation_id,"legacy")
            test.eq(#rows,2)
            test.eq(json.decode(rows[1].detail_json).actor_id,replacement)
        end)

        for _, mode in ipairs({"equal", "missing"}) do
            test.it("continues legacy rows with " .. mode .. " selection evidence and records inferred provenance",function()
                local env=h.setup("legacy_selection_" .. mode)
                local replacement=select_replacement(env)
                local current,current_err=component.get_identity_receipt(env.automation_id)
                test.is_nil(current_err,tostring(current_err))
                local created=current.identity_selected_at
                test.not_nil(created)
                legacy_ledger(env,"legacy")
                h.exec("UPDATE kickside_trigger_item_ledger SET created_at=$1 WHERE owner_id=$2",{created,env.automation_id})
                local key=uuid.v7()
                h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                    {env.automation_id,key,json.encode({title="legacy prepared value"}),created})
                if mode == "missing" then
                    h.exec("DELETE FROM kickside_execution_identity_audit WHERE component_id=$1 AND identity_generation=$2",
                        {env.automation_id,current.identity_generation})
                end
                local held=stamp(env)
                local value,value_err=prepare(held,key)
                test.is_nil(value_err,tostring(value_err))
                test.eq(value.title,"legacy prepared value")
                local prepared=h.query("SELECT execution_identity_json FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{env.automation_id,key})
                test.eq(#prepared,1)
                local evidence=json.decode(prepared[1].execution_identity_json)
                test.eq(evidence.identity.principal.id,replacement)
                test.eq(evidence.generation,current.identity_generation)
                test.eq(evidence.inferred.created_at,created)
                test.eq(evidence.inferred.reason,mode == "equal" and "selection_not_after_admission" or "selection_audit_missing")
                test.eq(write(held,key).state,"delivered")
                test.eq(json.decode(writes(key)[1].detail_json).actor_id,replacement)
                run(env,"legacy")
                test.eq(h.ledger_row(env.automation_id,"legacy").state,"resolved")
                local retained=h.query("SELECT execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='legacy'",{env.automation_id})
                test.eq(#retained,1)
                local admission=json.decode(retained[1].execution_identity_json)
                test.eq(admission.identity.principal.id,replacement)
                test.eq(admission.inferred.created_at,created)
                test.eq(admission.inferred.reason,evidence.inferred.reason)
                local rows=h.log_rows(env.automation_id,"legacy")
                test.eq(#rows,2)
                test.eq(json.decode(rows[1].detail_json).actor_id,replacement)
            end)
        end

        test.it("blocks legacy work created between identity capture and durable selection",function()
            local env=h.setup("legacy_selection_order")
            select_replacement(env)
            local current,current_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(current_err,tostring(current_err))
            local captured,parse_err=time.parse(time.RFC3339,current.execution_identity.captured_at)
            test.is_nil(parse_err,tostring(parse_err))
            local created=captured:add(time.SECOND):utc():format(time.RFC3339)
            local selected=captured:add(2*time.SECOND):utc():format(time.RFC3339)
            h.exec("UPDATE kickside_execution_identity_audit SET created_at=$1 WHERE component_id=$2 AND identity_generation=$3",
                {selected,env.automation_id,current.identity_generation})
            legacy_ledger(env,"legacy")
            h.exec("UPDATE kickside_trigger_item_ledger SET created_at=$1 WHERE owner_id=$2",{created,env.automation_id})
            local held=stamp(env)
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),created})
            local _,prepare_err=prepare(held,key)
            test.not_nil(prepare_err)
            test.is_true(errors.is(prepare_err,errors.PERMISSION_DENIED))
            test.eq(prepare_err:details().reason,"delivery_identity_unresolved")
            test.eq(#writes(key),0)
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"parked")
            test.eq(#h.log_rows(env.automation_id,"legacy"),0)
        end)

        test.it("uses the first retained admission when legacy preparation is newer than its ledger",function()
            local env=h.setup("legacy_pair_admission_age")
            legacy_ledger(env,"legacy")
            local _,caller=select_replacement(env)
            local current,current_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(current_err,tostring(current_err))
            local selected,parse_err=time.parse(time.RFC3339,current.identity_selected_at)
            test.is_nil(parse_err,tostring(parse_err))
            local retained=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{env.automation_id})
            test.eq(#retained,1)
            local key=retained[1].identity_key
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy paired value"}),selected:add(time.SECOND):utc():format(time.RFC3339)})
            local held=stamp(env)
            held.source_port="kickside.automation.round.fixture:records"
            held.ledger_port=held.source_port
            local _,prepare_err=prepare(held,key)
            test.not_nil(prepare_err)
            test.is_true(errors.is(prepare_err,errors.PERMISSION_DENIED))
            test.eq(prepare_err:details().reason,"delivery_identity_unresolved")
            test.eq(#writes(key),0)
            local resolved,resolve_err=caller:call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="legacy",request_id=uuid.v7(),
                    resolve_identity={identity_generation=current.identity_generation,delivery_keys={key}}}})
            test.is_nil(resolve_err,tostring(resolve_err))
            test.is_true(resolved.success)
            held=stamp(env)
            held.source_port="kickside.automation.round.fixture:records"
            held.ledger_port=held.source_port
            local value,value_err=prepare(held,key)
            test.is_nil(value_err,tostring(value_err))
            test.eq(value.title,"legacy paired value")
        end)

        test.it("refuses a WRITE sharee's legacy identity resolution",function()
            local env=h.setup("legacy_resolution_access")
            legacy_ledger(env,"legacy")
            select_replacement(env)
            run(env,"legacy")
            local sharee="delivery_sharee_" .. uuid.v4():sub(1,8)
            local definition,definition_err=contract.get("kickside.component:component_service")
            test.is_nil(definition_err,tostring(definition_err))
            local actor_bound,actor_err=definition:with_actor(env.actor)
            test.is_nil(actor_err,tostring(actor_err))
            local scoped,scope_err=actor_bound:with_scope(env.scope)
            test.is_nil(scope_err,tostring(scope_err))
            local service,open_err=scoped:open()
            test.is_nil(open_err,tostring(open_err))
            local granted,grant_err=service:grant_subtree({root_component_id=env.automation_id,
                subject={subject_id=sharee,subject_type="user"},access_mask=3})
            test.is_nil(grant_err,tostring(grant_err))
            test.is_true(granted.success)
            local current,current_err=component.get_identity_receipt(env.automation_id)
            test.is_nil(current_err,tostring(current_err))
            local _,resolution_err=caller_for(env,sharee):call("kickside.automation.agent:automations_manage",
                {action="call",id=env.automation_id,method="replay",args={drive_key="legacy",keys={"legacy"},request_id=uuid.v7(),
                    resolve_identity={identity_generation=current.identity_generation}}})
            test.not_nil(resolution_err)
            test.is_true(errors.is(resolution_err,errors.PERMISSION_DENIED))
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"parked")
            test.eq(#h.log_rows(env.automation_id,"legacy"),0)
        end)

        test.it("continues legacy preparation when the identity generation stays unchanged",function()
            local env=h.setup("legacy_prepared_unchanged")
            local held=stamp(env)
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),h.PAST})
            local value,value_err=prepare(held,key)
            test.is_nil(value_err,tostring(value_err))
            test.eq(value.title,"legacy prepared value")
            test.eq(write(held,key).state,"delivered")
            test.eq(json.decode(writes(key)[1].detail_json).actor_id,env.owner)
        end)

        test.it("blocks legacy preparation when identity changes after its creation",function()
            local env=h.setup("legacy_prepared_changed")
            local held=stamp(env)
            local key=uuid.v7()
            h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,$2,'payload-hash',$3,$4)",
                {env.automation_id,key,json.encode({title="legacy prepared value"}),h.PAST})
            select_replacement(env)
            held=stamp(env)
            local _,retry_err=prepare(held,key)
            test.not_nil(retry_err)
            test.is_true(errors.is(retry_err,errors.PERMISSION_DENIED))
            test.eq(retry_err:details().error_kind,"subject")
            test.eq(retry_err:details().reason,"delivery_identity_unresolved")
            test.eq(#writes(key),0)
        end)

        test.it("continues a legacy waiting row when its identity generation stays unchanged",function()
            local env=h.setup("legacy_ledger_unchanged")
            legacy_ledger(env,"legacy")
            run(env,"legacy")
            test.eq(h.ledger_row(env.automation_id,"legacy").state,"resolved")
            local rows=h.log_rows(env.automation_id,"legacy")
            test.eq(#rows,2)
            test.eq(json.decode(rows[1].detail_json).actor_id,env.owner)
        end)

        test.it("parks a legacy waiting row when identity changes after its creation",function()
            local env=h.setup("legacy_ledger_changed")
            legacy_ledger(env,"legacy")
            select_replacement(env)
            run(env,"legacy")
            local row=h.ledger_row(env.automation_id,"legacy")
            test.eq(row.state,"parked")
            test.eq(#h.log_rows(env.automation_id,"legacy"),0)
            local rows=h.query("SELECT error_code FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='legacy'",{env.automation_id})
            test.eq(rows[1].error_code,errors.PERMISSION_DENIED)
        end)
    end)
end)
