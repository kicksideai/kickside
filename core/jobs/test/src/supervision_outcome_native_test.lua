local test = require("test")
local supervisor = require("supervisor")
local function replay(signals)
    local index, terminated = 0, 0
    return {wait = function()
        index = index + 1
        return signals[index] or {kind = "grace_expired"}
    end, terminate = function() terminated = terminated + 1 end,
        count = function() return index, terminated end}
end
local function options(primary)
    return {interpret_exit = function(value) return primary and nil or value, primary end,
        timeout_message = "execution ceiling", cancel_message = "execution cancelled", crash_message = "child crash",
        terminate_grace_ms = 2000}
end
return {run = test.run_cases(function()
    test.describe("typed supervision outcomes", function()
        for _, route in ipairs({{signal = "timeout", kind = errors.TIMEOUT, code = "job_execution_timeout"},
            {signal = "cancel", kind = errors.CANCELED, code = "job_execution_cancelled", control = "shutdown"},
            {signal = "heartbeat_lost", kind = errors.UNAVAILABLE, code = "job_execution_heartbeat_lost", control = "shutdown"}}) do
            test.it(route.signal .. " confirmed termination", function()
                local hooks = replay({{kind = route.signal}, {kind = "exit", from = "child"}})
                local output, err, control = supervisor.supervise_loop(hooks, "child", options(nil))
                test.is_nil(output); test.eq(control, route.control); test.is_true(errors.is(err, route.kind))
                test.is_false(err:retryable()); test.eq(err:details().code, route.code)
                local waits, terminated = hooks.count(); test.eq(waits, 2); test.eq(terminated, 1)
            end)
        end
        for _, signal in ipairs({"timeout", "peer_down", "exit"}) do
            test.it(signal .. " interrupted confirmation", function()
                local first = signal == "exit" and {kind = "exit", from = "child", link_pending = true, result = {}}
                    or {kind = signal, from = "child"}
                local hooks = replay({first, {kind = "cancel"}})
                local output, err, control = supervisor.supervise_loop(hooks, "child", options(nil))
                test.is_nil(output); test.eq(control, "shutdown"); test.is_true(errors.is(err, errors.CANCELED))
                test.is_false(err:retryable()); test.eq(err:details().code, "job_execution_cancelled")
                local waits, terminated = hooks.count(); test.eq(waits, 2); test.eq(terminated, signal == "timeout" and 1 or 0)
            end)
        end
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("unconfirmed exit preserves cause/" .. kind .. "/" .. tostring(opts.retryable), function()
                    local primary = errors.new({kind = kind, message = "execution refusal", retryable = opts.retryable,
                        details = {code = "execution_cause", nested = {marker = "kept"}}})
                    local hooks = replay({{kind = "exit", from = "child", link_pending = true, result = {}}, {kind = "grace_expired"}})
                    local output, err, control = supervisor.supervise_loop(hooks, "child", options(primary))
                    test.is_nil(output); test.eq(control, "termination_unconfirmed"); test.is_true(errors.is(err, errors.CONFLICT))
                    test.is_false(err:retryable()); test.eq(err:details().code, "job_execution_unconfirmed")
                    local cause = err:details().operation_error
                    test.eq(cause.kind, primary:kind()); test.eq(cause.retryable, primary:retryable())
                    test.eq(cause.details.code, "execution_cause"); test.eq(cause.details.nested.marker, "kept")
                    local waits, terminated = hooks.count(); test.eq(waits, 2); test.eq(terminated, 0)
                end)
            end
        end
        test.it("successful exit remains", function()
            local hooks = replay({{kind = "exit", result = {ok = true}}})
            local output, err, control = supervisor.supervise_loop(hooks, "child", options(nil))
            test.is_true(output.ok); test.is_nil(err); test.is_nil(control)
            local waits, terminated = hooks.count(); test.eq(waits, 1); test.eq(terminated, 0)
        end)
    end)
end)}
