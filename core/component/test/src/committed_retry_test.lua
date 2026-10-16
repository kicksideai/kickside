local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
return {run = test.run_cases(function()
    test.describe("committed Component error retry policy", function()
        for _, operation in ipairs({{label = "creation", probe = "app:committed_retry_probe", stages = {"commit", "release", "notify"}},
            {label = "metadata", probe = "app:metadata_retry_probe", stages = {"commit", "release", "notify", "audience"}},
            {label = "placement", probe = "app:placement_retry_probe", stages = {"commit", "release", "notify"}},
            {label = "update", probe = "app:update_retry_probe", stages = {"commit", "release", "notify", "audience"}}}) do
        for _, stage in ipairs(operation.stages) do
            test.it(operation.label .. "/" .. stage .. " performs one durable mutation", function()
                local db, open_err = sql.get("app:db")
                if open_err then error(open_err) end
                if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "commit retry guard has no database"})) end
                local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS native_component_effect (id TEXT PRIMARY KEY, n INTEGER NOT NULL)")
                if create_err then error(create_err) end
                local _, clear_err = db:execute("DELETE FROM native_component_effect")
                if clear_err then error(clear_err) end
                local _, insert_err = db:execute("INSERT INTO native_component_effect (id,n) VALUES ($1,$2)", {"effect", 0})
                if insert_err then error(insert_err) end
                local value, err = funcs.new():with_options({retry = {max_attempts = 3}}):call(operation.probe, stage)
                local rows, read_err = db:query("SELECT n FROM native_component_effect WHERE id=$1", {"effect"})
                local _, release_err = db:release()
                if read_err then error(read_err) end
                if release_err then error(release_err) end
                test.eq(tonumber(rows[1].n), 1); test.is_nil(value); test.is_true(errors.is(err, errors.UNAVAILABLE))
                if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "commit retry guard requires an error"})) end
                test.is_false(err:retryable()); test.eq(err:details().code, "component_committed_dependency")
                test.eq(err:details().nested.marker, "kept"); test.eq(err:details().cause.kind, errors.UNAVAILABLE)
                test.is_true(err:details().cause.retryable); test.eq(err:details().cause.details.code, "component_committed_dependency")
                test.eq(err:details().cause.details.nested.marker, "kept")
            end)
        end
        end
    end)
end)}
