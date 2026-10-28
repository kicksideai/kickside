-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")
local admin = require("admin_repo")
local groups = require("user_groups_repo")
local sources = require("user_group_sources_repo")
local lifecycle = require("user_lifecycle_repo")
local consts = require("user_consts")
local session = require("session")
local directory = require("directory")

local OLD, MEMBER, CUSTOM = "test:former_members", "test:member", "test:restricted_role"
local BASE = "app.security:user"

local function fixture(run)
    local membership = assert(registry.get("kickside.users:membership_config"))
    local baseline = assert(registry.get("kickside.users.env:baseline_group_id"))
    local changed_baseline = {}
    for k, v in pairs(baseline.data) do changed_baseline[k] = v end
    changed_baseline.default = BASE
    local changes = assert(registry.snapshot()):changes()
    changes:update({id = membership.id, kind = membership.kind,
        meta = {aliases = {[OLD] = MEMBER}}, data = membership.data})
    changes:update({id = baseline.id, kind = baseline.kind, meta = baseline.meta, data = changed_baseline})
    changes:create({id = "app:member_upgrade_access", kind = "security.policy", data = {
        groups = {OLD, MEMBER}, policy = {actions = "access", resources = "app:member_upgrade", effect = "allow"}}})
    changes:create({id = "app:member_upgrade_custom", kind = "security.policy", data = {
        groups = {CUSTOM}, policy = {actions = "access", resources = "app:restricted_upgrade", effect = "allow"}}})
    test.is_nil(select(2, changes:apply()))
    local created = {}
    local function account(suffix, roles)
        local id = "membership_upgrade_" .. suffix
        local user, err = admin.create({user_id = id, email = id .. "@test.local", password = "testpass123", status = "active"}, roles)
        test.is_nil(err)
        test.not_nil(user)
        created[#created + 1] = id
        return id
    end
    local ok, failure = pcall(run, account)
    for _, id in ipairs(created) do test.not_nil((lifecycle.delete(id))) end
    changes = assert(registry.snapshot()):changes()
    changes:update(membership)
    changes:update(baseline)
    changes:delete("app:member_upgrade_access")
    changes:delete("app:member_upgrade_custom")
    if registry.get("app:member_upgrade_extra") then changes:delete("app:member_upgrade_extra") end
    test.is_nil(select(2, changes:apply()))
    if not ok then error(failure) end
end

return test.run_cases(function()
    test.describe("default role consolidation", function()
        test.it("stores only the selected role on a new account and supplies signed-in access at login", function()
            fixture(function(account)
                local id = account("new", {MEMBER})
                local user = assert(groups.get_user_with_groups(id))
                local minted, mint_err = session.mint(user)
                test.is_nil(mint_err)
                test.not_nil(minted)
                test.eq(table.concat(assert(groups.get_user_groups(id)).groups, ","), MEMBER)
                test.eq(minted.scope:evaluate(minted.actor, "access", "app:member_upgrade"), "allow")
                local subjects = {}
                for _, group in ipairs(minted.actor:meta().security_groups) do subjects[group] = true end
                test.eq(subjects[OLD], true, "retired role ACLs remain usable")
                test.eq(subjects[BASE], true, "signed-in ACLs remain usable")
            end)
        end)

        test.it("replaces the former default, removes its duplicate and keeps custom roles and live sessions", function()
            fixture(function(account)
                local id = account("existing", {OLD, MEMBER, BASE, CUSTOM})
                local current = assert(groups.get_user_with_groups(id))
                local minted = assert(session.mint(current))
                local upgraded, err = sources.upgrade_memberships(OLD, MEMBER)
                test.is_nil(err)
                test.not_nil(upgraded)
                local assigned = assert(groups.get_user_groups(id)).groups
                table.sort(assigned)
                test.eq(table.concat(assigned, ","), MEMBER .. "," .. CUSTOM)
                local tokens = assert(security.token_store("kickside.users.security:tokens"))
                local actor, _, token_err = tokens:validate(minted.token)
                tokens:close()
                test.is_nil(token_err)
                test.eq(actor:id(), id)
                local validated_groups = {}
                for _, group in ipairs(actor:meta().security_groups) do validated_groups[group] = true end
                test.eq(validated_groups[OLD], true, "live credential validation retains retired-role ACLs")
                test.eq(validated_groups[BASE], true)
                local live, live_err = directory.groups({id = id})
                test.is_nil(live_err)
                test.eq(live.active, true)
                local acl_groups = {}
                for _, group in ipairs(live.groups) do acl_groups[group] = true end
                test.eq(acl_groups[OLD], true, "live record ACL lookup retains the former role id")
                test.eq(acl_groups[BASE], true)
                test.eq(assert(sources.upgrade_memberships(OLD, MEMBER)).upgraded, 0)
            end)
        end)

        test.it("does not enroll a restricted account into Member", function()
            fixture(function(account)
                local id = account("restricted", {BASE, CUSTOM})
                test.not_nil((sources.upgrade_memberships(OLD, MEMBER)))
                test.eq(table.concat(assert(groups.get_user_groups(id)).groups, ","), CUSTOM)
            end)
        end)

        test.it("refuses a replacement that would drop an old role's extra authority", function()
            fixture(function(account)
                local id = account("extended", {OLD})
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:member_upgrade_extra", kind = "security.policy", data = {
                    groups = {OLD}, policy = {actions = "access", resources = "app:old_role_extension", effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                local membership = assert(registry.get("kickside.users:membership_config"))
                changes = assert(registry.snapshot()):changes()
                changes:update({id = membership.id, kind = membership.kind, meta = {aliases = {}}, data = membership.data})
                test.is_nil(select(2, changes:apply()))
                local result, err = sources.upgrade_memberships(OLD, MEMBER)
                test.is_nil(result)
                test.not_nil(err)
                test.eq(table.concat(assert(groups.get_user_groups(id)).groups, ","), OLD)
            end)
        end)
    end)
end)
