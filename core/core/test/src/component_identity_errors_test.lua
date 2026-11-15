local test = require("test")
local fixture = require("fixture")
local identity = require("identity")
local common = require("common")
local canonical_json = require("canonical_json")
local execution = require("execution")
local owner_identity = require("owner_identity")
local counted_owner_identity = require("counted_owner_identity")
local function encoded(value: any): string
    local result, err = canonical_json.encode(value)
    if err then error(err) end
    if not result then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "identity guard requires JSON proof"})) end
    return result
end
return {run = test.run_cases(function()
    test.describe("native component execution identity failures", function()
        for _, route in ipairs({{name = "stored", call = identity.execution_identity_of}, {name = "declared", call = common.declared_identity}}) do
            for _, stage in ipairs({"read", "validate", "validate_success_error", "row"}) do
                if route.name == "declared" or stage ~= "row" then
                    for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                        errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(route.name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "identity_dependency", nested = {marker = "kept"}}})
                                fixture.reset(stage, source); local value, err = route.call("component")
                                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                                test.eq(encoded(err:details()), encoded(source:details()))
                                test.eq(fixture.validations, stage == "read" and 0 or 1); test.eq(fixture.rows, stage == "row" and 1 or 0)
                            end)
                        end
                    end
                end
            end
            for _, stage in ipairs({"missing_context", "scalar_context", "missing_validation", "missing_row", "scalar_row"}) do
                if route.name == "declared" or (stage ~= "missing_row" and stage ~= "scalar_row") then
                    test.it(route.name .. "/" .. stage, function()
                        fixture.reset(stage, nil); local value, err = route.call("component")
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                    end)
                end
            end
            test.it(route.name .. "/healthy", function()
                fixture.reset("", nil); local value, err = route.call("component")
                test.is_nil(err); test.not_nil(value)
                test.eq(route.name == "stored" and value.marker or value.row.marker, "kept")
            end)
            test.it(route.name .. "/absent stored identity", function()
                fixture.reset("absent", nil); local value, err = route.call("component")
                if route.name == "stored" then test.is_nil(err) end
                test.eq(fixture.validations, 0); test.eq(fixture.rows, 0)
                if route.name == "stored" then test.is_nil(value) else test.not_nil(err); test.eq(err:kind(), errors.PERMISSION_DENIED) end
            end)
        end
        for _, owner in ipairs({{}, {value = "unknown"}, {value = "principal:user:owner"}, {value = false}, {value = {}}}) do
            test.it("refuses missing or unsupported owner/" .. tostring(owner.value), function()
                local value, err = owner_identity.of_owner(nil, owner.value)
                test.is_nil(value); test.not_nil(err)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED)); test.is_false(err:retryable())
            end)
        end
        test.it("reuses parsed declaration facts only until the registry changes", function()
            fixture.reset("", nil)
            local descriptor = {impl_id = "kind", kind = "fold", on = "thread", projection_key = "default",
                worker_ref = "func://app:worker"}
            for _ = 1, 2 do
                local allowed, err = counted_owner_identity.check_declaration(descriptor)
                test.is_nil(err); test.is_true(allowed)
            end
            test.eq(fixture.declarations, 1)
            fixture.revision = "new"
            local refreshed, refresh_err = counted_owner_identity.check_declaration(descriptor)
            test.is_nil(refresh_err); test.is_true(refreshed); test.eq(fixture.declarations, 2)
            descriptor.worker_ref = "func://app:changed"
            local allowed, err = counted_owner_identity.check_declaration(descriptor)
            test.is_false(allowed); test.eq(err:kind(), errors.PERMISSION_DENIED)
            test.eq(fixture.declarations, 2, "worker refs remain checked against cached declarations")
        end)
        for _, stage in ipairs({"declaration_revision", "declaration_lookup"}) do
            test.it("propagates declaration authority failures/" .. stage, function()
                local source = errors.new({kind = errors.UNAVAILABLE, message = "declaration unavailable", retryable = true})
                fixture.reset(stage, source)
                local allowed, err = counted_owner_identity.check_declaration({impl_id = "kind"})
                test.is_false(allowed); test.not_nil(err); test.eq(err:kind(), source:kind()); test.is_true(err:retryable())
            end)
        end
        test.it("resolves each maintenance owner once within a bounded reconciliation window", function()
            fixture.reset("", nil)
            local owners = {}
            for index = 1, 4 do
                test.is_true(counted_owner_identity.binding_matches(nil, "system:lifecycle", nil, "system:lifecycle", nil, owners))
                test.is_false(counted_owner_identity.binding_matches(nil, "system:missing-owner-declaration", nil, "system:missing-owner-declaration", nil, owners))
            end
            test.eq(fixture.maintenance_checks, 2)
            test.is_true(counted_owner_identity.binding_matches(nil, "system:lifecycle", nil, "system:lifecycle", nil, {}))
            test.eq(fixture.maintenance_checks, 3, "the next window validates the registry again")
        end)
        test.it("real identity validator returns native declaration errors", function()
            local ok, err = execution.validate({version = 1})
            test.is_false(ok); test.not_nil(err); test.is_true(errors.is(err, errors.INVALID)); test.is_false(err:retryable())
            test.eq(err:details().code, "declaration")
        end)
    end)
end)}
