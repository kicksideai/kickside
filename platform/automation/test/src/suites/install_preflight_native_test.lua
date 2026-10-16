local test = require("test")
local harness = require("engine_harness")
local funcs = require("funcs")
local M = {}

local function failure(input)
    local spec = {kind = input.kind, message = "dependency refusal", details = {
        code = "install_dependency_refusal", context = {operation = input.stage}}}
    if input.policy == "false" then spec.retryable = false end
    if input.policy == "true" then spec.retryable = true end
    return errors.new(spec)
end

function M.probe(input)
    local calls = {registry = 0, executor = 0, context = 0, install = 0}
    local original = input.kind and failure(input) or nil
    local entry = {kind = "contract.binding", meta = {type = "kickside.automation"}, data = {
        contracts = {{contract = "kickside.automation:installable", methods = {install = "fixture:install"}}}}}
    if input.stage == "binding_kind" then entry.kind = "registry.entry" end
    if input.stage == "binding_type" then entry.meta.type = "fixture:other" end
    if input.stage == "install_method" then entry.data.contracts = {} end
    local engine = harness.new({
        registry = {get = function()
            calls.registry = calls.registry + 1
            if input.stage == "registry" or input.stage == "binding_missing" then return nil, original end
            return entry, nil
        end},
        security = {actor = function() return {id = function() return "fixture:actor" end} end},
        funcs = {new = function()
            calls.executor = calls.executor + 1
            if input.stage == "executor" then return nil, original end
            return {with_context = function()
                calls.context = calls.context + 1
                if input.stage == "context" then return nil, original end
                return {call = function()
                    calls.install = calls.install + 1
                    error("preflight refusal reaches installer")
                end}, nil
            end}, nil
        end},
    })
    local type_id = "fixture:automation"
    if input.stage == "type_id" then type_id = input.value end
    local result, err = engine.install_type(type_id, {})
    test.eq(calls.install, 0)
    test.eq(calls.registry, input.stage == "type_id" and 0 or 1)
    test.eq(calls.executor, (input.stage == "executor" or input.stage == "context") and 1 or 0)
    test.eq(calls.context, input.stage == "context" and 1 or 0)
    return result, err
end

local function define_tests()
    test.describe("native Automation install preflight", function()
        local cases = {
            {input = {stage = "type_id", value = ""}, kind = errors.INVALID, code = "automation_type_required", field = "type"},
            {input = {stage = "binding_missing"}, kind = errors.NOT_FOUND, code = "automation_type_not_found", field = "type"},
            {input = {stage = "binding_kind"}, kind = errors.NOT_FOUND, code = "automation_type_not_found", field = "type"},
            {input = {stage = "binding_type"}, kind = errors.INVALID, code = "automation_type_invalid", field = "type"},
            {input = {stage = "install_method"}, kind = errors.INVALID, code = "automation_install_method_missing", field = "type"},
            {input = {stage = "executor"}, kind = errors.INTERNAL, code = "automation_executor_missing", field = "executor"},
            {input = {stage = "context"}, kind = errors.INTERNAL, code = "automation_executor_context_missing", field = "executor"},
        }
        cases[#cases + 1] = {input = {stage = "type_id"}, kind = errors.INVALID,
            code = "automation_type_required", field = "type"}
        for _, value in ipairs({false, true, 12, {}}) do
            cases[#cases + 1] = {input = {stage = "type_id", value = value}, kind = errors.INVALID,
                code = "automation_type_required", field = "type"}
        end
        for index, case in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("classifies preflight refusal " .. index .. " at " .. boundary, function()
                    local result, err
                    if boundary == "library" then result, err = M.probe(case.input)
                    else result, err = funcs.call("kickside.automation:install_preflight_native_probe", case.input) end
                    test.is_nil(result)
                    test.is_true(errors.is(err, case.kind))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, case.code)
                    test.eq(err:details().field, case.field)
                end)
            end
        end
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"registry", "executor", "context"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({"absent", "false", "true"}) do
                    for _, boundary in ipairs({"library", "funcs"}) do
                        if kind ~= errors.UNKNOWN or boundary == "library" then
                            test.it("retains " .. stage .. "/" .. kind .. "/" .. policy .. " at " .. boundary, function()
                                local input = {stage = stage, kind = kind, policy = policy}
                                local original = failure(input)
                                local result, err
                                if boundary == "library" then result, err = M.probe(input)
                                else result, err = funcs.call("kickside.automation:install_preflight_native_probe", input) end
                                test.is_nil(result)
                                test.is_true(errors.is(err, kind))
                                test.eq(err:retryable(), original:retryable())
                                test.eq(err:details().code, "install_dependency_refusal")
                                test.eq(err:details().context.operation, stage)
                            end)
                        end
                    end
                end
            end
        end
    end)
end
M.run = test.run_cases(define_tests)
return M
