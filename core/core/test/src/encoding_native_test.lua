local test = require("test")
local definitions = require("encoding_definition")
local callbacks = definitions[1].database_implementations

return {run = test.run_cases(function()
    test.describe("native encoding migration failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("query/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({message = "encoding query failure", kind = kind,
                        retryable = options.retryable, details = {code = "encoding_dependency", nested = {marker = "kept"}}})
                    local calls = 0
                    local ok, err = pcall(callbacks.postgres.up, {query = function()
                        calls = calls + 1
                        return nil, source
                    end})
                    test.is_false(ok)
                    test.eq(calls, 1)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "encoding_dependency")
                    test.eq(err:details().nested.marker, "kept")
                end)
            end
        end
        for _, input in ipairs({{name = "missing"}, {name = "empty", rows = {}},
            {name = "absent encoding", rows = {{}}}, {name = "empty encoding", rows = {{enc = ""}}},
            {name = "numeric encoding", rows = {{enc = 42}}}, {name = "boolean encoding", rows = {{enc = false}}},
            {name = "scalar result", rows = "UTF8"}}) do
            test.it("rejects a malformed result: " .. input.name, function()
                local ok, err = pcall(callbacks.postgres.up, {query = function() return input.rows, nil end})
                test.is_false(ok)
                test.eq(type(err), "userdata")
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "migration_encoding_result")
                test.eq(err:details().field, "database.encoding")
            end)
        end
        for _, encoding in ipairs({"SQL_ASCII", "LATIN1", "WIN1252"}) do
            test.it("refuses unsupported encoding " .. encoding, function()
                local ok, err = pcall(callbacks.postgres.up, {query = function() return {{enc = encoding}}, nil end})
                test.is_false(ok)
                test.eq(type(err), "userdata")
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "migration_encoding")
                test.eq(err:details().field, "database.encoding")
            end)
        end
        test.it("accepts UTF8 with exactly one read", function()
            local calls = 0
            local ok, err = pcall(callbacks.postgres.up, {query = function()
                calls = calls + 1
                return {{enc = "UTF8"}}, nil
            end})
            test.is_true(ok)
            test.is_nil(err)
            test.eq(calls, 1)
        end)
        test.it("keeps SQLite and rollback free of SQL", function()
            for _, callback in ipairs({callbacks.sqlite.up, callbacks.sqlite.down, callbacks.postgres.down}) do
                local ok, err = pcall(callback, {query = function() error("unexpected query") end,
                    execute = function() error("unexpected execute") end})
                test.is_true(ok)
                test.is_nil(err)
            end
        end)
    end)
end)}
