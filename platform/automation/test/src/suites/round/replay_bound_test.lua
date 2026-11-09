local test=require("test")
local ledger=require("round_ledger")
local json=require("json")
return test.run_cases(function()
    test.describe("replay history bounds",function()
        test.it("reads a delivery family once regardless of its replay generation and refuses absent evidence",function()
            local calls=0
            local envelope=json.encode({item_key="item",dedup_key="change",attempt_generation=100000})
            local executor={query=function(_,statement,params)
                calls=calls+1
                test.is_true(#params <= 4,"replay history binds grow with replay generation")
                if calls == 1 then return {{item_key="item",attempts=100001,envelope_json=envelope}},nil end
                test.contains(statement,"LIMIT")
                return {},nil
            end}
            local unsent,err=ledger.unsent(executor,{automation_id="owner",source_port="source"},"delivery")
            test.is_nil(err,tostring(err))
            test.is_false(unsent)
            test.eq(calls,2)
        end)
        test.it("refuses absent evidence for a delivery with no counted sink attempt",function()
            local calls=0
            local executor={query=function()
                calls=calls+1
                if calls == 1 then return {{item_key="item",attempts=0,envelope_json=json.encode({item_key="item",dedup_key="change"})}},nil end
                return {},nil
            end}
            local unsent,err=ledger.unsent(executor,{automation_id="owner",source_port="source"},"delivery")
            test.is_nil(err,tostring(err))
            test.is_false(unsent,"missing history never proves the absence of a sink effect")
            test.eq(calls,2)
        end)
        test.it("refuses inference when a delivery family exceeds the bounded evidence window",function()
            local envelope=json.encode({item_key="item",dedup_key="change"})
            local calls=0
            local executor={query=function(_,statement,params)
                calls=calls+1
                if calls == 1 then return {{item_key="item",attempts=0,envelope_json=envelope}},nil end
                local rows={}
                for index=1,10001 do rows[#rows+1]={state="waiting"} end
                return rows,nil
            end}
            local unsent,err=ledger.unsent(executor,{automation_id="owner",source_port="source"},"delivery")
            test.is_nil(err,tostring(err))
            test.is_false(unsent)
            test.eq(calls,2)
        end)

    end)
end)
