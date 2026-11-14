-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local funcs=require("funcs")
local security=require("security")
local env=require("env")
local contract=require("contract")
local sql=require("sql")
local uuid=require("uuid")
local json=require("json")
local repo=require("oauth_repo")

local function execute(statement,args)
    local db=assert(sql.get("app:db"))
    local result,err=db:execute(statement,args)
    db:release()
    test.is_nil(err,tostring(err))
    return result
end

local function probe(args)
    local before,before_err=env.get("ENCRYPTION_KEY")
    local definition=assert(contract.get("kickside.oauth.runtime:connection"))
    local instance=assert(definition:open())
    local result,err=instance:get_config({component_id=args.id})
    local after,after_err=env.get("ENCRYPTION_KEY")
    return {result=result,error=err and tostring(err),kind=err and err:kind(),
        before_denied=before==nil and before_err~=nil,after_denied=after==nil and after_err~=nil}
end

local function define()
    test.describe("OAuth key ownership",function()
        local id=uuid.v7()
        local owner="key-owner-member"
        local function call(actor)
            local scope=security.new_scope({assert(security.policy("app:key_owner_caller"))})
            local result,err=funcs.new():with_actor(security.new_actor(actor,{})):with_scope(scope):call("app:key_owner_probe",{id=id})
            test.is_nil(err,tostring(err));test.not_nil(result)
            test.is_true(result.before_denied);test.is_true(result.after_denied)
            return result
        end
        test.before_all(function()
            execute([[INSERT INTO kickside_components(component_id,impl_id,private_context,created_at,updated_at) VALUES($1,'kickside.oauth:oauth_connection','{}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{id})
            execute([[INSERT INTO kickside_component_access(access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES($1,$2,'user',$3,$4,1,CURRENT_TIMESTAMP)]],{uuid.v7(),owner,id,id})
            local created,err=repo.create_connection(id,{provider="key-owner",connection_name="Key owner fixture",connection_state="connected",
                tokens={access_token="owner-private-access",refresh_token="owner-private-refresh"},client_credentials={client_secret="owner-private-client"},
                provider_specific={endpoint_url="https://fixture.example.test/mcp"}})
            test.is_nil(err,tostring(err));test.not_nil(created)
        end)
        test.after_all(function()
            for _,name in ipairs({"kickside_oauth_connections","kickside_component_access","kickside_component_meta","kickside_components"}) do
                execute("DELETE FROM "..name.." WHERE component_id=$1",{id})
            end
        end)
        test.it("decrypts through OAuth while the admitted caller has no key grant",function()
            local response=call(owner)
            test.is_nil(response.error,tostring(response.error))
            test.eq(response.result.provider,"key-owner")
            test.eq(response.result.config.endpoint_url,"https://fixture.example.test/mcp")
            local encoded=assert(json.encode(response.result))
            for _,value in ipairs({"owner-private-access","owner-private-refresh","owner-private-client"}) do
                test.is_nil((encoded:find(value,1,true)))
            end
        end)
        test.it("retains resource denial without granting a stranger the key",function()
            local response=call("key-owner-stranger")
            test.is_nil(response.result)
            test.eq(response.kind,errors.PERMISSION_DENIED)
        end)
    end)
end
return {run=test.run_cases(define),probe=probe}
