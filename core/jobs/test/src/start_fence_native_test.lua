local test = require("test")
local fence = require("fence")
local fixture = require("fixture")
local sql = require("sql")
local routes = {{mode = "mark", stage = "begin"}, {mode = "mark", stage = "lock"},
    {mode = "mark", stage = "update"}, {mode = "mark", stage = "commit"},
    {mode = "release", stage = "begin"}, {mode = "release", stage = "dialect"},
    {mode = "release", stage = "update"}, {mode = "release", stage = "delete"},
    {mode = "release", stage = "marker"}, {mode = "release", stage = "commit"}}
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
    errors.RATE_LIMITED, errors.UNKNOWN}
local function call(mode: string): (boolean, error?)
    local job = {id = "job", lease_token = "token", execution_seq = 1}
    if mode == "mark" then return fence.mark_started(fixture.executor(), job, "worker", "run", "child") end
    return fence.release_unstarted(fixture.executor(), job, "worker", "run")
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local route = routes[index]
        if type(route) ~= "table" then error(errors.new({kind = errors.INTERNAL, message = "test route is missing"})) end
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.mode .. "/" .. route.stage .. "/" .. dialect .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "start fence dependency refusal", retryable = options.retryable,
                            details = {code = "start_dependency", nested = {stage = route.stage}}})
                        fixture.reset(route.mode, route.stage, source, dialect)
                        local value, err = call(route.mode)
                        test.is_false(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "start_dependency")
                        test.eq(err:details().nested.stage, route.stage)
                        test.eq(source:details().nested.stage, route.stage)
                        if route.stage == "begin" or route.stage == "dialect" then test.eq(fixture.writes, 0) end
                        if route.stage ~= "commit" then test.eq(fixture.commits, 0) end
                    end)
                end
            end
        end
    end
end
local function cleanup()
    for _, route in ipairs({{mode = "mark", stage = "lock"}, {mode = "mark", stage = "update"},
        {mode = "release", stage = "dialect"}, {mode = "release", stage = "update"},
        {mode = "release", stage = "delete"}, {mode = "release", stage = "marker"}}) do
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("rollback retains primary/" .. route.mode .. "/" .. route.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "start primary refusal",
                        details = {code = "start_primary", nested = {stage = route.stage}}})
                    local secondary = errors.new({kind = kind, retryable = options.retryable, message = "start rollback refusal",
                        details = {code = "start_rollback", nested = {stage = route.stage}}})
                    fixture.reset(route.mode, route.stage, primary, sql.type.SQLITE)
                    fixture.secondary = secondary
                    local value, err = call(route.mode)
                    test.is_false(value)
                    test.eq(err:kind(), secondary:kind())
                    test.eq(err:retryable(), secondary:retryable())
                    test.eq(err:details().code, "start_rollback")
                    test.eq(err:details().nested.stage, route.stage)
                    test.eq(err:details().operation_error.kind, errors.PERMISSION_DENIED)
                    test.is_false(err:details().operation_error.retryable)
                    test.eq(err:details().operation_error.details.code, "start_primary")
                    test.eq(err:details().operation_error.details.nested.stage, route.stage)
                    test.eq(fixture.rollbacks, 1)
                    test.eq(fixture.commits, 0)
                end)
            end
        end
    end
    for _, route in ipairs({{mode = "mark", stage = "lock"}, {mode = "mark", stage = "update"},
        {mode = "release", stage = "update"}}) do
        for _, kind in ipairs(kinds) do
            test.it("zero-row rollback refusal/" .. route.mode .. "/" .. route.stage .. "/" .. kind, function()
                fixture.reset(route.mode, route.stage, nil, sql.type.SQLITE)
                fixture.missing, fixture.proof = true, {rows_affected = 0}
                fixture.secondary = errors.new({kind = kind, retryable = false, message = "rollback refusal",
                    details = {code = "start_rollback"}})
                local value, err = call(route.mode)
                test.is_false(value)
                test.eq(err:kind(), kind)
                test.is_false(err:retryable())
                test.eq(err:details().code, "start_rollback")
                test.eq(fixture.rollbacks, 1)
                test.eq(fixture.commits, 0)
            end)
        end
    end
end
local function proofs()
    local fields = {mark = {begin = "start.transaction", lock = "start.lock", update = "start.update"},
        release = {begin = "release.transaction", dialect = "database.type", update = "release.update", delete = "release.delete"}}
    for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
        for _, route in ipairs(routes) do
            if fields[route.mode][route.stage] then
                for _, proof in ipairs({{name = "missing"}, {name = "false", value = false}, {name = "number", value = 7}}) do
                    test.it("required proof/" .. route.mode .. "/" .. route.stage .. "/" .. dialect .. "/" .. proof.name, function()
                        fixture.reset(route.mode, route.stage, nil, dialect)
                        fixture.missing, fixture.proof = true, proof.value
                        local value, err = call(route.mode)
                        test.is_false(value)
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.is_false(err:retryable())
                        test.eq(err:details().code, "job_start_fence_response")
                        test.eq(err:details().field, fields[route.mode][route.stage])
                        test.eq(fixture.commits, 0)
                    end)
                end
            end
        end
        for _, route in ipairs({{mode = "mark", stage = "lock"}, {mode = "mark", stage = "update"},
            {mode = "release", stage = "update"}, {mode = "release", stage = "delete"}}) do
            for _, proof in ipairs({{}, {rows_affected = false}, {rows_affected = -1}, {rows_affected = 0.5}, {rows_affected = 2}}) do
                test.it("bounded count/" .. route.mode .. "/" .. route.stage .. "/" .. dialect .. "/" .. tostring(proof.rows_affected), function()
                    fixture.reset(route.mode, route.stage, nil, dialect)
                    fixture.missing, fixture.proof = true, proof
                    local value, err = call(route.mode)
                    test.is_false(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "job_start_fence_response")
                    test.eq(err:details().field, fields[route.mode][route.stage])
                    test.eq(fixture.commits, 0)
                end)
            end
            if route.stage ~= "delete" then
                test.it("zero affected rows stay a stale assignment/" .. route.mode .. "/" .. route.stage .. "/" .. dialect, function()
                    fixture.reset(route.mode, route.stage, nil, dialect)
                    fixture.missing, fixture.proof = true, {rows_affected = 0}
                    local value, err = call(route.mode)
                    test.is_false(value)
                    test.is_nil(err)
                    test.eq(fixture.rollbacks, 1)
                    test.eq(fixture.commits, 0)
                end)
            end
        end
        for _, mode in ipairs({"mark", "release"}) do
            test.it("success/" .. mode .. "/" .. dialect, function()
                fixture.reset(mode, "", nil, dialect)
                local value, err = call(mode)
                test.is_nil(err)
                test.is_true(value)
                test.eq(fixture.writes, 2)
                test.eq(fixture.rollbacks, 0)
                test.eq(fixture.commits, 1)
            end)
            test.it("numeric affected-count proof/" .. mode .. "/" .. dialect, function()
                fixture.reset(mode, "update", nil, dialect)
                fixture.missing, fixture.proof = true, {rows_affected = "1"}
                local value, err = call(mode)
                test.is_nil(err)
                test.is_true(value)
                test.eq(fixture.commits, 1)
            end)
        end
    end
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native job start dependencies 1", function() dependencies(1, 3) end),
    run_dependencies_2 = group("native job start dependencies 2", function() dependencies(4, 6) end),
    run_dependencies_3 = group("native job start dependencies 3", function() dependencies(7, 10) end),
    run_cleanup = group("native job start rollback", cleanup),
    run_proofs = group("native job start response proofs", proofs),
}
