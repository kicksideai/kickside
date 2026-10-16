local test = require("test")
local authority = require("authority")
local production = require("production")
local json = require("json")
local fixture = require("fixture")
local cases = {{method = "validate", stage = "encode"}, {method = "validate", stage = "validate"},
    {method = "decode", stage = "validate"}, {method = "decode", stage = "decode"},
    {method = "epochs", stage = "encode"}, {method = "epochs", stage = "validate"}}
local function snapshot() return {policy_ids = {"policy"}, groups = {"group"}, epochs = {policy = 2}} end
local function execute(method: string)
    if method == "decode" then
        local raw, err = json.encode(snapshot())
        if err or not raw then error(err or errors.new({kind = errors.INTERNAL, message = "authority fixture encoding fails"})) end
        return authority.decode(raw)
    end
    if method == "epochs" then return authority.check_epochs({policy = 2}, {policy = 2}, nil) end
    return authority.validate(snapshot())
end
local function refusal(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, message = "authority guard requires an error"})) end
    test.is_true(errors.is(err, errors.PERMISSION_DENIED))
    test.is_false(err:retryable())
    test.eq(err:details().error_kind, "subject")
    return err
end
return {run = test.run_cases(function()
    test.describe("native authority snapshot causes", function()
        for _, case in ipairs(cases) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        test.it(case.method .. "/" .. case.stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detailed), function()
                            fixture.stage = case.stage
                            local details = detailed and {code = "authority_dependency", nested = {value = "kept"}} or nil
                            local source = errors.new({kind = kind, message = "authority dependency refusal", retryable = options.retryable, details = details})
                            fixture.source = source
                            local value, err = execute(case.method)
                            test.is_nil(value)
                            local cause = refusal(err):details().cause
                            test.not_nil(cause)
                            test.eq(cause.kind, source:kind())
                            test.eq(cause.message, source:message())
                            test.eq(cause.retryable, source:retryable())
                            if detailed then
                                test.eq(cause.details.code, "authority_dependency")
                                test.eq(cause.details.nested.value, "kept")
                                test.eq(source:details().nested.value, "kept")
                            else test.is_nil(cause.details) end
                        end)
                    end
                end
            end
        end
        test.it("the real SDK accepts the same authority bytes and epochs", function()
            fixture.stage, fixture.source = nil, nil
            local valid, err = authority.validate(snapshot())
            test.is_true(valid); test.is_nil(err)
            local raw, encode_err = json.encode(snapshot())
            test.is_nil(encode_err)
            local decoded, decode_err = authority.decode(raw)
            test.is_nil(decode_err); test.eq(decoded.epochs.policy, 2)
            local expected, expected_err = production.decode(raw)
            test.is_nil(expected_err); test.eq(decoded.groups[1], expected.groups[1])
            local current, current_err = authority.check_epochs({policy = 2}, {policy = 2}, nil)
            test.is_true(current); test.is_nil(current_err)
        end)
        test.it("revoked epochs keep the permanent permission verdict", function()
            fixture.stage, fixture.source = nil, nil
            local value, err = authority.check_epochs({policy = 2}, {policy = 3}, nil)
            test.is_nil(value); test.is_nil(refusal(err):details().cause)
        end)
        test.it("nontext stored authority keeps the permanent permission verdict", function()
            fixture.stage, fixture.source = nil, nil
            local value, err = authority.decode({})
            test.is_nil(value); test.is_nil(refusal(err):details().cause)
        end)
    end)
end)}
