local test = require("test")
local fence = require("fence")
local fixture = require("fixture")
local function call(operation: string): (any, error?)
    if operation == "owner" then return fence.owner({}, "component") end
    if operation == "read" then return fence.read({}, "component", "automation") end
    return nil, fence.save_tx({}, operation == "update", {component_id = "component", automation_id = "automation",
        generation = 2, command_id = "command", declaration_hash = "hash"})
end
return {run = test.run_cases(function()
    test.describe("native component declaration fences", function()
        for _, operation in ipairs({"owner", "read", "update", "insert"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(operation .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "declaration database refusal", retryable = options.retryable,
                            details = {code = "declaration_dependency", error_kind = "source_category", nested = {operation = operation}}})
                        fixture.reset(operation, source)
                        local value, err = call(operation)
                        test.is_nil(value)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "declaration_dependency")
                        test.eq(err:details().nested.operation, operation)
                        test.eq(err:details().error_kind, "infrastructure")
                        test.eq(err:details().cause.kind, source:kind())
                        test.eq(err:details().cause.retryable, source:retryable())
                        test.eq(err:details().cause.details.code, "declaration_dependency")
                        test.eq(err:details().cause.details.error_kind, "source_category")
                        test.eq(source:details().error_kind, "source_category")
                        test.eq(source:details().nested.operation, operation)
                        test.eq(fixture.queries, (operation == "owner" or operation == "read") and 1 or 0)
                        test.eq(fixture.writes, (operation == "update" or operation == "insert") and 1 or 0)
                    end)
                end
            end
            test.it("successful fence/" .. operation, function()
                fixture.reset(operation, nil)
                local value, err = call(operation)
                test.is_nil(err)
                if operation == "owner" then test.eq(value, "automation")
                elseif operation == "read" then
                    test.eq(value.applied_command_generation, 2)
                    test.eq(value.command_id, "command")
                    test.eq(value.declaration_hash, "hash")
                else test.eq(fixture.write_operation, operation) end
            end)
        end
        for _, operation in ipairs({"owner", "read"}) do
            test.it("absent fence/" .. operation, function()
                fixture.reset(operation, nil)
                fixture.rows = {}
                local value, err = call(operation)
                test.is_nil(value)
                test.is_nil(err)
            end)
        end
    end)
end)}
