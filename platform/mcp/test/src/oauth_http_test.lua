local test = require("test")
local endpoints = require("endpoints")
local state = require("state")
local flow = require("flow")
local sql = require("sql")
local oauth_repo = require("oauth_repo")
local create = require("create")
local update = require("update")

local function define_tests()
    test.describe("MCP OAuth HTTP authorization", function()
        local client: any
        local extra_clients: { string } = {}
        local code: string?
        local function params(redirect: string): any
            return { response_type = "code", client_id = client.client_id, redirect_uri = redirect,
                code_challenge = flow.pkce_challenge(string.rep("v", 48)), code_challenge_method = "S256" }
        end
        test.before_all(function()
            local err
            client, err = flow.register({ redirect_uris = { "https://client.example/callback" } })
            test.is_nil(err)
            test.not_nil(client)
        end)
        test.after_all(function()
            local db, err = sql.get("app:db")
            test.is_nil(err)
            local _, delete_err = db:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id=$1", { client.client_id })
            for _, id in ipairs(extra_clients) do
                local _, err = db:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id=$1", { id })
                test.is_nil(err)
            end
            if code then
                local _, err = db:execute("DELETE FROM kickside_mcp_oauth_codes WHERE code_hash=$1", { oauth_repo.code_hash(code) })
                test.is_nil(err)
            end
            db:release()
            test.is_nil(delete_err)
        end)
        test.it("rejects invalid authorize queries before rendering consent or redirect controls", function()
            for _, query in ipairs({ params("https://attacker.example/callback"), {} }) do
                state.reset(query)
                endpoints.authorize()
                test.eq(state.result().status, 400)
                test.is_nil(state.result().html)
                test.not_nil(state.result().payload.error)
            end
        end)
        test.it("renders consent for an exactly registered valid request", function()
            state.reset(params("https://client.example/callback"))
            endpoints.authorize()
            test.eq(state.result().status, 200)
            test.is_true(state.result().html:find('id="approve"', 1, true) ~= nil)
        end)
        test.it("prevents framing of valid and rejected consent pages", function()
            for _, query in ipairs({ params("https://client.example/callback"), {} }) do
                state.reset(query)
                endpoints.authorize()
                test.eq(state.result().headers["Content-Security-Policy"], "frame-ancestors 'none'")
                test.eq(state.result().headers["X-Frame-Options"], "DENY")
            end
        end)
        test.it("returns the validated callback destination for consent display", function()
            state.reset(params("https://client.example/callback"))
            endpoints.context()
            test.eq(state.result().status, 200)
            test.eq(state.result().payload.redirect_uri, "https://client.example/callback")
        end)
        test.it("rejects raw null restriction elements at every HTTP admission boundary", function()
            for _, raw in ipairs({ '{"allowed_trait_ids":[null]}', '{"allowed_tool_ids":[null]}',
                '{"default_active_trait_ids":[null]}', '{"whitelist_component_ids":[null]}' }) do
                state.reset({ id = "raw-json-guard" }, raw)
                create.handler()
                test.eq(state.result().status, 400, raw)
                test.is_true(state.result().payload.error:find("invalid", 1, true) ~= nil)
                if not raw:find("whitelist", 1, true) then
                    state.reset({ id = "raw-json-guard" }, raw)
                    update.handler()
                    test.eq(state.result().status, 400, raw)
                    test.is_true(state.result().payload.error:find("invalid", 1, true) ~= nil)
                end
            end
            state.reset({}, '{"params":{},"mint":{"policy":{"allowed_trait_ids":[null]}}}')
            endpoints.consent()
            test.eq(state.result().status, 400)
            test.is_true(state.result().payload.error:find("invalid", 1, true) ~= nil)
        end)
        test.it("preserves optional null fields and ignored immutable fields on patch admission", function()
            for _, raw in ipairs({ '{"label":null,"allowed_trait_ids":null,"allowed_tool_ids":null,"agent_profile":null}',
                '{"label":"updated","expires_at":"ignored","whitelist_component_ids":[null]}' }) do
                state.reset({ id = "missing-raw-json-guard" }, raw)
                update.handler()
                test.eq(state.result().status, 404, raw)
                test.eq(state.result().payload.error, "credential not found")
            end
        end)
        test.it("prevents caching across credential and OAuth response paths", function()
            local function assert_headers(handler: any, query: any, body: any, status: number)
                state.reset(query, body)
                handler()
                test.eq(state.result().status, status)
                if handler == endpoints.register and status == 201 then
                    extra_clients[#extra_clients + 1] = state.result().payload.client_id
                end
                test.eq(state.result().headers["Cache-Control"], "no-store")
                test.eq(state.result().headers["Pragma"], "no-cache")
            end
            assert_headers(endpoints.authorize, params("https://client.example/callback"), nil, 200)
            assert_headers(endpoints.authorize, {}, nil, 400)
            assert_headers(endpoints.register, {}, '{}', 400)
            assert_headers(endpoints.register, {}, '{"redirect_uris":["https://client.example/callback"]}', 201)
            assert_headers(endpoints.token, {}, 'grant_type=unsupported', 400)
            code = "header-code-" .. client.client_id
            local verifier = string.rep("v", 48)
            test.is_nil(oauth_repo.put_code(code, { client_id = client.client_id, actor_id = "header-owner",
                redirect_uri = "https://client.example/callback", code_challenge = flow.pkce_challenge(verifier),
                grant = { access_token = "ksmcp_header_fixture", credential_id = "header-credential" } }))
            assert_headers(endpoints.token, {}, 'grant_type=authorization_code&code=' .. code
                .. '&client_id=' .. client.client_id .. '&redirect_uri=https%3A%2F%2Fclient.example%2Fcallback&code_verifier=' .. verifier, 200)
            assert_headers(endpoints.consent, {}, '{', 400)
            assert_headers(endpoints.context, {}, nil, 400)
            assert_headers(create.handler, {}, '{', 400)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
