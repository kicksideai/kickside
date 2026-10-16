local test = require("test")
local native_registry = require("registry")
local config = require("config")
local fixture = require("fixture")
local function invoke(stage)
    if stage == "database" or stage:sub(1, 9) == "database_" then return pcall(config.db_id) end
    if stage == "host" or stage:sub(1, 5) == "host_" then return pcall(config.process_host) end
    local value, err = config.policy()
    return err == nil, err or value
end
return {run = test.run_cases(function()
    test.describe("native Jobs configuration boundaries", function()
        for _, stage in ipairs({"database", "host", "version", "policy"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable), function()
                        local source = errors.new({kind = kind, message = "configuration dependency refusal", retryable = opts.retryable,
                            details = {code = "configuration_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, nil)
                        local ok, actual = invoke(stage); test.is_false(ok)
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "configuration_dependency"); test.eq(actual:details().nested.stage, stage)
                        test.eq(source:details().nested.stage, stage)
                    end)
                end
            end
        end
        for _, response in ipairs({{stage = "database_missing", code = "job_config_response"},
            {stage = "database_malformed", code = "job_config_response"}, {stage = "host_missing", code = "job_config_response"},
            {stage = "host_malformed", code = "job_config_response"}, {stage = "version_missing", code = "job_registry_response"}}) do
            local stage = response.stage
            test.it("rejects missing or malformed success/" .. stage, function()
                fixture.reset(stage, nil, nil)
                local ok, actual = invoke(stage); test.is_false(ok); test.is_true(errors.is(actual, errors.INTERNAL))
                test.is_false(actual:retryable()); test.eq(actual:details().code, response.code)
            end)
        end
        test.it("missing policy remains a declaration fault", function()
            fixture.reset("policy_missing", nil, nil)
            local ok, err = invoke("policy_missing"); test.is_false(ok); test.is_true(errors.is(err, errors.INVALID)); test.is_false(err:retryable())
        end)
        test.it("healthy database and host remain", function()
            fixture.reset("", nil, nil); test.eq(config.db_id(), "fixture-db"); test.eq(config.process_host(), "fixture-host")
        end)
        test.it("validated policy keeps isolated cached copies", function()
            local entry, entry_err = native_registry.get("kickside.core.jobs:policy"); test.is_nil(entry_err)
            fixture.reset("", nil, entry.meta)
            local value, err = config.policy(); test.is_nil(err); test.not_nil(value)
            local original = value.fairness_shares.live; value.fairness_shares.live = 12345
            local copy, copy_err = config.policy(); test.is_nil(copy_err); test.eq(copy.fairness_shares.live, original)
        end)
    end)
end)}
