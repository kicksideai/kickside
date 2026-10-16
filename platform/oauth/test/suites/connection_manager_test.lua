local test = require("test")
local connection_manager = require("connection_manager")

local function define_tests()
    test.describe("OAuth connection manager", function()
        test.it("builds canonical public component meta for OAuth connections", function()
            local meta = connection_manager.public_meta("github", "GitHub", "Code host", {
                connection_state = "connected",
                scopes_granted = "repo user",
                expires_at = 123,
                refresh_expires_at = 456,
            })

            test.eq(meta.class, "connection")
            test.eq(meta.oauth_connection, true)
            test.eq(meta.provider, "github")
            test.eq(meta.title, "GitHub")
            test.is_nil(meta.status)
            test.eq(meta.connection_state, "connected")
            test.eq(meta.reauth_reason, "", "authorization clears the previous reconnect reason")
            test.eq(meta.scopes_granted, "repo user")
            test.eq(meta.expires_at, "123")
            test.eq(meta.refresh_expires_at, "456")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
