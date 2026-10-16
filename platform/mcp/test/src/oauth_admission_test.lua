local test = require("test")
local sql = require("sql")
local json = require("json")
local time = require("time")
local uuid = require("uuid")
local repo = require("repo")
local endpoints = require("endpoints")
local state = require("state")
local flow = require("flow")
local unavailable = require("unavailable")
local quota = require("quota")

local function define_tests()
    test.describe("MCP OAuth anonymous admission", function()
        local marker: string = ""
        local owned: { string } = {}
        local redirect = "https://client.example/callback"
        local function register(args: any): (any?, any?)
            local out, err = repo.register_client(args)
            if out then owned[#owned + 1] = out.client_id end
            return out, err
        end
        local function fixture(count: integer, created: integer)
            local db = assert(sql.get("app:db"))
            local _, err = db:execute([[WITH RECURSIVE numbers(n) AS (
                SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<$1)
                INSERT INTO kickside_mcp_oauth_clients
                (client_id,client_name,redirect_uris_json,created_at,last_used_at)
                SELECT $2 || CAST(n AS TEXT),$2,$3,$4,$4 FROM numbers]],
                { count, marker, json.encode({ redirect }), created })
            db:release()
            test.is_nil(err, tostring(err))
        end
        test.before_each(function() marker = "admission-" .. uuid.v4(); owned = {}; state.reset({}) end)
        test.after_each(function()
            local db = assert(sql.get("app:db"))
            local _, err = db:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_name=$1", { marker })
            test.is_nil(err)
            local _, code_err = db:execute("DELETE FROM kickside_mcp_oauth_codes WHERE actor_id=$1", { marker })
            test.is_nil(code_err)
            local payload = state.result().payload
            if payload and payload.client_id then owned[#owned + 1] = payload.client_id end
            for _, id in ipairs(owned) do
                local _, err = db:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id=$1", { id })
                test.is_nil(err)
            end
            db:release()
        end)
        test.it("bounds new client metadata without changing valid registration", function()
            local many = {}
            for i = 1, 17 do many[i] = redirect .. "?n=" .. tostring(i) end
            for _, args in ipairs({ { client_name = string.rep("n", 257), redirect_uris = { redirect } },
                { redirect_uris = many }, { redirect_uris = { redirect .. "?q=" .. string.rep("x", 2048) } } }) do
                local client, err = register(args)
                test.is_nil(client)
                test.not_nil(err)
            end
            local client, err = register({ client_name = string.rep("n", 256), redirect_uris = { redirect } })
            test.not_nil(client)
            test.is_nil(err)
        end)
        test.it("limits anonymous registrations in a rolling minute", function()
            fixture(60, time.now():unix())
            local client, err = register({ client_name = marker, redirect_uris = { redirect } })
            test.is_nil(client)
            test.eq(err:kind(), errors.RATE_LIMITED)
            local db = assert(sql.get("app:db"))
            local _, changed_err = db:execute("UPDATE kickside_mcp_oauth_clients SET created_at=$1 WHERE client_name=$2",
                { time.now():unix() - 120, marker })
            db:release()
            test.is_nil(changed_err)
            client, err = register({ client_name = marker, redirect_uris = { redirect } })
            test.not_nil(client)
            test.is_nil(err)
        end)
        test.it("bounds stored registrations while keeping existing clients usable", function()
            fixture(10000, time.now():unix() - 120)
            local client, err = register({ client_name = marker, redirect_uris = { redirect } })
            test.is_nil(client)
            test.eq(err:kind(), errors.RATE_LIMITED)
            local existing, read_err = repo.get_client(marker .. "1")
            test.not_nil(existing)
            test.is_nil(read_err)
            test.eq(existing.redirect_uris[1], redirect)
        end)
        test.it("rejects raw null redirects before decode and bounds both HTTP body readers", function()
            for _, raw in ipairs({ '{"redirect_uris":["https://client.example/callback",null]}',
                '{"redirect_uris":["https://client.example/callback"],"client_name":"' .. string.rep("x", 65536) .. '"}' }) do
                state.reset({}, raw)
                endpoints.register()
                test.eq(state.result().status, 400)
                test.eq(state.result().payload.error, "invalid_client_metadata")
            end
            state.reset({}, nil, "body reader fails")
            endpoints.register()
            test.eq(state.result().status, 400)
            test.eq(state.result().max_body, 65536)
            state.reset({}, nil, "body reader fails")
            endpoints.token()
            test.eq(state.result().status, 400)
            test.eq(state.result().payload.error_description, "invalid request body")
            test.eq(state.result().max_body, 120 * 1024 * 1024)
        end)
        test.it("exchanges previously registered large callbacks without rewriting the client", function()
            fixture(1, time.now():unix())
            local uri = redirect .. "?q=" .. string.rep("x", 70000)
            local db = assert(sql.get("app:db"))
            local _, update_err = db:execute("UPDATE kickside_mcp_oauth_clients SET redirect_uris_json=$1 WHERE client_id=$2",
                { json.encode({ uri }), marker .. "1" })
            db:release()
            test.is_nil(update_err)
            local existing, read_err = repo.get_client(marker .. "1")
            test.is_nil(read_err)
            test.eq(existing.redirect_uris[1], uri)
            local code = "legacy-code-" .. uuid.v4()
            local verifier = string.rep("v", 48)
            local token = "legacy-token-" .. marker
            local code_err = repo.put_code(code, { client_id = marker .. "1", actor_id = marker,
                redirect_uri = uri, code_challenge = flow.pkce_challenge(verifier),
                grant = { access_token = token, credential_id = marker } })
            test.is_nil(code_err)
            local encoded = uri:gsub("([^%w%-%._~])", function(c) return string.format("%%%02X", string.byte(c)) end)
            state.reset({}, "grant_type=authorization_code&client_id=" .. marker .. "1&code=" .. code
                .. "&code_verifier=" .. verifier .. "&redirect_uri=" .. encoded)
            endpoints.token()
            test.eq(state.result().status, 200)
            test.eq(state.result().payload.access_token, token)
        end)
        test.it("propagates admission infrastructure and rollback failures", function()
            local admitted, err = quota.insert_limited({ begin = function() return nil, "begin unavailable" end },
                "unused", {}, {})
            test.is_nil(admitted)
            test.eq(err:kind(), errors.INTERNAL)
            test.is_true(err:retryable())
            test.contains(err:message(), "begin unavailable")
            admitted, err = quota.insert_limited({ begin = function() return {
                query = function() return nil, "query unavailable" end,
                rollback = function() return nil, "rollback unavailable" end,
            }, nil end }, "unused", {}, { { query = "unused", args = {} } })
            test.is_nil(admitted)
            test.eq(err:kind(), errors.INTERNAL)
            test.contains(err:message(), "query unavailable")
            test.contains(err:message(), "rollback unavailable")
        end)
        test.it("reports registration infrastructure failure as unavailable", function()
            state.reset({}, '{"redirect_uris":["https://client.example/callback"]}')
            unavailable.register()
            test.eq(state.result().status, 503)
            test.eq(state.result().payload.error, "temporarily_unavailable")
            test.eq(state.result().payload.error_description, "registration database unavailable")
        end)
        test.it("returns 429 through public registration instead of client metadata failure", function()
            fixture(60, time.now():unix())
            state.reset({}, json.encode({ client_name = marker, redirect_uris = { redirect } }))
            endpoints.register()
            test.eq(state.result().status, 429)
            test.eq(state.result().payload.error, "temporarily_unavailable")
        end)
    end)
end
return { run = test.run_cases(define_tests) }
