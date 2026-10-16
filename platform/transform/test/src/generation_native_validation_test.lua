local test = require("test")
local funcs = require("funcs")
local flow_api = require("flow_api")

local function request()
    return {source_schema = {}, sink_schema = {}, input_shape = "record", samples = {{payload = {value = "real"}}}}
end

local function define_tests()
    test.describe("native generation request refusals", function()
        for index, case in ipairs({
            {field = "samples", update = function(i) i.samples = nil end},
            {field = "samples", update = function(i) i.samples = {} end},
            {field = "samples", update = function(i) i.samples = {{}} end},
            {field = "source_schema", update = function(i) i.source_schema = nil end},
            {field = "sink_schema", update = function(i) i.sink_schema = nil end},
            {field = "input_shape", update = function(i) i.input_shape = nil end},
            {field = "input_shape", update = function(i) i.input_shape = false end},
            {field = "input_shape", update = function(i) i.input_shape = "" end},
            {field = "input_shape", update = function(i) i.input_shape = "invalid" end},
        }) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("classifies invalid generation request " .. index .. " at " .. boundary, function()
                    local input = request(); case.update(input)
                    local result, err
                    if boundary == "library" then result, err = flow_api.generate_transform(input)
                    else result, err = funcs.call("kickside.transform:generate_transform", input) end
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "transform_generation_invalid")
                    test.eq(err:details().field, case.field)
                end)
            end
        end
        for _, input in ipairs({false, "invalid", {}}) do
            test.it("classifies a malformed generation request envelope", function()
                local result, err = flow_api.generate_transform(input)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "transform_generation_invalid")
                test.eq(err:details().field, "source_schema")
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
