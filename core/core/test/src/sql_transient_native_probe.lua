local sql = require("sql")
local test = require("test")
local json = require("json")
local function required(value: any, err: error?): any
    if err then error(err) end
    if not value then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL transient probe requires an owned binding"})) end
    return value
end
local function data(err: error): table
    return {kind = err:kind(), message = err:message(), retryable = err:retryable(), details = err:details()}
end
local function fields(source: error): ()
    test.eq(source:kind(), errors.CONFLICT); test.eq(source:retryable(), true)
    local wrapped = errors.wrap(source, "opaque probe context")
    test.eq(wrapped:kind(), source:kind()); test.eq(wrapped:retryable(), source:retryable())
    test.eq(required(json.encode(wrapped:details())), required(json.encode(source:details())))
    print("NATIVE_SQL_TRANSIENT " .. required(json.encode({source = data(source), wrapped = data(wrapped)})))
end
return {run = test.run_cases(function()
    test.describe("real structured SQL transient errors", function()
        test.it("driver kind and details survive wrapping", function()
            local db = required(sql.get("app:sql_transient_first")); local other = required(sql.get("app:sql_transient_second"))
            local tx: any = nil
            local ok, result = pcall(function()
                if db:type() == sql.type.POSTGRES then
                    for _, state in ipairs({"40001", "40P01", "55P03"}) do
                        local _, source = db:execute("DO $$ BEGIN RAISE EXCEPTION 'opaque database refusal' USING ERRCODE='" .. state .. "'; END $$")
                        test.not_nil(source)
                        if not source then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL transient probe requires native driver refusal"})) end
                        fields(source); test.eq(source:details().sqlstate, state)
                    end
                else
                    required(db:execute("CREATE TABLE native_sql_transient_probe (id INTEGER PRIMARY KEY)"))
                    tx = required(db:begin()); required(tx:execute("INSERT INTO native_sql_transient_probe VALUES (1)"))
                    local _, source = other:execute("INSERT INTO native_sql_transient_probe VALUES (2)")
                    test.not_nil(source)
                    if not source then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL transient probe requires SQLite writer refusal"})) end
                    fields(source); local details = source:details()
                    test.is_true(details.sqlite_code == 5 or details.sqlite_code == 6)
                    test.eq(type(details.sqlite_extended_code), "number")
                end
            end)
            if tx then local _, err = tx:rollback(); test.is_nil(err) end
            local _, other_err = other:release(); test.is_nil(other_err)
            local _, db_err = db:release(); test.is_nil(db_err)
            if not ok then error(result) end
        end)
    end)
end)}
