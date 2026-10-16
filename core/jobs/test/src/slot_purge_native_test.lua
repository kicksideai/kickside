local test = require("test")
local sql = require("sql")
local purge = require("purge")
local fixture = require("fixture")
local params = {namespace = "guard", scope = "owner", key = "slot"}
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "purge guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "purge_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
return {run = test.run_cases(function()
    test.describe("native slot purge dependencies", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            local stages = {"get", "dialect", "begin", "slot", "job", "runs", "delete_runs", "remaining", "delete_job", "next", "commit"}
            if dialect == sql.type.POSTGRES then stages[#stages + 1] = "run_lock" end
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "purge dependency refusal", retryable = policy.retryable,
                                    details = detailed and {code = "purge_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(stage, source, dialect)
                                local value, err = purge.purge_slot(params)
                                test.is_nil(value)
                                retains(required(err), source)
                                test.eq(fixture.releases, stage == "get" and 0 or 1)
                                test.eq(fixture.rollbacks, (stage == "get" or stage == "dialect" or stage == "begin" or stage == "commit") and 0 or 1)
                                test.eq(fixture.commits, stage == "commit" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            for _, kind in ipairs(kinds) do
                test.it("rollback/" .. dialect .. "/" .. kind, function()
                    local secondary = errors.new({kind = kind, message = "rollback refusal", retryable = false,
                        details = {code = "purge_dependency", nested = {marker = "kept"}}})
                    local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "primary refusal", retryable = false,
                        details = {code = "purge_primary", nested = {value = "retained"}}})
                    fixture.reset("rollback", secondary, dialect)
                    fixture.primary = primary
                    local value, err = purge.purge_slot(params)
                    test.is_nil(value)
                    local actual = required(err)
                    retains(actual, secondary)
                    test.eq(actual:details().operation_error.kind, primary:kind())
                    test.eq(actual:details().operation_error.retryable, primary:retryable())
                    test.eq(actual:details().operation_error.details.code, "purge_primary")
                    test.eq(actual:details().operation_error.details.nested.value, "retained")
                    test.eq(fixture.rollbacks, 1)
                    test.eq(fixture.commits, 0)
                    test.eq(fixture.releases, 1)
                end)
                test.it("running rollback/" .. dialect .. "/" .. kind, function()
                    local secondary = errors.new({kind = kind, message = "rollback refusal", retryable = true,
                        details = {code = "purge_dependency", nested = {marker = "kept"}}})
                    fixture.reset("rollback", secondary, dialect)
                    fixture.running = true
                    local value, err = purge.purge_slot(params)
                    test.is_nil(value)
                    local actual = required(err)
                    retains(actual, secondary)
                    test.eq(actual:details().operation_error.kind, errors.CONFLICT)
                    test.is_true(actual:details().operation_error.retryable)
                    test.eq(actual:details().operation_error.details.wait_for, "lease_release")
                    test.eq(fixture.writes, 0)
                end)
            end
            for _, entry in ipairs({{stage = "get", field = "database"}, {stage = "dialect", field = "database.type"},
                {stage = "begin", field = "transaction"}, {stage = "slot", field = "slot.rows"},
                {stage = "job", field = "job.rows"}, {stage = "runs", field = "runs.rows"},
                {stage = "delete_runs", field = "runs.count"}, {stage = "remaining", field = "remaining.rows"},
                {stage = "delete_job", field = "job.count"}, {stage = "next", field = "next.rows"}}) do
                test.it("missing/" .. dialect .. "/" .. entry.stage, function()
                    fixture.reset(entry.stage, nil, dialect)
                    fixture.missing = true
                    local ok, value, err = pcall(function() return purge.purge_slot(params) end)
                    test.is_true(ok)
                    test.is_nil(value)
                    local actual = required(err)
                    test.is_true(errors.is(actual, errors.INTERNAL))
                    test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_slot_purge_response")
                    test.eq(actual:details().field, entry.field)
                    test.eq(fixture.commits, 0)
                end)
            end
            for _, entry in ipairs({{stage = "delete_runs", field = "runs.count", maximum = 100},
                {stage = "delete_job", field = "job.count", maximum = 1}}) do
                for _, value in ipairs({-1, 0.5, 0/0, math.huge, entry.maximum + 1, "invalid"}) do
                    test.it("invalid count/" .. dialect .. "/" .. entry.stage .. "/" .. tostring(value), function()
                        fixture.reset(entry.stage, nil, dialect)
                        fixture.missing, fixture.value = true, {rows_affected = value}
                        local removed, err = purge.purge_slot(params)
                        test.is_nil(removed)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL))
                        test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_slot_purge_response")
                        test.eq(actual:details().field, entry.field)
                        test.eq(fixture.rollbacks, 1)
                        test.eq(fixture.commits, 0)
                        test.eq(fixture.releases, 1)
                    end)
                end
            end
            test.it("unsupported dialect/" .. dialect, function()
                fixture.reset("dialect", nil, dialect)
                fixture.missing, fixture.value = true, "unsupported"
                local value, err = purge.purge_slot(params)
                test.is_nil(value)
                local actual = required(err)
                test.is_true(errors.is(actual, errors.INTERNAL))
                test.is_false(actual:retryable())
                test.eq(actual:details().field, "database.type")
                test.eq(fixture.queries, 0)
                test.eq(fixture.releases, 1)
            end)
            for _, stage in ipairs({"slot", "job", ""}) do
                test.it("success/" .. dialect .. "/" .. stage, function()
                    fixture.reset("", nil, dialect)
                    fixture.empty = stage
                    local value, err = purge.purge_slot(params)
                    test.is_nil(err)
                    test.eq(value, stage == "" and 1 or 0)
                    test.eq(fixture.commits, 1)
                    test.eq(fixture.rollbacks, 0)
                    test.eq(fixture.releases, 1)
                end)
            end
            test.it("running/" .. dialect, function()
                fixture.reset("", nil, dialect)
                fixture.running = true
                local value, err = purge.purge_slot(params)
                test.is_nil(value)
                local actual = required(err)
                test.is_true(errors.is(actual, errors.CONFLICT))
                test.is_true(actual:retryable())
                test.eq(actual:details().wait_for, "lease_release")
                test.eq(fixture.rollbacks, 1)
                test.eq(fixture.commits, 0)
            end)
            for _, pending in ipairs({false, true}) do
                test.it("continuation/" .. dialect .. "/" .. tostring(pending), function()
                    fixture.reset("", nil, dialect)
                    fixture.continuation, fixture.remaining = true, true
                    if pending then fixture.stage, fixture.missing, fixture.value = "delete_runs", true, {rows_affected = 0} end
                    local value, err = purge.purge_slot(params)
                    test.is_nil(value)
                    local actual = required(err)
                    test.is_true(errors.is(actual, errors.CONFLICT))
                    test.is_true(actual:retryable())
                    test.eq(actual:details().cleanup_pending, true)
                    test.eq(actual:details().needs_continue, not pending)
                    test.eq(actual:details().wait_for, pending and "run_history_settlement" or nil)
                    test.eq(fixture.commits, 1)
                    test.eq(fixture.rollbacks, 0)
                end)
            end
        end
    end)
end)}
