local test = require("test")
local sql = require("sql")
local retention = require("retention")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(): (any?, error?)
    local db = fixture.database()
    if fixture.mode == "runs" then return retention.prune_runs(db, "thread", "cutoff", 2) end
    if fixture.mode == "jobs" then return retention.prune_jobs(db, "thread", "cutoff", 2) end
    if fixture.mode == "workers" then return retention.prune_workers(db, "cutoff", 2) end
    if fixture.mode == "wake" then return retention.prune_wake_fanout(db, 2) end
    return retention.sweep(db, fixture.dialect)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "retention guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "retention_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
local modes = {"runs", "jobs", "workers", "wake", "receipts", "fences"}
local function group(first: integer, last: integer)
    return test.run_cases(function()
    test.describe("native retention failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for index = first, last do
                local mode = modes[index]
                local stages = {"delete"}
                local transactional = mode ~= "workers" and mode ~= "wake"
                if transactional then stages = {"begin", "candidates", "delete", "commit"} end
                if mode == "jobs" or mode == "runs" then
                    stages[#stages + 1] = "dialect"
                    if dialect == sql.type.POSTGRES then stages[#stages + 1] = "prelock" end
                elseif mode == "wake" then stages[#stages + 1] = "dialect" end
                for _, stage in ipairs(stages) do
                    for _, kind in ipairs(kinds) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            for _, detailed in ipairs({false, true}) do
                                test.it(dialect .. "/" .. mode .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                    local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                        details = detailed and {code = "retention_dependency", nested = {marker = "kept"}} or nil})
                                    fixture.reset(mode, stage, source, dialect)
                                    local value, err = invoke()
                                    test.is_nil(value)
                                    retains(required(err), source)
                                    if stage ~= "commit" then test.eq(fixture.commits, mode == "fences" and 1 or 0) end
                                end)
                            end
                        end
                    end
                end
                if transactional then
                    for _, kind in ipairs(kinds) do
                        test.it("rollback/" .. dialect .. "/" .. mode .. "/" .. kind, function()
                            local source = errors.new({kind = kind, message = "rollback refusal", retryable = false,
                                details = {code = "retention_dependency", nested = {marker = "kept"}}})
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "delete refusal", retryable = false,
                                details = {code = "retention_primary", nested = {marker = "primary"}}})
                            fixture.reset(mode, "rollback", source, dialect)
                            fixture.primary = primary
                            local value, err = invoke()
                            test.is_nil(value)
                            local actual = required(err)
                            retains(actual, source)
                            test.eq(actual:details().operation_error.kind, primary:kind())
                            test.eq(actual:details().operation_error.retryable, primary:retryable())
                            test.eq(actual:details().operation_error.details.code, "retention_primary")
                            test.eq(actual:details().operation_error.details.nested.marker, "primary")
                            test.eq(fixture.rollbacks, 1)
                        end)
                    end
                end
                for _, stage in ipairs(transactional and {"begin", "candidates", "delete"} or {"delete"}) do
                    test.it("missing/" .. dialect .. "/" .. mode .. "/" .. stage, function()
                        fixture.reset(mode, stage, nil, dialect)
                        fixture.missing = true
                        local ok, value, err = pcall(invoke)
                        test.is_true(ok)
                        test.is_nil(value)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL))
                        test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_retention_response")
                    end)
                end
                for _, count in ipairs({-1, 0.5, 3, "bad"}) do
                    test.it("invalid count/" .. dialect .. "/" .. mode .. "/" .. tostring(count), function()
                        fixture.reset(mode, "delete", nil, dialect)
                        fixture.missing, fixture.value = true, {rows_affected = count}
                        local value, err = invoke()
                        test.is_nil(value)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL))
                        test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_retention_response")
                    end)
                end
                test.it("success/" .. dialect .. "/" .. mode, function()
                    fixture.reset(mode, "", nil, dialect)
                    local value, err = invoke()
                    test.is_nil(err)
                    if mode == "receipts" or mode == "fences" then
                        test.eq(value.thread_cleanup_receipts, mode == "receipts" and 1 or 0)
                        test.eq(value.thread_cleanup_fences, mode == "fences" and 1 or 0)
                    else test.eq(value, 1) end
                    test.eq(fixture.rollbacks, 0)
                end)
            end
        end
    end)
end)
end
return {run = group(1, 1), jobs = group(2, 2), workers = group(3, 3),
    wake = group(4, 4), receipts = group(5, 5), fences = group(6, 6)}
