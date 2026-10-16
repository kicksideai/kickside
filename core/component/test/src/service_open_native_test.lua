local test = require("test")
local funcs = require("funcs")
local context = require("context_fixture")
local dependency = require("contract_fixture")
local M = {}

function M.probe(input)
    local source = errors.new({message = "dependency failure", kind = input.kind,
        retryable = input.retryable, details = {code = "service_dependency", nested = {stage = input.stage}}})
    dependency.configure(input.stage, source)
    local service, err = context.get_component_service()
    if input.stage == "get" then test.eq(#dependency.calls, 1)
    else test.eq(#dependency.calls, 4) end
    return service, err
end

local function define_tests()
    test.describe("native Component service opening", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, stage in ipairs({"get", "open"}) do
                    for _, boundary in ipairs({"library", "funcs"}) do
                        if kind ~= errors.UNKNOWN or boundary == "library" then
                            test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. stage .. "/" .. boundary, function()
                                local input = {kind = kind, retryable = options.retryable, stage = stage}
                                local expected = errors.new({message = "dependency failure", kind = kind, retryable = options.retryable})
                                local service, err
                                if boundary == "library" then service, err = M.probe(input)
                                else service, err = funcs.call("app:service_open_native_probe", input) end
                                test.is_nil(service)
                                test.not_nil(err)
                                test.eq(err:kind(), expected:kind())
                                test.eq(err:retryable(), expected:retryable())
                                test.eq(err:details().code, "service_dependency")
                                test.eq(err:details().nested.stage, stage)
                            end)
                        end
                    end
                end
            end
        end
        test.it("keeps valid service and missing-definition behavior", function()
            dependency.configure("valid", nil)
            local service, err = context.get_component_service()
            test.is_nil(err)
            test.eq(service.service, "kickside.component:component_service")
            dependency.configure("missing", nil)
            local missing, missing_err = context.get_component_service()
            test.is_nil(missing)
            test.is_true(errors.is(missing_err, errors.INTERNAL))
        end)
    end)
end
M.run = test.run_cases(define_tests)
return M
