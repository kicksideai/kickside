-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local tools = require("tools")
local connection_manager = require("connection_manager")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")

local PROVIDER = "account-tools-test"

local function caller()
    local actor = assert(security.new_actor("account-tools-" .. uuid.v7(), {}))
    local scope = assert(security.new_scope({assert(security.policy("app:user"))}))
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function seed()
    return connection_manager.register_authorized_connection({
        provider_name = PROVIDER, connection_name = "Account lookup fixture",
        oauth_connection = {access_token = "fixture-access-token", token_type = "Bearer",
            scopes_granted = "read profile", connection_state = "connected"},
        user_context = {},
    })
end

local function connect(input)
    -- Only consent initialization is replaced. Query, access checks, contract
    -- opening, metadata and token retrieval use the real component/OAuth path.
    local api = tools.new({authorization = {start = function(provider)
        test.eq(provider, PROVIDER)
        return {success = true, authorization_url = "https://consent.example/authorize", expires_in = 300}, 200
    end}})
    return api.connect(input)
end

local function define()
    test.describe("OAuth account lookup through the real component library", function()
        test.it("returns a consent URL when the actor has no matching connection", function()
            local user = caller()
            local result, err = user:call("app:account_lookup_connect", {provider = PROVIDER, scopes = {"read"}})
            test.is_nil(err, tostring(err)); test.eq(result.status, "authorization_required")
            test.eq(result.authorization_url, "https://consent.example/authorize")
            local checked, check_err = user:call("kickside.oauth.traits:check_connection", {provider = PROVIDER})
            test.is_nil(check_err, tostring(check_err)); test.eq(checked.reason, "not_connected")
        end)
        test.it("opens an existing accessible connection and retrieves its usable token", function()
            local user = caller()
            local id, seed_err = user:call("app:account_lookup_seed", {})
            test.is_nil(seed_err, tostring(seed_err)); test.not_nil(id)
            local result, err = user:call("app:account_lookup_connect", {provider = PROVIDER, scopes = {"read"}})
            test.is_nil(err, tostring(err)); test.eq(result.status, "connected")
            test.eq(result.scopes[1], "read"); test.is_nil(result.component_id); test.is_nil(result.access_token)
        end)
        test.it("treats another actor's connection as absent for the current actor", function()
            local owner = caller()
            local id, seed_err = owner:call("app:account_lookup_seed", {})
            test.is_nil(seed_err, tostring(seed_err)); test.not_nil(id)
            local result, err = caller():call("app:account_lookup_connect", {provider = PROVIDER})
            test.is_nil(err, tostring(err)); test.eq(result.status, "authorization_required")
            test.eq(result.authorization_url, "https://consent.example/authorize")
        end)
        test.it("reports missing scopes from the saved grant through CheckConnection", function()
            local user = caller()
            local id, seed_err = user:call("app:account_lookup_seed", {})
            test.is_nil(seed_err, tostring(seed_err)); test.not_nil(id)
            local result, err = user:call("kickside.oauth.traits:check_connection",
                {provider = PROVIDER, scopes = {"read", "write"}})
            test.is_nil(err, tostring(err)); test.eq(result.status, "authorization_required")
            test.eq(result.reason, "missing_scopes")
            local ready, ready_err = user:call("kickside.oauth.traits:check_connection",
                {provider = PROVIDER, scopes = {"read"}})
            test.is_nil(ready_err, tostring(ready_err)); test.eq(ready.status, "connected")
        end)
    end)
end

return {run = test.run_cases(define), seed = seed, connect = connect}
