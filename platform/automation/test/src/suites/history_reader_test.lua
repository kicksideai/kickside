local test = require("test")
local uuid = require("uuid")
local json = require("json")
local sql = require("sql")
local cf = require("control_fixture")
local api = require("control_api")

type Map = { [string]: any }
local AT = "2026-10-10T00:00:00Z"

local function encoded(value: any): string
    local text, err = json.encode(value)
    if err then error(tostring(err)) end
    return assert(text)
end

local function execute(statement: string, params: {any}): ()
    local db = cf.open_db()
    local _, err = db:execute(statement, params)
    db:release()
    if err then error(tostring(err)) end
end

local function identity(id: string): Map
    return {version=2,principal={kind="user",id="historical-executor"},
        authorized_by={kind="user",id="historical-authorizer"},component_id=id,captured_at=AT}
end

local function seed(id: string, item: string, evidence: any, fields: Map?): ()
    local f=fields or {}
    execute([[INSERT INTO kickside_automation_delivery_history
        (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,
         execution_identity_json,round_at,expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,'resolved',$7,$8,'2099-01-01T00:00:00Z')]],
        {id,f.drive_key or "main",f.round_token or "round",f.source_port or "source",
         item,f.identity_key or item,evidence == nil and sql.NULL or encoded(evidence),f.round_at or AT})
end

local function engine(id: string, mask: integer?, actor: string?): any
    return cf.engine_with(actor or "reader",cf.component_stub({sets={},access={}},{[id]=mask or 15}),{
        execution_identity={validate=function(value: any): (boolean,error?)
            if type(value) ~= "table" or value.component_id ~= id then
                return false,errors.new({kind=errors.INVALID,message="invalid retained identity"})
            end
            return true,nil
        end},
    })
end

local function read(id: string, opts: Map?): Map
    local page,err=engine(id).history(id,opts or {kind="deliveries"})
    test.is_nil(err,tostring(err))
    return assert(page)
end

