local test = require("test")
local eligibility = require("credential_eligibility")
return {run = test.run_cases(function()
    test.describe("credential eligibility orchestration", function()
        for _, host in ipairs({false, true}) do
            for _, local_guard in ipairs({false, true}) do
                test.it("runs every bound guard: " .. tostring(host) .. "/" .. tostring(local_guard), function()
                    local calls = {}
                    local guard = eligibility.new({registry = {
                        get = function(id) test.eq(id, "app:credential_config"); return {meta = {credential_eligibility = local_guard and "app:local_guard" or ""}}, nil end,
                        find = function() return host and {{meta = {credential_eligibility = "app:host_guard"}}} or {}, nil end,
                    }, funcs = {call = function(id, args)
                        test.eq(args.identifier, "subject"); calls[#calls + 1] = id; return true, nil
                    end}})
                    local accepted, err, bound = guard.check("app:credential_config", "subject")
                    test.is_nil(err); test.is_true(accepted); test.eq(bound, host or local_guard)
                    test.eq(#calls, (host and 1 or 0) + (local_guard and 1 or 0))
                    if host then test.eq(calls[1], "kickside.contract:host_credential_eligibility") end
                    if local_guard then test.eq(calls[#calls], "app:local_guard") end
                end)
            end
        end
        for _, boundary in ipairs({"config", "discovery", "host", "local"}) do
            test.it("preserves the native cause at " .. boundary, function()
                local cause = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = boundary})
                local guard = eligibility.new({registry = {
                    get = function() if boundary == "config" then return nil, cause end; return {meta = {credential_eligibility = "app:local_guard"}}, nil end,
                    find = function() if boundary == "discovery" then return nil, cause end; return {{meta = {credential_eligibility = "app:host_guard"}}}, nil end,
                }, funcs = {call = function(id)
                    if (boundary == "host" and id == "kickside.contract:host_credential_eligibility")
                        or (boundary == "local" and id == "app:local_guard") then return nil, cause end
                    return true, nil
                end}})
                local accepted, err = guard.check("app:credential_config", "subject")
                test.is_nil(accepted); test.eq(err, cause)
            end)
        end
        for _, result in ipairs({false, "true", {}}) do
            test.it("rejects a non-true guard result " .. type(result), function()
                local calls = 0
                local guard = eligibility.new({registry = {
                    get = function() return {meta = {credential_eligibility = "app:local_guard"}}, nil end,
                    find = function() return {{meta = {credential_eligibility = "app:host_guard"}}}, nil end,
                }, funcs = {call = function() calls = calls + 1; return result, nil end}})
                local accepted, err = guard.check("app:credential_config", "subject")
                test.is_nil(accepted); test.is_true(errors.is(err, errors.INTERNAL)); test.eq(calls, 1)
            end)
        end
    end)
end)}
