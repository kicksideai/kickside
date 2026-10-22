local test = require("test")
local listing = require("listing")
local fixture = require("fixture")
local sql = require("sql")
local uuid = require("uuid")
local routes = {{operation = "jobs", stage = "dialect"}, {operation = "runs", stage = "dialect"},
    {operation = "jobs", stage = "anchor"}, {operation = "runs", stage = "anchor"},
    {operation = "jobs", stage = "rows"}, {operation = "runs", stage = "rows"}, {operation = "get", stage = "rows"}}
local function call(operation: string, anchor: boolean?): (any, error?, boolean?)
    fixture.anchor = anchor == true
    local db = fixture.executor()
    if operation == "get" then return listing.get_job(db, uuid.v7()) end
    local after = anchor and {id = uuid.v7(), owner_id = "owner"} or nil
    if operation == "jobs" then return listing.list_jobs(db, {"owner"}, nil, 2, after) end
    return listing.list_job_runs(db, {"owner"}, nil, 2, after)
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local route = routes[index]
        for _, transaction in ipairs({false, true}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.operation .. "/" .. route.stage .. "/" .. tostring(transaction) .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "listing database refusal", retryable = options.retryable,
                            details = {code = "listing_dependency", nested = {stage = route.stage}}})
                        fixture.reset(route.stage, source, sql.type.SQLITE, transaction)
                        local value, err = call(route.operation, route.stage == "anchor")
                        test.is_nil(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "listing_dependency")
                        test.eq(err:details().nested.stage, route.stage)
                        test.eq(source:details().nested.stage, route.stage)
                        test.eq(fixture.queries, route.stage == "dialect" and 0 or 1)
                    end)
                end
            end
        end
    end
end
local function proofs()
    test.it("reads a set of statuses in one query and omits absent jobs", function()
        fixture.reset("", nil, sql.type.SQLITE, false)
        local ids = {}
        for i = 1, 100 do ids[i] = uuid.v7() end
        fixture.rows = {{id = ids[3], status = "running"}, {id = ids[7], status = "done"}}
        ids[#ids + 1] = ids[3]
        local statuses, err = listing.get_job_statuses(fixture.executor(), ids)
        test.is_nil(err, tostring(err))
        test.eq(statuses[ids[3]], "running")
        test.eq(statuses[ids[7]], "done")
        test.is_nil(statuses[ids[1]])
        test.eq(fixture.queries, 1)
        for _, input in ipairs({{}, {"missing-job"}}) do
            fixture.reset("", nil, sql.type.SQLITE, false)
            local empty, empty_err = listing.get_job_statuses(fixture.executor(), input)
            test.is_nil(empty_err)
            test.is_nil(next(empty))
            test.eq(fixture.queries, 0)
        end
    end)
    test.it("retains status query errors and rejects missing row proof", function()
        local source = errors.new({kind = errors.UNAVAILABLE, message = "status read refused", retryable = true})
        fixture.reset("rows", source, sql.type.SQLITE, false)
        local value, err = listing.get_job_statuses(fixture.executor(), {uuid.v7()})
        test.is_nil(value)
        test.eq(err:kind(), source:kind())
        test.eq(err:retryable(), source:retryable())
        test.eq(fixture.queries, 1)
        fixture.reset("rows", nil, sql.type.SQLITE, false)
        fixture.missing = true
        value, err = listing.get_job_statuses(fixture.executor(), {uuid.v7()})
        test.is_nil(value)
        test.is_true(errors.is(err, errors.INTERNAL))
        test.eq(err:details().field, "statuses.rows")
    end)
    for _, route in ipairs(routes) do
        for _, proof in ipairs({{label = "missing"}, {label = "false", value = false}, {label = "number", value = 7}, {label = "text", value = "proof"}}) do
            test.it("required proof/" .. route.operation .. "/" .. route.stage .. "/" .. proof.label, function()
                fixture.reset(route.stage, nil, sql.type.SQLITE, false)
                fixture.missing, fixture.proof = true, proof.value
                local value, err = call(route.operation, route.stage == "anchor")
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "job_listing_response")
                test.eq(err:details().field, route.stage == "dialect" and "database.type"
                    or (route.stage == "anchor" and "position.rows" or (route.operation == "get" and "job.rows" or "history.rows")))
                test.eq(fixture.queries, route.stage == "dialect" and 0 or 1)
            end)
        end
    end
    for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
        for _, transaction in ipairs({false, true}) do
            for _, operation in ipairs({"jobs", "runs"}) do
                for _, count in ipairs({0, 1, 3}) do
                    test.it("valid page/" .. dialect .. "/" .. tostring(transaction) .. "/" .. operation .. "/" .. count, function()
                        fixture.reset("", nil, dialect, transaction)
                        fixture.rows = {}
                        for i = 1, count do fixture.rows[i] = {id = "job" .. i} end
                        local rows, err, more = call(operation)
                        test.is_nil(err)
                        test.eq(#rows, math.min(count, 2))
                        test.eq(more, count > 2)
                        test.eq(fixture.queries, 1)
                        test.eq(fixture.types, 1)
                    end)
                end
                test.it("absent position remains Invalid/" .. dialect .. "/" .. tostring(transaction) .. "/" .. operation, function()
                    fixture.reset("", nil, dialect, transaction)
                    fixture.rows = {}
                    local value, err = call(operation, true)
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(fixture.queries, 1)
                end)
            end
            test.it("single and absent job/" .. dialect .. "/" .. tostring(transaction), function()
                fixture.reset("", nil, dialect, transaction)
                local value, err = call("get")
                test.is_nil(err)
                test.eq(value.id, "job")
                fixture.reset("", nil, dialect, transaction)
                fixture.rows = {}
                value, err = call("get")
                test.is_nil(value)
                test.is_nil(err)
            end)
        end
    end
end
local function group(label, define) return test.run_cases(function() test.describe(label, define) end) end
return {
    dependencies_1 = group("native Jobs listing dependencies 1", function() dependencies(1, 3) end),
    dependencies_2 = group("native Jobs listing dependencies 2", function() dependencies(4, 7) end),
    proofs = group("native Jobs listing proofs and pagination", proofs),
}
