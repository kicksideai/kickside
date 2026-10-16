local test = require("test")
local h = require("round_harness")
local json = require("json")

type Map = { [string]: any }
local PORT = "kickside.automation.round.fixture:records"

local function history(id: string): {Map}
    return h.query("SELECT * FROM kickside_automation_delivery_history WHERE automation_id=$1 ORDER BY round_at,round_token,source_port,item_key,identity_key", {id})
end

local function setup(items: {Map}): Map
    local env = h.setup("delivery_history")
    h.new_drive({automation_id=env.automation_id,drive_key="history",source_kind="collection",
        action={source_ref=PORT,config={items=items},schedule={type="interval",expression="1h"}}})
    h.set_drive(env.automation_id,"history","next_run_at=$1",{h.PAST})
    return env
end

local function round(env: Map): ()
    local _,err=env.run(env.automation_id,"history")
    test.is_nil(err,tostring(err))
end

local function define_tests()
    test.describe("AUTOMATION-DELIVERY-HISTORY committed admission evidence",function()
        for _,case in ipairs({{directive="observe_identity",state="resolved"},
            {directive="skip",state="resolved"},{directive="fail_dead",state="dead"},
            {directive="fail_always",state="retrying"},{directive="wait",state="waiting"},
            {directive="uncertain",state="uncertain"}}) do
            test.it("retains " .. case.directive .. " without changing ledger behavior",function()
                local env=setup({{key="one",directive=case.directive}})
                round(env)
                local rows=history(env.automation_id)
                test.eq(#rows,1)
                test.eq(rows[1].state,case.state)
                test.eq(rows[1].drive_key,"history")
                test.eq(rows[1].source_port,PORT)
                test.eq(rows[1].item_key,"one")
                test.eq(rows[1].round_at,h.read_drive(env.automation_id,"history").last_round_at)
                test.not_nil(rows[1].round_token)
                test.not_nil(rows[1].identity_key)
                test.is_true(rows[1].expires_at > rows[1].round_at)
                local admitted,decode_err=json.decode(rows[1].execution_identity_json)
                test.is_nil(decode_err,tostring(decode_err))
                test.eq(admitted.identity.principal.id,env.owner)
                test.eq(admitted.identity.authorized_by.id,env.owner)
                test.is_nil(admitted.inferred)
                if case.state == "resolved" then
                    test.eq(#h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{env.automation_id}),0)
                else
                    test.eq(h.ledger_row(env.automation_id,"one").state,case.state)
                end
                test.eq(next(h.read_drive(env.automation_id,"history").admission),nil)
                local before=h.encoded(rows)
                round(env)
                test.eq(h.encoded(history(env.automation_id)),before,"A round without work rewrites historical evidence")
            end)
        end

        test.it("appends a retry outcome without rewriting its original admission or first failure",function()
            local env=setup({{key="retry",directive="fail_retry"}})
            round(env)
            local first=history(env.automation_id)
            test.eq(#first,1)
            test.eq(first[1].state,"retrying")
            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2",{h.PAST,env.automation_id})
            round(env)
            local rows=history(env.automation_id)
            test.eq(#rows,2)
            local retained: Map?=nil
            local resolved: Map?=nil
            for _,row in ipairs(rows) do
                if row.round_token == first[1].round_token then retained=row else resolved=row end
            end
            test.eq(h.encoded(retained),h.encoded(first[1]))
            test.eq(resolved.state,"resolved")
            test.eq(resolved.execution_identity_json,first[1].execution_identity_json)
            test.eq(resolved.identity_key,first[1].identity_key)
            test.eq(h.ledger_row(env.automation_id,"retry").state,"resolved")
        end)

        test.it("keeps history isolated by automation even when source and item keys match",function()
            local first=setup({{key="shared"}})
            local second=setup({{key="shared"}})
            round(first);round(second)
            for _,env in ipairs({first,second}) do
                local rows=history(env.automation_id)
                test.eq(#rows,1)
                local admitted,decode_err=json.decode(rows[1].execution_identity_json)
                test.is_nil(decode_err,tostring(decode_err))
                test.eq(admitted.identity.principal.id,env.owner)
            end
        end)
    end)
end

local run_cases=test.run_cases(define_tests)
return {run=function(options: any): any return run_cases(options) end}
