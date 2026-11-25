local test = require("test")
local tools = require("tools")
local authorization = require("authorization")
local registry = require("registry")
local security = require("security")
local json = require("json")

local function fixture()
    local state = {missing = false, starts = 0, reads = 0,
        info = {component_id = "internal-connection", provider = "google", connection_name = "My account",
            scopes_granted = "read profile", connection_state = "connected"},
        token = {success = true, access_token = "private-token", is_expired = false}}
    local conn = {
        get_info = function() return state.info, state.info_err end,
        get_access_token = function() state.reads = state.reads + 1; return state.token, state.token_err end,
    }
    state.api = tools.new({security = {
        actor = function() if not state.no_actor then return "actor" end end,
        scope = function() return "scope" end,
    }, component = {ACCESS = {READ = 1}, query = function(filter)
        test.eq(filter.meta.class, "connection"); test.eq(filter.meta.provider, "google")
        test.eq(filter.access_mask, 1); test.eq(filter.limit, 2); test.is_nil(filter.scope)
        test.is_nil(filter.actor_id)
        if state.lookup_err then return nil, state.lookup_err end
        if state.missing then return {} end
        if state.multiple then return {{component_id = "one"}, {component_id = "two"}} end
        return {{component_id = "internal-connection"}}
    end, open = function(id, access, definition)
        test.eq(id, "internal-connection"); test.eq(access, 1)
        test.eq(definition, "kickside.oauth:oauth_connection_contract")
        if state.open_err then return nil, state.open_err end
        return conn
    end}, authorization = {start = function(provider, body)
        state.starts = state.starts + 1; state.body = body; test.eq(provider, "google")
        if state.start_status then return {success = false, error = "private-provider-error"}, state.start_status end
        return {success = true, authorization_url = "https://consent.example/authorize", expires_in = 600,
            state_token = "private-state", redirect_uri = "private-redirect", storage_payload = {secret = true}}, 200
    end}})
    return state
end

local function init_fixture()
    local state = {spawns = 0, ready = true, write = true, expires_in = 600}
    local discovery = {
        get_provider_info = function(_, input)
            test.eq(input.oauth_provider, "google")
            if state.unknown then return {success = false, error = "missing"} end
            return {name = "google", title = "Google", default_scopes = {"profile", "read"}}
        end,
        get_connector_contract = function()
            return {implementation_id = "fake:connector", context_values = {credential = "private"}}
        end,
    }
    local connector = {init_oauth = function(_, input)
        state.input = input
        return {success = true, authorization_url = "https://consent.example/authorize", state_token = "private-state",
            storage_payload = {verifier = "private-verifier"}, expires_in = state.expires_in}
    end}
    local function definition(instance)
        local builder = {}
        builder.with_actor = function(self, actor) test.eq(actor, "actor"); return self end
        builder.with_scope = function(self, scope) test.eq(scope, "scope"); return self end
        builder.with_context = function(self, context) test.eq(context.credential, "private"); return self end
        builder.open = function() return instance end
        return builder
    end
    state.api = authorization.new({security = {actor = function() return "actor" end, scope = function() return "scope" end},
        env = {get = function(key) test.eq(key, "PUBLIC_API_URL"); return "http://localhost:8098/" end},
        contract = {get = function(id)
            if id == "kickside.oauth.discovery:provider_discovery" then return definition(discovery) end
            test.eq(id, "kickside.oauth:connector"); return definition(connector)
        end}, component = {ACCESS = {WRITE = 2}, validate_access = function(id, access)
            test.eq(id, "internal-connection"); test.eq(access, 2)
            if not state.write then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "denied"}) end
            return 2
        end, query = function()
            return {{meta = {oauth_connection = true, provider = state.wrong_provider and "other" or "google"}}}
        end}, runtime_config = {process_host = function() return "test:host" end},
        process = {spawn = function(id, host, payload)
            test.eq(id, "kickside.oauth.service:connection_negotiator"); test.eq(host, "test:host")
            state.spawns = state.spawns + 1; state.payload = payload
            if state.spawn_fail then return nil, "failed" end
            return "test-pid"
        end}, funcs = {call = function(id, input)
            test.eq(id, "kickside.oauth.service:await_negotiator"); test.eq(input.pid, "test-pid")
            return {success = state.ready}
        end}})
    return state
end

