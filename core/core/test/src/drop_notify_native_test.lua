local test = require("test")
local drop = require("drop")
local fixture = require("fixture")
local json = require("json")
local hook = {thread_id = "subscriber", type = "source.dropped", body = {value = 1}}
local function call(stage: string): (any, error?)
    if stage == "hooks" or stage == "decode" then return drop.hooks(fixture.executor(), "source") end
    return drop.append_tx(fixture.executor(), {hook}, "source")
end
local function define()
    local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
        errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
        errors.RATE_LIMITED, errors.UNKNOWN}
    for _, stage in ipairs({"hooks", "decode", "subscriber", "encode", "append"}) do
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "drop dependency refusal", retryable = options.retryable,
                        details = {code = "drop_dependency", nested = {stage = stage}}})
                    fixture.reset(stage, source)
                    local value, err = call(stage)
                    test.is_nil(value)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "drop_dependency")
                    test.eq(err:details().nested.stage, stage)
                    test.eq(source:details().nested.stage, stage)
                    test.eq(fixture.calls, stage == "append" and 1 or 0)
                end)
            end
        end
    end
    for _, route in ipairs({{stage = "hooks", field = "hooks.rows"}, {stage = "decode", field = "projection.body"},
        {stage = "subscriber", field = "subscriber.rows"}, {stage = "encode", field = "event.body_json"},
        {stage = "append", field = "append.inserted"}}) do
        for _, proof in ipairs({{label = "missing"}, {label = "false", value = false}, {label = "number", value = 7}}) do
            test.it("missing successful proof/" .. route.stage .. "/" .. proof.label, function()
                fixture.reset(route.stage, nil)
                fixture.missing, fixture.proof = true, proof.value
                local value, err = call(route.stage)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "drop_notify_response")
                test.eq(err:details().field, route.field)
                test.eq(fixture.calls, route.stage == "append" and 1 or 0)
            end)
        end
    end
    for _, invalid in ipairs({{value = "hook", field = "drop_notify"}, {value = {}, field = "drop_notify"},
        {value = {thread_id = "subscriber", type = "source.dropped", body = "data"}, field = "drop_notify.body"}}) do
        test.it("malformed hook/" .. invalid.field .. "/" .. type(invalid.value), function()
            fixture.reset("", nil)
            fixture.body = {drop_notify = invalid.value}
            local value, err = drop.hooks(fixture.executor(), "source")
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.is_false(err:retryable())
            test.eq(err:details().code, "drop_notify_response")
            test.eq(err:details().field, invalid.field)
            test.eq(fixture.calls, 0)
        end)
    end
    test.it("preserves real JSON decoder fields", function()
        local _, expected = json.decode("{")
        test.not_nil(expected)
        fixture.reset("", nil)
        fixture.sdk, fixture.raw_body = true, "{"
        local value, err = drop.hooks(fixture.executor(), "source")
        test.is_nil(value)
        test.eq(err:kind(), expected:kind())
        test.eq(err:retryable(), expected:retryable())
        test.eq(err:details(), expected:details())
        test.eq(fixture.calls, 0)
    end)
    for _, raw in ipairs({"false", "7", '"data"', "null"}) do
        test.it("refuses scalar persisted body/" .. raw, function()
            fixture.reset("", nil)
            fixture.sdk, fixture.raw_body = true, raw
            local value, err = drop.hooks(fixture.executor(), "source")
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.is_false(err:retryable())
            test.eq(err:details().code, "drop_notify_response")
            test.eq(err:details().field, "projection.body")
            test.eq(fixture.calls, 0)
        end)
    end
    for _, mode in ipairs({"hooks", "append", "empty", "absent", "deleting", "duplicate", "optional_body", "no_hook"}) do
        test.it("valid result/" .. mode, function()
            fixture.reset("", nil)
            local value: any, err: any
            if mode == "hooks" or mode == "optional_body" or mode == "no_hook" then
                if mode == "optional_body" then fixture.body.drop_notify.body = nil end
                if mode == "no_hook" then fixture.body = {} end
                value, err = drop.hooks(fixture.executor(), "source")
                test.eq(#value, mode == "no_hook" and 0 or 1)
                if mode == "optional_body" then test.eq(next(value[1].body), nil) end
            elseif mode == "empty" then value, err = drop.append_tx(fixture.executor(), {}, "source")
            else
                if mode == "absent" or mode == "deleting" then
                    fixture.stage, fixture.missing = "subscriber", true
                    fixture.proof = mode == "absent" and {} or {{deleting_at = "timestamp"}}
                elseif mode == "duplicate" then
                    fixture.stage, fixture.missing, fixture.proof = "append", true, {inserted = 0}
                end
                value, err = drop.append_tx(fixture.executor(), {hook}, "source")
            end
            test.is_nil(err)
            test.eq(type(value), "table")
            if mode == "append" then test.eq(value[1], "subscriber") end
            if mode == "empty" or mode == "absent" or mode == "deleting" or mode == "duplicate" then test.eq(#value, 0) end
        end)
    end
end
return {run = test.run_cases(function() test.describe("native drop notifications", define) end)}
