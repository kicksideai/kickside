-- The connect URL an external agent is handed. Every surface that prints it —
-- the credentials API, the OAuth resource metadata — reads this one library, so
-- the configured domain and the request-host fallback are pinned here once.

local test = require("test")
local public_url = require("mcp_public_url")

local function with_env(value: any, request: any, body: (() -> ()))
    local env_before, http_before = public_url._env, public_url._http
    public_url._env = { get = function(_: string): (any, any) return value, nil end }
    public_url._http = { request = function(): any return request end }
    local ok, err = pcall(body)
    public_url._env, public_url._http = env_before, http_before
    if not ok then error(err) end
end

local function fake_request(host: any, proto: any): any
    return {
        host = function(_: any): any return host end,
        header = function(_: any, name: string): any
            if name == "X-Forwarded-Proto" then return proto end
            return nil
        end,
    }
end

local function define_tests()
    test.describe("MCP public URL", function()
        test.it("fails closed when public configuration cannot be read", function()
            local before = public_url._env
            public_url._env = { get = function(): (any, any)
                return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "public authority denied" })
            end }
            local ok, err = pcall(public_url.base_url)
            public_url._env = before
            test.is_false(ok)
            test.contains(tostring(err), "public authority denied")
        end)
        test.it("compares resource authorities without changing path identity", function()
            test.is_true(public_url.same_resource("HTTPS://MCP.EXAMPLE:443/api/public/mcp", "https://mcp.example/api/public/mcp"))
            test.is_false(public_url.same_resource("https://mcp.example/api/public/other", "https://mcp.example/api/public/mcp"))
            test.is_false(public_url.same_resource("https://mcp.example/api/public/mcp#fragment", "https://mcp.example/api/public/mcp"))
        end)
        test.it("checks browser origins against configuration instead of a supplied Host", function()
            with_env("https://kickside.example.com", fake_request("evil.example", "https"), function()
                test.is_true(public_url.origin_allowed(nil))
                test.is_true(public_url.origin_allowed("https://kickside.example.com"))
                test.is_true(public_url.origin_allowed("https://kickside.example.com:443"))
                test.is_false(public_url.origin_allowed("https://evil.example"))
                test.is_false(public_url.origin_allowed("null"))
                test.is_false(public_url.origin_allowed("https://kickside.example.com.evil.example"))
            end)
            with_env("", fake_request("evil.example", "https"), function()
                test.is_true(public_url.origin_allowed(nil))
                test.is_false(public_url.origin_allowed("https://evil.example"))
            end)
            with_env("", fake_request("localhost:18160", nil), function()
                test.is_true(public_url.origin_allowed("http://localhost:18160"))
                test.is_false(public_url.origin_allowed("http://localhost:18161"))
            end)
        end)
        test.it("prefers the configured public domain over the request host", function()
            with_env("https://kickside.example.com", fake_request("internal.local", "http"), function()
                test.eq(public_url.base_url(), "https://kickside.example.com")
                test.eq(public_url.mcp_url(), "https://kickside.example.com/api/public/mcp")
                test.eq(public_url.resource_metadata_url(), "https://kickside.example.com/.well-known/oauth-protected-resource/api/public/mcp")
            end)
        end)

        test.it("drops a trailing slash so the endpoint never doubles it", function()
            with_env("https://kickside.example.com/", nil, function()
                test.eq(public_url.mcp_url(), "https://kickside.example.com/api/public/mcp")
            end)
        end)

        -- Without configuration the request already names the host, and behind a
        -- TLS-terminating proxy only the forwarded scheme knows it was https.
        test.it("falls back to the request host, honoring the forwarded scheme", function()
            with_env("", fake_request("mcp.example.test", "https"), function()
                test.eq(public_url.mcp_url(), "https://mcp.example.test/api/public/mcp")
                test.eq(public_url.resource_metadata_url(), "https://mcp.example.test/.well-known/oauth-protected-resource/api/public/mcp")
            end)
            with_env(nil, fake_request("localhost:18160", nil), function()
                test.eq(public_url.mcp_url(), "http://localhost:18160/api/public/mcp")
            end)
        end)

        -- With neither source the caller gets a relative path it can resolve
        -- itself, never a URL with a bogus host glued to the front.
        test.it("returns a relative endpoint rather than inventing a host", function()
            with_env("", nil, function()
                test.eq(public_url.base_url(), "")
                test.eq(public_url.mcp_url(), "/api/public/mcp")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
