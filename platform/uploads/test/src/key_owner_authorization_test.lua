-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local uuid=require("uuid")
local security=require("security")
local funcs=require("funcs")
local env=require("env")
local records=require("records")
local sql=require("sql")
local time=require("time")
local tokens=require("tokens")
local types=require("types")
local raw=require("raw")
local http=require("http_probe")
local function probe(args)
    local key,key_err=env.get("ENCRYPTION_KEY")
    local value,err=tokens.pack_read({upload_id=args.id})
    return {value=value,error=err,key_denied=key==nil and key_err~=nil}
end
local function raw_probe(args)
    http.reset()
    raw.raw_handler()
    return {status=http.status,body=http.body}
end
return {probe=probe,raw_probe=raw_probe,run=test.run_cases(function()
    test.describe("read token issuer admission",function()
        local owner,foreign,id,other
        local function call(actor,authority,target,args)
            local scope=security.new_scope({assert(security.policy("app:read_token_probe_call")),
                assert(security.policy("kickside.uploads.security:module_runtime")),
                assert(security.policy("app:read_token_runtime")),
                assert(security.policy("kickside.uploads.security:uploads_resource_access")),
                assert(security.policy(authority))})
            return funcs.new():with_actor(security.new_actor(actor,{})):with_scope(scope)
                :with_context({upload_id=args.id,upload_token=args.token}):call(target,args)
        end
        test.before_all(function()
            owner,foreign,id,other=uuid.v4(),uuid.v4(),uuid.v4(),uuid.v4()
            local db=assert(sql.get("app:db"))
            for _,entry in ipairs({{id=types.component_id_for_owner(owner),actor=owner},{id=types.component_id_for_owner(foreign),actor=foreign}}) do
                assert(db:execute([[INSERT INTO kickside_components(component_id,impl_id,private_context,created_at,updated_at)
                    VALUES($1,'kickside.uploads:uploads_component','{}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{entry.id}))
                assert(db:execute([[INSERT INTO kickside_component_access(access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at)
                    VALUES($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)]],{uuid.v4(),entry.actor,entry.id,entry.id}))
            end
            db:release()
            assert(records.create(id,owner,5,"text/plain","app:uploads",id,"kickside.uploads:types.generic",{},"completed"))
            assert(records.create(other,foreign,5,"text/plain","app:uploads",other,"kickside.uploads:types.generic",{},"completed"))
        end)
        test.it("measures repeated authorized token creation",function()
            local rates={}
            for sample=1,5 do
                local started=time.now()
                for _=1,100 do
                    local value,err=call(owner,"app:read_token_issuer","app:read_token_probe",{id=id})
                    test.is_nil(err,tostring(err));test.not_nil(value.value)
                end
                rates[sample]=100*1000/time.now():sub(started):milliseconds()
            end
            print("UPLOAD_TOKEN_PER_SECOND "..table.concat(rates,","))
        end)
        test.it("refuses minting without upload READ even with exact issuer admission",function()
            local result,err=call(foreign,"app:read_token_issuer","app:read_token_probe",{id=id})
            test.is_nil(err,tostring(err));test.is_true(result.key_denied)
            test.is_nil(result.value);test.not_nil(result.error)
            test.is_true(errors.is(result.error,errors.NOT_FOUND),tostring(result.error))
        end)
        test.it("requires exact issuer admission outside module runtime",function()
            local result,err=call(owner,"app:read_token_empty","app:read_token_probe",{id=id})
            test.is_nil(result);test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
        end)
        test.it("lets the upload owner mint without caller key access",function()
            local result,err=call(owner,"app:read_token_issuer","app:read_token_probe",{id=id})
            test.is_nil(err,tostring(err));test.is_true(result.key_denied)
            test.is_nil(result.error,tostring(result.error));test.not_nil(result.value)
            local value,verify_err=tokens.unpack_read(result.value,{upload_id=id})
            test.is_nil(verify_err,tostring(verify_err));test.eq(value.upload_id,id)
        end)
        test.it("denies raw access when a caller's token names another unreadable upload",function()
            local issued,err=call(foreign,"app:read_token_issuer","app:read_token_probe",{id=other})
            test.is_nil(err,tostring(err));test.not_nil(issued.value)
            local result,raw_err=call(foreign,"app:read_token_issuer","app:read_token_raw_probe",{id=id,token=issued.value})
            test.is_nil(raw_err,tostring(raw_err));test.eq(result.status,404)
        end)
    end)
end)}
