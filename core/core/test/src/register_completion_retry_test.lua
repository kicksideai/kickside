local test = require("test")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")
local clock = require("clock")
local function database(): sql.DB
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "create retry guard database absent"})) end
    return db
end
return {run = test.run_cases(function()
    test.describe("registration completion stops runtime replay", function()
        for _, stage in ipairs({"commit", "nudge", "retention"}) do
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local id = uuid.v7()
                        local db = database()
                        local dialect, dialect_err = db:type()
                        if dialect_err then error(dialect_err) end
                        local _, insert_err = sql.builder.insert("kickside_thread"):set_map({id = id, component_id = id,
                            thread_class = "projection_transaction_guard", event_count = 0, last_event_ts = clock.now(dialect)}):run_with(db):exec()
                        local _, release_err = db:release()
                        if insert_err then error(insert_err) end
                        if release_err then error(release_err) end
                        local result, err = funcs.new():with_options({retry = {max_attempts = 3, initial_delay = 1, max_delay = 1}})
                            :call("app:register_completion_retry_target", {thread_id = id, stage = stage, dialect = dialect, kind = kind, retryable = policy.retryable})
                        db = database()
                        local rows, read_err = db:query("SELECT component_id FROM kickside_thread WHERE id=$1", {id})
                        local _, delete_err = db:execute("DELETE FROM kickside_thread WHERE id=$1", {id})
                        local _, close_err = db:release()
                        if read_err then error(read_err) end
                        if delete_err then error(delete_err) end
                        if close_err then error(close_err) end
                        test.eq(#rows, 1)
                        test.eq(rows[1].component_id, id .. "x")
                        test.is_nil(result)
                        if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "resource retry guard requires an error"})) end
                        test.is_true(errors.is(err, kind))
                        test.is_false(err:retryable())
                        test.eq(err:details().code, "register_completion_dependency")
                        test.eq(err:details().cause.kind, kind)
                        test.eq(err:details().cause.retryable, policy.retryable)
                        test.eq(err:details().cause.details.code, "register_completion_dependency")
                    end)
                end
        end
        end
    end)
end)}
