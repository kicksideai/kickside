local test = require("test")
local contract = require("contract")
local funcs = require("funcs")
local context = require("context_policy")
local canonical_json = require("canonical_json")
local M = {}

function M.probe(input)
    local instance, err = context.open_contract_instance(input.binding, {}, input.contract)
    if err then return nil, err end
    return {valid = contract.is(instance, input.contract)}, nil
end

local function define_tests()
    test.describe("native Component contract opening", function()
        local cases = {
            {contract = "app:absent_native_contract", binding = "app:absent_binding", stage = "lookup"},
            {contract = "kickside.contract:component", binding = "app:absent_binding", stage = "open"},
            {contract = "kickside.contract:component", binding = "app:db", stage = "open"},
        }
        for index, input in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains live contract failure " .. index .. " at " .. boundary, function()
                    local definition, expected = contract.get(input.contract)
                    if input.stage == "open" then
                        test.is_nil(expected)
                        test.not_nil(definition)
                        local _
                        _, expected = definition:open(input.binding, {})
                    end
                    test.not_nil(expected)
                    local result, actual
                    if boundary == "library" then result, actual = M.probe(input)
                    else result, actual = funcs.call("app:contract_open_native_probe", input) end
                    test.is_nil(result)
                    test.not_nil(actual)
                    test.eq(actual:kind(), expected:kind())
                    test.eq(actual:retryable(), expected:retryable())
                    local actual_details, actual_encode_err = canonical_json.encode(actual:details())
                    local expected_details, expected_encode_err = canonical_json.encode(expected:details())
                    test.is_nil(actual_encode_err)
                    test.is_nil(expected_encode_err)
                    test.eq(actual_details, expected_details)
                end)
            end
        end
        for _, boundary in ipairs({"library", "funcs"}) do
            test.it("retains valid contract opening at " .. boundary, function()
                local input = {contract = "kickside.contract:component", binding = "kickside.test:runtime_meta"}
                local result, err
                if boundary == "library" then result, err = M.probe(input)
                else result, err = funcs.call("app:contract_open_native_probe", input) end
                test.is_nil(err)
                test.is_true(result.valid)
            end)
        end
    end)
end
M.run = test.run_cases(define_tests)
return M
