local test = require("test")
local registry = require("registry")
local function entry(id: string): any
    local value, err = registry.get(id)
    test.is_nil(err)
    return test.not_nil(value)
end
local function cases()
    test.describe("application OAuth host bindings", function()
        test.it("keeps management endpoints authenticated and callbacks public", function()
            for _, id in ipairs({"discover_providers", "get_connection_details", "get_provider_info", "init_connection", "update_connection"}) do
                test.eq(entry("kickside.oauth.api:" .. id .. ".endpoint").meta.router, "app:endpoint_policy_router")
            end
            for _, id in ipairs({"oauth_callback", "oauth_callback_page"}) do
                test.eq(entry("kickside.oauth.api.public:" .. id .. ".endpoint").meta.router, "app:endpoint_policy_public_router")
            end
            test.eq(entry("kickside.mcp_client.oauth.api:client_metadata.endpoint").meta.router, "app:endpoint_policy_public_router")
        end)
        test.it("uses the harness database and process host for OAuth", function()
            test.eq(entry("kickside.oauth:db_config").meta.db_id, "app:db")
            test.eq(entry("kickside.oauth:process_config").meta.host_id, "app.security:processes")
        end)
    end)
end
return {run = test.run_cases(cases)}
