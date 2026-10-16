local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local security = require("security")
local funcs = require("funcs")
local registry = require("registry")
local http_client = require("http_client")
local json = require("json")
local errors = require("errors")
local users = require("users")
local groups = require("groups")
local lifecycle = require("lifecycle")
local session_index = require("session_index")
local owned = {}
local tokens = {}

local function execute(statement, args)
    local db = assert(sql.get("app:db"))
    local result, err = db:execute(statement, args)
    db:release()
    assert(not err, tostring(err))
    return result
end

local function fixture(bot)
    local id = assert(crypto.random.uuid())
    test.not_nil((users.create_passwordless({user_id = id, email = id .. "@bots.invalid", status = "active"})))
    test.not_nil((groups.assign_user_to_group(id, "app.security:admin")))
    owned[#owned + 1] = id
    if bot then
        execute("INSERT INTO app_user_bot_accounts (user_id, created_by, created_at) VALUES ($1, $2, $3)",
            {id, "deleted-creator", "2026-10-09T00:00:00Z"})
    end
    return id
end

local function seed(id, meta)
    local actor = security.new_actor(id, meta or {user_id = id})
    local scope = assert(security.named_scope("app.security:admin"))
    test.eq(scope:evaluate(actor, "security.token.create", "kickside.users.security:tokens"), "allow")
    local token, err = funcs.new():with_actor(actor):with_scope(scope):call("app:session_admission_mint")
    test.is_nil(err)
    test.not_nil(token)
    tokens[#tokens + 1] = token
    return token
end

local function gateway()
    local addr = assert(registry.get("app:gateway")).data.addr
    return "http://127.0.0.1:" .. assert(tostring(addr):match(":(%d+)$"))
end

local function request(path, headers)
    local response, err = http_client.get(gateway() .. path, {headers = headers})
    test.is_nil(err)
    return response
end

local function refused(response)
    test.eq(response.status_code, 401, tostring(response.body))
    test.is_false(assert(json.decode(response.body)).success)
end

local function cleanup()
    for _, token in ipairs(tokens) do
        local discarded, err = session_index.discard_minted(token)
        test.is_nil(err)
        test.not_nil(discarded)
    end
    for _, id in ipairs(owned) do
        execute("DELETE FROM app_user_bot_accounts WHERE user_id = $1", {id})
        test.not_nil((lifecycle.delete(id)))
    end
    tokens = {}
    owned = {}
end

return {run = test.run_cases(function()
    test.describe("KickSide native session admission", function()
        test.after_each(cleanup)
        for _, transport in ipairs({"header", "query", "cookie"}) do
            test.it("RA-H53 admin-group bot bearer fails " .. transport .. " authentication", function()
                local token = seed(fixture(true))
                local path = "/api/user/me"
                local headers = {}
                if transport == "header" then headers.Authorization = "Bearer " .. token end
                if transport == "cookie" then headers.Cookie = "x-auth-token=" .. token end
                if transport == "query" then path = path .. "?x-auth-token=" .. http_client.encode_uri(token) end
                refused(request(path, headers))
            end)
        end
        test.it("RA-H53 actor metadata cannot label a bot bearer as a human", function()
            local human = fixture(false)
            local token = seed(fixture(true), {user_id = human, status = "active", principal = {kind = "user", id = human}})
            refused(request("/api/user/me", {Authorization = "Bearer " .. token}))
        end)
        test.it("RA-H53 absent actor metadata cannot bypass bot admission", function()
            local token = seed(fixture(true), {})
            refused(request("/api/user/me", {Authorization = "Bearer " .. token}))
        end)
        test.it("RA-H53 the authenticated Views router refuses a bot bearer", function()
            local token = seed(fixture(true))
            refused(request("/views/session-admission", {Authorization = "Bearer " .. token}))
        end)
        test.it("RA-H53 websocket upgrade requests refuse before the handler", function()
            local token = seed(fixture(true))
            refused(request("/api/user/me", {Authorization = "Bearer " .. token, Connection = "Upgrade",
                Upgrade = "websocket", ["Sec-WebSocket-Version"] = "13", ["Sec-WebSocket-Key"] = "dGhlIHNhbXBsZSBub25jZQ=="}))
        end)
        test.it("RA-H53 native validation refuses a bot while execution lookup retains its groups", function()
            local id = fixture(true)
            local token = seed(id)
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local actor, scope, err = store:validate(token)
            store:close()
            test.is_nil(actor)
            test.is_nil(scope)
            test.not_nil(err)
            local admission, admission_err = funcs.call("kickside.users.binding:credential_subject_lookup", {subject_id = id})
            test.is_nil(admission)
            test.not_nil(admission_err)
            test.is_true(errors.is(admission_err, errors.PERMISSION_DENIED), tostring(admission_err))
            local subject, lookup_err = funcs.call("kickside.users.binding:subject_lookup", {subject_id = id})
            test.is_nil(lookup_err)
            test.is_nil(subject.error)
            test.eq(subject.subject_id, id)
            test.eq(subject.groups[1], "app.security:admin")
        end)
        test.it("RA-H53 marker lookup outages refuse native validation with a typed error", function()
            local token = seed(fixture(false))
            execute("ALTER TABLE app_user_bot_accounts RENAME TO session_admission_marker_outage")
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local actor, scope, err = store:validate(token)
            store:close()
            execute("ALTER TABLE session_admission_marker_outage RENAME TO app_user_bot_accounts")
            test.is_nil(actor)
            test.is_nil(scope)
            test.not_nil(err)
            test.is_false(errors.is(err, errors.PERMISSION_DENIED))
            test.is_true(err:kind() ~= "", tostring(err))
            local restored = assert(security.token_store("kickside.users.security:tokens"))
            local restored_actor, _, restored_err = restored:validate(token)
            restored:close()
            test.is_nil(restored_err)
            test.not_nil(restored_actor)
        end)
        for _, forged in ipairs({false, true}) do
            test.it("RA-C01 human saved credentials admit independently of actor metadata " .. tostring(forged), function()
                local id = fixture(false)
                local meta = forged and {user_id = fixture(true), bot_account = true} or {}
                local token = seed(id, meta)
                local response = request("/api/user/me", {Authorization = "Bearer " .. token})
                test.eq(response.status_code, 200, tostring(response.body))
                test.eq(assert(json.decode(response.body)).user.id, id)
            end)
        end
        test.it("RA-C01 human session actor and bearer remain unchanged on both routers", function()
            local id = fixture(false)
            local token = seed(id)
            for _, path in ipairs({"/api/user/me", "/views/session-admission"}) do
                local response = request(path, {Authorization = "Bearer " .. token})
                test.eq(response.status_code, 200, tostring(response.body))
                test.eq(assert(json.decode(response.body)).user.id, id)
            end
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local actor, _, err = store:validate(token)
            store:close()
            test.is_nil(err)
            test.eq(actor:id(), id)
        end)
        test.it("RA-C01 anonymous requests retain the authentication-required envelope", function()
            refused(request("/api/user/me", {}))
            refused(request("/views/session-admission", {}))
        end)
    end)
end), error_typing = test.run_cases(function()
    test.describe("native token validation error transport", function()
        test.after_each(cleanup)
        test.it("RUNTIME-TOKENSTORE-VALIDATE-ERROR-KIND retains the credential refusal kind", function()
            local token = seed(fixture(true))
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local actor, scope, err = store:validate(token)
            store:close()
            test.is_nil(actor)
            test.is_nil(scope)
            test.eq(err:kind(), errors.PERMISSION_DENIED, tostring(err))
        end)
    end)
end)}
