local test = require("test")
local apply = require("apply")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
    errors.RATE_LIMITED, errors.UNKNOWN}
local routes = {}
for _, stage in ipairs({"append_encode", "identity", "admission", "get", "type", "begin", "lock",
    "cursor", "body_encode", "update", "cursor_update", "append", "wake", "complete", "commit", "notify", "retention", "release"}) do
    routes[#routes + 1] = {stage = stage, mode = "advance"}
end
for _, stage in ipairs({"get", "type", "begin", "lock", "cursor", "pin", "fence", "invalidate", "complete", "commit", "notify", "release"}) do
    routes[#routes + 1] = {stage = stage, mode = "fail"}
end
for _, stage in ipairs({"complete", "commit", "notify"}) do routes[#routes + 1] = {stage = stage, mode = "stale"} end
routes[#routes + 1] = {stage = "registry", mode = "host"}
local worker_failure = errors.new({kind = errors.INVALID, message = "worker refusal", retryable = false,
    details = {code = "worker_refusal"}})
local function call(mode: string): (any, error?)
    if mode == "host" then return apply.process_host() end
    local snapshot: any = {id = "cursor", thread_id = "thread", projection_id = "projection", generation = 1,
        last_seq = 0, body = {meta = {}, events = {input = {{type = "source"}}}}}
    local job = {id = "job", lease_token = "token", execution_seq = 1}
    if mode == "fail" then return apply.fail("app:db", job, snapshot, worker_failure, true) end
    snapshot.actor_id, snapshot.execution_identity_json = "actor", "identity"
    return apply.advance("app:db", job, snapshot, 1,
        {append_events = {{thread_id = "other", event = {type = "example", body = {value = 1}}}}})
end
local function native(first: integer, last: integer)
    for index = first, last do
        local route = routes[index]
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(route.mode .. "/" .. route.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "apply dependency refusal", retryable = options.retryable,
                        details = {code = "apply_dependency", nested = {stage = route.stage}}})
                    fixture.reset(route.stage, source, route.mode)
                    local value, err = call(route.mode)
                    test.is_nil(value)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "apply_dependency")
                    test.eq(err:details().nested.stage, route.stage)
                    test.eq(source:details().nested.stage, route.stage)
                    if route.stage == "append_encode" or route.stage == "identity" or route.stage == "admission"
                        or route.stage == "registry" or route.stage == "get" then
                        test.eq(fixture.executions, 0)
                        test.eq(fixture.releases, 0)
                    else test.eq(fixture.releases, 1) end
                end)
            end
        end
    end
end
local function outcomes()
    test.it("defers output demand until all appends and prelocks the completing job", function()
        fixture.reset("", nil, "advance")
        local value, err = apply.advance("app:db", {id = "job", lease_token = "token", execution_seq = 1},
            {id = "cursor", thread_id = "thread", projection_id = "projection", generation = 1, last_seq = 0, body = {}}, 1,
            {append_events = {{thread_id = "other", events = {{type = "example", body_json = "{}"}}},
                {thread_id = "another", events = {{type = "example", body_json = "{}"}}}}})
        test.is_nil(err)
        test.not_nil(value)
        test.eq(fixture.appends, 2)
        test.eq(fixture.cached_appends, 2)
        test.eq(fixture.deferred, fixture.appends)
        test.eq(fixture.published_after, 2)
        test.eq(#fixture.wake_keys, 2)
        test.eq(fixture.wakes, 1)
        test.eq(fixture.completing, "job")
    end)
    test.it("locks the source thread before recording a failure", function()
        fixture.reset("", nil, "fail")
        local value, err = call("fail")
        test.is_nil(err)
        test.not_nil(value)
        test.is_true(fixture.thread_locked)
        test.is_false(fixture.cursor_before_thread)

    end)
    for _, mode in ipairs({"advance", "fail", "stale"}) do
        for _, stage in ipairs({"type", "begin", "complete", "commit", "notify"}) do
            local prior_stage = mode == "fail" and stage == "notify" and "fence" or stage
            test.it("release retains preceding cause/" .. mode .. "/" .. prior_stage, function()
                local source = errors.new({kind = errors.INVALID, message = "primary refusal", retryable = false,
                    details = {code = "primary_refusal", nested = {stage = prior_stage}}})
                fixture.reset(prior_stage, source, mode)
                fixture.release_source = errors.new({kind = errors.TIMEOUT, message = "release refusal", retryable = true,
                    details = {code = "release_refusal"}})
                local value, err = call(mode)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.TIMEOUT))
                test.is_true(err:retryable())
                test.eq(err:details().code, "release_refusal")
                test.eq(err:details().operation_error.kind, source:kind())
                test.eq(err:details().operation_error.retryable, false)
                test.eq(err:details().operation_error.details.code, "primary_refusal")
                test.eq(err:details().operation_error.details.nested.stage, prior_stage)
                test.eq(fixture.releases, 1)
            end)
        end
        for _, kind in ipairs(kinds) do
            test.it("rollback and release retain complete causes/" .. mode .. "/" .. kind, function()
                fixture.reset("complete", worker_failure, mode)
                fixture.rollback_source = errors.new({kind = kind, message = "rollback refusal", retryable = false,
                    details = {code = "rollback_refusal", nested = {stage = "rollback"}}})
                fixture.release_source = errors.new({kind = errors.UNAVAILABLE, message = "release refusal", retryable = true,
                    details = {code = "release_refusal"}})
                local value, err = call(mode)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.is_true(err:retryable())
                test.eq(err:details().code, "release_refusal")
                local rollback = err:details().operation_error
                test.eq(rollback.kind, kind)
                test.eq(rollback.retryable, false)
                test.eq(rollback.details.code, "rollback_refusal")
                test.eq(rollback.details.nested.stage, "rollback")
                test.eq(rollback.details.operation_error.kind, worker_failure:kind())
                test.eq(rollback.details.operation_error.retryable, false)
                test.eq(rollback.details.operation_error.details.code, "worker_refusal")
                test.eq(fixture.rollbacks, 1)
                test.eq(fixture.releases, 1)
                test.eq(fixture.commits, 0)
            end)
        end
    end
    for _, route in ipairs({{stage = "registry", mode = "host", field = "process_config"},
        {stage = "append_encode", field = "append.body_json"}, {stage = "identity", field = "execution_identity"},
        {stage = "admission", field = "admitted.writes"}, {stage = "get", field = "database"},
        {stage = "type", field = "database.type"}, {stage = "begin", field = "transaction"},
        {stage = "lock", field = "locked_threads"}, {stage = "cursor", field = "cursor.rows"},
        {stage = "body_encode", field = "body_json"}, {stage = "update", field = "projection.update"},
        {stage = "cursor_update", field = "cursor.update"}, {stage = "append", field = "append"},
        {stage = "wake", field = "wake"}, {stage = "complete", field = "completion"}, {stage = "fence", mode = "fail", field = "failure.fence"},
        {stage = "invalidate", mode = "fail", field = "projection.invalidate"},
        {stage = "lock", mode = "fail", field = "locked_threads"},
        {stage = "cursor", mode = "fail", field = "cursor.rows"},
        {stage = "pin", mode = "fail", field = "retention.pin"}}) do
        for _, proof in ipairs({{label = "missing"}, {label = "false", value = false}, {label = "number", value = 7}}) do
            test.it("missing successful proof/" .. route.stage .. "/" .. proof.label, function()
                fixture.reset(route.stage, nil, route.mode or "advance")
                fixture.missing, fixture.proof = true, proof.value
                local value, err = call(route.mode or "advance")
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "projection_apply_response")
                test.eq(err:details().field, route.field)
                test.eq(fixture.commits, 0)
            end)
        end
    end
    for _, mode in ipairs({"advance", "fail", "stale", "host"}) do
        test.it("valid result/" .. mode, function()
            fixture.reset("", nil, mode)
            local value, err = call(mode)
            test.is_nil(err)
            test.eq(type(value), mode == "host" and "string" or "table")
            test.eq(fixture.rollbacks, 0)
            test.eq(fixture.commits, mode == "host" and 0 or 1)
            test.eq(fixture.releases, mode == "host" and 0 or 1)
        end)
    end
    for _, proof in ipairs({
        {label = "removed cursor", stage = "cursor", value = {}, kind = errors.NOT_FOUND},
        {label = "reassigned slot", stage = "cursor", value = {{job_id = "replacement"}}, kind = errors.CONFLICT},
        {label = "missing thread head", stage = "lock", value = {}, kind = errors.INTERNAL},
    }) do
        test.it("permanent fence refusal/" .. proof.label, function()
            fixture.reset(proof.stage, nil, "advance")
            fixture.missing, fixture.proof = true, proof.value
            local value, err = call("advance")
            test.is_nil(value)
            test.is_true(errors.is(err, proof.kind))
            test.is_false(err:retryable())
            if proof.kind == errors.INTERNAL then
                test.eq(err:details().code, "projection_apply_response")
                test.eq(err:details().field, "thread.head")
            end
            test.eq(fixture.executions, 0)
            test.eq(fixture.rollbacks, 1)
            test.eq(fixture.commits, 0)
            test.eq(fixture.releases, 1)
        end)
    end
end
local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native apply dependencies 1", function() native(1, 8) end),
    run_dependencies_2 = group("native apply dependencies 2", function() native(9, 16) end),
    run_dependencies_3 = group("native apply dependencies 3", function() native(17, 24) end),
    run_dependencies_4 = group("native apply dependencies 4", function() native(25, #routes) end),
    run_outcomes = group("native apply cleanup and proofs", outcomes),
}