local function define()
    test.describe("OAuth agent account tools", function()
        test.it("reuses a usable accessible account without starting consent", function()
            local f = fixture(); local result, err = f.api.connect({provider = "Google", scopes = {"read"}})
            test.is_nil(err); test.eq(result.status, "connected"); test.eq(f.starts, 0); test.eq(f.reads, 1)
            test.eq(result.scopes[1], "read")
        end)
        test.it("returns only the consent link and expiry when no account exists", function()
            local f = fixture(); f.missing = true
            local result, err = f.api.connect({provider = "google", scopes = {"read"}, purpose = "Import a sheet"})
            test.is_nil(err); test.eq(result.status, "authorization_required"); test.eq(result.expires_in, 600)
            test.eq(result.authorization_url, "https://consent.example/authorize")
            test.eq(f.body.description, "Import a sheet"); test.is_nil(f.body.component_id)
            test.is_nil(result.state_token); test.is_nil(result.redirect_uri); test.is_nil(result.storage_payload)
        end)
        test.it("checks again after consent without creating another flow", function()
            local f = fixture(); f.missing = true
            test.eq(f.api.check({provider = "google"}).status, "authorization_required")
            f.missing = false
            test.eq(f.api.check({provider = "google"}).status, "connected"); test.eq(f.starts, 0)
        end)
        test.it("keeps connection ids, tokens and provider data out of results", function()
            local f = fixture(); f.info.user_profile = {email = "private@example.test"}
            local result = f.api.check({provider = "google"}); local encoded = json.encode(result)
            for _, secret in ipairs({"internal-connection", "private-token", "private@example.test"}) do
                test.is_nil((encoded:find(secret, 1, true)))
            end
            test.is_nil(result.component_id); test.is_nil(result.access_token); test.is_nil(result.user_profile)
        end)
        test.it("requires a new grant for missing scopes and preserves prior scopes", function()
            local f = fixture(); local result = f.api.connect({provider = "google", scopes = {"write"}})
            test.eq(result.status, "authorization_required"); test.eq(f.reads, 0)
            test.eq(f.body.component_id, "internal-connection")
            test.eq(table.concat(f.body.scopes, " "), "read profile write")
        end)
        test.it("keeps a partial grant unready until all requested scopes are present", function()
            local f = fixture()
            test.eq(f.api.connect({provider = "google", scopes = {"read", "write"}}).status, "authorization_required")
            local result, err = f.api.check({provider = "google", scopes = {"read", "write"}})
            test.is_nil(err); test.eq(result.status, "authorization_required"); test.eq(result.reason, "missing_scopes")
            test.eq(f.starts, 1); test.eq(f.reads, 0)
            f.info.scopes_granted = "read profile write"
            test.eq(f.api.check({provider = "google", scopes = {"read", "write"}}).status, "connected")
            test.eq(f.starts, 1); test.eq(f.reads, 1)
        end)
        test.it("reconnects an account marked needs_reauth", function()
            local f = fixture(); f.info.connection_state = "needs_reauth"
            test.eq(f.api.connect({provider = "google"}).status, "authorization_required"); test.eq(f.reads, 0)
        end)
        test.it("recovers an expired account through its token contract", function()
            local f = fixture(); f.info.connection_state = "expired"
            test.eq(f.api.check({provider = "google"}).status, "connected"); test.eq(f.reads, 1)
        end)
        test.it("does not report an unusable token as connected", function()
            local f = fixture(); f.token = {success = false, error = "private-token-error"}
            local result = f.api.check({provider = "google"})
            test.eq(result.status, "authorization_required"); test.eq(result.reason, "reconnect_required")
        end)
        test.it("preserves lookup outages without starting consent or exposing details", function()
            local f = fixture(); f.lookup_err = errors.new({kind = errors.UNAVAILABLE, message = "private-db-error"})
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.is_true(errors.is(err, errors.UNAVAILABLE)); test.eq(f.starts, 0)
            test.is_nil((tostring(err):find("private-db-error", 1, true)))
        end)
        test.it("does not interpret a permission failure as a missing account", function()
            local f = fixture(); f.lookup_err = errors.new({kind = errors.PERMISSION_DENIED, message = "denied"})
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED)); test.eq(f.starts, 0)
        end)
        test.it("does not interpret a failed lookup with NOT_FOUND as an empty successful query", function()
            local f = fixture(); f.lookup_err = errors.new({kind = errors.NOT_FOUND, message = "service missing"})
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.not_nil(err); test.eq(f.starts, 0)
        end)
        test.it("keeps an access failure while opening a matched connection as a failure", function()
            local f = fixture(); f.open_err = errors.new({kind = errors.PERMISSION_DENIED, message = "denied"})
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED)); test.eq(f.starts, 0)
        end)
        test.it("rejects multiple matches instead of silently selecting an account", function()
            local f = fixture(); f.multiple = true
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); test.eq(f.starts, 0)
        end)
        test.it("preserves token contract failures without starting consent", function()
            local f = fixture(); f.token_err = errors.new({kind = errors.UNAVAILABLE, message = "private-network-error"})
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.not_nil(err); test.eq(f.starts, 0)
        end)
        test.it("rejects malformed inputs before accessing a connection", function()
            for _, input in ipairs({{}, {provider = ""}, {provider = "google/invalid"},
                {provider = "google", scopes = "read"}, {provider = "google", scopes = {x = "read"}},
                {provider = "google", scopes = {"two scopes"}}, {provider = "google", purpose = 12}}) do
                local result, err = fixture().api.connect(input)
                test.is_nil(result); test.is_true(errors.is(err, errors.INVALID))
            end
        end)
        test.it("requires an authenticated runtime identity", function()
            local f = fixture(); f.no_actor = true
            local result, err = f.api.check({provider = "google"})
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
        test.it("validates optional scopes when checking a connection", function()
            for _, scopes in ipairs({"read", {x = "read"}, {"two scopes"}, {""}}) do
                local f = fixture()
                local result, err = f.api.check({provider = "google", scopes = scopes})
                test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); test.eq(f.reads, 0)
            end
        end)
        test.it("redacts failed authorization and keeps a denied reconnect denied", function()
            local f = fixture(); f.info.connection_state = "needs_reauth"; f.start_status = 403
            local result, err = f.api.connect({provider = "google"})
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.is_nil((tostring(err):find("private-provider-error", 1, true)))
        end)
        test.it("declares the public trait, tool schemas and member scope", function()
            local trait = assert(registry.get("kickside.oauth.traits:accounts"))
            test.eq(trait.meta.type, "agent.trait")
            local policy = assert(security.policy("kickside.oauth.security:module_runtime"))
            for id, alias in pairs({connect_account = "ConnectAccount", check_connection = "CheckConnection"}) do
                local full = "kickside.oauth.traits:" .. id; local entry = assert(registry.get(full))
                test.eq(entry.meta.llm_alias, alias)
                local schema = json.decode(entry.meta.input_schema)
                test.eq(schema.required[1], "provider"); test.is_nil(schema.properties.component_id)
                test.eq(schema.properties.scopes.type, "array")
                test.eq(policy:evaluate(security.new_actor("member", {}), "funcs.call", full, nil), "allow")
            end
        end)
    end)
    test.describe("Shared OAuth authorization initialization", function()
        test.it("merges default scopes and forwards the caller identity and callback state", function()
            local f = init_fixture()
            local result, status = f.api.start("google", {name = "My account", scopes = {"read", "write"}, description = "Import"})
            test.eq(status, 200); test.is_true(result.success); test.eq(f.spawns, 1)
            test.eq(table.concat(f.input.scopes, " "), "profile read write")
            test.eq(f.input.redirect_uri, "http://localhost:8098/api/public/oauth/callback")
            test.eq(f.payload.connection_data.connection_description, "Import")
            test.eq(f.payload.connection_data.oauth_data.verifier, "private-verifier")
        end)
        test.it("caps the advertised consent lifetime at the callback wait", function()
            local f = init_fixture()
            local result, status = f.api.start("google", {name = "Account", scopes = {}})
            test.eq(status, 200); test.eq(result.expires_in, 300)
        end)
        test.it("retains a connector expiry shorter than the callback wait", function()
            local f = init_fixture(); f.expires_in = 120
            local result, status = f.api.start("google", {name = "Account", scopes = {}})
            test.eq(status, 200); test.eq(result.expires_in, 120)
        end)
        test.it("requires WRITE before reauthorizing an existing account", function()
            local f = init_fixture(); f.write = false
            local result, status = f.api.start("google", {name = "Account", scopes = {}, component_id = "internal-connection"})
            test.eq(status, 403); test.is_false(result.success); test.eq(f.spawns, 0)
        end)
        test.it("rejects a reconnect for another provider", function()
            local f = init_fixture(); f.wrong_provider = true
            local result, status = f.api.start("google", {name = "Account", scopes = {}, component_id = "internal-connection"})
            test.eq(status, 400); test.is_false(result.success); test.eq(f.spawns, 0)
        end)
        test.it("routes a permitted reconnect to the same internal component", function()
            local f = init_fixture()
            local result = f.api.start("google", {name = "Account", scopes = {}, component_id = "internal-connection"})
            test.is_true(result.is_reauthorization); test.eq(f.payload.connection_data.component_id, "internal-connection")
        end)
        test.it("returns a provider miss before spawning a negotiator", function()
            local f = init_fixture(); f.unknown = true
            local result, status = f.api.start("google", {name = "Account", scopes = {}})
            test.eq(status, 404); test.is_false(result.success); test.eq(f.spawns, 0)
        end)
        test.it("does not return a consent URL when spawning fails", function()
            local f = init_fixture(); f.spawn_fail = true
            local result, status = f.api.start("google", {name = "Account", scopes = {}})
            test.eq(status, 500); test.is_false(result.success); test.is_nil(result.authorization_url)
        end)
        test.it("does not publish consent before callback readiness", function()
            local f = init_fixture(); f.ready = false
            local result, status = f.api.start("google", {name = "Account", scopes = {}})
            test.eq(status, 503); test.is_false(result.success); test.is_nil(result.authorization_url)
        end)
    end)
end

return {run = test.run_cases(define)}
