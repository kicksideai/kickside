local test = require("test")
local row = require("row")
local live = require("live")
local fixture = require("fixture")
local sql = require("sql")
local uuid = require("uuid")
local input = {thread_class = "native-row", attrs = "{}", parent_id = "parent"}
return {run = test.run_cases(function()
    test.describe("native thread row persistence", function()
        for _, stage in ipairs({"decode", "insert", "parent", "edge"}) do
            for _, message in ipairs({"dependency refusal", "unique is incidental diagnostic text"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(stage .. "/" .. message .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local native = errors.new({kind = kind, message = message, retryable = options.retryable,
                                details = {code = "thread_row_dependency", nested = {stage = stage}}})
                            fixture.reset(stage, native)
                            local err = row.insert(fixture.transaction(), sql.type.SQLITE, "thread", input)
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), native:kind())
                            test.eq(err:retryable(), native:retryable())
                            test.eq(err:details().code, "thread_row_dependency")
                            test.eq(err:details().nested.stage, stage)
                            test.eq(fixture.writes, stage == "decode" and 0 or (stage == "edge" and 2 or 1))
                        end)
                    end
                end
            end
        end
        for _, stage in ipairs({"insert_proof", "edge_proof", "parent_proof"}) do
            local proofs = stage == "parent_proof" and {{label = "missing"}, {label = "boolean", value = false}}
                or {{label = "missing"}, {label = "boolean", value = false}, {label = "empty", value = {}},
                    {label = "negative", value = {rows_affected = -1}}, {label = "fractional", value = {rows_affected = 0.5}},
                    {label = "multiple", value = {rows_affected = 2}}}
            for _, proof in ipairs(proofs) do
                test.it(stage .. "/" .. proof.label, function()
                    fixture.reset(stage, nil)
                    fixture.proof = proof.value
                    local err = row.insert(fixture.transaction(), sql.type.SQLITE, "thread", input)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "thread_row_response")
                    test.eq(err:details().field, stage == "parent_proof" and "parent.rows"
                        or (stage == "insert_proof" and "insert.rows_affected" or "edge.rows_affected"))
                end)
            end
        end
        test.it("zero insertion proof is a permanent native thread conflict", function()
            fixture.reset("duplicate", nil)
            local err = row.insert(fixture.transaction(), sql.type.SQLITE, "thread", input)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.is_false(err:retryable())
            test.eq(err:details().conflict, row.THREAD_CONFLICT)
            test.eq(err:details().code, "thread_already_exists")
            test.eq(fixture.writes, 1)
            test.eq(fixture.queries, 0)
        end)
        test.it("an absent parent leaves the inserted row without an edge", function()
            fixture.reset("absent_parent", nil)
            test.is_nil(row.insert(fixture.transaction(), sql.type.SQLITE, "thread", input))
            test.eq(fixture.writes, 1)
        end)
        test.it("a resolved parent retains the existing row and edge behavior", function()
            fixture.reset("", nil)
            test.is_nil(row.insert(fixture.transaction(), sql.type.SQLITE, "thread", input))
            test.eq(fixture.writes, 2)
            test.eq(fixture.queries, 1)
        end)
        test.it("a real duplicate preserves the existing row and caller transaction", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error(errors.new({kind = errors.INTERNAL, message = "test database is missing"})) end
            local dbtype, type_err = db:type()
            test.is_nil(type_err)
            if type(dbtype) ~= "string" then error(errors.new({kind = errors.INTERNAL, message = "test dialect is missing"})) end
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            if not tx then error(errors.new({kind = errors.INTERNAL, message = "test transaction is missing"})) end
            local id = uuid.v7()
            test.is_nil(live.insert(tx, dbtype, id, {thread_class = "native-row-original", attrs = '{"value":1}'}))
            local err = live.insert(tx, dbtype, id, {thread_class = "native-row-replacement", attrs = '{"value":2}'})
            test.is_true(errors.is(err, errors.CONFLICT))
            test.is_false(err:retryable())
            test.eq(err:details().conflict, live.THREAD_CONFLICT)
            test.eq(err:details().code, "thread_already_exists")
            local rows, read_err = tx:query("SELECT thread_class,attrs FROM kickside_thread WHERE id=$1", {id})
            local _, rollback_err = tx:rollback()
            db:release()
            test.is_nil(read_err)
            test.is_nil(rollback_err)
            test.eq(#rows, 1)
            test.eq(rows[1].thread_class, "native-row-original")
            test.eq(require("json").decode(rows[1].attrs).value, 1)
        end)
    end)
end)}
