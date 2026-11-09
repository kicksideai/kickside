-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")

local function executor(id: string): any
    local policy = assert(security.policy("app:proof_policy"))
    return funcs.new():with_actor(security.new_actor(id, {system = true}))
        :with_scope(assert(security.new_scope({policy})))
end

local function flow(state: string): any
    local result, err = executor("system:blocks-owner"):call("app.blocks_suites:signal_fixture", {state = state})
    test.is_nil(err)
    test.not_nil(result)
    return result
end

local function cases()
    test.describe("Blocks public arm authority", function()
        for _, state in ipairs({"parked", "arming"}) do
            test.it("authorizes the owner while " .. state .. " through the public function", function()
                local args = flow(state)
                local result, err = executor("system:blocks-owner"):call("kickside.blocks:authorize_arm", args)
                test.is_nil(err)
                test.eq(result.authorized, true)
                test.eq(result.dataflow_id, args.dataflow_id)
                test.eq(result.signal_id, args.signal_id)
                test.eq(result.node_id, args.node_id)
            end)
        end

        test.it("refuses another actor even with a forged identity in input", function()
            local args = flow("parked")
            args.actor_id = "system:blocks-owner"
            local result, err = executor("system:intruder"):call("kickside.blocks:authorize_arm", args)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.eq(err:details().code, "BLOCK_ARM_FORBIDDEN")
        end)

        for _, state in ipairs({"declared", "closed"}) do
            test.it("refuses a " .. state .. " signal for arming and resume", function()
                local args = flow(state)
                for _, target in ipairs({"kickside.blocks:authorize_arm", "kickside.blocks:resume", "kickside.blocks:resume_under_identity"}) do
                    local result, err = executor("system:blocks-owner"):call(target, args)
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
                    test.eq(err:details().code, "BLOCK_SIGNAL_NOT_FOUND")
                    test.eq(err:retryable(), false)
                end
            end)
        end

        test.it("refuses an unrelated signal on an owned Flow", function()
            local args = flow("parked")
            args.signal_id = "other"
            local result, err = executor("system:blocks-owner"):call("kickside.blocks:authorize_arm", args)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
            test.eq(err:details().code, "BLOCK_SIGNAL_NOT_FOUND")
        end)

        test.it("returns NOT_FOUND for a missing Flow", function()
            local result, err = executor("system:blocks-owner"):call("kickside.blocks:authorize_arm", {
                dataflow_id = uuid.v4(), signal_id = "review",
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
            test.eq(err:details().code, "BLOCK_FLOW_NOT_FOUND")
        end)
    end)
end
return {run = test.run_cases(cases)}
