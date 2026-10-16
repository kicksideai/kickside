local test = require("test")
local policy = require("policy")
local fixture = require("fixture")
local function valid()
    return {meta = {retention = {events = "24h", receipts_orphan = "12h"},
        sweep = {batch_events = 23, batch_receipts = 11}, limits = {max_row_bytes = 4}}}
end
local operations = {
    policy = function() local _, err = policy.policy(); return err end,
    row = function() return policy.check_row("scope", 4, "append") end,
}
return {run = test.run_cases(function()
    test.describe("native retention policy dependencies", function()
        for name, operation in pairs(operations) do
            for _, stage in ipairs({"version", "registry", "events", "receipts"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "retention policy dependency failure",
                                retryable = options.retryable, details = {code = "retention_dependency", nested = {stage = stage}}})
                            fixture.reset(stage, source, valid(), false, nil)
                            local err = operation()
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "retention_dependency")
                            test.eq(err:details().nested.stage, stage)
                            test.eq(fixture.versions, 1)
                            test.eq(fixture.gets, stage == "version" and 0 or 1)
                            test.eq(fixture.parses, stage == "events" and 1 or stage == "receipts" and 2 or 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"version", "events", "receipts"}) do
                for _, input in ipairs({{name = "missing"}, {name = "false", value = false}}) do
                    test.it(name .. "/malformed/" .. stage .. "/" .. input.name, function()
                        fixture.reset(stage, nil, valid(), true, input.value)
                        local err = operation()
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, "retention_policy_response")
                        test.eq(err:details().field, stage == "version" and "registry.version" or
                            stage == "events" and "retention.events" or "retention.receipts_orphan")
                        test.eq(fixture.versions, 1)
                        test.eq(fixture.gets, stage == "version" and 0 or 1)
                        test.eq(fixture.parses, stage == "events" and 1 or stage == "receipts" and 2 or 0)
                    end)
                end
            end
            for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
                {name = "number", value = 42}, {name = "string", value = "entry"}}) do
                test.it(name .. "/malformed/entry/" .. input.name, function()
                    fixture.reset("registry", nil, input.value, false, nil)
                    local err = operation()
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "retention_policy_response")
                    test.eq(err:details().field, "kickside.core:policy.entry")
                    test.eq(fixture.versions, 1)
                    test.eq(fixture.gets, 1)
                    test.eq(fixture.parses, 0)
                end)
            end
        end
        test.it("retains copied cache values and row-size limits", function()
            fixture.reset("", nil, valid(), false, nil)
            local value, err = policy.policy()
            test.is_nil(err)
            test.eq(value.events_ms, 86400000)
            test.eq(value.receipts_orphan_ms, 43200000)
            value.events_ms = 1
            local copied, copied_err = policy.policy()
            test.is_nil(copied_err)
            test.eq(copied.events_ms, 86400000)
            test.is_nil(policy.check_row("scope", 4, "append"))
            local refused = policy.check_row("scope", 5, "append")
            test.is_true(errors.is(refused, errors.INVALID))
            test.eq(refused:retryable(), false)
            test.eq(refused:details().reason, "row_too_large")
            test.eq(refused:details().used, 5)
            test.eq(refused:details().cap, 4)
            test.eq(fixture.versions, 4)
            test.eq(fixture.gets, 1)
            test.eq(fixture.parses, 2)
        end)
        test.it("propagates version failure before an existing cache", function()
            fixture.reset("", nil, valid(), false, nil)
            local initial, initial_err = policy.policy()
            test.is_nil(initial_err)
            test.not_nil(initial)
            local source = errors.new({kind = errors.PERMISSION_DENIED, message = "version denied",
                retryable = false, details = {code = "version_denied"}})
            fixture.stage, fixture.source = "version", source
            local value, err = policy.policy()
            test.is_nil(value)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "version_denied")
            test.eq(fixture.versions, 2)
            test.eq(fixture.gets, 1)
        end)
        test.it("retains day durations without SDK duration calls", function()
            local entry = valid()
            entry.meta.retention.events, entry.meta.retention.receipts_orphan = "90d", "30d"
            fixture.reset("", nil, entry, false, nil)
            local value, err = policy.policy()
            test.is_nil(err)
            test.eq(value.events_ms, 90 * 86400000)
            test.eq(value.receipts_orphan_ms, 30 * 86400000)
            test.eq(fixture.parses, 0)
        end)
    end)
end)}
