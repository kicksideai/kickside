local test = require("test")
local json = require("json")
local http_client = require("http_client")
local registry = require("registry")
local security = require("security")
local user_repo = require("user_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_groups_repo = require("user_groups_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local session_index = require("session_index")
local session = require("session")
local scope_store = require("scope_store")
local trigger_reconcile = require("trigger_reconcile")
local consts = require("user_consts")
local funcs = require("funcs")

local USER_ID = "login_scope_test_user"
local EMAIL = "login-scope@test.local"
local PASSWORD = "testpass123"
local SCOPE_ID = "app.security:user"
-- The harness gateway's configured port (a per-run var).
local function gateway_url(path: string): string
    local entry = registry.get("app:gateway")
    local addr = entry and ((entry :: any).data and (entry :: any).data.addr or (entry :: any).addr) or nil
    local port = tostring(addr or ""):match(":(%d+)$")
    if not port then error("harness gateway address unavailable: " .. tostring(addr)) end
    return "http://localhost:" .. port .. path
end

local function decode_response(response)
    local body, err = json.decode(response.body or "")
    test.is_nil(err)
    test.not_nil(body)
    return body
end

local function define_tests()
    test.describe("login actor metadata", function()

        test.it("applies added group policies to an existing token without login", function()
            local uid, slug = "session_allow_expansion", "session_allow_expansion"
            local group = "kickside.security.scopes:" .. slug
            local first, added = "app:expansion_initial", "app:expansion_added"
            local config = assert(registry.get("kickside.security:composition_config"))
            local changes = assert(registry.snapshot()):changes()
            changes:update({id = tostring(config.id), kind = config.kind,
                meta = {delegation_fencer = "kickside.users.persist:delegation_fencer"}, data = config.data})
            for _, entry in ipairs({{id = first, resource = "app:old.endpoint"},
                {id = added, resource = "app:added.endpoint"}}) do
                changes:create({id = entry.id, kind = "security.policy", data = {
                    policy = {actions = "access", resources = entry.resource, effect = "allow"}}})
            end
            test.is_nil(select(2, changes:apply()))
            test.not_nil((scope_store.upsert({slug = slug, policies = {first}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local", password = PASSWORD, status = "active"})))
            test.not_nil((user_group_sources_repo.set_user_groups(uid, {group, "app.security:scope_support"})))
            local minted = assert(session.mint(assert(user_groups_repo.get_user_with_groups(uid))))
            local before = assert(user_repo.get(uid)).auth_generation
            local tokens = assert(security.token_store("kickside.users.security:tokens"))
            local actor, scope, validate_err = tokens:validate(minted.token)
            test.is_nil(validate_err)
            test.eq(scope:evaluate(actor, "access", "app:added.endpoint"), "undefined")

            test.not_nil((scope_store.upsert({slug = slug, policies = {first, added}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            actor, scope, validate_err = tokens:validate(minted.token)
            test.is_nil(validate_err)
            test.eq(assert(user_repo.get(uid)).auth_generation, before)
            test.eq(scope:evaluate(actor, "access", "app:old.endpoint"), "allow")
            test.eq(scope:evaluate(actor, "access", "app:added.endpoint"), "allow")

            local refreshed = assert(session.mint(assert(user_groups_repo.get_user_with_groups(uid))))
            local fresh_actor, fresh_scope, fresh_err = tokens:validate(refreshed.token)
            test.is_nil(fresh_err)
            test.eq(fresh_scope:evaluate(fresh_actor, "access", "app:added.endpoint"), "allow")
            test.eq(fresh_scope:evaluate(fresh_actor, "access", "app:old.endpoint"), "allow")

            test.not_nil((scope_store.upsert({slug = slug, policies = {added}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            for _, token in ipairs({minted.token, refreshed.token}) do
                actor, scope, validate_err = tokens:validate(token)
                test.is_nil(validate_err)
                test.eq(actor:id(), uid)
                test.eq(scope:evaluate(actor, "access", "app:old.endpoint"), "undefined")
                test.eq(scope:evaluate(actor, "access", "app:added.endpoint"), "allow")
            end
            test.eq(assert(user_repo.get(uid)).auth_generation, before)
            tokens:close()
            test.not_nil((user_lifecycle_repo.delete(uid)))
            test.is_true((scope_store.delete(slug)))
            test.not_nil((trigger_reconcile.trigger()))
            changes = assert(registry.snapshot()):changes()
            changes:delete(first)
            changes:delete(added)
            changes:update({id = tostring(config.id), kind = config.kind, meta = config.meta, data = config.data})
            test.is_nil(select(2, changes:apply()))
        end)

        for _, binding in ipairs({"delegation_fencer", "sessions_invalidator"}) do
        test.it("preserves saved login authority through the " .. binding .. " binding", function()
            local uid, slug = "login_projection_generation", "login_projection_generation"
            local group = "kickside.security.scopes:" .. slug
            local policy_id = "app:login_projection_policy"
            local config = assert(registry.get("kickside.security:composition_config"))
            local changes = assert(registry.snapshot()):changes()
            local metadata = {}
            for key, value in pairs(config.meta or {}) do metadata[key] = value end
            metadata[binding] = binding == "delegation_fencer" and "kickside.users.persist:delegation_fencer" or "kickside.users.persist:session_revoker"
            changes:update({id = tostring(config.id), kind = config.kind,
                meta = metadata, data = config.data})
            changes:create({id = policy_id, kind = "security.policy", data = {
                policy = {actions = "access", resources = "app:old.endpoint", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            local saved, save_err = scope_store.upsert({slug = slug, policies = {policy_id}}, "tester")
            test.is_nil(save_err)
            test.not_nil(saved, "custom group stored")
            local projected, projection_err = trigger_reconcile.trigger()
            test.is_nil(projection_err)
            test.not_nil(projected, "initial custom group projected")
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local", password = PASSWORD, status = "active"})), "account created")
            test.not_nil((user_group_sources_repo.set_user_groups(uid, {group, "app.security:scope_support"})), "memberships assigned")
            local function login()
                local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                    headers = {["Content-Type"] = "application/json"},
                    body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
                })
                test.is_nil(http_err)
                test.eq(response.status_code, 200, tostring(response.body))
                return decode_response(response).token
            end
            local older = login()
            local before = assert(user_repo.get(uid)).auth_generation
            local delegation_before = assert(user_groups_repo.get_user_with_groups(uid)).delegation_generation
            local entry = assert(registry.get(policy_id))
            entry.data.policy.resources = "app:new.endpoint"
            changes = assert(registry.snapshot()):changes()
            changes:update({id = policy_id, kind = entry.kind, meta = entry.meta, data = entry.data})
            test.is_nil(select(2, changes:apply()))
            projected, projection_err = trigger_reconcile.trigger()
            test.is_nil(projection_err)
            test.not_nil(projected, "policy reduction reconciled before issuing a new session")
            local current = login()
            test.eq(assert(user_repo.get(uid)).auth_generation, before)
            test.eq(assert(user_groups_repo.get_user_with_groups(uid)).delegation_generation, delegation_before,
                "native rule updates resolve directly without a custom selection mutation")
            local tokens = assert(security.token_store("kickside.users.security:tokens"))
            for _, token in ipairs({older, current}) do
                local actor, scope, validate_err = tokens:validate(token)
                test.is_nil(validate_err)
                test.eq(actor:id(), uid)
                test.eq(scope:evaluate(actor, "access", "app:new.endpoint"), "allow")
                test.eq(scope:evaluate(actor, "access", "app:old.endpoint"), "undefined")
            end
            tokens:close()
            test.not_nil((user_lifecycle_repo.delete(uid)), "account deleted")
            test.is_true((scope_store.delete(slug)))
            projected, projection_err = trigger_reconcile.trigger()
            test.is_nil(projection_err)
            test.not_nil(projected, "deleted custom group reconciled")
            changes = assert(registry.snapshot()):changes()
            changes:delete(policy_id)
            changes:update({id = tostring(config.id), kind = config.kind, meta = config.meta, data = config.data})
            test.is_nil(select(2, changes:apply()))
        end)

        end

        test.it("issues a current session after generation changes and rejects the older session", function()
            local uid = "login_generation_refresh"
            local created, create_err = user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = PASSWORD, status = "active"})
            test.is_nil(create_err)
            test.not_nil(created)
            local assigned, assign_err = user_groups_repo.assign_user_to_group(uid, SCOPE_ID)
            test.is_nil(assign_err)
            test.not_nil(assigned)
            local observed, observe_err = user_groups_repo.get_user_with_groups(uid)
            test.is_nil(observe_err)
            local older, older_err = session.mint(observed)
            test.is_nil(older_err)
            test.not_nil(older)
            local revoked, revoke_err = session_index.invalidate_user(uid)
            test.is_nil(revoke_err)
            test.eq(revoked.revoked, 1)
            local current, mint_err = session.mint(observed)
            test.is_nil(mint_err)
            test.not_nil(current)
            local tokens, tokens_err = security.token_store("kickside.users.security:tokens")
            test.is_nil(tokens_err)
            local _, _, older_validate_err = tokens:validate(assert(older.token))
            test.not_nil(older_validate_err)
            local actor, _, validate_err = tokens:validate(assert(current.token))
            test.is_nil(validate_err)
            test.eq(actor:id(), uid)
            tokens:close()
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200, tostring(response.body))
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
        end)

        test.it("fences newly enrolled groups before their native policies exist", function()
            local uid = "group_session_before_projection"
            local group = "app.security:pending_projection"
            local policy_id = "app:pending_projection_deny"
            local created, create_err = user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = PASSWORD, status = "active"})
            test.is_nil(create_err)
            test.not_nil(created)
            for _, id in ipairs({group, "app.security:scope_unrestricted"}) do
                local assigned, assign_err = user_groups_repo.assign_user_to_group(uid, id)
                test.is_nil(assign_err)
                test.not_nil(assigned)
            end
            local initial, initial_err = session_index.invalidate_groups({group}, {allow_only = true})
            test.is_nil(initial_err)
            test.not_nil(initial)
            test.eq(initial.users_invalidated, 0)
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = policy_id, kind = "security.policy", data = {
                groups = {group}, policy = {actions = "access", resources = "app:crm", effect = "deny"}}})
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local restricted, restricted_err = session_index.invalidate_groups({group}, {allow_only = true})
            test.is_nil(restricted_err)
            test.not_nil(restricted)
            test.eq(restricted.users_invalidated, 1)
            changes = assert(registry.snapshot()):changes()
            changes:delete(policy_id)
            _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
        end)

        test.it("does not expose the retired group materialization function", function()
            local policy = assert(security.policy("app:projection_caller"))
            local scope = assert(security.new_scope({policy}))
            local bound = assert(funcs.new()):with_actor(security.new_actor("ordinary_member")):with_scope(scope)
            local result, err = bound:call("kickside.security.binding:materialize_group_set", {
                groups = {"app.security:admin", "app.security:user"}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
        end)

        test.it("rejects an existing membership whose policy group is removed without an internal error", function()
            local uid, group, policy_id = "login_removed_group", "app:login_removed_group", "app:login_removed_policy"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = policy_id, kind = "security.policy", data = {
                groups = {group}, policy = {actions = "access", resources = "app:removed_resource", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local", password = PASSWORD, status = "active"})))
            test.not_nil((user_group_sources_repo.set_user_groups(uid, {group})))
            changes = assert(registry.snapshot()):changes()
            changes:delete(policy_id)
            test.is_nil(select(2, changes:apply()))
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 403, tostring(response.body))
            local payload = decode_response(response)
            test.eq(payload.success, false)
            test.eq(payload.kind, errors.NOT_FOUND)
            test.eq(payload.retryable, false)
            test.is_nil(payload.token)
            test.not_nil((user_lifecycle_repo.delete(uid)))
        end)

        test.it("mints a session for a dynamically composed group outside the host role namespace", function()
            local uid = "login_dynamic_group"
            local group = "kickside.security.scopes:sales_login_test"
            local policy_id = "kickside.security.scopes.test:sales_login_policy"
            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create({id = policy_id, kind = "security.policy", data = {
                groups = {group}, policy = {resources = "app:crm.endpoint", actions = "access", effect = "allow"},
            }})
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local created, create_err = user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = PASSWORD, status = "active"})
            test.is_nil(create_err)
            test.not_nil(created)
            local assigned, assign_err = user_group_sources_repo.set_user_groups(uid, {group})
            test.is_nil(assign_err)
            test.not_nil(assigned)
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200, tostring(response.body))
            local payload = decode_response(response)
            local tokens, tokens_err = security.token_store("kickside.users.security:tokens")
            test.is_nil(tokens_err)
            local actor, scope, validate_err = tokens:validate(payload.token)
            test.is_nil(validate_err)
            test.not_nil(actor)
            test.eq(scope:evaluate(actor, "access", "app:crm.endpoint"), "allow")
            test.eq(scope:evaluate(actor, "access", "app:unassigned.endpoint"), "undefined")
            tokens:close()
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
            snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            changes = snapshot:changes()
            changes:delete(policy_id)
            _, apply_err = changes:apply()
            test.is_nil(apply_err)
        end)
        test.it("preserves unchanged unrestricted access during allow-only composition updates and revokes on restrictions", function()
            local uid = "group_session_unrestricted"
            local created, create_err = user_repo.create({user_id = uid, email = uid .. "@test.local", password = PASSWORD, status = "active"})
            test.is_nil(create_err)
            test.not_nil(created)
            for _, group in ipairs({SCOPE_ID, "app.security:scope_unrestricted"}) do
                local assigned, assign_err = user_groups_repo.assign_user_to_group(uid, group)
                test.is_nil(assign_err)
                test.not_nil(assigned)
            end
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200)
            local payload = decode_response(response)
            local tokens, tokens_err = security.token_store("kickside.users.security:tokens")
            test.is_nil(tokens_err)
            local updated, update_err = session_index.invalidate_groups({SCOPE_ID}, {allow_only = true})
            test.is_nil(update_err)
            test.not_nil(updated)
            local actor, _, validate_err = tokens:validate(payload.token)
            test.is_nil(validate_err)
            test.not_nil(actor)
            local assigned, assign_err = user_groups_repo.assign_user_to_group(uid, "app.security:scope_restricted")
            test.is_nil(assign_err)
            test.not_nil(assigned)
            updated, update_err = session_index.invalidate_groups({SCOPE_ID}, {allow_only = true})
            test.is_nil(update_err)
            test.not_nil(updated)
            actor, _, validate_err = tokens:validate(payload.token)
            test.not_nil(validate_err)
            response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200)
            payload = decode_response(response)
            local revoked, revoke_err = session_index.invalidate_groups({SCOPE_ID}, {allow_only = false})
            test.is_nil(revoke_err)
            test.is_true(revoked.users_invalidated >= 1)
            actor, _, validate_err = tokens:validate(payload.token)
            test.not_nil(validate_err)
            tokens:close()
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
        end)
        test.it("preserves a wildcard grant that excludes actions until a change grants an excluded action", function()
            local uid = "group_session_reserved"
            local created, create_err = user_repo.create({user_id = uid, email = uid .. "@test.local", password = PASSWORD, status = "active"})
            test.is_nil(create_err)
            test.not_nil(created)
            for _, group in ipairs({"app.security:scope_narrow_grant", "app.security:scope_service_reserved", "app.security:scope_reserved_grant"}) do
                local assigned, assign_err = user_groups_repo.assign_user_to_group(uid, group)
                test.is_nil(assign_err)
                test.not_nil(assigned)
            end
            local preserved, preserve_err = session_index.invalidate_groups({"app.security:scope_narrow_grant"}, {allow_only = true})
            test.is_nil(preserve_err)
            test.eq(preserved.users_invalidated, 0)
            local revoked, revoke_err = session_index.invalidate_groups({"app.security:scope_reserved_grant"}, {allow_only = true})
            test.is_nil(revoke_err)
            test.eq(revoked.users_invalidated, 1)
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
        end)
        test.it("revokes every session of a changed group and preserves unrelated accounts", function()
            local uid = "group_session_change"
            local created, create_err = user_repo.create({user_id = uid, email = uid .. "@test.local", password = PASSWORD, status = "active"})
            test.is_nil(create_err)
            test.not_nil(created)
            local assigned, assign_err = user_groups_repo.assign_user_to_group(uid, SCOPE_ID)
            test.is_nil(assign_err)
            test.not_nil(assigned)
            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({email = uid .. "@test.local", password = PASSWORD}),
            })
            test.is_nil(http_err)
            test.eq(response.status_code, 200)
            local payload = decode_response(response)
            local tokens, tokens_err = security.token_store("kickside.users.security:tokens")
            test.is_nil(tokens_err)
            local actor, _, validate_err = tokens:validate(payload.token)
            test.is_nil(validate_err)
            test.not_nil(actor)
            local unrelated, unrelated_err = session_index.invalidate_groups({"test:unrelated_group"})
            test.is_nil(unrelated_err)
            test.eq(unrelated.users_invalidated, 0)
            actor, _, validate_err = tokens:validate(payload.token)
            test.is_nil(validate_err)
            test.not_nil(actor)
            local revoked, revoke_err = session_index.invalidate_groups({SCOPE_ID, SCOPE_ID})
            test.is_nil(revoke_err)
            test.is_true(revoked.users_invalidated >= 1)
            actor, _, validate_err = tokens:validate(payload.token)
            test.not_nil(validate_err)
            tokens:close()
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
        end)
        test.it("keeps the app core group when module groups are absent or narrowed", function()
            local config = { admin_group_id = "test:admin", default_group_id = "test:members", baseline_group_id = "test:core" }
            local primary, admin, effective = consts.derive_scope(config, { "test:sales" })
            test.eq(primary, "test:sales")
            test.eq(admin, false)
            test.eq(#effective, 2)
            test.eq(effective[1], "test:sales")
            test.eq(effective[2], "test:core")
            primary, admin, effective = consts.derive_scope(config, {})
            test.eq(primary, "test:core")
            test.eq(#effective, 1)
            test.eq(effective[1], "test:core")
        end)
        test.it("unions every membership and keeps denials in both membership orders", function()
            local uid = "login_scope_union"
            local created, create_err = user_repo.create({
                user_id = uid, email = uid .. "@test.local", password = PASSWORD,
                full_name = "Scope Union", status = "active",
            })
            test.is_nil(create_err)
            test.not_nil(created)
            for _, groups in ipairs({
                { "app.security:scope_sales", "app.security:scope_support", "app.security:scope_restricted" },
                { "app.security:scope_restricted", "app.security:scope_support", "app.security:scope_sales" },
            }) do
                local assigned, assign_err = user_group_sources_repo.set_user_groups(uid, groups)
                test.is_nil(assign_err)
                test.not_nil(assigned)
                local encoded, encode_err = json.encode({ user_id = uid, password = PASSWORD })
                test.is_nil(encode_err)
                local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                    headers = { ["Content-Type"] = "application/json" }, body = encoded,
                })
                test.is_nil(http_err)
                test.not_nil(response)
                test.eq(response.status_code, 200, tostring(response.body))
                local payload = decode_response(response)
                local store, store_err = security.token_store("kickside.users.security:tokens")
                test.is_nil(store_err)
                test.not_nil(store)
                local actor, scope, validate_err = store:validate(payload.token)
                test.is_nil(validate_err)
                test.not_nil(actor)
                test.not_nil(scope)
                local name = actor:meta().scope_id
                test.is_true(name:match("^kickside%.security%.scopes:set_%x+$") == nil)
                test.eq(payload.security.scope, name)
                local executor, executor_err = funcs.new()
                test.is_nil(executor_err)
                local bound = executor:with_actor(actor):with_scope(scope)
                local recovered, recover_err = bound:call("kickside.users.binding:subject_lookup", {subject_id = uid})
                test.is_nil(recover_err)
                test.eq(recovered.scope_name, name)
                test.eq(#recovered.scope_groups, 3)
                test.eq(#recovered.scope_policy_ids, 0)
                local selected = {}
                for _, group in ipairs(recovered.scope_groups) do selected[group] = true end
                for _, group in ipairs(groups) do test.is_true(selected[group]) end
                test.eq(scope:evaluate(actor, "access", "app:crm.endpoint"), "allow", "CRM group grant")
                test.eq(scope:evaluate(actor, "access", "app:journal.endpoint"), "allow", "Journal group grant")
                test.eq(scope:evaluate(actor, "access", "app:shared.endpoint"), "deny")
                test.eq(scope:evaluate(actor, "access", "app:unassigned.endpoint"), "undefined")
                store:close()
            end
        end)

        test.after_all(function()
            local deleted, delete_err = user_lifecycle_repo.delete("login_scope_union")
            test.is_nil(delete_err)
            test.not_nil(deleted)
            pcall(function()
                user_lifecycle_repo.delete(USER_ID)
            end)
        end)

        test.it("returns the same credentials rejection for missing, wrong and inactive accounts", function()
            local uid = "consolidation_login_rejections"
            local created, create_err = user_repo.create({
                user_id = uid, email = uid .. "@test.local", password = PASSWORD,
                full_name = "Login Rejections", status = "suspended",
            })
            test.is_nil(create_err)
            test.not_nil(created)
            for _, candidate in ipairs({
                { user_id = uid .. "_absent", password = PASSWORD },
                { user_id = uid, password = "wrong-password" },
                { user_id = uid, password = PASSWORD },
            }) do
                local encoded, encode_err = json.encode(candidate)
                test.is_nil(encode_err)
                local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                    headers = { ["Content-Type"] = "application/json" }, body = encoded,
                })
                test.is_nil(http_err)
                test.not_nil(response)
                test.eq(response.status_code, 401)
                local payload = decode_response(response)
                test.eq(payload.success, false)
                test.eq(payload.error, "Invalid credentials")
                test.is_nil(payload.details)
                test.is_nil(payload.token)
            end
            local deleted, delete_err = user_lifecycle_repo.delete(uid)
            test.is_nil(delete_err)
            test.not_nil(deleted)
        end)

        test.it("stores the resolved runtime scope in actor metadata", function()
            local created, create_err = user_repo.create({
                user_id = USER_ID,
                email = EMAIL,
                password = PASSWORD,
                full_name = "Login Scope Test",
                status = "active",
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local assigned, assign_err = user_groups_repo.assign_user_to_group(USER_ID, SCOPE_ID)
            test.is_nil(assign_err)
            test.not_nil(assigned)

            local response, http_err = http_client.post(gateway_url("/api/public/user/token"), {
                headers = {
                    ["Content-Type"] = "application/json",
                },
                body = json.encode({
                    user_id = USER_ID,
                    password = PASSWORD,
                    metadata = {
                        user_id = "forged-user",
                        email = "forged@example.invalid",
                        full_name = "forged prompt identity",
                        status = "suspended",
                        security_groups = { "app.security:admin" },
                        login_time = "forged-time",
                        scope_id = "app.security:admin",
                        client_trace = "preserved",
                    },
                }),
            })
            test.is_nil(http_err)
            test.not_nil(response)
            test.eq(response.status_code, 200, tostring(response.body or ""))

            local payload = decode_response(response)
            test.eq(payload.success, true)
            test.eq(payload.security.scope, SCOPE_ID)
            test.eq(payload.actor.id, USER_ID)

            local token = tostring(payload.token or "")
            test.ok(token ~= "")

            local token_store, store_err = security.token_store("kickside.users.security:tokens")
            test.is_nil(store_err)
            test.not_nil(token_store)

            local actor, _, validate_err = token_store:validate(token)
            test.is_nil(validate_err)
            test.not_nil(actor)
            test.eq(actor:id(), USER_ID)

            local metadata: any = actor:meta() or {}
            test.eq(metadata.email, EMAIL)
            test.eq(metadata.user_id, USER_ID)
            test.eq(metadata.full_name, "Login Scope Test")
            test.eq(metadata.status, "active")
            test.eq(metadata.scope_id, SCOPE_ID)
            test.eq(metadata.security_groups[1], SCOPE_ID)
            test.neq(metadata.login_time, "forged-time")
            test.eq(metadata.client_trace, "preserved")

            local generation = assert(user_repo.get(USER_ID)).auth_generation
            local changed, change_err = user_group_sources_repo.set_user_groups(USER_ID, { SCOPE_ID })
            test.is_nil(change_err)
            test.not_nil(changed)
            local retained_actor, retained_scope, retained_err = token_store:validate(token)
            test.is_nil(retained_err)
            test.eq(retained_actor:id(), USER_ID)
            test.eq(retained_scope:evaluate(retained_actor, "access", "app:no-op-probe"), "allow")
            test.eq(assert(user_repo.get(USER_ID)).auth_generation, generation)

            token_store:close()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
