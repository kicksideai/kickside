local test = require("test")
local json = require("json")
local crypto = require("crypto")
local sql = require("sql")
local store = require("store")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local users = require("user_repo")
local lifecycle = require("user_lifecycle_repo")
local groups = require("user_group_sources_repo")
local component = require("component")
local identity = require("execution_identity")
local reconcile = require("trigger_reconcile")
local owned = {}
local components = {}
local policies = {}
local operator, bot, outsider, operator_group, deny_group
local root = "execution-root"
local owner = "kickside.automation:round"
local baseline = "app.security:run_as_membership_baseline"
local access = "app.security:run_as_membership_allow"
local resource = "app:run_as_membership_extension"

local function execute(statement, args)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(statement, args)
    db:release()
    assert(not err, tostring(err))
end

local function account(marked, memberships)
    local id = assert(crypto.random.uuid())
    test.not_nil((users.create_passwordless({user_id = id, email = id .. "@bots.invalid", status = "active"})))
    owned[#owned + 1] = id
    test.not_nil((groups.set_user_groups(id, memberships)))
    if marked then
        execute("INSERT INTO app_user_bot_accounts (user_id, created_by, created_at) VALUES ($1,$2,$3)",
            {id, operator, "2026-10-09T00:00:00Z"})
    end
    return id
end

local function grant(target, anchor, attached, effect)
    local bytes = identity.delegation_bytes("user", target, anchor)
    local id = identity.delegation_policy_id("user", target, anchor)
    if effect == "deny" then id = "app:deny_" .. assert(crypto.random.uuid()) end
    test.not_nil((reconcile.trigger()))
    local changes = assert(registry.snapshot()):changes()
    changes:create({id = id, kind = "security.policy",
        meta = {managed_by = "kickside.security", intent = "execution_delegation"},
        data = {groups = attached, policy = {actions = identity.DELEGATE_ACTION, resources = "*",
            effect = effect or "allow", conditions = {{field = "resource", operator = "eq", value = bytes}}}}})
    test.is_nil(select(2, changes:apply()))
    policies[#policies + 1] = id
    return id
end

local function component_root()
    local id = assert(crypto.random.uuid())
    execute("INSERT INTO kickside_components (component_id,impl_id) VALUES ($1,$2)", {id, "app:bot_test_root"})
    components[#components + 1] = id
    return id, {owner_id = "kickside.component", record_id = id}
end

local function root_access(id, subject_type, subject_id, mask)
    execute("INSERT INTO kickside_component_access (access_id,component_id,source_component_id,subject_type,subject_id,access_mask) VALUES ($1,$2,$3,$4,$5,$6)",
        {assert(crypto.random.uuid()), id, id, subject_type, subject_id, mask})
end

local function resolve(deferred, changes, caller, metadata)
    local args = {principal = {kind = "user", id = bot}, authorized_by = {kind = "user", id = operator}, execution_root = root}
    if deferred then args.deferred_owner = owner end
    for key, value in pairs(changes or {}) do args[key] = value end
    local actor = security.new_actor(caller or (deferred and "system:bot_test_worker" or operator), metadata or {})
    return funcs.new():with_actor(actor):with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
        :call("kickside.users.binding:scope_resolver_func", args)
end

local function allowed(deferred, changes, caller, metadata)
    local result, err = resolve(deferred, changes, caller, metadata)
    test.is_nil(err)
    test.not_nil(result)
    test.eq(result.principal.kind, "user")
    test.eq(result.principal.id, (changes and changes.principal or {}).id or bot)
    test.eq(result.actor_id, result.principal.id)
    return result
end

local function denied(deferred, changes, caller, metadata)
    local result, err = resolve(deferred, changes, caller, metadata)
    test.is_nil(result)
    test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
    return err
end

local function effect_count()
    local records = assert(store.get("app:bot_execution_effects"))
    local count, err = records:get("bot_effect:" .. bot)
    records:release()
    assert(not err, tostring(err))
    return count
end

local function selection_state(id)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT private_context,identity_generation,identity_hash,context_revision FROM kickside_components WHERE component_id=$1", {id})
    assert(not err, tostring(err))
    local audits, audit_err = db:query("SELECT record_json,request_id,identity_generation FROM kickside_execution_identity_audit WHERE component_id=$1 ORDER BY identity_generation", {id})
    db:release()
    assert(not audit_err, tostring(audit_err))
    return rows[1], audits
end

local function select_identity(id, target, request_id, expected, caller, metadata)
    local actor = assert(security.new_actor(caller or operator, metadata or {}))
    local executor = assert(funcs.new()):with_actor(actor):with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
    return executor:call("app:bot_identity_selection", {component_id = id, principal = target or {kind = "user", id = bot},
        request_id = request_id or "select-bot", expected_identity_generation = expected or 0})
end

local function selection_refused(id, target, request_id, expected, caller, metadata, kind)
    local before, audits = selection_state(id)
    local result, err = select_identity(id, target, request_id, expected, caller, metadata)
    test.is_nil(result)
    test.is_true(errors.is(err, kind or errors.PERMISSION_DENIED), tostring(err))
    local after, next_audits = selection_state(id)
    test.eq(after.private_context, before.private_context)
    test.eq(after.identity_generation, before.identity_generation)
    test.eq(after.identity_hash, before.identity_hash)
    test.eq(after.context_revision, before.context_revision)
    test.eq(#next_audits, #audits)
    return err
end

local function selectable_root(anchor)
    local id = component_root()
    grant(bot, anchor or id, {operator_group})
    test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
    root_access(id, "user", operator, 8)
    return id
end

local function admitted_execution()
    local id = component_root()
    grant(bot, id, {operator_group})
    test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
    root_access(id, "user", operator, 8)
    return {version = 2, principal = {kind = "user", id = bot}, authorized_by = {kind = "user", id = operator},
        component_id = id, captured_at = "2026-10-09T00:00:00Z"}
end

local function effect(admitted, capture)
    return identity.run_as(admitted, "app:bot_effect_probe", {capture = capture}, {deferred_owner = owner})
end

local function effect_refused(admitted, capture)
    local before = effect_count()
    local result, err = effect(admitted, capture)
    test.is_nil(result)
    test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
    test.eq(effect_count(), before)
end

local function define_capability_cases()
    for _, capability in ipairs({ "actor_create", "scope_read", "builder_security", "dispatch" }) do
        test.it("RA-H46 native " .. capability .. " removal refuses repeated bot effects and restoring it succeeds", function()
            local admitted = admitted_execution()
            local scope_name = allowed(false, {execution_root = {owner_id = "kickside.component", record_id = admitted.component_id}}).scope_name
            local missing = {
                actor_create = {action = "security.actor.create", resource = bot},
                scope_read = {action = "security.policy_group.get", resource = scope_name},
                builder_security = {action = "funcs.security", resource = "security"},
                dispatch = {action = "funcs.call", resource = "app:bot_effect_probe"},
            }
            local deny = missing[capability]
            local id = "app:bot_capability_" .. assert(crypto.random.uuid())
            test.not_nil((reconcile.trigger()))
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = id, kind = "security.policy", data = {policy = {
                actions = deny.action, resources = deny.resource, effect = "deny",
            }}})
            test.is_nil(select(2, changes:apply()))
            policies[#policies + 1] = id
            local worker_scope = assert(security.new_scope({assert(security.policy("app:test_runtime")), assert(security.policy(id))}))
            local caller = assert(funcs.new()):with_actor(assert(security.new_actor("system:bot_capability_worker"))):with_scope(worker_scope)
            for _ = 1, 2 do
                local result, err = caller:call("app:bot_capability_probe", {identity = admitted, owner = owner})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                test.eq(err:retryable(), false)
                test.eq(effect_count(), 0)
            end
            local restored, restore_err = effect(admitted)
            test.is_nil(restore_err, tostring(restore_err))
            test.eq(restored.actor_id, bot)
            test.eq(restored.nested.authorized_by.id, operator)
            test.eq(restored.nested.component_id, admitted.component_id)
            test.eq(effect_count(), 1)
        end)
    end
end

local function process_effect(admitted, scope)
    local row, row_err = identity.to_row(admitted)
    test.is_nil(row_err)
    test.not_nil(row)
    return funcs.new():with_actor(assert(security.new_actor("system:bot_process_worker")))
        :with_scope(scope or assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
        :call("app:bot_process_probe", {worker_ref = "proc://app:bot_process_effect", worker_runtime = "proc",
            target_id = "app:bot_process_effect", actor_id = row.actor_id, actor_context = row.actor_context})
end

local function define_process_cases()
    test.it("RA-H46 native supervised process executes once under the bot and retains its human authorizer/root", function()
        local admitted = admitted_execution()
        local result, err = process_effect(admitted)
        test.is_nil(err, tostring(err))
        test.eq(result.actor_id, bot)
        test.eq(result.nested.authorized_by.id, operator)
        test.eq(result.nested.component_id, admitted.component_id)
        test.eq(effect_count(), 1)
    end)
    test.it("RA-H46 native supervised process retains existing human self-execution without act-as grants", function()
        local id = component_root()
        root_access(id, "user", operator, 8)
        test.not_nil((groups.set_user_groups(operator, {baseline, access})))
        local records = assert(store.get("app:bot_execution_effects"))
        test.is_nil(select(2, records:set("bot_effect:" .. operator, 0)))
        records:release()
        local admitted = {version = 2, principal = {kind = "user", id = operator},
            authorized_by = {kind = "user", id = operator}, component_id = id,
            captured_at = "2026-10-09T00:00:00Z"}
        local result, err = process_effect(admitted)
        test.is_nil(err, tostring(err))
        test.eq(result.actor_id, operator)
        test.eq(result.nested.authorized_by.id, operator)
        test.eq(result.nested.component_id, id)
        test.eq(effect_count(), 0)
        records = assert(store.get("app:bot_execution_effects"))
        test.eq((records:get("bot_effect:" .. operator)), 1)
        records:release()
    end)
    for _, reduction in ipairs({"disabled", "delegation_removed", "authorizer_deleted", "root_admin_removed"}) do
        test.it("RA-H46 native supervised process refuses before effects after " .. reduction, function()
            local admitted = admitted_execution()
            if reduction == "disabled" then
                execute("UPDATE app_users SET status='inactive' WHERE user_id=$1", {bot})
            elseif reduction == "delegation_removed" then
                test.not_nil((groups.set_user_groups(operator, {baseline})))
            elseif reduction == "authorizer_deleted" then
                test.not_nil((lifecycle.delete_if_exists(operator)))
            else
                execute("DELETE FROM kickside_component_access WHERE component_id=$1 AND subject_id=$2", {admitted.component_id, operator})
            end
            for _ = 1, 2 do
                local result, err = process_effect(admitted)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                test.eq(err:retryable(), false)
                test.eq(effect_count(), 0)
            end
        end)
    end
    for _, capability in ipairs({
        {action = "process.context", resource = "context"},
        {action = "process.security", resource = "security"},
        {action = "process.spawn", resource = "app:bot_process_effect"},
        {action = "process.spawn.monitored", resource = "app:bot_process_effect"},
        {action = "process.spawn.linked", resource = "app:bot_process_effect"},
        {action = "process.host", resource = "app:processes"},
    }) do
        test.it("RA-H46 native supervised " .. capability.action .. " removal refuses twice and restoration preserves identity", function()
            local admitted = admitted_execution()
            local id = "app:bot_process_capability_" .. assert(crypto.random.uuid())
            test.not_nil((reconcile.trigger()))
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = id, kind = "security.policy", data = {policy = {
                actions = capability.action, resources = capability.resource, effect = "deny",
            }}})
            test.is_nil(select(2, changes:apply()))
            policies[#policies + 1] = id
            local worker_scope = assert(security.new_scope({assert(security.policy("app:test_runtime")), assert(security.policy(id))}))
            for _ = 1, 2 do
                local result, err = process_effect(admitted, worker_scope)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "projection_process_authority")
                test.eq(err:details().action, capability.action)
                test.eq(err:details().resource, capability.resource)
                test.eq(effect_count(), 0)
            end
            local restored, restore_err = process_effect(admitted)
            test.is_nil(restore_err, tostring(restore_err))
            test.eq(restored.actor_id, bot)
            test.eq(restored.nested.authorized_by.id, operator)
            test.eq(restored.nested.component_id, admitted.component_id)
            test.eq(effect_count(), 1)
        end)
    end
end

local function define_selection_cases()
        test.it("RA-H13 native Component self-selection preserves the human path without any delegation", function()
            local id = component_root()
            root_access(id, "user", operator, 8)
            local result, err = select_identity(id, {kind = "user", id = operator})
            test.is_nil(err, tostring(err))
            test.eq(result.principal.id, operator)
            test.eq(assert(component.get_identity_receipt(id)).execution_identity.authorized_by.id, operator)
        end)
        test.it("RA-H14 native Component SET uses the same delegation mechanism for an ordinary human target", function()
            local id = component_root()
            grant(outsider, id, {operator_group})
            root_access(id, "user", operator, 8)
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            local result, err = select_identity(id, {kind = "user", id = outsider})
            test.is_nil(err, tostring(err))
            test.eq(result.principal.id, outsider)
            test.eq(assert(component.get_identity_receipt(id)).execution_identity.authorized_by.id, operator)
        end)
        for _, field in ipairs({"credential_id", "link_id"}) do
            test.it("RA-H21 native Component SET refuses replacement of a stored " .. field, function()
                local id = component_root()
                root_access(id, "user", operator, 8)
                local prior = {version = 2, principal = {kind = "user", id = operator},
                    authorized_by = {kind = "user", id = operator}, component_id = id,
                    captured_at = "2026-10-09T00:00:00Z"}
                prior[field] = "prior-restriction"
                execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2",
                    {assert(json.encode({_execution_identity = prior})), id})
                selection_refused(id, {kind = "user", id = operator}, nil, nil, nil,
                    {[field] = "replacement-restriction"})
            end)
            test.it("RA-H19 native Component SET refuses replay that silently adds a " .. field, function()
                local id = component_root()
                root_access(id, "user", operator, 8)
                test.not_nil((select_identity(id, {kind = "user", id = operator})))
                selection_refused(id, {kind = "user", id = operator}, nil, nil, nil,
                    {[field] = "new-restriction"}, errors.CONFLICT)
            end)
        end
        test.it("RA-H21 native Component SET retains caller credential and link restrictions on self-selection", function()
            local id = component_root()
            root_access(id, "user", operator, 8)
            local result, err = select_identity(id, {kind = "user", id = operator}, nil, nil, nil,
                {credential_id = "caller-credential", link_id = "caller-link"})
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            local stored = assert(component.get_identity_receipt(id)).execution_identity
            test.eq(stored.credential_id, "caller-credential")
            test.eq(stored.link_id, "caller-link")
            local again, replay_err = select_identity(id, {kind = "user", id = operator}, nil, nil, nil,
                {credential_id = "caller-credential", link_id = "caller-link"})
            test.is_nil(replay_err, tostring(replay_err))
            test.eq(again.changes_made, false)
            local _, audits = selection_state(id)
            test.eq(#audits, 1)
            test.contains(audits[1].record_json, "caller-credential")
            test.contains(audits[1].record_json, "caller-link")
        end)
        test.it("RA-H20 native Component SET cannot turn an admitted bot frame into its own authorizer", function()
            local admitted = admitted_execution()
            root_access(admitted.component_id, "user", bot, 8)
            selection_refused(admitted.component_id, nil, nil, nil, bot, {execution_identity = admitted})
            local other = component_root()
            root_access(other, "user", bot, 8)
            selection_refused(other, nil, nil, nil, bot, {execution_identity = admitted})
        end)
        test.it("RA-H14 native Component SET admits exact-root delegation and the stored identity makes a real effect", function()
            local id = selectable_root()
            local result, err = select_identity(id)
            test.is_nil(err, tostring(err))
            test.eq(result.identity_generation, 1)
            test.eq(result.principal.id, bot)
            local receipt = assert(component.get_identity_receipt(id))
            test.eq(receipt.execution_identity.principal.id, bot)
            test.eq(receipt.execution_identity.authorized_by.id, operator)
            test.eq(receipt.execution_identity.component_id, id)
            local _, audits = selection_state(id)
            test.eq(#audits, 1)
            test.eq(audits[1].request_id, "select-bot")
            test.contains(audits[1].record_json, "user:" .. operator)
            test.contains(audits[1].record_json, "user:" .. bot)
            local effect_result, effect_err = effect(receipt.execution_identity)
            test.is_nil(effect_err, tostring(effect_err))
            test.eq(effect_result.actor_id, bot)
            test.eq(effect_count(), 1)
        end)
        test.it("RA-H14 native all-root delegation admits two distinct Component SET roots", function()
            local id = selectable_root("*")
            test.not_nil((select_identity(id)))
            local other = component_root()
            root_access(other, "user", operator, 8)
            test.not_nil((select_identity(other)))
        end)
        test.it("RA-H08 native Component SET never borrows the caller's unrestricted harness authority", function()
            local id = component_root()
            root_access(id, "user", operator, 8)
            selection_refused(id)
        end)
        test.it("RA-H09 native Component SET refuses another root's valid grant", function()
            local id = selectable_root("another-root")
            selection_refused(id)
        end)
        test.it("RA-H10 native Component SET honors cross-group deny over exact and all-root grants", function()
            local id = selectable_root("*")
            grant(bot, id, {deny_group}, "deny")
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group, deny_group})))
            selection_refused(id)
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            test.not_nil((select_identity(id)))
        end)
        test.it("RA-H08 native Component SET requires live human ADMIN even with bot and worker ACLs", function()
            local id = selectable_root()
            execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id})
            root_access(id, "user", bot, 15)
            root_access(id, "user", "system:bot_test_worker", 15)
            root_access(id, "user", operator, 2)
            selection_refused(id)
        end)
        test.it("RA-H31 native Component SET refuses forged authorizer and group metadata", function()
            local id = selectable_root()
            root_access(id, "user", outsider, 8)
            selection_refused(id, nil, nil, nil, outsider, {user_id = operator, security_groups = {operator_group}})
        end)
        for _, target in ipairs({"bot", "authorizer"}) do
            test.it("RA-H12 native Component SET refuses disabled " .. target .. " without audit or mutation", function()
                local id = selectable_root()
                test.not_nil((lifecycle.update(target == "bot" and bot or operator, {status = "inactive"})))
                selection_refused(id)
            end)
        end
        test.it("RA-H19 native Component SET retains same-request replay and rejects changed digest and stale generation", function()
            local id = selectable_root()
            test.not_nil((select_identity(id)))
            local again, err = select_identity(id)
            test.is_nil(err, tostring(err))
            test.eq(again.changes_made, false)
            test.eq(again.identity_generation, 1)
            selection_refused(id, nil, "other-request", 0, nil, nil, errors.CONFLICT)
            selection_refused(id, nil, "select-bot", 1, nil, nil, errors.CONFLICT)
            local _, audits = selection_state(id)
            test.eq(#audits, 1)
        end)
        test.it("RA-H07 native Component SET rechecks live reduction even for a formerly successful request", function()
            local id = selectable_root()
            test.not_nil((select_identity(id)))
            test.not_nil((groups.set_user_groups(operator, {baseline})))
            selection_refused(id)
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            test.not_nil((select_identity(id)))
        end)
        test.it("RA-H45 native Component SET propagates Users lookup failure before any identity mutation", function()
            local id = selectable_root()
            execute("ALTER TABLE app_users RENAME TO unavailable_selection_users")
            local ok, result, err = pcall(select_identity, id)
            execute("ALTER TABLE unavailable_selection_users RENAME TO app_users")
            if not ok then error(result) end
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(err:retryable(), true)
            local state, audits = selection_state(id)
            test.eq(state.identity_generation, 0)
            test.eq(#audits, 0)
            test.not_nil((select_identity(id)))
        end)
end

local function define_delegation_cases()
        for _, deferred in ipairs({false, true}) do
            local boundary = deferred and "deferred" or "immediate"
            test.it("RA-H07 " .. boundary .. " matching policy requires authorizer group membership", function()
                grant(bot, root, {operator_group})
                denied(deferred)
                test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
                local result = allowed(deferred)
                test.eq(result.meta.user_id, bot)
                test.eq(#result.groups, 2)
                test.eq(assert(identity.scope_from_groups(result.scope_groups or {}, result.scope_policy_ids)):evaluate(security.new_actor(bot), "access", resource), "allow")
                test.not_nil((groups.set_user_groups(operator, {baseline})))
                denied(deferred)
            end)
            test.it("RA-H08 " .. boundary .. " broad ambient authority cannot spend an ungranted authorizer", function()
                denied(deferred)
                grant(bot, root, {operator_group})
                test.not_nil((groups.set_user_groups(outsider, {baseline, operator_group})))
                denied(deferred)
            end)
            test.it("RA-H09 " .. boundary .. " root-specific policy refuses another root and target", function()
                grant(bot, root, {operator_group})
                test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
                allowed(deferred)
                denied(deferred, {execution_root = root .. "-other"})
                denied(deferred, {principal = {kind = "user", id = outsider}})
            end)
            test.it("RA-H09 " .. boundary .. " explicit all-roots policy allows distinct roots", function()
                grant(bot, "*", {operator_group})
                test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
                allowed(deferred)
                allowed(deferred, {execution_root = root .. "-other"})
            end)
            test.it("RA-H10 " .. boundary .. " exact-root denial wins over all-roots allowance across groups", function()
                grant(bot, "*", {operator_group})
                grant(bot, root, {deny_group}, "deny")
                for _, memberships in ipairs({{baseline, operator_group, deny_group}, {deny_group, operator_group, baseline}}) do
                    test.not_nil((groups.set_user_groups(operator, memberships)))
                    denied(deferred)
                    allowed(deferred, {execution_root = root .. "-other"})
                end
            end)
            test.it("RA-H10 " .. boundary .. " all-roots denial wins over exact-root allowance", function()
                grant(bot, root, {operator_group})
                grant(bot, "*", {deny_group}, "deny")
                test.not_nil((groups.set_user_groups(operator, {baseline, operator_group, deny_group})))
                denied(deferred)
            end)
            test.it("RA-H12 " .. boundary .. " disabled bot refuses next live resolution", function()
                grant(bot, root, {operator_group})
                test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
                allowed(deferred)
                test.not_nil((lifecycle.update(bot, {status = "inactive"})))
                denied(deferred)
            end)
            test.it("RA-H22 " .. boundary .. " bot access reduction changes the next derived native scope", function()
                grant(bot, root, {operator_group})
                test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
                local before = allowed(deferred)
                test.eq(assert(identity.scope_from_groups(before.scope_groups or {}, before.scope_policy_ids)):evaluate(security.new_actor(bot), "access", resource), "allow")
                test.not_nil((groups.set_user_groups(bot, {baseline})))
                local after = allowed(deferred)
                test.eq(after.scope_name, baseline)
                test.eq(assert(identity.scope_from_groups(after.scope_groups or {}, after.scope_policy_ids)):evaluate(security.new_actor(bot), "access", resource), "undefined")
            end)
        end
        test.it("RA-H07 live policy removal denies without relying on a cached positive decision", function()
            local policy = grant(bot, root, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            allowed(true)
            test.not_nil((reconcile.trigger()))
            local changes = assert(registry.snapshot()):changes()
            changes:delete(policy)
            test.is_nil(select(2, changes:apply()))
            denied(true)
        end)
        test.it("RA-H12 inactive and deleted recorded authorizers deny despite broad worker authority", function()
            grant(bot, root, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            allowed(true)
            test.not_nil((lifecycle.update(operator, {status = "inactive"})))
            denied(true)
            test.not_nil((lifecycle.delete(operator)))
            denied(true)
            test.eq(assert(users.get(bot)).status, "active")
        end)
        test.it("RA-H13 human self-selection requires no delegation policy", function()
            allowed(false, {principal = {kind = "user", id = operator}})
            allowed(true, {principal = {kind = "user", id = operator}})
        end)
        test.it("RA-H08 immediate caller cannot forge the recorded authorizer through arguments or actor metadata", function()
            grant(bot, root, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            denied(false, nil, outsider, {user_id = operator, principal = {kind = "user", id = operator}, scope_name = operator_group})
            allowed(false, nil, operator, {user_id = outsider, security_groups = {deny_group}})
        end)
        test.it("RA-H08 actual root ADMIN and act-as authority remain independent of the worker and bot ACLs", function()
            local id, descriptor = component_root()
            grant(bot, id, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            root_access(id, "user", "system:bot_test_worker", 15)
            root_access(id, "user", bot, 15)
            denied(true, {execution_root = descriptor})
            root_access(id, "user", operator, 8)
            allowed(true, {execution_root = descriptor})
            execute("DELETE FROM kickside_component_access WHERE component_id=$1 AND subject_type=$2 AND subject_id=$3", {id, "user", operator})
            denied(true, {execution_root = descriptor})
        end)
        test.it("RA-H07 real group root ADMIN follows the recorded authorizer's live memberships", function()
            local id, descriptor = component_root()
            root_access(id, "group", deny_group, 8)
            grant(bot, id, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group, deny_group})))
            allowed(true, {execution_root = descriptor})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            denied(true, {execution_root = descriptor})
            test.not_nil((groups.set_user_groups(operator, {baseline, deny_group})))
            denied(true, {execution_root = descriptor})
        end)
        test.it("RA-H45 actual root ACL read outage retains an infrastructure failure without a worker fallback", function()
            local id, descriptor = component_root()
            grant(bot, id, {operator_group})
            root_access(id, "user", operator, 8)
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            allowed(true, {execution_root = descriptor})
            execute("ALTER TABLE kickside_component_access RENAME TO unavailable_bot_root_access")
            local ok, result, err = pcall(resolve, true, {execution_root = descriptor})
            execute("ALTER TABLE unavailable_bot_root_access RENAME TO kickside_component_access")
            if not ok then error(result) end
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(err:retryable(), true)
            allowed(true, {execution_root = descriptor})
        end)
end

local function define_effect_cases()
        test.it("RA-H20 real native dispatch and nested capture retain bot executor, human authorizer and root", function()
            local admitted = admitted_execution()
            local result, err = effect(admitted)
            test.is_nil(err)
            test.eq(result.actor_id, bot)
            test.eq(result.meta.user_id, bot)
            test.eq(result.meta.execution_identity.authorized_by.id, operator)
            test.eq(result.nested.principal.id, bot)
            test.eq(result.nested.authorized_by.id, operator)
            test.eq(result.nested.component_id, admitted.component_id)
            test.eq(effect_count(), 1)
        end)
        test.it("RA-H20 native nested capture refuses principal and root substitution before another effect", function()
            local admitted = admitted_execution()
            test.not_nil((effect(admitted)))
            effect_refused(admitted, {principal = {kind = "user", id = outsider}})
            effect_refused(admitted, {component_id = assert(crypto.random.uuid())})
            test.eq(effect_count(), 1)
        end)
        test.it("RA-H35 bot disable between native dispatches retains the first effect and prevents the second", function()
            local admitted = admitted_execution()
            test.not_nil((effect(admitted)))
            test.eq(effect_count(), 1)
            test.not_nil((lifecycle.update(bot, {status = "inactive"})))
            effect_refused(admitted)
        end)
        for _, reduction in ipairs({"bot resource", "authorizer delegation", "authorizer root ADMIN"}) do
            test.it("RA-H36 " .. reduction .. " reduction between native dispatches makes no next effect", function()
                local admitted = admitted_execution()
                test.not_nil((effect(admitted)))
                if reduction == "bot resource" then
                    test.not_nil((groups.set_user_groups(bot, {baseline})))
                elseif reduction == "authorizer delegation" then
                    test.not_nil((groups.set_user_groups(operator, {baseline})))
                else
                    execute("DELETE FROM kickside_component_access WHERE component_id=$1 AND subject_type=$2 AND subject_id=$3",
                        {admitted.component_id, "user", operator})
                end
                effect_refused(admitted)
            end)
        end
        test.it("RA-H37 deleting a non-authorizing creator preserves native work while deleting the authorizer stops it", function()
            local creator = account(false, {baseline})
            execute("UPDATE app_user_bot_accounts SET created_by=$1 WHERE user_id=$2", {creator, bot})
            local admitted = admitted_execution()
            test.not_nil((effect(admitted)))
            test.not_nil((lifecycle.delete(creator)))
            test.not_nil((effect(admitted)))
            test.eq(effect_count(), 2)
            test.not_nil((lifecycle.delete(operator)))
            effect_refused(admitted)
        end)
        test.it("RA-H11 canonical policy IDs and resources distinguish delimiter-like target and root values", function()
            local values = {
                identity.delegation_bytes("user", bot, root),
                identity.delegation_bytes("user", bot .. "-suffix", root),
                identity.delegation_bytes("user", bot, root .. "-suffix"),
                identity.delegation_bytes("group", bot, root),
                identity.delegation_bytes("user", bot, "*"),
            }
            local ids = {
                identity.delegation_policy_id("user", bot, root),
                identity.delegation_policy_id("user", bot .. "-suffix", root),
                identity.delegation_policy_id("user", bot, root .. "-suffix"),
                identity.delegation_policy_id("group", bot, root),
                identity.delegation_policy_id("user", bot, "*"),
            }
            for i = 1, #values do
                for j = i + 1, #values do
                    test.is_false(values[i] == values[j])
                    test.is_false(ids[i] == ids[j])
                end
            end
            grant(bot, root .. "/partition:target", {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            allowed(true, {execution_root = root .. "/partition:target"})
            denied(true, {execution_root = root .. "/partition:target-suffix"})
        end)
end

local function define_host_cases()
        local function validate_target(target, anchor, meta)
            local actor = security.new_actor(outsider, meta or {})
            local scope = security.new_scope({assert(security.policy("app:delegation_validation_caller"))})
            return funcs.new():with_actor(actor):with_scope(scope):call("app.security:delegation_validator",
                {principal = {kind = "user", id = target}, root = anchor})
        end
        for _, marked in ipairs({true, false}) do
            test.it("RA-H06 host validation accepts a live ordinary " .. (marked and "bot" or "human") .. " target at an existing root", function()
                local anchor = component_root()
                local result, err = validate_target(marked and bot or operator, anchor)
                test.is_nil(err)
                test.eq(result.success, true)
            end)
        end
        test.it("RA-H06 host validation supports an explicit all-root grant without inventing a root", function()
            local result, err = validate_target(bot, "*")
            test.is_nil(err)
            test.eq(result.success, true)
        end)
        test.it("RA-H06 host validation does not substitute an email alias for a canonical principal", function()
            local result, err = validate_target(bot .. "@bots.invalid", component_root())
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("RA-H06 host validation refuses inactive targets using live Users status", function()
            test.not_nil((lifecycle.update(bot, {status = "inactive"})))
            local result, err = validate_target(bot, component_root())
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("RA-H06 host validation ignores forged actor metadata when the requested target is absent", function()
            local absent = assert(crypto.random.uuid())
            local result, err = validate_target(absent, component_root(), {user_id = bot, principal = {kind = "user", id = bot}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("RA-H06 host validation requires a real root before generating a grant", function()
            local result, err = validate_target(bot, assert(crypto.random.uuid()))
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
        end)
        test.it("RA-H45 host Component storage outage remains a typed failure", function()
            local anchor = component_root()
            execute("ALTER TABLE kickside_components RENAME TO fixture_unavailable_components", {})
            local _, source_err = component.list_system({component_ids = {anchor}, include = {meta = false, private_context = false}, limit = 1})
            local result, err = validate_target(bot, anchor)
            execute("ALTER TABLE fixture_unavailable_components RENAME TO kickside_components", {})
            test.is_nil(result)
            test.not_nil(err)
            test.not_nil(source_err)
            test.eq(err:kind(), source_err:kind())
            test.eq(err:retryable(), source_err:retryable())
            test.contains(tostring(err), "kickside_components")
        end)
        test.it("RA-H45 host Users storage outage keeps the existing typed infrastructure envelope", function()
            local anchor = component_root()
            execute("ALTER TABLE app_users RENAME TO fixture_unavailable_users", {})
            local result, err = validate_target(bot, anchor)
            execute("ALTER TABLE fixture_unavailable_users RENAME TO app_users", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(err:retryable(), true)
        end)
end

local function install_selected(id, selected, request_id, caller, title, metadata)
    local actor = assert(security.new_actor(caller or operator, metadata or {}))
    local executor = assert(funcs.new()):with_actor(actor):with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
    return executor:call("app:bot_install_probe", {component_id = id, principal = selected or {kind = "user", id = bot},
        request_id = request_id or ("selected:" .. id), title = title})
end

local function install_operator_access()
    local id = "app:install_operator_" .. assert(crypto.random.uuid())
    test.not_nil((reconcile.trigger()))
    local changes = assert(registry.snapshot()):changes()
    changes:create({id = id, kind = "security.policy", data = {groups = {operator_group}, policy = {
        actions = {"access", "registry.get", "registry.find", "funcs.call", "funcs.security", "contract.get", "contract.open", "contract.call", "contract.security"},
        resources = {"kickside.component:*", "kickside.automation:*", "kickside.contract:scope_resolver", "resolve", "kickside.users.binding:scope_resolver_func", "kickside.users.binding:subject_lookup", "kickside.mcp:credential_restriction", "kickside.identity:link_get", "security", "verify_identity_command", "kickside.users:scope_resolver_binding", "app:prepared_bot_task"}, effect = "allow"}}})
    local db_policy = id .. "_db"
    changes:create({id = db_policy, kind = "security.policy", data = {groups = {operator_group},
        policy = {actions = "db.get", resources = "app:db", effect = "allow"}}})
    local actor_policy = id .. "_actors"
    changes:create({id = actor_policy, kind = "security.policy", data = {groups = {operator_group},
        policy = {actions = "security.actor.create", resources = {operator, bot}, effect = "allow"}}})
    local scope_policy = id .. "_scopes"
    changes:create({id = scope_policy, kind = "security.policy", data = {groups = {operator_group},
        policy = {actions = "security.policy_group.get", resources = "*", effect = "allow"}}})
    test.is_nil(select(2, changes:apply()))
    policies[#policies + 1] = id
    policies[#policies + 1] = db_policy
    policies[#policies + 1] = actor_policy
    policies[#policies + 1] = scope_policy
end

local function caller_restriction(field, whitelist)
    local ref = assert(crypto.random.uuid())
    if field == "credential_id" then
        execute("INSERT INTO kickside_mcp_credentials (credential_id,token_hash,token_prefix,actor_id,created_at,updated_at,execution_identity_json) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            {ref, ref, "fixture", operator, 1, 1, assert(json.encode({version = 2,
                principal = {kind = "user", id = operator}, authorized_by = {kind = "user", id = operator},
                captured_at = "2026-10-10T00:00:00Z", credential_id = ref}))})
        if whitelist then
            execute("UPDATE kickside_mcp_credentials SET whitelist_json=$1 WHERE credential_id=$2",
                {assert(json.encode(whitelist)), ref})
        end
    else
        execute("INSERT INTO kickside_external_links (link_id,provider,external_id,user_id) VALUES ($1,$2,$3,$4)",
            {ref, "fixture", ref, operator})
    end
    return ref
end

local function command_identity(id, principal, request_id, generation, caller, metadata)
    local actor = assert(security.new_actor(caller or operator, metadata or {}))
    local executor = assert(funcs.new()):with_actor(actor):with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
    return executor:call("app:bot_identity_command_probe", {component_id = id, principal = principal,
        request_id = request_id, expected_identity_generation = generation})
end

local function restricted_carrier()
    local id = assert(crypto.random.uuid())
    components[#components + 1] = id
    install_operator_access()
    test.not_nil((groups.set_user_groups(operator, {baseline, access, operator_group})))
    test.not_nil((install_selected(id, {kind = "user", id = operator})))
    local credential = caller_restriction("credential_id", {id})
    local link = caller_restriction("link_id")
    local result, err = command_identity(id, {kind = "user", id = operator}, "carrier:" .. id, 1, nil,
        {credential_id = credential, link_id = link})
    test.is_nil(err, tostring(err))
    test.eq(result.state, "succeeded")
    return assert(component.get_identity_receipt(id)).execution_identity
end

local function carrier_frame(carrier)
    local frame, err = identity.resolve(carrier, {deferred_owner = owner})
    test.is_nil(err, tostring(err))
    test.not_nil(frame)
    test.eq(frame.actor:id(), operator)
    local meta = frame.actor:meta()
    test.eq(meta.execution_identity.principal.id, operator)
    test.eq(meta.execution_identity.authorized_by.id, operator)
    test.eq(meta.execution_identity.component_id, carrier.component_id)
    test.eq(meta.execution_identity.credential_id, carrier.credential_id)
    test.eq(meta.execution_identity.link_id, carrier.link_id)
    return frame
end

local function carrier_refused(carrier)
    for _ = 1, 2 do
        local frame, err = identity.resolve(carrier, {deferred_owner = owner})
        test.is_nil(frame)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        test.eq(effect_count(), 0)
    end
end

local function define_restriction_cases()
    test.it("BOT-NONEMPTY-RESTRICTION-CARRIER constructs the native human frame with both exact owner references and a nonempty path ceiling", function()
        local carrier = restricted_carrier()
        local frame = carrier_frame(carrier)
        local prefixes = assert(component.resolve_path_prefixes({carrier.component_id}))
        test.eq(#prefixes, 1)
        test.eq(#frame.meta.access_filter.prefixes, 1)
        test.eq(frame.meta.access_filter.prefixes[1], prefixes[1])
        test.eq(frame.scope:evaluate(frame.actor, "registry.apply", "app:carrier_fixture"), "deny")
        test.eq(frame.meta.credential_id, carrier.credential_id)
        test.eq(frame.meta.link_id, carrier.link_id)
        local records = assert(store.get("app:bot_execution_effects"))
        test.is_nil(select(2, records:set("bot_effect:" .. operator, 0)))
        records:release()
        local result, effect_err = effect(carrier)
        test.is_nil(effect_err, tostring(effect_err))
        test.eq(result.actor_id, operator)
        test.eq(result.nested.principal.id, operator)
        test.eq(result.nested.authorized_by.id, operator)
        test.eq(result.nested.component_id, carrier.component_id)
        test.eq(result.nested.credential_id, carrier.credential_id)
        test.eq(result.nested.link_id, carrier.link_id)
        test.eq(result.meta.access_filter.prefixes[1], prefixes[1])
        test.eq(assert(component.get_identity_receipt(carrier.component_id)).execution_identity.credential_id, carrier.credential_id)
        test.eq(effect_count(), 0)
    end)
    test.it("BOT-NONEMPTY-RESTRICTION-CARRIER reloads a changed nonempty whitelist without widening or rewriting the carrier", function()
        local carrier = restricted_carrier()
        local before = carrier_frame(carrier).meta.access_filter.prefixes[1]
        local other = assert(crypto.random.uuid())
        components[#components + 1] = other
        test.not_nil((install_selected(other, {kind = "user", id = operator})))
        execute("UPDATE kickside_mcp_credentials SET whitelist_json=$1 WHERE credential_id=$2",
            {assert(json.encode({other})), carrier.credential_id})
        local frame = carrier_frame(carrier)
        local prefixes = assert(component.resolve_path_prefixes({other}))
        test.eq(#prefixes, 1)
        test.eq(#frame.meta.access_filter.prefixes, 1)
        test.eq(frame.meta.access_filter.prefixes[1], prefixes[1])
        test.is_false(before == prefixes[1])
        test.eq(assert(component.get_identity_receipt(carrier.component_id)).execution_identity.credential_id, carrier.credential_id)
    end)
    test.it("BOT-NONEMPTY-RESTRICTION-CARRIER keeps a stale nonempty whitelist deny-all instead of dropping its filter", function()
        local carrier = restricted_carrier()
        carrier_frame(carrier)
        execute("UPDATE kickside_mcp_credentials SET whitelist_json=$1 WHERE credential_id=$2",
            {assert(json.encode({assert(crypto.random.uuid())})), carrier.credential_id})
        local frame = carrier_frame(carrier)
        test.not_nil(frame.meta.access_filter)
        test.eq(#frame.meta.access_filter.prefixes, 0)
    end)
    for _, mutation in ipairs({
        {label = "revoked credential", statement = "UPDATE kickside_mcp_credentials SET status='revoked' WHERE credential_id=$1", field = "credential_id"},
        {label = "expired credential", statement = "UPDATE kickside_mcp_credentials SET expires_at=1 WHERE credential_id=$1", field = "credential_id"},
        {label = "deleted credential", statement = "DELETE FROM kickside_mcp_credentials WHERE credential_id=$1", field = "credential_id"},
        {label = "deleted external link", statement = "DELETE FROM kickside_external_links WHERE link_id=$1", field = "link_id"},
    }) do
        test.it("BOT-NONEMPTY-RESTRICTION-CARRIER refuses the next native boundary after " .. mutation.label, function()
            local carrier = restricted_carrier()
            carrier_frame(carrier)
            local stored, audits = selection_state(carrier.component_id)
            execute(mutation.statement, {carrier[mutation.field]})
            carrier_refused(carrier)
            local after, next_audits = selection_state(carrier.component_id)
            test.eq(after.private_context, stored.private_context)
            test.eq(after.identity_generation, stored.identity_generation)
            test.eq(#next_audits, #audits)
        end)
    end
    test.it("BOT-NONEMPTY-RESTRICTION-CARRIER refuses a link rebound to another ordinary User", function()
        local carrier = restricted_carrier()
        carrier_frame(carrier)
        execute("UPDATE kickside_external_links SET user_id=$1 WHERE link_id=$2", {outsider, carrier.link_id})
        carrier_refused(carrier)
    end)
    test.it("BOT-NONEMPTY-RESTRICTION-CARRIER cannot transfer a human's combined restrictions to a granted bot through selection, install or a forged retained identity", function()
        local carrier = restricted_carrier()
        carrier_frame(carrier)
        grant(bot, "*", {operator_group})
        local stored, audits = selection_state(carrier.component_id)
        local metadata = {credential_id = carrier.credential_id, link_id = carrier.link_id}
        local result, err = command_identity(carrier.component_id, {kind = "user", id = bot}, "transfer:" .. carrier.component_id, 2, nil, metadata)
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        local other = assert(crypto.random.uuid())
        components[#components + 1] = other
        result, err = install_selected(other, {kind = "user", id = bot}, nil, nil, nil, metadata)
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        local absent, absent_err = component.get_identity_receipt(other)
        test.is_nil(absent)
        test.not_nil(absent_err)
        local after, next_audits = selection_state(carrier.component_id)
        test.eq(after.private_context, stored.private_context)
        test.eq(after.identity_generation, stored.identity_generation)
        test.eq(#next_audits, #audits)
        local encoded, encode_err = json.encode(carrier)
        test.is_nil(encode_err); test.not_nil(encoded)
        local forged, decode_err = json.decode(encoded)
        test.is_nil(decode_err); test.not_nil(forged)
        forged.principal = {kind = "user", id = bot}
        carrier_refused(forged)
        test.eq(effect_count(), 0)
    end)
end

local function define_identity_command_cases()
    for _, field in ipairs({"credential_id", "link_id"}) do
        test.it("RA-H21 Automation identity command preserves newly captured " .. field, function()
            local id = assert(crypto.random.uuid())
            components[#components + 1] = id
            install_operator_access()
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            test.not_nil((install_selected(id, {kind = "user", id = operator})))
            local ref = caller_restriction(field)
            local request_id = "restrict:" .. id
            local result, err = command_identity(id, {kind = "user", id = operator}, request_id, 1, nil, {[field] = ref})
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            local stored = assert(component.get_identity_receipt(id)).execution_identity
            test.eq(stored[field], ref)
            local changed, changed_err = command_identity(id, {kind = "user", id = operator}, request_id, 1)
            test.is_nil(changed)
            test.is_true(errors.is(changed_err, errors.CONFLICT), tostring(changed_err))
            test.eq(assert(component.get_identity_receipt(id)).execution_identity[field], ref)
        end)
    end
    test.it("RA-H20 Automation identity command cannot make an admitted executor its own authorizer", function()
        local id = assert(crypto.random.uuid())
        components[#components + 1] = id
        install_operator_access()
        grant(bot, id, {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        test.not_nil((groups.set_user_groups(bot, {baseline, access, operator_group})))
        test.not_nil((install_selected(id)))
        root_access(id, "user", bot, 8)
        local admitted = assert(component.get_identity_receipt(id)).execution_identity
        local result, err = command_identity(id, {kind = "user", id = bot}, "nested:" .. id, 1, bot,
            {execution_identity = admitted})
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        test.eq(assert(component.get_identity_receipt(id)).execution_identity.authorized_by.id, operator)
        local db = assert(sql.get("app:db"))
        local rows, rows_err = db:query("SELECT request_id FROM kickside_automation_op WHERE automation_id=$1", {id})
        db:release()
        test.is_nil(rows_err)
        test.eq(#rows, 1)
        test.eq(effect_count(), 0)
    end)
end

local function define_selected_install_cases()
    test.it("RA-H20 native selected install refuses replacement of an inherited execution root", function()
        local id = assert(crypto.random.uuid())
        components[#components + 1] = id
        install_operator_access()
        grant(bot, id, {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        local result, err = install_selected(id, nil, nil, nil, nil, {component_id = component_root()})
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        test.eq(effect_count(), 0)
        test.is_nil((component.get_identity_receipt(id)))
        local db = assert(sql.get("app:db"))
        local rows, rows_err = db:query("SELECT request_id FROM kickside_automation_op WHERE automation_id=$1", {id})
        db:release()
        test.is_nil(rows_err)
        test.eq(#rows, 0)
    end)
    for _, field in ipairs({"credential_id", "link_id"}) do
        test.it("RA-H21 native selected install preserves the captured " .. field .. " through deferred SET", function()
            local id = assert(crypto.random.uuid())
            components[#components + 1] = id
            install_operator_access()
            grant(bot, id, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            local ref = caller_restriction(field)
            local result, err = install_selected(id, {kind = "user", id = operator}, nil, nil, nil, {[field] = ref})
            test.is_nil(err, tostring(err))
            test.eq(result.id, id)
            local stored = assert(component.get_identity_receipt(id)).execution_identity
            test.eq(stored[field], ref)
            test.eq(stored.principal.id, operator)
            test.eq(stored.authorized_by.id, operator)
            test.eq(effect_count(), 0)
        end)
    end
    for _, field in ipairs({"credential_id", "link_id"}) do
        test.it("RA-H21 native selected install cannot spend another principal's " .. field, function()
            local id = assert(crypto.random.uuid())
            components[#components + 1] = id
            install_operator_access()
            grant(bot, id, {operator_group})
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            local ref = caller_restriction(field)
            local result, err = install_selected(id, nil, nil, nil, nil, {[field] = ref})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            local receipt, receipt_err = component.get_identity_receipt(id)
            test.is_nil(receipt)
            test.is_true(errors.is(receipt_err, errors.PERMISSION_DENIED), tostring(receipt_err))
            local _, audits = selection_state(id)
            test.eq(#audits, 0)
            test.eq(effect_count(), 0)
            local db = assert(sql.get("app:db"))
            for _, table_name in ipairs({"kickside_automation_drive", "kickside_automation_op", "kickside_automation_command"}) do
                local rows, rows_err = db:query("SELECT automation_id FROM " .. table_name .. " WHERE automation_id=$1", {id})
                test.is_nil(rows_err)
                test.eq(#rows, 0)
            end
            db:release()
        end)
    end
    test.it("RA-H56 native selected install records human creator and bot executor before the first real effect", function()
        local id = assert(crypto.random.uuid())
        components[#components + 1] = id
        install_operator_access()
        grant(bot, id, {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        local result, err = install_selected(id)
        if err then
            local db = assert(sql.get("app:db"))
            local ops, op_err = db:query("SELECT target_receipts_json FROM kickside_automation_op WHERE automation_id=$1", {id})
            db:release()
            test.is_nil(op_err)
            test.is_nil(err, tostring(err) .. " receipts=" .. json.encode(ops))
        end
        test.is_nil(err, tostring(err))
        test.eq(result.id, id)
        local receipt = assert(component.get_identity_receipt(id))
        test.eq(receipt.execution_identity.principal.id, bot)
        test.eq(receipt.execution_identity.authorized_by.id, operator)
        test.eq(receipt.execution_identity.component_id, id)
        local _, audits = selection_state(id)
        test.eq(#audits, 2)
        test.contains(audits[1].record_json, "user:" .. operator)
        test.contains(audits[2].record_json, "user:" .. bot)
        test.eq(effect_count(), 0)
        local produced, effect_err = effect(receipt.execution_identity)
        test.is_nil(effect_err, tostring(effect_err))
        test.eq(produced.actor_id, bot)
        test.eq(effect_count(), 1)
        local replay, replay_err = install_selected(id)
        test.is_nil(replay_err, tostring(replay_err))
        test.eq(replay.id, id)
        local _, replay_audits = selection_state(id)
        test.eq(#replay_audits, 2)
        test.eq(effect_count(), 1)
        local changed, changed_err = install_selected(id, nil, nil, nil, "Changed task")
        test.is_nil(changed)
        test.is_true(errors.is(changed_err, errors.CONFLICT))
    end)
    test.it("RA-H08 native selected install never borrows broad caller access for delegation", function()
        local id = assert(crypto.random.uuid())
        components[#components + 1] = id
        install_operator_access()
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        local result, err = install_selected(id)
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        test.eq(effect_count(), 0)
        local receipt = component.get_identity_receipt(id)
        if receipt then test.eq(receipt.execution_identity.principal.id, operator) end
    end)
    test.it("RA-H09 native selected install refuses another root's live bot grant", function()
        local id = assert(crypto.random.uuid())
        components[#components + 1] = id
        grant(bot, "other-root", {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        install_operator_access()
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        local result, err = install_selected(id)
        test.is_nil(result)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        test.eq(effect_count(), 0)
    end)
end

local function candidates(args, caller, metadata)
    local actor = assert(security.new_actor(caller or operator, metadata or {}))
    return assert(funcs.new()):with_actor(actor):with_scope(assert(security.new_scope({assert(security.policy("app:test_runtime"))})))
        :call("kickside.users:run_as_candidates", args or {})
end

local function candidate_page(args, caller, metadata)
    local page, err = candidates(args, caller, metadata)
    test.is_nil(err, tostring(err))
    test.not_nil(page)
    test.eq(page.me.kind, "user")
    test.eq(page.me.id, caller or operator)
    return page
end

local function define_candidate_cases()
    test.it("BOT-RUN-AS-CANDIDATES Me remains available and ungranted bots and other humans are absent", function()
        local page = candidate_page()
        test.eq(#page.candidates, 0)
        test.eq(page.me.label, "Me")
    end)
    test.it("RA-H07 candidate selection uses live operator membership rather than ambient worker authority", function()
        grant(bot, "*", {operator_group})
        test.eq(#candidate_page().candidates, 0)
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        local page = candidate_page()
        test.eq(#page.candidates, 1)
        test.eq(page.candidates[1].kind, "user")
        test.eq(page.candidates[1].id, bot)
        test.is_nil(page.candidates[1].email)
        test.eq(#candidate_page(nil, outsider).candidates, 0)
        test.not_nil((groups.set_user_groups(operator, {baseline})))
        test.eq(#candidate_page().candidates, 0)
    end)
    test.it("RA-H09 exact-root candidates require that root and its live ADMIN", function()
        local id = selectable_root()
        test.eq(#candidate_page().candidates, 0)
        test.eq(candidate_page({component_id = id}).candidates[1].id, bot)
        local other = component_root()
        root_access(other, "user", operator, 8)
        test.eq(#candidate_page({component_id = other}).candidates, 0)
        execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id})
        local page, err = candidates({component_id = id})
        test.is_nil(page)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
    end)
    test.it("RA-H10 exact and all-root native denials exclude otherwise granted candidates", function()
        local id = selectable_root("*")
        grant(bot, id, {deny_group}, "deny")
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group, deny_group})))
        test.eq(#candidate_page({component_id = id}).candidates, 0)
        test.eq(candidate_page().candidates[1].id, bot)
        grant(bot, "*", {deny_group}, "deny")
        test.eq(#candidate_page().candidates, 0)
    end)
    test.it("RA-H12 disabling a candidate removes it on the next query", function()
        grant(bot, "*", {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        test.eq(candidate_page().candidates[1].id, bot)
        test.not_nil((lifecycle.update(bot, {status = "inactive"})))
        test.eq(#candidate_page().candidates, 0)
    end)
    test.it("RA-H08 a stale candidate page never authorizes identity submission", function()
        local id = selectable_root()
        test.eq(candidate_page({component_id = id}).candidates[1].id, bot)
        test.not_nil((groups.set_user_groups(operator, {baseline})))
        local selected, err = select_identity(id)
        test.is_nil(selected)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        test.eq(#candidate_page({component_id = id}).candidates, 0)
    end)
    test.it("RA-H12 deleted recorded operators fail before candidate enumeration", function()
        grant(bot, "*", {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        test.eq(candidate_page().candidates[1].id, bot)
        test.not_nil((lifecycle.delete(operator)))
        local page, err = candidates()
        test.is_nil(page)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
    end)
    for _, field in ipairs({"credential_id", "link_id"}) do
        test.it("RA-H21 candidate queries preserve real inherited " .. field .. " restrictions", function()
            grant(bot, "*", {operator_group})
            install_operator_access()
            test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
            local ref = caller_restriction(field)
            test.eq(#candidate_page(nil, nil, {[field] = ref}).candidates, 0)
            test.eq(candidate_page().candidates[1].id, bot)
        end)
    end
    test.it("BOT-RUN-AS-CANDIDATES pages and literal searches enumerate only marked active Users", function()
        local second = account(true, {baseline, access})
        test.not_nil((lifecycle.update(bot, {full_name = "Sales % Bot"})))
        test.not_nil((lifecycle.update(second, {full_name = "Sales Team Bot"})))
        grant(bot, "*", {operator_group})
        grant(second, "*", {operator_group})
        test.not_nil((groups.set_user_groups(operator, {baseline, operator_group})))
        local first = candidate_page({limit = 1})
        test.eq(#first.candidates, 1)
        test.not_nil(first.next_cursor)
        local next_page = candidate_page({limit = 1, cursor = first.next_cursor})
        test.eq(#next_page.candidates, 1)
        test.is_false(first.candidates[1].id == next_page.candidates[1].id)
        local literal = candidate_page({q = "%"})
        test.eq(#literal.candidates, 1)
        test.eq(literal.candidates[1].id, bot)
        test.eq(literal.candidates[1].label, "Sales % Bot")
        test.eq(#candidate_page({q = "no such bot"}).candidates, 0)
    end)
    test.it("RA-H20 a delegated executor cannot become the picker authorizer or replace its inherited root", function()
        local admitted = admitted_execution()
        local page, err = candidates(nil, bot, {execution_identity = admitted})
        test.is_nil(page)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        local other = component_root()
        page, err = candidates({component_id = other}, operator, {component_id = admitted.component_id})
        test.is_nil(page)
        test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
    end)
    test.it("RA-H45 candidate storage errors remain errors instead of empty selectable pages", function()
        execute("ALTER TABLE app_user_bot_accounts RENAME TO candidate_marker_unavailable")
        local ok, page, err = pcall(candidates)
        execute("ALTER TABLE candidate_marker_unavailable RENAME TO app_user_bot_accounts")
        test.is_true(ok, tostring(page))
        test.is_nil(page)
        test.not_nil(err)
        test.is_false(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
    end)
end

local function with_fixture(define_tests)
    return test.run_cases(function()
    test.describe("native bot delegation from live Users groups", function()
        test.before_each(function()
            operator_group = "app:bot_operators_" .. assert(crypto.random.uuid())
            deny_group = "app:bot_denied_" .. assert(crypto.random.uuid())
            test.not_nil((reconcile.trigger()))
            local changes = assert(registry.snapshot()):changes()
            for _, group in ipairs({operator_group, deny_group}) do
                local id = "app:bot_group_baseline_" .. assert(crypto.random.uuid())
                changes:create({id = id, kind = "security.policy",
                    data = {groups = {group}, policy = {actions = "access", resources = "app:run_as_membership_baseline_marker", effect = "allow"}}})
                policies[#policies + 1] = id
            end
            test.is_nil(select(2, changes:apply()))
            operator = account(false, {baseline})
            bot = account(true, {baseline, access})
            outsider = account(false, {baseline})
            local records = assert(store.get("app:bot_execution_effects"))
            test.is_nil(select(2, records:set("bot_effect:" .. bot, 0)))
            records:release()
        end)
        test.after_each(function()
            for _, id in ipairs(components) do
                execute("DELETE FROM kickside_automation_drive WHERE automation_id=$1", {id})
                execute("DELETE FROM kickside_automation_op WHERE automation_id=$1", {id})
                execute("DELETE FROM kickside_automation_command WHERE automation_id=$1", {id})
                execute("DELETE FROM kickside_components WHERE component_id=$1", {id})
            end
            components = {}
            for _, id in ipairs(owned) do
                execute("DELETE FROM kickside_mcp_credentials WHERE actor_id=$1", {id})
                execute("DELETE FROM kickside_external_links WHERE user_id=$1", {id})
                execute("DELETE FROM app_user_bot_accounts WHERE user_id=$1", {id})
                test.not_nil((lifecycle.delete_if_exists(id)))
            end
            owned = {}
            test.not_nil((reconcile.trigger()))
            local snapshot = assert(registry.snapshot())
            local existing = {}
            for _, entry in ipairs(assert(snapshot:find({[".kind"] = "security.policy"}))) do existing[tostring(entry.id)] = true end
            local changes, count = snapshot:changes(), 0
            for _, id in ipairs(policies) do
                if existing[id] then changes:delete(id); count = count + 1 end
            end
            if count > 0 then test.is_nil(select(2, changes:apply())) end
            policies = {}
            test.not_nil((reconcile.trigger()))
        end)
        define_tests()
    end)
    end)
end

return {
    run = with_fixture(define_delegation_cases),
    run_selection = with_fixture(define_selection_cases),
    run_selected_install = with_fixture(define_selected_install_cases),
    run_identity_commands = with_fixture(define_identity_command_cases),
    run_restrictions = with_fixture(define_restriction_cases),
    run_candidates = with_fixture(define_candidate_cases),
    run_effects = with_fixture(define_effect_cases),
    run_capabilities = with_fixture(define_capability_cases),
    run_process = with_fixture(define_process_cases),
    run_host = with_fixture(define_host_cases),
}
