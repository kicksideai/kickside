local test = require("test")
local registry = require("registry")
local funcs = require("funcs")
local sql = require("sql")
local crypto = require("crypto")
local security = require("security")
local users = require("user_repo")
local lifecycle = require("user_lifecycle_repo")
local groups = require("user_groups_repo")
local session = require("session")
local reconcile = require("trigger_reconcile")
local HOST = "kickside.contract:host_credential_eligibility"
local GUARD = "kickside.users.binding:credential_eligibility"
local CONFIG = "kickside.users:bot_account_inventory"
local original
local owned = {}
local function replace(entry: any)
    local existing = assert(registry.find({[".id"] = tostring(entry.id)}))
    test.not_nil((reconcile.trigger()))
    local changes = assert(registry.snapshot()):changes()
    local kind: string = entry.kind
    local meta: {[string]: any} = entry.meta
    local data: any = entry.data
    local payload = {id = tostring(entry.id), kind = kind, meta = meta, data = data}
    if #existing == 0 then changes:create(payload) else changes:update(payload) end
    test.is_nil(select(2, changes:apply()))
end

local function remove(id)
    test.not_nil((reconcile.trigger()))
    local changes = assert(registry.snapshot()):changes()
    changes:delete(id)
    test.is_nil(select(2, changes:apply()))
end

local function inventory(rows)
    replace({id = CONFIG, kind = "registry.entry", meta = {consumers = rows}, data = {}})
end

local function required()
    return {entries = {{entry = GUARD, kind = "function.lua", meta = {credential_admission = "users"}}}}
end

local function optional()
    return {installed = "app:credential_consumer", entries = {{entry = "app:credential_boundary",
        kind = "registry.entry", meta = {credential_admission = "host"}}}}
end

local function consumer(admission)
    replace({id = "app:credential_consumer", kind = "registry.entry", meta = {}, data = {}})
    replace({id = "app:credential_boundary", kind = "registry.entry",
        meta = {credential_admission = admission}, data = {}})
end

local function host(target)
    local entry = assert(registry.get(HOST))
    entry.meta.credential_eligibility = target
    replace(entry)
end

local function check()
    return funcs.call("kickside.users.binding:credential_readiness", {})
end

local function unavailable(entry)
    local ready, err = check()
    test.is_nil(ready)
    test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
    test.eq(err:details().code, "bot_credentials_not_ready")
    if entry then test.eq(err:details().entry, entry) end
end

return {run = test.run_cases(function()
    test.describe("live credential readiness", function()
        test.before_each(function()
            original = assert(registry.current_version())
            host(GUARD)
            inventory({required(), optional()})
        end)
        test.after_each(function()
            test.is_nil(select(2, registry.apply_version(original)))
            for _, id in ipairs(owned) do test.not_nil((lifecycle.delete(id))) end
            owned = {}
        end)
        test.it("RA-H52 complete required closure with no optional issuer is ready", function()
            local ready, err = check()
            test.is_nil(err); test.is_true(ready)
        end)
        test.it("RA-H52 an installed host-capable optional issuer is ready", function()
            consumer("host")
            local ready, err = check()
            test.is_nil(err); test.is_true(ready)
        end)
        test.it("RA-H52 a legacy installed consumer withholds creation", function()
            consumer(nil)
            unavailable("app:credential_boundary")
        end)
        test.it("RA-H52 absent and empty inventories fail closed", function()
            remove(CONFIG)
            unavailable(CONFIG)
            inventory({})
            local ready, err = check()
            test.is_nil(ready); test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("RA-H52 malformed optional rows fail even while uninstalled", function()
            for _, row in ipairs({{installed = false, entries = {}}, {installed = "app:absent", entries = {}},
                {entries = {{entry = GUARD, kind = "function.lua", meta = {credential_admission = {"users"}}}}},
                {entries = {[2] = {entry = GUARD, kind = "function.lua"}}}}) do
                inventory({row})
                local ready, err = check()
                test.is_nil(ready); test.is_true(errors.is(err, errors.INVALID), tostring(err))
            end
        end)
        test.it("RA-H52 required absent or wrong-kind entries fail closure", function()
            inventory({{entries = {{entry = "app:absent", kind = "function.lua"}}}})
            unavailable("app:absent")
            inventory({{entries = {{entry = GUARD, kind = "registry.entry"}}}})
            unavailable(GUARD)
        end)
        test.it("RA-H52 disabled or misbound host guards withhold creation", function()
            for _, target in ipairs({"", "app:permissive_credentials"}) do
                host(target)
                unavailable(HOST)
            end
        end)
        test.it("RA-H52 absent host and Users function entries fail closure", function()
            remove(HOST)
            unavailable(HOST)
            test.is_nil(select(2, registry.apply_version(original)))
            host(GUARD); inventory({required()})
            remove(GUARD)
            unavailable(GUARD)
        end)
        test.it("RA-H52 marker schema outages propagate without readiness or data writes", function()
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, db:execute("ALTER TABLE app_user_bot_accounts RENAME TO readiness_marker_outage")))
            local ready, err = check()
            local _, restore_err = db:execute("ALTER TABLE readiness_marker_outage RENAME TO app_user_bot_accounts")
            db:release()
            test.is_nil(restore_err)
            test.is_nil(ready); test.not_nil(err)
            test.is_false(errors.is(err, errors.UNAVAILABLE))
            test.is_true(tostring(err):find("app_user_bot_accounts", 1, true) ~= nil, tostring(err))
        end)
        test.it("RA-H52 installed consumer changes are observed without a cached readiness flag", function()
            consumer("host")
            test.is_true((check()))
            consumer("local")
            unavailable("app:credential_boundary")
            consumer("host")
            test.is_true((check()))
            remove("app:credential_boundary")
            unavailable("app:credential_boundary")
            remove("app:credential_consumer")
            test.is_true((check()))
        end)
        test.it("RA-H52 readiness never grants caller database or account-management authority", function()
            local scope = assert(security.new_scope({assert(security.policy("app:readiness_caller"))}))
            local actor = security.new_actor("readiness-observer", {})
            test.eq(scope:evaluate(actor, "db.get", "app:db", {}), "undefined")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.users.api:create_user", {}), "undefined")
            local ready, err = funcs.new():with_actor(actor):with_scope(scope)
                :call("kickside.users.binding:credential_readiness", {})
            test.is_nil(err, err and (tostring(err) .. " entry=" .. tostring(err:details().entry)))
            test.is_true(ready)
        end)
        test.it("RA-H52 incomplete readiness preserves existing human session bytes and passwordless mint", function()
            local id = assert(crypto.random.uuid())
            test.not_nil((users.create_passwordless({user_id = id, email = id .. "@readiness.invalid", status = "active"})))
            owned[#owned + 1] = id
            test.not_nil((groups.assign_user_to_group(id, "app.security:user")))
            local before = assert(users.get(id))
            local minted = assert(session.mint(assert(groups.get_user_with_groups(id))))
            inventory({})
            local ready, err = check()
            test.is_nil(ready); test.is_true(errors.is(err, errors.INVALID), tostring(err))
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local actor, _, validate_err = store:validate(minted.token)
            store:close()
            test.is_nil(validate_err); test.eq(actor:id(), id)
            test.eq(assert(users.get(id)).password_hash, before.password_hash)
            test.eq(assert(users.get(id)).auth_generation, before.auth_generation)
            test.not_nil((session.mint(assert(groups.get_user_with_groups(id)))))
        end)
    end)
end)}
