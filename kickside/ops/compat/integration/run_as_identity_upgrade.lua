local test=require("test")
local sql=require("sql")
local json=require("json")
local security=require("security")
local users=require("users")
local groups=require("groups")
local session=require("session")
local session_index=require("session_index")
local links=require("links")
local plan=require("plan")
local USER="compat_identity_human"
local function query(db,statement,args)
    local rows,err=db:query(statement,args)
    assert(not err,tostring(err));return rows
end
local function snapshot(db)
    return {
        account=query(db,"SELECT * FROM app_users WHERE user_id=$1",{USER}),
        groups=query(db,"SELECT * FROM app_user_groups WHERE user_id=$1 ORDER BY group_id",{USER}),
        links=query(db,"SELECT * FROM kickside_external_links WHERE user_id=$1 ORDER BY link_id",{USER}),
        codes=query(db,"SELECT * FROM kickside_link_codes WHERE user_id=$1 ORDER BY code",{USER}),
    }
end
return {run=test.run_cases(function()
    test.describe("published external-identity credential update",function()
        test.it("RA-C05 RA-C06 preserves human links pending codes and bearer through consumer-first updates and restart",function()
            local db=assert(sql.get("app:db"))
            test.is_nil(select(2,db:execute("CREATE TABLE IF NOT EXISTS compat_identity_update (id TEXT PRIMARY KEY,value TEXT NOT NULL)")))
            local saved
            if plan.phase=="baseline" then
                local user,create_err=users.create_passwordless({user_id=USER,email=USER.."@compat.invalid",status="active"})
                test.is_nil(create_err);test.not_nil(user)
                test.not_nil((groups.assign_user_to_group(USER,"app.security:admin")))
                for _,provider in ipairs({"discord","slack"}) do
                    local code,code_err=links.generate_code(USER)
                    test.is_nil(code_err);test.not_nil(code)
                    local linked,link_err=links.verify_and_link(code,provider,USER)
                    test.is_nil(link_err);test.eq(linked,USER)
                end
                local code,code_err=links.generate_code(USER)
                test.is_nil(code_err);test.not_nil(code)
                user=assert(users.get(USER))
                local minted,mint_err=session.mint(user)
                test.is_nil(mint_err);test.not_nil(minted)
                local key=assert(session_index.token_key(minted.token))
                saved={code=code,token=minted.token,key=key,
                    token_snapshot=query(db,"SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1",{key})[1].token_value,
                    state=snapshot(db)}
                test.is_nil(select(2,db:execute("INSERT INTO compat_identity_update (id,value) VALUES ('human',$1)",{assert(json.encode(saved))})))
            else saved=assert(json.decode(query(db,"SELECT value FROM compat_identity_update WHERE id='human'")[1].value)) end
            test.eq(json.encode(snapshot(db)),json.encode(saved.state))
            local tokens=assert(security.token_store("kickside.users.security:tokens"))
            local actor,scope,token_err=tokens:validate(saved.token);tokens:close()
            test.is_nil(token_err);test.not_nil(scope);test.eq(actor:id(),USER)
            test.eq(query(db,"SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1",{saved.key})[1].token_value,saved.token_snapshot)
            for _,row in ipairs(saved.state.links) do
                local scalar,scalar_err=links.resolve(row.provider,row.external_id)
                local link,link_err=links.resolve_link(row.provider,row.external_id)
                local restriction,restriction_err=links.link_get(row.link_id)
                if plan.phase:match("_guard$") then
                    test.is_nil(scalar);test.is_nil(link);test.is_nil(restriction)
                    test.not_nil(scalar_err);test.not_nil(link_err);test.not_nil(restriction_err)
                    for _,err in ipairs({scalar_err,link_err,restriction_err}) do
                        test.is_true(errors.is(err,plan.phase=="missing_guard" and errors.NOT_FOUND or errors.INTERNAL),tostring(err))
                    end
                else
                    test.is_nil(scalar_err);test.is_nil(link_err);test.is_nil(restriction_err)
                    test.eq(scalar,USER);test.eq(link.user_id,USER);test.eq(link.link_id,row.link_id)
                    test.eq(link.default_agent_id,row.default_agent_id);test.eq(restriction.user_id,USER)
                end
            end
            if plan.phase:match("_guard$") then
                local code,generate_err=links.generate_code(USER)
                local linked,link_err=links.verify_and_link(saved.code,"discord","new-compat-external")
                test.is_nil(code);test.not_nil(generate_err);test.is_nil(linked);test.not_nil(link_err)
                test.eq(json.encode(snapshot(db)),json.encode(saved.state))
            elseif plan.phase=="completion" then
                local pending
                for _,row in ipairs(saved.state.codes) do
                    if row.code==saved.code then pending=row end
                end
                test.not_nil(pending)
                local expired=os.time()>assert(tonumber(pending.expires_at))
                local linked,link_err=links.verify_and_link(saved.code,"discord","new-compat-external")
                if expired then
                    test.is_nil(linked);test.eq(link_err,"invalid or expired link code")
                    test.eq(tonumber(query(db,"SELECT used FROM kickside_link_codes WHERE code=$1",{saved.code})[1].used),0)
                    test.eq(#query(db,"SELECT * FROM kickside_external_links WHERE provider='discord' AND external_id='new-compat-external'"),0)
                    test.eq(json.encode(snapshot(db)),json.encode(saved.state))
                else
                    test.is_nil(link_err);test.eq(linked,USER)
                    test.eq(tonumber(query(db,"SELECT used FROM kickside_link_codes WHERE code=$1",{saved.code})[1].used),1)
                    test.eq(links.resolve("discord","new-compat-external"),USER)
                    local repeated,repeat_err=links.verify_and_link(saved.code,"discord","another-compat-external")
                    test.is_nil(repeated);test.not_nil(repeat_err)
                    test.eq(#query(db,"SELECT * FROM kickside_external_links WHERE external_id='another-compat-external'"),0)
                end
            end
            db:release()
        end)
    end)
end)}
