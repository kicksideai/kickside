local test = require("test")
local publisher = require("publisher")
local fixture = require("fixture")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local args = {component_id = "owner", impl_id = "impl", identity_generation = 3, record_json = "{}"}
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "audit cleanup guard requires encoding proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("identity audit publication preserves native release failures", function()
        for _, stage in ipairs({"ensure", "ensure_proof", "append", "append_proof", "healthy"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation refusal", details = {code = "audit_operation"}})
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque release refusal", details = {code = "audit_release", nested = {marker = "kept"}}})
                        fixture.reset(stage, primary); fixture.release_source = source
                        if stage == "ensure_proof" then fixture.responses.ensure = {} end
                        if stage == "append_proof" then fixture.responses.append = {value = {inserted = 2}} end
                        local result, err = publisher.publish_audit(args)
                        test.is_nil(result); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "audit_release"); test.eq(err:details().nested.marker, "kept")
                        if stage == "ensure" or stage == "append" then
                            test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                            test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        elseif stage ~= "healthy" then
                            test.eq(err:details().operation_error.kind, errors.INTERNAL)
                            test.eq(err:details().operation_error.retryable, false)
                            test.eq(err:details().operation_error.details.code, "identity_audit_response")
                            test.eq(err:details().operation_error.details.field, stage == "ensure_proof" and "lifecycle.ensure" or "lifecycle.append")
                            test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(encoded(err:details()), encoded(source:details())) end
                        test.eq(fixture.opens, 1); test.eq(fixture.ensures, 1)
                        test.eq(fixture.appends, (stage == "ensure" or stage == "ensure_proof") and 0 or 1)
                        test.eq(fixture.releases, 1)
                    end)
                end
            end
        end
        test.it("stable replay key and healthy response", function()
            fixture.reset("", nil)
            local result, err = publisher.publish_audit(args); test.is_nil(err)
            test.eq(encoded(result), encoded({inserted = 1, duplicates = 0}))
            test.eq(fixture.key, "identity_audit:owner:3"); test.eq(fixture.data.identity_audit, "{}")
            test.eq(fixture.releases, 1); test.eq(fixture.appends, 1)
        end)
    end)
end)}
