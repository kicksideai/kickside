-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local env = require("env")
local worker = require("worker")
local registry = require("registry")
local time = require("time")


local function owner()
    local value, err = env.get("app:projection_owner_value")
    return {value=value,error=err and tostring(err),actor=security.actor():id()}
end

local function probe(args)
    local sql=require("sql")
    if args then
        local before,before_err=env.get("app:projection_owner_cipher_key")
        local binding=assert(worker.parse(args.ref,true))
        local db=assert(sql.get("app:db"))
        local rows=assert(db:query("SELECT actor_id,actor_context FROM kickside_projection WHERE id=$1",{args.id}))
        db:release()
        binding.actor_id=rows[1].actor_id;binding.actor_context=rows[1].actor_context
        local resolved_actor,resolved_scope,resolve_err=worker.resolve_binding_identity(binding)
        assert(not resolve_err,tostring(resolve_err))
        assert(resolved_scope:evaluate(resolved_actor,"env.get","app:projection_owner_cipher_key")~="allow",
            "stored principal scope grants the owner key")
        local value,err
        if binding.worker_runtime=="proc" then
            value,err=worker.run_proc_supervised(binding,{plaintext="stored-owner-secret"},{proc_host="app:processes"})
        else value,err=worker.run(binding,{plaintext="stored-owner-secret"}) end
        local after,after_err=env.get("app:projection_owner_cipher_key")
        return {result=value,error=err,before_denied=before==nil and before_err~=nil,after_denied=after==nil and after_err~=nil}
    end
    local before, before_err = env.get("app:projection_owner_value")
    local binding = assert(worker.parse("func://app:projection_owner_worker", true))
    binding.system_identity = true
    local value, err = worker.run(binding,{})
    local after, after_err = env.get("app:projection_owner_value")
    return {result=value,error=err and tostring(err),
        before_denied=before==nil and before_err~=nil,
        after_denied=after==nil and after_err~=nil}
end

