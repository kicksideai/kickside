local test = require("test")
local jobs = require("jobs")
local fixture = require("fixture")
local function invoke(route: string): (any?, error?)
    if route == "enqueue" then return jobs.enqueue({namespace = "thread", scope = "owner", key = "key", job_type = "app:job",
        owner_locator = {kind = "thread", id = "owner"}, immutable_payload = {}}) end
    if route == "cancel" then return jobs.cancel("job") end
    return jobs.complete("job", {token = "lease", execution_seq = 1}, {})
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction guard requires an error"})) end
    return err
end
local function retained(actual: error, source: error, secondary: boolean?)
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "transaction_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not secondary then test.is_nil(actual:details()) end
end
local function group(route: string)
    return test.run_cases(function()
        test.describe("native Jobs public transaction/" .. route, function()
            for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detailed in ipairs({false, true}) do
                        local function source(): error
                            return errors.new({kind = kind, message = "transaction dependency refusal", retryable = policy.retryable,
                                details = detailed and {code = "transaction_dependency", nested = {marker = "kept"}} or nil})
                        end
                        for _, stage in ipairs({"begin", "operation", "commit"}) do
                            test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local cause = source(); fixture.reset(route, stage, cause)
                                local value, err = invoke(route); test.is_nil(value); retained(required(err), cause)
                                test.eq(fixture.commits, stage == "commit" and 1 or 0)
                                test.eq(fixture.rollbacks, stage == "operation" and 1 or 0)
                            end)
                        end
                        test.it("rollback/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                            local cause = source(); local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                                message = "transaction operation refusal", details = {code = "transaction_primary"}})
                            fixture.reset(route, "operation", primary); fixture.rollback_error = cause
                            local value, err = invoke(route); test.is_nil(value); local actual = required(err); retained(actual, cause, true)
                            test.eq(actual:details().cause.kind, cause:kind()); test.eq(actual:details().cause.retryable, cause:retryable())
                            test.eq(actual:details().operation_error.kind, primary:kind())
                            test.eq(actual:details().operation_error.details.code, "transaction_primary")
                            test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                        end)
                    end
                end
            end
            for index, response in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                test.it("missing transaction/" .. tostring(index), function()
                    fixture.reset(route, "begin", nil); fixture.missing, fixture.value = true, response.value
                    local ok, value, err = pcall(function() return invoke(route) end)
                    test.is_true(ok); test.is_nil(value); local actual = required(err)
                    test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_scope_response"); test.eq(actual:details().field, "transaction")
                    test.eq(fixture.commits, 0)
                end)
            end
            test.it("valid transaction", function()
                fixture.reset(route, "", nil); local value, err = invoke(route)
                test.is_nil(err); test.not_nil(value); test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0)
            end)
        end)
    end)
end
return {run = group("enqueue"), cancel = group("cancel"), complete = group("complete")}
