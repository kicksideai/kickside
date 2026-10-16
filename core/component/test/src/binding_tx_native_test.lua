local test = require("test")
local adopt = require("adopt")
local grant = require("grant")
local revoke = require("revoke")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(operation: string): any
    if operation == "adopt" then return adopt.handle({component_id = "component"}) end
    local request = {root_component_id = "component", subject = {subject_id = "subject", subject_type = "user"}, access_mask = 1}
    return operation == "grant" and grant.handle(request) or revoke.handle(request)
end
local function native(result: any, source: error, committed: boolean?)
    test.is_false(result.success); test.eq(result.kind, source:kind())
    if committed then
        test.is_false(result.retryable); test.eq(result.details.cause.kind, source:kind())
        test.eq(result.details.cause.retryable, source:retryable()); test.eq(result.details.cause.details.code, "binding_transaction_dependency")
        test.eq(result.details.cause.details.nested.marker, "kept")
    else test.eq(result.retryable, source:retryable()) end
    test.eq(result.details.code, "binding_transaction_dependency"); test.eq(result.details.nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native component binding transactions", function()
        for _, operation in ipairs({"adopt", "grant", "revoke"}) do
            local stages = operation == "adopt" and {"open", "begin", "work", "commit", "release"}
                or {"open", "begin", "access", "work", "commit", "release"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(operation .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "binding dependency refused",
                                details = {code = "binding_transaction_dependency", nested = {marker = "kept"}}})
                            fixture.reset(operation, stage, source); local result = invoke(operation); native(result, source, stage == "commit" or stage == "release")
                            test.eq(fixture.effects, (stage == "work" or stage == "commit" or stage == "release") and 1 or 0)
                            test.eq(fixture.releases, stage == "open" and 0 or 1)
                            if stage == "work" or stage == "access" then test.eq(fixture.rollbacks, 1) end
                        end)
                    end
                end
            end
            for _, cleanup in ipairs({"rollback", "release", "both"}) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(operation .. "/cleanup/" .. cleanup .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local primary = errors.new({kind = errors.INVALID, retryable = false, message = "work refused",
                                details = {code = "binding_primary", nested = {marker = "primary"}}})
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                                details = {code = "binding_transaction_dependency", nested = {marker = "kept"}}})
                            fixture.reset(operation, "work", primary)
                            if cleanup == "rollback" then fixture.rollback_source = source else fixture.release_source = source end
                            if cleanup == "both" then fixture.rollback_source = primary end
                            local result = invoke(operation); native(result, source, stage == "commit" or stage == "release")
                            local cause = result.details.operation_error
                            test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                            test.eq(cause.details.code, "binding_primary"); test.eq(cause.details.nested.marker, "primary")
                            if cleanup == "both" then test.eq(cause.details.operation_error.details.code, "binding_primary") end
                            test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1); test.eq(fixture.commits, 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"open", "begin", "work", "commit"}) do
                test.it(operation .. "/missing/" .. stage, function()
                    fixture.reset(operation, stage, nil); local ok, result = pcall(invoke, operation)
                    test.is_true(ok); test.is_false(result.success); test.eq(result.kind, errors.INTERNAL); test.is_false(result.retryable)
                    test.eq(result.details.code, "component_command_response")
                    test.eq(fixture.effects, (stage == "work" or stage == "commit") and 1 or 0)
                    test.eq(fixture.releases, stage == "open" and 0 or 1)
                end)
            end
            test.it(operation .. "/healthy", function()
                fixture.reset(operation, "", nil); local result = invoke(operation)
                test.is_true(result.success); test.eq(fixture.effects, 1); test.eq(fixture.commits, 1)
                test.eq(fixture.rollbacks, 0); test.eq(fixture.releases, 1)
                if operation == "adopt" then test.eq(result.component_id, "component"); test.eq(result.identity_generation, 2)
                else test.eq(result.root_component_id, "component"); test.eq(result.affected, 3); test.is_true(result.changes_made)
                    test.eq(fixture.subject, "subject"); test.eq(fixture.subject_type, "user"); test.eq(fixture.revoke, operation == "revoke") end
            end)
            if operation ~= "adopt" then
                test.it(operation .. "/denied access", function()
                    fixture.reset(operation, "", nil); fixture.denied = true; local result = invoke(operation)
                    test.is_false(result.success); test.eq(result.kind, errors.PERMISSION_DENIED); test.eq(fixture.effects, 0)
                    test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1)
                end)
            end
        end
        for _, refusal in ipairs({"permission", "confined", "maintenance"}) do
            test.it("adopt preflight/" .. refusal, function()
                fixture.reset("adopt", "", nil)
                if refusal == "permission" then fixture.permission = false
                elseif refusal == "confined" then fixture.confined = true else fixture.maintenance = true end
                local result = invoke("adopt"); test.is_false(result.success); test.eq(result.kind, errors.PERMISSION_DENIED)
                test.eq(fixture.opens, 0); test.eq(fixture.effects, 0)
            end)
        end
    end)
end)}
