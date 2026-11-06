-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local component = require("component")
local fixture = require("fixture")
local worker = require("worker")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
    errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(actual: error?, source: error)
    if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "system delete guard requires failure"})) end
    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "system_delete_dependency"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native trusted component teardown", function()
        for _, stage in ipairs({"read", "preflight", "cleanup", "unregister", "pending", "purge"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "system teardown refusal", retryable = options.retryable,
                            details = {code = "system_delete_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source)
                        local ok, err
                        if stage == "read" or stage == "preflight" then
                            ok, err = component.system_delete("component", "reparent_root")
                            test.is_false(ok)
                        else
                            ok, err = worker.run({payload = {component_id = "component"}})
                            test.is_nil(ok)
                        end
                        native(err, source)
                        test.eq(fixture.cleanups, (stage == "read" or stage == "preflight") and 0 or 1)
                        test.eq(fixture.unregisters, (stage == "read" or stage == "preflight" or stage == "cleanup") and 0 or 1)
                    end)
                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("failed replay keeps the mark/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup replay refused",
                        details = {code = "system_delete_dependency", nested = {marker = "kept"}}})
                    fixture.reset("cleanup_replay", source)
                    local result, err = worker.run({payload = {component_id = "component"}})
                    test.is_nil(result); native(err, source)
                    test.eq(fixture.abandons, 0); test.eq(fixture.unregisters, 0)
                end)
            end
        end
        for _, stage in ipairs({"cleanup", "pending"}) do
            for _, kind in ipairs(kinds) do
                for _, exclusion in ipairs({"none", "wait_for", "blocked_operation"}) do
                    test.it("classifies structured page progress/" .. stage .. "/" .. kind .. "/" .. exclusion, function()
                        local details: any = {cleanup_pending = true, needs_continue = true, discarded = true}
                        if exclusion ~= "none" then details[exclusion] = "dependency" end
                        local source = errors.new({kind = kind, message = "bounded cleanup page", details = details})
                        fixture.reset(stage, source)
                        local result, err = worker.run({payload = {component_id = "component"}})
                        if exclusion == "none" then
                            test.is_nil(err, tostring(err)); test.is_true(result.success)
                            test.is_false(result.deleted); test.eq(type(result.rearm), "string")
                            test.is_true(result.discarded)
                        else
                            test.is_nil(result); test.eq(err:kind(), kind)
                            test.eq(err:details()[exclusion], "dependency")
                        end
                        test.eq(fixture.cleanups, 1)
                        test.eq(fixture.unregisters, stage == "pending" and 1 or 0)
                    end)
                end
            end
        end
        for _, wait_for in ipairs({false, "children"}) do
            test.it("returns a committed notification error through rearm/" .. tostring(wait_for), function()
                fixture.reset("pending", errors.new({kind = errors.CONFLICT, message = "bounded progress", details = {
                    cleanup_pending = true, needs_continue = true, wait_for = wait_for or nil,
                    notification_error = {kind = errors.UNAVAILABLE, retryable = false, details = {code = "delivery"}},
                }}))
                local result, err = worker.run({payload = {component_id = "component"}})
                test.is_nil(err); test.eq(type(result.rearm), "string")
                test.not_nil(result.notification_error); test.eq(result.notification_error.details.code, "delivery")
                test.is_false(result.notification_error.retryable)
            end)
        end
        test.it("preserves delivery diagnostics when remaining cleanup fails", function()
            local source = errors.new({kind = errors.UNAVAILABLE, message = "thread purge refuses", retryable = true})
            fixture.reset("purge", source)
            fixture.notification_error = {kind = errors.UNAVAILABLE, retryable = false, details = {code = "delivery"}}
            local result, err = worker.run({payload = {component_id = "component"}})
            test.is_nil(result); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
            test.not_nil(err:details()); test.not_nil(err:details().notification_error)
            test.eq(err:details().notification_error.details.code, "delivery")
        end)
        test.it("concurrent final removal remains an idempotent system delete", function()
            fixture.reset("removed_during_acceptance", errors.new({kind = errors.NOT_FOUND, message = "component is absent"}))
            local ok, err = component.system_delete("component", "reparent_root")
            test.is_true(ok); test.is_nil(err)
            test.eq(fixture.begins, 1); test.eq(fixture.cleanups, 0)
        end)
        test.it("absent component remains an idempotent no-op", function()
            fixture.reset("", nil); fixture.absent = true; local ok, err = component.system_delete("component", "reparent_root")
            test.is_true(ok); test.is_nil(err); test.eq(fixture.begins, 0); test.eq(fixture.cleanups, 0); test.eq(fixture.unregisters, 0)
        end)
        test.it("healthy cleanup unregisters once under the trusted gate", function()
            fixture.reset("", nil); local ok, err = component.system_delete("component", "reparent_root")
            test.is_false(ok); test.is_true(err:details().cleanup_pending)
            test.eq(err:details().wait_for, "deletion_job")
            test.eq(fixture.cleanups, 0); test.eq(fixture.unregisters, 0)
            local finished, finish_err = worker.run({payload = {component_id = "component"}})
            test.is_nil(finish_err); test.is_true(finished.deleted)
            test.eq(fixture.cleanups, 1); test.eq(fixture.unregisters, 1)
            test.is_nil(fixture.user); test.eq(fixture.policy, "reparent_root")
        end)
    end)
end)}
