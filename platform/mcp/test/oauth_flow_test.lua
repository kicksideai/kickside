-- The MCP OAuth authorization-server flow, driven end to end without HTTP:
-- discovery metadata, dynamic client registration, consent grant under a real
-- actor (minting the credential), and PKCE exchange releasing it — plus the
-- failure modes that carry the security weight: replayed codes, wrong
-- verifiers, mismatched clients and redirects, unregistered redirect URIs.

local test = require("test")
local sql = require("sql")
local time = require("time")
local security = require("security")
local funcs = require("funcs")
local flow = require("mcp_oauth_flow")
local oauth_repo = require("mcp_oauth_repo")
local mcp_repo = require("mcp_repo")
local consts = require("mcp_consts")
local subjects = require("subjects")
local public_url = require("mcp_public_url")
local registry = require("registry")
local errors = require("errors")

local function define_tests()
    test.describe("MCP OAuth authorization server", function()
        local suffix = tostring(time.now():unix())
        local actor = "oauth-actor-" .. suffix
        local redirect = "https://client.example/callback"
        local verifier = "verifier-" .. suffix .. "-0123456789abcdef0123456789abcdef"

        local client_id = ""

        local function cleanup()
            local d, e = sql.get("app:db")
            if e then error(tostring(e)) end
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE actor_id = $1", { actor })
            d:execute("DELETE FROM kickside_mcp_oauth_codes WHERE actor_id = $1", { actor })
            if client_id ~= "" then
                d:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id = $1", { client_id })
            end
            d:release()
            subjects.remove(actor)
        end

        local function grant_as_actor(params: any): any
            local live_actor = security.new_actor(actor, { user_id = actor, security_groups = {} })
            local policy = security.policy("app:mcp_suite_policy")
            local scope = security.new_scope({ policy })
            return funcs.new():with_actor(live_actor):with_scope(scope):call(
                "app:oauth_grant_func", { params = params, mint = {} })
        end

        local function authorize_params(overrides: any?): any
            local p: any = {
                response_type = "code",
                client_id = client_id,
                redirect_uri = redirect,
                code_challenge = flow.pkce_challenge(verifier),
                code_challenge_method = "S256",
                state = "st ate/1",
            }
            for k, v in pairs(type(overrides) == "table" and overrides or {}) do p[k] = v end
            return p
        end

        test.before_all(function() subjects.put(actor, subjects.STATUS.ACTIVE, {}) end)
        test.after_all(cleanup)

        test.it("serves spec-complete discovery metadata", function()
            local rm = flow.protected_resource_metadata("https://x.example/")
            test.eq(rm.resource, "https://x.example/api/public/mcp")
            test.eq(rm.authorization_servers[1], "https://x.example/api/public/mcp/oauth")

            local asm = flow.authorization_server_metadata("https://x.example")
            test.eq(asm.issuer, "https://x.example/api/public/mcp/oauth")
            test.eq(asm.authorization_endpoint, "https://x.example/api/public/mcp/oauth/authorize")
            test.eq(asm.token_endpoint, "https://x.example/api/public/mcp/oauth/token")
            test.eq(asm.registration_endpoint, "https://x.example/api/public/mcp/oauth/register")
            test.eq(asm.code_challenge_methods_supported[1], "S256")
            test.eq(asm.token_endpoint_auth_methods_supported[1], "none")
        end)

        test.it("mounts discovery at the root as well as the resource-specific paths", function()
            for _, name in ipairs({ "well_known_resource", "well_known_auth_server" }) do
                local entry, err = registry.get("kickside.mcp.oauth:" .. name .. ".root_endpoint")
                test.is_nil(err)
                test.not_nil(entry)
                test.eq(entry.kind, "http.endpoint")
                test.eq(entry.meta.router, "kickside.mcp.oauth:well_known_router")
            end
        end)

        test.it("grants public URL access to each public handler", function()
            local policy, err = registry.get("kickside.mcp.security:endpoint_public_url")
            test.is_nil(err)
            test.not_nil(policy)
            test.eq(policy.data.policy.resources[1], "PUBLIC_API_URL")
            test.eq(policy.data.policy.actions[1], "env.get")
            for _, id in ipairs({ "kickside.mcp.api:serve_mcp", "kickside.mcp.oauth:well_known_resource",
                "kickside.mcp.oauth:well_known_auth_server", "kickside.mcp.oauth:authorize",
                "kickside.mcp.oauth:register", "kickside.mcp.oauth:token" }) do
                local entry = registry.get(id)
                local found = false
                for _, ref in ipairs(entry.data.security.policies) do
                    if ref == "kickside.mcp.security:endpoint_public_url" then found = true end
                end
                test.is_true(found, id .. " cannot read the public authority")
            end
        end)

        test.it("registers a public client and rejects metadata without redirect URIs", function()
            local client, err = flow.register({ client_name = "Suite Client", redirect_uris = { redirect } })
            test.is_nil(err)
            test.not_nil(client)
            client_id = tostring((client :: any).client_id)
            test.is_true(client_id ~= "")
            test.eq((client :: any).token_endpoint_auth_method, "none")

            local bad, bad_err = flow.register({ client_name = "No URIs" })
            test.is_nil(bad)
            test.not_nil(bad_err)
        end)

        test.it("refuses consent for unregistered redirect URIs and unknown clients", function()
            local out = grant_as_actor(authorize_params({ redirect_uri = "https://evil.example/cb" }))
            test.is_nil((out :: any).result)
            test.contains(tostring((out :: any).error), "not registered")

            local unknown = grant_as_actor(authorize_params({ client_id = "no-such-client" }))
            test.is_nil((unknown :: any).result)
            test.not_nil((unknown :: any).error)
        end)

        test.it("refuses unsafe dynamic-registration redirect URIs", function()
            for _, uri in ipairs({
                "http://remote.example/callback", "http://localhost.remote.example/callback",
                "https://", "https://client.example/callback#fragment",
                "https://*.example/callback", "https://user@client.example/callback",
                "https://client.example\\@remote.example/callback",
                "javascript://client.example/%0Aalert(1)", "file://client.example/callback",
            }) do
                local bad, err = flow.register({ redirect_uris = { uri } })
                test.is_nil(bad, uri)
                test.not_nil(err, uri)
            end
        end)
        test.it("refuses unsafe stored callbacks without rewriting the client", function()
            for _, uri in ipairs({ "http://remote.example/callback", "javascript://client.example/callback",
                "https://client.example/callback#fragment", "https://user@client.example/callback" }) do
                local db, err = sql.get("app:db")
                test.is_nil(err)
                local encoded = flow.encode_json({ uri })
                local _, write_err = db:execute("UPDATE kickside_mcp_oauth_clients SET redirect_uris_json=$1 WHERE client_id=$2",
                    { encoded, client_id })
                test.is_nil(write_err)
                local admitted, admission_err = flow.validate_authorize_request(authorize_params({ redirect_uri = uri }))
                local stored, read_err = db:query("SELECT redirect_uris_json FROM kickside_mcp_oauth_clients WHERE client_id=$1", { client_id })
                local _, restore_err = db:execute("UPDATE kickside_mcp_oauth_clients SET redirect_uris_json=$1 WHERE client_id=$2",
                    { flow.encode_json({ redirect }), client_id })
                db:release()
                test.is_nil(read_err)
                test.is_nil(restore_err)
                test.eq(stored[1].redirect_uris_json, encoded)
                test.is_nil(admitted)
                test.contains(tostring(admission_err), "redirect_uri")
            end
        end)

        test.it("retains HTTPS, loopback and native client registrations", function()
            for _, uri in ipairs({ "https://client.example/callback?tenant=1", "http://127.0.0.1:49173/callback",
                "http://localhost/callback", "http://[::1]:49173/callback", "cursor://client/callback" }) do
                local client, err = flow.register({ redirect_uris = { uri } })
                test.is_nil(err, uri)
                test.eq(client.redirect_uris[1], uri)
                local d, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local _, delete_err = d:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id=$1", {client.client_id})
                d:release()
                test.is_nil(delete_err)
            end
        end)
        test.it("requires a 43-character unpadded base64url S256 challenge", function()
            for _, challenge in ipairs({ string.rep("a", 42), string.rep("a", 44),
                string.rep("a", 42) .. "=", string.rep("+", 43), string.rep("/", 43),
                string.rep("a", 42) .. " " }) do
                local client, err = flow.validate_authorize_request(authorize_params({ code_challenge = challenge }))
                test.is_nil(client)
                test.contains(tostring(err), "code_challenge")
            end
        end)
        test.it("rejects matching PKCE proofs with invalid verifier syntax", function()
            for index, proof in ipairs({ string.rep("a", 42), string.rep("a", 129),
                string.rep("a", 42) .. "=", string.rep("a", 42) .. "+", string.rep("a", 42) .. "/",
                string.rep("a", 42) .. " ", string.rep("a", 42) .. "!" }) do
                local code = "invalid-pkce-" .. suffix .. "-" .. tostring(index)
                test.is_nil(oauth_repo.put_code(code, { client_id = client_id, actor_id = actor,
                    redirect_uri = redirect, code_challenge = flow.pkce_challenge(proof),
                    grant = { access_token = "ksmcp_invalid_pkce_fixture" } }))
                local result, err = flow.exchange({ grant_type = "authorization_code", client_id = client_id,
                    redirect_uri = redirect, code = code, code_verifier = proof })
                test.is_nil(result)
                test.contains(tostring(err), "PKCE")
            end
        end)
        test.it("retains RFC 7636 challenge derivation and verifier boundary lengths", function()
            test.eq(flow.pkce_challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
                "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")
            for index, proof in ipairs({ "AZaz09-._~" .. string.rep("a", 33), string.rep("a", 128) }) do
                local code = "valid-pkce-" .. suffix .. "-" .. tostring(index)
                test.is_nil(oauth_repo.put_code(code, { client_id = client_id, actor_id = actor,
                    redirect_uri = redirect, code_challenge = flow.pkce_challenge(proof),
                    grant = { access_token = "ksmcp_valid_pkce_fixture" } }))
                local result, err = flow.exchange({ grant_type = "authorization_code", client_id = client_id,
                    redirect_uri = redirect, code = code, code_verifier = proof })
                test.is_nil(err)
                test.eq(result.access_token, "ksmcp_valid_pkce_fixture")
            end
        end)

        test.it("grants, exchanges with PKCE, and the token resolves as the consenting actor", function()
            local out = grant_as_actor(authorize_params())
            test.is_nil((out :: any).error)
            local granted = (out :: any).result
            test.not_nil(granted)
            local code = tostring((granted :: any).code)
            test.is_true(#code > 20)
            test.contains(tostring((granted :: any).redirect_to), "code=" .. code)
            test.contains(tostring((granted :: any).redirect_to), "state=st%20ate%2F1")

            local token_out, terr = flow.exchange({
                grant_type = "authorization_code",
                code = code,
                client_id = client_id,
                redirect_uri = redirect,
                code_verifier = verifier,
            })
            test.is_nil(terr)
            test.not_nil(token_out)
            local access = tostring((token_out :: any).access_token)
            test.eq(access:sub(1, #consts.TOKEN.PREFIX), consts.TOKEN.PREFIX)
            test.eq((token_out :: any).token_type, "bearer")

            local principal, perr = mcp_repo.resolve_token(access)
            test.is_nil(perr)
            test.eq((principal :: any).actor_id, actor)

            -- Replay: the same code must never release anything twice.
            local replay, rerr = flow.exchange({
                grant_type = "authorization_code",
                code = code,
                client_id = client_id,
                redirect_uri = redirect,
                code_verifier = verifier,
            })
            test.is_nil(replay)
            test.not_nil(rerr)
        end)

        test.it("burns the code on a wrong verifier and rejects mismatched exchange parameters", function()
            local out = grant_as_actor(authorize_params())
            local code = tostring(((out :: any).result :: any).code)

            local bad, berr = flow.exchange({
                grant_type = "authorization_code",
                code = code,
                client_id = client_id,
                redirect_uri = redirect,
                code_verifier = "not-the-verifier",
            })
            test.is_nil(bad)
            test.contains(tostring(berr), "PKCE")

            local after, aerr = flow.exchange({
                grant_type = "authorization_code",
                code = code,
                client_id = client_id,
                redirect_uri = redirect,
                code_verifier = verifier,
            })
            test.is_nil(after)
            test.not_nil(aerr)

            local out2 = grant_as_actor(authorize_params())
            local code2 = tostring(((out2 :: any).result :: any).code)
            local wrong_redirect, wrerr = flow.exchange({
                grant_type = "authorization_code",
                code = code2,
                client_id = client_id,
                redirect_uri = redirect .. "/other",
                code_verifier = verifier,
            })
            test.is_nil(wrong_redirect)
            test.not_nil(wrerr)

            local out3 = grant_as_actor(authorize_params())
            local code3 = tostring(((out3 :: any).result :: any).code)
            local wrong_client, wcerr = flow.exchange({
                grant_type = "authorization_code",
                code = code3,
                client_id = "someone-else",
                redirect_uri = redirect,
                code_verifier = verifier,
            })
            test.is_nil(wrong_client)
            test.not_nil(wcerr)
        end)

        test.it("rejects foreign resources and binds an OAuth credential to this resource", function()
            local refused = grant_as_actor(authorize_params({ resource = "https://other.example/api/public/mcp" }))
            test.is_nil(refused.result)
            test.contains(tostring(refused.error), "resource")
            local resource = public_url.mcp_url()
            local out = grant_as_actor(authorize_params({resource = resource}))
            test.is_nil(out.error)
            local denied, denied_err = flow.exchange({ grant_type = "authorization_code", code = out.result.code,
                client_id = client_id, redirect_uri = redirect, code_verifier = verifier,
                resource = "https://other.example/api/public/mcp" })
            test.is_nil(denied)
            test.contains(tostring(denied_err), "resource")
            out = grant_as_actor(authorize_params({resource = resource}))
            local issued, issue_err = flow.exchange({ grant_type = "authorization_code", code = out.result.code,
                client_id = client_id, redirect_uri = redirect, code_verifier = verifier, resource = resource })
            test.is_nil(issue_err)
            local principal, resolve_err = mcp_repo.resolve_token(issued.access_token)
            test.is_nil(resolve_err)
            test.eq(principal.oauth_resource, resource)
        end)

        test.it("seals a parked access token at rest and authenticates its envelope", function()
            local code = "sealed-code-" .. suffix
            local secret = "ksmcp_secret-that-must-not-rest-in-plaintext"
            local put_err = oauth_repo.put_code(code, { client_id = client_id, actor_id = actor,
                redirect_uri = redirect, code_challenge = "challenge", grant = { access_token = secret } })
            test.is_nil(put_err)
            local d, err = sql.get("app:db")
            test.is_nil(err)
            local rows, read_err = d:query("SELECT grant_json FROM kickside_mcp_oauth_codes WHERE code_hash=$1",
                { oauth_repo.code_hash(code) })
            test.is_nil(read_err)
            test.is_nil(rows[1].grant_json:find(secret, 1, true))
            local grant, consume_err = oauth_repo.consume_code(code)
            test.is_nil(consume_err)
            test.eq(grant.grant.access_token, secret)
            local second = "tampered-" .. code
            test.is_nil(oauth_repo.put_code(second, { client_id = client_id, actor_id = actor,
                redirect_uri = redirect, code_challenge = "challenge", grant = { access_token = secret } }))
            local _, update_err = d:execute("UPDATE kickside_mcp_oauth_codes SET grant_json=$1 WHERE code_hash=$2",
                { rows[1].grant_json, oauth_repo.code_hash(second) })
            d:release()
            test.is_nil(update_err)
            local bad, bad_err = oauth_repo.consume_code(second)
            test.is_nil(bad)
            test.not_nil(bad_err)
        end)

        test.it("consumes an existing in-flight grant without rewriting its token", function()
            local code = "existing-code-" .. suffix
            test.is_nil(oauth_repo.put_code(code, { client_id = client_id, actor_id = actor,
                redirect_uri = redirect, code_challenge = "challenge", grant = {} }))
            local d, err = sql.get("app:db")
            test.is_nil(err)
            local _, update_err = d:execute("UPDATE kickside_mcp_oauth_codes SET grant_json=$1 WHERE code_hash=$2",
                { '{"access_token":"existing-in-flight-token"}', oauth_repo.code_hash(code) })
            d:release()
            test.is_nil(update_err)
            local grant, consume_err = oauth_repo.consume_code(code)
            test.is_nil(consume_err)
            test.eq(grant.grant.access_token, "existing-in-flight-token")
        end)

        test.it("zeroes the parked token once consumed", function()
            local out = grant_as_actor(authorize_params())
            local code = tostring(((out :: any).result :: any).code)
            local ok = select(1, flow.exchange({
                grant_type = "authorization_code",
                code = code,
                client_id = client_id,
                redirect_uri = redirect,
                code_verifier = verifier,
            }))
            test.not_nil(ok)

            local d, err = sql.get("app:db")
            if err or not d then error(tostring(err or "database unavailable")) end
            local rows = sql.builder.select("grant_json")
                :from("kickside_mcp_oauth_codes")
                :where("code_hash = ?", oauth_repo.code_hash(code))
                :run_with(d):query()
            d:release()
            test.eq(tostring((rows[1] :: any).grant_json), "{}")
        end)

        test.it("returns a typed error for a corrupt parked grant", function()
            local code = "corrupt-code-" .. suffix
            local put_err = oauth_repo.put_code(code, {
                client_id = client_id, actor_id = actor, redirect_uri = redirect,
                code_challenge = "challenge", grant = { scope = "mcp" }, ttl = 300,
            })
            test.is_nil(put_err)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, update_err = (db :: any):execute(
                "UPDATE kickside_mcp_oauth_codes SET grant_json = $1 WHERE code_hash = $2",
                { "{broken", oauth_repo.code_hash(code) })
            ;(db :: any):release()
            test.is_nil(update_err)
            local grant, grant_err = oauth_repo.consume_code(code)
            test.is_nil(grant)
            test.not_nil(grant_err)
            test.is_true(errors.is(grant_err, errors.INTERNAL))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
