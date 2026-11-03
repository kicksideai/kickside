-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local writer = require("scope_writer")
local store = require("scope_store")
local trigger = require("trigger_reconcile")
local group_sets = require("group_sets")
local resolver = require("group_resolver")
local source_scope = require("source_scope")

return {run = test.run_cases(function()
    test.describe("staged scope API upgrade", function()
        test.it("keeps the old multi-group API stable and revokes its selected grants", function()
            local original = assert(registry.current_version())
            local projector, set_name
            local slug = "staged_upgrade_custom"
            local native_group = "app:staged_upgrade_native"
            local custom_group = "kickside.security.scopes:" .. slug
            local ok, failure = pcall(function()
                local entry = assert(registry.get("kickside.security.binding:materialize_group_set"))
                test.eq(entry.kind, "function.lua")
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:staged_native_grant", kind = "security.policy", data = {
                    groups = {native_group}, policy = {actions = "read", resources = "staged:native", effect = "allow"}}})
                changes:create({id = "app:staged_selected_grant", kind = "security.policy", data = {
                    policy = {actions = "read", resources = "staged:selected", effect = "allow"}}})
                assert(changes:apply())
                projector = writer.start_projector()
                assert(store.upsert({slug = slug, policies = {"app:staged_selected_grant"}}))
                local result = assert(funcs.call("kickside.security.binding:materialize_group_set",
                    {groups = {native_group, custom_group}}))
                set_name = result.scope_name
                local again = assert(funcs.call("kickside.security.binding:materialize_group_set",
                    {groups = {custom_group, native_group, native_group}}))
                test.eq(again.scope_name, set_name)
                local actor = assert(security.new_actor("staged-upgrade"))
                local before = assert(security.named_scope(set_name))
                test.eq(before:evaluate(actor, "read", "staged:native"), "allow")
                test.eq(before:evaluate(actor, "read", "staged:selected"), "allow")
                local live_before = assert(source_scope.resolve(set_name))
                test.eq(live_before:evaluate(actor, "read", "staged:native"), "allow")
                test.eq(live_before:evaluate(actor, "read", "staged:selected"), "allow")
                local generated = assert(registry.find({[".kind"] = "security.policy",
                    ["meta.scope_projection_policy"] = "app:staged_selected_grant"}))
                test.eq(#generated, 1)
                assert(trigger.trigger())
                test.not_nil(assert(registry.get(tostring(generated[1].id))))
                assert(store.upsert({slug = slug, policies = {}}))
                assert(trigger.trigger())
                local after = assert(security.named_scope(set_name))
                test.eq(after:evaluate(actor, "read", "staged:native"), "allow")
                test.neq(after:evaluate(actor, "read", "staged:selected"), "allow")
                local live_after = assert(source_scope.resolve(set_name))
                test.eq(live_after:evaluate(actor, "read", "staged:native"), "allow")
                test.eq(live_after:evaluate(actor, "read", "staged:selected"), "undefined")
            end)
            if projector then
                assert(store.delete(slug))
                writer.stop_projector(projector)
            end
            if set_name then
                local db = assert(sql.get("app:db"))
                local _, err = db:execute("DELETE FROM kickside_security_group_sets WHERE scope_name=$1", {set_name})
                db:release()
                assert(not err, tostring(err))
            end
            assert(registry.apply_version(original))
            if not ok then error(failure) end
        end)

        test.it("resolves source IDs without registering a new group set", function()
            local original = assert(registry.current_version())
            local slug = "staged_source_only"
            local projector
            local ok, failure = pcall(function()
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:staged_unbound_source", kind = "security.policy", data = {
                    policy = {actions = "read", resources = "staged:new_source", effect = "allow"}}})
                assert(changes:apply())
                local previous = #assert(group_sets.list())
                projector = writer.start_projector()
                assert(store.upsert({slug = slug, policies = {"app:staged_unbound_source"}}))
                assert(trigger.trigger())
                local selected = assert(resolver.resolve({"kickside.security.scopes:" .. slug}))
                test.eq(#selected.groups, 0)
                test.eq(selected.policy_ids[1], "app:staged_unbound_source")
                test.eq(#assert(group_sets.list()), previous)

            end)
            if projector then
                assert(store.delete(slug))
                writer.stop_projector(projector)
            end
            assert(registry.apply_version(original))
            if not ok then error(failure) end
        end)
    end)
end)}
