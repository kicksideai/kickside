-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local subject = require("subject")
local fixture = require("fixture")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")

local function cases()
    test.describe("Blocks resume native errors", function()
        for index, row in ipairs({{}, {value = false}, {value = 7}, {value = "invalid"}}) do
            test.it("rejects malformed handler result case " .. index, function()
                fixture.state = {metadata = {run_id = "run", resume_handler = "app:handler"}, handler_result = row.value}
                local result, err = subject.resume({dataflow_id = "flow", signal_id = "signal"})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                test.eq(err:details().code, "BLOCK_SIGNAL_RESULT_INVALID")
                test.eq(err:retryable(), false)
            end)
        end

        test.it("keeps a valid handler result", function()
            fixture.state = {metadata = {run_id = "run", resume_handler = "app:handler"},
                handler_result = {ok = true, commit_id = "handler-commit"}}
            local result, err = subject.resume({dataflow_id = "flow", signal_id = "signal"})
            test.is_nil(err)
            test.eq(result.ok, true)
            test.eq(result.commit_id, "handler-commit")
        end)

        test.it("returns INVALID with stable codes for missing identifiers", function()
            for _, row in ipairs({ {{}, "BLOCK_DATAFLOW_ID_REQUIRED"}, {{dataflow_id = "flow"}, "BLOCK_SIGNAL_ID_REQUIRED"} }) do
                local result, err = subject.resume(row[1])
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.eq(err:details().code, row[2])
                test.eq(err:retryable(), false)
            end
        end)

        for _, stage in ipairs({"get", "identity", "call", "handler"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.TIMEOUT}) do
                test.it("preserves " .. stage .. " " .. kind, function()
                    local source = errors.new({ kind = kind, retryable = true, message = "opaque dependency failure",
                        details = { code = "SOURCE_CODE", marker = 17 } })
                    local policy = assert(security.policy("app:proof_policy"))
                    fixture.state = { stage = stage, failure = source,
                        actor = security.new_actor("blocks-owner", {}), scope = assert(security.new_scope({policy})) }
                    if stage == "handler" then fixture.state.metadata = {run_id = "run", resume_handler = "app:handler"} end
                    local result, err = subject.resume({dataflow_id = "flow", signal_id = "signal"})
                    test.is_nil(result)
                    test.is_true(errors.is(err, kind), tostring(err))
                    test.eq(err:retryable(), true)
                    test.eq(err:details().marker, 17)
                    test.eq(err:details().code, "SOURCE_CODE")
                end)
            end
        end

        for _, stage in ipairs({"new", "signal", "pending"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.TIMEOUT, errors.RATE_LIMITED, "WorkflowTerminal"}) do
                for _, retryable in ipairs({false, true}) do
                    test.it("preserves delivery " .. stage .. " " .. kind .. " " .. tostring(retryable), function()
                        fixture.state = {stage = stage, actor = security.actor(),
                            failure = errors.new({kind = kind, retryable = retryable, message = "opaque delivery failure",
                                details = {code = "DELIVERY_CODE", nested = {value = 9}}})}
                        local result, err = subject.resume_under_identity({dataflow_id = "flow", signal_id = "signal"})
                        test.is_nil(result)
                        test.is_true(errors.is(err, kind), tostring(err))
                        test.eq(err:retryable(), retryable)
                        test.eq(err:details().code, "DELIVERY_CODE")
                        test.eq(err:details().nested.value, 9)
                    end)
                end
            end
        end

        test.it("keeps legacy transport errors retryable without inspecting their text", function()
            fixture.state = {stage = "signal", actor = security.actor(), failure = "opaque legacy transport failure"}
            local result, err = subject.resume_under_identity({dataflow_id = "flow", signal_id = "signal"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(err:retryable(), true)
            test.eq(err:details().code, "BLOCK_SIGNAL_FAILED")
        end)

        for _, stage in ipairs({"identity", "handler"}) do
            test.it("keeps the destination open after dependency NOT_FOUND from " .. stage, function()
                local args, create_err = funcs.call("app.blocks_suites:signal_fixture", {state = "parked"})
                test.is_nil(create_err)
                fixture.state = {stage = stage, dataflow_id = args.dataflow_id, failure = errors.new({kind = errors.NOT_FOUND,
                    retryable = false, message = "dependency missing", details = {code = "DEPENDENCY_NOT_FOUND"}})}
                if stage == "handler" then fixture.state.metadata = {run_id = "run", resume_handler = "app:handler"} end
                local result, err = subject.resume(args)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
                test.eq(err:details().code, "DEPENDENCY_NOT_FOUND")
                local authorization, arm_err = funcs.call("kickside.blocks:authorize_arm", args)
                test.is_nil(arm_err)
                test.eq(authorization.authorized, true)
                test.eq(authorization.node_id, args.node_id)
            end)
        end

        test.it("keeps the resume success shape", function()
            fixture.state = {actor = security.actor()}
            local result, err = subject.resume_under_identity({dataflow_id = "flow", signal_id = "signal", payload = {ok = true}})
            test.is_nil(err)
            test.eq(result.ok, true)
            test.eq(result.dataflow_id, "flow")
            test.eq(result.signal_id, "signal")
            test.eq(result.commit_id, "commit-1")
        end)

        test.it("classifies a legacy invalid execution frame without message matching", function()
            fixture.state = {stage = "identity", failure = "opaque legacy frame failure"}
            local result, err = subject.resume({dataflow_id = "flow", signal_id = "signal"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.eq(err:details().code, "BLOCK_FLOW_IDENTITY_INVALID")
            test.eq(err:retryable(), false)
        end)

        test.it("returns native NOT_FOUND for a missing Flow across funcs", function()
            local result, err = funcs.call("kickside.blocks:resume", {dataflow_id = uuid.v4(), signal_id = "gone"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
            test.eq(err:details().code, "BLOCK_FLOW_NOT_FOUND")
            test.eq(err:retryable(), false)
        end)
    end)
end
return {run = test.run_cases(cases)}
