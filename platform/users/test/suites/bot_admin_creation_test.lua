local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local registry = require("registry")
local http_client = require("http_client")
local json = require("json")
local users = require("user_repo")
local groups = require("user_groups_repo")
local lifecycle = require("user_lifecycle_repo")
local session = require("session")
local index = require("session_index")
local consts = require("user_consts")
local owned, tokens = {}, {}
local original, admin_token, human_id

local function execute(statement, args)
    local db = assert(sql.get("app:db"))
    local result, err = db:execute(statement, args)
    db:release()
    assert(not err, tostring(err))
    return result
end

local function query(statement, args)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query(statement, args)
    db:release()
    test.is_nil(err)
    return rows
end

local function fixture(group_ids)
    local id = assert(crypto.random.uuid())
    test.not_nil((users.create({user_id = id, email = id .. "@test.local", password = "admin-bot-fixture", status = "active"})))
    for _, group in ipairs(group_ids) do test.not_nil((groups.assign_user_to_group(id, group))) end
    owned[#owned + 1] = id
    local minted = assert(session.mint(assert(groups.get_user_with_groups(id))))
    tokens[#tokens + 1] = minted.token
    return id, minted.token
end

local function request(method, path, payload, token)
    local port = assert(tostring(assert(registry.get("app:gateway")).data.addr):match(":(%d+)$"))
    local response, err = http_client.request(method, "http://127.0.0.1:" .. port .. path, {
        headers = {Authorization = "Bearer " .. (token or admin_token), ["Content-Type"] = "application/json"},
        body = payload and assert(json.encode(payload)) or nil,
    })
    test.is_nil(err)
    return response
end

local function create(payload, token)
    local response = request("POST", "/api/users/bots", payload, token)
    if response.status_code == 201 then
        local body = assert(json.decode(response.body))
        owned[#owned + 1] = body.user.user_id
    end
    return response
end

local function count(table_name)
    return tonumber(query("SELECT COUNT(*) AS count FROM " .. table_name)[1].count)
end

local function rejected(payload, status, token)
    local before = {count("app_users"), count("app_user_bot_accounts"), count("app_user_groups"), count("app_user_bot_audit")}
    local response = create(payload, token)
    test.eq(response.status_code, status, tostring(response.body))
    test.is_false(assert(json.decode(response.body)).success)
    for position, name in ipairs({"app_users", "app_user_bot_accounts", "app_user_groups", "app_user_bot_audit"}) do
        test.eq(count(name), before[position], name)
    end
end

return {run = test.run_cases(function()
    test.describe("admin-managed bot creation", function()
        test.before_each(function()
            original = assert(registry.current_version())
            local changes = assert(registry.snapshot()):changes()
            local inventory = assert(registry.get("kickside.users:bot_account_inventory"))
            inventory.meta.consumers = {{entries = {{entry = "kickside.users.binding:credential_subject_lookup", kind = "function.lua", meta = {credential_admission = "users"}}}}}
            changes:update(inventory)
            local host = assert(registry.get("kickside.contract:host_credential_eligibility"))
            host.meta.credential_eligibility = "kickside.users.binding:credential_eligibility"
            changes:update(host)
            local catalog_binding = assert(registry.get("kickside.users.test.security:security_scopes_binding"))
            catalog_binding.data.contracts[1].methods.list = "kickside.security.binding:list_scopes_func"
            changes:update(catalog_binding)
            local router = assert(registry.get("app:api"))
            router.data.middleware = {"token_auth"}
            router.data.post_middleware = {"endpoint_firewall"}
            router.data.options = {token_store = "kickside.users.security:tokens"}
            changes:update(router)
            changes:create({id = "app:bot_creation_admin_role", kind = "registry.entry",
                meta = {type = "kickside.security.role", title = "Administrator"},
                data = {role_id = "app.security:admin", protected = true}})
            changes:create({id = "app:bot_no_admin", kind = "security.policy", data = {
                groups = {"app:bot_no_admin"}, policy = {actions = "access", resources = "kickside.users.api:me.endpoint", effect = "allow"},
            }})
            test.is_nil(select(2, changes:apply()))
            human_id, admin_token = fixture({"app.security:admin", "app.security:scope_unrestricted"})
            local catalog = request("GET", "/api/users/assignable-scopes")
            test.eq(catalog.status_code, 200, tostring(catalog.body))
            local assignable = false
            for _, row in ipairs(assert(json.decode(catalog.body)).scopes) do
                if row.id == "app.security:admin" then assignable = true end
            end
            test.is_true(assignable, tostring(catalog.body) .. " descriptor=" .. assert(json.encode(assert(registry.get("app:bot_creation_admin_role")))))
        end)
        test.after_each(function()
            for _, token in ipairs(tokens) do test.not_nil((index.discard_minted(token))) end
            for _, id in ipairs(owned) do
                execute("DELETE FROM app_user_bot_accounts WHERE user_id=$1", {id})
                test.not_nil((lifecycle.delete(id)))
                execute("DELETE FROM app_user_bot_audit WHERE user_id=$1", {id})
            end
            test.is_nil(select(2, registry.apply_version(original)))
            owned, tokens = {}, {}
        end)
        test.it("BOT-ACCOUNT-ADMIN-CREATION creates one ordinary User marker and native audit with explicit empty groups", function()
            local response = create({full_name = "Project bot", groups = {}})
            test.eq(response.status_code, 201, tostring(response.body))
            local result = assert(json.decode(response.body)).user
            local id = result.user_id
            test.eq(result.bot_account, true)
            test.eq(result.email, id .. "@bots.invalid")
            test.eq(result.status, "active")
            local stored = assert(users.get(id))
            test.eq(stored.password_hash, consts.NO_PASSWORD)
            local current = assert(groups.get_user_with_groups(id))
            for _, group in ipairs(current.security_groups) do test.is_true(group ~= "app.security:user") end
            local markers = query("SELECT created_by FROM app_user_bot_accounts WHERE user_id=$1", {id})
            test.eq(#markers, 1); test.eq(markers[1].created_by, human_id)
            local audits = query("SELECT actor_id, operation, payload FROM app_user_bot_audit WHERE user_id=$1", {id})
            test.eq(#audits, 1); test.eq(audits[1].actor_id, human_id); test.eq(audits[1].operation, "create")
            test.is_nil(assert(json.decode(audits[1].payload)).password_hash)
            local listed = request("GET", "/api/users/bots")
            test.eq(listed.status_code, 200, tostring(listed.body))
            local found = false
            for _, bot in ipairs(assert(json.decode(listed.body)).users) do if bot.user_id == id then found = true end end
            test.is_true(found)
            local all = request("GET", "/api/users")
            test.eq(all.status_code, 200, tostring(all.body))
            local human_present = false
            for _, account in ipairs(assert(json.decode(all.body)).users) do
                if account.user_id == human_id then
                    human_present = true
                    test.is_nil(account.bot_account)
                    test.eq(account.email, human_id .. "@test.local")
                    test.eq(account.status, "active")
                end
            end
            test.is_true(human_present)
        end)
        test.it("returns the current account with the canonical id field", function()
            local response = request("GET", "/api/user/me")
            test.eq(response.status_code, 200, tostring(response.body))
            local user = assert(json.decode(response.body)).user
            test.eq(user.id, human_id)
            test.is_nil(user.user_id)
        end)
        test.it("BOT-ACCOUNT-ADMIN-CREATION admin-group bots still fail real password login", function()
            local response = create({full_name = "Admin bot", groups = {"app.security:admin"}})
            test.eq(response.status_code, 201, tostring(response.body))
            local result = assert(json.decode(response.body)).user
            local refused = request("POST", "/api/public/user/token", {email = result.email, password = "admin-bot-fixture"})
            test.eq(refused.status_code, 401, tostring(refused.body))
            test.is_false(assert(json.decode(refused.body)).success)
            test.eq(#query("SELECT user_id FROM kickside_user_sessions WHERE user_id=$1", {result.user_id}), 0)
        end)
        test.it("BOT-ACCOUNT-ADMIN-CREATION operators without management cannot create or discover bots", function()
            local _, token = fixture({"app:bot_no_admin"})
            rejected({full_name = "Forbidden bot", groups = {}}, 403, token)
            local response = request("GET", "/api/users/bots", nil, token)
            test.eq(response.status_code, 403, tostring(response.body))
        end)
        for _, field in ipairs({"user_id", "email", "password", "status", "created_by", "principal", "authorized_by", "kind", "bot_account"}) do
            test.it("BOT-ACCOUNT-ADMIN-CREATION rejects caller-controlled " .. field, function()
                local payload = {full_name = "Invalid bot", groups = {}}
                payload[field] = "forged"
                rejected(payload, 400)
            end)
        end
        test.it("BOT-ACCOUNT-ADMIN-CREATION requires explicit valid group arrays and a display name", function()
            for _, payload in ipairs({{full_name = "No groups"}, {full_name = "Invalid groups", groups = "admin"},
                {full_name = "Unknown group", groups = {"app:not_assignable"}}, {full_name = "Duplicate group", groups = {"app.security:admin", "app.security:admin"}},
                {full_name = "", groups = {}}, {full_name = 42, groups = {}}}) do rejected(payload, 400) end
        end)
        for _, table_name in ipairs({"app_users", "app_user_bot_accounts", "app_user_groups", "app_user_bot_audit"}) do
            test.it("BOT-ACCOUNT-ADMIN-CREATION " .. table_name .. " outages produce no partial ordinary User", function()
                local before = {count("app_users"), count("app_user_bot_accounts"), count("app_user_groups"), count("app_user_bot_audit")}
                local postgres = assert(registry.get("app:db")).kind == "db.sql.postgres"
                if postgres then
                    execute("CREATE FUNCTION bot_creation_write_outage() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''bot creation write unavailable''; END'")
                    execute("CREATE TRIGGER bot_creation_write_outage BEFORE INSERT ON " .. table_name .. " FOR EACH ROW EXECUTE FUNCTION bot_creation_write_outage()")
                else
                    execute("CREATE TRIGGER bot_creation_write_outage BEFORE INSERT ON " .. table_name .. " BEGIN SELECT RAISE(FAIL, 'bot creation write unavailable'); END")
                end
                local response = create({full_name = "Outage bot", groups = {"app.security:admin"}})
                if postgres then
                    execute("DROP TRIGGER bot_creation_write_outage ON " .. table_name)
                    execute("DROP FUNCTION bot_creation_write_outage()")
                else
                    execute("DROP TRIGGER bot_creation_write_outage")
                end
                test.eq(response.status_code, 500, tostring(response.body))
                test.is_false(assert(json.decode(response.body)).success)
                for position, name in ipairs({"app_users", "app_user_bot_accounts", "app_user_groups", "app_user_bot_audit"}) do
                    test.eq(count(name), before[position], name)
                end
            end)
        end
        test.it("BOT-ACCOUNT-ADMIN-CREATION incomplete host inventory withholds new creation and preserves existing humans", function()
            local before = assert(users.get(human_id))
            local entry = assert(registry.get("kickside.users:bot_account_inventory"))
            entry.meta.consumers = {{entries = {{entry = "app:missing_credential_boundary", kind = "function.lua"}}}}
            local changes = assert(registry.snapshot()):changes(); changes:update(entry)
            test.is_nil(select(2, changes:apply()))
            rejected({full_name = "Not ready", groups = {}}, 503)
            test.eq(assert(users.get(human_id)).password_hash, before.password_hash)
            test.eq(request("GET", "/api/user/me").status_code, 200)
        end)
    end)
end)}
