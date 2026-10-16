local test = require("test")
local completion = require("completion")
local fixture = require("fixture")
local sql = require("sql")
local job_types = require("job_types")
local routes = {}
for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
    for _, stage in ipairs({"policy", "dialect", "parse", "lookup", "history_size", "job_size", "settled_job", "settled_run"}) do
        routes[#routes + 1] = {stage = stage, dialect = dialect}
    end
    for _, stage in ipairs(dialect == sql.type.SQLITE and {"update", "marker", "history"} or {"transition"}) do
        routes[#routes + 1] = {stage = stage, dialect = dialect}
    end
end
local lease = {token = "token", execution_seq = 1}
local function call(stage: string): (any, error?)
    if stage == "settled_job" or stage == "settled_run" then
        return completion.worker_settled_tx(fixture.transaction(), "job", lease)
    end
    local options: any = {record = {status = "completed"}}
    if stage == "parse" then options.rearm = "2099-01-01T00:00:00Z" end
    return completion.complete_tx(fixture.transaction(), "job", lease, options)
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local route = routes[index]
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(route.dialect .. "/" .. route.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "completion dependency refusal", retryable = options.retryable,
                        details = {code = "completion_dependency", nested = {stage = route.stage}}})
                    fixture.reset(route.stage, source, route.dialect)
                    local value, err = call(route.stage)
                    if route.stage == "settled_job" or route.stage == "settled_run" then test.is_false(value)
                    else test.is_nil(value) end
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "completion_dependency")
                    test.eq(err:details().nested.stage, route.stage)
                    test.eq(source:details().nested.stage, route.stage)
                    if route.stage == "policy" or route.stage == "dialect" or route.stage == "parse"
                        or route.stage == "lookup" then test.eq(fixture.executes, 0) end
                end)
            end
        end
    end
end
local function proofs()
    test.it("native lease loss is permanent for every lease consumer", function()
        local err = job_types.lease_lost_error("lease ownership changes")
        test.is_true(errors.is(err, errors.CONFLICT))
        test.is_false(err:retryable())
        test.eq(err:details().code, job_types.ERROR_CODE.LEASE_LOST)
        test.is_true(job_types.is_lease_lost_error(err))
    end)
    for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
        for _, raw in ipairs({"2099-01-01T00:00:00Z", "2099-01-01 00:00:00.000000"}) do
            test.it("retains both UTC rearm formats/" .. dialect .. "/" .. raw, function()
                fixture.reset("", nil, dialect)
                local value, err = completion.complete_tx(fixture.transaction(), "job", lease, {rearm = raw})
                test.is_nil(err)
                test.eq(value.status, "rearmed")
                test.eq(value.scheduled_at, dialect == sql.type.SQLITE and "2099-01-01 00:00:00.000000"
                    or "2099-01-01T00:00:00.000000Z")
            end)
        end
        local checks = {{stage = "policy", field = "policy"}, {stage = "dialect", field = "database.type"},
            {stage = "parse", field = "rearm"}, {stage = "lookup", field = "job.rows"},
            {stage = "settled_job", field = "settled_job.rows"}, {stage = "settled_run", field = "settled_run.rows"}}
        if dialect == sql.type.SQLITE then
            checks[#checks + 1] = {stage = "update", field = "job.update"}
            checks[#checks + 1] = {stage = "history", field = "history.write"}
        else checks[#checks + 1] = {stage = "transition", field = "transition"} end
        for _, route in ipairs(checks) do
            for _, proof in ipairs({{label = "missing"}, {label = "false", value = false}, {label = "number", value = 7}}) do
                test.it("missing successful proof/" .. dialect .. "/" .. route.stage .. "/" .. proof.label, function()
                    fixture.reset(route.stage, nil, dialect)
                    fixture.missing, fixture.proof = true, proof.value
                    local value, err = call(route.stage)
                    if route.stage == "settled_job" or route.stage == "settled_run" then test.is_false(value)
                    else test.is_nil(value) end
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "job_completion_response")
                    test.eq(err:details().field, route.field)
                end)
            end
        end
        for _, mode in ipairs({"complete", "worker", "settled"}) do
            test.it("valid result/" .. dialect .. "/" .. mode, function()
                fixture.reset("", nil, dialect)
                local value: any, err: any
                if mode == "settled" then value, err = completion.worker_settled_tx(fixture.transaction(), "job", lease)
                elseif mode == "worker" then value, err = completion.complete_worker_tx(fixture.transaction(), "job", lease, {})
                else value, err = completion.complete_tx(fixture.transaction(), "job", lease, {}) end
                test.is_nil(err)
                if mode == "settled" then test.is_true(value); test.eq(fixture.executes, 0)
                else
                    test.eq(value.status, "completed")
                    test.is_true(value.run_history_settled)
                    test.eq(fixture.executes, dialect == sql.type.SQLITE and 2 or 1)
                end
            end)
        end
        test.it("zero affected rows retains native lease loss/" .. dialect, function()
            fixture.reset(dialect == sql.type.SQLITE and "update" or "transition", nil, dialect)
            fixture.missing, fixture.proof = true, {rows_affected = 0}
            local value, err = completion.complete_tx(fixture.transaction(), "job", lease, {})
            test.is_nil(value)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.is_false(err:retryable())
        end)
    end
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native completion dependencies 1", function() dependencies(1, 5) end),
    run_dependencies_2 = group("native completion dependencies 2", function() dependencies(6, 10) end),
    run_dependencies_3 = group("native completion dependencies 3", function() dependencies(11, 15) end),
    run_dependencies_4 = group("native completion dependencies 4", function() dependencies(16, #routes) end),
    run_proofs = group("native completion response proofs", proofs),
}
