local test = require("test")
local context = require("context")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(route: string)
    if route == "fence" then return context.lock_and_read_identity_tx({}, "component") end
    if route == "audit" then return nil, context.audit_row_tx({}, "component", 8, "request", "{}") end
    return context.write_identity_tx({}, "component", {context = {}, generation = 7},
        {version = 2, principal = {kind = "user", id = "user-1"}}, "canonical")
end
return {run = test.run_cases(function()
    test.describe("native execution identity storage", function()
        for _, route in ipairs({"fence", "write", "audit"}) do
            local stages = route == "fence" and {"fence"} or route == "audit" and {"write"} or {"encode", "write"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, details in ipairs({{}, {code = "identity_context_dependency", nested = {marker = "kept"}},
                            {code = "identity_context_dependency", nested = {marker = "kept"}, error_kind = "source_classifier"}}) do
                            test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(details.error_kind or details.code), function()
                                local source = errors.new({kind = kind, retryable = options.retryable, message = "identity storage refuses", details = details})
                                fixture.reset(stage, source); local result, err = invoke(route)
                                test.is_nil(result); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind())
                                test.eq(err:retryable(), source:retryable())
                                local actual_details, source_details = err:details() or {}, source:details() or {}
                                test.eq(actual_details.code, details.code)
                                if details.nested then test.eq(actual_details.nested.marker, "kept"); test.eq(source_details.nested.marker, "kept") end
                                local classification = details.error_kind
                                if stage ~= "encode" and classification == nil then classification = "infrastructure" end
                                test.eq(actual_details.error_kind, classification)
                                test.eq(source_details.error_kind, details.error_kind)
                                if stage == "encode" and next(details) == nil then test.is_nil(err:details()) end
                                test.eq(fixture.writes, stage == "write" and 1 or 0)
                            end)
                        end
                    end
                end
            end
        end
        test.it("healthy fence state and identity write", function()
            fixture.reset("", nil); local state, err = invoke("fence"); test.is_nil(err); test.eq(state.generation, 7); test.eq(state.hash, "hash")
            local result, write_err = invoke("write"); test.is_nil(write_err); test.eq(result.component_id, "component"); test.is_true(result.changes_made)
            local _, audit_err = invoke("audit"); test.is_nil(audit_err); test.eq(fixture.writes, 2)
        end)
        test.it("missing audit row proof refuses", function()
            fixture.reset("", nil); fixture.count = 0
            local _, err = invoke("audit"); test.is_true(errors.is(err, errors.INTERNAL)); test.eq(err:details().error_kind, "infrastructure")
        end)
    end)
end)}
