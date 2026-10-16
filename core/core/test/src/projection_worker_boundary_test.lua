local test = require("test")
local worker = require("worker")
return {run = test.run_cases(function()
    test.describe("native live projection worker boundaries", function()
        for _, runtime in ipairs({"func", "proc"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(runtime .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local target = runtime == "func" and "app:test_failing_worker" or "app:projection_native_refusing_proc"
                        local binding = {worker_ref = runtime .. "://" .. target, worker_runtime = runtime, target_id = target}
                        local config = {kind = kind, retryable = options.retryable, message = "live worker refuses",
                            details = {code = "live_worker_refusal", reason = "source_reason", cause = {original = true}, nested = {runtime = runtime}}}
                        local input = {projection = {body = {worker_config = config}}}
                        local result: any = nil
                        local err: any = nil
                        if runtime == "func" then result, err = worker.run(binding, input)
                        else result, err = worker.run_proc_supervised(binding, input, {proc_host = "app:processes"}) end
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), kind)
                        test.eq(err:retryable(), options.retryable)
                        test.eq(err:details().code, "live_worker_refusal")
                        test.eq(err:details().nested.runtime, runtime)
                        test.eq(err:details().reason, worker.WORKER_FAILED)
                        local source = errors.new(err:details().cause)
                        test.eq(source:kind(), kind)
                        test.eq(source:retryable(), options.retryable)
                        test.eq(source:details().code, "live_worker_refusal")
                        test.eq(source:details().reason, "source_reason")
                        test.eq(source:details().cause.original, true)
                    end)
                end
            end
        end
    end)
end)}
