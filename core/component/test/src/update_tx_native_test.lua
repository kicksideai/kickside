local test = require("test")
local update = require("update")
local fixture = require("fixture")
local envelope = require("envelope")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local id = "11111111-1111-4111-8111-111111111111"
local function invoke(kind: string)
    return update.handle({component_id = id, commands = {{type = kind, payload = {}}}, expected_revision = 9})
end
local function native(result: any, source: error, committed: boolean)
    local err = envelope.error_of(result, "update", "update refuses")
    test.eq(result.success, false); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind())
    local policy = source:retryable(); if committed then policy = false end
    test.eq(err:retryable(), policy); test.eq(err:details().code, "update_dependency"); test.eq(err:details().nested.marker, "kept")
    if committed then
        test.eq(err:details().cause.kind, source:kind()); test.eq(err:details().cause.retryable, source:retryable())
        test.eq(err:details().cause.details.code, "update_dependency")
    end
    return err
end
return {run = test.run_cases(function()
    test.describe("native update transaction causes", function()
        for _, command in ipairs({fixture.COMMAND_TYPES.SET_CONTEXT, fixture.COMMAND_TYPES.PATCH_CONTEXT, fixture.COMMAND_TYPES.SET_META}) do
            local stages = {"actor", "actor_id", "open", "begin", "access", "expected", "dispatch", "dbtype", "summary", "lifecycle", "revision", "commit", "release", "committed"}
            if command == fixture.COMMAND_TYPES.SET_META then stages[#stages + 1] = "snapshot"; stages[#stages + 1] = "notify" end
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(command .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "update dependency refuses",
                                details = {code = "update_dependency", nested = {marker = "kept"}}})
                            fixture.reset(false, stage, source); local result = invoke(command)
                            local committed = stage == "commit" or stage == "release" or stage == "committed" or stage == "notify"
                            native(result, source, committed)
                            if stage == "actor" or stage == "actor_id" then test.eq(fixture.opens, 0)
                            else test.eq(fixture.releases, stage == "open" and 0 or 1) end
                            if not committed then test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0) end
                            if stage == "release" or stage == "commit" then test.eq(fixture.committed_calls, 0) end
                            if stage == "committed" then test.eq(fixture.notifications, 0) end
                            if stage == "expected" then test.eq(fixture.writes, 0) end
                        end)
                    end
                end
            end
            for _, secondary in ipairs({"rollback", "release", "both"}) do
                for _, kind in ipairs(kinds) do
                    test.it(command .. "/cleanup/" .. secondary .. "/" .. kind, function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "update command refuses", details = {code = "update_primary"}})
                        local cleanup = errors.new({kind = kind, retryable = true, message = "update cleanup refuses",
                            details = {code = "update_dependency", nested = {marker = "kept"}}})
                        fixture.reset(false, "dispatch", primary)
                        if secondary ~= "release" then fixture.rollback_source = cleanup end
                        if secondary ~= "rollback" then fixture.release_source = cleanup end
                        local err = native(invoke(command), cleanup, false); local cause = err:details().operation_error
                        if secondary == "both" then cause = cause.details.operation_error end
                        test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable); test.eq(cause.details.code, "update_primary")
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0)
                    end)
                end
            end
            local replies = {"open", "begin", "dispatch", "summary", "dbtype", "revision"}
            if command == fixture.COMMAND_TYPES.SET_META then replies[#replies + 1] = "snapshot" end
            for _, field in ipairs(replies) do
                test.it(command .. "/missing reply/" .. field, function()
                    fixture.reset(false, "", nil); fixture.reply_field = field
                    local result = invoke(command); local err = envelope.error_of(result, "update", "update refuses")
                    test.eq(result.success, false); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                    test.eq(err:details().code, "component_command_response")
                    local expected = field == "open" and "database" or field == "begin" and "transaction" or field == "dispatch" and "command" or field
                    test.eq(err:details().field, expected); test.eq(fixture.notifications, 0)
                end)
            end
            for _, changed in ipairs({false, true}) do
                test.it(command .. "/healthy/" .. tostring(changed), function()
                    fixture.reset(false, "", nil); fixture.changed = changed
                    local request = {component_id = id, commands = {{type = command, payload = {marker = "kept"}}}, expected_revision = 9}
                    local result = update.handle(request); test.is_true(result.success); test.eq(result.changes_made, changed)
                    test.eq(result.context_revision, 9); test.eq(#result.results, 1); test.eq(fixture.commits, 1); test.eq(fixture.releases, 1)
                    test.is_nil(request.commands[1].payload.component_id); test.eq(fixture.last_command.payload.component_id, id)
                    test.eq(fixture.notifications, command == fixture.COMMAND_TYPES.SET_META and changed and 1 or 0)
                end)
            end
        end
    end)
end)}
