local test = require("test")
local json = require("json")
local errors = require("errors")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")
local h = require("round_harness")
local execution_identity = require("execution_identity")

type Map = { [string]: any }

local function sent(id: string): integer
    return #h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' AND detail_json LIKE $1",{"%" .. id .. "%"})
end

local function run(env: Map, drive_key: string): ()
    h.set_drive(env.automation_id,drive_key,"next_run_at=$1",{h.PAST})
    local _,err=env.run(env.automation_id,drive_key,execution_identity.run_as)
    test.is_nil(err,tostring(err))
end

local function resolves(principal_id: string): integer
    return #h.query("SELECT principal_id FROM round_resolver_call WHERE principal_id=$1",{principal_id})
end

return test.run_cases(function()
    test.describe("authority at round start", function()
        for _, error_kind in ipairs({"subject", "access", "scope"}) do
            test.it("finishes the page and parks the next round when " .. error_kind .. " authority changes", function()
                local env = h.setup("authority_boundary")
                local id = env.automation_id
                h.new_drive({automation_id=id, drive_key="effects", source_kind="collection",
                    applied={sink_port="kickside.automation.round.fixture:store"},
                    policy={round={page_size=2}},
                    action={source_ref="kickside.automation.round.fixture:records",
                        config={items={{key="first",directive="revoke_authority",principal_id=env.owner,error_kind=error_kind},
                            {key="retried",directive="timeout"},{key="third"}}},
                        schedule={type="interval",expression="30m"}}})
                run(env,"effects")
                test.eq(h.read_drive(id,"effects").phase,"active")
                test.eq(sent(id),2)
                test.eq(h.ledger_row(id,"retried").state,"retrying")
                h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND item_key='retried'",{h.PAST,id})
                run(env,"effects")
                local d = h.read_drive(id,"effects")
                test.eq(d.phase,error_kind == "subject" and "blocked_identity" or "blocked_access")
                local failure = json.decode(d.last_error_json)
                test.eq(failure.kind,errors.PERMISSION_DENIED)
                test.eq(failure.error_kind,error_kind == "scope" and "access" or error_kind)
                local receipts = h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})
                test.eq(#receipts,1)
                test.eq(receipts[1].item_key,"first")
                test.eq(sent(id),2)
                test.eq(h.ledger_row(id,"retried").state,"parked")
                test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='third'",{id}),0)
                test.not_nil(env.last_completion().options.record)
                h.exec("DELETE FROM round_authority_revocation WHERE principal_id=$1",{env.owner})
                local resumed,resume_err=env.caller:call("kickside.automation.agent:automations_manage",{action="resume",id=id})
                test.is_nil(resume_err,tostring(resume_err))
                test.not_nil(resumed)
                local resumed_drive = h.read_drive(id,"effects")
                test.eq(resumed_drive.phase,"active")
                test.is_true(resumed_drive.enabled)
                test.eq(resumed_drive.cursor,d.cursor)
                test.eq(resumed_drive.event_seq,d.event_seq)
                run(env,"effects")
                test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id}),2)
                test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='third'",{id}),1)
            end)
        end
        test.it("writes every destination slot of the page and blocks the next round after a revocation",function()
            local env=h.setup("slot_authority")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="slots",source_kind="collection",
                applied={sink_port="kickside.automation.round.fixture:store"},
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="record",op="delete"}}},schedule={type="interval",expression="30m"}}})
            for _, slot in ipairs({"a","b"}) do
                h.exec("INSERT INTO kickside_automation_receipt (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at) VALUES ($1,$2,'record',$3,$4,$5,$6)",
                    {id,"kickside.automation.round.fixture:records",slot,"slot:"..slot,json.encode({id=slot,revoke_authority=slot == "a" and env.owner or nil}),h.PAST})
            end
            run(env,"slots")
            test.eq(h.read_drive(id,"slots").phase,"active")
            test.eq(#h.query("SELECT map_slot FROM kickside_automation_receipt WHERE owner_id=$1",{id}),0)
            run(env,"slots")
            test.eq(h.read_drive(id,"slots").phase,"blocked_access")
        end)
        test.it("resolves one identity once per acquisition and once per delivery, whatever the page holds",function()
            local env=h.setup("authority_count")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="effects",source_kind="collection",
                applied={sink_port="kickside.automation.round.fixture:store"},
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="a"},{key="b"},{key="c"},{key="d"},{key="e"}}},schedule={type="interval",expression="30m"}}})
            h.exec("DELETE FROM round_resolver_call WHERE principal_id=$1",{env.owner})
            run(env,"effects")
            test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id}),5)
            test.eq(resolves(env.owner),2)
        end)
        test.it("parks an event round whose source thread refuses the principal with its typed access refusal",function()
            local env=h.setup("event_source_access")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="events",source_kind="event",source_thread_id=env.thread_id,
                action={source_ref="fixture:events",event_type=h.EVENT_TYPE}})
            env.append("refused")
            local outsider=security.new_actor("event_source_outsider_"..uuid.v4():sub(1,8),{security_groups={"automation_test"}})
            local outsider_caller=funcs.new():with_actor(outsider):with_scope(env.scope)
            h.set_drive(id,"events","next_run_at=$1",{h.PAST})
            local _,err=env.run(id,"events",function(_identity: any,target: string,args: any): (any?,any)
                return outsider_caller:call(target,args)
            end)
            test.is_nil(err,tostring(err))
            local d=h.read_drive(id,"events")
            test.eq(d.phase,"blocked_access")
            local failure=json.decode(d.last_error_json)
            test.eq(failure.kind,errors.PERMISSION_DENIED)
            test.eq(failure.error_kind,"access")
            test.eq(#h.log_rows(id,"events"),0)
        end)
        test.it("runs both effects when authority stays live",function()
            local env = h.setup("authority_unchanged")
            local id = env.automation_id
            h.new_drive({automation_id=id,drive_key="effects",source_kind="collection",
                applied={sink_port="kickside.automation.round.fixture:store"},
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="first"},{key="second"}}},schedule={type="interval",expression="30m"}}})
            h.set_drive(id,"effects","next_run_at=$1",{h.PAST})
            local _, err=env.run(id,"effects")
            test.is_nil(err,tostring(err))
            test.eq(h.read_drive(id,"effects").phase,"active")
            test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id}),2)
        end)
    end)
end)
