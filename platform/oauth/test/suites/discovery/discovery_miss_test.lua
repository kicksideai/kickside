local test = require("test")
local get_provider_info = require("get_provider_info_func")
local get_connector_contract = require("get_connector_contract_func")
local get_component_contract = require("get_component_contract_func")

-- Regression: the discovery handlers translate a registry miss into a
-- {success=false} VALUE returned with nil err. Consumers that only guarded
-- "if err" let an unknown provider through with nil fields. The handlers must
-- expose the miss via success=false (not via err) so a success-checking guard
-- can reject it.
local function define_tests()
    test.describe("OAuth discovery unknown-provider rejection", function()
        local UNKNOWN = "definitely-not-a-registered-oauth-provider"

        test.it("get_provider_info returns success=false for an unknown provider", function()
            local result = get_provider_info.handle({ oauth_provider = UNKNOWN })
            test.not_nil(result, "handler must return a value, never nil")
            test.eq(result.success, false, "unknown provider must surface as success=false")
            test.not_nil(result.error, "failure must carry an error message")
        end)

        test.it("get_connector_contract returns success=false for an unknown provider", function()
            local result = get_connector_contract.handle({ oauth_provider = UNKNOWN })
            test.not_nil(result)
            test.eq(result.success, false)
            test.is_nil(result.implementation_id, "no implementation must leak on a miss")
        end)

        test.it("get_component_contract returns success=false for an unknown provider", function()
            local result = get_component_contract.handle({ oauth_provider = UNKNOWN })
            test.not_nil(result)
            test.eq(result.success, false)
        end)

        test.it("rejects a missing identifier without claiming success", function()
            local result = get_provider_info.handle({})
            test.eq(result.success, false)
        end)
    end)
end

return test.run_cases(define_tests)
