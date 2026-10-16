local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local resource = require("resource")
local cleanup_fixture = require("cleanup_fixture")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "attachment guard requires JSON proof"})) end
    return result
end
local function call(method: string): (any, error?)
    local db = fixture.database()
    if method == "complete" then
        local err = api.complete(db, "thread", {trusted_audit = true}, nil, {system = true})
        if err then return nil, err end
        return true, nil
    end
    return api[method](db, "thread", {trusted_audit = true}, nil, {system = true})
end
return {run = test.run_cases(function()
    test.describe("native thread attachment errors", function()
        for _, method in ipairs({"finish", "complete", "attach"}) do
            for _, stage in ipairs({"retention", "read"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "attachment_dependency", nested = {marker = "kept"}}})
                            fixture.reset(stage, source, nil); local value, err = call(method)
                            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                            test.eq(encoded(err:details()), encoded(source:details())); test.eq(fixture.purges, method == "attach" and 1 or 0)
                        end)
                        test.it(method .. "/purge/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local primary = errors.new({kind = errors.TIMEOUT, retryable = true, message = "operation refuses", details = {code = "attachment_operation", nested = {marker = "primary"}}})
                            local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "purge refuses", details = {code = "attachment_cleanup", nested = {marker = "secondary"}}})
                            fixture.reset(stage, primary, secondary); local value, err = call(method)
                            test.is_nil(value); test.not_nil(err)
                            if method == "attach" then
                                test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable()); test.eq(err:details().code, "attachment_cleanup")
                                test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                                test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(secondary)))
                            else
                                test.eq(err:kind(), primary:kind()); test.eq(err:retryable(), primary:retryable()); test.eq(encoded(err:details()), encoded(primary:details()))
                            end
                            test.eq(fixture.purges, method == "attach" and 1 or 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"missing", "empty", "scalar_rows", "scalar_thread"}) do
                test.it(method .. "/" .. stage, function()
                    fixture.reset(stage, nil, nil); local value, err = call(method)
                    test.is_nil(value); test.not_nil(err); test.eq(err:kind(), stage == "empty" and errors.NOT_FOUND or errors.INTERNAL); test.is_false(err:retryable())
                    test.not_nil(err:details().code); test.eq(fixture.purges, method == "attach" and 1 or 0)
                end)
            end
            test.it(method .. "/healthy", function()
                fixture.reset("", nil, nil); local value, err = call(method)
                test.is_nil(err); test.not_nil(value); test.eq(fixture.purges, 0)
                if method == "complete" then test.is_true(value) else test.eq(value.thread.marker, "kept"); test.eq(value.component_id, "thread") end
            end)
        end
        for _, stage in ipairs({"missing_purge", "scalar_purge"}) do
            test.it("attach retains missing cleanup proof/" .. stage, function()
                local source = errors.new({kind = errors.TIMEOUT, retryable = true, message = "operation refuses", details = {code = "operation"}})
                fixture.reset(stage, source, nil); local value, err = call("attach")
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.eq(err:details().code, "attachment_purge_result_missing")
                test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(source))); test.eq(fixture.purges, 1)
            end)
        end
        test.it("ensure retains attachment cleanup Conflict before probing a winner", function()
            local operation = errors.new({kind = errors.TIMEOUT, retryable = true, message = "attachment refuses", details = {code = "operation"}})
            local source = errors.new({kind = errors.CONFLICT, retryable = false, message = "purge refuses", details = {code = "attachment_cleanup", operation_error = error_envelope.encode(operation)}})
            cleanup_fixture.reset("ensure_thread", "attach_cleanup", source, nil)
            local value, err = resource.ensure_thread({component_id = "thread"})
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.CONFLICT); test.is_false(err:retryable())
            test.eq(err:details().code, "attachment_cleanup"); test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(operation)))
            test.eq(cleanup_fixture.opens, 2); test.eq(cleanup_fixture.reads, 1); test.eq(cleanup_fixture.removes, 1)
        end)
    end)
end)}
