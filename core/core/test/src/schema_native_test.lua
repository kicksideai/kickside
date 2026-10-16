local test = require("test")
local definitions = require("schema_definition")
local callbacks = definitions[1].database_implementations
local names = {"key_digest", "key_class", "key_ref", "thread_id", "origin", "ready"}
local required = {"PRIMARY KEY (key_digest)", "UNIQUE (thread_id)", "REFERENCES kickside_thread(id) ON DELETE CASCADE"}

local function fixture(engine, options)
    local types = {engine == "postgres" and "bytea" or "blob", "text", "text",
        engine == "postgres" and "uuid" or "text", "text", engine == "postgres" and "boolean" or "integer"}
    local columns = {}
    for index, name in ipairs(names) do
        columns[index] = {name = name, type = types[index], is_nullable = "NO", notnull = 1}
    end
    local constraints = {{definition = table.concat(required, ", ")}}
    if options.missing_columns then columns = {} end
    if options.column then columns[options.column][options.attribute] = options.value end
    if options.missing_constraint then
        local retained = {}
        for index, declaration in ipairs(required) do
            if index ~= options.missing_constraint then table.insert(retained, declaration) end
        end
        constraints = {{definition = table.concat(retained, ", ")}}
    end
    if options.raw_columns then columns = options.raw_columns end
    if options.raw_constraints then constraints = options.raw_constraints end
    local calls = {}
    local db = {execute = function()
        table.insert(calls, "create")
        if options.stage == "create" then return nil, options.source end
        return true, nil
    end, query = function()
        local stage = #calls == 1 and "columns" or "constraints"
        table.insert(calls, stage)
        if options.stage == stage then return nil, options.source end
        if stage == "columns" then return columns, nil end
        return constraints, nil
    end}
    return db, calls
end

local function group(stages, proofs)
return test.run_cases(function()
    test.describe("native natural-key schema migration failures", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            for _, stage in ipairs(stages) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(engine .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({message = "schema query failure", kind = kind,
                                retryable = options.retryable, details = {code = "schema_dependency", nested = {stage = stage}}})
                            local db, calls = fixture(engine, {stage = stage, source = source})
                            local ok, err = pcall(callbacks[engine].up, db)
                            test.is_false(ok)
                            test.eq(#calls, ({create = 1, columns = 2, constraints = 3})[stage])
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "schema_dependency")
                            test.eq(err:details().nested.stage, stage)
                        end)
                    end
                end
            end
            if proofs then
            local invalid = {{name = "missing columns", missing_columns = true, field = "columns"}}
            for index, name in ipairs(names) do
                table.insert(invalid, {name = "name/" .. name, column = index, attribute = "name", value = "unexpected", field = name})
                table.insert(invalid, {name = "type/" .. name, column = index, attribute = "type", value = "unexpected", field = name})
                table.insert(invalid, {name = "nullable/" .. name, column = index,
                    attribute = engine == "postgres" and "is_nullable" or "notnull", value = engine == "postgres" and "YES" or 0, field = name})
            end
            for index = 1, #required do
                table.insert(invalid, {name = "constraint/" .. index, missing_constraint = index, field = "constraints"})
            end
            table.insert(invalid, {name = "numeric column result", raw_columns = 42, field = "columns"})
            table.insert(invalid, {name = "scalar column result", raw_columns = "columns", field = "columns"})
            table.insert(invalid, {name = "missing column type", column = 1, attribute = "type", field = "key_digest"})
            table.insert(invalid, {name = "numeric column type", column = 1, attribute = "type", value = 42, field = "key_digest"})
            table.insert(invalid, {name = "numeric constraint result", raw_constraints = 42, field = "constraints"})
            table.insert(invalid, {name = "scalar constraint result", raw_constraints = "constraints", field = "constraints"})
            table.insert(invalid, {name = "missing definition", raw_constraints = {{}}, field = "constraints"})
            table.insert(invalid, {name = "numeric definition", raw_constraints = {{definition = 42}}, field = "constraints"})
            for _, input in ipairs(invalid) do
                test.it(engine .. "/" .. input.name, function()
                    local db, calls = fixture(engine, input)
                    local ok, err = pcall(callbacks[engine].up, db)
                    test.is_false(ok)
                    test.eq(#calls, 3)
                    test.eq(type(err), "userdata")
                    test.is_true(errors.is(err, errors.CONFLICT))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "migration_schema")
                    test.eq(err:details().field, "kickside_thread_natural_key." .. input.field)
                end)
            end
            test.it(engine .. "/valid schema", function()
                local db, calls = fixture(engine, {})
                local ok, err = pcall(callbacks[engine].up, db)
                test.is_true(ok)
                test.is_nil(err)
                test.eq(#calls, 3)
            end)
            end
        end
    end)
end)
end
return {run = group({"create"}, false), columns = group({"columns"}, false),
    constraints = group({"constraints"}, false), proofs = group({}, true)}
