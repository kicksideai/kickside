local test = require("test")
local provision = require("provision")
local fixture = require("fixture")
local function check(err: any, source: any, stage: string)
    test.eq(type(err), "userdata")
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "provision_dependency")
    test.eq(err:details().nested.stage, stage)
end
return {run = test.run_cases(function()
    test.describe("native thread provisioning dependencies", function()
        for _, decision in ipairs({"deny", "undefined"}) do
            test.it("excludes an unauthorized declaration/" .. decision, function()
                fixture.reset("", nil)
                fixture.scope_decision = decision
                local ids, err = provision.ensure_user({}, fixture.scope, "user")
                test.is_nil(err)
                test.eq(#ids, 0)
                test.eq(fixture.upserts, 0)
                test.eq(fixture.gets, 0)
                test.eq(fixture.grants, 0)
            end)
        end
        for _, stage in ipairs({"threads_get", "threads_open", "thread_declaration", "upsert", "get", "retention", "release",
            "grants_get", "grants_open", "grant", "grant_envelope"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("provision/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "provision refusal", retryable = options.retryable,
                            details = {code = "provision_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local result, err = provision.ensure_user({}, fixture.scope, "user")
                        test.is_nil(result)
                        check(err, source, stage)
                        if stage == "thread_declaration" then test.eq(fixture.upserts, 0) end
                        if stage == "threads_get" or stage == "threads_open" or stage == "upsert" then test.eq(fixture.gets, 0) end
                        if stage == "get" then test.eq(fixture.retentions, 0) end
                        if stage == "retention" or stage == "release" then test.eq(fixture.grants, 0) end
                        if stage == "grants_get" or stage == "grants_open" then test.eq(fixture.grants, 0) end
                        test.eq(source:details().nested.stage, stage)
                    end)
                end
            end
        end
        for _, stage in ipairs({"get", "thread_scan", "projection_scan", "identity", "bind", "actor", "scope", "call"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("converge/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "convergence refusal", retryable = options.retryable,
                            details = {code = "provision_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local summary, err = provision.converge({}, {})
                        if stage == "get" or stage == "thread_scan" or stage == "projection_scan" then
                            check(err, source, stage)
                            test.eq(summary.checked, 0)
                            test.eq(fixture.releases, stage == "get" and 0 or 1)
                        else
                            test.is_nil(err)
                            test.eq(summary.checked, 1)
                            test.eq(summary.healed, 0)
                            test.eq(#summary.skipped, 1)
                            local entry = summary.skipped[1]
                            test.eq(type(entry.reason), "string")
                            test.eq(type(entry.error), "table")
                            check(errors.new(entry.error), source, stage)
                            test.eq(fixture.releases, 1)
                            test.eq(fixture.calls, stage == "call" and 1 or 0)
                        end
                    end)
                end
            end
        end
        for _, stage in ipairs({"threads_get", "threads_open", "grants_get", "grants_open", "get"}) do
            test.it("missing provisioning proof/" .. stage, function()
                fixture.reset("missing_" .. stage, nil)
                local result, err = provision.ensure_user({}, fixture.scope, "user")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "provision_response")
                test.eq(err:details().field, stage)
            end)
        end
        for _, stage in ipairs({"get", "actor", "scope"}) do
            test.it("missing convergence proof/" .. stage, function()
                fixture.reset("missing_" .. stage, nil)
                local summary, err = provision.converge({}, {})
                if stage ~= "get" then
                    test.is_nil(err)
                    test.eq(summary.healed, 0)
                    err = errors.new(summary.skipped[1].error)
                end
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "provision_response")
                test.eq(err:details().field, stage)
            end)
        end
        test.it("release refusal retains the preceding retention failure", function()
            local source = errors.new({kind = errors.CONFLICT, retryable = false, message = "retention refusal",
                details = {code = "retention_refusal", nested = {marker = "retained"}}})
            local release = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "release refusal",
                details = {code = "release_refusal", nested = {marker = "release"}}})
            fixture.reset("retention_release", source)
            fixture.release_source = release
            local result, err = provision.ensure_user({}, fixture.scope, "user")
            test.is_nil(result)
            test.eq(err:kind(), release:kind())
            test.eq(err:retryable(), release:retryable())
            test.eq(err:details().code, "release_refusal")
            test.eq(err:details().operation_error.kind, source:kind())
            test.eq(err:details().operation_error.retryable, false)
            test.eq(err:details().operation_error.details.code, "retention_refusal")
            test.eq(err:details().operation_error.details.nested.marker, "retained")
            test.eq(fixture.grants, 0)
        end)
        test.it("valid materialization keeps ids and one durable operation per capability", function()
            fixture.reset("", nil)
            local result, err = provision.ensure_user({}, fixture.scope, "user")
            test.is_nil(err)
            test.eq(result[1], "user:class")
            test.eq(fixture.upserts, 1)
            test.eq(fixture.retentions, 1)
            test.eq(fixture.grants, 1)
            test.eq(fixture.releases, 1)
        end)
        test.it("valid convergence de-duplicates the divergence set", function()
            fixture.reset("", nil)
            local summary, err = provision.converge({}, {})
            test.is_nil(err)
            test.eq(summary.checked, 1)
            test.eq(summary.healed, 1)
            test.eq(#summary.skipped, 0)
            test.eq(fixture.calls, 1)
            test.eq(fixture.releases, 1)
        end)
    end)
end)}
