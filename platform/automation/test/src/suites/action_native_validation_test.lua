local test = require("test")
local harness = require("engine_harness")
local funcs = require("funcs")
local M = {}

function M.probe(input)
    local calls = {query = 0, read = 0, delete = 0, uninstall = 0}
    local engine = harness.new({component = {
        ACCESS = {WRITE = 2, DELETE = 4},
        query = function()
            calls.query = calls.query + 1
            if input.stage == "missing" then return {}, nil end
            return {{impl_id = input.impl_id}}, nil
        end,
        get_private_context = function()
            calls.read = calls.read + 1
            return nil, errors.new({kind = errors.INTERNAL, message = "unexpected read"})
        end,
    }})
    local result, err
    if input.stage == "uninstall_result" then
        engine.uninstall = function()
            calls.uninstall = calls.uninstall + 1
            return input.value, nil
        end
        result, err = engine.delete_automation("fixture:instance", {})
        test.eq(calls.query, 1)
        test.eq(calls.uninstall, 1)
    elseif input.method == "generic_reconfigure" then
        result, err = engine.generic_reconfigure("fixture:instance", {declaration = {}})
        test.eq(calls.query, 1)
    else
        result, err = engine[input.method](input.id, {})
        test.eq(calls.query, 0)
    end
    test.eq(calls.read, 0)
    if err then return nil, err end
    return result
end

local function define_tests()
    test.describe("native generic action validation", function()
        local cases = {}
        for _, method in ipairs({"reconfigure", "uninstall", "delete_automation"}) do
            for _, value in ipairs({"", false, 12, {}}) do
                cases[#cases + 1] = {input = {method = method, id = value}, kind = errors.INVALID,
                    code = "automation_id_required", field = "id"}
            end
            cases[#cases + 1] = {input = {method = method}, kind = errors.INVALID,
                code = "automation_id_required", field = "id"}
        end
        cases[#cases + 1] = {input = {method = "delete_automation", id = "  "}, kind = errors.INVALID,
            code = "automation_id_required", field = "id"}
        cases[#cases + 1] = {input = {method = "generic_reconfigure", stage = "missing"}, kind = errors.NOT_FOUND,
            code = "automation_not_found", field = "id"}
        for _, value in ipairs({"", false, {}}) do
            cases[#cases + 1] = {input = {method = "generic_reconfigure", impl_id = value}, kind = errors.INVALID,
                code = "automation_implementation_missing", field = "impl_id"}
        end
        cases[#cases + 1] = {input = {method = "generic_reconfigure"}, kind = errors.INVALID,
            code = "automation_implementation_missing", field = "impl_id"}
        for _, value in ipairs({false, true, "invalid result"}) do
            cases[#cases + 1] = {input = {stage = "uninstall_result", value = value}, kind = errors.INTERNAL,
                code = "automation_uninstall_result_missing", field = "result"}
        end
        cases[#cases + 1] = {input = {stage = "uninstall_result"}, kind = errors.INTERNAL,
            code = "automation_uninstall_result_missing", field = "result"}
        for index, case in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("classifies action refusal " .. index .. " at " .. boundary, function()
                    local result, err
                    if boundary == "library" then result, err = M.probe(case.input)
                    else result, err = funcs.call("kickside.automation:action_native_validation_probe", case.input) end
                    test.is_nil(result)
                    test.is_true(errors.is(err, case.kind))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, case.code)
                    test.eq(err:details().field, case.field)
                end)
            end
        end
    end)
end
M.run = test.run_cases(define_tests)
return M
