local test = require("test")
local sql = require("sql")
local worker = require("worker")
local fixture = require("fixture")
local sql_fixture = require("sql_fixture")
return {run = test.run_cases(function()
    test.describe("native projection worker dependencies", function()
        for _, stage in ipairs({"query", "decode", "call", "exit", "transport", "direct_exit"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local db, open_err = sql.get("app:db")
                        if open_err then error(open_err) end
                        if not db then error(errors.new({kind = errors.INTERNAL, message = "worker guard has no database", retryable = false})) end
                        local source = errors.new({kind = kind, message = "worker dependency refusal", retryable = options.retryable,
                            details = {code = "worker_dependency", reason = "source_reason", cause = {original = true}, nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        sql_fixture.reset(db, stage, source, 1, {})
                        local result: any = nil
                        local err: any = nil
                        if stage == "query" then
                            result, err = worker.query_event_rows(sql_fixture.database(), "thread", 1, 2, 2, {"event"})
                        elseif stage == "exit" or stage == "transport" or stage == "direct_exit" then
                            result, err = worker.run_proc_supervised({worker_ref = "proc://app:worker", worker_runtime = "proc", target_id = "app:worker"}, {}, {proc_host = "host"})
                        else
                            result, err = worker.run({worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker"}, {})
                        end
                        db:release()
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "worker_dependency")
                        test.eq(err:details().nested.stage, stage)
                        if stage == "call" or stage == "exit" or stage == "transport" or stage == "direct_exit" then
                            test.eq(err:details().reason, worker.WORKER_FAILED)
                            local cause = errors.new(err:details().cause)
                            test.eq(cause:kind(), source:kind())
                            test.eq(cause:retryable(), source:retryable())
                            test.eq(cause:details().reason, "source_reason")
                            test.eq(cause:details().cause.original, true)
                        end
                        test.eq(fixture.calls, (stage == "call" or stage == "decode") and 1 or 0)
                        test.eq(fixture.exits, (stage == "exit" or stage == "transport" or stage == "direct_exit") and 1 or 0)
                        test.eq(fixture.decodes, stage == "decode" and 1 or 0)
                        test.eq(source:details().reason, "source_reason")
                        test.eq(source:details().nested.stage, stage)
                    end)
                end
            end
        end
        for _, payload in ipairs({
            {ok = false, error = "refused", error_kind = "permanent"},
            {ok = false, error_native = "refused"},
            {ok = false, error_native = {kind = "unsupported", message = "refused"}},
        }) do
            test.it("rejects missing or malformed native transport " .. tostring(payload.error_native), function()
                fixture.reset("payload", payload)
                local result, err = worker.run_proc_supervised({worker_ref = "proc://app:worker", worker_runtime = "proc", target_id = "app:worker"}, {}, {proc_host = "host"})
                test.is_nil(result)
                test.eq(err:kind(), errors.INVALID)
                test.is_true(err:retryable() ~= true)
                test.eq(fixture.exits, 1)
            end)
        end
        test.it("retains the projection success output", function()
            fixture.reset("payload", {last_seq = 17, body = {count = 3}})
            local result, err = worker.run_proc_supervised({worker_ref = "proc://app:worker", worker_runtime = "proc", target_id = "app:worker"}, {}, {proc_host = "host"})
            test.is_nil(err)
            test.eq(result.last_seq, 17)
            test.eq(result.body.count, 3)
        end)
        test.it("valid JSON worker output retains normalization", function()
            fixture.reset("", nil)
            local result, err = worker.run({worker_ref = "func://app:worker", worker_runtime = "func", target_id = "app:worker"}, {})
            test.is_nil(err)
            test.eq(type(result), "table")
            test.eq(fixture.calls, 1)
            test.eq(fixture.decodes, 1)
        end)
    end)
end)}
