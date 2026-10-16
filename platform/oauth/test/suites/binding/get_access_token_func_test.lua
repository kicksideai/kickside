local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local oauth_repo = require("oauth_repo")

local OAUTH_IMPL = "kickside.oauth:oauth_connection"
local OAUTH_CONTRACT = "kickside.oauth:oauth_connection_contract"
local GET_ACCESS_CONTEXT_FUNC = "kickside.component.binding:get_access_context_func"
local ACCESS_FULL = 15

local function define_tests()
    test.describe("OAuth get_access_token contract", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "oauth-token-owner-" .. suffix
        local stranger = "oauth-token-stranger-" .. suffix
        local active_component_id = uuid.v7()
        local expired_component_id = uuid.v7()

        local function db()
            local d, e = sql.get("app:db")
            if e then error(tostring(e)) end
            return d
        end

        local function cleanup()
            local d = db()
            for _, cid in ipairs({ active_component_id, expired_component_id }) do
                d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                d:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                d:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
                d:execute("DELETE FROM kickside_oauth_connections WHERE component_id = $1", { cid })
            end
            d:release()
        end

        local function insert_component(cid: string)
            local d = db()
            local private_context = json.encode({ component_id = cid })
            local _, err = d:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { cid, OAUTH_IMPL, private_context }
            )
            if err then error("insert component failed: " .. tostring(err)) end

            _, err = d:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_id, subject_type, component_id, source_component_id, access_mask, created_at)
                  VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)]],
                { uuid.v7(), owner, "user", cid, cid, ACCESS_FULL }
            )
            d:release()
            if err then error("insert access failed: " .. tostring(err)) end
        end

        local function create_oauth_connection(cid: string, expires_at: number, provider: string?)
            local result, err = oauth_repo.create_connection(cid, {
                provider = provider or "google",
                connection_name = "Token test connection",
                connection_description = "Token contract test fixture",
                scopes_granted = "openid email",
                connection_state = "connected",
                token_type = "Bearer",
                expires_at = expires_at,
                tokens = {
                    access_token = "access-token-" .. cid,
                    refresh_token = "refresh-token-" .. cid,
                    scope = "openid email",
                    token_type = "Bearer",
                },
                user_profile = {},
                client_credentials = {},
                provider_specific = {},
                oauth_flow = {},
            })
            test.is_nil(err)
            test.not_nil(result)
        end

        local function open_oauth_connection(cid: string, actor_id: string?)
            local policy, policy_err = security.policy("app:user")
            if not policy then error("test policy missing: " .. tostring(policy_err)) end

            local actor = security.new_actor(actor_id or owner, {})
            local scope = security.new_scope({ policy })
            local def, err = contract.get(OAUTH_CONTRACT)
            test.is_nil(err)
            test.not_nil(def)

            local inst, open_err = def:with_actor(actor):with_scope(scope):open(OAUTH_IMPL, { component_id = cid })
            test.is_nil(open_err, "open oauth connection: " .. tostring(open_err))
            test.not_nil(inst)
            return inst
        end

        local function get_access_context_as(actor_id: string, args: any)
            local policy, policy_err = security.policy("app:user")
            if not policy then error("test policy missing: " .. tostring(policy_err)) end

            local actor = security.new_actor(actor_id, {})
            local scope = security.new_scope({ policy })
            return funcs.new():with_actor(actor):with_scope(scope):call(GET_ACCESS_CONTEXT_FUNC, args)
        end

        test.before_each(function()
            cleanup()
        end)

        test.after_all(function()
            cleanup()
        end)

        test.it("returns an unexpired token without forcing refresh", function()
            insert_component(active_component_id)
            create_oauth_connection(active_component_id, time.now():unix() + 3600, "google")

            local inst = open_oauth_connection(active_component_id)
            local result, err = inst:get_access_token()

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.success, true, "result: " .. tostring(json.encode(result)))
            test.eq(result.access_token, "access-token-" .. active_component_id)
            test.eq(result.is_expired, false)
        end)

        test.it("accepts caller extension fields in the existing token input object", function()
            insert_component(active_component_id)
            create_oauth_connection(active_component_id, time.now():unix() + 3600, "google")
            local inst = open_oauth_connection(active_component_id)
            local result, err = inst:get_access_token({ scope = "openid", provider_options = { audience = "resource" } })
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(result.access_token, "access-token-" .. active_component_id)
            test.is_false(result.is_expired)
        end)

        test.it("denies stranger access at the component boundary", function()
            insert_component(active_component_id)
            create_oauth_connection(active_component_id, time.now():unix() + 3600, "google")

            local result, err = get_access_context_as(stranger, {
                component_id = active_component_id,
                access_mask = 1,
                include_context = true
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.success, false, "result: " .. tostring(json.encode(result)))
            local error_text = tostring(result.error or ""):lower()
            test.is_true(error_text:find("access denied", 1, true) ~= nil, "result: " .. tostring(json.encode(result)))
        end)

        test.it("does not return an expired token as usable when refresh fails", function()
            insert_component(expired_component_id)
            create_oauth_connection(expired_component_id, time.now():unix() - 60, "unknown-provider-" .. suffix)

            local inst = open_oauth_connection(expired_component_id)
            local result, err = inst:get_access_token()

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.success, false)
            test.eq(result.is_expired, true)
            test.is_nil(result.access_token)
            test.matches(result.error, "Token expired and refresh failed")
        end)
    end)
end

return test.run_cases(define_tests)
