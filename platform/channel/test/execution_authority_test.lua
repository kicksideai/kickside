local test = require("test")
local restrictions = require("identity_restrictions")
local identity = require("execution_identity")

local function load(authority)
    local reader = {
        new = function()
            return { call = function(_, fn, args)
                test.eq(fn, "kickside.mcp:credential_restriction")
                return { credential_id = args.credential_id, actor_id = "user", status = "active",
                    whitelist_component_ids = {}, authority = authority }, nil
            end }, nil
        end,
    }
    return restrictions.load({ principal = { kind = identity.KIND.USER, id = "user" },
        credential_id = "credential" }, reader)
end

local function define_tests()
    test.describe("channel execution authority", function()
        test.it("loads the canonical authority dependency for both identity libraries", function()
            local authority = { policy_ids = { "app:user" }, groups = { "team" }, epochs = { team = 2 } }
            local value, err = load(authority)
            test.is_nil(err)
            test.eq(value.authority.epochs.team, 2)
            test.eq(value.authority.policy_ids[1], "app:user")
        end)
        test.it("preserves authority validation refusals", function()
            local value, err = load({ policy_ids = {}, groups = "invalid" })
            test.is_nil(value)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(err:retryable(), false)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
