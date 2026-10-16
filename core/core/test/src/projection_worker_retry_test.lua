local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local worker = require("worker")
local clock = require("clock")
local function database(): any
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, message = "retry guard has no database", retryable = false})) end
    return db
end
return {run = test.run_cases(function()
    test.describe("one projection invocation owns one durable effect", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local id = uuid.v7()
                    local db = database()
                    local dialect, dialect_err = db:type()
                    if dialect_err then db:release(); error(dialect_err) end
                    local _, insert_err = sql.builder.insert("kickside_thread"):set_map({id = id,
                        thread_class = "test", component_id = id, event_count = 0,
                        last_event_ts = clock.now(dialect)}):run_with(db):exec()
                    db:release()
                    if insert_err then error(insert_err) end
                    local result, err = worker.run({worker_ref = "func://app:projection_retry_effect",
                        worker_runtime = "func", target_id = "app:projection_retry_effect"}, {
                        thread_id = id, kind = kind, retryable = options.retryable})
                    db = database()
                    local rows, read_err = db:query("SELECT component_id FROM kickside_thread WHERE id=$1", {id})
                    local _, delete_err = db:execute("DELETE FROM kickside_thread WHERE id=$1", {id})
                    db:release()
                    if read_err then error(read_err) end
                    if delete_err then error(delete_err) end
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), kind)
                    test.eq(err:retryable(), options.retryable)
                    test.eq(err:details().code, "projection_retry_effect")
                    test.eq(err:details().reason, worker.WORKER_FAILED)
                    test.eq(#rows, 1)
                    test.eq(rows[1].component_id, id .. "x")
                end)
            end
        end
    end)
end)}
