local test = require("test")
local component = require("component")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
    errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function emit()
    return component.emit_singleton_event("documents", {type = "document.changed", body = {marker = "body"},
        impl_id = "fixture:implementation", thread_class = "documents", trace_context = {marker = "trace"},
        external_source = "source", external_id = "identity", external_version = "version"})
end
return {run = test.run_cases(function()
    test.describe("native singleton event contract boundaries", function()
        for _, stage in ipairs({"get", "actor", "scope", "open", "emit"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "singleton dependency refusal", retryable = options.retryable,
                            details = {code = "singleton_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); local result, err = emit()
                        test.is_nil(result); test.not_nil(err)
                        test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "singleton_dependency"); test.eq(err:details().nested.marker, "kept")
                        test.eq(fixture.emits, stage == "emit" and 1 or 0)
                        test.eq(fixture.opens, (stage == "open" or stage == "emit") and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"get", "actor", "scope", "open"}) do
            test.it("missing/" .. stage, function()
                fixture.reset(stage, nil); fixture.missing = true; local result, err = emit()
                test.is_nil(result); test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
                test.eq(err:details().code, "component_binding_response"); test.eq(fixture.emits, 0)
            end)
        end
        test.it("healthy emission preserves frame and event fields", function()
            fixture.reset("", nil); local result, err = emit(); test.is_nil(err); test.is_true(result.accepted)
            test.eq(fixture.emits, 1); test.eq(fixture.lookups, 1); test.eq(fixture.contract_id, "kickside.core:threads")
            test.eq(fixture.bound_actor, fixture.actor); test.eq(fixture.bound_scope, fixture.scope)
            test.eq(fixture.request.component_id, component.singleton_component_id("singleton-owner", "documents"))
            test.eq(fixture.request.type, "document.changed"); test.eq(fixture.request.body.marker, "body")
            test.eq(fixture.request.impl_id, "fixture:implementation"); test.eq(fixture.request.thread_class, "documents")
            test.eq(fixture.request.trace_context.marker, "trace"); test.eq(fixture.request.external.external_source, "source")
            test.eq(fixture.request.external.external_id, "identity"); test.eq(fixture.request.external.external_version, "version")
        end)
    end)
end)}
