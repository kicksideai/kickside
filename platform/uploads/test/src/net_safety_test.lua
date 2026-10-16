-- Tests the shared SSRF URL guard and prompt-content cap used by the uploads and
-- knowledge fetch_url tools.

local test = require("test")
local net_safety = require("net_safety")

local function define_tests()
    test.describe("uploads net_safety", function()
        test.describe("is_safe_public_url", function()
            test.it("allows a plain public http(s) url", function()
                local ok = net_safety.is_safe_public_url("https://example.com/page")
                test.is_true(ok)
                local ok2 = net_safety.is_safe_public_url("http://docs.example.org/a?b=1")
                test.is_true(ok2)
            end)

            test.it("rejects loopback hosts", function()
                test.is_false((net_safety.is_safe_public_url("http://localhost/x")))
                test.is_false((net_safety.is_safe_public_url("http://127.0.0.1/x")))
                test.is_false((net_safety.is_safe_public_url("http://0.0.0.0/x")))
            end)

            test.it("rejects RFC1918 private ranges", function()
                test.is_false((net_safety.is_safe_public_url("http://10.0.0.5/x")))
                test.is_false((net_safety.is_safe_public_url("http://192.168.1.1/x")))
                test.is_false((net_safety.is_safe_public_url("http://172.16.0.1/x")))
                test.is_false((net_safety.is_safe_public_url("http://172.31.255.255/x")))
            end)

            test.it("rejects the cloud metadata IP", function()
                test.is_false((net_safety.is_safe_public_url("http://169.254.169.254/latest/meta-data/")))
            end)

            test.it("rejects internal/bare hostnames and IPv6 literals", function()
                test.is_false((net_safety.is_safe_public_url("http://intranet/x")))
                test.is_false((net_safety.is_safe_public_url("http://db.internal/x")))
                test.is_false((net_safety.is_safe_public_url("http://host.local/x")))
                test.is_false((net_safety.is_safe_public_url("http://[::1]/x")))
            end)

            test.it("rejects non-http schemes, credentials, and non-strings", function()
                test.is_false((net_safety.is_safe_public_url("ftp://example.com/x")))
                test.is_false((net_safety.is_safe_public_url("file:///etc/passwd")))
                test.is_false((net_safety.is_safe_public_url("http://user:pass@example.com/x")))
                test.is_false((net_safety.is_safe_public_url(nil)))
                test.is_false((net_safety.is_safe_public_url(42)))
            end)
        end)

        test.describe("cap_content", function()
            test.it("returns content unchanged when under the limit", function()
                local out, truncated = net_safety.cap_content("short", 100)
                test.eq(out, "short")
                test.is_false(truncated)
            end)

            test.it("truncates content over the limit", function()
                local big = string.rep("a", 500)
                local out, truncated = net_safety.cap_content(big, 100)
                test.eq(#out, 100)
                test.is_true(truncated)
            end)

            test.it("defaults to MAX_PROMPT_CONTENT_CHARS", function()
                local big = string.rep("a", net_safety.MAX_PROMPT_CONTENT_CHARS + 50)
                local out, truncated = net_safety.cap_content(big)
                test.eq(#out, net_safety.MAX_PROMPT_CONTENT_CHARS)
                test.is_true(truncated)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
