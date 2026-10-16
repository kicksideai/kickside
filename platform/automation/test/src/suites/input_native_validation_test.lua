local test = require("test")
local schema = require("engine_schema")
local harness = require("engine_harness")
local funcs = require("funcs")
local M = {}

function M.probe(input)
    if input.consumer then
        local calls = 0
        local binding = {kind = "contract.binding", meta = {type = "kickside.automation", inputs = input.schema}}
        local engine = harness.new({registry = {get = function() return binding, nil end},
            funcs = {new = function() calls = calls + 1; error("validation reaches installer") end}})
        local result, err = engine.install_type("fixture:automation", input.value)
        test.eq(calls, 0)
        return result, err
    end
    local err
    if input.method == "config" then err = schema.validate_port_config(input.schema, input.value)
    else err = schema.validate_install_input(input.schema, input.value) end
    if err then return nil, err end
    return true
end

local function define_tests()
    test.describe("native install input and port configuration validation", function()
        local cases = {
            {schema = false, value = {}, field = "inputs", definition = true},
            {schema = {properties = {}, required = {false}}, value = {}, field = "required", definition = true},
            {schema = {properties = {[17] = {type = "string"}}}, value = {}, field = "properties", definition = true},
            {schema = {properties = {nested = {type = "object", properties = {}, required = {""}}}},
                value = {nested = {}}, field = "nested.required", definition = true},
            {schema = {type = "object"}, value = false, field = "input"},
            {schema = {properties = {value = {type = "string", required = true}}}, value = {}, field = "value"},
            {schema = {properties = {value = {type = "string"}}, required = {"value"}}, value = {value = ""}, field = "value"},
            {schema = {properties = {value = {type = "boolean"}}}, value = {value = 1}, field = "value"},
            {schema = {properties = {value = {type = "number"}}}, value = {value = "1"}, field = "value"},
            {schema = {properties = {value = {type = "integer"}}}, value = {value = 1.5}, field = "value"},
            {schema = {properties = {value = {type = "object"}}}, value = {value = "{}"}, field = "value"},
            {schema = {properties = {value = {type = "array"}}}, value = {value = "[]"}, field = "value"},
            {schema = {properties = {value = {type = "string"}}}, value = {value = false}, field = "value"},
            {schema = {properties = {value = {type = "string", minLength = 3}}}, value = {value = "ab"}, field = "value"},
            {schema = {properties = {value = {const = "fixed"}}}, value = {value = "other"}, field = "value"},
            {schema = {properties = {value = {type = "integer", minimum = 1}}}, value = {value = 0}, field = "value"},
            {schema = {properties = {value = {enum = {"allowed"}}}}, value = {value = "other"}, field = "value"},
            {schema = {properties = {}}, value = {extra = true}, field = "extra"},
            {schema = {properties = {nested = {type = "object", properties = {value = {type = "string"}}, required = {"value"}}}},
                value = {nested = {}}, field = "nested.value"},
            {method = "config", schema = false, value = {}, field = "config_schema", definition = true},
            {method = "config", schema = {value = {type = "string", required = true}}, value = {}, field = "value"},
            {method = "config", schema = {}, value = {extra = true}, field = "extra"},
        }
        for index, case in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs", "installer"}) do
                if boundary ~= "installer" or case.method ~= "config" then
                    test.it("retains structured validation " .. index .. " at " .. boundary, function()
                        local input = {schema = case.schema, value = case.value, method = case.method, consumer = boundary == "installer"}
                        local result, err
                        if boundary == "funcs" then result, err = funcs.call("kickside.automation:input_native_validation_probe", input)
                        else result, err = M.probe(input) end
                        test.is_nil(result)
                        test.is_true(errors.is(err, errors.INVALID))
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, case.definition and "automation_input_schema_invalid" or "automation_input_invalid")
                        test.eq(err:details().field, case.field)
                        test.eq(err:details().error_kind, "declaration")
                    end)
                end
            end
        end
        for _, value in ipairs({math.huge, -math.huge, 0/0}) do
            test.it("refuses nonfinite numbers natively", function()
                local result, err = M.probe({schema = {properties = {value = {type = "number"}}}, value = {value = value}})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "automation_input_invalid")
                test.eq(err:details().field, "value")
            end)
        end
        local accepted = {
            {}, {schema = {type = "object"}, value = {arbitrary = true}},
            {schema = {properties = {free = {}}}, value = {free = {nested = true}}},
            {schema = {properties = {}, additionalProperties = true}, value = {extra = true}},
            {schema = {properties = {value = {type = "integer", minimum = 1, const = 1, enum = {1, 2}}}}, value = {value = 1}},
            {schema = {properties = {nested = {type = "object", properties = {value = {type = "boolean"}}}}}, value = {nested = {value = false}}},
            {method = "config", value = {arbitrary = true}},
            {method = "config", schema = {value = {type = "string", minLength = 2}}, value = {value = "ok"}},
        }
        for index, input in ipairs(accepted) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains accepted input " .. index .. " at " .. boundary, function()
                    local result, err
                    if boundary == "library" then result, err = M.probe(input)
                    else result, err = funcs.call("kickside.automation:input_native_validation_probe", input) end
                    test.is_nil(err)
                    test.is_true(result)
                end)
            end
        end
    end)
end
M.run = test.run_cases(define_tests)
return M
