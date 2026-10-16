local test = require("test")
local writer = require("writer")
local fixture = require("fixture")
local sql = require("sql")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "registration SQL proof guard requires an error"})) end
    return err
end
local function invoke(ensure: boolean?): (any, error?)
    return writer.register_projection(fixture.database(), "thread", {kind = "model", worker_ref = "func://app:test_count_worker",
        system_identity = true, ensure = ensure})
end
return {run = test.run_cases(function()
    test.describe("native registration SQL reply proof", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            local row = {id = "row", event_count = 0, max_pruned_seq = 0, body = "{}", last_seq = 0, generation = 1, job_id = "job"}
            local collections = {{label = "missing"}, {label = "false", value = false}, {label = "number", value = 1},
                {label = "string", value = ""}, {label = "dictionary", value = {row = row}},
                {label = "sparse", value = {[2] = row}}, {label = "scalar-entry", value = {true}},
                {label = "fractional-index", value = {[1.5] = row}}, {label = "metadata-entry", value = {row, meta = row}},
                {label = "excess-cardinality", value = {row, row}}}
            for _, stage in ipairs({"query_1", "query_2", "query_3"}) do
                for _, proof in ipairs(collections) do
                    test.it(dialect .. "/" .. stage .. "/" .. proof.label, function()
                        fixture.reset(dialect, "", nil, false); fixture.proof_stage, fixture.proof = stage, proof.value
                        local ok, value, err = pcall(function() return invoke() end)
                        test.is_true(ok); test.is_nil(value); local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "projection_registration_response")
                        test.eq(fixture.writes, stage == "query_3" and 1 or 0)
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0)
                    end)
                end
            end
            local outcomes = {{label = "missing"}, {label = "false", value = false}, {label = "number", value = 1},
                {label = "string", value = ""}, {label = "absent-count", value = {}},
                {label = "invalid-count", value = {rows_affected = "invalid"}},
                {label = "negative-count", value = {rows_affected = -1}},
                {label = "fractional-count", value = {rows_affected = 0.5}},
                {label = "excess-count", value = {rows_affected = 2}}}
            for _, existing in ipairs({false, true}) do
                for index = 1, 4 do
                    local stage = "write_" .. tostring(index)
                    for _, proof in ipairs(outcomes) do
                        test.it(dialect .. "/" .. tostring(existing) .. "/" .. stage .. "/" .. proof.label, function()
                            fixture.reset(dialect, "", nil, existing); fixture.proof_stage, fixture.proof = stage, proof.value
                            local ok, value, err = pcall(function() return invoke() end)
                            test.is_true(ok); test.is_nil(value); local actual = required(err)
                            test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                            test.eq(actual:details().code, (not existing and index == 1) and "projection_insert_result_invalid" or "projection_registration_response")
                            test.eq(fixture.writes, index); test.eq(fixture.rollbacks, 1)
                            test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0)
                        end)
                    end
                    test.it("native numeric string count/" .. dialect .. "/" .. tostring(existing) .. "/" .. stage, function()
                        fixture.reset(dialect, "", nil, existing); fixture.proof_stage, fixture.proof = stage, {rows_affected = "1"}
                        local value, err = invoke(); test.is_nil(err); test.not_nil(value)
                        test.eq(fixture.commits, 1); test.eq(fixture.notifications, 1)
                    end)
                    test.it("zero matched rows/" .. dialect .. "/" .. tostring(existing) .. "/" .. stage, function()
                        fixture.reset(dialect, "", nil, existing); fixture.proof_stage, fixture.proof = stage, {rows_affected = 0}
                        local value, err = invoke()
                        if index == 4 then
                            test.is_nil(err); test.not_nil(value); test.eq(fixture.commits, 1)
                        else
                            test.is_nil(value); local actual = required(err)
                            test.is_false(actual:retryable())
                            if not existing and index == 1 then
                                test.is_true(errors.is(actual, errors.CONFLICT)); test.eq(actual:details().code, "projection_already_exists")
                            else test.is_true(errors.is(actual, errors.INTERNAL)); test.eq(actual:details().code, "projection_registration_response") end
                            test.eq(fixture.commits, 0); test.eq(fixture.rollbacks, 1)
                        end
                    end)
                end
            end
            for _, proof in ipairs(outcomes) do
                test.it("refresh fence reply/" .. dialect .. "/" .. proof.label, function()
                    fixture.reset(dialect, "", nil, true)
                    fixture.body = '{"meta":{}}'
                    fixture.proof_stage, fixture.proof = "write_2", proof.value
                    local value, err = invoke(true)
                    if proof.label == "excess-count" then
                        test.is_nil(err); test.not_nil(value)
                        test.eq(fixture.commits, 1)
                    else
                        test.is_nil(value); local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().field, "cursor.fence")
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0)
                    end
                end)
            end
            test.it("refresh fence retains native dependency failure/" .. dialect, function()
                local source = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "fence fails",
                    details = {code = "refresh_fence_dependency"}})
                fixture.reset(dialect, "write_2", source, true)
                fixture.body = '{"meta":{}}'
                local value, err = invoke(true)
                test.is_nil(value); local actual = required(err)
                test.is_true(errors.is(actual, errors.UNAVAILABLE)); test.is_true(actual:retryable())
                test.eq(actual:details().code, "refresh_fence_dependency")
                test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0)
            end)
            test.it("confirmed thread absence remains NotFound/" .. dialect, function()
                fixture.reset(dialect, "", nil, false); fixture.proof_stage, fixture.proof = "query_1", {}
                local value, err = invoke(); test.is_nil(value); test.is_true(errors.is(required(err), errors.NOT_FOUND))
                test.eq(fixture.writes, 0); test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
            end)
            test.it("existing ensure accepts a zero-row conditional state transition/" .. dialect, function()
                fixture.reset(dialect, "", nil, true); fixture.proof_stage, fixture.proof = "write_2", {rows_affected = 0}
                local value, err = invoke(true); test.is_nil(err); test.not_nil(value)
                test.eq(fixture.writes, 2); test.eq(fixture.commits, 1)
            end)
        end
    end)
end)}
