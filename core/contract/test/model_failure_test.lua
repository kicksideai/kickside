local test = require("test")
local model_failure = require("model_failure")
local http_errors = require("http_errors")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")

local RETRY_COUNTER_TABLE = "contract_model_failure_retry_counter"

local function executor(): any
    local runner_policy, runner_policy_err = security.policy("wippy.test:runner_policy")
    if runner_policy_err or not runner_policy then error("model failure runner policy: " .. tostring(runner_policy_err)) end
    local probe_policy, probe_policy_err = security.policy("app:model_failure_retry_probe_policy")
    if probe_policy_err or not probe_policy then error("model failure probe policy: " .. tostring(probe_policy_err)) end
    local scope, scope_err = security.new_scope({ runner_policy, probe_policy })
    if scope_err or not scope then error("model failure scope: " .. tostring(scope_err)) end
    return funcs.new()
        :with_actor(security.new_actor("model-failure-test", {}))
        :with_scope(scope)
        :with_options({ retry = { max_attempts = 3, initial_delay = 1, jitter = 0 } })
end

local function execute(statement: string, params: { any }?): ()
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("retry counter database unavailable: " .. tostring(db_err)) end
    local _, statement_err = db:execute(statement, params)
    local _, release_err = db:release()
    if statement_err or release_err then error("retry counter statement failed: " .. tostring(statement_err or release_err)) end
end

local function retry_attempts(key: string): integer
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("retry counter database unavailable: " .. tostring(db_err)) end
    local rows, read_err = db:query("SELECT attempts FROM " .. RETRY_COUNTER_TABLE .. " WHERE counter_key=$1", { key })
    local _, release_err = db:release()
    if read_err or release_err then error("retry counter read failed: " .. tostring(read_err or release_err)) end
    if not rows[1] then error("retry counter row is absent for " .. key) end
    return rows[1].attempts
end

local function with_retry_counter(key: string, fn: any): (any?, any?, integer?)
    execute("CREATE TABLE IF NOT EXISTS " .. RETRY_COUNTER_TABLE .. " (counter_key TEXT PRIMARY KEY, attempts INTEGER NOT NULL)")
    execute("DELETE FROM " .. RETRY_COUNTER_TABLE .. " WHERE counter_key=$1", { key })
    local ok, result, err, attempts = pcall(fn)
    local cleanup_ok, cleanup_err = pcall(execute, "DROP TABLE " .. RETRY_COUNTER_TABLE)
    if not cleanup_ok then error("retry counter cleanup failed: " .. tostring(cleanup_err)) end
    if not ok then error(result) end
    return result, err, attempts
end

local function define_tests()
    test.describe("model dependency failures", function()
        test.it("retains request-addressing failures as non-retryable unavailable errors with source details", function()
            for _, kind in ipairs({ errors.INVALID, errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.CONFLICT, errors.ALREADY_EXISTS }) do
                local source = errors.new({ kind = kind, message = "Model failed to return valid JSON", retryable = true,
                    details = { code = "model_response", nested = { request_kind = kind } } })
                local failure = model_failure.wrap("document analysis", source)
                test.is_true(errors.is(failure, errors.UNAVAILABLE), kind)
                test.eq((http_errors.classify(failure)), 503)
                test.contains(tostring(failure), "document analysis failed")
                test.contains(tostring(failure), "Model failed to return valid JSON")
                test.eq(failure:retryable(), false)
                test.eq(failure:details().code, source:details().code)
                test.eq(failure:details().cause.kind, source:kind())
                test.eq(failure:details().cause.message, source:message())
                test.eq(failure:details().cause.retryable, source:retryable())
                test.eq(failure:details().cause.details.code, source:details().code)
                test.eq(failure:details().nested.request_kind, kind)
                test.eq(failure:details().step, "document analysis")
                test.eq(failure:details().cause_kind, kind)
            end
        end)

        test.it("preserves colliding source details below the wrapper cause", function()
            local source = errors.new({ kind = errors.NOT_FOUND, message = "upstream", retryable = true,
                details = { step = "source-step", cause_kind = "source-kind", cause = { request_id = "r-7" } } })
            local failure = model_failure.wrap("wrapper-step", source)
            test.eq(failure:details().step, "wrapper-step")
            test.eq(failure:details().cause_kind, errors.NOT_FOUND)
            test.eq(failure:details().cause.details.step, "source-step")
            test.eq(failure:details().cause.details.cause_kind, "source-kind")
            test.eq(failure:details().cause.details.cause.request_id, "r-7")
        end)

        test.it("retries an explicitly retryable transient model failure through funcs", function()
            local _, err, attempts = with_retry_counter("control", function()
                local result, call_err = executor():call("app:model_failure_retry_probe", { key = "control", mode = "transient" })
                if not errors.is(call_err, errors.UNAVAILABLE) then error("unexpected retry control error: " .. tostring(call_err)) end
                return result, call_err, retry_attempts("control")
            end)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:retryable(), true)
            test.eq(attempts, 3)
        end)

        test.it("does not retry mapped model request failures through funcs", function()
            for _, options in ipairs({ { key = "absent" }, { key = "true", retryable = true } }) do
                local _, err, attempts = with_retry_counter(options.key, function()
                    local result, call_err = executor():call("app:model_failure_retry_probe", options)
                    if not errors.is(call_err, errors.UNAVAILABLE) then error("unexpected mapped error: " .. tostring(call_err)) end
                    return result, call_err, retry_attempts(options.key)
                end)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(attempts, 1)
                test.eq(err:retryable(), false)
            end
        end)

        test.it("keeps the kind and retry flag of an upstream failure", function()
            for _, row in ipairs({ { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.UNAVAILABLE, 503 }, { errors.INTERNAL, 500 } }) do
                local failure = model_failure.wrap("reranking", errors.new({ kind = row[1], message = "upstream", retryable = true }))
                test.is_true(errors.is(failure, row[1]), row[1])
                test.eq((http_errors.classify(failure)), row[2])
                test.contains(tostring(failure), "reranking failed")
                test.contains(tostring(failure), "upstream")
                test.eq(failure:retryable(), true)
            end
        end)

        test.it("preserves absent and false retry metadata through HTTP classification", function()
            for _, kind in ipairs({ errors.RATE_LIMITED, errors.TIMEOUT, errors.UNAVAILABLE,
                errors.INTERNAL, errors.CANCELED, errors.UNKNOWN }) do
                for _, options in ipairs({ {}, { retryable = false }, { retryable = true } }) do
                    local source = errors.new({ kind = kind, message = "upstream", retryable = options.retryable })
                    local failure = model_failure.wrap("dependency", source)
                    local _, classification = http_errors.classify(failure)
                    test.eq(classification.kind, source:kind())
                    test.eq(classification.retryable, source:retryable())
                end
            end
        end)

        test.it("types a failure that carries no error kind as internal and keeps its text", function()
            local failure = model_failure.wrap("answer generation", "model overloaded")
            test.is_true(errors.is(failure, errors.INTERNAL))
            test.contains(tostring(failure), "answer generation failed")
            test.contains(tostring(failure), "model overloaded")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
