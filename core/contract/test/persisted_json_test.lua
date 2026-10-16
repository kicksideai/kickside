local test = require("test")
local sql = require("sql")
local persisted_json = require("persisted_json")

local function stored(raw: any): any
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("database unavailable: " .. tostring(db_err)) end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS contract_json_fixture (id INTEGER PRIMARY KEY, payload TEXT)")
    if create_err then db:release(); error(tostring(create_err)) end
    local _, write_err = sql.builder.insert("contract_json_fixture")
        :set_map({ id = 1, payload = raw })
        :suffix("ON CONFLICT (id) DO UPDATE SET payload=excluded.payload")
        :run_with(db):exec()
    if write_err then db:release(); error(tostring(write_err)) end
    local rows, read_err = db:query("SELECT payload FROM contract_json_fixture WHERE id=1")
    local _, release_err = db:release()
    if read_err or release_err then error(tostring(read_err or release_err)) end
    return rows[1].payload
end

local function define_tests()
    test.describe("persisted JSON boundary", function()
        test.it("decodes durable object and array values without changing their contents", function()
            local object, object_err = persisted_json.decode_table(stored('{"value":7}'), "fixture.payload")
            test.is_nil(object_err)
            test.eq(object.value, 7)
            local array, array_err = persisted_json.decode_table(stored('[1,2]'), "fixture.payload")
            test.is_nil(array_err)
            test.eq(array[1], 1)
            test.eq(array[2], 2)
        end)

        test.it("admits SQL NULL only for a declared nullable column", function()
            local value, err = persisted_json.decode_table(stored(nil), "fixture.payload", true)
            test.is_nil(value)
            test.is_nil(err)
            local required, required_err = persisted_json.decode_table(stored(nil), "fixture.payload")
            test.is_nil(required)
            test.is_true(errors.is(required_err, errors.INTERNAL))
            test.eq(required_err:retryable(), false)
            test.eq(required_err:details().field, "fixture.payload")
        end)

        test.it("reports malformed non-null storage instead of manufacturing an empty value", function()
            for _, raw in ipairs({ "{", "", "null", "false", "7", '"text"' }) do
                for _, nullable in ipairs({ true, false }) do
                    local value, err = persisted_json.decode_table(stored(raw), "fixture.payload", nullable)
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "persisted_data")
                    test.eq(err:details().error_kind, "persisted_data")
                    test.eq(err:details().field, "fixture.payload")
                end
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
