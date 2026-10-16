local test = require("test")
local common = require("common")
local fixture = require("fixture")
local resource = require("resource")
local events = require("events")
local natural = require("natural")
local execution = require("execution")
local function invoke(route: string): (any, error?)
    if route == "key" then return common.keyed_principal("actor") end
    if route == "meta" or route == "actor_key" then return common.actor_principal() end
    if route == "create_meta" then return resource.create({thread_class = "workspace", impl_id = "impl"}) end
    if route == "ensure_meta" then return resource.ensure_thread({component_id = "component", impl_id = "impl"}) end
    if route == "emit_key" or route == "emit_meta" then return resource.emit({component_id = "component", impl_id = "impl", type = "event.type"}) end
    if route == "upsert_meta" then return natural.upsert({thread_class = "workspace", external_ref = "external"}) end
    return events.append_events({thread_id = "thread", audit = true,
        audit_thread = {impl_id = "kickside.core.lifecycle:system_lifecycle", thread_class = "lifecycle", audience_principal = {kind = "user", id = "principal"}},
        events = {{type = "kickside.lifecycle.events:principal.deleted", role = "system", body_json = "{}",
            external = {external_source = "lifecycle", external_id = "event"}}}})
end
return {run = test.run_cases(function()
    test.describe("native Core principal resolution", function()
        for _, route in ipairs({"key", "meta", "actor_key", "create_meta", "ensure_meta", "emit_key", "emit_meta", "upsert_meta", "audit_key", "audit_cleanup"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                            details = {code = "principal_resolution_dependency", nested = {marker = "kept"}}})
                        local secondary = route == "audit_cleanup" and errors.new({kind = errors.CONFLICT, retryable = false,
                            message = "release refusal", details = {code = "principal_resolution_cleanup", nested = {marker = "cleanup"}}}) or nil
                        fixture.reset(route, source, secondary); local result, err = invoke(route)
                        local expected = secondary or source
                        test.is_nil(result); test.not_nil(err); test.eq(err:kind(), expected:kind()); test.eq(err:retryable(), expected:retryable())
                        test.eq(err:details().code, expected:details().code); test.eq(err:details().nested.marker, expected:details().nested.marker)
                        test.eq(fixture.registers, 0); test.eq(fixture.ensures, 0); test.eq(fixture.writes, 0); test.eq(fixture.appends, 0)
                        if route == "audit_cleanup" then
                            local operation = err:details().operation_error
                            test.not_nil(operation); test.eq(operation.kind, source:kind()); test.eq(operation.retryable, source:retryable())
                            test.eq(operation.details.code, "principal_resolution_dependency"); test.eq(operation.details.nested.marker, "kept")
                            test.eq(err:details().cause.kind, secondary:kind()); test.eq(err:details().cause.details.code, "principal_resolution_cleanup")
                            test.eq(fixture.releases, 1)
                        end
                    end)
                end
            end
        end
        test.it("an absent optional owner key avoids an invalid inverse lookup", function()
            fixture.reset("", nil, nil)
            for _, key in ipairs({{}, {value = ""}, {value = "   "}}) do
                local principal, err = common.keyed_principal(key.value)
                test.is_nil(principal); test.is_nil(err)
            end
            test.eq(fixture.key_reads, 0)
        end)
        test.it("framework actor category has no optional principal without a refused lookup", function()
            fixture.reset("maintenance", nil, nil)
            local keyed, key_err = common.keyed_principal("system:test-maintenance")
            local acting, actor_err = common.actor_principal()
            test.is_nil(keyed); test.is_nil(key_err); test.is_nil(acting); test.is_nil(actor_err)
            test.eq(fixture.key_reads, 0); test.eq(fixture.meta_reads, 0)
        end)
        test.it("explicit actor metadata keeps its principal even with a maintenance actor key", function()
            fixture.reset("maintenance_metadata", nil, nil); local result, err = common.actor_principal()
            test.is_nil(err); test.eq(result.kind, "user"); test.eq(result.id, "principal")
            test.eq(fixture.key_reads, 0); test.eq(fixture.meta_reads, 1)
        end)
        test.it("SDK maintenance classification precedes the selectable-principal inverse", function()
            test.is_true(execution.is_maintenance_key("system:test-maintenance"))
            local principal, err = execution.principal_of_key("system:test-maintenance")
            test.is_nil(principal); test.not_nil(err); test.eq(err:kind(), errors.INVALID); test.is_false(err:retryable())
        end)
        test.it("healthy actor metadata returns its checked principal", function()
            fixture.reset("", nil, nil); local result, err = common.actor_principal()
            test.is_nil(err); test.eq(result.kind, "user"); test.eq(result.id, "principal"); test.eq(fixture.meta_reads, 1); test.eq(fixture.key_reads, 0)
        end)
        test.it("healthy actor key returns its principal", function()
            fixture.reset("", nil, nil); local result, err = common.keyed_principal("actor")
            test.is_nil(err); test.eq(result.kind, "user"); test.eq(result.id, "principal"); test.eq(fixture.key_reads, 1)
        end)
        test.it("absent actor retains absent principal without error", function()
            fixture.reset("absent_actor", nil, nil); local result, err = common.actor_principal()
            test.is_nil(result); test.is_nil(err); test.eq(fixture.meta_reads, 0); test.eq(fixture.key_reads, 0)
        end)
        test.it("a key without a principal retains absent principal without error", function()
            fixture.reset("empty_key", nil, nil); local result, err = common.actor_principal()
            test.is_nil(result); test.is_nil(err); test.eq(fixture.key_reads, 1)
        end)
    end)
end)}
