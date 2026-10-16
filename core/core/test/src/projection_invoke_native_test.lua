local test = require("test")
local invoke = require("invoke")
local fixture = require("fixture")
local input = {job = {id = "job", lease_token = "token", execution_seq = 1}, payload = {cursor_id = "cursor"}}
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
    errors.RATE_LIMITED, errors.UNKNOWN}
local routes = {"policy", "get", "snapshot", "decode", "identity", "first", "latest", "type",
    "begin", "complete", "commit", "time", "parse", "validate", "post_binding", "events", "release",
    "run", "process_host", "proc", "advance", "post_run", "failure"}
local release_routes = {"snapshot", "decode", "identity", "first", "latest", "type", "begin",
            "complete", "commit", "time", "parse", "validate", "post_binding", "events"}

local function dependencies(first: integer, last: integer)
    for index = first, last do
        local stage = routes[index]
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "invocation dependency refusal",
                        retryable = options.retryable, details = {code = "invoke_dependency", nested = {stage = stage}}})
                    fixture.reset(stage, source)
                    local result, err = invoke.run(input)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "invoke_dependency")
                    test.eq(err:details().nested.stage, stage)
                    test.eq(source:details().nested.stage, stage)
                    test.eq(fixture.releases, (stage == "policy" or stage == "get") and 0 or 1)
                    if stage == "get" or stage == "snapshot" or stage == "decode" or stage == "identity"
                        or stage == "parse" or stage == "validate" or stage == "post_binding" or stage == "events"
                        or stage == "release" then test.eq(fixture.calls, 0) end
                end)
            end
        end
    end
end

local function releases(first: integer, last: integer)
    for index = first, last do
        local stage = release_routes[index]
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("release retains preceding cause/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local primary = errors.new({kind = errors.INVALID, message = "primary refusal", retryable = false,
                        details = {code = "primary_refusal", nested = {stage = stage}}})
                    local secondary = errors.new({kind = kind, message = "release refusal", retryable = options.retryable,
                        details = {code = "release_refusal", nested = {stage = "release"}}})
                    fixture.reset(stage, primary)
                    fixture.release_source = secondary
                    local result, err = invoke.run(input)
                    test.is_nil(result)
                    test.eq(err:kind(), secondary:kind())
                    test.eq(err:retryable(), secondary:retryable())
                    test.eq(err:details().code, "release_refusal")
                    test.eq(err:details().nested.stage, "release")
                    local prior = err:details().operation_error
                    test.eq(prior.kind, primary:kind())
                    test.eq(prior.retryable, false)
                    test.eq(prior.details.code, "primary_refusal")
                    test.eq(prior.details.nested.stage, stage)
                    test.eq(fixture.releases, 1)
                end)
            end
        end
    end
end

