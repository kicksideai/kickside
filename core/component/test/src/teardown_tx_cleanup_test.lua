local test = require("test")
local teardown = require("teardown")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(operation: string): (any, string?, error?)
    if operation == "begin" or operation == "enqueue" then return teardown.begin_delete("component", "actor", nil) end
    if operation == "unregister" then return teardown.unregister("component", nil) end
    error("unknown transaction operation")
end
local function native(actual: error?, source: error)
    test.not_nil(actual); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "tx_cleanup"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native teardown transaction cleanup", function()
        test.it("classifies confirmed absence without hiding transaction cleanup errors", function()
            fixture.reset("begin", "", nil); fixture.absent = true
            local ok, step, err = teardown.begin_delete("component", nil, nil)
            test.is_false(ok); test.eq(step, "absent"); test.is_true(errors.is(err, errors.NOT_FOUND))
            for _, cleanup in ipairs({"release_source", "rollback_source"}) do
                fixture.reset("begin", "", nil); fixture.absent = true
                fixture[cleanup] = errors.new({kind = errors.NOT_FOUND, message = "cleanup dependency is absent"})
                ok, step, err = teardown.begin_delete("component", nil, nil)
                test.is_false(ok); test.eq(step, "delete"); test.is_true(errors.is(err, errors.NOT_FOUND))
                test.not_nil(err:details().operation_error)
            end
        end)
        test.it("reports a nudge failure separately after committed acceptance", function()
            fixture.reset("begin", "nudge", errors.new({kind = errors.UNAVAILABLE, message = "nudge refuses", retryable = true}))
            local ok, step, err, marked, job_id = teardown.begin_delete("component", "actor", nil)
            test.is_true(ok); test.eq(step, "notify"); test.not_nil(err); test.is_false(err:retryable())
            test.is_true(marked); test.eq(job_id, "job"); test.eq(fixture.commits, 1)
        end)
        test.it("notifies deleting after intent commit", function()
            fixture.reset("begin", "", nil)
            test.is_true(teardown.begin_delete("component", "actor", nil))
            test.eq(fixture.event, "component.deleting")
            test.eq(fixture.event_commits, 1)
        end)
        test.it("captures the audience before final removal and notifies after commit", function()
            fixture.reset("unregister", "", nil)
            local result, step, err = teardown.unregister("component", nil)
            test.is_nil(err); test.is_nil(step); test.is_true(result.changes_made)
            test.eq(fixture.audience_commits, 0)
            test.eq(fixture.event, "component.deleted")
            test.eq(fixture.event_commits, 1)
            test.eq(fixture.recipients[1], "reader")
        end)
        test.it("takes the structural lock before row writes for explicit reroot", function()
            fixture.reset("unregister", "tree", errors.new({kind = errors.UNAVAILABLE, message = "structural lock refuses"}))
            local result, step, err = teardown.unregister("component", "reparent_root")
            test.is_nil(result); test.eq(step, "delete"); test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(fixture.effects, 0); test.eq(fixture.row_locks, 0)
        end)
        test.it("retains a release notification error on a committed bounded page", function()
            fixture.reset("unregister", "", nil); fixture.pending = true
            fixture.release_source = errors.new({kind = errors.UNAVAILABLE, message = "release refuses", retryable = true})
            local result, step, err = teardown.unregister("component", nil)
            test.is_nil(result); test.eq(step, "pending"); test.is_true(errors.is(err, errors.CONFLICT))
            test.not_nil(err:details().notification_error)
            test.is_false(err:details().notification_error.retryable)
            test.eq(fixture.purges, 0)
        end)
        for _, stage in ipairs({"notify", "committed"}) do
            test.it("finishes post-commit cleanup after " .. stage .. " failure", function()
                fixture.reset("unregister", stage, errors.new({kind = errors.UNAVAILABLE, message = "delivery refuses", retryable = true}))
                local result, step, err = teardown.unregister("component", nil)
                test.is_nil(step); test.is_nil(err); test.is_true(result.changes_made)
                test.not_nil(result.notification_error); test.is_false(result.notification_error.retryable)
                test.eq(fixture.notifications, 1); test.eq(fixture.purges, 1)
            end)
        end
        for _, operation in ipairs({"begin", "unregister", "enqueue"}) do
            local cases = operation == "enqueue" and {"success_release", "work_release"}
                or {"begin_release", "work_rollback", "work_release", "work_both", "commit_release", "success_release"}
            for _, mode in ipairs(cases) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(operation .. "/" .. mode .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local primary = errors.new({kind = errors.INVALID, retryable = false, message = "operation refused",
                                details = {code = "tx_primary", nested = {marker = "primary"}}})
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                                details = {code = "tx_cleanup", nested = {marker = "kept"}}})
                            local stage = mode == "begin_release" and "begin" or (mode == "commit_release" and "commit"
                                or (mode == "success_release" and "" or (operation == "enqueue" and "enqueue" or (operation == "unregister" and "lock" or "tree"))))
                            fixture.reset(operation, stage, primary)
                            if mode == "work_rollback" then fixture.rollback_source = source
                            else fixture.release_source = source end
                            if mode == "work_both" then fixture.rollback_source = primary end
                            local result, step, actual = invoke(operation)
                            if mode == "success_release" then
                                if operation == "unregister" then
                                    test.is_true(result.changes_made); test.is_nil(step); test.is_nil(actual)
                                    test.eq(result.notification_error.kind, source:kind())
                                    test.is_false(result.notification_error.retryable)
                                    test.eq(result.notification_error.details.code, "tx_cleanup")
                                    test.eq(fixture.notifications, 1); test.eq(fixture.purges, 1)
                                else
                                    test.is_true(result); test.eq(step, "notify"); test.eq(actual:kind(), source:kind()); test.eq(actual:details().code, "tx_cleanup")
                                    test.is_false(actual:retryable())
                                end
                                return
                            end
                            native(actual, source)
                            if operation == "begin" or operation == "enqueue" then test.is_false(result)
                            elseif operation == "unregister" then test.is_nil(result) end
                            test.eq(step, mode == "begin_release" and "begin" or
                                (mode == "commit_release" and "commit" or "delete"))
                            test.eq(fixture.releases, 1); test.eq(fixture.notifications, 0); test.eq(fixture.purges, 0)
                            if mode ~= "success_release" then
                                local cause = actual:details().operation_error
                                test.not_nil(cause); test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                                test.eq(cause.details.code, "tx_primary"); test.eq(cause.details.nested.marker, "primary")
                                if mode == "work_both" then
                                    test.eq(cause.details.operation_error.kind, primary:kind())
                                    test.eq(cause.details.operation_error.details.code, "tx_primary")
                                end
                            end
                            if mode:sub(1,4) == "work" then test.eq(fixture.rollbacks, 1) end
                        end)
                    end
                end
            end
            test.it(operation .. " healthy tuple and ordering", function()
                fixture.reset(operation, "", nil); local result, step, err = invoke(operation)
                test.is_nil(err); test.is_nil(step); test.eq(fixture.rollbacks, 0)
                if operation == "begin" or operation == "enqueue" then test.is_true(result); test.eq(fixture.commits, 1); test.eq(fixture.releases, 1)
                elseif operation == "unregister" then test.is_true(result.changes_made); test.eq(fixture.commits, 1)
                    test.eq(fixture.notifications, 1); test.eq(fixture.purges, 1); test.eq(fixture.releases, 2)
                end
            end)
        end
    end)
end)}
