local test = require("test")
local register = require("register")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(): any
    return register.handle({component_id = "component", impl_id = "implementation", parent_id = "parent", thread = {},
        private_context = {marker = "context"}, meta = {marker = "meta"},
        additional_access = {{subject_id = "subject", subject_type = "user", access_mask = 1}}})
end
local function native(result: any, source: error, committed: boolean?)
    test.is_false(result.success); test.eq(result.kind, source:kind())
    if committed then
        test.is_false(result.retryable); test.eq(result.details.cause.kind, source:kind())
        test.eq(result.details.cause.retryable, source:retryable()); test.eq(result.details.cause.details.code, "registration_dependency")
        test.eq(result.details.cause.details.nested.marker, "kept")
    else test.eq(result.retryable, source:retryable()) end
    test.eq(result.details.code, "registration_dependency"); test.eq(result.details.nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native component registration transactions", function()
        for _, stage in ipairs({"open", "begin", "parent_access", "create", "access", "dbtype", "parent", "lifecycle", "commit", "release", "notify"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "registration dependency refused",
                            details = {code = "registration_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local result = invoke(); native(result, source, stage == "commit" or stage == "release" or stage == "notify")
                        test.eq(fixture.releases, stage == "open" and 0 or 1)
                        if stage == "open" or stage == "begin" or stage == "parent_access" then test.eq(fixture.creates, 0) end
                        if stage == "release" then test.eq(fixture.notifications, 0) end
                        if stage == "notify" then test.eq(fixture.commits, 1); test.eq(fixture.notifications, 1) end
                    end)
                end
            end
        end
        for _, cleanup in ipairs({"rollback", "release", "both"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("cleanup/" .. cleanup .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "creation refused",
                            details = {code = "registration_primary", nested = {marker = "primary"}}})
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                            details = {code = "registration_dependency", nested = {marker = "kept"}}})
                        fixture.reset("create", primary)
                        if cleanup == "rollback" then fixture.rollback_source = source else fixture.release_source = source end
                        if cleanup == "both" then fixture.rollback_source = primary end
                        local result = invoke(); native(result, source, stage == "commit" or stage == "release" or stage == "notify")
                        local cause = result.details.operation_error
                        test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                        test.eq(cause.details.code, "registration_primary"); test.eq(cause.details.nested.marker, "primary")
                        if cleanup == "both" then test.eq(cause.details.operation_error.details.code, "registration_primary") end
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1); test.eq(fixture.commits, 0)
                        test.eq(fixture.grants, 0); test.eq(fixture.events, 0); test.eq(fixture.notifications, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"open", "begin", "create", "access", "dbtype", "commit"}) do
            test.it("missing/" .. stage, function()
                fixture.reset(stage, nil); local ok, result = pcall(invoke)
                test.is_true(ok); test.is_false(result.success); test.eq(result.kind, errors.INTERNAL); test.is_false(result.retryable)
                test.eq(result.details.code, "component_command_response"); test.eq(fixture.notifications, 0)
            end)
        end
        test.it("healthy", function()
            fixture.reset("", nil); local result = invoke()
            test.is_true(result.success); test.eq(result.component_id, "component"); test.eq(result.impl_id, "implementation")
            test.eq(result.parent_id, "parent"); test.eq(result.thread_id, "component"); test.eq(type(result.created_at), "string")
            test.eq(fixture.creates, 1); test.eq(fixture.grants, 1); test.eq(fixture.events, 1); test.eq(fixture.notifications, 1)
            test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0); test.eq(fixture.releases, 1)
            test.eq(fixture.creation.private_context.marker, "context"); test.eq(fixture.creation.initial_meta.marker, "meta")
            test.eq(fixture.event.parent_impl_id, "parent-impl"); test.eq(fixture.grant.subject_id, "subject")
        end)
        test.it("denied parent access", function()
            fixture.reset("", nil); fixture.denied = true; local result = invoke()
            test.is_false(result.success); test.eq(result.kind, errors.PERMISSION_DENIED); test.eq(fixture.creates, 0)
            test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0)
        end)
    end)
end)}
