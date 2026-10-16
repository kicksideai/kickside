local test = require("test")
local placement = require("placement")
local fixture = require("fixture")
local envelope = require("envelope")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local id = "11111111-1111-4111-8111-111111111111"
local function invoke()
    fixture.placement = true
    return placement.handle({component_id = id, parent_id = "target-parent", position = "target-position"})
end
local function native(result: any, source: error, committed: boolean)
    local err = envelope.error_of(result, "placement", "placement refuses")
    test.eq(result.success, false); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind())
    local policy = source:retryable(); if committed then policy = false end
    test.eq(err:retryable(), policy); test.eq(err:details().code, "placement_dependency"); test.eq(err:details().nested.marker, "kept")
    if committed then
        test.eq(err:details().cause.kind, source:kind()); test.eq(err:details().cause.retryable, source:retryable())
        test.eq(err:details().cause.details.code, "placement_dependency")
    end
    return err
end
return {run = test.run_cases(function()
    test.describe("native placement transaction causes", function()
        do
            local command = fixture.COMMAND_TYPES.SET_PLACEMENT
            local stages = {"actor", "actor_id", "open", "begin", "access", "dispatch", "dbtype", "summary", "lifecycle", "commit", "release", "committed"}
            stages[#stages + 1] = "parent_access"; stages[#stages + 1] = "parent_summary"; stages[#stages + 1] = "previous_summary"
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(command .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "placement dependency refuses",
                                details = {code = "placement_dependency", nested = {marker = "kept"}}})
                            fixture.reset(false, stage, source); local result = invoke()
                            local committed = stage == "commit" or stage == "release" or stage == "committed"
                            native(result, source, committed)
                            if stage == "actor" or stage == "actor_id" then test.eq(fixture.opens, 0)
                            else test.eq(fixture.releases, stage == "open" and 0 or 1) end
                            if not committed then test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0) end
                            if stage == "release" or stage == "commit" then test.eq(fixture.committed_calls, 0) end
                            if stage == "committed" then test.eq(fixture.notifications, 0) end
                        end)
                    end
                end
            end
            for _, secondary in ipairs({"rollback", "release", "both"}) do
                for _, kind in ipairs(kinds) do
                    test.it(command .. "/cleanup/" .. secondary .. "/" .. kind, function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "placement command refuses", details = {code = "placement_primary"}})
                        local cleanup = errors.new({kind = kind, retryable = true, message = "placement cleanup refuses",
                            details = {code = "placement_dependency", nested = {marker = "kept"}}})
                        fixture.reset(false, "dispatch", primary)
                        if secondary ~= "release" then fixture.rollback_source = cleanup end
                        if secondary ~= "rollback" then fixture.release_source = cleanup end
                        local err = native(invoke(), cleanup, false); local cause = err:details().operation_error
                        if secondary == "both" then cause = cause.details.operation_error end
                        test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable); test.eq(cause.details.code, "placement_primary")
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0)
                    end)
                end
            end
            local replies = {"open", "begin", "dispatch", "summary", "dbtype"}
            for _, field in ipairs(replies) do
                test.it(command .. "/missing reply/" .. field, function()
                    fixture.reset(false, "", nil); fixture.reply_field = field
                    local result = invoke(); local err = envelope.error_of(result, "placement", "placement refuses")
                    test.eq(result.success, false); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                    test.eq(err:details().code, "component_command_response")
                    local expected = field == "open" and "database" or field == "begin" and "transaction" or field == "dispatch" and "command" or field
                    test.eq(err:details().field, expected); test.eq(fixture.notifications, 0)
                end)
            end
            for _, changed in ipairs({false, true}) do
                test.it(command .. "/healthy/" .. tostring(changed), function()
                    fixture.reset(false, "", nil); fixture.changed = changed
                    fixture.placement = true
                    local result = invoke(); test.is_true(result.success); test.eq(result.changes_made, changed)
                    test.eq(result.component_id, id); test.eq(result.parent_id, "target-parent"); test.eq(result.position, "target-position")
                    test.eq(fixture.commits, 1); test.eq(fixture.releases, 1)
                    test.eq(fixture.last_command.payload.has_parent_arg, true)
                    test.eq(fixture.last_command.payload.component_id, id)
                    if changed then
                        test.eq(fixture.lifecycle_input.parent_impl_id, "implementation")
                        test.eq(fixture.lifecycle_input.previous_parent_impl_id, "implementation")
                        test.eq(fixture.lifecycle_input.previous_position, "previous-position")
                    end
                end)
            end
            for _, root in ipairs({false, true}) do
                test.it("healthy parent presence/" .. tostring(root), function()
                    fixture.reset(false, "", nil)
                    local request: any = {component_id = id}
                    if root then request.parent_id = false end
                    local result = placement.handle(request)
                    test.is_true(result.success); test.eq(fixture.last_command.payload.has_parent_arg, root)
                    test.is_nil(fixture.last_command.payload.parent_id); test.eq(fixture.access_calls, 1)
                end)
            end
        end
    end)
end)}
