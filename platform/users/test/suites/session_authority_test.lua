local test = require("test")
local json = require("json")
local registry = require("registry")
local http_client = require("http_client")
local security = require("security")
local funcs = require("funcs")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local SCOPE_ID = "app.security:user"
local PASSWORD = "testpass123"
local function gateway_url(path)
    local entry = assert(registry.get("app:gateway"))
    local port = tostring(entry.data.addr):match(":(%d+)$")
    return "http://localhost:" .. assert(port) .. path
end
local function decode_response(response)
    return assert(json.decode(response.body))
end
local function same_value(left, right)
    if type(left) ~= "table" or type(right) ~= "table" then return left == right end
    for key, value in pairs(left) do
        if not same_value(value, right[key]) then return false end
    end
    for key in pairs(right) do
        if left[key] == nil then return false end
    end
    return true
end
local function define_tests()
    test.describe("session execution authority", function()
        test.it("RA-H31 rejects execution authority from password and provider metadata", function()
            local uid = "session_metadata_authority"
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = PASSWORD, status = "active"})))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, SCOPE_ID)))
            local injected = {
                principal = {kind = "user", id = "forged"},
                authorized_by = {kind = "user", id = "forged"},
                component_id = "forged-root", execution_root = "forged-root",
                credential_id = "forged-credential", link_id = "forged-link",
                execution_identity = {version = 2, principal = {kind = "user", id = uid},
                    authorized_by = {kind = "user", id = "forged"}},
                _execution_identity = {version = 2}, inherited_identity = {version = 2},
                scope_used = "app.security:admin", client_trace = "preserved", auth_method = "sso",
            }
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD, metadata = injected}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200, tostring(response.body))
            local provider, provider_err = funcs.call("kickside.users.provisioning:provisioning_mint_session",
                {identifier = uid, meta = injected})
            test.is_nil(provider_err)
            test.eq(provider.ok, true, tostring(provider.error))
            local tokens = assert(security.token_store("kickside.users.security:tokens"))
            for index, token in ipairs({decode_response(response).token, provider.token}) do
                local actor, scope, validate_err = tokens:validate(token)
                test.is_nil(validate_err)
                test.eq(actor:id(), uid)
                test.eq(scope:evaluate(actor, "access", "app:native-token-probe"), "allow")
                local meta = actor:meta()
                test.eq(meta.client_trace, index == 2 and "preserved" or nil)
                test.eq(meta.session.auth_method, index == 2 and "sso" or nil)
                test.eq(meta.user_id, uid)
                for field in pairs(injected) do
                    if field ~= "client_trace" then
                        test.is_nil(meta[field], "session metadata reserves " .. field)
                    end
                end
            end
            tokens:close()
            test.not_nil((user_lifecycle_repo.delete(uid)))
        end)

        test.it("keeps one authority for password and SSO sign-ins of the same user", function()
            local uid = "session_mixed_sign_in"
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = PASSWORD, status = "active"})))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, SCOPE_ID)))
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200, tostring(response.body))
            local tokens = {decode_response(response).token}
            local providers = {"github", "google"}
            for _, provider in ipairs(providers) do
                -- The same meta that kickside.sso sends from its callback.
                local minted, mint_err = funcs.call("kickside.users.provisioning:provisioning_mint_session", {
                    identifier = uid,
                    meta = {auth_method = "sso", sso_provider = provider,
                        ip_address = "192.0.2.10", user_agent = "sso-test"},
                })
                test.is_nil(mint_err)
                test.eq(minted.ok, true, tostring(minted.error))
                tokens[#tokens + 1] = minted.token
            end
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local metas, authorities = {}, {}
            for index, token in ipairs(tokens) do
                local actor, _, validate_err = store:validate(token)
                test.is_nil(validate_err)
                metas[index] = actor:meta()
                local authority = {}
                for key, value in pairs(metas[index]) do
                    if key ~= "session" then authority[key] = value end
                end
                authorities[index] = authority
            end
            store:close()
            -- relay keeps a user hub only while everything outside `session` matches.
            for index = 2, #authorities do
                for key, value in pairs(authorities[1]) do
                    test.is_true(same_value(authorities[index][key], value), "sign-in " .. index .. " changes " .. key)
                end
                for key in pairs(authorities[index]) do
                    test.not_nil(authorities[1][key], "SSO sign-in adds top-level " .. key)
                end
            end
            for index, meta in ipairs(metas) do
                test.eq(meta.session.auth_method, index > 1 and "sso" or nil)
                test.eq(meta.session.sso_provider, index > 1 and providers[index - 1] or nil)
            end
            test.not_nil((user_lifecycle_repo.delete(uid)))
        end)

    end)
end
return {run = test.run_cases(define_tests)}
