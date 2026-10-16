local test = require("test")
local fence = require("fence")
local fixture = require("fixture")
local sql = require("sql")
local routes = {"mark", "mark_proof", "state", "pins", "contract", "binding", "fence", "dialect", "stamp", "stamp_proof"}
local function call(stage: string): (any, error?)
    if stage == "mark" or stage == "mark_proof" then
        local err = fence.mark(fixture.executor(), "source")
        return nil, err
    end
    return fence.fence_page(fixture.executor(), "source")
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local stage = routes[index]
        if type(stage) ~= "string" then
            error(errors.new({message = "dependency route is missing", kind = errors.INTERNAL}))
        end
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. dialect .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "teardown fence dependency refusal", retryable = options.retryable,
                            details = {code = "teardown_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, dialect)
                        local value, err = call(stage)
                        test.is_nil(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "teardown_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(source:details().nested.stage, stage)
                        if stage == "state" or stage == "pins" or stage == "contract" or stage == "binding"
                            or stage == "fence" or stage == "dialect" then test.eq(fixture.writes, 0) end
                    end)
                end
            end
        end
    end
end
local function proofs()
    local fields = {mark = "mark.write", mark_proof = "mark.rows", state = "state.rows", pins = "pins.rows",
        contract = "fence.contract", binding = "fence.binding", fence = "fence.outcome", dialect = "database.type",
        stamp = "cursor.write", stamp_proof = "cursor.rows"}
    for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
        for _, stage in ipairs(routes) do
            for _, proof in ipairs({{name = "missing"}, {name = "false", value = false}, {name = "number", value = 7}}) do
                test.it("required proof/" .. dialect .. "/" .. stage .. "/" .. proof.name, function()
                    fixture.reset(stage, nil, dialect)
                    fixture.missing, fixture.proof = true, proof.value
                    local value, err = call(stage)
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "thread_teardown_fence_response")
                    test.eq(err:details().field, fields[stage])
                end)
            end
        end
        local checks = {{stage = "mark_proof", value = {{}}, field = "mark.deleting_at"},
            {stage = "state", value = {false}, field = "state"},
            {stage = "state", value = {{}}, field = "state.cursor"},
            {stage = "pins", value = {false}, field = "pins.consumer_key"},
            {stage = "pins", value = {{}}, field = "pins.consumer_key"},
            {stage = "fence", value = {}, field = "fence.outcome"},
            {stage = "stamp_proof", value = {{}}, field = "cursor.advance"}}
        for index, proof in ipairs(checks) do
            test.it("malformed proof/" .. dialect .. "/" .. index, function()
                fixture.reset(proof.stage, nil, dialect)
                fixture.missing, fixture.proof = true, proof.value
                local value, err = call(proof.stage)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "thread_teardown_fence_response")
                test.eq(err:details().field, proof.field)
            end)
        end
        for _, stage in ipairs({"mark", "stamp"}) do
            for _, proof in ipairs({{}, {rows_affected = false}, {rows_affected = -1},
                {rows_affected = 0.5}, {rows_affected = 2}}) do
                test.it("bounded write proof/" .. dialect .. "/" .. stage .. "/" .. tostring(proof.rows_affected), function()
                    fixture.reset(stage, nil, dialect)
                    fixture.missing, fixture.proof = true, proof
                    local value, err = call(stage)
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "thread_teardown_fence_response")
                    test.eq(err:details().field, fields[stage])
                end)
            end
        end
        test.it("mark and fence success/" .. dialect, function()
            fixture.reset("", nil, dialect)
            test.is_nil(fence.mark(fixture.executor(), "source"))
            local value, err = fence.fence_page(fixture.executor(), "source")
            test.is_nil(err)
            test.is_true(value)
            test.eq(fixture.calls, 1)
            test.eq(fixture.writes, 2)
        end)
        test.it("already removed thread stays complete/" .. dialect, function()
            fixture.reset("state", nil, dialect)
            fixture.missing, fixture.proof = true, {}
            local value, err = call("state")
            test.is_nil(err)
            test.is_true(value)
            test.eq(fixture.calls, 0)
            test.eq(fixture.writes, 0)
        end)
        test.it("removed mark proof stays successful/" .. dialect, function()
            fixture.reset("mark_proof", nil, dialect)
            fixture.missing, fixture.proof = true, {}
            local _, err = call("mark_proof")
            test.is_nil(err)
        end)
        test.it("done state stays complete/" .. dialect, function()
            fixture.reset("state", nil, dialect)
            fixture.missing, fixture.proof = true, {{teardown_fence_done = 1}}
            local value, err = call("state")
            test.is_nil(err)
            test.is_true(value)
            test.eq(fixture.calls, 0)
            test.eq(fixture.writes, 0)
        end)
        test.it("one hundred consumers keep the bounded continuation/" .. dialect, function()
            fixture.reset("", nil, dialect)
            fixture.pins = {}
            for i = 1, 101 do fixture.pins[i] = {consumer_key = "drive:subscriber:source" .. i} end
            local value, err = call("")
            test.is_nil(value)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.is_true(err:retryable())
            test.is_true(err:details().cleanup_pending)
            test.is_true(err:details().needs_continue)
            test.eq(fixture.calls, 100)
            test.eq(fixture.writes, 1)
        end)
        test.it("unowned consumer remains cleanup pending/" .. dialect, function()
            fixture.reset("", nil, dialect)
            fixture.pins = {{consumer_key = "other:consumer"}}
            local value, err = call("")
            test.is_nil(value)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.is_true(err:retryable())
            test.is_true(err:details().cleanup_pending)
            test.is_false(err:details().needs_continue)
            test.eq(fixture.writes, 0)
        end)
        test.it("empty consumer page stays complete/" .. dialect, function()
            fixture.reset("", nil, dialect)
            fixture.pins = {}
            local value, err = call("")
            test.is_nil(err)
            test.is_true(value)
            test.eq(fixture.calls, 0)
            test.eq(fixture.writes, 1)
        end)
        test.it("self consumers need no source contract/" .. dialect, function()
            fixture.reset("", nil, dialect)
            fixture.pins = {{consumer_key = "self:source"}, {consumer_key = "drive:source:owner"}}
            local value, err = call("")
            test.is_nil(err)
            test.is_true(value)
            test.eq(fixture.calls, 0)
        end)
    end
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native thread teardown fence dependencies 1", function() dependencies(1, 3) end),
    run_dependencies_2 = group("native thread teardown fence dependencies 2", function() dependencies(4, 6) end),
    run_dependencies_3 = group("native thread teardown fence dependencies 3", function() dependencies(7, 10) end),
    run_proofs = group("native thread teardown fence proofs", proofs),
}
