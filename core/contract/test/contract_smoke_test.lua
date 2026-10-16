local test = require("test")
local registry = require("registry")
local json = require("json")

local CONTRACTS = {
    "component",
    "content_provider",
    "deletable",
    "portable",
    "resource_registry",
    "scope_resolver",
    "embeddable",
    "queryable",
    "realtime",
    "directory",
    "security_scopes",
    "installable",
    "runtime_reader",
}

local DATA_CONTRACTS = {
    "pullable",
    "writable",
    "loadable",
    "definable",
    "readable",
}

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if entry[key] ~= nil then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function exact_keys(actual: any, expected: { string }, label: string): ()
    test.is_true(type(actual) == "table", label .. " must be an object")
    local seen = 0
    for key in pairs(actual :: table) do
        seen = seen + 1
        local found = false
        for _, wanted in ipairs(expected) do
            if key == wanted then found = true; break end
        end
        test.is_true(found, label .. " has unexpected key " .. tostring(key))
    end
    test.eq(seen, #expected, label .. " has the wrong number of keys")
    for _, wanted in ipairs(expected) do
        test.not_nil((actual :: table)[wanted], label .. " is missing " .. wanted)
    end
end

local function exact_array(actual: any, expected: { any }, label: string): ()
    test.is_true(type(actual) == "table", label .. " must be an array")
    test.eq(#(actual :: table), #expected, label .. " has the wrong length")
    for index, wanted in ipairs(expected) do
        test.eq((actual :: table)[index], wanted, label .. " mismatch at " .. tostring(index))
    end
end

local function schema_json(schema: any, label: string): table
    test.is_true(type(schema) == "table", label .. " schema is missing")
    exact_keys(schema, { "format", "definition" }, label .. " schema fields")
    test.eq(schema.format, "application/schema+json", label .. " schema format")
    test.is_true(type(schema.definition) == "string", label .. " schema definition is missing")
    local decoded, decode_err = json.decode(schema.definition)
    test.is_nil(decode_err, label .. " schema is not valid JSON")
    test.is_true(type(decoded) == "table", label .. " schema must decode to an object")
    return decoded :: table
end

local function define_tests()
    test.describe("kickside.contract packaging", function()
        test.it("declares optional engine query continuation", function()
            local entry, err = registry.get("kickside.contract:queryable")
            test.is_nil(err)
            local query = value(entry, "methods")[1]
            local input = schema_json(query.input_schemas[1], "query input")
            local output = schema_json(query.output_schemas[1], "query output")
            test.eq(input.properties.offset.type, "integer")
            test.eq(input.properties.offset.minimum, 0)
            test.eq(output.properties.next_offset.type, "integer")
            test.eq(output.properties.next_offset.minimum, 0)
            exact_array(input.required, { "query" }, "query input")
            exact_array(output.required, { "success", "items", "count" }, "query output")
        end)

        test.it("declares optional directory continuation for published implementations", function()
            local entry, err = registry.get("kickside.contract:directory")
            test.is_nil(err)
            local search = value(entry, "methods")[1]
            test.eq(search.name, "search")
            local input = schema_json(search.input_schemas[1], "directory search input")
            local output = schema_json(search.output_schemas[1], "directory search output")
            test.not_nil(input.properties.cursor)
            test.eq(input.properties.cursor.type, "string")
            test.eq(output.properties.has_more.type, "boolean")
            test.eq(output.properties.cursor.type, "string")
            local required = false
            for _, name in ipairs(output.required) do if name == "has_more" then required = true end end
            test.is_false(required)
            exact_array(output.required, { "principals" }, "published directory output")
        end)

        test.it("publishes the selected-source payload schema contract", function()
            local entry, err = registry.get("kickside.trigger:source_schema")
            test.is_nil(err)
            test.not_nil(entry)
            local methods = value(entry, "methods")
            test.eq(methods[1].name, "describe")
            local output = schema_json(methods[1].output_schemas[1], "source schema output")
            test.eq(output.properties.context_schema.type, "object")
        end)

        test.it("declares provider retry floors and production error scopes on pull and write", function()
            for _, name in ipairs({ "writable", "pullable" }) do
                local entry, err = registry.get("kickside.data:" .. name)
                test.is_nil(err)
                local method = value(entry, "methods")[1]
                local schema = schema_json(method.output_schemas[1], name .. " output")
                local e = schema["$defs"].DataError.properties
                test.not_nil(e.retry_after_ms, name .. " error retry floor")
                test.eq(e.retry_after_ms.type, "integer")
                test.eq(e.retry_after_ms.minimum, 0)
                for _, scope in ipairs({ "capacity", "identity" }) do
                    local found = false
                    for _, v in ipairs(e.scope.enum) do if v == scope then found = true end end
                    test.is_true(found, name .. " error scope " .. scope)
                end
            end
        end)

        test.it("publishes the ordered writable batch method", function()
            local entry, err = registry.get("kickside.data:writable")
            test.is_nil(err)
            test.not_nil(entry)
            local names = {}
            for _, method in ipairs(value(entry, "methods") or {}) do names[method.name] = true end
            test.is_true(names.write)
        end)
        test.it("publishes record contracts in their own namespace", function()
            for _, name in ipairs({ "external_record_writer", "data_connector_manifest_schema" }) do
                local entry, err = registry.get("kickside.data.records:" .. name)
                test.is_nil(err)
                test.not_nil(entry)
                local old = registry.get("kickside.data:" .. name)
                test.is_nil(old)
            end
        end)
        test.it("publishes every base contract definition with methods", function()
            for _, name in ipairs(CONTRACTS) do
                local id = "kickside.contract:" .. name
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry, id .. " is missing")
                test.eq(value(entry, "kind"), "contract.definition")

                local methods = value(entry, "methods")
                test.is_true(type(methods) == "table" and #methods > 0, id .. " has no methods")
            end
        end)
    end)
    test.describe("kickside.data packaging", function()
        test.it("publishes every data contract definition with methods", function()
            for _, name in ipairs(DATA_CONTRACTS) do
                local id = "kickside.data:" .. name
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry, id .. " is missing")
                test.eq(value(entry, "kind"), "contract.definition")

                local methods: { any } = (value(entry, "methods") or {}) :: { any }
                test.is_true(#methods > 0, id .. " has no methods")
            end
        end)

        test.it("carries schemas that parse, on both sides of every method", function()
            for _, name in ipairs(DATA_CONTRACTS) do
                local id = "kickside.data:" .. name
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err)
                test.not_nil(entry, id)
                local methods: { any } = (value(entry, "methods") or {}) :: { any }
                for _, raw in ipairs(methods) do
                    local method = raw :: any
                    local where = id .. "." .. tostring(method.name)
                    for _, side in ipairs({ "input_schemas", "output_schemas" }) do
                        local schemas: { any } = ((method :: any)[side] or {}) :: { any }
                        test.is_true(#schemas > 0, where .. " declares no " .. side)
                        for _, entry_schema in ipairs(schemas) do
                            local declared = entry_schema :: any
                            test.eq(tostring(declared.format), "application/schema+json",
                                where .. " declares a schema in an unexpected format")
                            local parsed, parse_err = json.decode(tostring(declared.definition))
                            test.is_nil(parse_err, where .. " has a schema that is not JSON: " .. tostring(parse_err))
                            test.eq(tostring((parsed :: any).type), "object",
                                where .. " has a schema that does not describe an object")
                        end
                    end
                end
            end
        end)

        test.it("keeps definable free of a type vocabulary", function()
            local entry, entry_err = registry.get("kickside.data:definable")
            test.is_nil(entry_err)
            test.not_nil(entry)
            local methods: { any } = (value(entry, "methods") or {}) :: { any }
            local names = {}
            for _, raw in ipairs(methods) do names[tostring((raw :: any).name)] = raw end
            test.not_nil(names.types, "definable cannot be used without a way to read the receiver's types")
            test.not_nil(names.define, "definable defines nothing")

            local define = names.define :: any
            local input, decode_err = json.decode(tostring(((define.input_schemas :: { any })[1] :: any).definition))
            test.is_nil(decode_err)
            local column = (((input.properties or {}).columns or {}).items or {}) :: any
            local column_type = ((column.properties or {}).type or {}) :: any
            test.eq(tostring(column_type.type), "string")
            test.is_nil(column_type.enum,
                "definable enumerates column types; the receiver publishes them through types()")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
