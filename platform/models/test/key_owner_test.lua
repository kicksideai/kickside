-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local funcs=require("funcs")
local security=require("security")
local env=require("env")
local owner=require("repo")

local function operation(): any
    local snapshot, reload_err = owner.reload()
    local found, get_err = owner.get_profile("key-owner-profile")
    return {success=snapshot ~= nil and found ~= nil and found.secret_config.api_key=="owner-model-key",
        error=tostring(reload_err or get_err)}
end

local function probe(): any
    local before,before_err=env.get("ENCRYPTION_KEY")
    local result=operation()
    local after,after_err=env.get("ENCRYPTION_KEY")
    result.before_denied=before==nil and before_err~=nil
    result.after_denied=after==nil and after_err~=nil
    return result
end

local function define_tests()
    test.describe("Models key ownership",function()
        test.it("keeps encryption in the owner while the caller cannot read the key",function()
            local created, create_err = owner.create_profile({id="key-owner-profile",name="Key owner profile",provider_id="wippy.llm.openai_compat:provider",api_key="owner-model-key"})
            test.is_nil(create_err,tostring(create_err))
            test.not_nil(created)
            local scope=security.new_scope({assert(security.policy("app:key_owner_caller"))})
            local result,err=funcs.new():with_actor(security.new_actor("member",{})):with_scope(scope):call("app:key_owner_probe")
            local deleted, delete_err=owner.delete_profile("key-owner-profile")
            test.is_true(deleted,tostring(delete_err))
            test.is_nil(err,tostring(err))
            test.is_true(result.before_denied)
            test.is_true(result.after_denied)
            test.is_true(result.success,tostring(result.error))
        end)
    end)
end
return {run=test.run_cases(define_tests),probe=probe}
