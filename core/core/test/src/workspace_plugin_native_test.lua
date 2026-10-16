local test = require("test")
local plugin = require("plugin")
local dependencies = require("dependencies")

return {run = test.run_cases(function()
    test.describe("native workspace provisioning", function()
        test.after_each(function() dependencies.state = {} end)

        test.it("retains all native provisioning metadata in helpers and process results", function()
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    local source = errors.new({kind = kind, message = "provisioning failed",
                        retryable = policy.retryable, details = {code = "provision_failure",
                            nested = {marker = "kept"}}})
                    dependencies.state = {actor = {id = function() return "owner" end},
                        scope = {}, failure = source}
                    local ids, err = plugin.provision_user("owner")
                    test.is_nil(ids)
                    test.not_nil(err)
                    local outcome = plugin.run({user_id = "owner"})
                    test.eq(outcome.ok, false)
                    test.not_nil(outcome.error)
                    for _, failure in ipairs({err, outcome.error}) do
                        test.is_true(errors.is(failure, kind))
                        test.eq(failure:retryable(), policy.retryable)
                        test.eq(failure:details().code, "provision_failure")
                        test.eq(failure:details().nested.marker, "kept")
                        test.eq(failure:message(), source:message())
                    end
                end
            end
        end)

        test.it("refuses missing actor and scope with stable native codes", function()
            for _, case in ipairs({
                {code = "workspace_actor_required"},
                {actor = {id = function() return "" end}, code = "workspace_actor_required"},
                {actor = {id = function() return "owner" end}, code = "workspace_scope_required"},
            }) do
                dependencies.state = case
                local ids, err = plugin.provision_user("owner")
                test.is_nil(ids)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, case.code)
            end
        end)
    end)
end)}
