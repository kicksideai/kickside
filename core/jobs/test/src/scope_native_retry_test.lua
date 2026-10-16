local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
return {run = test.run_cases(function()
    test.describe("committed Jobs scope failure retry policy", function()
        test.it("keeps the release cause and performs one durable mutation", function()
            local db, open_err = sql.get("app:db")
            if open_err then error(open_err) end
            if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "scope retry guard has no database"})) end
            local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS native_scope_effect (id TEXT PRIMARY KEY, n INTEGER NOT NULL)")
            if create_err then db:release(); error(create_err) end
            local _, clear_err = db:execute("DELETE FROM native_scope_effect")
            if clear_err then db:release(); error(clear_err) end
            local _, insert_err = db:execute("INSERT INTO native_scope_effect (id,n) VALUES ($1,$2)", {"effect", 0})
            if insert_err then db:release(); error(insert_err) end
            local value, err = funcs.new():with_options({retry = {max_attempts = 3}}):call("app:scope_retry_probe")
            local rows, read_err = db:query("SELECT n FROM native_scope_effect WHERE id=$1", {"effect"})
            local _, release_err = db:release()
            if read_err then error(read_err) end
            if release_err then error(release_err) end
            test.eq(tonumber(rows[1].n), 1)
            test.is_nil(value)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "scope retry guard requires an error"})) end
            test.is_false(err:retryable())
            test.eq(err:details().cause.kind, errors.UNAVAILABLE)
            test.is_true(err:details().cause.retryable)
            test.eq(err:details().cause.details.code, "scope_dependency")
        end)
    end)
end)}
