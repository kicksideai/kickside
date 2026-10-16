local test = require("test")
local sweeper = require("sweeper")
local fixture = require("fixture")
local sql = require("sql")
local function head(changes: table): table
    local row = {id = "thread", seq = 1, pin_floor = 1, projection_floor = 1,
        eligibility_ms = 1000, created_at = "2000-01-01 00:00:00", head_created_at = "2000-01-01 00:00:00"}
    for key, value in pairs(changes) do row[key] = value end
    return row
end
return {run = test.run_cases(function()
    test.describe("permanent retention sweeper response failures", function()
        for _, method in ipairs({"run", "run_for_thread", "next_deadline_ms"}) do
            local query_field = method == "run" and "candidates.query"
                or method == "run_for_thread" and "thread_policy.query" or "event_deadlines.query"
            for _, response in ipairs({{}, {value = "invalid"}, {value = {false}},
                {value = {unexpected = {}}}, {value = {[2] = {}}}}) do
                test.it(method .. "/heads/" .. tostring(response.value), function()
                    fixture.reset(method, "", nil, sql.type.SQLITE)
                    fixture.responses.heads = response
                    local ok, result, err = pcall(sweeper[method], fixture.database(), "thread")
                    test.is_true(ok)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), errors.INTERNAL)
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "retention_sweeper_response")
                    test.eq(err:details().field, query_field)
                    test.eq(fixture.queries, 1)
                    test.eq(fixture.prunes, 0)
                    test.eq(fixture.purges, 0)
                end)
            end
            local fields = {type = "db.type", policy = "policy"}
            if method ~= "next_deadline_ms" then fields.prune = "prune.deleted" end
            if method == "run" then fields.purge = "purge.deleted" end
            for stage, field in pairs(fields) do
                local responses = stage == "type" and {{}} or {{}, {value = false}, {value = {}}}
                for _, response in ipairs(responses) do
                    test.it(method .. "/" .. stage .. "/" .. tostring(response.value), function()
                        fixture.reset(method, "", nil, sql.type.SQLITE)
                        fixture.responses[stage] = response
                        local ok, result, err = pcall(sweeper[method], fixture.database(), "thread")
                        test.is_true(ok)
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), errors.INTERNAL)
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, "retention_sweeper_response")
                        test.eq(err:details().field, field)
                        if stage ~= "purge" then test.eq(fixture.purges, 0) end
                    end)
                end
            end
        end
        for _, response in ipairs({{}, {value = false}, {value = {false}}, {value = {unexpected = {}}}}) do
            test.it("next_deadline_ms/receipts/" .. tostring(response.value), function()
                fixture.reset("next_deadline_ms", "", nil, sql.type.SQLITE)
                fixture.responses.receipts = response
                local ok, result, err = pcall(sweeper.next_deadline_ms, fixture.database())
                test.is_true(ok)
                test.is_nil(result)
                test.eq(err:kind(), errors.INTERNAL)
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "retention_sweeper_response")
                test.eq(err:details().field, "receipt_deadline.query")
            end)
        end
        for _, case in ipairs({
            {method = "run", value = head({id = ""}), field = "candidate.id"},
            {method = "run", value = head({event_hot_retention_days = 0}), field = "event_hot_retention_days"},
            {method = "run_for_thread", value = head({event_hot_retention_days = "invalid"}), field = "event_hot_retention_days"},
            {method = "next_deadline_ms", value = head({seq = "invalid"}), field = "event.seq"},
            {method = "run", value = head({head_created_at = "invalid"}), field = "timestamp"},
            {method = "next_deadline_ms", value = head({created_at = "invalid"}), field = "timestamp"},
        }) do
            test.it(case.method .. "/" .. case.field, function()
                fixture.reset(case.method, "", nil, sql.type.SQLITE)
                fixture.responses.heads = {value = {case.value}}
                local ok, result, err = pcall(sweeper[case.method], fixture.database(), "thread")
                test.is_true(ok)
                test.is_nil(result)
                test.eq(err:kind(), errors.INTERNAL)
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "retention_sweeper_response")
                test.eq(err:details().field, case.field)
                test.eq(fixture.prunes, 0)
                test.eq(fixture.purges, 0)
            end)
        end
        test.it("requires the Postgres native event deadline proof", function()
            fixture.reset("next_deadline_ms", "", nil, sql.type.POSTGRES)
            fixture.responses.heads = {value = {head({eligibility_ms = false})}}
            local result, err = sweeper.next_deadline_ms(fixture.database())
            test.is_nil(result)
            test.eq(err:kind(), errors.INTERNAL)
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "retention_sweeper_response")
            test.eq(err:details().field, "event.eligibility_ms")
            test.eq(fixture.queries, 1)
        end)
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, method in ipairs({"run", "run_for_thread", "next_deadline_ms"}) do
                test.it("retains empty candidates/" .. dialect .. "/" .. method, function()
                    fixture.reset(method, "", nil, dialect)
                    fixture.responses.heads, fixture.responses.receipts = {value = {}}, {value = {}}
                    local result, err = sweeper[method](fixture.database(), "thread")
                    test.is_nil(err)
                    if method ~= "next_deadline_ms" then test.eq(result.events, 0) else test.is_nil(result) end
                    test.eq(fixture.prunes, 0)
                end)
            end
        end
    end)
end)}
