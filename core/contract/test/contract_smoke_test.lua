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

local function rule_when(schema: table, wanted: { [string]: any }): any
    local expected = 0
    for _ in pairs(wanted) do expected = expected + 1 end
    for _, raw in ipairs((schema.allOf or {}) :: { any }) do
        local rule = raw :: any
        local conditions = (((rule["if"] or {}) :: any).properties or {}) :: { [string]: any }
        local same = true
        local count = 0
        for name, condition in pairs(conditions) do
            count = count + 1
            if wanted[name] == nil or (condition :: any).const ~= wanted[name] then same = false end
        end
        if same and count == expected then return rule end
    end
    return nil
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

        test.it("lets define describe a target and label and describe its columns", function()
            local entry, entry_err = registry.get("kickside.data:definable")
            test.is_nil(entry_err)
            local define: any = nil
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                if (raw :: any).name == "define" then define = raw end
            end
            test.not_nil(define)

            local input = schema_json((define.input_schemas :: { any })[1], "definable define input")
            test.eq(input.properties.description.type, "string")
            local column = input.properties.columns.items.properties
            test.eq(column.label.type, "string")
            test.eq(column.description.type, "string")

            for _, name in ipairs((input.required or {}) :: { any }) do
                test.is_true(name ~= "columns", "define demands columns even of a change to a target's description alone")
            end
            local creating = false
            for _, branch in ipairs((input.oneOf or {}) :: { any }) do
                for _, name in ipairs(((branch :: any).required or {}) :: { any }) do
                    if name == "code" then
                        local wanted = {}
                        for _, field in ipairs(((branch :: any).required or {}) :: { any }) do wanted[field] = true end
                        test.is_true(wanted.columns == true, "a target created without columns")
                        creating = true
                    end
                end
            end
            test.is_true(creating, "define names no branch that creates a target")

            local output = schema_json((define.output_schemas :: { any })[1], "definable define output")
            local action = tostring(output.properties.changes.items.properties.action.description)
            test.not_nil(action:find("label_changed", 1, true), "define names no change for a label")
            test.not_nil(action:find("description_changed", 1, true), "define names no change for a description")
        end)

        test.it("answers in readable.describe what define wrote about a target and its columns", function()
            local entry, entry_err = registry.get("kickside.data:readable")
            test.is_nil(entry_err)
            local describe: any = nil
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                if (raw :: any).name == "describe" then describe = raw end
            end
            test.not_nil(describe)

            local output = schema_json((describe.output_schemas :: { any })[1], "readable describe output")
            local answer = output.properties
            test.eq(answer.description.type, "string")
            local column = answer.columns.items.properties
            test.eq(column.label.type, "string")
            test.eq(column.description.type, "string")
            test.not_nil(tostring(column.description.description):find("definable.define", 1, true),
                "readable does not say where a column's description comes from")
        end)

        test.it("lets define describe a target and label and describe its columns", function()
            local entry, entry_err = registry.get("kickside.data:definable")
            test.is_nil(entry_err)
            local define: any = nil
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                if (raw :: any).name == "define" then define = raw end
            end
            test.not_nil(define)

            local input = schema_json((define.input_schemas :: { any })[1], "definable define input")
            test.eq(input.properties.description.type, "string")
            local column = input.properties.columns.items.properties
            test.eq(column.label.type, "string")
            test.eq(column.description.type, "string")

            for _, name in ipairs((input.required or {}) :: { any }) do
                test.is_true(name ~= "columns", "define demands columns even of a change to a target's description alone")
            end
            local creating = false
            for _, branch in ipairs((input.oneOf or {}) :: { any }) do
                for _, name in ipairs(((branch :: any).required or {}) :: { any }) do
                    if name == "code" then
                        local wanted = {}
                        for _, field in ipairs(((branch :: any).required or {}) :: { any }) do wanted[field] = true end
                        test.is_true(wanted.columns == true, "a target created without columns")
                        creating = true
                    end
                end
            end
            test.is_true(creating, "define names no branch that creates a target")

            local output = schema_json((define.output_schemas :: { any })[1], "definable define output")
            local action = tostring(output.properties.changes.items.properties.action.description)
            test.not_nil(action:find("label_changed", 1, true), "define names no change for a label")
            test.not_nil(action:find("description_changed", 1, true), "define names no change for a description")
            test.not_nil(action:find("title_changed", 1, true), "define names no change for a title")
        end)

        test.it("plans a change to a target that exists only for a caller who may read it", function()
            local entry, entry_err = registry.get("kickside.data:definable")
            test.is_nil(entry_err)
            local text = ""
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                if (raw :: any).name == "define" then text = tostring((raw :: any).description):gsub("%s+", " ") end
            end

            test.not_nil(text:find("one about a target that exists takes read access to its component", 1, true),
                "define does not say what a dry run of a target that exists takes")
            test.is_nil(text:find("so the right to define is all it needs", 1, true),
                "a dry run still shows any target to whoever may define")
        end)

        test.it("answers the component of a target define wrote, and only then", function()
            local entry, entry_err = registry.get("kickside.data:definable")
            test.is_nil(entry_err)
            local define: any = nil
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                if (raw :: any).name == "define" then define = raw end
            end
            test.not_nil(define)

            local output = schema_json((define.output_schemas :: { any })[1], "definable define output")
            local component = output.properties.component_id
            test.not_nil(component, "define does not answer the component a target is")
            test.eq(component.type, "string")
            test.eq(component.minLength, 1)

            local succeeded = rule_when(output, { success = true })
            test.not_nil(succeeded, "define says nothing of what a success carries")
            exact_array(succeeded["then"].required, { "target", "created", "planned", "changes" }, "a success")

            local wrote = rule_when(output, { success = true, planned = false })
            test.not_nil(wrote, "define does not say what a define that wrote answers")
            exact_array(wrote["then"].required, { "component_id" }, "a define that wrote")

            local planned = rule_when(output, { planned = true })
            test.not_nil(planned, "define does not say what a dry run leaves out")
            test.eq(planned["then"].properties.component_id, false, "a dry run may answer a component")

            local failed = rule_when(output, { success = false })
            test.not_nil(failed)
            test.eq(failed["then"].properties.component_id, false, "a refusal may answer a component")
        end)

        test.it("answers in readable.describe what define wrote about a target and its columns", function()
            local entry, entry_err = registry.get("kickside.data:readable")
            test.is_nil(entry_err)
            local describe: any = nil
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                if (raw :: any).name == "describe" then describe = raw end
            end
            test.not_nil(describe)

            local output = schema_json((describe.output_schemas :: { any })[1], "readable describe output")
            local answer = output.properties
            test.eq(answer.description.type, "string")
            local column = answer.columns.items.properties
            test.eq(column.label.type, "string")
            test.eq(column.description.type, "string")
            test.not_nil(tostring(column.description.description):find("definable.define", 1, true),
                "readable does not say where a column's description comes from")
        end)

        test.it("reads a target only for a caller with read access to its component, and hides it from anyone else", function()
            local entry, entry_err = registry.get("kickside.data:readable")
            test.is_nil(entry_err)
            local said: { [string]: string } = {}
            local details: { [string]: string } = {}
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                local method = raw :: any
                said[tostring(method.name)] = tostring(method.description):gsub("%s+", " ")
                local output = schema_json((method.output_schemas :: { any })[1], "readable " .. tostring(method.name) .. " output")
                local defs: any = output["$defs"] or {}
                local data_error: any = defs.DataError or {}
                local properties: any = data_error.properties or {}
                local error_details: any = properties.details or {}
                details[tostring(method.name)] = tostring(error_details.description or "")
            end

            test.not_nil(said.list:find("read access to", 1, true), "list does not say which targets a caller may read")
            test.not_nil(said.list:find("component", 1, true), "list does not say whose access decides what it lists")
            for _, method in ipairs({ "describe", "plan", "query", "lookup" }) do
                local text = said[method]
                test.not_nil(text:find("read access to that component, grants on its ancestors included", 1, true),
                    method .. " does not say what reading a target takes")
                test.not_nil(text:find("without read access to", 1, true) and text:find("as if the target did not exist", 1, true),
                    method .. " does not say how a target the caller may not read is answered")
                test.is_nil(text:find("permission_denied", 1, true),
                    method .. " refuses a target the caller may not read in a way that tells it exists")
                test.is_nil(details[method]:find("permission_denied", 1, true),
                    method .. " gives permission_denied a meaning the access rule no longer has")
            end
            for _, method in ipairs({ "plan", "query" }) do
                test.not_nil(said[method]:find("joins included", 1, true), method .. " does not check a joined target")
                test.not_nil(said[method]:find("unknown_target problem for a joined one", 1, true),
                    method .. " does not say how a joined target the caller may not read is answered")
            end
            test.not_nil(said.plan:find("validate identically, access included", 1, true),
                "plan does not check access as query does")
            test.not_nil(said.plan:find("query_failed", 1, true) and said.plan:find("timeout", 1, true),
                "plan promises that a query it accepted fails only when access or the infrastructure changes")
        end)

        test.it("loads into a target only for a caller with write access to its component, and hides it from a caller with none", function()
            local entry, entry_err = registry.get("kickside.data:loadable")
            test.is_nil(entry_err)
            local said: { [string]: string } = {}
            local details: { [string]: string } = {}
            local period_in = ""
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                local method = raw :: any
                said[tostring(method.name)] = tostring(method.description):gsub("%s+", " ")
                local output = schema_json((method.output_schemas :: { any })[1], "loadable " .. tostring(method.name) .. " output")
                local defs: any = output["$defs"] or {}
                local data_error: any = defs.DataError or {}
                local properties: any = data_error.properties or {}
                local error_details: any = properties.details or {}
                details[tostring(method.name)] = tostring(error_details.description or "")
                if method.name == "describe_scope" then
                    local input = schema_json((method.input_schemas :: { any })[1], "loadable describe_scope input")
                    period_in = tostring(((input.properties or {}).period_in or {}).description or "")
                end
            end

            test.not_nil(said.list:find("write access to", 1, true), "list does not say which targets a caller may load into")
            test.not_nil(said.list:find("component", 1, true), "list does not say whose access decides what it lists")
            for _, method in ipairs({ "describe", "describe_scope", "begin" }) do
                local text = said[method]
                test.not_nil(text:find("write access to that component, grants on its ancestors included", 1, true),
                    method .. " does not say what loading into a target takes")
                test.not_nil(text:find("no access to the target at all", 1, true) and text:find("as if the target did not exist", 1, true),
                    method .. " does not say how a target the caller cannot reach is answered")
                test.not_nil(text:find("may read the target but not write it is permission_denied with details.target", 1, true),
                    method .. " does not say how a reader who may not load is answered")
                test.not_nil(details[method]:find("the caller has no access to at all", 1, true),
                    method .. " gives not_found no meaning for a target the caller cannot reach")
                test.not_nil(details[method]:find("for one the caller may read but not write", 1, true),
                    method .. " gives permission_denied no meaning")
            end
            test.not_nil(said.begin:find("inherit that decision", 1, true), "begin does not say that the rest of a load runs under its decision")
            test.not_nil(said.begin:find("does not exist yet needs only the right to load", 1, true),
                "begin does not say what a define of a target that does not exist yet takes")
            test.not_nil(said.begin:find("as definable.define answers the same request", 1, true),
                "begin does not say how a define of a target the caller may not write is refused")
            test.is_nil(said.begin:find("A begin that carries define needs only the right to load", 1, true),
                "a define still rehearses a load into any target that exists")
            test.is_nil(period_in:find("anyone with the right to load", 1, true), "describe_scope still answers anyone who may load")
            test.not_nil(period_in:find("whoever may load into the target", 1, true), "describe_scope does not say who sees its answer")
        end)

        test.it("keeps a run and its load to the caller that began them, and rehearses a target that appeared since only for a writer", function()
            local entry, entry_err = registry.get("kickside.data:loadable")
            test.is_nil(entry_err)
            local said: { [string]: string } = {}
            local details: { [string]: string } = {}
            for _, raw in ipairs((value(entry, "methods") or {}) :: { any }) do
                local method = raw :: any
                said[tostring(method.name)] = tostring(method.description):gsub("%s+", " ")
                local output = schema_json((method.output_schemas :: { any })[1], "loadable " .. tostring(method.name) .. " output")
                local defs: any = output["$defs"] or {}
                local data_error: any = defs.DataError or {}
                local properties: any = data_error.properties or {}
                local error_details: any = properties.details or {}
                details[tostring(method.name)] = tostring(error_details.description or "")
            end

            test.not_nil(said.begin:find("only for the caller that began the load", 1, true), "begin does not keep a load to the caller that began it")
            test.not_nil(said.begin:find("conflict/run_taken", 1, true), "begin does not say how a run another caller began is answered")
            for _, method in ipairs({ "append", "commit", "rehearse", "discard" }) do
                test.not_nil(said[method]:find("another caller began", 1, true), method .. " does not say how a load another caller began is answered")
            end
            test.not_nil(said.rehearse:find("did not exist when the load began", 1, true), "rehearse does not check a target that appeared since begin")
            test.not_nil(said.begin:find("should the target exist by the time the load is rehearsed", 1, true),
                "begin does not say what a define of a target that appears later takes")
            for name, text in pairs(details) do
                test.not_nil(text:find("run_taken", 1, true), name .. " does not name run_taken among the conflicts")
            end
            test.not_nil(said.list:find("read and write access", 1, true), "list does not say a caller has to see a target to load into it")
            test.not_nil(said.describe:find("Read access is what makes a component visible at all", 1, true),
                "describe does not say a caller who may only write a target cannot reach it")
            test.not_nil(details.begin:find("or that a define names and the caller may not write", 1, true),
                "begin's permission_denied leaves out a define of a target the caller may not write")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
