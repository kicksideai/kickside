local test = require("test")
local json = require("json")
local errors = require("errors")
local h = require("round_harness")

type Map = { [string]: any }

return test.run_cases(function()
    test.describe("live authority at effect boundaries", function()
        for _, error_kind in ipairs({"subject", "access", "scope"}) do
            test.it("parks after the first effect when " .. error_kind .. " authority changes", function()
                local env = h.setup("authority_boundary")
                local id = env.automation_id
                h.new_drive({automation_id=id, drive_key="effects", source_kind="collection",
                    applied={sink_port="kickside.automation.round.fixture:store"},
                    action={source_ref="kickside.automation.round.fixture:records",
                        config={items={{key="first",directive="revoke_authority",principal_id=env.owner,error_kind=error_kind}, {key="second"}}},
                        schedule={type="interval",expression="30m"}}})
                h.set_drive(id,"effects","next_run_at=$1",{h.PAST})
                local _, err = env.run(id,"effects")
                test.is_nil(err,tostring(err))
                local d = h.read_drive(id,"effects")
                test.eq(d.phase,error_kind == "subject" and "blocked_identity" or "blocked_access")
                local failure = json.decode(d.last_error_json)
                test.eq(failure.kind,errors.PERMISSION_DENIED)
                test.eq(failure.error_kind,error_kind == "scope" and "access" or error_kind)
                local receipts = h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id})
                test.eq(#receipts,1)
                test.eq(receipts[1].item_key,"first")
                local sent = h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' AND detail_json LIKE $1",{"%" .. id .. "%"})
                test.eq(#sent,1)
                test.eq(h.ledger_row(id,"second").state,"parked")
                test.not_nil(env.last_completion().options.record)
                if error_kind == "access" then
                    h.exec("DELETE FROM round_authority_revocation WHERE principal_id=$1",{env.owner})
                    local resumed,resume_err=env.caller:call("kickside.automation.agent:automations_manage",{action="resume",id=id})
                    test.is_nil(resume_err,tostring(resume_err))
                    test.not_nil(resumed)
                    local _,retry_err=env.run(id,"effects")
                    test.is_nil(retry_err,tostring(retry_err))
                    test.eq(#h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1",{id}),2)
                    test.eq(h.ledger_row(id,"second").state,"resolved")
                end
            end)
        end
        test.it("keeps a completed destination slot when the next slot loses authority",function()
            local env=h.setup("slot_authority")
            local id=env.automation_id
            h.new_drive({automation_id=id,drive_key="slots",source_kind="collection",
                applied={sink_port="kickside.automation.round.fixture:store"},
                action={source_ref="kickside.automation.round.fixture:records",config={items={{key="record",op="delete"}}},schedule={type="interval",expression="30m"}}})
            for _, slot in ipairs({"a","b"}) do
                h.exec("INSERT INTO kickside_automation_receipt (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at) VALUES ($1,$2,'record',$3,$4,$5,$6)",
                    {id,"kickside.automation.round.fixture:records",slot,"slot:"..slot,json.encode({id=slot,revoke_authority=slot == "a" and env.owner or nil}),h.PAST})
            end
            h.set_drive(id,"slots","next_run_at=$1",{h.PAST})
            local _,err=env.run(id,"slots")
            test.is_nil(err,tostring(err))
            test.eq(h.read_drive(id,"slots").phase,"blocked_access")
            local receipts=h.query("SELECT map_slot FROM kickside_automation_receipt WHERE owner_id=$1 ORDER BY map_slot",{id})
            test.eq(#receipts,1)
            test.eq(receipts[1].map_slot,"b")
            test.eq(h.ledger_row(id,"record").state,"parked")
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
