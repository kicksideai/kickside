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

local function live_probe(args: any): any
    local automation = require("automation")
    local identity = require("execution_identity")
    local store = require("store")
    local installed, install_err = automation.install_type("app:admission_race_type", {})
    test.is_nil(install_err)
    local runtime, runtime_err = automation.get_runtime({id = installed.id})
    test.is_nil(runtime_err)
    local original = runtime.execution_identity
    if args.resume then
        local json = require("json")
        local db = store.open_db()
        local _, drive_err = db:execute("INSERT INTO kickside_automation_drive"
            .. " (automation_id,drive_key,source_kind,phase,enabled) VALUES ($1,'parked','timer','paused',false)",
            {installed.id})
        test.is_nil(drive_err)
        local _, ledger_err = db:execute([[INSERT INTO kickside_trigger_item_ledger
            (owner_id,source_port,item_key,identity_key,state,first_failed_at,last_failed_at,
             created_at,updated_at,execution_identity_json,identity_parked)
            VALUES ($1,'timer:parked','item','delivery','parked','2000-01-01T00:00:00Z',
                '2000-01-01T00:00:00Z','2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',$2,true)]],
            {installed.id,json.encode(original)})
        db:release()
        test.is_nil(ledger_err)
        local resumed, resume_err = automation.control(installed.id,
            {control="resume",drive_key="parked",request_id=require("uuid").v7()})
        test.is_nil(resume_err)
        test.not_nil(resumed)
        db = store.open_db()
        local rows, read_err = db:query("SELECT execution_identity_json,identity_parked,state"
            .. " FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND identity_key='delivery'",{installed.id})
        db:release()
        test.is_nil(read_err)
        test.eq(#rows,1)
        test.is_true(rows[1].identity_parked == false or rows[1].identity_parked == 0)
        test.eq(rows[1].state,"parked")
        test.eq(rows[1].execution_identity_json,json.encode(original))
        original = json.decode(rows[1].execution_identity_json)
    end
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
        for _, resumed in ipairs({false, true}) do
            test.it(resumed and "revalidates the retained identity after authorized resume of an existing park"
                or "resolves the original identity live and refuses it after revocation", function()
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
                    :call("app:original_delivery_identity_live_probe", {resume=resumed})
                test.is_nil(err)
                test.eq(result, true)
            end)
        end

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
