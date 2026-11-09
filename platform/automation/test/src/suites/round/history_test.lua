local test = require("test")
local h = require("round_harness")
local json = require("json")
local time = require("time")
local channel = require("channel")
local drive = require("drive")
local claim = require("round_claim")
local automation_db = require("automation_db")

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
            test.it("retains " .. case.directive .. " and authoritative ledger state",function()
                local env=setup({{key="one",directive=case.directive}})
                round(env)
                local rows=history(env.automation_id)
                if case.directive == "skip" then
                    test.eq(#rows,0)
                    test.is_nil(h.ledger_row(env.automation_id,"one"))
                    return
                end
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
                if case.state == "resolved" then test.is_nil(h.ledger_row(env.automation_id,"one"))
                else test.eq(h.ledger_row(env.automation_id,"one").state,case.state) end
                test.eq(next(h.read_drive(env.automation_id,"history").admission),nil)
                local before=h.encoded(rows)
                round(env)
                test.eq(h.encoded(history(env.automation_id)),before,"A round without work rewrites historical evidence")
            end)
        end

        test.it("does not append unchanged skipped items on later scheduled scans",function()
            local env=setup({})
            local function source(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then
                    return {success=true,items={{item_key="unchanged",dedup_key="unchanged",op="upsert",
                        payload={directive="skip"}}},next_cursor={},has_more=false},nil
                end
                return env.run_as(identity,target,args,opts)
            end
            for scan=1,4 do
                h.set_drive(env.automation_id,"history","next_run_at=$1",{h.PAST})
                local _,err=env.run(env.automation_id,"history",source)
                test.is_nil(err,tostring(err))
            end
            test.eq(#history(env.automation_id),0,"skips append no delivery or state transition")
            local before=h.encoded(h.ledger_row(env.automation_id,"unchanged"))
            h.exec("DELETE FROM kickside_automation_delivery_history WHERE automation_id=$1",{env.automation_id})
            h.set_drive(env.automation_id,"history","next_run_at=$1",{h.PAST})
            local _,err=env.run(env.automation_id,"history",source)
            test.is_nil(err,tostring(err))
            test.eq(#history(env.automation_id),0,"history eviction preserves unchanged classification")
            test.eq(h.encoded(h.ledger_row(env.automation_id,"unchanged")),before,"unchanged classifications write no ledger state")
        end)

        test.it("reevaluates a retained skip and records a later delivery of the same identity",function()
            local env=setup({})
            local skip=true
            local function source(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then
                    return {success=true,items={{item_key="filtered",dedup_key="filtered",op="upsert",
                        payload=skip and {directive="skip"} or {}}},next_cursor={},has_more=false},nil
                end
                return env.run_as(identity,target,args,opts)
            end
            for scan=1,2 do
                h.set_drive(env.automation_id,"history","next_run_at=$1",{h.PAST})
                local _,err=env.run(env.automation_id,"history",source)
                test.is_nil(err,tostring(err))
                skip=false
            end
            local rows=history(env.automation_id)
            test.eq(#rows,1)
            test.eq(rows[1].state,"resolved")
            test.is_nil(h.ledger_row(env.automation_id,"filtered"))
        end)

        test.it("retains actual deliveries even when their resolved state repeats",function()
            local env=setup({})
            local function source(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then
                    return {success=true,items={{item_key="delivered",dedup_key="delivered",op="upsert",payload={}}},
                        next_cursor={},has_more=false},nil
                end
                return env.run_as(identity,target,args,opts)
            end
            for scan=1,3 do
                h.set_drive(env.automation_id,"history","next_run_at=$1",{h.PAST})
                local _,err=env.run(env.automation_id,"history",source)
                test.is_nil(err,tostring(err))
            end
            test.eq(#history(env.automation_id),3)
        end)

        test.it("waits for the next cadence when a completed idle pull outlasts its interval",function()
            local env=h.setup("idle_cadence")
            h.new_drive({automation_id=env.automation_id,drive_key="history",source_kind="collection",
                action={source_ref=PORT,config={items={}},schedule={type="interval",expression="1s"}}})
            h.set_drive(env.automation_id,"history","next_run_at=$1",{h.PAST})
            local function slow(identity: any,target: string,args: any,opts: any): (any?,any)
                if target == "kickside.automation:round_acquire" then
                    local delay=time.after("1100ms")
                    channel.select({delay:case_receive()})
                end
                return env.run_as(identity,target,args,opts)
            end
            local _,err=env.run(env.automation_id,"history",slow)
            test.is_nil(err,tostring(err))
            local completed=h.read_drive(env.automation_id,"history")
            local decision_at=drive.utc_now()
            test.is_true(drive.after(completed.next_run_at,decision_at),"an idle pull rearms in the future")
            local decision,claim_err=automation_db.in_tx(function(tx)
                return claim.stamp_tx(tx,env.automation_id,"history",{token=env.last_job.lease_token},decision_at)
            end)
            test.is_nil(claim_err,tostring(claim_err))
            test.eq(decision.state,claim.STATE.IDLE)
            test.eq(decision.rearm,completed.next_run_at)
            test.eq(h.read_drive(env.automation_id,"history").round_seq,completed.round_seq)
            test.eq(#history(env.automation_id),0)
        end)

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
