local test = require("test")
local engine = require("automation_test_engine")
local errors = require("errors")

return test.run_cases(function()
    test.describe("automation uninstall error transport", function()
        local function fixture(stage: string, payload: any, failure: any): (any, any)
            local calls = { access = 0, service = 0, delete = 0 }
            local service = { delete = function(): (any?, any?)
                calls.delete = calls.delete + 1
                if stage == "delete" then return payload, failure end
                return { success = true }, nil
            end }
            local component = {
                ACCESS = { ADMIN = 8, DELETE = 4 },
                get_private_context = function(): (any?, any?)
                    if stage == "read" then return payload, failure end
                    return { _rollback = {} }, nil
                end,
                validate_access = function(): (any?, any?)
                    calls.access = calls.access + 1
                    return true, nil
                end,
                get_service = function(): (any?, any?)
                    calls.service = calls.service + 1
                    if stage == "service" then return payload, failure end
                    if stage == "service_error_with_value" then return service, failure end
                    return service, nil
                end,
            }
            return engine.new({ component = component }), calls
        end
        for _, stage in ipairs({ "read", "service", "delete" }) do
            for _, kind in ipairs({ errors.INVALID, errors.PERMISSION_DENIED, errors.NOT_FOUND,
                errors.CONFLICT, errors.ALREADY_EXISTS, errors.UNAVAILABLE, errors.RATE_LIMITED,
                errors.TIMEOUT, errors.CANCELED, errors.INTERNAL, errors.UNKNOWN }) do
                test.it("preserves typed " .. kind .. " at uninstall " .. stage, function()
                    local failure = errors.new({ kind = kind, message = "opaque owner failure",
                        retryable = true, details = { marker = "owner" } })
                    local payload: any = nil
                    if stage == "read" then payload = {} end
                    if stage == "delete" then payload = { success = true } end
                    local lib, calls = fixture(stage, payload, failure)
                    local result, err = lib.uninstall("automation-test")
                    test.is_nil(result)
                    test.eq(err, failure)
                    test.eq((err :: any):kind(), kind)
                    test.is_true((err :: any):retryable())
                    test.eq((err :: any):details().marker, "owner")
                    test.eq(calls.access, stage == "read" and 0 or 2)
                    test.eq(calls.service, stage == "read" and 0 or 1)
                    test.eq(calls.delete, stage == "delete" and 1 or 0)
                end)
            end
        end
        test.it("classifies an authoritative absent private context as NOT_FOUND", function()
            local lib, calls = fixture("read", nil, nil)
            local result, err = lib.uninstall("automation-test")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
            test.is_false((err :: any):retryable())
            test.eq(calls.access, 0)
            test.eq(calls.delete, 0)
        end)
        for _, value in ipairs({ false, "invalid context", 17 }) do
            test.it("refuses malformed private context " .. tostring(value), function()
                local lib, calls = fixture("read", value, nil)
                local result, err = lib.uninstall("automation-test")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                test.eq(calls.access, 0)
                test.eq(calls.delete, 0)
            end)
        end
        test.it("retains a service error even when a service value is present", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "opaque service failure", retryable = true })
            local lib, calls = fixture("service_error_with_value", nil, failure)
            local result, err = lib.uninstall("automation-test")
            test.is_nil(result)
            test.eq(err, failure)
            test.eq(calls.delete, 0)
        end)
        test.it("refuses a missing service without a successful uninstall", function()
            local lib, calls = fixture("service", nil, nil)
            local result, err = lib.uninstall("automation-test")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
            test.eq(calls.delete, 0)
        end)
        for _, value in ipairs({ true, "invalid deletion", { success = "true" } }) do
            test.it("refuses malformed deletion result " .. tostring(value), function()
                local lib, calls = fixture("delete", value, nil)
                local result, err = lib.uninstall("automation-test")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                test.eq(calls.delete, 1)
            end)
        end

        test.it("preserves a component cleanup kind, retryability, and discard details", function()
            local component = {
                ACCESS = { DELETE = 4 },
                get_private_context = function(): (any?, any?) return { _rollback = {} }, nil end,
                validate_access = function(): (any?, any?) return true, nil end,
                get_service = function(): (any?, any?)
                    return { delete = function(): (any?, any?)
                        return { success = false, error = "another owner page", kind = errors.CONFLICT,
                            retryable = true, cleanup_pending = true,
                            discarded = { ledger_unresolved = 100 },
                            details = { cleanup_pending = true,
                                discarded = { ledger_unresolved = 100 } } }, nil
                    end }, nil
                end,
            }
            local lib = engine.new({ component = component })
            local result, err = lib.uninstall("automation-test")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
            test.is_true((err :: any):retryable())
            test.is_true((err :: any):details().cleanup_pending)
            test.eq((err :: any):details().discarded.ledger_unresolved, 100)
        end)
    end)
end)
