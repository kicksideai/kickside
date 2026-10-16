local test = require("test")
local composition = require("composition")

local function entry(includes, service_only, kind)
    return {kind = kind or "security.policy", meta = {includes = includes, service_only = service_only}}
end

local function define_tests()
    test.describe("native policy composition failures", function()
        test.it("preserves every native dependency kind and nested details", function()
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, retry in ipairs({"absent", "false", "true"}) do
                    local retryable = nil
                    if retry ~= "absent" then retryable = retry == "true" end
                    local cause = errors.new({kind = kind, message = "policy read failure", retryable = retryable,
                        details = {code = "policy_read", nested = {marker = "kept"}}})
                    local result, err = composition.expand({"parent"}, function(id)
                        if id == "parent" then return entry({"child"}), nil end
                        return nil, cause
                    end)
                    test.is_nil(result)
                    test.is_true(errors.is(err, kind))
                    test.eq(err:retryable(), retryable)
                    test.eq(err:details().code, "policy_read")
                    test.eq(err:details().nested.marker, "kept")
                end
            end
        end)
        test.it("omits unavailable composition roots while retaining read and transitive failures", function()
            local result, err = composition.expand_available({"removed", "present"}, function(id)
                if id == "present" then return entry(), nil end
                return nil, errors.new({kind = errors.NOT_FOUND, message = "policy missing", retryable = false})
            end)
            test.is_nil(err)
            test.eq(#result, 1)
            test.eq(result[1], "present")

            local unavailable = errors.new({kind = errors.UNAVAILABLE, message = "policy read failure", retryable = true,
                details = {code = "policy_read"}})
            result, err = composition.expand_available({"present"}, function(id)
                if id == "present" then return entry({"child"}), nil end
                return nil, unavailable
            end)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:retryable(), true)
            test.eq(err:details().code, "policy_read")

            result, err = composition.expand_available({"present"}, function(id)
                if id == "present" then return entry({"child"}), nil end
                return nil, nil
            end)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.eq(err:details().code, "policy_not_found")
        end)
        local cases = {
            {name = "cycle", code = "policy_composition_cycle", kind = errors.INVALID,
                entries = {parent = entry({"child"}), child = entry({"parent"})}},
            {name = "missing policy", code = "policy_not_found", kind = errors.NOT_FOUND, entries = {}},
            {name = "wrong registry kind", code = "policy_kind_invalid", kind = errors.INVALID,
                entries = {parent = entry(nil, false, "registry.entry")}},
            {name = "service-only policy", code = "policy_service_only", kind = errors.PERMISSION_DENIED,
                entries = {parent = entry({"child"}), child = entry(nil, true)}},
            {name = "invalid include container", code = "policy_includes_invalid", kind = errors.INVALID,
                entries = {parent = entry("child")}},
            {name = "invalid included id", code = "policy_include_invalid", kind = errors.INVALID,
                entries = {parent = entry({false})}},
        }
        for _, case in ipairs(cases) do
            test.it("returns a native error for " .. case.name, function()
                local result, err = composition.expand({"parent"}, function(id) return case.entries[id], nil end)
                test.is_nil(result)
                test.is_true(errors.is(err, case.kind))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, case.code)
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
