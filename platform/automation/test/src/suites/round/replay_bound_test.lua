-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local ledger=require("round_ledger")
local identity=require("delivery_identity")
local json=require("json")
local drive=require("drive")
type Map = {[string]:any}
return test.run_cases(function()
    test.describe("replay history bounds",function()
        local d={automation_id="owner",source_port="source"}
        local item={item_key="item",dedup_key="change",attempt_generation=100000}
        local key=identity.keys(d,item).idempotency_key
        local function check(attempts: integer,evidence: Map?,event: Map?): (boolean?,any,integer)
            local calls=0
            local envelope={item_key="item",dedup_key="change",attempt_generation=100000,delivery_evidence=evidence}
            local executor={query=function(_,statement,params)
                calls=calls+1
                if calls == 1 then
                    test.contains(statement,"item_key=$3 AND identity_key=$4")
                    return {{attempts=attempts,envelope_json=json.encode(envelope)}},nil
                end
                test.eq(#params,6)
                test.contains(statement,"drive_key=$2 AND round_token=$3")
                return event and {event} or {},nil
            end}
            local result,err=ledger.unsent(executor,d,key)
            return result,err,calls
        end
        local function evidence(at: string): Map
            return {refused_attempts=100001,event={drive_key="main",round_token="first-failure",round_at=at,
                source_port="source",item_key="item",identity_key=key}}
        end
        test.it("reads a delivery summary once regardless of its replay generation and refuses absent evidence",function()
            local result,err,calls=check(100001,evidence(drive.utc_now()),nil)
            test.not_nil(err);test.contains(tostring(err),"predates this version or has aged out");test.is_nil(result);test.eq(calls,2)
        end)
        test.it("refuses absent evidence for a delivery with no counted sink attempt",function()
            local result,err,calls=check(0,nil,nil)
            test.not_nil(err);test.contains(tostring(err),"predates this version or has aged out");test.is_nil(result);test.eq(calls,1)
        end)
        test.it("refuses a capacity wait after a partial effect even with zero counted attempts",function()
            local partial=evidence(drive.utc_now())
            partial.refused_attempts=0
            partial.effects=1
            local result,err,calls=check(0,partial,{state="waiting"})
            test.is_nil(err,tostring(err));test.is_false(result);test.eq(calls,1)
        end)
        test.it("refuses aged summaries and unknown intermediate sink effects with constant reads",function()
            local result,err,calls=check(100001,evidence("2000-01-01T00:00:00Z"),{state="dead"})
            test.not_nil(err);test.contains(tostring(err),"predates this version or has aged out");test.is_nil(result);test.eq(calls,1)
            result,err,calls=check(100002,evidence(drive.utc_now()),{state="dead"})
            test.is_nil(err,tostring(err));test.is_false(result);test.eq(calls,1)
            result,err,calls=check(100001,evidence(drive.utc_now()),{state="dead"})
            test.is_nil(err,tostring(err));test.is_true(result);test.eq(calls,2)
        end)
    end)
end)
