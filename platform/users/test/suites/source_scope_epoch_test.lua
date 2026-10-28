-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local session = require("session")
local session_index = require("session_index")
local scope_store = require("scope_store")
local trigger_reconcile = require("trigger_reconcile")
local funcs = require("funcs")
local http_client = require("http_client")
local json = require("json")

local function define_tests()
    test.describe("source policy session authority", function()
        local uid = "source_epoch_session"
        local slug = "source_epoch_scope"
        local group = "kickside.security.scopes:" .. slug
        local source = "app:source_epoch_grant"
        local account, tokens, parent_declaration

        test.before_each(function()
            parent_declaration = nil
            assert(trigger_reconcile.trigger())
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = source, kind = "security.policy", data = {
                policy = {actions = "source.scope", resources = "app:selected", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            assert(scope_store.upsert({slug = slug, policies = {source}}, "tester"))
            assert(trigger_reconcile.trigger())
            assert(user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = "scope-password", status = "active"}))
            assert(user_group_sources_repo.set_user_groups(uid, {group}))
            account = assert(user_groups_repo.get_user_with_groups(uid))
            tokens = assert(security.token_store("kickside.users.security:tokens"))
        end)

        test.after_each(function()
            if tokens then tokens:close() end
            assert(user_lifecycle_repo.delete(uid))
            assert(scope_store.delete(slug))
            assert(trigger_reconcile.trigger())
            local changes = assert(registry.snapshot()):changes()
            changes:delete(source)
            if parent_declaration then changes:delete(parent_declaration) end
            test.is_nil(select(2, changes:apply()))
            assert(trigger_reconcile.trigger())
        end)

        test.it("maps the internal scope descriptor to Runtime's subject authority contract", function()
            local request = {subject_id = uid, authority_only = true}
            local internal, lookup_err = funcs.call("kickside.users.binding:subject_lookup", request)
            test.is_nil(lookup_err)
            test.eq(internal.groups[1], group)
            test.eq(internal.scope_policy_ids[1], source)
            test.is_nil(internal.policies)

            local credential, credential_err = funcs.call("kickside.users.binding:credential_subject_lookup", request)
            test.is_nil(credential_err)
            test.eq(credential.subject_id, uid)
            test.eq(#credential.groups, 0)
            test.eq(#credential.policies, 1)
            test.eq(credential.policies[1], source)
            test.eq(credential.authority_epochs["kickside.users:" .. uid],
                internal.authority_epochs["kickside.users:" .. uid])
        end)

        test.it("mints custom sessions with source policy references", function()
            local minted = assert(session.mint(account))
            local actor, scope, validate_err = tokens:validate(minted.token)
            test.is_nil(validate_err)
            test.eq(scope:evaluate(actor, "source.scope", "app:selected"), "allow")
            test.eq(scope:evaluate(actor, "source.scope", "app:unselected"), "undefined")
            local selected = false
            for _, policy in ipairs(scope:policies()) do
                if policy:id() == source then selected = true end
            end
            test.is_true(selected, "session retains its selected source policy id")
        end)

        test.it("resolves source scopes through the existing session projection policy", function()
            local policy = assert(security.policy("kickside.users.security:session_group_set_projection"))
            local scope = assert(security.new_scope({policy}))
            local actor = assert(security.new_actor("session-projection-consumer", {}))
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.users.api:create_user"), "undefined")
            test.eq(scope:evaluate(actor, "db.get", "app:db"), "undefined")
            test.eq(scope:evaluate(actor, "security.token.create", "kickside.users.security:tokens"), "undefined")

            local gateway = assert(registry.get("app:gateway"))
            local port = assert(tostring(gateway.data.addr):match(":(%d+)$"))
            local response, request_err = http_client.post("http://127.0.0.1:" .. port .. "/api/public/test/session-scope-projection", {
                headers = {["Content-Type"] = "application/json"},
                body = json.encode({groups = {group}}),
            })
            test.is_nil(request_err)
            test.eq(response.status_code, 200, response.body)
            local resolved = assert(json.decode(response.body))
            test.eq(#resolved.policy_ids, 1)
            test.eq(resolved.policy_ids[1], source)
        end)

        test.it("refreshes an indexed source-policy token after its authority epoch changes", function()
            local minted = assert(session.mint(account))
            local scope = assert(security.new_scope({assert(security.policy(source))}))
            local token = assert(tokens:create(minted.actor, scope, {expiration = "1h"}))
            test.not_nil((session_index.record_minted(token, uid, account.auth_generation, "2099-01-01T00:00:00Z")))
            local before_actor, before_scope, before_err = tokens:validate(token)
            test.is_nil(before_err)
            test.eq(before_scope:evaluate(before_actor, "source.scope", "app:selected"), "allow")

            test.not_nil((scope_store.upsert({slug = slug, policies = {}}, "tester")))
            assert(trigger_reconcile.trigger())
            local changed = assert(user_groups_repo.get_user_with_groups(uid))
            test.is_true(changed.delegation_generation > account.delegation_generation,
                "selection removal advances the user authority epoch")
            local actor, current, validate_err = tokens:validate(token)
            test.is_nil(validate_err, "scope changes keep the session authenticated")
            test.eq(actor:id(), uid)
            test.eq(actor:meta().authority_epochs["kickside.users:" .. uid], changed.delegation_generation,
                "validation returns the current authority epoch")
            test.eq(current:evaluate(actor, "source.scope", "app:selected"), "undefined",
                "removed scope policies stop authorizing the existing session after its epoch advances")
            local refreshed = assert(session.mint(changed))
            local fresh_actor, fresh_scope, fresh_err = tokens:validate(refreshed.token)
            test.is_nil(fresh_err)
            test.eq(fresh_scope:evaluate(fresh_actor, "source.scope", "app:selected"), "undefined")
        end)

        test.it("validates selected source policies through native subject lookup without group bindings", function()
            local scope = assert(security.new_scope({assert(security.policy(source))}))
            local actor = assert(security.new_actor(uid, {}))
            test.eq(scope:evaluate(actor, "source.scope", "app:selected"), "allow")
            local store = assert(security.token_store("kickside.users:source_scope_test_tokens"))
            local token = assert(store:create(actor, scope, {expiration = "1h"}))
            local current_actor, current_scope, validate_err = store:validate(token)
            local revoked, revoke_err = store:revoke(token)
            store:close()
            test.is_nil(revoke_err)
            test.is_true(revoked)
            test.is_nil(validate_err)
            test.eq(current_actor:id(), uid)
            test.eq(current_scope:evaluate(current_actor, "source.scope", "app:selected"), "allow",
                "native subject lookup preserves the DB-selected source policy without a group binding")
        end)

        test.it("advances authority epochs for members of a composed custom scope", function()
            parent_declaration = "app:source_epoch_parent_declaration"
            local parent = "app:source_epoch_parent"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = parent_declaration, kind = "registry.entry", meta = {
                type = "kickside.security.group_composition"}, data = {group_id = parent, groups = {group}}})
            test.not_nil(assert(changes:apply()))
            assert(trigger_reconcile.trigger())
            assert(user_group_sources_repo.set_user_groups(uid, {parent}))
            local member = assert(user_groups_repo.get_user_with_groups(uid))
            local minted = assert(session.mint(member))
            local before_actor, before_scope = tokens:validate(minted.token)
            test.eq(before_scope:evaluate(before_actor, "source.scope", "app:selected"), "allow")
            assert(scope_store.upsert({slug = slug, policies = {}}, "tester"))
            local current = assert(user_groups_repo.get_user_with_groups(uid))
            test.is_true(current.delegation_generation > member.delegation_generation,
                "custom scope changes advance the epochs of composed memberships")
            local actor, scope, err = tokens:validate(minted.token)
            test.is_nil(err)
            test.eq(scope:evaluate(actor, "source.scope", "app:selected"), "undefined")
        end)

        test.it("removes an overlay grant from its previous target before catalog reconciliation", function()
            local minted = assert(session.mint(account))
            local before_actor, before_scope = tokens:validate(minted.token)
            test.eq(before_scope:evaluate(before_actor, "source.scope", "app:selected"), "allow")
            assert(scope_store.upsert({slug = slug, target = "app.security:scope_support", policies = {source}}, "tester"))
            local actor, current, err = tokens:validate(minted.token)
            test.is_nil(err)
            test.eq(current:evaluate(actor, "source.scope", "app:selected"), "undefined",
                "a DB selection cannot keep granting through its previous target descriptor")
            assert(trigger_reconcile.trigger())
        end)

        test.it("advances only the authority epoch when a custom membership is added", function()
            assert(user_group_sources_repo.set_user_groups(uid, {"app.security:scope_support"}))
            local before = assert(user_groups_repo.get_user_with_groups(uid))
            local minted = assert(session.mint(before))
            assert(user_group_sources_repo.set_user_groups(uid, {"app.security:scope_support", group}))
            local current = assert(user_groups_repo.get_user_with_groups(uid))
            test.eq(current.auth_generation, before.auth_generation)
            test.is_true(current.delegation_generation > before.delegation_generation)
            local actor, scope, err = tokens:validate(minted.token)
            test.is_nil(err)
            test.eq(actor:meta().authority_epochs["kickside.users:" .. uid], current.delegation_generation)
            test.eq(scope:evaluate(actor, "source.scope", "app:selected"), "allow")
        end)

        test.it("keeps live authority empty when no membership selects the default overlay", function()
            assert(scope_store.upsert({slug = slug, target = "app.security:user", policies = {source}}, "tester"))
            assert(trigger_reconcile.trigger())
            assert(user_group_sources_repo.set_user_groups(uid, {}))
            local actor = assert(security.new_actor(uid, {}))
            local selected = assert(security.new_scope({assert(security.policy(source))}))
            local token = assert(tokens:create(actor, selected, {expiration = "1h"}))
            local current_actor, current_scope, err = tokens:validate(token)
            local revoked, revoke_err = tokens:revoke(token)
            test.is_nil(revoke_err)
            test.is_true(revoked)
            test.is_nil(err)
            test.eq(current_scope:evaluate(current_actor, "source.scope", "app:selected"), "undefined",
                "live membership authority does not inherit a session-mint default")
        end)

        test.it("mints source references without registering a union scope", function()
            local function union_count()
                local count = 0
                for _, entry in ipairs(assert(registry.find({[".kind"] = "security.scope",
                        ["meta.managed_by"] = "kickside.security.scopes"}))) do
                    if tostring(entry.id):match("^kickside%.security%.scopes:set_") then count = count + 1 end
                end
                return count
            end
            local before = union_count()
            assert(user_group_sources_repo.set_user_groups(uid, {group, "app.security:scope_support"}))
            local minted = assert(session.mint(assert(user_groups_repo.get_user_with_groups(uid))))
            local selected = false
            for _, policy in ipairs(minted.scope:policies()) do
                if policy:id() == source then selected = true end
            end
            test.is_true(selected, "the custom grant retains its original policy identity")
            test.eq(union_count(), before, "minting a new membership combination creates no union scope")
        end)

    end)
end
return {run = test.run_cases(define_tests)}
