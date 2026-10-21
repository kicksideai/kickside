local test = require("test")
local funcs = require("funcs")
local registry = require("registry")
local function cases()
    test.describe("native provider OAuth protocols", function()
        test.it("exchanges and refreshes grants over HTTP for Notion, Airtable, and form providers", function()
            local probe = registry.get("app:protocol_e2e_test")
            for _, pair in ipairs({{"client_secret_basic", "json"}, {"client_secret_basic", "form"}, {"client_secret_post", "form"}}) do
                local exec = funcs.new():with_context({oauth_token_endpoint = probe.meta.token_endpoint,
                    oauth_token_auth_method = pair[1], oauth_token_body_encoding = pair[2]})
                local result, err = exec:call("app:protocol_callback", {state = "demo-state", code = "demo-code",
                    stored_data = {redirect_uri = "https://app.example/callback", code_verifier = "demo-verifier"}})
                test.is_nil(err); test.eq(result.success, true); test.eq(result.oauth_connection.access_token, "protocol-access")
                if pair[2] == "form" then
                    local refreshed, refresh_err = exec:call("app:protocol_refresh", {refresh_token = "protocol-refresh"})
                    test.is_nil(refresh_err); test.eq(refreshed.success, true)
                end
            end
        end)
        test.it("uses Linear's comma-separated scopes and S256 PKCE", function()
            local result, err = funcs.new():with_context({oauth_authorization_endpoint = "https://linear.app/oauth/authorize",
                oauth_scope_separator = ",", oauth_use_pkce = true, oauth_pkce_method = "S256"}):call("app:protocol_init", {
                redirect_uri = "https://app.example/callback", scopes = {"read", "write"},
            })
            test.is_nil(err); test.eq(result.success, true)
            test.ok(result.authorization_url:find("scope=read%2Cwrite", 1, true) ~= nil)
            test.ok(result.authorization_url:find("code_challenge_method=S256", 1, true) ~= nil)
            test.not_nil(result.storage_payload.code_verifier)
        end)
    end)
end
return {run = test.run_cases(cases)}
