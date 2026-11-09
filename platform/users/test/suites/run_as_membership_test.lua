local test = require("test")
local security = require("security")
local crypto = require("crypto")
local admin_repo = require("admin_repo")
local session = require("session")
local provisioning = require("provisioning")
local user_repo = require("user_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_groups_repo = require("user_groups_repo")
local user_group_sources_repo = require("user_group_sources_repo")

local BASE_GROUP = "app.security:run_as_membership_baseline"
local ALLOW_GROUP = "app.security:run_as_membership_allow"
local DENY_GROUP = "app.security:run_as_membership_deny"
local ACL_GROUP = "app:run_as_membership_acl_only"
local EXTENSION_RESOURCE = "app:run_as_membership_extension"

local function new_user(label)
    local id, id_err = crypto.random.uuid()
    if id_err then error(tostring(id_err)) end
    local user_id = label .. "-" .. id
    local user, create_err = user_repo.create({
        user_id = user_id,
        email = user_id .. "@test.local",
        password = "run-as-membership-password",
        status = "active",
    })
    test.is_nil(create_err)
    test.not_nil(user)
    local assigned, assign_err = user_group_sources_repo.set_user_groups(user_id, { BASE_GROUP })
    test.is_nil(assign_err)
    test.not_nil(assigned)
    return user_id
end

local function mint(user_id)
    local user, user_err = user_groups_repo.get_user_with_groups(user_id)
    test.is_nil(user_err)
    local minted, mint_err = session.mint(user)
    test.is_nil(mint_err)
    test.not_nil(minted)
    return assert(minted.token)
end

local function validate(token)
    local store, store_err = security.token_store("kickside.users.security:tokens")
    test.is_nil(store_err)
    local actor, scope, validation_err = store:validate(token)
    store:close()
    return actor, scope, validation_err
end

local function delete_user(user_id)
    local deleted, delete_err = user_lifecycle_repo.delete(user_id)
    test.is_nil(delete_err)
    test.not_nil(deleted)
end

local function define_tests()
    test.describe("run-as membership session effects", function()
        test.it("applies an allow-only manual membership addition to an existing token", function()
            local user_id = new_user("run-as-manual-expansion")
            local old_token = mint(user_id)
            local old_actor, old_scope, old_err = validate(old_token)
            test.is_nil(old_err)
            test.eq(old_scope:evaluate(old_actor, "access", EXTENSION_RESOURCE), "undefined")

            local assigned, assign_err = user_groups_repo.assign_user_to_group(user_id, ALLOW_GROUP)
            test.is_nil(assign_err)
            test.not_nil(assigned)
            test.is_false(assigned.already_assigned == true)

            old_actor, old_scope, old_err = validate(old_token)
            test.is_nil(old_err)
            test.eq(old_scope:evaluate(old_actor, "access", EXTENSION_RESOURCE), "allow")
            local fresh_token = mint(user_id)
            local fresh_actor, fresh_scope, fresh_err = validate(fresh_token)
            test.is_nil(fresh_err)
            test.eq(fresh_scope:evaluate(fresh_actor, "access", EXTENSION_RESOURCE), "allow")
            delete_user(user_id)
        end)

        test.it("keeps a token on a no-op whole-set replacement and revokes it when that writer removes an allow", function()
            local user_id = new_user("run-as-whole-set")
            local old_token = mint(user_id)
            local unchanged, unchanged_err = user_group_sources_repo.set_user_groups(user_id, { BASE_GROUP })
            test.is_nil(unchanged_err)
            test.not_nil(unchanged)
            local _, _, old_err = validate(old_token)
            test.is_nil(old_err)

            local expanded, expand_err = user_group_sources_repo.set_user_groups(user_id, { BASE_GROUP, ALLOW_GROUP })
            test.is_nil(expand_err)
            test.not_nil(expanded)
            local old_actor, old_scope
            old_actor, old_scope, old_err = validate(old_token)
            test.is_nil(old_err)
            test.eq(old_scope:evaluate(old_actor, "access", EXTENSION_RESOURCE), "allow")

            local fresh_token = mint(user_id)
            local reduced, reduce_err = user_group_sources_repo.set_user_groups(user_id, { BASE_GROUP })
            test.is_nil(reduce_err)
            test.not_nil(reduced)
            local _, _, revoked_err = validate(fresh_token)
            test.not_nil(revoked_err)
            test.not_nil(select(3, validate(old_token)))
            delete_user(user_id)
        end)

        test.it("classifies sourced additions as expansions and sourced removals as reductions", function()
            local user_id = new_user("run-as-sourced")
            local old_token = mint(user_id)
            local expanded, expand_err = provisioning.reconcile_sourced_groups(user_id, "run-as-membership", { ALLOW_GROUP })
            test.is_nil(expand_err)
            test.not_nil(expanded)
            local old_actor, old_scope, old_err = validate(old_token)
            test.is_nil(old_err)
            test.eq(old_scope:evaluate(old_actor, "access", EXTENSION_RESOURCE), "allow")

            local fresh_token = mint(user_id)
            local reduced, reduce_err = provisioning.reconcile_sourced_groups(user_id, "run-as-membership", {})
            test.is_nil(reduce_err)
            test.not_nil(reduced)
            local _, _, revoked_err = validate(fresh_token)
            test.not_nil(revoked_err)
            test.not_nil(select(3, validate(old_token)))
            delete_user(user_id)
        end)

        test.it("revokes on manual allow removal, deny addition and deny-group membership removal", function()
            local user_id = new_user("run-as-reductions")
            local allowed, allow_err = user_groups_repo.assign_user_to_group(user_id, ALLOW_GROUP)
            test.is_nil(allow_err)
            test.not_nil(allowed)
            local allow_token = mint(user_id)
            local removed_allow, remove_allow_err = user_groups_repo.remove_user_from_group(user_id, ALLOW_GROUP)
            test.is_nil(remove_allow_err)
            test.is_true(removed_allow.removed)
            local _, _, removed_allow_err = validate(allow_token)
            test.not_nil(removed_allow_err)

            local allowed_again, allowed_again_err = user_groups_repo.assign_user_to_group(user_id, ALLOW_GROUP)
            test.is_nil(allowed_again_err)
            test.not_nil(allowed_again)
            local deny_token = mint(user_id)
            local denied, deny_err = user_groups_repo.assign_user_to_group(user_id, DENY_GROUP)
            test.is_nil(deny_err)
            test.not_nil(denied)
            local _, _, denied_err = validate(deny_token)
            test.not_nil(denied_err)

            local restricted_token = mint(user_id)
            local removed, remove_err = user_groups_repo.remove_user_from_group(user_id, DENY_GROUP)
            test.is_nil(remove_err)
            test.is_true(removed.removed)
            local _, _, removed_err = validate(restricted_token)
            test.not_nil(removed_err)
            local fresh_token = mint(user_id)
            local fresh_actor, fresh_scope, fresh_err = validate(fresh_token)
            test.is_nil(fresh_err)
            test.eq(fresh_scope:evaluate(fresh_actor, "access", EXTENSION_RESOURCE), "allow")
            delete_user(user_id)
        end)

        local writers = {
            {name = "manual", add = function(uid)
                return user_groups_repo.assign_user_to_group(uid, ACL_GROUP)
            end, remove = function(uid)
                return user_groups_repo.remove_user_from_group(uid, ACL_GROUP)
            end},
            {name = "sourced", add = function(uid)
                return provisioning.reconcile_sourced_groups(uid, "run-as-acl", {ACL_GROUP})
            end, remove = function(uid)
                return provisioning.reconcile_sourced_groups(uid, "run-as-acl", {})
            end},
            {name = "whole-set", add = function(uid)
                return user_group_sources_repo.set_user_groups(uid, {BASE_GROUP, ACL_GROUP})
            end, remove = function(uid)
                return user_group_sources_repo.set_user_groups(uid, {BASE_GROUP})
            end},
        }
        for _, writer in ipairs(writers) do
            test.it("revokes a removed ACL-only membership through the " .. writer.name .. " writer", function()
                local uid = new_user("run-as-acl-" .. writer.name)
                local original = mint(uid)
                local added, add_err = writer.add(uid)
                test.is_nil(add_err)
                test.not_nil(added)
                test.is_nil(select(3, validate(original)))
                local token = mint(uid)
                local actor, _, token_err = validate(token)
                test.is_nil(token_err)
                local carried = false
                for _, group in ipairs(actor:meta().security_groups) do
                    if group == ACL_GROUP then carried = true end
                end
                test.is_true(carried)
                local removed, remove_err = writer.remove(uid)
                test.is_nil(remove_err)
                test.not_nil(removed)
                local _, _, revoked_err = validate(token)
                delete_user(uid)
                test.not_nil(revoked_err)
            end)
        end

        test.it("keeps SSO completion replays and expansions, then revokes a sourced reduction", function()
            local uid = "sso-session-" .. assert(crypto.random.uuid())
            local created, create_err = user_repo.create_passwordless({
                user_id = uid, email = uid .. "@test.local", status = "pending",
            })
            test.is_nil(create_err)
            test.not_nil(created)
            local function complete(groups)
                local result = provisioning.complete_passwordless_user({identifier = uid,
                    source = "run-as-sso", default_group = BASE_GROUP, group_ids = groups})
                test.is_true(result.ok, tostring(result.error))
            end
            complete({})
            local token = mint(uid)
            complete({})
            test.is_nil(select(3, validate(token)))
            complete({ALLOW_GROUP})
            local actor, scope, err = validate(token)
            test.is_nil(err)
            test.eq(scope:evaluate(actor, "access", EXTENSION_RESOURCE), "allow")
            local fresh = mint(uid)
            complete({})
            test.not_nil(select(3, validate(fresh)))
            test.not_nil(select(3, validate(token)))
            delete_user(uid)
        end)

        test.it("keeps a token for an allow-only administrative whole-set update and revokes it for a reduction", function()
            local user_id = new_user("run-as-admin-whole-set")
            local old_token = mint(user_id)
            local expanded, expand_err = admin_repo.update(user_id, {}, { BASE_GROUP, ALLOW_GROUP })
            test.is_nil(expand_err)
            test.not_nil(expanded)
            test.eq(expanded.sessions_revoked, 0)
            local old_actor, old_scope, old_err = validate(old_token)
            test.is_nil(old_err)
            test.eq(old_scope:evaluate(old_actor, "access", EXTENSION_RESOURCE), "allow")

            local fresh_token = mint(user_id)
            local reduced, reduce_err = admin_repo.update(user_id, {}, { BASE_GROUP })
            test.is_nil(reduce_err)
            test.not_nil(reduced)
            local _, _, revoked_err = validate(fresh_token)
            test.not_nil(revoked_err)
            test.not_nil(select(3, validate(old_token)))
            delete_user(user_id)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
