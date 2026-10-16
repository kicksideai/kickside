local test = require("test")
local errors = require("errors")
local sql = require("sql")
local json = require("json")
local security = require("security")
local funcs = require("funcs")
local registry = require("registry")
local http_client = require("http_client")
local users = require("users")
local groups = require("groups")
local repo = require("repo")
local plan = require("plan")
local readiness = require("readiness")
local USER = "compat_mcp_human"
local function query(db, statement, args)
    local rows, err = db:query(statement, args)
    assert(not err, tostring(err))
    return rows
end
local function invoke(args)
    return funcs.new():with_actor(security.new_actor(USER,{user_id=USER}))
        :with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
        :call("app:credential_actions",args)
end
local function snapshot(db)
    return {
        account=query(db,"SELECT * FROM app_users WHERE user_id=$1",{USER}),
        groups=query(db,"SELECT * FROM app_user_groups WHERE user_id=$1 ORDER BY group_id",{USER}),
        credential=query(db,[[SELECT credential_id,token_hash,token_prefix,actor_id,execution_identity_json,
            authority_json,whitelist_json,label,status,policy_json,context_json,expires_at,created_at,updated_at
            FROM kickside_mcp_credentials WHERE actor_id=$1 ORDER BY credential_id]],{USER}),
    }
end
return {run=test.run_cases(function()
    test.describe("published MCP credential eligibility update",function()
        test.it("RA-C08 preserves old human credentials and restrictions through MCP-first update and restart",function()
            local db=assert(sql.get("app:db"))
            test.is_nil(select(2,db:execute("CREATE TABLE IF NOT EXISTS compat_mcp_update (id TEXT PRIMARY KEY,value TEXT NOT NULL)")))
            local saved
            if plan.phase=="baseline" then
                local created,create_err=users.create_passwordless({user_id=USER,email=USER.."@compat.invalid",status="active"})
                test.is_nil(create_err);test.not_nil(created,"human fixture create")
                local assigned,assign_err=groups.assign_user_to_group(USER,"app.security:admin")
                test.is_nil(assign_err);test.not_nil(assigned,"human fixture group")
                local credential,err=invoke({mint={policy={allowed_tool_ids={"app:echo_tool"}}}})
                test.is_nil(err);test.not_nil(credential,"native mint returns a credential")
                saved={token=credential.token,credential_id=credential.credential_id,state=snapshot(db)}
                test.is_nil(select(2,db:execute("INSERT INTO compat_mcp_update (id,value) VALUES ('human',$1)",{assert(json.encode(saved))})))
            else saved=assert(json.decode(query(db,"SELECT value FROM compat_mcp_update WHERE id='human'")[1].value)) end
            test.eq(json.encode(snapshot(db)),json.encode(saved.state))
            if plan.phase:match("_guard$") then
                local result,err=invoke({})
                test.is_nil(result);test.not_nil(err)
                test.is_true(errors.is(err,plan.phase=="missing_guard" and errors.NOT_FOUND or errors.INTERNAL),tostring(err))
                local credential,resolve_err=repo.resolve_token(saved.token)
                test.is_nil(credential);test.not_nil(resolve_err)
                local restriction,restriction_err=repo.restriction_get(saved.credential_id)
                test.is_nil(restriction);test.not_nil(restriction_err)
                test.is_true(errors.is(restriction_err,plan.phase=="missing_guard" and errors.NOT_FOUND or errors.INTERNAL),tostring(restriction_err))
                test.eq(json.encode(snapshot(db)),json.encode(saved.state))
            else
                local credential,err=repo.resolve_token(saved.token)
                test.is_nil(err);test.eq(credential.actor_id,USER)
                test.is_true(credential.allowed_tool_ids["app:echo_tool"])
                test.is_nil(credential.allowed_tool_ids["app:unknown_tool"])
                test.eq(credential.execution_identity.principal.id,USER)
                test.eq(credential.execution_identity.authorized_by.id,USER)
                test.eq(credential.execution_identity.credential_id,saved.credential_id)
                local restriction,restriction_err=repo.restriction_get(saved.credential_id)
                test.is_nil(restriction_err);test.eq(restriction.actor_id,USER)
                readiness.await_running("app:gateway", readiness.deadline())
                local port=assert(tostring(assert(registry.get("app:gateway")).data.addr):match(":(%d+)$"))
                for _,case in ipairs({{method="initialize",params={}},{method="tools/list",params={}},
                    {method="tools/call",params={name="bot_accounts_echo",arguments={value="preserved-human"}}},
                    {method="tools/call",params={name="unknown_tool",arguments={}}}}) do
                    local response,http_err=http_client.post("http://127.0.0.1:"..port.."/api/public/mcp",{
                        headers={Authorization="Bearer "..saved.token},body=assert(json.encode({jsonrpc="2.0",id=1,method=case.method,params=case.params}))})
                    test.is_nil(http_err);test.eq(response.status_code,200,tostring(response.body))
                    local payload=assert(json.decode(response.body))
                    if case.params.name=="unknown_tool" then test.not_nil(payload.result, tostring(response.body));test.is_true(payload.result.isError, "unknown tool refuses: "..tostring(response.body))
                    else test.is_nil(payload.error,tostring(response.body));test.not_nil(payload.result, "MCP result: "..tostring(response.body));test.is_false(payload.result.isError == true, tostring(response.body))
                        if case.params.name=="bot_accounts_echo" then test.contains(response.body,"preserved-human") end
                    end
                end
                test.eq(json.encode(snapshot(db)),json.encode(saved.state))
            end
            db:release()
        end)
    end)
end)}
