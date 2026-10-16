local test = require("test")
local funcs = require("funcs")
local subjects = require("subject_fixture")
local dependency = require("directory_fixture")
local M = {}

function M.probe(input)
    dependency.configure(input)
    local id, err = subjects.find("reader@example.invalid", "user")
    local count = {get = 1, open = 2, resolve = 3, exists = 4}
    test.eq(#dependency.calls, count[input.stage])
    return id, err
end

local function define_tests()
    test.describe("native Component principal directory", function()
        for _, stage in ipairs({"get", "open", "resolve", "exists"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, boundary in ipairs({"library", "funcs"}) do
                        if kind ~= errors.UNKNOWN or boundary == "library" then
                            test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. boundary, function()
                                local input = {stage = stage, kind = kind, retryable = options.retryable}
                                local expected = errors.new({message = "directory dependency failure", kind = kind, retryable = options.retryable})
                                local id, err
                                if boundary == "library" then id, err = M.probe(input)
                                else id, err = funcs.call("app:directory_native_probe", input) end
                                test.is_nil(id)
                                test.not_nil(err)
                                test.eq(err:kind(), expected:kind())
                                test.eq(err:retryable(), expected:retryable())
                                test.eq(err:details().code, "directory_dependency")
                                test.eq(err:details().nested.stage, stage)
                            end)
                        end
                    end
                end
            end
        end
        for _, stage in ipairs({"missing_definition", "missing_instance", "missing_principal", "missing_existence"}) do
            test.it("retains the existing refusal for " .. stage, function()
                dependency.configure({stage = stage, kind = errors.INTERNAL})
                local id, err = subjects.find("reader@example.invalid", "user")
                test.is_nil(id)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
            end)
        end
        test.it("keeps canonical, absent and opaque identities", function()
            dependency.configure({stage = "valid", kind = errors.INTERNAL})
            local id, err = subjects.find("reader@example.invalid", "user")
            test.is_nil(err)
            test.eq(id, "canonical-user")
            dependency.configure({stage = "absent", kind = errors.INTERNAL})
            local absent, absent_err = subjects.find("reader@example.invalid", "user")
            test.is_nil(absent)
            test.is_nil(absent_err)
            for _, subject_type in ipairs({"user", "group", "service"}) do
                dependency.configure({stage = "valid", kind = errors.INTERNAL})
                local opaque, opaque_err = subjects.find("opaque-identity", subject_type)
                test.is_nil(opaque_err)
                test.eq(opaque, "opaque-identity")
                test.eq(#dependency.calls, 0)
            end
        end)
    end)
end

M.run = test.run_cases(define_tests)
return M
