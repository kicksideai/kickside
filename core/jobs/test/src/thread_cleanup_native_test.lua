local test = require("test")
local sql = require("sql")
local cleanup = require("cleanup")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local routes = {
    {api = "page", mode = "empty", stages = {"begin", "fence", "candidate_1", "candidate_2", "candidate_3", "candidate_4", "continuation_1", "continuation_2", "encode_1", "encode_2", "insert", "state", "commit"},
        proofs = {"begin", "fence", "candidate_1", "encode_1", "encode_2", "insert", "state"}, counts = {"insert", "state"}},
    {api = "page", mode = "selected", stages = {"mutation_1", "mutation_2"}, proofs = {}, counts = {"mutation_1", "mutation_2"}},
    {api = "page", mode = "prior", stages = {"previous", "previous_ack"}, proofs = {"previous", "previous_ack"}, counts = {"previous_ack"}},
    {api = "page", mode = "replay", stages = {"receipt", "decode_1", "decode_2", "commit"}, proofs = {"receipt", "decode_1", "decode_2"}, counts = {}},
    {api = "reclaim", mode = "empty", stages = {"owners", "begin", "fence", "candidate_1", "candidate_2", "candidate_3", "candidate_4", "continuation_1", "continuation_2", "commit"}, proofs = {"owners", "begin", "candidate_1"}, counts = {}},
    {api = "reclaim", mode = "selected", stages = {"mutation_1", "mutation_2"}, proofs = {}, counts = {"mutation_1", "mutation_2"}},
    {api = "ack", mode = "empty", stages = {"begin", "fence", "receipt", "ack_update", "completed", "commit"}, proofs = {"begin", "receipt", "ack_update", "completed"}, counts = {"ack_update", "completed"}},
}
local function invoke(route, dialect): (any?, error?)
    local db = fixture.database()
    if route.api == "page" then return cleanup.page(db, dialect, "thread", route.mode == "prior" and 1 or 0) end
    if route.api == "reclaim" then return cleanup.reclaim_completed(db, dialect, 8) end
    return cleanup.ack(db, dialect, "thread", 0, true)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cleanup guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error, secondary: boolean?): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "cleanup_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    elseif secondary then test.is_nil(actual:details().code)
    else test.is_nil(actual:details()) end
end
local function refusal(route, dialect): ()
    local ok, value, err = pcall(function() return invoke(route, dialect) end)
    test.is_true(ok)
    test.is_nil(value)
    local actual = required(err)
    test.is_true(errors.is(actual, errors.INTERNAL))
    test.is_false(actual:retryable())
    test.eq(actual:details().code, "job_thread_cleanup_response")
    test.eq(fixture.commits, 0)
end
local function group(first: integer, last: integer): any
    return test.run_cases(function()
    test.describe("native thread cleanup failures", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for route_index = first, last do
                local route = routes[route_index]
                local stages = {}
                for _, stage in ipairs(route.stages) do stages[#stages + 1] = stage end
                if route.mode == "selected" and dialect == sql.type.POSTGRES then
                    stages[#stages + 1], stages[#stages + 2] = "lock_job", "lock_run"
                end
                for _, stage in ipairs(stages) do
                    for _, kind in ipairs(kinds) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            for _, detailed in ipairs({false, true}) do
                                test.it(dialect .. "/" .. route.api .. "/" .. route.mode .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                    local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                        details = detailed and {code = "cleanup_dependency", nested = {marker = "kept"}} or nil})
                                    fixture.reset(route.api, route.mode, stage, source)
                                    local value, err = invoke(route, dialect)
                                    test.is_nil(value)
                                    retains(required(err), source)
                                    test.eq(fixture.commits, stage == "commit" and 1 or 0)
                                end)
                            end
                        end
                    end
                end
                for _, kind in ipairs(kinds) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it("rollback/" .. dialect .. "/" .. route.api .. "/" .. route.mode .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "rollback refusal", retryable = policy.retryable,
                                    details = detailed and {code = "cleanup_dependency", nested = {marker = "kept"}} or nil})
                                local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "primary refusal", retryable = false,
                                    details = {code = "cleanup_primary", nested = {marker = "primary"}}})
                                fixture.reset(route.api, route.mode, "rollback", source)
                                fixture.primary = primary
                                local value, err = invoke(route, dialect)
                                test.is_nil(value)
                                local actual = required(err)
                                retains(actual, source, true)
                                test.eq(actual:details().operation_error.kind, primary:kind())
                                test.eq(actual:details().operation_error.retryable, primary:retryable())
                                test.eq(actual:details().operation_error.details.code, "cleanup_primary")
                                test.eq(actual:details().operation_error.details.nested.marker, "primary")
                                test.eq(fixture.rollbacks, 1)
                                test.eq(fixture.commits, 0)
                            end)
                        end
                    end
                end
                for _, stage in ipairs(route.proofs) do
                    test.it("missing/" .. dialect .. "/" .. route.api .. "/" .. route.mode .. "/" .. stage, function()
                        fixture.reset(route.api, route.mode, stage, nil)
                        fixture.missing = true
                        refusal(route, dialect)
                    end)
                end
                for _, stage in ipairs(route.counts) do
                    for _, count in ipairs({0, -1, 0.5, 2, "bad"}) do
                        test.it("count/" .. dialect .. "/" .. route.api .. "/" .. route.mode .. "/" .. stage .. "/" .. tostring(count), function()
                            fixture.reset(route.api, route.mode, stage, nil)
                            fixture.missing, fixture.value = true, {rows_affected = count}
                            refusal(route, dialect)
                        end)
                    end
                end
                test.it("success/" .. dialect .. "/" .. route.api .. "/" .. route.mode, function()
                    fixture.reset(route.api, route.mode, "", nil)
                    local value, err = invoke(route, dialect)
                    test.is_nil(err)
                    if route.api == "page" then
                        test.eq(value.thread_id, "thread")
                        test.eq(value.page_seq, route.mode == "prior" and 1 or 0)
                        test.eq(value.processed, route.mode == "selected" and 4 or (route.mode == "replay" and 1 or 0))
                        test.is_true(value.done)
                    elseif route.api == "reclaim" then test.eq(value, route.mode == "selected" and 4 or 0)
                    else test.is_true(value) end
                    test.eq(fixture.rollbacks, 0)
                    test.eq(fixture.commits, 1)
                end)
            end
        end
    end)
end)
end
return {
    run = group(1, 1),
    run_selected = group(2, 2),
    run_receipts = group(3, 3),
    run_replay = group(4, 4),
    run_reclaim = group(5, 5),
    run_reclaim_selected = group(6, 6),
    run_ack = group(7, 7),
}
