-- HTTP policy regression coverage for DELETE /api/v1/automations/{id}. The
-- handler delegates to response_for after request parsing, so this drives the
-- exact authenticated status/envelope path without a live server dependency.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local delete_automation = require("delete_automation")

local COMPONENT_PROBE = "app:delete_automation_component_probe"

local function actor(): any
    return { id = function(): string return "delete-tester" end }
end

local function component(access_err: any?): any
    return {
        ACCESS = { READ = 1, DELETE = 4 },
        query = function(): (any, any?) return {}, nil end,
        validate_access = function(_id: string, _mask: number): (any?, any)
            if access_err then return nil, access_err end
            return { success = true }, nil
        end,
    }
end

local function real_component_delete(component_id: string): (any?, any)
    local actor = security.new_actor("delete-miss-" .. uuid.v4(), {
        security_groups = { "automation_test" },
    })
    local scope, scope_err = security.named_scope("wippy.security:process")
    if scope_err or not scope then return nil, scope_err or "process scope unavailable" end
    return funcs.new():with_actor(actor):with_scope(scope):call(COMPONENT_PROBE, {
        component_id = component_id,
    })
end

local function define_tests()
    test.describe("DELETE /automations/{id}", function()
        test.it("returns typed retryable cleanup details to HTTP clients", function()
            local pending = errors.new({ message = "cleanup pending", kind = errors.CONFLICT,
                retryable = true, details = { cleanup_pending = true,
                    discarded = { ledger_unresolved = 100 } } })
            local status, body = delete_automation.response_for(actor(), "installed-1", nil, {
                component = component(),
                automations_lib = { delete_automation = function(): (any?, any?) return nil, pending end },
            })
            test.eq(status, 409)
            test.eq(body.error.code, "conflict")
            test.is_true(body.error.retryable)
            test.is_true(body.error.details.cleanup_pending)
            test.eq(body.error.details.discarded.ledger_unresolved, 100)
        end)

        test.it("requires an authenticated actor", function()
            local status, body = delete_automation.response_for(nil, "binding-exact", nil, {
                component = component(),
                automations_lib = {},
            })
            test.eq(status, 401)
            test.is_false(body.success)
            test.eq(body.error.code, "authentication_required")
            test.eq(body.error.message, "authentication required")
        end)

        test.it("returns 200 after routing a binding to standard binding teardown", function()
            local called: any = nil
            local status, body = delete_automation.response_for(actor(), "binding-exact", nil, {
                component = component(),
                automations_lib = {
                    delete_automation = function(id: string, options: any): (any?, any)
                        called = { id = id, options = options }
                        return { success = true, id = id }, nil
                    end,
                },
            })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.id, "binding-exact")
            test.eq(called.id, "binding-exact")
        end)

        test.it("preserves the installable component teardown result envelope", function()
            local status, body = delete_automation.response_for(actor(), "installed-1", { keep_thread = true }, {
                component = component(),
                automations_lib = {
                    delete_automation = function(_id: string, options: any): (any?, any)
                        test.is_true(options.keep_thread)
                        return { id = "installed-1", replayed = 3, replay_failed = 0,
                            discarded = { ledger_unresolved = 205 },
                            status = "in_progress", in_progress = true, deleted = false,
                            cleanup_pending = true, retryable = true, kind = errors.CONFLICT,
                            details = { cleanup_pending = true } }, nil
                    end,
                },
            })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.id, "installed-1")
            test.eq(body.replayed, 3)
            test.eq(body.replay_failed, 0)
            test.eq(body.discarded.ledger_unresolved, 205)
            test.eq(body.status, "in_progress")
            test.is_true(body.in_progress)
            test.is_false(body.deleted)
            test.is_true(body.cleanup_pending)
            test.is_true(body.retryable)
            test.eq(body.kind, errors.CONFLICT)
            test.is_true(body.details.cleanup_pending)
        end)

        test.it("returns canonical permission denial for a visible component without DELETE", function()
            local denied = errors.new({ message = "delete access required", kind = errors.PERMISSION_DENIED })
            local c = component(denied)
            c.ACCESS.READ = 1
            c.query = function(): (any, any?) return { { component_id = "visible" } }, nil end
            local status, body = delete_automation.response_for(actor(), "visible", nil, {
                component = c, automations_lib = {},
            })
            test.eq(status, 403)
            test.eq(body.error.code, "access_denied")
        end)

        test.it("uses the real component missing-access error for the neutral 404", function()
            local result, err = real_component_delete("missing-binding-" .. uuid.v4())
            test.is_nil(err, "real component probe failed: " .. tostring(err))
            test.not_nil(result)

            -- component.validate_access returns the runtime's opaque
            -- PermissionDenied userdata for a missing component, not NOT_FOUND.
            test.eq(result.error_type, "userdata")
            test.eq(result.kind_type, "string")
            test.eq(result.kind, "PermissionDenied")
            test.is_false(result.is_not_found)
            test.eq(result.status, 404)
            test.is_false(result.body.success)
            test.eq(result.body.error.code, "not_found")
            test.eq(result.body.error.message, "automation not found or access denied")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
