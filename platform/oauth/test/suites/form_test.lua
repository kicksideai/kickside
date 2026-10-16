local test = require("test")
local form = require("form")

-- Regression coverage for kickside.oauth:form — the token exchange and refresh
-- bodies were previously concatenated without percent-encoding, so a client
-- secret / code containing reserved characters corrupted the request.
local function define_tests()
    describe("OAuth form encoding", function()
        it("passes RFC 3986 unreserved characters through unchanged", function()
            test.eq(form.url_encode("AZaz09-._~"), "AZaz09-._~")
        end)

        it("percent-encodes reserved characters", function()
            test.eq(form.url_encode("a+b&c=d/e f:g"), "a%2Bb%26c%3Dd%2Fe%20f%3Ag")
        end)

        it("encodes nil as nil", function()
            test.is_nil(form.url_encode(nil))
        end)

        it("encodes a form body, escaping reserved chars in keys and values", function()
            local body = form.encode({ code = "a/b+c", client_secret = "x=y&z" })
            -- Pairs are joined by '&'; each value is fully escaped so the separator
            -- and '=' assignment are unambiguous.
            test.is_true(string.find(body, "code=a%2Fb%2Bc", 1, true) ~= nil)
            test.is_true(string.find(body, "client_secret=x%3Dy%26z", 1, true) ~= nil)
            -- Exactly one unescaped '&' (the pair separator), none leaking from values.
            local sep_count = select(2, string.gsub(body, "&", ""))
            test.eq(sep_count, 1)
        end)
    end)
end

return test.run_cases(define_tests)
