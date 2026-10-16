local test = require("test")
local contract = require("contract")
local security = require("security")
local dispatch_service = require("dispatch_service")

local function dispatch(): any
    local def, err = contract.get("kickside.contract:realtime_batch")
    test.is_nil(err, tostring(err))
    local owner, open_err = def:open()
    test.is_nil(open_err, tostring(open_err))
    return owner
end

local run = test.run_cases(function()
    test.describe("Bounded realtime owner dispatch", function()
        test.it("reports not_supported when the selected scalar capability is unbound", function()
            for _, boundary in ipairs({"get", "open"}) do
                for _, absent in ipairs({"missing", "not_found"}) do
                    local missing = absent == "not_found" and errors.new({kind = errors.NOT_FOUND,
                        retryable = false, message = "no owner", details = {code = "test_owner_absent"}}) or nil
                    local service = dispatch_service.new({contract = {get = function()
                        if boundary == "get" then return nil, missing end
                        return {open = function() return nil, missing end}, nil
                    end}, policy = {can_notify = function() return true end}})
                    local result, err = service.notify({user_ids = {"reader"}, topic = "component.changed"})
                    test.is_nil(err, tostring(err))
                    test.eq(result.status, "not_supported")
                    test.eq(result.notified, 0)
                end
            end
        end)
        test.it("propagates infrastructure errors while opening a bound scalar owner", function()
            for _, boundary in ipairs({"get", "open"}) do
                local native = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                    message = "owner fails", details = {code = "test_scalar_unavailable"}})
                local service = dispatch_service.new({contract = {get = function()
                    if boundary == "get" then return nil, native end
                    return {open = function() return nil, native end}, nil
                end}, policy = {can_notify = function() return true end}})
                local result, err = service.notify({user_ids = {"reader"}, topic = "component.changed"})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(err:retryable(), true)
                test.eq(err:details().code, "test_scalar_unavailable")
            end
        end)
        test.it("delivers a batch through an existing scalar-only binding", function()
            local users: {string} = {}
            for i = 1, 128 do users[i] = "user-" .. tostring(i) end
            local result, err = dispatch():notify({user_ids = users, topic = "component.changed"})
            test.is_nil(err, tostring(err))
            test.eq(result.success, true)
            test.eq(result.notified, 128)
        end)
        test.it("retains native failure metadata from a scalar binding", function()
            local result, err = dispatch():notify({user_ids = {"user"}, topic = "component.changed", data = {fail = true}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "scalar_owner_failed")
            test.eq(err:details().marker, 73)
        end)
        test.it("deduplicates recipients and rejects an oversized audience", function()
            local result, err = dispatch():notify({user_ids = {"user", "user"}, topic = "component.changed"})
            test.is_nil(err)
            test.eq(result.notified, 1)
            local users: {string} = {}
            for i = 1, 129 do users[i] = "user-" .. tostring(i) end
            local oversized, size_err = dispatch():notify({user_ids = users, topic = "component.changed"})
            test.is_nil(oversized)
            test.is_true(errors.is(size_err, errors.INVALID))
        end)
    end)
end)
return {run = function(o) return run(o) end}
