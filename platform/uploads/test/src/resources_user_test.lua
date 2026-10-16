local test = require("test")
local funcs = require("funcs")
local security = require("security")
return { run = test.run_cases(function()
    test.describe("uploads user resource access", function()
        test.it("resolves configured resources with the product user grant", function()
            local actor = assert(security.new_actor("uploads-user", {}))
            local scope = assert(security.new_scope({
                assert(security.policy("app:upload_runtime_resources")),
                assert(security.policy("kickside.uploads.security:uploads_endpoint_access")),
                assert(security.policy("kickside.uploads.security:uploads_resource_access")),
            }))
            local result, err = funcs.new():with_actor(actor):with_scope(scope):call("app:resource_probe", {})
            test.is_nil(err, tostring(err))
            test.eq(result.storage_id, "app:uploads")
            test.is_true(result.database)
            test.is_true(result.storage)
        end)
    end)
end) }
