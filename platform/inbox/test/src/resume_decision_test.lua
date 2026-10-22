local test = require("test")
local handler = require("resume_decision")
local review_signal = require("review_signal")

type Map = { [string]: any }

local function actor(id: string): any
    return { id = function(): string return id end }
end

local function item(): Map
    return { metadata = { dataflow_id = "df-1", signal_id = "review-1" } }
end

local function reset(): ()
    handler._funcs = nil
    handler._security = nil
    review_signal._dataflow_repo = nil
end

local function installed(observed: Map): ()
    handler._security = {
        actor = function(): any return actor("reviewer-1") end,
        scope = function(): any return { name = "review-scope" } end,
    }
    review_signal._dataflow_repo = {
        get = function(): any return { actor_id = "owner-1" }, nil end,
        get_nodes_for_dataflow = function(): any return {{ node_id = "review-1", type = "kickside.blocks:await", config = { arm_id = "kickside.inbox:arm_decision", block_config = { assignee = "reviewer-1" } } }}, nil end,
    }
    handler._funcs = { new = function(): any
        local executor: any = {}
        function executor:with_actor(value: any): any observed.actor = value; return self end
        function executor:with_scope(value: any): any observed.scope = value; return self end
        function executor:call(target: string, args: any): any
            observed.target, observed.args = target, args
            return { commit_id = "commit-1" }, nil
        end
        return executor, nil
    end }
end

local function run()
    test.describe("Inbox decision completion", function()
        for _, stage in ipairs({"new", "call"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, retryable in ipairs({false, true}) do
                    test.it("preserves native resume " .. stage .. " " .. kind .. " " .. tostring(retryable), function()
                        local observed: Map = {}
                        installed(observed)
                        local source = errors.new({kind = kind, retryable = retryable, message = "native resume refusal",
                            details = {code = "resume_refused", nested = {generation = 7}}})
                        local old_new = handler._funcs.new
                        handler._funcs.new = function(): any
                            if stage == "new" then return nil, source end
                            local executor = old_new()
                            executor.call = function(): any return nil, source end
                            return executor, nil
                        end
                        local result, err = handler.resume({item = item(), action = "approve", form = {reason = "ok"}})
                        reset()
                        test.is_nil(result)
                        test.is_true(errors.is(err, kind), tostring(err))
                        test.eq((err :: any):retryable(), retryable)
                        test.eq((err :: any):details().code, "resume_refused")
                        test.eq((err :: any):details().nested.generation, 7)
                    end)
                end
            end
        end

        test.it("translates a decision action to the canonical Signal payload", function()
            local observed: Map = {}
            installed(observed)
            local result, err = handler.resume({ item = item(), action = "approve", form = { reason = "ok", body = "Corrected draft" } })
            reset()
            test.is_nil(err)
            test.eq((result :: Map).ok, true)
            test.eq((result :: Map).commit_id, "commit-1")
            test.eq(observed.target, "kickside.blocks:resume")
            test.eq(observed.actor:id(), "reviewer-1")
            test.eq((observed.scope :: Map).name, "review-scope")
            test.eq((((observed.args :: Map).payload :: Map).outcome), "approve")
            test.eq(((((observed.args :: Map).payload :: Map).form :: Map).reason), "ok")
            test.eq(observed.args.payload.form.body, "Corrected draft")
            test.is_nil(((observed.args :: Map).payload :: Map).action)
        end)

        test.it("refuses a forged card for a signal assigned to another reviewer", function()
            local observed: Map = {}
            installed(observed)
            review_signal._dataflow_repo.get_nodes_for_dataflow = function(): any
                return {{ node_id = "review-1", type = "kickside.blocks:await", config = { arm_id = "kickside.inbox:arm_decision", block_config = { assignee = "other-reviewer" } } }}, nil
            end
            local result, err = handler.resume({ item = item(), action = "approve" })
            reset()
            test.is_nil(result)
            test.contains(tostring(err), "review signal access denied")
            test.is_nil(observed.target)
        end)

        test.it("rejects non-decision actions before invoking Blocks", function()
            local calls = 0
            review_signal._dataflow_repo = {
        get = function(): any return { actor_id = "owner-1" }, nil end,
        get_nodes_for_dataflow = function(): any return {{ node_id = "review-1", type = "kickside.blocks:await", config = { arm_id = "kickside.inbox:arm_decision", block_config = { assignee = "reviewer-1" } } }}, nil end,
    }
    handler._funcs = { new = function(): any calls = calls + 1; return nil end }
            local result, err = handler.resume({ item = item(), action = "dismiss" })
            reset()
            test.is_nil(result)
            test.contains(tostring(err), "approve or reject")
            test.eq(calls, 0)
        end)
    end)
end

return { run = test.run_cases(run) }
