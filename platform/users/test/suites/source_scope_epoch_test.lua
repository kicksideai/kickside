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

local function define_tests()
    test.describe("source policy session authority", function()
        local uid = "source_epoch_session"
        local slug = "source_epoch_scope"
        local group = "kickside.security.scopes:" .. slug
        local source = "app:source_epoch_grant"
        local account, tokens

        test.before_each(function()
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = source, kind = "security.policy", data = {
                policy = {actions = "source.scope", resources = "app:selected", effect = "allow"}}})
            test.is_nil(select(2, changes:apply()))
            test.not_nil((scope_store.upsert({slug = slug, policies = {source}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = "scope-password", status = "active"})))
            test.not_nil((user_group_sources_repo.set_user_groups(uid, {group})))
            account = assert(user_groups_repo.get_user_with_groups(uid))
            tokens = assert(security.token_store("kickside.users.security:tokens"))
        end)

        test.after_each(function()
            tokens:close()
            test.not_nil((user_lifecycle_repo.delete(uid)))
            test.is_true((scope_store.delete(slug)))
            test.not_nil((trigger_reconcile.trigger()))
            local changes = assert(registry.snapshot()):changes()
            changes:delete(source)
            test.is_nil(select(2, changes:apply()))
            test.not_nil((trigger_reconcile.trigger()))
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

        test.it("refreshes an indexed source-policy token after its authority epoch changes", function()
            local minted = assert(session.mint(account))
            local scope = assert(security.new_scope({assert(security.policy(source))}))
            local token = assert(tokens:create(minted.actor, scope, {expiration = "1h"}))
            test.not_nil((session_index.record_minted(token, uid, account.auth_generation, "2099-01-01T00:00:00Z")))
            local before_actor, before_scope, before_err = tokens:validate(token)
            test.is_nil(before_err)
            test.eq(before_scope:evaluate(before_actor, "source.scope", "app:selected"), "allow")

            test.not_nil((scope_store.upsert({slug = slug, policies = {}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
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

        test.it("creates no generated binding or metadata policies", function()
            for _, entry in ipairs(assert(registry.find({[".kind"] = "security.policy"}))) do
                local meta = entry.meta or {}
                test.is_nil(meta.scope_projection_policy, "scope composition creates no binding policy")
                test.neq(meta.scope_metadata, true, "scope composition creates no metadata policy")
            end
        end)
    end)
end
return {run = test.run_cases(define_tests)}
