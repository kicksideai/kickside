local test = require("test")
local base = require("base_connection")
local capacity_http = require("capacity_http")

local function define_tests()
    test.describe("connection base scope", function()
        test.it("fails component_id outside a connection scope with a typed error", function()
            local id, err = base.component_id()
            test.is_nil(id)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.eq(err:message(), "component_id not in scope")
        end)

        test.it("returns missing status and delete scope as typed errors", function()
            for _, operation in ipairs({base.get_status, base.delete}) do
                local result, err = operation({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:message(), "component_id not in scope")
            end
        end)

        test.it("returns unavailable public metadata as a typed failure", function()
            local result, err = base.public_meta("missing-connection")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND) or errors.is(err, errors.PERMISSION_DENIED))
        end)
    end)
    test.describe("connection HTTP error convention", function()
        test.it("preserves the operation error and provider rejection without rewriting either", function()
            local failure = errors.new({kind = errors.UNAVAILABLE, message = "transport failed", details = {host = "example.test"}})
            local owner = {invoke = function(_, operation) return operation() end}
            local http = capacity_http.new({owner = owner})
            local result, err = http.invoke(nil, function() return nil, failure end)
            test.is_nil(result)
            test.eq(err, failure)
            local rejection = {success = false, status_code = 403, error = "provider refused", body = {reason = "scope"}}
            local rejected, reject_err = http.invoke(nil, function() return rejection, nil end)
            test.is_nil(reject_err)
            test.eq(rejected, rejection)
            test.is_nil(rejected.kind)
        end)

        test.it("preserves identity errors before invoking a provider", function()
            local failure = errors.new({kind = errors.INVALID, message = "connection identity is invalid"})
            local request = capacity_http.wrap(function() error("provider must not run") end,
                function() return nil, failure end)
            local result, err = request({})
            test.is_nil(result)
            test.eq(err, failure)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
