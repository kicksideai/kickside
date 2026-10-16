local test = require("test")
local command = require("command")
local fixture = require("fixture")
local function invoke(operation)
    if operation == "identity" then return command.set_execution_identity("component", {kind = "user", id = "operator"}, "request", 0) end
    if operation == "declaration" then return command.apply_declaration({}, function() return true end) end
    return command.create_declared({}, function() return true end)
end
local function native(actual: error?, source: error, committed: boolean?)
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "command guard requires failure"})) end
    test.eq(actual:kind(), source:kind())
    if committed then
        test.is_false(actual:retryable()); test.eq(actual:details().cause.kind, source:kind())
        test.eq(actual:details().cause.retryable, source:retryable()); test.eq(actual:details().cause.details.code, "command_dependency")
        test.eq(actual:details().cause.details.nested.marker, "kept")
    else test.eq(actual:retryable(), source:retryable()) end
    test.eq(actual:details().code, "command_dependency"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native component command dependencies", function()
        for _, operation in ipairs({"identity", "declaration", "creation"}) do
            local stages = operation == "identity" and {"open1", "owner_read", "release1", "owner_contract", "owner_open", "owner_verify", "prepare", "open2", "begin", "work", "commit", "release2"}
                or (operation == "creation" and {"prepare", "open1", "begin", "work", "dialect", "lifecycle", "commit", "release1", "committed"}
                or {"prepare", "open1", "begin", "work", "commit", "release1"})
            for _, stage in ipairs(stages) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(operation .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "command dependency refusal", retryable = options.retryable,
                                details = {code = "command_dependency", nested = {marker = "kept"}}})
                            fixture.reset(operation, stage, source); local result, err = invoke(operation)
                            test.is_nil(result)
                            local committed = stage == "commit" or stage == "committed" or stage == "release2"
                                or (stage == "release1" and operation ~= "identity")
                            native(err, source, committed)
                            local has_effect = stage == "work" or stage == "dialect" or stage == "lifecycle" or stage == "commit" or stage == "committed"
                                or (stage == "release1" and operation ~= "identity") or stage == "release2"
                            test.eq(fixture.effects, has_effect and 1 or 0)
                        end)
                    end
                end
            end
            for _, secondary in ipairs({"rollback", "release"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    test.it(operation .. "/secondary/" .. secondary .. "/" .. kind, function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "work refused",
                            details = {code = "primary_dependency", nested = {marker = "primary"}}})
                        local source = errors.new({kind = kind, retryable = true, message = "cleanup refused",
                            details = {code = "command_dependency", nested = {marker = "kept"}}})
                        fixture.reset(operation, "work", primary)
                        if secondary == "rollback" then fixture.rollback_source = source else
                            fixture.stage = operation == "identity" and "release2" or "release1"
                            fixture.source = source
                            fixture.work_source = primary
                        end
                        local result, err = invoke(operation); test.is_nil(result); native(err, source)
                        test.eq(err:details().operation_error.kind, primary:kind()); test.is_false(err:details().operation_error.retryable)
                            test.eq(err:details().operation_error.details.code, "primary_dependency")
                            test.eq(err:details().operation_error.details.nested.marker, "primary")
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                    end)
                end
            end
            local missing = operation == "identity" and {"open1", "owner_contract", "owner_open", "open2", "begin", "work", "commit"}
                or (operation == "creation" and {"open1", "begin", "work", "dialect", "commit"} or {"open1", "begin", "work", "commit"})
            for _, stage in ipairs(missing) do
                test.it(operation .. "/missing/" .. stage, function()
                    fixture.reset(operation, stage, nil); local result, err = invoke(operation)
                    test.is_nil(result); test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
                    test.eq(err:details().code, "component_command_response")
                    local before_work = stage ~= "work" and stage ~= "dialect" and stage ~= "commit"
                    test.eq(fixture.effects, before_work and 0 or 1)
                    test.eq(fixture.commits, stage == "commit" and 1 or 0)
                end)
            end
            test.it(operation .. "/healthy", function()
                fixture.reset(operation, "", nil); local result, err = invoke(operation)
                test.is_nil(err); test.not_nil(result); test.eq(fixture.effects, 1); test.eq(fixture.commits, 1)
                test.eq(fixture.rollbacks, 0); test.eq(fixture.releases, operation == "identity" and 2 or 1)
            end)
        end
    end)
end)}
