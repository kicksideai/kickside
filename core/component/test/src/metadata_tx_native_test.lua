local test = require("test")
local metadata = require("metadata")
local fixture = require("fixture")
local envelope = require("envelope")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(trusted: boolean)
    return metadata.set_meta({component_id = "11111111-1111-4111-8111-111111111111", fields = {label = "kept"}, trusted_runtime = trusted})
end
local function native(result: any, source: error, committed: boolean)
    local err = envelope.error_of(result, "metadata", "metadata refuses")
    test.eq(result.success, false); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind())
    local policy = source:retryable()
    if committed then policy = false end
    test.eq(err:retryable(), policy)
    test.eq(err:details().code, "metadata_dependency"); test.eq(err:details().nested.marker, "kept")
    if committed then
        test.eq(err:details().cause.kind, source:kind()); test.eq(err:details().cause.retryable, source:retryable())
        test.eq(err:details().cause.details.code, "metadata_dependency")
    end
    return err
end
return {run = test.run_cases(function()
    test.describe("native metadata transaction causes", function()
        for _, trusted in ipairs({false, true}) do
            local stages = {"actor", "actor_id", "open", "begin", "metadata", "dbtype", "summary", "lifecycle", "snapshot", "commit", "release", "committed", "notify"}
            if trusted then stages[#stages + 1] = "lock"; stages[#stages + 1] = "registry"; stages[#stages + 1] = "permission"
            else stages[#stages + 1] = "access" end
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(tostring(trusted) .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "metadata dependency refuses",
                                details = {code = "metadata_dependency", nested = {marker = "kept"}}})
                            fixture.reset(trusted, stage, source); local result = invoke(trusted)
                            if stage == "registry" and kind == errors.NOT_FOUND then test.is_true(result.success)
                            else
                                local committed = stage == "commit" or stage == "release" or stage == "committed" or stage == "notify"
                                native(result, source, committed)
                                if stage == "actor" or stage == "actor_id" then test.eq(fixture.opens, 0)
                                else test.eq(fixture.releases, stage == "open" and 0 or 1) end
                                if not committed then test.eq(fixture.commits, 0); test.eq(fixture.notifications, 0) end
                                if stage == "release" or stage == "commit" then test.eq(fixture.committed_calls, 0) end
                                if stage == "committed" then test.eq(fixture.notifications, 0) end
                            end
                        end)
                    end
                end
            end
            for _, secondary in ipairs({"rollback", "release", "both"}) do
                for _, kind in ipairs(kinds) do
                    test.it(tostring(trusted) .. "/cleanup/" .. secondary .. "/" .. kind, function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "metadata write refuses", details = {code = "metadata_primary"}})
                        local cleanup = errors.new({kind = kind, retryable = true, message = "metadata cleanup refuses",
                            details = {code = "metadata_dependency", nested = {marker = "kept"}}})
                        fixture.reset(trusted, "metadata", primary)
                        if secondary ~= "release" then fixture.rollback_source = cleanup end
                        if secondary ~= "rollback" then fixture.release_source = cleanup end
                        local err = native(invoke(trusted), cleanup, false); local cause = err:details().operation_error
                        if secondary == "both" then cause = cause.details.operation_error end
                        test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable); test.eq(cause.details.code, "metadata_primary")
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0)
                    end)
                end
            end
            for _, field in ipairs({"open", "begin", "summary", "dbtype", "snapshot"}) do
                test.it(tostring(trusted) .. "/missing reply/" .. field, function()
                    fixture.reset(trusted, "", nil); fixture.reply_field = field
                    local result = invoke(trusted); local err = envelope.error_of(result, "metadata", "metadata refuses")
                    test.eq(result.success, false); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                    test.eq(err:details().code, "component_command_response")
                    test.eq(err:details().field, field == "open" and "database" or field == "begin" and "transaction" or field)
                    test.eq(fixture.notifications, 0)
                end)
            end
            for _, changed in ipairs({false, true}) do
                test.it(tostring(trusted) .. "/healthy/" .. tostring(changed), function()
                    fixture.reset(trusted, "", nil); fixture.changed = changed
                    local result = invoke(trusted); test.is_true(result.success); test.eq(result.changes_made, changed)
                    test.eq(fixture.commits, 1); test.eq(fixture.releases, 1); test.eq(fixture.notifications, changed and 1 or 0)
                end)
            end
        end
    end)
end)}
