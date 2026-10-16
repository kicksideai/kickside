local test = require("test")
local adoption = require("adoption")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke() return adoption.adopt_tx(fixture, fixture, "component", {kind = "user", id = "operator"}) end
return {run = test.run_cases(function()
    test.describe("native adoption storage failures", function()
        for _, stage in ipairs({"grants", "owner_update", "owner_insert", "encode"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "adoption dependency refuses",
                            details = {code = "adoption_dependency", error_kind = "dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source); fixture.owner_missing = stage == "owner_insert"
                        local value, err = invoke(); test.is_nil(value); test.not_nil(err)
                        if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "adoption guard requires failure"})) end
                        test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "adoption_dependency"); test.eq(err:details().nested.marker, "kept")
                        test.eq(err:details().error_kind, "infrastructure")
                        test.eq(err:details().cause.kind, source:kind()); test.eq(err:details().cause.retryable, source:retryable())
                        test.eq(err:details().cause.details.error_kind, "dependency")
                        test.eq(fixture.identity_writes, 0); test.eq(fixture.audits, 0)
                        if stage == "grants" then test.eq(fixture.grants, 0) end
                    end)
                end
            end
        end
        test.it("missing successful codec result remains permanent infrastructure failure", function()
            fixture.reset("", nil); fixture.missing_encoding = true
            local value, err = invoke(); test.is_nil(value); test.not_nil(err)
            if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "adoption guard requires codec refusal"})) end
            test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.eq(err:details().error_kind, "infrastructure")
            test.eq(fixture.identity_writes, 0); test.eq(fixture.audits, 0)
        end)
        for _, missing in ipairs({false, true}) do
            test.it("healthy owner presence/" .. tostring(missing), function()
                fixture.reset("", nil); fixture.owner_missing = missing
                local result, err = invoke(); test.is_nil(err); test.eq(result.component_id, "component")
                test.eq(result.adopted_by, "operator"); test.eq(result.identity_generation, 3); test.eq(#result.prior_access, 0)
                test.eq(fixture.grants, 1); test.eq(fixture.owner_updates, 1); test.eq(fixture.owner_inserts, missing and 1 or 0)
                test.eq(fixture.identity_writes, 1); test.eq(fixture.audits, 1)
            end)
        end
    end)
end)}
