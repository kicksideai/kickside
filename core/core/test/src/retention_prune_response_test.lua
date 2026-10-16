local test = require("test")
local prune = require("prune")
local fixture = require("fixture")
local sql = require("sql")
return {run = test.run_cases(function()
    test.describe("permanent retention prune SQL proof failures", function()
        local cases = {
            {dialect = sql.type.SQLITE, method = "query", index = 1, field = "thread.query"},
            {dialect = sql.type.POSTGRES, method = "query", index = 1, field = "thread.query"},
            {dialect = sql.type.SQLITE, method = "query", index = 2, field = "prefix.query"},
            {dialect = sql.type.POSTGRES, method = "query", index = 2, field = "prefix.query"},
        }
        for _, case in ipairs(cases) do
            for _, input in ipairs({{name = "nil"}, {name = "false", value = false},
                {name = "number", value = 42}, {name = "string", value = "bad"},
                {name = "row-false", value = {false}}, {name = "row-number", value = {42}},
                {name = "row-string", value = {"bad"}}}) do
                test.it(case.dialect .. "/" .. case.field .. "/" .. input.name, function()
                    fixture.reset("", nil, case.dialect)
                    fixture.respond(case.method, case.index, input.value)
                    local ok, result, err = pcall(prune.prune_tx, fixture.transaction(), "thread", {cutoff = "2026-01-01"})
                    test.is_true(ok)
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "retention_prune_response")
                    test.eq(err:details().field, case.field)
                    test.eq(fixture.queries, case.index)
                    test.eq(fixture.writes, 0)
                end)
            end
        end
        for _, input in ipairs({
            {name = "empty", value = {}, field = "prefix.query"},
            {name = "missing-count", value = {{max_pruned_seq = 5, boundary_updates = 1}}, field = "prefix.deleted"},
            {name = "invalid-count", value = {{deleted = "bad", max_pruned_seq = 5, boundary_updates = 1}}, field = "prefix.deleted"},
            {name = "missing-proof", value = {{deleted = 1, max_pruned_seq = 5}}, field = "prefix.boundary_updates"},
            {name = "zero-proof", value = {{deleted = 1, max_pruned_seq = 5, boundary_updates = 0}}, field = "prefix.boundary_updates"},
        }) do
            test.it("postgres prefix proof/" .. input.name, function()
                fixture.reset("", nil, sql.type.POSTGRES)
                fixture.respond("query", 2, input.value)
                local result, err = prune.prune_tx(fixture.transaction(), "thread", {cutoff = "2026-01-01"})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "retention_prune_response")
                test.eq(err:details().field, input.field)
                test.eq(fixture.queries, 2)
                test.eq(fixture.writes, 0)
            end)
        end
        for _, index in ipairs({1, 2}) do
            for _, input in ipairs({{name = "nil"}, {name = "missing-count", value = {}},
                {name = "invalid-count", value = {rows_affected = "bad"}}, {name = "zero-count", value = {rows_affected = 0}}}) do
                test.it("sqlite write proof/" .. index .. "/" .. input.name, function()
                    fixture.reset("", nil, sql.type.SQLITE)
                    fixture.respond("execute", index, input.value)
                    local result, err = prune.prune_tx(fixture.transaction(), "thread", {cutoff = "2026-01-01"})
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "retention_prune_response")
                    test.eq(err:details().field, index == 1 and "delete.rows_affected" or "boundary.rows_affected")
                    test.eq(fixture.queries, 2)
                    test.eq(fixture.writes, index)
                end)
            end
        end
        test.it("retains an absent thread as native NotFound", function()
            fixture.reset("", nil, sql.type.SQLITE)
            fixture.respond("query", 1, {})
            local result, err = prune.prune_tx(fixture.transaction(), "thread", {cutoff = "2026-01-01"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.eq(fixture.queries, 1)
            test.eq(fixture.writes, 0)
        end)
        for _, rows in ipairs({{}, {{}}}) do
            test.it("retains an empty/null SQLite eligible prefix/" .. #rows, function()
                fixture.reset("", nil, sql.type.SQLITE)
                fixture.respond("query", 2, rows)
                local result, err = prune.prune_tx(fixture.transaction(), "thread", {cutoff = "2026-01-01"})
                test.is_nil(err)
                test.eq(result.deleted, 0)
                test.eq(result.max_pruned_seq, 0)
                test.eq(fixture.queries, 2)
                test.eq(fixture.writes, 0)
            end)
        end
    end)
end)}
