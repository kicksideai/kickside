-- The component_service envelope: a lower layer's error keeps its kind, an
-- unclassified error is INTERNAL, and the client reads a failure without a kind as
-- INTERNAL rather than as an access refusal.

local test = require("test")
local envelope = require("envelope")
local registry = require("registry")
local json = require("json")

local function define_tests()
    test.describe("component service envelope", function()
        test.it("retains native retryability and nested details through service and client wrappers", function()
            for _, kind in ipairs({ errors.INVALID, errors.NOT_FOUND, errors.ALREADY_EXISTS,
                errors.CONFLICT, errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL,
                errors.TIMEOUT, errors.CANCELED, errors.RATE_LIMITED, errors.UNKNOWN }) do
                for _, options in ipairs({ {}, { retryable = false }, { retryable = true } }) do
                    local source = errors.new({ kind = kind, message = "native source",
                        retryable = options.retryable,
                        details = { code = "component_dependency", nested = { kind = kind } } })
                    local failed = envelope.from_error(source, "service")
                    local client = envelope.error_of(failed, "client")
                    local call = envelope.call_error(source, "dispatch")
                    for _, err in ipairs({ client, call }) do
                        test.is_true(errors.is(err, kind))
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "component_dependency")
                        test.eq(err:details().nested.kind, kind)
                    end
                    test.eq(failed.retryable, source:retryable())
                end
            end
        end)
        test.it("returns failure envelopes for unstructured error values", function()
            for _, value in ipairs({ { message = "table error" }, false, 17 }) do
                local result = envelope.from_error(value)
                test.is_false(result.success)
                test.eq(result.kind, errors.INTERNAL)
                test.eq(result.error, tostring(value))
                test.is_nil(result.details)
            end
        end)

        test.it("retains the source of an unclassified storage failure", function()
            local source = errors.new({ kind = errors.UNKNOWN, message = "unclassified storage",
                retryable = true, details = { code = "driver_failure", nested = { request = "r-1" } } })
            local result = envelope.from_error(source, "read")
            local err = envelope.error_of(result, "client")
            test.is_true(errors.is(err, source:kind()))
            test.eq(err:retryable(), source:retryable())
            local cause = err:details().cause
            test.eq(cause.kind, source:kind())
            test.eq(cause.message, source:message())
            test.eq(cause.retryable, source:retryable())
            test.eq(cause.details.code, source:details().code)
            test.eq(cause.details.nested.request, "r-1")
        end)

        test.it("declares optional structured failure details on every service result", function()
            local declaration, read_err = registry.get("kickside.component:component_service")
            test.is_nil(read_err)
            for _, method in ipairs(declaration.data.methods) do
                for _, schema in ipairs(method.output_schemas) do
                    local output, decode_err = json.decode(schema.definition)
                    test.is_nil(decode_err)
                    test.not_nil(output.properties.details, method.name)
                    test.eq(output.properties.details.type, "object")
                end
            end
        end)

        test.it("carries structured conflict details through the service and client", function()
            local details = { reason = "version_mismatch", subject = "context", version = 2, expected = 1 }
            local failed = envelope.from_error(errors.new({ message = "stale", kind = errors.CONFLICT, details = details }))
            local err = envelope.error_of(failed, "update")
            test.not_nil(err)
            local client_details = (err :: error):details()
            for key, value in pairs(details) do
                test.eq(failed.details[key], value)
                test.eq(client_details[key], value)
            end
            test.eq(envelope.from_error("driver failure").kind, errors.INTERNAL)
        end)

        test.it("keeps the kind a lower layer assigned", function()
            for _, kind in ipairs({
                errors.INVALID, errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.CONFLICT, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.TIMEOUT, errors.CANCELED, errors.RATE_LIMITED, errors.UNKNOWN,
            }) do
                local failed = envelope.from_error(errors.new({ message = "boom", kind = kind }), "step")
                test.eq(failed.success, false)
                test.eq(failed.kind, kind)
                test.eq(failed.error, "step: boom")
            end
        end)

        test.it("a failed service call keeps native kinds and raw failures remain INTERNAL", function()
            for _, kind in ipairs({ errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.TIMEOUT }) do
                local err = envelope.call_error(errors.new({ message = "call failed", kind = kind }), "get_access_context")
                test.is_true(errors.is(err, kind), tostring(err))
                test.eq((err :: any):message(), "get_access_context: call failed")
            end
            test.is_true(errors.is(envelope.call_error(errors.new("call failed"), "get_access_context_by_meta"), errors.UNKNOWN))
            test.is_true(errors.is(envelope.call_error("call failed", "get_access_context_by_meta"), errors.INTERNAL))
        end)

        test.it("classifies raw failures as INTERNAL and preserves native UNKNOWN", function()
            test.eq(envelope.kind_of("driver: no such table"), errors.INTERNAL)
            test.eq(envelope.kind_of(errors.new("untyped")), errors.UNKNOWN)
            test.eq(envelope.internal("Failed to commit transaction").kind, errors.INTERNAL)
        end)

        test.it("the client reads a failure without a kind as INTERNAL", function()
            local err = envelope.error_of({ success = false, error = "storage exploded" }, "get")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
            test.is_false(errors.is(err, errors.PERMISSION_DENIED))
            test.eq((err :: any):message(), "storage exploded")
        end)

        test.it("the client keeps the service's kind", function()
            local err = envelope.error_of({ success = false, error = "no", kind = errors.PERMISSION_DENIED }, "get")
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.is_nil(envelope.error_of({ success = true }, "get"))
            test.is_true(errors.is(envelope.error_of(nil, "get"), errors.INTERNAL))
        end)

        test.it("decodes an explicit native Unknown without treating it as an absent kind", function()
            local err = envelope.error_of({success = false, error = "unclassified dependency", kind = errors.UNKNOWN,
                retryable = true, details = {code = "dependency_unknown"}}, "get", "client")
            test.not_nil(err)
            test.eq(err:kind(), errors.UNKNOWN)
            test.is_true(err:retryable())
            test.eq(err:details().code, "dependency_unknown")
            test.eq(err:message(), "client: unclassified dependency")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
