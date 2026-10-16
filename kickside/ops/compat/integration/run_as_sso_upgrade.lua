local test = require("test")
local errors = require("errors")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local security = require("security")
local contract = require("contract")
local provisioner = require("provisioner")
local session = require("session")
local users = require("user_repo")
local identities = require("identities_repo")
local index = require("session_index")
local plan = require("plan")
local USER = "compat_sso_passwordless"
local IDENTITY = {provider = "github", subject = "compat-sso-subject",
    email = "compat-sso@allowed.com", email_verified = true}

local function query(db, statement, args)
    local rows, err = db:query(statement, args)
    assert(not err, tostring(err))
    return rows
end

local function snapshot(db)
    return {
        account = query(db, "SELECT user_id,email,password_hash,status,auth_generation,created_at,updated_at FROM app_users WHERE user_id=$1", {USER}),
        groups = query(db, "SELECT user_id,group_id,source,created_at FROM app_user_groups WHERE user_id=$1 ORDER BY group_id", {USER}),
        identity = query(db, "SELECT id,provider,subject,user_id,email,email_verified,created_at FROM app_user_identities WHERE user_id=$1", {USER}),
    }
end

return {run = test.run_cases(function()
    test.describe("published SSO credential eligibility update", function()
        test.it("RA-C02 preserves the exact old bearer and account/link/group bytes, including SSO-first ordering", function()
            local db = assert(sql.get("app:db"))
            local _, schema_err = db:execute("CREATE TABLE IF NOT EXISTS compat_sso_update (id TEXT PRIMARY KEY, value TEXT NOT NULL)")
            test.is_nil(schema_err)
            local saved
            if plan.phase == "baseline" then
                local created, create_err = users.create_passwordless({user_id = USER, email = IDENTITY.email, status = "active"})
                test.is_nil(create_err); test.not_nil(created)
                local linked, link_err = provisioner.link(USER, IDENTITY)
                test.is_nil(link_err); test.not_nil(linked)
                local user, resolve_err = provisioner.resolve(IDENTITY)
                test.is_nil(resolve_err); test.eq(user.user_id, USER)
                local minted, mint_err = session.mint(user, {sso_provider = "github"})
                test.is_nil(mint_err); test.not_nil(minted.token)
                local token_key = assert(index.token_key(minted.token))
                local token_rows = query(db, "SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1", {token_key})
                saved = {token = minted.token, token_key = token_key, token_snapshot = token_rows[1].token_value,
                    state = snapshot(db)}
                local _, save_err = db:execute("INSERT INTO compat_sso_update (id,value) VALUES ('human',$1)", {assert(json.encode(saved))})
                test.is_nil(save_err)
            else
                saved = assert(json.decode(query(db, "SELECT value FROM compat_sso_update WHERE id='human'")[1].value))
            end
            local tokens = assert(security.token_store("kickside.users.security:tokens"))
            local actor, scope, token_err = tokens:validate(saved.token)
            tokens:close()
            test.is_nil(token_err); test.not_nil(scope); test.eq(actor:id(), USER)
            test.eq(query(db, "SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1", {saved.token_key})[1].token_value,
                saved.token_snapshot)
            test.eq(json.encode(snapshot(db)), json.encode(saved.state))
            if plan.phase == "lookup_guard" then
                local before_users = query(db, "SELECT COUNT(*) AS count FROM app_users")[1].count
                local before_links = query(db, "SELECT COUNT(*) AS count FROM app_user_identities")[1].count
                local before_sessions = query(db, "SELECT COUNT(*) AS count FROM kickside_user_sessions")[1].count
                local user, err = provisioner.resolve({provider = "github", subject = "lookup-outage-subject",
                    email = IDENTITY.email, email_verified = true})
                local _, restore_err = db:execute("ALTER TABLE compat_sso_unavailable_groups RENAME TO app_user_groups")
                test.is_nil(restore_err)
                test.is_nil(user)
                test.not_nil(err)
                test.contains(tostring(err), "app_user_groups", tostring(err))
                test.eq(query(db, "SELECT COUNT(*) AS count FROM app_users")[1].count, before_users)
                test.eq(query(db, "SELECT COUNT(*) AS count FROM app_user_identities")[1].count, before_links)
                test.eq(query(db, "SELECT COUNT(*) AS count FROM kickside_user_sessions")[1].count, before_sessions)
                test.eq(json.encode(snapshot(db)), json.encode(saved.state))
                local store = assert(security.token_store("kickside.users.security:tokens"))
                local retained_actor, retained_scope, retained_err = store:validate(saved.token)
                store:close()
                test.is_nil(retained_err); test.not_nil(retained_scope); test.eq(retained_actor:id(), USER)
            elseif plan.phase:match("_guard$") then
                local candidate = assert(crypto.random.uuid()) .. "@allowed.com"
                local settings = assert(contract.get("kickside.settings:settings")):open()
                for key, value in pairs({auto_provision = true, allowed_email_domains = {"allowed.com"}}) do
                    test.is_true(settings:set({namespace = "kickside.sso", key = key, value = value}).success)
                end
                local before_users = query(db, "SELECT COUNT(*) AS count FROM app_users")[1].count
                local before_links = query(db, "SELECT COUNT(*) AS count FROM app_user_identities")[1].count
                local user, err = provisioner.resolve({provider = "github", subject = "missing-guard-subject",
                    email = candidate, email_verified = true})
                test.is_nil(user)
                test.not_nil(err)
                test.is_true(errors.is(err, plan.phase == "missing_guard" and errors.NOT_FOUND or errors.INTERNAL), tostring(err))
                if plan.phase ~= "missing_guard" then
                    test.contains(tostring(err), "credential eligibility guard returns an invalid result")
                end
                test.eq(query(db, "SELECT COUNT(*) AS count FROM app_users")[1].count, before_users)
                test.eq(query(db, "SELECT COUNT(*) AS count FROM app_user_identities")[1].count, before_links)
            else
                local user, resolve_err = provisioner.resolve(IDENTITY)
                test.is_nil(resolve_err); test.eq(user.user_id, USER)
                local linked, link_err = provisioner.link(USER, IDENTITY)
                test.is_nil(link_err); test.eq(linked.user_id, USER)
                local minted, mint_err = session.mint(user, {sso_provider = "github"})
                test.is_nil(mint_err); test.not_nil(minted.token)
                test.eq(json.encode(snapshot(db)), json.encode(saved.state))
            end
            db:release()
        end)
    end)
end)}