local function define_tests()
    test.describe("AUTOMATION-PROTECTED-HISTORY retained facts",function()
        for _,mask in ipairs({0,1,2,3,7}) do
            test.it("refuses non-admin access mask " .. tostring(mask),function()
                local id=uuid.v7()
                local result,err=engine(id,mask).history(id,{kind="deliveries"})
                test.is_nil(result)
                test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            end)
        end
        test.it("requires an authenticated actor even with root ADMIN",function()
            local id=uuid.v7()
            local e=cf.engine_with(nil,cf.component_stub({sets={},access={}},{[id]=15}))
            local result,err=e.history(id,{kind="controls"})
            test.is_nil(result)
            test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
        end)
        test.it("reads the exact historical identity without querying current selection or resolving authority",function()
            local id=uuid.v7()
            local evidence={identity=identity(id),generation=4,prepared_key="delivery"}
            seed(id,"delivery",evidence)
            local component=cf.component_stub({sets={},access={}},{[id]=15})
            component.get_identity_receipt=function() error("current identity is not historical evidence") end
            local e=cf.engine_with("admin",component,{execution_identity={validate=function() return true,nil end,
                resolve=function() error("history does not resolve execution authority") end}})
            local page,err=e.history(id,{kind="deliveries"})
            test.is_nil(err,tostring(err))
            test.eq(#page.entries,1)
            test.eq(encoded(page.entries[1].evidence),encoded(evidence))
            test.eq(page.entries[1].evidence_status,"recorded")
            test.eq(page.entries[1].round_at,AT)
            test.is_nil(page.entries[1].initiation)
        end)
        for _,case in ipairs({{name="absent"},{name="inferred",value={inferred={reason="original_generation"}}},
            {name="unresolved",value={unresolved=true,generation=2}}}) do
            test.it("keeps " .. case.name .. " evidence explicit without replacement",function()
                local id=uuid.v7()
                local evidence=case.value
                if case.name == "inferred" then evidence.identity=identity(id) end
                seed(id,"old",evidence)
                local row=read(id).entries[1]
                test.eq(row.evidence_status,case.name)
                if evidence then test.eq(encoded(row.evidence),encoded(evidence)) else test.is_nil(row.evidence) end
            end)
        end
        test.it("pages every complete tie key once and excludes another root",function()
            local id,other=uuid.v7(),uuid.v7()
            for _,fields in ipairs({{drive_key="a"},{drive_key="b"},{drive_key="b",round_token="z"},
                {drive_key="b",round_token="z",source_port="z"},
                {drive_key="b",round_token="z",source_port="z",identity_key="z"}}) do
                seed(id,"same",nil,fields)
            end
            seed(other,"other",nil)
            local token: string?=nil
            local seen: Map={}
            local count=0
            repeat
                local page=read(id,{kind="deliveries",page_size=1,page_token=token})
                for _,row in ipairs(page.entries) do
                    local key=encoded({row.drive_key,row.round_token,row.source_port,row.item_key,row.identity_key})
                    test.is_nil(seen[key]); seen[key]=true; count=count+1
                    test.eq(row.item_key,"same")
                end
                token=page.next_page_token
            until token == nil
            test.eq(count,5)
        end)
        test.it("continues from a pruned anchor and ignores a newer insertion",function()
            local id=uuid.v7()
            seed(id,"a",nil);seed(id,"b",nil);seed(id,"c",nil)
            local first=read(id,{kind="deliveries",page_size=1})
            test.eq(first.entries[1].item_key,"c")
            execute("DELETE FROM kickside_automation_delivery_history WHERE automation_id=$1 AND item_key=$2",{id,"c"})
            seed(id,"new",nil,{round_at="2026-10-11T00:00:00Z"})
            local next_page=read(id,{kind="deliveries",page_size=2,page_token=first.next_page_token})
            test.eq(#next_page.entries,2)
            test.eq(next_page.entries[1].item_key,"b")
            test.eq(next_page.entries[2].item_key,"a")
            test.is_nil(next_page.next_page_token)
        end)
        test.it("binds cursor root and family and rejects malformed or incomplete tokens",function()
            local id=uuid.v7();seed(id,"a",nil);seed(id,"b",nil)
            local token=read(id,{kind="deliveries",page_size=1}).next_page_token
            for _,opts in ipairs({{kind="controls",page_token=token},{kind="deliveries",page_token="invalid"},
                {kind="deliveries",page_token="{}"},{kind="deliveries",page_token=string.rep("x",20000)},
                {kind="deliveries",page_size=0},{kind="deliveries",page_size=101},
                {kind="deliveries",page_size=1.5},{kind="arbitrary"}}) do
                local result,err=engine(id).history(id,opts)
                test.is_nil(result);test.is_true(errors.is(err,errors.INVALID),tostring(err))
            end
            local other=uuid.v7()
            local result,err=engine(other).history(other,{kind="deliveries",page_token=token})
            test.is_nil(result);test.is_true(errors.is(err,errors.INVALID),tostring(err))
        end)
        test.it("rechecks live ADMIN on every page after reduction",function()
            local id=uuid.v7();seed(id,"a",nil);seed(id,"b",nil)
            local token=read(id,{kind="deliveries",page_size=1}).next_page_token
            local result,err=engine(id,cf.ACCESS.READ).history(id,{kind="deliveries",page_token=token})
            test.is_nil(result);test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
        end)
        test.it("pages retained control actors without private receipts or inferred delivery correlation",function()
            local id=uuid.v7();cf.seed_drive(id,"main")
            local e=engine(id)
            for _,name in ipairs({"first","second"}) do
                local result,err=e.control(id,{control="pause",request_id=name})
                test.is_nil(err,tostring(err));test.eq(result.state,"succeeded")
            end
            local page=read(id,{kind="controls",page_size=1})
            local row=page.entries[1]
            test.eq(row.request_id,"second");test.eq(row.generation,2)
            test.eq(row.initiation.actor_id,"reader")
            test.is_nil(row.kind);test.is_nil(row.target_receipts);test.is_nil(row.digest)
            test.is_nil(row.delivery);test.is_nil(row.execution_identity)
            local second=read(id,{kind="controls",page_size=1,page_token=page.next_page_token})
            test.eq(second.entries[1].request_id,"first");test.is_nil(second.next_page_token)
            execute("UPDATE kickside_automation_op SET target_receipts_json='{}' WHERE automation_id=$1 AND request_id=$2",{id,"first"})
            local old=read(id,{kind="controls",page_size=2}).entries[2]
            test.is_nil(old.initiation)
        end)
        test.it("propagates corrupted retained JSON without substituting current evidence",function()
            local id=uuid.v7();seed(id,"bad",nil)
            execute("UPDATE kickside_automation_delivery_history SET execution_identity_json='broken' WHERE automation_id=$1",{id})
            local result,err=engine(id).history(id,{kind="deliveries"})
            test.is_nil(result);test.not_nil(err)
            execute("UPDATE kickside_automation_delivery_history SET execution_identity_json=$1 WHERE automation_id=$2",{encoded({identity={component_id="wrong"}}),id})
            result,err=engine(id).history(id,{kind="deliveries"})
            test.is_nil(result);test.not_nil(err)
        end)
        test.it("preserves every valid retained JSON error shape without blocking the history page",function()
            local id=uuid.v7();seed(id,"error",nil)
            for _,failure in ipairs({"destination capacity",{message="destination capacity"},42,false,{"first","second"}}) do
                execute("UPDATE kickside_automation_delivery_history SET error_json=$1 WHERE automation_id=$2",{encoded(failure),id})
                local row=read(id).entries[1]
                test.eq(encoded(row.error),encoded(failure))
            end
        end)
        test.it("propagates database failures and releases its connection",function()
            local id=uuid.v7()
            local released=false
            local outage=errors.new({kind=errors.UNAVAILABLE,message="database unavailable"})
            local e=cf.engine_with("admin",cf.component_stub({sets={},access={}},{[id]=15}),{
                sql={get=function() return {query=function() return nil,outage end,
                    release=function() released=true end},nil end}})
            local result,err=e.history(id,{kind="deliveries"})
            test.is_nil(result);test.not_nil(err);test.is_true(released)
        end)
        test.it("preserves authenticated HTTP envelopes and opaque denials",function()
            local calls=0
            local d={automations_lib={history=function(id: string,opts: Map)
                calls=calls+1;test.eq(id,"root");test.eq(opts.kind,"controls");test.eq(opts.page_size,3)
                return {kind="controls",entries={},next_page_token="next"},nil
            end}}
            local code,body=api.history_response(nil,"root",{},d)
            test.eq(code,401);test.eq(calls,0)
            code,body=api.history_response({},"",{},d);test.eq(code,400);test.eq(calls,0)
            code,body=api.history_response({},"root",{kind="controls",page_size="3"},d)
            test.eq(code,200);test.is_true(body.success);test.eq(body.next_page_token,"next")
            d.automations_lib.history=function() return nil,errors.new({kind=errors.PERMISSION_DENIED,message="private detail"}) end
            code,body=api.history_response({},"root",{kind="controls"},d)
            test.eq(code,404);test.eq(body.error.message,"automation not found or access denied")
        end)
    end)
end

local run_cases=test.run_cases(define_tests)
return {run=function(options: any): any return run_cases(options) end}
