local test = require("test")
local supervisor = require("proc_supervisor")
local function replay(signals: { any }): any
    local index = 0
    return {
        count = function() return index end,
        wait = function()
            index = index + 1
            return signals[index] or { kind = "grace_expired" }
        end,
        terminate = function(_pid) end,
    }
end
local opts = {
    interpret_exit = function(result)
        return nil, errors.new({ message = result.error, kind = errors.INTERNAL })
    end,
    timeout_message = "execution deadline",
    cancel_message = "cancelled",
}
local failed = { kind = "exit", from = "child", link_pending = true, result = { error = "child refuses work" } }
return { run = test.run_cases(function()
    test.describe("linked monitored terminal notifications", function()
        test.it("consumes the matching link notification after an error exit", function()
            local hooks = replay({ failed, { kind = "peer_down", from = "other" }, { kind = "peer_down", from = "child" } })
            local output, err = supervisor.supervise_loop(hooks, "child", opts)
            test.is_nil(output)
            test.contains(tostring(err), "child refuses work")
            test.eq(hooks.count(), 3)
        end)
        test.it("does not wait twice when the link notification arrives first", function()
            local hooks = replay({ { kind = "peer_down", from = "child" }, failed })
            local output, err = supervisor.supervise_loop(hooks, "child", opts)
            test.is_nil(output)
            test.contains(tostring(err), "child refuses work")
            test.eq(hooks.count(), 2)
        end)
        test.it("consumes both notifications during termination without changing its cause", function()
            local hooks = replay({ { kind = "timeout" }, failed, { kind = "peer_down", from = "child" } })
            local output, err = supervisor.supervise_loop(hooks, "child", opts)
            test.is_nil(output)
            test.contains(tostring(err), "execution deadline")
            test.eq(hooks.count(), 3)
        end)
    end)
end) }
