local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local http_client = require("http_client")
local json = require("json")
local users = require("users")
local groups = require("groups")
local lifecycle = require("lifecycle")
local session_index = require("session_index")
local repo = require("repo")
local oauth_repo = require("oauth_repo")
local flow = require("flow")
local owned = {}
local clients = {}
local redirect = "https://client.example/callback"
local verifier = string.rep("v", 48)

local function execute(statement, args)
    local db = assert(sql.get("app:db"))
    local result, err = db:execute(statement, args)
    db:release()
    assert(not err, tostring(err))
    return result
end
local function query(statement, args)
    local db = assert(sql.get("app:db"))
    local result, err = db:query(statement, args)
    db:release()
    assert(not err, tostring(err))
    return result
end
local function mark(id)
    execute("INSERT INTO app_user_bot_accounts (user_id,created_by,created_at) VALUES ($1,$2,$3)",
        {id, "deleted-creator", "2026-10-09T00:00:00Z"})
end
local function fixture(bot)
    local id = assert(crypto.random.uuid())
    test.not_nil((users.create_passwordless({user_id=id,email=id.."@bots.invalid",status="active"})))
    test.not_nil((groups.assign_user_to_group(id,"app.security:admin")))
    owned[#owned+1] = id
    if bot then mark(id) end
    return id
end
local function invoke(id, args)
    return funcs.new():with_actor(security.new_actor(id,{user_id=id}))
        :with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
        :call("app:credential_actions", args)
end
local function oauth_params()
    local client, err = flow.register({redirect_uris={redirect},client_name="bot accounts native fixture"})
    test.is_nil(err);test.not_nil(client)
    clients[#clients+1]=client.client_id
    return {response_type="code",client_id=client.client_id,redirect_uri=redirect,
        code_challenge=flow.pkce_challenge(verifier),code_challenge_method="S256"}
end
local function exchange(params, code)
    return flow.exchange({grant_type="authorization_code",client_id=params.client_id,
        redirect_uri=redirect,code=code,code_verifier=verifier})
end
local function no_credentials(id)
    test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_mcp_credentials WHERE actor_id=$1",{id})[1].count),0)
end
local function seeded_credential()
    local id=fixture(false)
    local credential,err=invoke(id,{})
    test.is_nil(err);test.not_nil(credential)
    mark(id)
    return id,credential
end
local function gateway()
    return "http://127.0.0.1:"..assert(tostring(assert(registry.get("app:gateway")).data.addr):match(":(%d+)$"))
end
return {run=test.run_cases(function()
    test.describe("MCP ordinary Users bot credential exclusion",function()
        test.after_each(function()
            for _,id in ipairs(owned) do
                execute("DELETE FROM kickside_mcp_oauth_codes WHERE actor_id=$1",{id})
                execute("DELETE FROM kickside_mcp_credentials WHERE actor_id=$1",{id})
                execute("DELETE FROM app_user_bot_accounts WHERE user_id=$1",{id})
                test.not_nil((lifecycle.delete(id)))
            end
            for _,id in ipairs(clients) do execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id=$1",{id}) end
            owned={};clients={}
        end)
        test.it("RA-H32 common mint refuses an admin-group bot execution frame",function()
            local id=fixture(true)
            local credential,err=invoke(id,{})
            test.is_nil(credential);test.not_nil(err)
            test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            no_credentials(id)
        end)
        test.it("RA-H32 native admission refuses a seeded bot bearer before the credential API",function()
            local id=fixture(true)
            local store=assert(security.token_store("kickside.users.security:tokens"))
            local token=assert(store:create(security.new_actor(id,{user_id=id}),assert(security.named_scope("app.security:admin")),{expiration="1h"}))
            local response,err=http_client.post(gateway().."/api/mcp/credentials",{headers={Authorization="Bearer "..token},body="{}"})
            local deleted,delete_err=session_index.discard_minted(token)
            store:close()
            test.is_nil(delete_err);test.not_nil(deleted)
            test.is_nil(err);test.eq(response.status_code,401,tostring(response.body))
            test.is_false(assert(json.decode(response.body)).success)
            test.eq(assert(json.decode(response.body)).error,"Authentication required")
            no_credentials(id)
        end)
        test.it("RA-H32 OAuth consent refuses a bot before storing credential or authorization code",function()
            local id=fixture(true)
            local granted,err=invoke(id,{operation="grant",params=oauth_params()})
            test.is_nil(granted);test.not_nil(err)
            no_credentials(id)
            test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_mcp_oauth_codes WHERE actor_id=$1",{id})[1].count),0)
        end)
        test.it("RA-H32 OAuth exchange refuses a seeded bot grant after valid PKCE",function()
            local id=fixture(true)
            local params=oauth_params()
            local code=assert(crypto.random.uuid())
            test.is_nil(oauth_repo.put_code(code,{client_id=params.client_id,actor_id=id,redirect_uri=redirect,
                code_challenge=params.code_challenge,grant={access_token="seeded-bot-token",credential_id="seeded-bot-credential"}}))
            local result,err=exchange(params,code)
            test.is_nil(result);test.not_nil(err)
            test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            no_credentials(id)
        end)
        test.it("RA-H32 real OAuth token endpoint refuses a seeded bot code after valid PKCE",function()
            local id=fixture(true)
            local params=oauth_params()
            local code=assert(crypto.random.uuid())
            test.is_nil(oauth_repo.put_code(code,{client_id=params.client_id,actor_id=id,redirect_uri=redirect,
                code_challenge=params.code_challenge,grant={access_token="seeded-bot-token",credential_id="seeded-bot-credential"}}))
            local response,err=http_client.post(gateway().."/api/public/mcp/oauth/token",{
                headers={["Content-Type"]="application/x-www-form-urlencoded"},body="grant_type=authorization_code&client_id="
                    ..params.client_id.."&code="..code.."&code_verifier="..verifier.."&redirect_uri="..http_client.encode_uri(redirect)})
            test.is_nil(err);test.eq(response.status_code,400,tostring(response.body))
            local body=assert(json.decode(response.body))
            test.is_nil(body.access_token)
            test.contains(body.error_description,"Authentication failed")
            no_credentials(id)
        end)
        test.it("RA-H32 consent cannot label a human credential with a forged bot grant owner",function()
            local human,bot=fixture(false),fixture(true)
            local granted,err=invoke(human,{operation="grant",actor_id=bot,params=oauth_params()})
            test.is_nil(granted);test.not_nil(err)
            no_credentials(human);no_credentials(bot)
        end)
        test.it("RA-H33 seeded active bot credentials fail bearer and deferred restriction reads",function()
            local id,credential=seeded_credential()
            local resolved,err=repo.resolve_token(credential.token)
            test.is_nil(resolved);test.not_nil(err)
            test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            local restriction,restriction_err=repo.restriction_get(credential.credential_id)
            test.is_nil(restriction);test.not_nil(restriction_err)
            test.is_true(errors.is(restriction_err,errors.PERMISSION_DENIED),tostring(restriction_err))
        end)
        test.it("RA-H33 real MCP initialize, tools list and tools call refuse seeded bot bearer",function()
            local id,credential=seeded_credential()
            for _,method in ipairs({"initialize","tools/list","tools/call"}) do
                local response,err=http_client.post(gateway().."/api/public/mcp",{headers={Authorization="Bearer "..credential.token},
                    body=assert(json.encode({jsonrpc="2.0",id=1,method=method,params={name="unknown_tool",arguments={}}}))})
                test.is_nil(err);test.eq(response.status_code,401,tostring(response.body))
                test.not_nil(assert(json.decode(response.body)).error)
            end
        end)
        test.it("RA-H45 eligibility outage refuses mint and inherited/bearer reads with the native infrastructure cause",function()
            local id=fixture(false)
            local credential,err=invoke(id,{})
            test.is_nil(err);test.not_nil(credential)
            execute("ALTER TABLE app_user_bot_accounts RENAME TO mcp_unavailable_markers")
            local minted,mint_err=invoke(id,{})
            local resolved,resolve_err=repo.resolve_token(credential.token)
            local restriction,restriction_err=repo.restriction_get(credential.credential_id)
            execute("ALTER TABLE mcp_unavailable_markers RENAME TO app_user_bot_accounts")
            test.is_nil(minted);test.is_nil(resolved);test.is_nil(restriction)
            for _,failure in ipairs({mint_err,resolve_err,restriction_err}) do
                test.is_true(errors.is(failure,errors.INTERNAL),tostring(failure))
                test.eq(failure:details().code,"DB_OPERATION_FAILED")
                test.not_nil(failure:details().cause)
            end
            test.not_nil(mint_err);test.not_nil(resolve_err);test.not_nil(restriction_err)
            test.not_nil((repo.resolve_token(credential.token)))
        end)
        test.it("RA-C08 anonymous MCP handshakes retain their existing protocol responses",function()
            for _,method in ipairs({"initialize","ping","notifications/initialized"}) do
                local response,err=http_client.post(gateway().."/api/public/mcp",{
                    body=assert(json.encode({jsonrpc="2.0",id=1,method=method,params={}}))})
                test.is_nil(err)
                test.eq(response.status_code,method=="notifications/initialized" and 202 or 200,tostring(response.body))
            end
        end)
        test.it("RA-C08 human consent exchange and exact credential restrictions retain existing behavior",function()
            local id=fixture(false)
            local params=oauth_params()
            local granted,err=invoke(id,{operation="grant",params=params,mint={policy={allowed_tool_ids={"example:allowed"},allowed_trait_ids={},default_active_trait_ids={}}}})
            test.is_nil(err);test.not_nil(granted)
            local result,exchange_err=exchange(params,granted.code)
            test.is_nil(exchange_err);test.not_nil(result.access_token)
            local credential,resolve_err=repo.resolve_token(result.access_token)
            test.is_nil(resolve_err);test.eq(credential.actor_id,id)
            test.is_true(credential.allowed_tool_ids["example:allowed"])
            test.eq(credential.execution_identity.principal.id,id)
            test.eq(credential.execution_identity.authorized_by.id,id)
            test.eq(credential.execution_identity.credential_id,result.credential_id)
        end)
    end)
end)}
