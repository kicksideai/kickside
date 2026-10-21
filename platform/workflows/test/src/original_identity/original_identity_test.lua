local test = require("test")
local funcs = require("funcs")
local security = require("security")
local run_identity = require("run_identity")

local function probe(args: any): any
    local identity, err = run_identity.load(args.id)
    return {identity = identity, error = err}
end

local function invoke(actor_id: string, admitted: any, root: string): any
    local actor, actor_err = security.new_actor(actor_id, {execution_identity = admitted})
    test.is_nil(actor_err)
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    test.is_nil(policy_err)
    local scope, scope_err = security.new_scope({policy})
    test.is_nil(scope_err)
    local result, err = funcs.new():with_actor(actor):with_scope(scope)
        :call("app:original_delivery_identity_probe", {id = root})
    test.is_nil(err)
    return result
end

local function live_probe(_args: any): any
    local automation = require("automation")
    local identity = require("execution_identity")
    local store = require("store")
    local installed, install_err = automation.install_type("app:admission_race_type", {})
    test.is_nil(install_err)
    local runtime, runtime_err = automation.get_runtime({id = installed.id})
    test.is_nil(runtime_err)
    local original = runtime.execution_identity
    local result, call_err = identity.run_as(original, "app:original_delivery_identity_live_loader", {id = installed.id})
    test.is_nil(call_err)
    test.is_nil(result.error)
    test.eq(result.identity.principal.id, original.principal.id)
    test.eq(result.identity.captured_at, original.captured_at)
    local db = store.open_db()
    local _, revoke_err = db:execute("UPDATE app_users SET status='suspended' WHERE user_id=$1",
        {original.principal.id})
    db:release()
    test.is_nil(revoke_err)
    local refused, refuse_err = identity.run_as(original, "app:original_delivery_identity_live_loader", {id = installed.id})
    db = store.open_db()
    local _, restore_err = db:execute("UPDATE app_users SET status='active' WHERE user_id=$1", {original.principal.id})
    db:release()
    test.is_nil(restore_err)
    test.is_nil(refused)
    test.not_nil(refuse_err)
    return true
end

local cases = test.run_cases(function()
    test.describe("workflow original delivery identity", function()
        test.it("resolves the original identity live and refuses it after revocation", function()
            local uuid = require("uuid")
            local store = require("store")
            local owner = "original-delivery-" .. uuid.v4()
            local db = store.open_db()
            local _, insert_err = db:execute("INSERT INTO app_users (user_id,email,full_name,password_hash,status)"
                .. " VALUES ($1,$2,$1,'x','active')", {owner, owner .. "@example.test"})
            db:release()
            test.is_nil(insert_err)
            local actor, actor_err = security.new_actor(owner, {})
            test.is_nil(actor_err)
            local policy, policy_err = security.policy("app:workflows_suite_policy")
            test.is_nil(policy_err)
            local scope, scope_err = security.new_scope({policy})
            test.is_nil(scope_err)
            local result, err = funcs.new():with_actor(actor):with_scope(scope)
                :call("app:original_delivery_identity_live_probe", {})
            test.is_nil(err)
            test.eq(result, true)
        end)

        test.it("keeps an admitted delivery identity after adoption", function()
            local admitted = {version = 2, principal = {kind = "user", id = "original-delivery-owner"},
                authorized_by = {kind = "user", id = "original-delivery-owner"},
                component_id = "delivery-automation", credential_id = "delivery-credential",
                link_id = "delivery-link", captured_at = "2026-10-01T00:00:00Z"}
            local result = invoke("original-delivery-owner", admitted, admitted.component_id)
            test.is_nil(result.error)
            test.eq(result.identity.principal.id, admitted.principal.id)
            test.eq(result.identity.authorized_by.id, admitted.authorized_by.id)
            test.eq(result.identity.component_id, admitted.component_id)
            test.eq(result.identity.credential_id, admitted.credential_id)
            test.eq(result.identity.link_id, admitted.link_id)
            test.eq(result.identity.captured_at, admitted.captured_at)
        end)

        test.it("keeps current identity selection for direct callers", function()
            local result = invoke("current-automation-owner", nil, "delivery-automation")
            test.is_nil(result.error)
            test.eq(result.identity.principal.id, "current-automation-owner")
            test.eq(result.identity.captured_at, "2026-10-02T00:00:00Z")
        end)

        test.it("does not treat another automation frame as delivery provenance", function()
            local admitted = {version = 2, principal = {kind = "user", id = "current-automation-owner"},
                authorized_by = {kind = "user", id = "current-automation-owner"},
                component_id = "another-automation", captured_at = "2026-10-01T00:00:00Z"}
            local result = invoke("current-automation-owner", admitted, "delivery-automation")
            test.is_nil(result.error)
            test.eq(result.identity.component_id, "delivery-automation")
            test.eq(result.identity.captured_at, "2026-10-02T00:00:00Z")
        end)

        test.it("rejects an admitted identity that does not match the actor", function()
            local admitted = {version = 2, principal = {kind = "user", id = "original-delivery-owner"},
                authorized_by = {kind = "user", id = "original-delivery-owner"},
                component_id = "delivery-automation", captured_at = "2026-10-01T00:00:00Z"}
            local result = invoke("current-automation-owner", admitted, "delivery-automation")
            test.is_nil(result.identity)
            test.not_nil(result.error)
        end)
    end)
end)
return {run = cases, probe = probe, live_probe = live_probe}
