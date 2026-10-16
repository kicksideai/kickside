local test=require("test")
local sql=require("sql")
local crypto=require("crypto")
local security=require("security")
local registry=require("registry")
local http_client=require("http_client")
local json=require("json")
local time=require("time")
local users=require("users")
local groups=require("groups")
local lifecycle=require("lifecycle")
local session_index=require("session_index")
local links=require("links")
local dm=require("dm")
local funcs=require("funcs")
local owned={}
local function query(statement,args)
    local db=assert(sql.get("app:db"));local rows,err=db:query(statement,args);db:release()
    assert(not err,tostring(err));return rows
end
local function execute(statement,args)
    local db=assert(sql.get("app:db"));local result,err=db:execute(statement,args);db:release()
    assert(not err,tostring(err));return result
end
local function mark(id)
    execute("INSERT INTO app_user_bot_accounts (user_id,created_by,created_at) VALUES ($1,$2,$3)",
        {id,"deleted-creator","2026-10-09T00:00:00Z"})
end
local function fixture(bot)
    local id=assert(crypto.random.uuid())
    test.not_nil((users.create_passwordless({user_id=id,email=id.."@bots.invalid",status="active"})))
    test.not_nil((groups.assign_user_to_group(id,"app.security:admin")))
    owned[#owned+1]=id;if bot then mark(id) end;return id
end
local function seed_code(id)
    local code=assert(crypto.random.uuid()):gsub("-",""):upper()
    execute("INSERT INTO kickside_link_codes (code,user_id,agent_id,expires_at,created_at) VALUES ($1,$2,'',$3,$4)",
        {code,id,time.now():unix()+300,"2026-10-09T00:00:00Z"});return code
end
local function seed_link(id)
    local link_id=assert(crypto.random.uuid())
    execute("INSERT INTO kickside_external_links (link_id,provider,external_id,user_id,display_name,created_at) VALUES ($1,'discord',$2,$3,'',$4)",
        {link_id,id,id,"2026-10-09T00:00:00Z"});return link_id
end
local function no_links(id)
    test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_external_links WHERE user_id=$1",{id})[1].count),0)
end
local function inbound(id)
    return {provider="discord",reply_component_id="bot-component",reply_resource_id="bot-resource",channel_id=id,
        external_message_id=assert(crypto.random.uuid()),external_user_id=id,text="hello"}
end
local function admission_state()
    local state={}
    for _,table_name in ipairs({"kickside_channel_admissions","kickside_channel_turns","kickside_channel_sessions",
        "kickside_channel_conversation","kickside_channel_session_owner"}) do
        state[table_name]=tonumber(query("SELECT COUNT(*) AS count FROM "..table_name)[1].count)
    end
    return assert(json.encode(state))
end

local function bind_host_only()
    local original = assert(registry.current_version())
    local changes = assert(registry.snapshot()):changes()
    local entries = assert(registry.find({[".id"] = "kickside.contract:host_credential_eligibility"}))
    local host = entries[1] or {id = "kickside.contract:host_credential_eligibility", kind = "registry.entry", meta = {}, data = {}}
    host.meta.credential_eligibility = "kickside.users.binding:credential_eligibility"
    if #entries == 0 then changes:create(host) else changes:update(host) end
    local policies = assert(registry.find({[".id"] = "kickside.contract:host_credential_guard_call"}))
    if #policies > 0 then
        local policy = policies[1]
        policy.data.policy.resources = {"kickside.users.binding:credential_eligibility"}
        changes:update(policy)
    end
    local config = assert(registry.get("kickside.identity:db_config"))
    config.meta.credential_eligibility = ""
    changes:update(config)
    test.is_nil(select(2, changes:apply()))
    return original
end

local function http_link_code(headers)
    local port=assert(tostring(assert(registry.get("app:gateway")).data.addr):match(":(%d+)$"))
    return http_client.post("http://127.0.0.1:"..port.."/api/identity/link-codes",{headers=headers,body="{}"})
end

local function request_link_code(id)
    local store=assert(security.token_store("kickside.users.security:tokens"))
    local token=assert(store:create(security.new_actor(id,{user_id=id}),assert(security.named_scope("app.security:admin")),{expiration="1h"}))
    local actor,scope,validation_err=store:validate(token)
    local response,err=http_link_code({Authorization="Bearer "..token})
    local discarded,discard_err=session_index.discard_minted(token);store:close()
    test.is_nil(discard_err);test.not_nil(discarded);test.is_nil(err)
    return response,actor,scope,validation_err
end

return {run=test.run_cases(function()
    test.describe("external credential exclusion for ordinary Users bots",function()
        test.after_each(function()
            for _,id in ipairs(owned) do
                execute("DELETE FROM kickside_link_codes WHERE user_id=$1",{id})
                execute("DELETE FROM kickside_external_links WHERE user_id=$1",{id})
                execute("DELETE FROM app_user_bot_accounts WHERE user_id=$1",{id})
                test.not_nil((lifecycle.delete(id)))
            end
            owned={}
        end)
        test.it("RA-H51 identity refuses an admin-group bot through the host with an empty local guard", function()
            local original = bind_host_only()
            local id = fixture(true)
            local result, err = links.generate_code(id)
            test.is_nil(select(2, registry.apply_version(original)))
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("RA-H51 identity keeps passwordless human admission with the host and an empty local guard", function()
            local original = bind_host_only()
            local id = fixture(false)
            local result, err = links.generate_code(id)
            test.is_nil(select(2, registry.apply_version(original)))
            test.is_nil(err); test.not_nil(result)
        end)
        test.it("RA-H34 code generation refuses an admin-group bot before creating a code",function()
            local id=fixture(true);local code,err=links.generate_code(id)
            test.is_nil(code);test.not_nil(err);test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_link_codes WHERE user_id=$1",{id})[1].count),0)
        end)
        test.it("RA-H34 actual account API refuses a forged bot session",function()
            local id=fixture(true)
            local response,actor,scope,validation_err=request_link_code(id)
            test.is_nil(actor);test.is_nil(scope);test.not_nil(validation_err)
            test.contains(tostring(validation_err),"Authentication failed")
            test.eq(response.status_code,401,tostring(response.body));local body=assert(json.decode(response.body))
            test.is_false(body.success);test.eq(body.error,"Authentication required");test.is_nil(body.code)
            test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_link_codes WHERE user_id=$1",{id})[1].count),0)
            no_links(id)
        end)
        test.it("RA-H34 absent and malformed HTTP bearers cannot issue a link code",function()
            local before=tonumber(query("SELECT COUNT(*) AS count FROM kickside_link_codes")[1].count)
            for _,headers in ipairs({{}, {Authorization="Bearer malformed"}}) do
                local response,err=http_link_code(headers)
                test.is_nil(err);test.eq(response.status_code,401,tostring(response.body))
                local body=assert(json.decode(response.body))
                test.is_false(body.success);test.eq(body.error,"Authentication required");test.is_nil(body.code)
                test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_link_codes")[1].count),before)
            end
        end)
        test.it("RA-C05/06 an existing human HTTP bearer retains the link-code owner",function()
            local id=fixture(false)
            local response,actor,scope,err=request_link_code(id)
            test.is_nil(err,tostring(err));test.not_nil(actor);test.not_nil(scope);test.eq(actor:id(),id)
            test.eq(response.status_code,200,tostring(response.body))
            local body=assert(json.decode(response.body));test.is_true(body.success);test.not_nil(body.code)
            local rows=query("SELECT user_id FROM kickside_link_codes WHERE code=$1",{body.code})
            test.eq(#rows,1);test.eq(rows[1].user_id,id)
        end)
        test.it("RA-H34 seeded bot code completion refuses without consuming code or creating a link",function()
            local id=fixture(true);local code=seed_code(id)
            local user,err=links.verify_and_link(code,"discord",id)
            test.is_nil(user);test.not_nil(err);test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            no_links(id);test.eq(tonumber(query("SELECT used FROM kickside_link_codes WHERE code=$1",{code})[1].used),0)
        end)
        test.it("RA-H34 seeded bot links refuse scalar complete and stable restriction reads",function()
            local id=fixture(true);local link_id=seed_link(id)
            local scalar,scalar_err=links.resolve("discord",id)
            local link,link_err=links.resolve_link("discord",id)
            local restriction,restriction_err=links.link_get(link_id)
            test.is_nil(scalar);test.is_nil(link);test.is_nil(restriction)
            for _,err in ipairs({scalar_err,link_err,restriction_err}) do
                test.is_true(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
            end
            test.not_nil(scalar_err);test.not_nil(link_err);test.not_nil(restriction_err)
        end)
        test.it("RA-H34 Identity-only human scope retains link reads and trusted DM rejects a bot without Users management",function()
            local human=fixture(false);local bot=fixture(true)
            local human_link=seed_link(human);seed_link(bot)
            local scope=assert(security.named_scope("app.security:identity_only"))
            local actor=security.new_actor(human,{user_id=human})
            test.eq(scope:evaluate(actor,"funcs.call","kickside.users.api:create_user",{}),"undefined")
            local read,read_err=funcs.new():with_actor(actor):with_scope(scope):call("app:limited_identity_actions",
                {provider="discord",external_id=human,link_id=human_link})
            test.is_nil(read_err);test.not_nil(read)
            test.is_nil(read.scalar_err);test.is_nil(read.link_err);test.is_nil(read.restriction_err)
            test.eq(read.scalar,human);test.eq(read.link.user_id,human);test.eq(read.restriction.user_id,human)
            local before=admission_state()
            local result,call_err=funcs.new():with_actor(actor):with_scope(scope):call("kickside.dm:receive_func",inbound(bot))
            test.is_nil(call_err);test.is_false(result.accepted);test.eq(result.status,"error")
            test.eq(type(result.error),"string");test.contains(result.error,"Authentication failed")
            test.eq(admission_state(),before)
        end)
        test.it("RA-H34 actual DM receives a bot-link refusal before admitting a turn or notice",function()
            local id=fixture(true);seed_link(id)
            local before=admission_state()
            local result=dm.receive(inbound(id))
            test.is_false(result.accepted);test.eq(result.status,"error")
            test.eq(type(result.error),"string");test.contains(result.error,"Authentication failed")
            test.is_nil(result.user_id);test.is_nil(result.session_id)
            test.eq(admission_state(),before)
        end)
        test.it("RA-H34 existing exact config-read capability suffices for guarded human link reads",function()
            local human=fixture(false);local link_id=seed_link(human)
            local policies={}
            for _,id in ipairs({"app:identity_only_data","app:identity_config_only_registry",
                "app:identity_only_actions","kickside.identity:credential_eligibility_call"}) do
                policies[#policies+1]=assert(security.policy(id))
            end
            local result,err=funcs.new():with_actor(security.new_actor(human,{user_id=human}))
                :with_scope(assert(security.new_scope(policies))):call("app:limited_identity_actions",
                    {provider="discord",external_id=human,link_id=link_id})
            test.is_nil(err);test.not_nil(result)
            test.is_nil(result.scalar_err);test.is_nil(result.link_err);test.is_nil(result.restriction_err)
            test.eq(result.scalar,human);test.eq(result.link.user_id,human);test.eq(result.restriction.user_id,human)
        end)
        test.it("RA-H34 actual DM link command preserves its string error contract without consuming a bot code",function()
            local id=fixture(true);local code=seed_code(id);local args=inbound(id)
            args.text="link "..code
            local result=dm.receive(args)
            test.is_true(result.accepted);test.eq(result.status,"link_failed")
            test.eq(type(result.error),"string");test.contains(result.error,"Authentication failed")
            local encoded,encode_err=json.encode(result)
            test.is_nil(encode_err);test.not_nil(encoded);test.is_nil(result.user_id);test.is_nil(result.session_id)
            no_links(id);test.eq(tonumber(query("SELECT used FROM kickside_link_codes WHERE code=$1",{code})[1].used),0)
        end)
        test.it("RA-H45 marker lookup outage propagates from linking and linked DM without admission",function()
            local id=fixture(false);local code=seed_code(id);local link_id=seed_link(id)
            local before=admission_state()
            execute("ALTER TABLE app_user_bot_accounts RENAME TO identity_unavailable_markers")
            local generated,generate_err=links.generate_code(id)
            local linked,link_err=links.verify_and_link(code,"slack",id)
            local resolved,resolve_err=links.resolve_link("discord",id)
            local restricted,restriction_err=links.link_get(link_id)
            local result=dm.receive(inbound(id))
            execute("ALTER TABLE identity_unavailable_markers RENAME TO app_user_bot_accounts")
            test.is_nil(generated);test.is_nil(linked);test.is_nil(resolved);test.is_nil(restricted)
            for _,err in ipairs({generate_err,link_err,resolve_err,restriction_err}) do
                test.is_true(errors.is(err,errors.INTERNAL),tostring(err));test.eq(err:details().code,"DB_OPERATION_FAILED")
                test.not_nil(err:details().cause)
            end
            test.not_nil(generate_err);test.not_nil(link_err);test.not_nil(resolve_err);test.not_nil(restriction_err)
            test.is_false(result.accepted);test.eq(result.status,"error")
            test.eq(type(result.error),"string");test.contains(result.error,"app_user_bot_accounts")
            test.eq(tonumber(query("SELECT used FROM kickside_link_codes WHERE code=$1",{code})[1].used),0)
            test.eq(admission_state(),before)
        end)
        test.it("RA-H45 link-store outages propagate through scalar resolution and DM without a notice",function()
            local id=fixture(false);local link_id=seed_link(id)
            local before=admission_state()
            execute("ALTER TABLE kickside_external_links RENAME TO identity_unavailable_links")
            local scalar,scalar_err=links.resolve("discord",id)
            local link,link_err=links.resolve_link("discord",id)
            local restriction,restriction_err=links.link_get(link_id)
            local result=dm.receive(inbound(id))
            execute("ALTER TABLE identity_unavailable_links RENAME TO kickside_external_links")
            test.is_nil(scalar);test.is_nil(link);test.is_nil(restriction)
            test.not_nil(scalar_err);test.not_nil(link_err);test.not_nil(restriction_err)
            for _,err in ipairs({scalar_err,link_err,restriction_err}) do
                test.is_true(errors.is(err,errors.UNAVAILABLE),tostring(err));test.contains(tostring(err),"kickside_external_links")
            end
            test.is_false(result.accepted);test.eq(result.status,"error")
            test.eq(type(result.error),"string");test.contains(result.error,"kickside_external_links")
            test.eq(admission_state(),before)
        end)
        test.it("RA-H34 passwordless human codes links and stable restrictions retain their original success shapes",function()
            local id=fixture(false);local code,code_err=links.generate_code(id)
            test.is_nil(code_err);test.not_nil(code)
            local user,err=links.verify_and_link(code,"discord",id)
            test.is_nil(err);test.eq(user,id)
            test.eq(links.resolve("discord",id),id)
            local link,link_err=links.resolve_link("discord",id)
            test.is_nil(link_err);test.eq(link.user_id,id)
            local restriction,restriction_err=links.link_get(link.link_id)
            test.is_nil(restriction_err);test.eq(restriction.user_id,id)
        end)
    end)
end)}
