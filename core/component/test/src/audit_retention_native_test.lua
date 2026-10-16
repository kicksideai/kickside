local test = require("test")
local retention = require("retention")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(err: any, source: error)
    test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "audit_retention_dependency"); test.eq(err:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native component audit retention", function()
        for _, stage in ipairs({"policy", "publication_open", "publication_scan", "publication_release", "publish", "ack_open", "ack", "ack_release",
            "retention_open", "owner_scan", "begin", "lock", "prune_read", "delete", "commit", "retention_release"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "audit dependency refused",
                            details = {code = "audit_retention_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local result, err = retention.run(1)
                        test.is_nil(result); native(err, source)
                        if stage == "publication_release" then test.eq(fixture.events, 0); test.eq(fixture.acks, 0) end
                        if stage == "ack_release" then test.eq(fixture.begins, 0) end
                        if stage == "lock" or stage == "prune_read" or stage == "delete" then test.eq(fixture.rollbacks, 1) end
                    end)
                end
            end
        end
        for _, cleanup in ipairs({"rollback", "release", "both"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("cleanup/" .. cleanup .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local primary = errors.new({kind = errors.INVALID, retryable = false, message = "prune refused",
                            details = {code = "audit_retention_primary", nested = {marker = "primary"}}})
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                            details = {code = "audit_retention_dependency", nested = {marker = "kept"}}})
                        fixture.reset("prune_read", primary)
                        if cleanup == "rollback" then fixture.rollback_source = source else fixture.release_source = source end
                        if cleanup == "both" then fixture.rollback_source = primary end
                        local result, err = retention.run(1); test.is_nil(result); native(err, source)
                        local cause = err:details().operation_error
                        test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                        test.eq(cause.details.code, "audit_retention_primary"); test.eq(cause.details.nested.marker, "primary")
                        if cleanup == "both" then test.eq(cause.details.operation_error.details.code, "audit_retention_primary") end
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.releases, 3); test.eq(fixture.commits, 0); test.eq(fixture.deletes, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"policy", "publication_open", "publication_scan", "publish", "ack_open", "ack", "retention_open", "owner_scan", "begin", "lock", "prune_read", "delete", "commit"}) do
            test.it("missing/" .. stage, function()
                fixture.reset(stage, nil); local ok, result, err = pcall(retention.run, 1)
                test.is_true(ok); test.is_nil(result); test.eq(type(err), "userdata")
                test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
                test.eq(err:details().code, "component_audit_retention_response")
            end)
        end
        test.it("healthy publication and bounded pruning", function()
            fixture.reset("", nil); local result, err = retention.run(1)
            test.is_nil(err); test.eq(result.published, 1); test.eq(result.pruned, 1)
            test.eq(fixture.events, 1); test.eq(fixture.acks, 1); test.eq(fixture.deletes, 1)
            test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0); test.eq(fixture.releases, 3)
            test.eq(fixture.event.component_id, "component"); test.eq(fixture.event.identity_generation, 1)
        end)
        test.it("empty publication and pruning", function()
            fixture.reset("", nil); fixture.empty = true
            local result, err = retention.run(1)
            test.is_nil(err); test.eq(result.published, 0); test.eq(result.pruned, 0)
            test.eq(fixture.events, 0); test.eq(fixture.acks, 0); test.eq(fixture.begins, 0)
            test.eq(fixture.releases, 2)
        end)
        for _, limit in ipairs({0, 101, 1.5}) do
            test.it("invalid limit/" .. tostring(limit), function()
                fixture.reset("", nil); local result, err = (retention :: any).run(limit)
                test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); test.is_false(err:retryable()); test.eq(fixture.opens, 0)
            end)
        end
    end)
end)}
