local test = require("test")
local crypto = require("crypto")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local sql = require("sql")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local session = require("session")
local session_index = require("session_index")
local execution_identity = require("execution_identity")
local trigger_reconcile = require("trigger_reconcile")

local function projection_changes()
    test.not_nil((trigger_reconcile.trigger()))
    return assert(registry.snapshot()):changes()
end

local function define_tests(register)
    test.describe("saved token live group authorization", function()
        local prefix = "app.continuity." .. assert(crypto.random.uuid()):gsub("-", "") .. ":"
        local function fixture_id(id) return prefix .. id:match(":(.+)$") end
        local GROUP = fixture_id("app:continuity_group")
        local uid, tokens
        local function create_policy(id, resource)
            local changes = projection_changes()
            changes:create({id = id, kind = "security.policy", data = {
                groups = {GROUP},
                policy = {actions = "smoke.continuity", resources = resource, effect = "allow"},
            }})
            test.is_nil(select(2, changes:apply()))
        end
        local function store() return assert(security.token_store("kickside.users.security:tokens")) end
        local function mint(legacy)
            if legacy then
                local s = store()
                local actor = assert(security.new_actor(uid, {}))
                local scope = assert(security.named_scope(GROUP))
                local token = assert(s:create(actor, scope, {expiration = "1h"}))
                s:close(); tokens[#tokens + 1] = token
                test.not_nil((trigger_reconcile.trigger()))
                return token
            end
            local user = assert(user_groups_repo.get_user_with_groups(uid))
            local minted, err = session.mint(user)
            test.is_nil(err, tostring(err)); test.not_nil(minted)
            test.not_nil((trigger_reconcile.trigger()))
            return minted.token
        end
        local function payload(token)
            local db = assert(sql.get("app:db"))
            local rows, err = db:query("SELECT token_value FROM kickside_user_auth_tokens WHERE token_key=$1",
                {assert(session_index.token_key(token))})
            db:release()
            test.is_nil(err); test.eq(#rows, 1)
            return rows[1].token_value
        end
        local function denied(token)
            local s = store()
            local actor, scope = s:validate(token)
            s:close()
            test.is_true(actor == nil or scope == nil
                or scope:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_retained")) ~= "allow")
        end
        test.before_each(function()
            test.not_nil((trigger_reconcile.trigger()))
            uid = "continuity-" .. assert(crypto.random.uuid())
            tokens = {}
            create_policy(fixture_id("app:continuity_before"), fixture_id("app:continuity_retained"))
            create_policy(fixture_id("app:continuity_removed"), fixture_id("app:continuity_removed"))
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = "continuity-password", status = "active"})))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, GROUP)))
        end)
        test.after_each(function()
            local s = store()
            for _, token in ipairs(tokens) do test.is_true((s:revoke(token))) end
            s:close()
            test.not_nil((user_lifecycle_repo.delete(uid)))
            local changes = projection_changes()
            for _, entry in ipairs(assert(registry.find({[".kind"] = "security.policy"}))) do
                local id = tostring(entry.id)
                if id:sub(1, #prefix) == prefix then changes:delete(id) end
            end
            test.is_nil(select(2, changes:apply()))
            test.not_nil((trigger_reconcile.trigger()))
        end)
        local function covering_group(excluded)
            local group = fixture_id("app:continuity_cover")
            test.not_nil((trigger_reconcile.trigger()))
            local changes = projection_changes()
            changes:create({id = fixture_id("app:continuity_cover_policy"), kind = "security.policy", data = {
                groups = {group}, policy = {actions = "*", resources = "*", effect = "allow",
                    conditions = excluded and {{field = "action", operator = "nin", value = {excluded}}} or nil},
            }})
            test.is_nil(select(2, changes:apply()))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, group)))
            return group
        end
        local function operation_cases()
        test.it("retains fencing through the published group mutation method", function()
            local token = mint(false)
            local before = payload(token)
            local account = assert(user_groups_repo.get_user_with_groups(uid))
            local result, err = session_index.invalidate_groups({GROUP}, {preserve_sessions = true})
            test.is_nil(err); test.eq(result.revoked, 0)
            local current = assert(user_groups_repo.get_user_with_groups(uid))
            test.eq(current.auth_generation, account.auth_generation)
            test.is_true(current.delegation_generation > account.delegation_generation)
            test.eq(payload(token), before)
        end)
        for _, operation in ipairs({"explicit_fence", "published_fence", "omitted_flag", "false_flag"}) do
            test.it("retains session and delegation semantics at " .. operation, function()
                local token = mint(false)
                local before = payload(token)
                local account = assert(user_groups_repo.get_user_with_groups(uid))
                local fencing = operation == "explicit_fence" or operation == "published_fence"
                local request = {group_ids = {GROUP}}
                if operation == "published_fence" then request.preserve_sessions = true end
                if operation == "false_flag" then request.preserve_sessions = false end
                local result, err = funcs.call(operation == "explicit_fence"
                    and "kickside.users.persist:delegation_fencer" or "kickside.users.persist:session_revoker", request)
                test.is_nil(err, tostring(err)); test.is_true(result.success)
                local current = assert(user_groups_repo.get_user_with_groups(uid))
                test.is_true(current.delegation_generation > account.delegation_generation)
                if fencing then
                    test.eq(result.revoked, 0); test.eq(payload(token), before)
                    test.eq(current.auth_generation, account.auth_generation)
                else
                    test.eq(result.revoked, 1); denied(token)
                    test.is_true(current.auth_generation > account.auth_generation)
                end
            end)
        end
        end

        local function coverage_cases()
        for _, legacy in ipairs({false, true}) do
            for _, conditional in ipairs({false, true}) do
                test.it("retains delegated epochs under unchanged covering authority: " .. tostring(legacy) .. "/" .. tostring(conditional), function()
                    covering_group(conditional and "smoke.excluded" or nil)
                    local token = mint(legacy)
                    local before = payload(token)
                    local account = assert(user_groups_repo.get_user_with_groups(uid))
                    test.not_nil((trigger_reconcile.trigger()))
                    local changes = projection_changes()
                    changes:delete(fixture_id("app:continuity_removed"))
                    test.is_nil(select(2, changes:apply()))
                    local result, err = funcs.call("kickside.users.persist:delegation_fencer", {
                        group_ids = {GROUP}, allow_only = false,
                        previous_group_rules = {[GROUP] = {
                            {actions = "smoke.continuity", resources = fixture_id("app:continuity_retained"), effect = "allow"},
                            {actions = "smoke.continuity", resources = fixture_id("app:continuity_removed"), effect = "allow"},
                        }},
                        reason = "group policy composition changes",
                    })
                    test.is_nil(err, tostring(err)); test.is_true(result.success)
                    test.eq(result.revoked, 0)
                    local current = assert(user_groups_repo.get_user_with_groups(uid))
                    test.eq(current.auth_generation, account.auth_generation)
                    test.eq(payload(token), before)
                    local s = store()
                    local actor, scope, validate_err = s:validate(token)
                    s:close()
                    test.is_nil(validate_err, tostring(validate_err))
                    test.eq(actor:id(), uid)
                    test.eq(scope:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_removed")), "allow")
                    test.eq(current.delegation_generation, account.delegation_generation,
                        "group-policy reduction revokes an unchanged principal ceiling")
                end)
            end
        end
        for _, proof in ipairs({"lost_excluded_action", "missing_previous_rules", "missing_previous_rules_allow_only", "malformed_previous_rules"}) do
            test.it("fences a conditional cover with " .. proof, function()
                covering_group("smoke.excluded")
                test.not_nil((trigger_reconcile.trigger()))
                local changes = projection_changes()
                changes:create({id = fixture_id("app:continuity_excluded"), kind = "security.policy", data = {
                    groups = {GROUP}, policy = {actions = "smoke.excluded", resources = fixture_id("app:continuity_excluded"), effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                local token = mint(false)
                local account = assert(user_groups_repo.get_user_with_groups(uid))
                local s = store()
                local actor, scope = s:validate(token)
                test.eq(scope:evaluate(actor, "smoke.excluded", fixture_id("app:continuity_excluded")), "allow")
                s:close()
                test.not_nil((trigger_reconcile.trigger()))
                changes = projection_changes()
                changes:delete(fixture_id("app:continuity_excluded"))
                test.is_nil(select(2, changes:apply()))
                local result, err = funcs.call("kickside.users.persist:delegation_fencer", {
                    group_ids = {GROUP}, allow_only = proof == "missing_previous_rules_allow_only",
                    previous_group_rules = proof == "lost_excluded_action" and {[GROUP] = {
                        {actions = "smoke.excluded", resources = fixture_id("app:continuity_excluded"), effect = "allow"},
                    }} or (proof == "malformed_previous_rules" and {[GROUP] = "unavailable"} or nil),
                })
                test.is_nil(err, tostring(err)); test.is_true(result.success)
                local current = assert(user_groups_repo.get_user_with_groups(uid))
                test.is_true(current.delegation_generation > account.delegation_generation)
                s = store()
                actor, scope = s:validate(token)
                test.is_true(scope:evaluate(actor, "smoke.excluded", fixture_id("app:continuity_excluded")) ~= "allow")
                s:close()
            end)
        end
        end

        local function fencing_cases()
        for _, boundary in ipairs({"excluded_action", "new_deny", "explicit_revoke"}) do
            test.it("retains revocation through a covering group at " .. boundary, function()
                covering_group(boundary == "excluded_action" and "smoke.continuity" or nil)
                local token = mint(false)
                local account = assert(user_groups_repo.get_user_with_groups(uid))
                test.not_nil((trigger_reconcile.trigger()))
                local changes = projection_changes()
                changes:delete(fixture_id("app:continuity_removed"))
                if boundary == "new_deny" then
                    changes:create({id = fixture_id("app:continuity_deny"), kind = "security.policy", data = {
                        groups = {GROUP}, policy = {actions = "smoke.continuity", resources = fixture_id("app:continuity_retained"), effect = "deny"}}})
                end
                test.is_nil(select(2, changes:apply()))
                local result, err = funcs.call(boundary == "explicit_revoke" and "kickside.users.persist:session_revoker" or "kickside.users.persist:delegation_fencer", {
                    group_ids = {GROUP}, allow_only = false,
                    reason = "group policy composition changes",
                })
                test.is_nil(err, tostring(err)); test.is_true(result.success)
                local current = assert(user_groups_repo.get_user_with_groups(uid))
                test.is_true(current.delegation_generation > account.delegation_generation)
                if boundary == "explicit_revoke" then
                    test.eq(result.revoked, 1)
                    denied(token)
                else
                    test.eq(result.revoked, 0)
                    local s = store()
                    local actor, scope, validate_err = s:validate(token)
                    s:close()
                    test.is_nil(validate_err, tostring(validate_err))
                    test.eq(actor:id(), uid)
                    test.is_true(scope:evaluate(actor, "smoke.continuity", boundary == "new_deny"
                        and fixture_id("app:continuity_retained") or fixture_id("app:continuity_removed")) ~= "allow")
                end
            end)
        end
        for _, legacy in ipairs({false, true}) do
            test.it(legacy and "preserves unindexed credentials through group delegation fences"
                or "preserves indexed credentials through group delegation fences", function()
                local token = mint(legacy)
                local before = payload(token)
                local account = assert(user_groups_repo.get_user_with_groups(uid))
                for _, allow_only in ipairs({true, false}) do
                    local result, err = funcs.call("kickside.users.persist:delegation_fencer", {
                        group_ids = {GROUP}, allow_only = allow_only,
                        reason = "group policy composition changes",
                    })
                    test.is_nil(err, tostring(err)); test.is_true(result.success)
                    test.eq(result.revoked, 0)
                    test.eq(payload(token), before)
                    local current = assert(user_groups_repo.get_user_with_groups(uid))
                    test.eq(current.auth_generation, account.auth_generation)
                    test.is_true(current.delegation_generation > account.delegation_generation)
                    account = current
                    local s = store()
                    local actor, scope, validate_err = s:validate(token)
                    s:close()
                    test.is_nil(validate_err, tostring(validate_err))
                    test.eq(actor:id(), uid)
                    test.eq(scope:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_retained")), "allow")
                end
            end)
            test.it(legacy and "resolves an existing policy-ID token with absent login metadata without rewrite"
                or "resolves saved session policies through current groups after rename removal and addition", function()
                local token = mint(legacy)
                local before = payload(token)
                local changes = projection_changes()
                changes:delete(fixture_id("app:continuity_before"))
                changes:delete(fixture_id("app:continuity_removed"))
                test.is_nil(select(2, changes:apply()))
                create_policy(fixture_id("app:continuity_after"), fixture_id("app:continuity_retained"))
                create_policy(fixture_id("app:continuity_added"), fixture_id("app:continuity_added"))
                local s = store()
                local actor, scope, err = s:validate(token)
                s:close()
                test.is_nil(err); test.not_nil(actor); test.not_nil(scope)
                test.eq(actor:id(), uid)
                test.eq(payload(token), before, "validation rewrites the saved token payload")
                local current = assert(security.named_scope(GROUP))
                test.eq(current:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_retained")), "allow")
                test.eq(current:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_removed")), "undefined")
                test.eq(current:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_added")), "allow")
                for _, resource in ipairs({fixture_id("app:continuity_retained"), fixture_id("app:continuity_removed"), fixture_id("app:continuity_added")}) do
                    test.eq(scope:evaluate(actor, "smoke.continuity", resource),
                        current:evaluate(actor, "smoke.continuity", resource), resource)
                end
            end)
        end
        end

        local function continuity_cases()
        for _, legacy in ipairs({false, true}) do
            test.it(legacy and "denies an unindexed policy-ID token immediately after removing its user's group"
                or "revokes a saved session immediately after removing its group", function()
                local token = mint(legacy)
                test.not_nil((user_groups_repo.remove_user_from_group(uid, GROUP)))
                denied(token)
            end)
            test.it(legacy and "denies a disabled user's unindexed policy-ID token"
                or "denies a disabled user's saved session", function()
                local token = mint(legacy)
                test.not_nil((user_lifecycle_repo.update(uid, {status = "inactive"})))
                denied(token)
            end)
        end
        test.it("preserves saved session metadata while current memberships and group policies stay live", function()
            local user = assert(user_groups_repo.get_user_with_groups(uid))
            local minted, mint_err = session.mint(user, {
                client_trace = "saved-session-trace", sso_provider = "fixture-provider",
                execution_identity = { principal = {kind = "user", id = "forged"} },
                authority_epochs = {forged = 999},
            })
            test.is_nil(mint_err, tostring(mint_err))
            local before = payload(minted.token)
            local expansion_group = fixture_id("app:continuity_expansion_group")
            local changes = projection_changes()
            changes:create({id = fixture_id("app:continuity_expansion_policy"), kind = "security.policy", data = {
                groups = {expansion_group},
                policy = {actions = "smoke.continuity", resources = fixture_id("app:continuity_expansion"), effect = "allow"},
            }})
            test.is_nil(select(2, changes:apply()))
            test.not_nil((user_groups_repo.assign_user_to_group(uid, expansion_group)))
            create_policy(fixture_id("app:continuity_new_policy"), fixture_id("app:continuity_new_policy"))
            local s = store()
            local actor, scope, validate_err = s:validate(minted.token)
            s:close()
            test.is_nil(validate_err, tostring(validate_err))
            local meta = actor:meta()
            test.eq(meta.client_trace, "saved-session-trace")
            test.eq(meta.sso_provider, "fixture-provider")
            test.eq(meta.scope_id, minted.actor:meta().scope_id)
            test.eq(meta.login_time, minted.actor:meta().login_time)
            test.eq(meta.user_id, uid)
            local has_expansion = false
            for _, group in ipairs(meta.security_groups) do
                if group == expansion_group then has_expansion = true end
            end
            test.is_true(has_expansion)
            test.is_nil(meta.execution_identity)
            test.is_nil(meta.authority_epochs.forged)
            test.eq(scope:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_expansion")), "allow")
            test.eq(scope:evaluate(actor, "smoke.continuity", fixture_id("app:continuity_new_policy")), "allow")
            test.eq(payload(minted.token), before)
        end)

        test.it("a saved session reaches a declared service through its narrow call grant", function()
            local changes = projection_changes()
            changes:create({id = fixture_id("app:continuity_service_call"), kind = "security.policy", data = {
                groups = {GROUP}, policy = {actions = "funcs.call",
                    resources = "kickside.users.binding:subject_lookup", effect = "allow"},
            }})
            test.is_nil(select(2, changes:apply()))
            local token = mint(false)
            local s = store()
            local actor, scope, validate_err = s:validate(token)
            s:close()
            test.is_nil(validate_err, tostring(validate_err))
            local bound = assert(funcs.new()):with_actor(actor):with_scope(scope)
            local subject, lookup_err = bound:call("kickside.users.binding:subject_lookup", {subject_id = uid})
            test.is_nil(lookup_err, tostring(lookup_err))
            test.is_nil(subject.error, tostring(subject.error and subject.error.message))
            test.eq(subject.subject_id, uid)
            test.eq(subject.groups[1], GROUP)
            test.eq(subject.meta.user_id, uid)
        end)

        test.it("resolves current MCP group policies while retaining its explicit narrowing ceiling", function()
            local changes = projection_changes()
            changes:create({id = fixture_id("app:continuity_ceiling"), kind = "security.policy", data = {
                policy = {actions = "smoke.continuity", resources = fixture_id("app:continuity_added"), effect = "deny"},
            }})
            changes:delete(fixture_id("app:continuity_before"))
            test.is_nil(select(2, changes:apply()))
            create_policy(fixture_id("app:continuity_after"), fixture_id("app:continuity_retained"))
            create_policy(fixture_id("app:continuity_added"), fixture_id("app:continuity_added"))
            local builder = {}
            builder.with_actor = function() return builder end
            builder.with_scope = function() return builder end
            builder.open = function() return {resolve = function()
                return {principal = {kind = "user", id = uid}, actor_id = uid,
                    groups = {GROUP}, scope_name = GROUP, scope_groups = {GROUP},
                    authority_epochs = {users = 0}, initial_authority_epochs = {users = 0}, meta = {}}, nil
            end} end
            local identity = execution_identity.new({security = security,
                contract = {get = function() return builder end},
                funcs = {new = function() return {call = function()
                    return {credential_id = "continuity-credential", actor_id = uid, status = "active",
                        whitelist_component_ids = {}, scope_policy_ids = {fixture_id("app:continuity_ceiling")},
                        authority = {policy_ids = {fixture_id("app:continuity_before")}, groups = {GROUP}, epochs = {users = 0}}}, nil
                end} end}})
            local frame, err = identity.resolve({version = 2, principal = {kind = "user", id = uid},
                authorized_by = {kind = "user", id = uid}, credential_id = "continuity-credential",
                captured_at = "2026-10-09T00:00:00Z"})
            test.is_nil(err, tostring(err)); test.not_nil(frame)
            test.eq(frame.scope:evaluate(frame.actor, "smoke.continuity", fixture_id("app:continuity_retained")), "allow")
            test.eq(frame.scope:evaluate(frame.actor, "smoke.continuity", fixture_id("app:continuity_added")), "deny")
        end)
        end
        register(continuity_cases, fencing_cases, operation_cases, coverage_cases)
    end)
end

return {
    run = test.run_cases(function() define_tests(function(continuity) continuity() end) end),
    run_fencing = test.run_cases(function() define_tests(function(_, fencing) fencing() end) end),
    run_operations = test.run_cases(function() define_tests(function(_, _, operations) operations() end) end),
    run_coverage = test.run_cases(function() define_tests(function(_, _, _, coverage) coverage() end) end),
}