return {owner=owner,probe=probe,run=test.run_cases(function()
    test.describe("projection owner resource policies",function()
        test.it("encrypts through function and process owners using the stored principal",function()
            local sql=require("sql")
            local uuid=require("uuid")
            local execution_identity=require("execution_identity")
            local id=uuid.v7()
            local actor="transition-"..uuid.v7()
            local row=assert(execution_identity.to_row({version=2,principal={kind="user",id=actor},
                authorized_by={kind="user",id=actor},component_id=id,captured_at="2026-01-01T00:00:00Z"}))
            local db=assert(sql.get("app:db"))
            assert(db:execute([[INSERT INTO kickside_components(component_id,impl_id,private_context,created_at,updated_at)
                VALUES($1,'kickside.core:thread','{}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{id}))
            for key,value in pairs({["core_test.principal_state"]="active",["core_test.scope_name"]="app:projection_owner_scope"}) do
                assert(db:execute([[INSERT INTO kickside_component_meta(meta_id,component_id,key,value,created_at,updated_at)
                    VALUES($1,$2,$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{uuid.v7(),id,key,value}))
            end
            assert(db:execute([[INSERT INTO kickside_component_access(access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at)
                VALUES($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)]],{uuid.v7(),actor,id,id}))
            assert(db:execute([[INSERT INTO kickside_thread(id,component_id,thread_class,event_count) VALUES($1,$2,'test',0)]],{id,id}))
            assert(db:execute([[INSERT INTO kickside_projection(id,thread_id,kind,body,actor_id,actor_context,created_at,updated_at)
                VALUES($1,$2,'test','{}',$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{id,id,row.actor_id,row.actor_context}))
            db:release()
            for _,runtime in ipairs({"func","proc"}) do
                local scope=security.new_scope({assert(security.policy("app:projection_owner_caller"))})
                local result,err=funcs.new():with_actor(security.new_actor(actor,{})):with_scope(scope)
                    :call("app:projection_owner_probe",{id=id,ref=runtime.."://app:projection_owner_cipher_"..runtime})
                test.is_nil(err,tostring(err));test.not_nil(result)
                test.is_true(result.before_denied);test.is_true(result.after_denied)
                test.is_nil(result.error,tostring(result.error));test.not_nil(result.result)
                test.eq(result.result.plaintext,"stored-owner-secret")
                test.is_true(result.result.ciphertext~=result.result.plaintext)
                test.eq(result.result.actor,actor)
            end
        end)
        test.it("invalidates admission when an attached policy changes",function()
            local binding=assert(worker.parse("func://app:projection_owner_worker",true))
            test.not_nil((worker.validate(binding)))
            local previous=assert(registry.get("app:projection_owner_environment"))
            local changes=assert(registry.snapshot()):changes()
            local changed=assert(registry.get("app:projection_owner_environment"))
            changed.meta.service_only=false
            changes:update(changed)
            assert(changes:apply())
            local ok,failure=pcall(function()
                local value,err=worker.run(binding,{})
                test.is_nil(value);test.not_nil(err);test.eq(err:kind(),errors.PERMISSION_DENIED)
            end)
            local restore=assert(registry.snapshot()):changes()
            restore:update(previous);assert(restore:apply())
            if not ok then error(failure,0) end
            test.not_nil((worker.validate(binding)))
        end)
        test.it("invalidates admission when the worker declaration changes",function()
            local binding=assert(worker.parse("func://app:projection_owner_worker",true))
            test.not_nil((worker.validate(binding)))
            local previous=assert(registry.get(binding.target_id))
            local changed=assert(registry.get(binding.target_id))
            changed.data.security.actor={id="system:changed-owner"}
            local changes=assert(registry.snapshot()):changes()
            changes:update(changed);assert(changes:apply())
            local ok,failure=pcall(function()
                local value,err=worker.run(binding,{})
                test.is_nil(value);test.not_nil(err);test.eq(err:kind(),errors.PERMISSION_DENIED)
            end)
            local restore=assert(registry.snapshot()):changes()
            restore:update(previous);assert(restore:apply())
            if not ok then error(failure,0) end
            test.not_nil((worker.validate(binding)))
        end)
        test.it("measures admitted projection dispatch",function()
            local binding=assert(worker.parse("func://app:projection_owner_worker",true))
            for _=1,20 do assert(worker.run(binding,{})) end
            local rates={}
            for sample=1,5 do
                local started=time.now()
                for _=1,300 do
                    local admitted=assert(worker.validate(binding))
                    assert(worker.run(admitted,{}))
                end
                rates[sample]=300*1000/time.now():sub(started):milliseconds()
            end
            print("PROJECTION_DISPATCH_PER_SECOND "..table.concat(rates,","))
        end)
        test.it("retains private, actor, member-policy and missing-policy denials",function()
            for _,target in ipairs({"projection_owner_actor","projection_owner_mixed",
                "projection_owner_missing","projection_owner_private"}) do
                local binding=assert(worker.parse("func://app:"..target,true))
                local value,err=worker.validate(binding)
                test.is_nil(value);test.not_nil(err)
                test.eq(err:kind(),target=="projection_owner_missing" and errors.NOT_FOUND or errors.PERMISSION_DENIED)
            end
        end)
        test.it("keeps the actor and grants owner resources only during the worker call",function()
            local scope=security.new_scope({assert(security.policy("app:projection_owner_caller"))})
            local result,err=funcs.new():with_actor(security.new_actor("member",{})):with_scope(scope):call("app:projection_owner_probe")
            test.is_nil(err,tostring(err));test.not_nil(result)
            test.is_nil(result.error,tostring(result.error))
            test.is_true(result.before_denied);test.is_true(result.after_denied)
            test.is_nil(result.result.error)
            test.eq(result.result.value,"owner-resource-value")
            test.eq(result.result.actor,"member")
        end)
    end)
end)}
