local test = require("test")
local json = require("json")
local env = require("env")
local time = require("time")
local base64 = require("base64")
local crypto = require("crypto")
local http_client = require("http_client")
local registry = require("registry")
local handoff = require("handoff")
local user_repo = require("user_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_group_sources_repo = require("user_group_sources_repo")

local SECRET_KEY = "kickside.users.env:handoff_secret"
local SECRET = "dGVzdC1oYW5kb2ZmLXNlY3JldC1mb3ItdGhlLXVzZXJzLWhhcm5lc3M"
local USER_ID = "handoff_test_user"
local EMAIL = "handoff@test.local"

local function b64url(raw: string): string
    local encoded = assert(base64.encode(raw))
    return (encoded:gsub("+", "-"):gsub("/", "_"):gsub("=", ""))
end

local function from_hex(hex: string): string
    return (hex:gsub("..", function(pair) return string.char(tonumber(pair, 16)) end))
end

local function sign(payload, secret: string?): string
    local encoded = b64url(assert(json.encode(payload)))
    local mac = assert(crypto.hmac.sha256(secret or SECRET, encoded))
    return encoded .. "." .. b64url(from_hex(mac))
end

local function nonce(): string
    return b64url(assert(crypto.random.bytes(16)))
end

local function gateway_url(path: string): string
    local entry = registry.get("app:gateway")
    local addr = entry and ((entry :: any).data and (entry :: any).data.addr or (entry :: any).addr) or nil
    local port = tostring(addr or ""):match(":(%d+)$")
    if not port then error("harness gateway address unavailable: " .. tostring(addr)) end
    return "http://localhost:" .. port .. path
end

local function post(token: string)
    local response, err = http_client.post(gateway_url("/api/public/user/handoff"), {
        headers = {["Content-Type"] = "application/json"},
        body = json.encode({token = token}),
    })
    test.is_nil(err)
    return response.status_code, json.decode(response.body or "")
end

local function define_tests()
    test.describe("handoff token verification", function()
        local now = 1800000000

        test.it("accepts a valid token", function()
            local n = nonce()
            local claims, reason = handoff.verify(sign({email = EMAIL, exp = now + 60, nonce = n}), SECRET, now)
            test.is_nil(reason)
            test.eq(claims.email, EMAIL)
            test.eq(claims.exp, now + 60)
            test.eq(claims.nonce, n)
        end)

        test.it("rejects a bad signature", function()
            local token = sign({email = EMAIL, exp = now + 60, nonce = nonce()}, "another-secret-value")
            local claims, reason = handoff.verify(token, SECRET, now)
            test.is_nil(claims)
            test.eq(reason, "bad_signature")
        end)

        test.it("rejects a changed payload", function()
            local token = sign({email = EMAIL, exp = now + 60, nonce = nonce()})
            local signature = token:match("%.(.+)$")
            local forged = b64url(assert(json.encode({email = "admin@test.local", exp = now + 60, nonce = nonce()})))
            local claims, reason = handoff.verify(forged .. "." .. signature, SECRET, now)
            test.is_nil(claims)
            test.eq(reason, "bad_signature")
        end)

        test.it("rejects an expired token", function()
            local claims, reason = handoff.verify(sign({email = EMAIL, exp = now, nonce = nonce()}), SECRET, now)
            test.is_nil(claims)
            test.eq(reason, "expired")
        end)

        test.it("rejects a token that expires too far ahead", function()
            local claims, reason = handoff.verify(sign({email = EMAIL, exp = now + 301, nonce = nonce()}), SECRET, now)
            test.is_nil(claims)
            test.eq(reason, "too_far_ahead")
            test.not_nil((handoff.verify(sign({email = EMAIL, exp = now + 300, nonce = nonce()}), SECRET, now)))
        end)

        test.it("rejects a short nonce", function()
            local token = sign({email = EMAIL, exp = now + 60, nonce = b64url("short")})
            local claims, reason = handoff.verify(token, SECRET, now)
            test.is_nil(claims)
            test.eq(reason, "malformed")
        end)

        test.it("rejects every token when no secret is configured", function()
            local token = sign({email = EMAIL, exp = now + 60, nonce = nonce()})
            local claims, reason = handoff.verify(token, "", now)
            test.is_nil(claims)
            test.eq(reason, "not_configured")
            claims, reason = handoff.verify(token, nil, now)
            test.is_nil(claims)
            test.eq(reason, "not_configured")
        end)

        test.it("rejects malformed tokens", function()
            for _, token in ipairs({"", "abc", "a.b.c", "!!.??", string.rep("a", 3000) .. ".b"}) do
                local claims, reason = handoff.verify(token, SECRET, now)
                test.is_nil(claims)
                test.not_nil(reason)
            end
        end)
    end)

    test.describe("handoff sign-in endpoint", function()
        local original

        test.before_all(function()
            original = env.get(SECRET_KEY) or ""
            assert(env.set(SECRET_KEY, SECRET))
            assert(user_repo.create({user_id = USER_ID, email = EMAIL, password = "Handoff-2026-pass!", status = "active"}))
            assert(user_group_sources_repo.set_user_groups(USER_ID, {"app.security:user"}))
        end)

        test.after_all(function()
            assert(env.set(SECRET_KEY, original))
            if user_repo.get(USER_ID) then assert(user_lifecycle_repo.delete(USER_ID)) end
        end)

        test.it("returns the password login session for a valid token and refuses its reuse", function()
            local token = sign({email = EMAIL, exp = time.now():unix() + 120, nonce = nonce()})
            local status, body = post(token)
            test.eq(status, 200)
            test.is_true(body.success)
            test.not_nil(body.token)
            test.eq(body.user.user_id, USER_ID)
            test.not_nil(body.expiration)

            status, body = post(token)
            test.eq(status, 401)
            test.is_false(body.success)
        end)

        test.it("refuses an unknown user", function()
            local status = post(sign({email = "nobody@test.local", exp = time.now():unix() + 120, nonce = nonce()}))
            test.eq(status, 401)
        end)

        test.it("refuses an inactive user", function()
            assert(user_lifecycle_repo.update(USER_ID, {status = "suspended"}))
            local status = post(sign({email = EMAIL, exp = time.now():unix() + 120, nonce = nonce()}))
            assert(user_lifecycle_repo.update(USER_ID, {status = "active"}))
            test.eq(status, 401)
        end)

        test.it("refuses a bad signature and an expired token", function()
            test.eq(post(sign({email = EMAIL, exp = time.now():unix() + 120, nonce = nonce()}, "wrong-secret")), 401)
            test.eq(post(sign({email = EMAIL, exp = time.now():unix() - 1, nonce = nonce()})), 401)
        end)

        test.it("refuses every token when the secret is not configured", function()
            assert(env.set(SECRET_KEY, ""))
            local status = post(sign({email = EMAIL, exp = time.now():unix() + 120, nonce = nonce()}))
            assert(env.set(SECRET_KEY, SECRET))
            test.eq(status, 401)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
