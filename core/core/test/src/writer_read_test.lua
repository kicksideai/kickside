local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local sql = require("sql")
local function encoded(value: any): string
    local value, err = canonical_json.encode(value)
    if err then error(err) end
    if not value then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "writer guard requires JSON proof"})) end
    return value
end
local function call(method: string, db: any): (any, error?)
    if method == "type" then return api.dbtype_of(db) end
    if method == "lock" then return api.lock_thread_rows_tx(db, "postgres", {"thread"}) end
    return api.gate_write(db, "thread", 2)
end
return {run = test.run_cases(function()
    test.describe("native thread writer read and dialect boundaries", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            test.it("engine append reuses ordered thread snapshots/" .. dialect, function()
                fixture.reset("", nil)
                local snapshot = {id = "thread", event_count = 0}
                local id = dialect == sql.type.POSTGRES and " THREAD " or " thread "
                local result, err = api.append_system_tx(fixture.database(), dialect, id, {{type = "test:event"}}, nil,
                    {defer_wake = true, locked_threads = {thread = snapshot}})
                test.is_nil(err)
                test.not_nil(result)
                test.is_true(fixture.append_options.defer_wake)
                test.eq(fixture.append_options.locked_thread, snapshot)
                local again, again_err = api.append_system_tx(fixture.database(), dialect, id, {{type = "test:event"}}, nil,
                    {defer_wake = true, locked_threads = {thread = snapshot}})
                test.is_nil(again_err)
                test.eq(again.max_seq, 2)
                test.eq(snapshot.event_count, 2)
                test.eq(fixture.queries, 0)
            end)
        end
        test.it("engine append refuses a missing supplied lock snapshot", function()
            fixture.reset("", nil)
            local result, err = api.append_system_tx(fixture.database(), sql.type.SQLITE, "thread", {{type = "test:event"}}, nil,
                {defer_wake = true, locked_threads = {}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.is_nil(fixture.append_options)
            test.eq(fixture.queries, 0)
        end)
        test.it("engine append retains omitted-option behavior", function()
            fixture.reset("", nil)
            local result, err = api.append_system_tx(fixture.database(), sql.type.SQLITE, "thread", {{type = "test:event"}}, "completion")
            test.is_nil(err)
            test.not_nil(result)
            test.eq(fixture.append_options.completion_job_id, "completion")
            test.is_nil(fixture.append_options.defer_wake)
            test.is_nil(fixture.append_options.locked_thread)
        end)
        for _, route in ipairs({{method = "type", stage = "type"}, {method = "lock", stage = "query"},
            {method = "gate", stage = "query"}, {method = "gate", stage = "access"}, {method = "gate", stage = "access_success_error"}}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.method .. "/" .. route.stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "writer_read_dependency", nested = {marker = "kept"}}})
                        fixture.reset(route.stage, source); local value, err = call(route.method, fixture.database())
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(encoded(err:details()), encoded(source:details()))
                        test.eq(fixture.accesses, (route.stage == "access" or route.stage == "access_success_error") and 1 or 0)
                    end)
                end
            end
        end
        for _, method in ipairs({"gate", "lock"}) do
            for _, stage in ipairs({"missing_rows", "scalar_rows", "scalar_row", "sparse_rows"}) do
                test.it(method .. "/mandatory rows/" .. stage, function()
                    fixture.reset(stage, nil); local value, err = call(method, fixture.database())
                    test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                    test.not_nil(err:details().code); test.eq(fixture.accesses, 0)
                end)
            end
            test.it(method .. "/healthy", function()
                fixture.reset("", nil); local value, err = call(method, fixture.database()); test.is_nil(err)
                test.eq(method == "gate" and value.marker or value.thread.marker, "kept")
            end)
        end
        for _, stage in ipairs({"missing_type", "invalid_type"}) do
            test.it("type/mandatory proof/" .. stage, function()
                fixture.reset(stage, nil); local value, err = call("type", fixture.database())
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
            end)
        end
        test.it("lock/mandatory row identity", function()
            fixture.reset("missing_row_id", nil); local value, err = call("lock", fixture.database())
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
        end)
        test.it("lock/empty rows remains successful", function()
            fixture.reset("empty", nil); local value, err = call("lock", fixture.database()); test.is_nil(err); test.eq(encoded(value), encoded({}))
        end)
        test.it("lock/empty request skips database", function()
            fixture.reset("", nil); local value, err = api.lock_thread_rows_tx(fixture.database(), "postgres", {})
            test.is_nil(err); test.eq(encoded(value), encoded({})); test.eq(fixture.queries, 0)
        end)
        test.it("gate/missing authority proof refuses permanently", function()
            fixture.reset("missing_access", nil); local value, err = call("gate", fixture.database())
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
        end)
        for _, route in ipairs({{stage = "empty", kind = errors.NOT_FOUND}, {stage = "missing_component", kind = errors.NOT_FOUND}, {stage = "denied", kind = errors.PERMISSION_DENIED}}) do
            test.it("gate/originated/" .. route.stage, function()
                fixture.reset(route.stage, nil); local value, err = call("gate", fixture.database())
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), route.kind); test.is_false(err:retryable()); test.not_nil(err:details().code)
            end)
        end
        test.it("real SDK dialect is a required string", function()
            local db, err = sql.get("app:db")
            if err then error(err) end
            if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "dialect probe requires a database"})) end
            local raw, raw_err = db:type()
            local value, value_err = api.dbtype_of(db)
            local _, release_err = db:release()
            if raw_err then error(raw_err) end
            if release_err then error(release_err) end
            test.is_nil(value_err); test.eq(type(raw), "string"); test.eq(value, raw)
        end)
    end)
end)}
