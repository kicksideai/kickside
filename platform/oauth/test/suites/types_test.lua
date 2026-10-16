local test = require("test")
local oauth_types = require("oauth_types")

local function define_tests()
    test.describe("OAuth public type helpers", function()
        test.it("allowlists public profile fields", function()
            local profile = oauth_types.public_user_profile({
                provider_user_id = "provider-123",
                email = "alice@example.com",
                display_name = "Alice",
                username = "alice",
                avatar_url = "https://example.test/avatar.png",
                access_token = "secret",
                provider_data = { refresh_token = "secret" },
                name = "Raw Provider Name",
            })

            test.eq(profile.provider_user_id, "provider-123")
            test.eq(profile.email, "alice@example.com")
            test.eq(profile.display_name, "Alice")
            test.eq(profile.username, "alice")
            test.eq(profile.avatar_url, "https://example.test/avatar.png")
            test.is_nil((profile :: any).access_token)
            test.is_nil((profile :: any).provider_data)
            test.is_nil((profile :: any).name)
        end)

        test.it("builds public connection info without secret envelopes", function()
            local info = oauth_types.public_info_from_metadata({
                component_id = "fixture-connection-identity",
                provider = "google",
                connection_name = "Google Work",
                connection_description = "Workspace",
                scopes_granted = "email profile",
                connection_state = "connected",
                created_at = "1",
                updated_at = "2",
                last_token_refresh = "3",
                tokens = { access_token = "secret" },
                client_credentials = { secret = "secret" },
                provider_specific = { raw = "secret" },
            }, {
                email = "alice@example.com",
                provider_data = { refresh_token = "secret" },
            }, 100)

            test.eq((info :: any).component_id, "fixture-connection-identity")
            test.eq(info.provider, "google")
            test.eq(info.connection_name, "Google Work")
            test.eq(info.user_profile.email, "alice@example.com")
            test.is_nil((info :: any).tokens)
            test.is_nil((info :: any).client_credentials)
            test.is_nil((info :: any).provider_specific)
            test.is_nil((info.user_profile :: any).provider_data)
        end)

        test.it("builds public connection info with current expiry state", function()
            local info = oauth_types.public_info_from_metadata({
                provider = "google",
                connection_name = "Google Work",
                scopes_granted = "email profile",
                connection_state = "connected",
                expires_at = 100,
                refresh_expires_at = 200,
            }, nil, 101)

            test.is_nil((info :: any).component_id)
            test.eq(info.connection_state, "expired")
            test.eq(info.expires_at, 100)
            test.eq(info.refresh_expires_at, 200)
        end)

        test.it("normalizes public connection state from token expiry", function()
            test.eq(oauth_types.public_connection_state({
                connection_state = "connected",
                expires_at = 100,
            }, 101), "expired")

            test.eq(oauth_types.public_connection_state({
                connection_state = "connected",
                expires_at = 200,
            }, 101), "connected")

            test.eq(oauth_types.public_connection_state({
                connection_state = "needs_reauth",
            }, 101), "needs_reauth")
        end)

        test.it("builds management details from metadata only", function()
            local details = oauth_types.public_details_from_metadata({
                component_id = "component-1",
                provider = "google",
                connection_name = "Google Work",
                scopes_granted = "email profile",
                connection_state = "connected",
                tokens = { access_token = "secret" },
                user_profile = { email = "alice@example.com" },
                oauth_flow = { code_verifier = "secret" },
            }, {
                title = "Google",
                icon = "google",
                description = "Google OAuth",
                client_secret = "secret",
            }, 100)

            test.eq(details.component_id, "component-1")
            test.eq(details.provider_title, "Google")
            test.eq(details.scopes_granted, "email profile")
            test.eq(details.user_email, "")
            test.eq(details.user_profile.email, "")
            test.is_nil((details :: any).tokens)
            test.is_nil((details :: any).oauth_flow)
            test.is_nil((details :: any).client_secret)
        end)

        test.it("builds management details with current expiry state", function()
            local details = oauth_types.public_details_from_metadata({
                component_id = "component-1",
                provider = "google",
                connection_name = "Google Work",
                connection_state = "connected",
                expires_at = 100,
            }, {
                title = "Google",
            }, 101)

            test.eq(details.connection_state, "expired")
            test.eq(details.expires_at, 100)
        end)

        test.it("allowlists provider display metadata", function()
            local provider = oauth_types.public_provider_info({
                id = "google",
                name = "google",
                title = "Google",
                description = "Google OAuth",
                icon = "google",
                oauth_provider = "google",
                available_scopes = { "email" },
                default_scopes = { "email" },
                client_secret = "secret",
            })

            test.eq(provider.id, "google")
            test.eq(provider.available_scopes[1], "email")
            test.is_nil((provider :: any).client_secret)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
