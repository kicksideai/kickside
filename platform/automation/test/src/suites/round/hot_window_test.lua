-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local h=require("round_harness")
local history=require("round_history")
local db=require("automation_db")
local uuid=require("uuid")
return test.run_cases(function()
    test.describe("history hot window",function()
        test.it("prunes old and new expiry stamps by age without changing the history schema",function()
            local owner=uuid.v7()
            local old="1000-01-01T00:00:00Z"
            local cutoff="1000-01-02T00:00:00Z"
            for _,key in ipairs({"old-policy","new-policy","live"}) do
                h.exec("INSERT INTO kickside_automation_delivery_history (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at) VALUES ($1,'main',$2,'source',$2,$2,'resolved',$3,$4)",
                    {owner,key,key=="live" and "2099-01-01T00:00:00Z" or old,key=="old-policy" and "2099-01-01T00:00:00Z" or cutoff})
            end
            for expected=2,1,-1 do
                local count,err=db.in_tx(function(tx) return history.prune_tx(tx,cutoff,1) end)
                test.is_nil(err,tostring(err));test.eq(count,1)
                test.eq(#h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1",{owner}),expected)
            end
            local rows=h.query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1",{owner})
            test.eq(rows[1].item_key,"live")
        end)
    end)
end)