local function outcomes()
    for _, kind in ipairs(kinds) do
        for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
            test.it("rollback retains completion refusal/" .. kind .. "/" .. tostring(options.retryable), function()
                local primary = errors.new({kind = errors.CONFLICT, message = "completion refusal", retryable = false,
                    details = {code = "completion_refusal"}})
                local secondary = errors.new({kind = kind, message = "rollback refusal", retryable = options.retryable,
                    details = {code = "rollback_refusal", nested = {stage = "rollback"}}})
                fixture.reset("complete", primary)
                fixture.rollback_source = secondary
                local result, err = invoke.run(input)
                test.is_nil(result)
                test.eq(err:kind(), secondary:kind())
                test.eq(err:retryable(), secondary:retryable())
                test.eq(err:details().code, "rollback_refusal")
                test.eq(err:details().nested.stage, "rollback")
                test.eq(err:details().operation_error.kind, primary:kind())
                test.eq(err:details().operation_error.retryable, false)
                test.eq(err:details().operation_error.details.code, "completion_refusal")
                test.eq(fixture.rollbacks, 1)
                test.eq(fixture.commits, 0)
                test.eq(fixture.releases, 1)
            end)
        end
    end
    for _, route in ipairs({{stage = "policy", field = "policy"}, {stage = "get", field = "database"},
        {stage = "snapshot", field = "snapshot.rows"}, {stage = "decode", field = "body"},
        {stage = "identity", field = "execution_identity"}, {stage = "type", field = "database.type"},
        {stage = "begin", field = "transaction"}, {stage = "complete", field = "completion"},
        {stage = "parse", field = "worker.reference"}, {stage = "validate", field = "worker.binding"},
        {stage = "events", field = "events"}, {stage = "process_host", field = "process_host"},
        {stage = "first", field = "debounce.first"}, {stage = "latest", field = "debounce.latest"},
        {stage = "time", field = "event.created_at"}, {stage = "advance", field = "advance"}, {stage = "run", field = "worker.output"}}) do
        for _, proof in ipairs({{label = "missing"}, {label = "false", value = false}, {label = "number", value = 7}}) do
            test.it("malformed successful response/" .. route.stage .. "/" .. proof.label, function()
                fixture.reset(route.stage, nil)
                fixture.missing, fixture.proof = true, proof.value
                local result, err = invoke.run(input)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "projection_invoke_response")
                test.eq(err:details().field, route.field)
                test.eq(fixture.releases, (route.stage == "policy" or route.stage == "get") and 0 or 1)
                if route.stage == "begin" or route.stage == "complete" then test.eq(fixture.commits, 0) end
            end)
        end
    end
    test.it("rollback and release retain the complete cause chain", function()
        local primary = errors.new({kind = errors.INVALID, message = "completion refusal", retryable = false,
            details = {code = "completion_refusal", nested = {stage = "complete"}}})
        local rollback = errors.new({kind = errors.UNAVAILABLE, message = "rollback refusal", retryable = true,
            details = {code = "rollback_refusal", nested = {stage = "rollback"}}})
        local released = errors.new({kind = errors.TIMEOUT, message = "release refusal", retryable = false,
            details = {code = "release_refusal", nested = {stage = "release"}}})
        fixture.reset("complete", primary)
        fixture.rollback_source, fixture.release_source = rollback, released
        local result, err = invoke.run(input)
        test.is_nil(result)
        test.eq(err:kind(), released:kind())
        test.eq(err:retryable(), false)
        test.eq(err:details().code, "release_refusal")
        local previous = err:details().operation_error
        test.eq(previous.kind, rollback:kind())
        test.eq(previous.retryable, true)
        test.eq(previous.details.code, "rollback_refusal")
        test.eq(previous.details.operation_error.kind, primary:kind())
        test.eq(previous.details.operation_error.retryable, false)
        test.eq(previous.details.operation_error.details.code, "completion_refusal")
        test.eq(previous.details.operation_error.details.nested.stage, "complete")
        test.eq(fixture.rollbacks, 1)
        test.eq(fixture.releases, 1)
        test.eq(fixture.commits, 0)
    end)
    for _, mode in ipairs({"func", "proc", "defer", "empty"}) do
        test.it("valid outcome/" .. mode, function()
            fixture.reset("", nil)
            fixture.proc, fixture.debounce = mode == "proc", mode == "defer"
            if mode == "empty" then fixture.stage, fixture.missing, fixture.proof = "events", true, {} end
            local result, err = invoke.run(input)
            test.is_nil(err)
            test.eq(type(result), "table")
            test.eq(fixture.releases, 1)
            test.eq(fixture.commits, mode == "defer" and 1 or 0)
            test.eq(fixture.advances, mode == "defer" and 0 or 1)
        end)
    end
end

local function group(label: string, define: any): any
    return test.run_cases(function() test.describe(label, define) end)
end
return {
    run = group("native invocation dependencies 1", function() dependencies(1, 8) end),
    run_dependencies_2 = group("native invocation dependencies 2", function() dependencies(9, 16) end),
    run_dependencies_3 = group("native invocation dependencies 3", function() dependencies(17, #routes) end),
    run_release_1 = group("native invocation release causes 1", function() releases(1, 7) end),
    run_release_2 = group("native invocation release causes 2", function() releases(8, #release_routes) end),
    run_outcomes = group("native invocation rollback and outcomes", outcomes),
}
