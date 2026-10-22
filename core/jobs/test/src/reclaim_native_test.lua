local test = require("test")
local sql = require("sql")
local reclaim = require("reclaim")
local fixture = require("fixture")
local routes: {{name: string, stages: {string}}} = {
    {name = "expired", stages = {"policy", "begin", "lookup", "size", "update", "marker", "history", "history_update", "commit", "notify"}},
    {name = "terminated", stages = {"policy", "begin", "build", "lookup", "alive", "locked", "size", "update", "marker", "history", "finalize", "commit", "notify"}},
    {name = "live", stages = {"begin", "build", "lookup", "alive", "locked", "size", "update", "commit"}},
    {name = "confirmed", stages = {"begin", "lookup", "size", "update", "marker", "history", "finalize", "commit", "notify"}},
    {name = "one", stages = {"policy", "history", "size", "history_update"}},
    {name = "many", stages = {"policy", "begin", "lookup", "history", "size", "history_update", "commit"}},
}
local function dialect(): string
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "reclaim guard requires a database"})) end
    local value, type_err = db:type(); db:release()
    if type_err then error(type_err) end
    if type(value) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "reclaim guard requires a dialect"})) end
    return value
end
local function invoke(route): error?
    local db = fixture.database()
    if route == "one" then return reclaim.close_lost_run(db, fixture.dialect, "job", 1, "token", "2026-10-10T00:00:00Z") end
    if route == "many" then local _, err = reclaim.close_lost_runs(db, fixture.dialect, 1); return err end
    if route == "expired" then local _, err = reclaim.reclaim_expired(db, fixture.dialect, 1); return err end
    if route == "confirmed" then local _, err = reclaim.settle_confirmed(db, fixture.dialect, {id = "job", token = "token", execution_seq = 1}); return err end
    local _, err = reclaim.reclaim_terminated(db, fixture.dialect, 1, fixture.child_alive); return err
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "reclaim guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error)
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "reclaim_dependency"); test.eq(actual:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
local function group(index: integer)
    local route = routes[index]
    return test.run_cases(function()
        test.describe("native recovery/" .. route.name, function()
            fixture.dialect = dialect()
            if route.name == "terminated" or route.name == "live" then
                test.it("reads execution liveness before opening the transaction", function()
                    fixture.reset(route.name, "", nil)
                    test.is_nil(invoke(route.name))
                    test.is_false(fixture.lookup_in_transaction)
                end)
            end
            for _, stage in ipairs(route.stages) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "recovery dependency refusal",
                                    details = detailed and {code = "reclaim_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(route.name, stage, source)
                                retains(required(invoke(route.name)), source)
                            end)
                        end
                    end
                end
            end
            if route.name ~= "one" then
                test.it("rollback keeps both native causes", function()
                    local secondary = errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "rollback refusal",
                        details = {code = "reclaim_dependency", nested = {marker = "kept"}}})
                    local primary = errors.new({kind = errors.INVALID, retryable = false, message = "size refusal", details = {code = "reclaim_size"}})
                    fixture.reset(route.name, "rollback", secondary); fixture.primary = primary
                    local actual = required(invoke(route.name)); retains(actual, secondary)
                    test.eq(actual:details().operation_error.kind, primary:kind())
                    test.eq(actual:details().operation_error.retryable, primary:retryable())
                    test.eq(actual:details().operation_error.details.code, "reclaim_size")
                    test.eq(fixture.commits, 0)
                end)
            end
            local proofs = route.name == "one" and {"policy", "history", "history_update"}
                or route.name == "many" and {"policy", "begin", "lookup", "history", "history_update"}
                or route.name == "live" and {"policy", "begin", "lookup", "alive", "update"}
                or {"policy", "begin", "lookup", "update", "history"}
            if route.name == "terminated" then proofs[#proofs + 1] = "alive" end
            if route.name == "terminated" or route.name == "live" then proofs[#proofs + 1] = "locked" end
            for _, stage in ipairs(proofs) do
                test.it("missing successful proof/" .. stage, function()
                    fixture.reset(route.name, stage, nil); fixture.missing = true
                    local ok, err = pcall(function() return invoke(route.name) end)
                    test.is_true(ok)
                    local actual = required(err)
                    test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_reclaim_response")
                    test.eq(fixture.commits, 0)
                end)
            end
            test.it("valid recovery", function()
                fixture.reset(route.name, "", nil); test.is_nil(invoke(route.name))
                test.eq(fixture.commits, route.name == "one" and 0 or 1)
                test.eq(fixture.rollbacks, 0)
            end)
        end)
    end)
end
return {run = group(1), terminated = group(2), live = group(3), confirmed = group(4), one = group(5), many = group(6)}
