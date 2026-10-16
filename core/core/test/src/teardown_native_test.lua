local test = require("test")
local teardown = require("teardown")
local fixture = require("fixture")
local routes = {"lookup", "mark", "fence", "page", "notify", "pending_notify", "gate", "remove", "remaining"}
local function call(stage: string): (any, error?)
    if stage == "gate" or stage == "remove" or stage == "remaining" then
        return teardown.delete(fixture.executor(), "source", nil)
    end
    return teardown.purge_thread(fixture.executor(), "source", nil)
end
local function dependencies(first: integer, last: integer)
    for index = first, last do
        local stage = routes[index]
        if type(stage) ~= "string" then error(errors.new({kind = errors.INTERNAL, message = "test route is missing"})) end
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "teardown dependency refusal", retryable = options.retryable,
                        details = {code = "teardown_dependency", nested = {stage = stage}}})
                    fixture.reset(stage, source)
                    local value, err = call(stage)
                    test.is_nil(value)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "teardown_dependency")
                    test.eq(err:details().nested.stage, stage)
                    test.eq(source:details().nested.stage, stage)
                    if stage == "lookup" or stage == "mark" or stage == "fence" or stage == "gate"
                        or stage == "remove" or stage == "remaining" then test.eq(fixture.page_calls, 0) end
                    if stage == "pending_notify" then
                        test.eq(err:details().operation_error.kind, errors.CONFLICT)
                        test.is_true(err:details().operation_error.retryable)
                        test.eq(err:details().operation_error.details.code, "fence_pending")
                        test.is_true(err:details().operation_error.details.needs_continue)
                    end
                end)
            end
        end
    end
end
local function proofs()
    local fields = {lookup = "thread.rows", fence = "fence.complete", page = "page.summary", gate = "thread.component_id",
        remaining = "remaining.rows", notify = "notification.accepted"}
    for _, stage in ipairs({"lookup", "fence", "page", "gate", "remaining", "notify"}) do
        for _, proof in ipairs({{name = "missing"}, {name = "false", value = false}, {name = "number", value = 7}}) do
            test.it("required proof/" .. stage .. "/" .. proof.name, function()
                fixture.reset(stage, nil)
                fixture.missing, fixture.proof = true, proof.value
                local value, err = call(stage)
                if stage == "notify" and proof.name == "false" then
                    test.is_nil(err)
                    test.is_true(value.purged)
                    test.eq(fixture.page_calls, 1)
                    test.eq(fixture.notify_calls, 1)
                else
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "thread_teardown_response")
                    test.eq(err:details().field, fields[stage])
                    if stage == "lookup" or stage == "fence" or stage == "gate" or stage == "remaining" then
                        test.eq(fixture.page_calls, 0)
                    end
                end
            end)
        end
    end
    for _, proof in ipairs({{value = {}, field = "thread.component_id"}, {value = {component_id = 7}, field = "thread.component_id"}}) do
        test.it("malformed gated component/" .. type(proof.value.component_id), function()
            fixture.reset("gate", nil)
            fixture.missing, fixture.proof = true, proof.value
            local value, err = call("gate")
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.is_false(err:retryable())
            test.eq(err:details().code, "thread_teardown_response")
            test.eq(err:details().field, proof.field)
            test.eq(fixture.page_calls, 0)
        end)
    end
    test.it("malformed notified summary refuses explicitly", function()
        fixture.reset("page", nil)
        fixture.missing, fixture.proof = true, {}
        local value, err = call("page")
        test.is_nil(value)
        test.is_true(errors.is(err, errors.INTERNAL))
        test.is_false(err:retryable())
        test.eq(err:details().code, "thread_teardown_response")
        test.eq(err:details().field, "page.notified")
    end)
    for _, mode in ipairs({"purge", "delete", "absent_purge", "absent_delete", "empty_notified", "in_progress"}) do
        test.it("retains successful teardown/" .. mode, function()
            fixture.reset("", nil)
            if mode == "absent_purge" then fixture.stage, fixture.missing, fixture.proof = "lookup", true, {} end
            if mode == "absent_delete" then fixture.stage, fixture.missing, fixture.proof = "remaining", true, {} end
            if mode == "empty_notified" then fixture.stage, fixture.missing, fixture.proof = "page", true, {notified = {}} end
            if mode == "in_progress" then fixture.warning = {in_progress = true, status = "deleting", cleanup_pending = true,
                kind = errors.CONFLICT, retryable = true, details = {code = "component_pending"}, discarded = {events = 3}} end
            local value, err
            if mode == "delete" or mode == "absent_delete" or mode == "in_progress" then
                value, err = teardown.delete(fixture.executor(), "source", nil)
            else value, err = teardown.purge_thread(fixture.executor(), "source", nil) end
            test.is_nil(err)
            if mode == "in_progress" then
                test.is_true(value.in_progress)
                test.is_false(value.deleted)
                test.eq(value.kind, errors.CONFLICT)
                test.is_true(value.retryable)
                test.eq(value.details.code, "component_pending")
                test.eq(value.discarded.events, 3)
                test.eq(fixture.page_calls, 0)
            elseif mode == "delete" or mode == "absent_delete" then test.is_true(value.deleted)
            else test.is_true(value.purged) end
            if mode == "absent_purge" or mode == "absent_delete" then
                test.eq(fixture.page_calls, 0)
                test.eq(#value.notified, 0)
            elseif mode ~= "in_progress" then
                test.eq(fixture.page_calls, 1)
                test.eq(fixture.notify_calls, mode == "empty_notified" and 0 or 1)
            end
        end)
    end
    test.it("empty purge identifier remains idempotent", function()
        fixture.reset("", nil)
        local value, err = teardown.purge_thread(fixture.executor(), "", nil)
        test.is_nil(err)
        test.is_true(value.purged)
        test.eq(fixture.mark_calls, 0)
    end)
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native thread teardown dependencies 1", function() dependencies(1, 4) end),
    run_dependencies_2 = group("native thread teardown dependencies 2", function() dependencies(5, 9) end),
    run_proofs = group("native thread teardown proofs", proofs),
}
