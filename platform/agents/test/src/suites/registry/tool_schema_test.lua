local test = require("test")
local tool_schema = require("tool_schema")

local function define_tests()
    test.describe("tool schema metadata", function()
        test.it("preserves table schemas", function()
            local schema = { type = "object", properties = { query = { type = "string" } } }
            test.eq(tool_schema.decode(schema), schema)
        end)

        test.it("decodes YAML block JSON schemas", function()
            local schema = tool_schema.decode([[
                {"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}
            ]])
            test.eq(schema.type, "object")
            test.eq(schema.properties.query.type, "string")
            test.eq(schema.required[1], "query")
        end)

        test.it("fails safely for malformed and scalar JSON", function()
            test.eq(next(tool_schema.decode("{not-json")), nil)
            test.eq(next(tool_schema.decode('"not-a-schema"')), nil)
            test.eq(next(tool_schema.decode(nil)), nil)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
