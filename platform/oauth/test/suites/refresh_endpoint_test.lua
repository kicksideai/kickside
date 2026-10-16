local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local contract = require("contract")
local security = require("security")
local oauth_repo = require("oauth_repo")
local oauth_read_repo = require("oauth_read_repo")
local refresh_schedule = require("refresh_schedule")
local component = require("component")

local function execute(statement: string, params: { any }): ()
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local _, write_err = db:execute(statement, params)
    db:release()
    if write_err then error(tostring(write_err)) end
end
local function query(statement: string, params: { any }): any
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local rows, read_err = db:query(statement, params)
    db:release()
    if read_err then error(tostring(read_err)) end
    return rows
end
local function define_tests()
    test.describe("OAuth refresh against a local token endpoint", function()
        local ids: { string } = {}
        local owner = "oauth-http-" .. uuid.v7()
        local function create(behavior: string, expired: boolean, network: boolean?): (string, any, string)
            execute("CREATE TABLE IF NOT EXISTS oauth_http_refresh_requests (token TEXT)", {})
            local id = uuid.v7()
            ids[#ids + 1] = id
            local token = behavior .. "-" .. id
            local _, err = oauth_repo.create_connection(id, {
                provider = network and "http-refresh-network-test" or "http-refresh-test",
                connection_name = "HTTP refresh", connection_state = "connected",
                expires_at = time.now():unix() + (expired and -60 or 3600),
                tokens = { access_token = "old-" .. id, refresh_token = token },
            })
            test.is_nil(err, tostring(err))
            execute("INSERT INTO kickside_components (component_id,impl_id,private_context,created_at,updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                { id, "kickside.oauth:oauth_connection", json.encode({ component_id = id }) })
            execute("INSERT INTO kickside_component_access (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES ($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)",
                { uuid.v7(), owner, id, id })
            local policy, policy_err = security.policy("app:user")
            test.is_nil(policy_err)
            local actor, actor_err = security.new_actor(owner, {})
            test.is_nil(actor_err)
            local scope, scope_err = security.new_scope({ policy })
            test.is_nil(scope_err)
            local def, def_err = contract.get("kickside.oauth:oauth_connection_contract")
            test.is_nil(def_err)
            local inst, open_err = def:with_actor(actor):with_scope(scope):open("kickside.oauth:oauth_connection", { component_id = id })
            test.is_nil(open_err)
            return id, inst, token
        end
        test.after_all(function()
            for _, id in ipairs(ids) do
                test.is_nil(select(2, refresh_schedule.cancel(id)))
                test.is_nil(select(2, oauth_repo.delete_connection(id)))
                execute("DELETE FROM kickside_component_access WHERE component_id=$1", { id })
                execute("DELETE FROM kickside_component_meta WHERE component_id=$1", { id })
                execute("DELETE FROM kickside_components WHERE component_id=$1", { id })
            end
            execute("DROP TABLE oauth_http_refresh_requests", {})
        end)
        local function authorize(extra: any): any
            local def, def_err = contract.get("kickside.oauth:connector")
            test.is_nil(def_err)
            local inst, open_err = def:with_context({
                oauth_authorization_endpoint = "http://127.0.0.1:19145/authorize",
                oauth_client_id_env = "app:refresh_test_client",
                oauth_extra_auth_params = extra,
            }):open("kickside.oauth:base_connector")
            test.is_nil(open_err)
            local result, err = inst:init_oauth({ redirect_uri = "http://127.0.0.1:19145/callback" })
            test.is_nil(err)
            return result
        end
        test.it("supports providers without extra authorization parameters", function()
            local result = authorize(nil)
            test.is_true(result.success, tostring(result.error))
            test.contains(result.authorization_url, "response_type=code")
        end)
        test.it("rejects malformed extra parameters and replacements for the generated OAuth state", function()
            for _, extra in ipairs({ "invalid", { prompt = {} }, { state = "replacement" } }) do
                local result = authorize(extra)
                test.is_false(result.success)
                test.contains(result.error, "oauth_extra_auth_params")
            end
        end)
        test.it("includes offline access and consent in the actual first-grant authorization URL", function()
            local def, def_err = contract.get("kickside.oauth:connector")
            test.is_nil(def_err)
            local inst, open_err = def:with_context({
                oauth_authorization_endpoint = "http://127.0.0.1:19145/authorize",
                oauth_client_id_env = "app:refresh_test_client",
                oauth_extra_auth_params = { access_type = "offline", prompt = "consent", audience = "a/b+c &" },
            }):open("kickside.oauth:base_connector")
            test.is_nil(open_err)
            local result, err = inst:init_oauth({ redirect_uri = "http://127.0.0.1:19145/callback", scopes = { "gmail.readonly" } })
            test.is_nil(err); test.is_true(result.success, tostring(result.error))
            test.contains(result.authorization_url, "access_type=offline")
            test.contains(result.authorization_url, "prompt=consent")
            test.contains(result.authorization_url, "audience=a%2Fb%2Bc%20%26")
            test.contains(result.authorization_url, "scope=gmail.readonly")
            test.contains(result.authorization_url, "state=" .. result.state_token)
        end)
        test.it("refreshes an expired token without user action and retains the encrypted refresh token across two refreshes", function()
            local id, inst, token = create("success", true)
            local result, err = inst:get_access_token()
            test.is_nil(err); test.is_true(result.success, tostring(result.error))
            test.eq(result.access_token, "renewed-" .. token)
            local row, read_err = oauth_read_repo.get_connection(id)
            test.is_nil(read_err); test.eq(row.tokens.refresh_token, token)
            local encrypted = query("SELECT oauth_data_encrypted FROM kickside_oauth_connections WHERE component_id=$1", { id })[1]
            test.is_nil(encrypted.oauth_data_encrypted:find(token, 1, true))
            local again, repeat_err = inst:get_access_token({ rejected_access_token = result.access_token })
            test.is_nil(repeat_err); test.is_true(again.success)
            test.eq(#query("SELECT token FROM oauth_http_refresh_requests WHERE token=$1", { token }), 2)
            test.eq(oauth_read_repo.get_connection(id).tokens.refresh_token, token)
        end)
        test.it("refreshes a rejected token before its local expiry and reuses a token refreshed by another caller", function()
            local id, inst, token = create("success", false)
            local result, err = inst:get_access_token({ rejected_access_token = "old-" .. id })
            test.is_nil(err); test.is_true(result.success)
            test.eq(result.access_token, "renewed-" .. token)
            local again, repeat_err = inst:get_access_token({ rejected_access_token = "old-" .. id })
            test.is_nil(repeat_err); test.eq(again.access_token, result.access_token)
            test.eq(#query("SELECT token FROM oauth_http_refresh_requests WHERE token=$1", { token }), 1)
        end)
        test.it("marks invalid_grant as needs-reconnect and retains a visible safe reason in connection status", function()
            local id, inst = create("revoked", true)
            local result, err = inst:get_access_token()
            test.is_nil(err); test.is_false(result.success)
            test.contains(result.error, "invalid_grant")
            test.eq(oauth_read_repo.get_connection(id).connection_state, "needs_reauth")
            local rows, meta_err = component.list_system({ component_ids = { id }, include = { meta = true }, limit = 1 })
            test.is_nil(meta_err)
            test.contains(rows[1].meta.reauth_reason or "", "invalid_grant")
            test.is_nil(((rows[1].meta.reauth_reason or ""):find("private provider detail", 1, true)))
            local def, def_err = contract.get("kickside.contract:component")
            test.is_nil(def_err)
            local status_inst, open_err = def:open("kickside.oauth:oauth_connection", { component_id = id })
            test.is_nil(open_err)
            local status, status_err = status_inst:get_status()
            test.is_nil(status_err); test.contains(status.description, "invalid_grant")
        end)
        for _, outcome in ipairs({ "reject", "success" }) do
            test.it("preserves a newer authorization when an on-demand refresh returns stale " .. outcome, function()
                local id, inst = create("reauthorize-" .. outcome, true)
                local result, err = inst:get_access_token()
                test.is_nil(err)
                test.is_true(result.success, tostring(result.error))
                test.eq(result.access_token, "reauthorized-" .. id)
                local row, read_err = oauth_read_repo.get_connection(id)
                test.is_nil(read_err)
                test.eq(row.connection_state, "connected")
                test.eq(row.tokens.refresh_token, "new-grant-" .. id)
                test.is_true(row.expires_at > time.now():unix() + 3600)
            end)
        end
        test.it("keeps transient HTTP and network refresh failures connected and refreshable", function()
            for _, network in ipairs({ false, true }) do
                local id, inst = create("unavailable", true, network)
                local result, err = inst:get_access_token()
                test.is_nil(err); test.is_false(result.success)
                test.contains(result.error, network and "request failed" or "HTTP 503")
                local row = oauth_read_repo.get_connection(id)
                test.eq(row.connection_state, "connected")
                test.is_true(refresh_schedule.read(id).refresh_enabled)
                test.not_nil(row.tokens.refresh_token)
            end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
