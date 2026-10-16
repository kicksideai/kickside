local test = require("test")
local registry = require("registry")
local sql = require("sql")
local crypto = require("crypto")
local security = require("security")
local funcs = require("funcs")
local users = require("users")
local groups = require("groups")
local lifecycle = require("lifecycle")
local owned = {}
local original
local HOST = "kickside.contract:host_credential_eligibility"
local function replace(entry)
    local changes = assert(registry.snapshot()):changes()
    local existing = registry.find({[".id"] = tostring(entry.id)})
    if #existing == 0 then changes:create(entry) else changes:update(entry) end
    test.is_nil(select(2, changes:apply()))
end
local function host(target)
    local entries = assert(registry.find({[".id"] = HOST}))
    local entry = entries[1] or {id = HOST, kind = "registry.entry", meta = {}, data = {}}
    entry.meta.type = "kickside.contract:credential_eligibility"
    entry.meta.credential_eligibility = target
    replace(entry)
    local policies = assert(registry.find({[".id"] = "kickside.contract:host_credential_guard_call"}))
    if #policies > 0 then
        local policy = policies[1]
        policy.data.policy.resources = {target}
        replace(policy)
    end
end
local function local_guard(target)
    local config = assert(registry.get("kickside.mcp:credential_config"))
    config.meta.credential_eligibility = target
    replace(config)
end
local function fixture(bot)
    local id = assert(crypto.random.uuid())
    test.not_nil((users.create_passwordless({user_id = id, email = id .. "@host.invalid", status = "active"})))
    owned[#owned + 1] = id
    test.not_nil((groups.assign_user_to_group(id, "app.security:admin")))
    if bot then
        local db = assert(sql.get("app:db"))
        local _, err = db:execute("INSERT INTO app_user_bot_accounts (user_id,created_by,created_at) VALUES ($1,$2,$3)",
            {id, "deleted-creator", "2026-10-09T00:00:00Z"})
        db:release(); test.is_nil(err)
    end
    return id
end
local function mint(id)
    return funcs.new():with_actor(security.new_actor(id, {user_id = id}))
        :with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
        :call("app:credential_actions", {})
end
local function no_credentials(id)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT COUNT(*) AS count FROM kickside_mcp_credentials WHERE actor_id=$1", {id})
    db:release(); test.is_nil(err); test.eq(tonumber(rows[1].count), 0)
end
return {run = test.run_cases(function()
    test.describe("optional host credential capability", function()
        test.before_each(function() original = assert(registry.current_version()) end)
        test.after_each(function()
            test.is_nil(select(2, registry.apply_version(original)))
            for _, id in ipairs(owned) do
                local db = assert(sql.get("app:db"))
                test.is_nil(select(2, db:execute("DELETE FROM app_user_bot_accounts WHERE user_id=$1", {id})))
                db:release()
                test.not_nil((lifecycle.delete(id)))
            end
            owned = {}
        end)
        test.it("RA-H51 Core-first disabled and consumer-first absent host capabilities preserve unbound humans", function()
            local_guard("")
            for _, remove in ipairs({false, true}) do
                local entries = assert(registry.find({[".id"] = HOST}))
                if #entries > 0 then
                    local changes = assert(registry.snapshot()):changes()
                    if remove then changes:delete(HOST)
                    else
                        local entry = entries[1]
                        entry.meta.credential_eligibility = ""
                        changes:update(entry)
                    end
                    test.is_nil(select(2, changes:apply()))
                end
                local credential, err = mint(fixture(false))
                test.is_nil(err); test.not_nil(credential)
            end
        end)
        test.it("RA-H51 a narrow host caller needs no Users management or database permission", function()
            local_guard(""); host("kickside.users.binding:credential_eligibility")
            local human = fixture(false)
            local actor = security.new_actor(human, {user_id = human})
            local scope = assert(security.new_scope({assert(security.policy("kickside.mcp.security:credential_eligibility_call"))}))
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.users.api:create_user", {}), "undefined")
            test.eq(scope:evaluate(actor, "db.get", "app:db", {}), "undefined")
            local eligible, err = funcs.new():with_actor(actor):with_scope(scope):call(HOST, {identifier = human})
            test.is_nil(err); test.is_true(eligible)
            local bot = fixture(true)
            eligible, err = funcs.new():with_actor(actor):with_scope(scope):call(HOST, {identifier = bot})
            test.is_nil(eligible); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("RA-H51 a later unbound MCP install refuses an admin-group bot through the host capability", function()
            local_guard("")
            host("kickside.users.binding:credential_eligibility")
            local id = fixture(true)
            local credential, err = mint(id)
            test.is_nil(credential); test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            no_credentials(id)
        end)
        test.it("RA-H51 a permissive local guard cannot bypass the host capability", function()
            local_guard("app:allow_credentials")
            host("kickside.users.binding:credential_eligibility")
            local id = fixture(true)
            local credential, err = mint(id)
            test.is_nil(credential); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            no_credentials(id)
        end)
        test.it("RA-H51 missing and invalid host guard targets refuse admission without credential writes", function()
            local_guard("")
            for _, target in ipairs({"app:missing_credentials", "app:invalid_credentials"}) do
                host(target)
                local id = fixture(false)
                local credential, err = mint(id)
                test.is_nil(credential); test.not_nil(err); no_credentials(id)
            end
        end)
        test.it("RA-H51 human admission succeeds with host binding and no local binding", function()
            local_guard(""); host("kickside.users.binding:credential_eligibility")
            local credential, err = mint(fixture(false))
            test.is_nil(err); test.not_nil(credential)
        end)
        test.it("RA-H51 a local refusal remains effective when the host allows a human", function()
            local_guard("app:refuse_credentials"); host("kickside.users.binding:credential_eligibility")
            local id = fixture(false)
            local credential, err = mint(id)
            test.is_nil(credential); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            no_credentials(id)
        end)
    end)
end)}
