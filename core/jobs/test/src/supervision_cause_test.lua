local test = require("test")
local supervisor = require("supervisor")
local fixture = require("fixture")
local function preserves(actual: error?, source: error)
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "supervision guard requires failure"})) end
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "supervision_dependency"); test.eq(actual:details().nested.marker, "kept")
end
local function run()
    return supervisor.run({spawn = function() fixture.spawns = fixture.spawns + 1; return "child", nil end,
        wait = function() return {kind = "exit", result = {ok = true}} end},
        {interpret_exit = function(value) return fixture.primary and nil or value, fixture.primary end})
end
return {run = test.run_cases(function()
    test.describe("native process supervision dependency causes", function()
        for _, stage in ipairs({"trap", "restore", "fence"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "supervision dependency refusal", retryable = options.retryable,
                            details = {code = "supervision_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil)
                        local actual: error? = nil
                        if stage == "fence" then
                            actual = supervisor.ensure_termination_fence({prepare_termination = function() fixture.fences = fixture.fences + 1; return source end,
                                wait_retry = function(ms) fixture.retries = fixture.retries + 1 end}, "child", {})
                            test.eq(fixture.fences, 4); test.eq(fixture.retries, 3)
                        else
                            local output, err = run(); test.is_nil(output); actual = err
                            test.eq(fixture.spawns, stage == "trap" and 0 or 1); test.eq(fixture.sets, stage == "trap" and 1 or 2)
                        end
                        preserves(actual, source); test.eq(source:details().nested.marker, "kept")
                    end)
                    if stage == "restore" then test.it("restore retains execution/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "restore refusal", retryable = options.retryable,
                            details = {code = "supervision_dependency", nested = {marker = "kept"}}})
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "execution denied", retryable = false,
                            details = {code = "execution_refusal", nested = {operation = "child"}}})
                        fixture.reset("restore", source, primary)
                        local output, actual = run(); test.is_nil(output); preserves(actual, source)
                        local encoded = actual:details().operation_error
                        test.eq(encoded.kind, primary:kind()); test.eq(encoded.retryable, false)
                        test.eq(encoded.details.code, "execution_refusal"); test.eq(encoded.details.nested.operation, "child")
                        test.eq(fixture.sets, 2)
                    end) end
                end
            end
        end
        test.it("successful options restore remains", function()
            fixture.reset("", nil, nil); local output, err = run(); test.is_nil(err); test.is_true(output.ok); test.eq(fixture.sets, 2)
        end)
        test.it("recovered fence remains", function()
            fixture.reset("", nil, nil)
            local err = supervisor.ensure_termination_fence({prepare_termination = function()
                fixture.fences = fixture.fences + 1
                if fixture.fences == 1 then return errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "fence retry"}) end
                return nil
            end, wait_retry = function(ms) fixture.retries = fixture.retries + 1 end}, "child", {})
            test.is_nil(err); test.eq(fixture.fences, 2); test.eq(fixture.retries, 1)
        end)
    end)
end)}
