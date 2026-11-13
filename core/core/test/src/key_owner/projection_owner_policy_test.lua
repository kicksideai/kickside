-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local env = require("env")
local worker = require("worker")

local function owner()
    local value, err = env.get("app:projection_owner_value")
    return {value=value,error=err and tostring(err),actor=security.actor():id()}
end

local function probe()
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
