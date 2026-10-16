local test = require("test")
local harness = require("engine_harness")

type Map = { [string]: any }

local function engine_fixture(failure: string?): (any, Map)
    local opened: Map = {}
    local binding = { id = "fixture:source", kind = "contract.binding", meta = { class = { "fixture" } }, data = {
        contracts = { { contract = "kickside.trigger:source_schema", methods = { describe = "fixture:describe" } } } } }
    local r = {
        find = function(q: any): (any, any)
            if q[".kind"] == "contract.binding" then return { binding }, nil end
            return { { id = "fixture:events", meta = { type = "kickside.automation.port" }, data = {
                binding = "fixture:source", event = "fixture:received" } } }, nil
        end,
        get = function(id: string): (any, any)
            if id == "fixture:source" then return binding, nil end
            return { data = { schema = { type = "object", properties = {} } } }, nil
        end,
    }
    local c = { get = function(id: string): (any, any)
        test.eq(id, "kickside.trigger:source_schema")
        local definition: any = {}
        definition.with_context = function(_self: any, context: any): any opened.context = context; return definition end
        definition.open = function(_self: any, target: string): (any, any)
            opened.binding = target
            return { describe = function(_self: any, _input: any): (any, any)
                if failure then return nil, failure end
                return { context_schema = { type = "object", properties = { email = { type = "string" } } } }, nil
            end }, nil
        end
        return definition, nil
    end }
    return harness.new({ registry = r, contract = c }), opened
end

local function define_tests()
    test.describe("selected source payload schema", function()
        test.it("reads the selected instance instead of the generic event face", function()
            local engine, opened = engine_fixture(nil)
            local schema, err = (engine :: any).source_schema("fixture:events", { thread_id = "selected-webhook" })
            test.is_nil(err, tostring(err))
            test.eq(schema.properties.email.type, "string")
            test.eq(opened.context.component_id, "selected-webhook")
            test.eq(opened.binding, "fixture:source")
        end)
        test.it("propagates a selected source schema failure", function()
            local engine = engine_fixture("schema read refused")
            local schema, err = (engine :: any).source_schema("fixture:events", { thread_id = "selected-webhook" })
            test.is_nil(schema)
            test.contains(tostring(err), "schema read refused")
        end)
        test.it("refuses an instance-schema source without a selected instance", function()
            local engine = engine_fixture(nil)
            local schema, err = (engine :: any).source_schema("fixture:events", {})
            test.is_nil(schema)
            test.contains(tostring(err), "thread_id")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
