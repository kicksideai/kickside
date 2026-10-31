-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local sql = require("sql")
local funcs = require("funcs")
local security = require("security")
local writer = require("scope_writer")
local trigger = require("trigger_reconcile")
local store = require("scope_store")
local source_scope = require("source_scope")
local group_sets = require("group_sets")
local function run()
    test.describe("Security-owned live resolver boundary", function()
        local projector
        local slug = "resolver_boundary"
        test.before_all(function()
            projector = writer.start_projector()
            assert(store.upsert({slug = slug, policies = {"app:module_access"}}))
            assert(trigger.trigger())
        end)
        test.after_all(function()
            assert(store.delete(slug))
            assert(trigger.trigger())
            writer.stop_projector(projector)
        end)
        test.it("resolves live selections without lending Security's database authority to its caller", function()
            local scope = assert(security.new_scope({assert(security.policy("app:resolver_boundary_calls"))}))
            local result, err = funcs.new():with_actor(assert(security.new_actor("resolver-client"))):with_scope(scope):call(
                "app:resolver_boundary_client", {groups = {"kickside.security.scopes:" .. slug}})
            test.is_nil(err, tostring(err))
            test.is_true(result.database_denied)
            test.eq(result.selected.policy_ids[1], "app:module_access")
            test.eq(#result.selected.groups, 0)
        end)
        for _, projected in ipairs({false, true}) do
            test.it("resolves source compositions before projection: " .. tostring(projected), function()
                local original = assert(registry.current_version())
                local group = "app:resolver_source_group"
                local declaration = "app:resolver_source_composition"
                if not projected then writer.stop_projector(projector) end
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = declaration, kind = "registry.entry",
                    meta = {type = "kickside.security.group_composition"},
                    data = {group_id = group, policies = {"app:module_access"}}})
                if projected then
                    changes:create({id = "app:resolver_source_native", kind = "security.policy", data = {
                        groups = {group}, policy = {actions = "read", resources = "app:source_record", effect = "allow"}}})
                end
                assert(changes:apply())
                if projected then
                    assert(trigger.trigger())
                    writer.stop_projector(projector)
                end
                local ok, failure = pcall(function()
                    if projected then
                        changes = assert(registry.snapshot()):changes()
                        changes:update({id = declaration, kind = "registry.entry",
                            meta = {type = "kickside.security.group_composition"},
                            data = {group_id = group, policies = {"app.security:user.app_shell_access"}}})
                        assert(changes:apply())
                    end
                    local selected, err = funcs.call("kickside.security.runtime:resolve_groups", {groups = {group}})
                    test.is_nil(err, tostring(err))
                    test.eq(#selected.groups, 0, "a composition is not a native policy group")
                    test.eq(#selected.policy_ids, 2)
                    test.eq(selected.policy_ids[1], projected and "app.security:user.app_shell_access" or "app:module_access")
                    local policies = {}
                    for _, id in ipairs(selected.policy_ids) do policies[#policies + 1] = assert(security.policy(id)) end
                    local scope = assert(security.new_scope(policies))
                    local actor = assert(security.new_actor("source-member"))
                    test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), projected and "undefined" or "allow")
                    test.eq(scope:evaluate(actor, "read", "app:source_record"), projected and "allow" or "undefined")
                end)
                test.is_true(assert(registry.apply_version(original)))
                projector = writer.start_projector()
                if not ok then error(failure) end
            end)
        end
        test.it("drops deleted composition grants while retaining native source grants before projection", function()
            local original = assert(registry.current_version())
            local group = "app:resolver_removed_group"
            local declaration = "app:resolver_removed_composition"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = declaration, kind = "registry.entry",
                meta = {type = "kickside.security.group_composition"},
                data = {group_id = group, policies = {"app:module_access"}}})
            changes:create({id = "app:resolver_removed_native", kind = "security.policy", data = {
                groups = {group}, policy = {actions = "read", resources = "app:source_record", effect = "allow"}}})
            assert(changes:apply())
            assert(trigger.trigger())
            writer.stop_projector(projector)
            local ok, failure = pcall(function()
                local actor = assert(security.new_actor("removed-source-member"))
                local before = assert(source_scope.resolve(group))
                test.eq(before:evaluate(actor, "access", "app:module.endpoint"), "allow")
                changes = assert(registry.snapshot()):changes()
                changes:delete(declaration)
                assert(changes:apply())
                local after = assert(source_scope.resolve(group))
                test.eq(after:evaluate(actor, "access", "app:module.endpoint"), "undefined")
                test.eq(after:evaluate(actor, "read", "app:source_record"), "allow")
            end)
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)
        test.it("drops deleted composition inherited grants while retaining native source grants before projection", function()
            local original = assert(registry.current_version())
            local group = "app:resolver_removed_inherited_group"
            local declaration = "app:resolver_removed_inherited_composition"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = declaration, kind = "registry.entry",
                meta = {type = "kickside.security.group_composition"},
                data = {group_id = group, groups = {"app:inherited_source_group"}}})
            changes:create({id = "app:inherited_source_policy", kind = "security.policy", data = {
                groups = {"app:inherited_source_group"}, policy = {actions = "access", resources = "app:module.endpoint", effect = "allow"}}})
            changes:create({id = "app:resolver_removed_inherited_native", kind = "security.policy", data = {
                groups = {group}, policy = {actions = "read", resources = "app:source_record", effect = "allow"}}})
            assert(changes:apply())
            local set_name = assert(group_sets.save({group}))
            assert(trigger.trigger())
            writer.stop_projector(projector)
            local ok, failure = pcall(function()
                local actor = assert(security.new_actor("removed-source-member"))
                local before = assert(source_scope.resolve(group))
                test.eq(before:evaluate(actor, "access", "app:module.endpoint"), "allow")
                local legacy_before = assert(source_scope.resolve(set_name))
                test.eq(legacy_before:evaluate(actor, "access", "app:module.endpoint"), "allow")
                changes = assert(registry.snapshot()):changes()
                changes:delete(declaration)
                assert(changes:apply())
                local after = assert(source_scope.resolve(group))
                test.eq(after:evaluate(actor, "access", "app:module.endpoint"), "undefined")
                test.eq(after:evaluate(actor, "read", "app:source_record"), "allow")
                local legacy_after = assert(source_scope.resolve(set_name))
                test.eq(legacy_after:evaluate(actor, "access", "app:module.endpoint"), "undefined")
                test.eq(legacy_after:evaluate(actor, "read", "app:source_record"), "allow")
            end)
            local db = assert(sql.get("app:db"))
            local _, delete_err = db:execute("DELETE FROM kickside_security_group_sets WHERE scope_name=$1", {set_name})
            db:release()
            assert(not delete_err, tostring(delete_err))
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)
        for _, kind in ipairs({"native", "composition", "referenced composition", "catalog composition"}) do
            for _, projected in ipairs({false, true}) do
                test.it("rejects retired " .. kind .. " groups before reconciliation: " .. tostring(projected), function()
                    local original = assert(registry.current_version())
                    local group, declaration = "app:retired_resolver_group", "app:retired_resolver_source"
                    if not projected then writer.stop_projector(projector) end
                    local changes = assert(registry.snapshot()):changes()
                    if kind == "native" then
                        changes:create({id = declaration, kind = "security.policy", data = {
                            groups = {group}, policy = {actions = "read", resources = "app:retired_record", effect = "allow"}}})
                    else
                        changes:create({id = group, kind = "security.scope", data = {policies = {}}})
                        changes:create({id = declaration, kind = "registry.entry",
                            meta = {type = "kickside.security.group_composition"}, data = {
                                group_id = group, policies = {},
                                groups = kind == "referenced composition" and {"app.security:user"} or {}}})
                    end
                    assert(changes:apply())
                    if projected then
                        assert(trigger.trigger())
                        writer.stop_projector(projector)
                    end
                    local ok, failure = pcall(function()
                        test.not_nil(assert(source_scope.resolve(group)))
                        changes = assert(registry.snapshot()):changes()
                        changes:delete(declaration)
                        if kind ~= "native" and kind ~= "catalog composition" then changes:delete(group) end
                        assert(changes:apply())
                        local version = assert(registry.current_version()):id()
                        local result, err = source_scope.resolve(group)
                        test.is_nil(result)
                        test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
                        test.eq(err:retryable(), false)
                        test.eq(assert(registry.current_version()):id(), version)
                    end)
                    test.is_true(assert(registry.apply_version(original)))
                    projector = writer.start_projector()
                    if not ok then error(failure) end
                end)
            end
        end
        test.it("resolves relative native groups in their policy namespace and rejects them after retirement", function()
            local original = assert(registry.current_version())
            writer.stop_projector(projector)
            local changes = assert(registry.snapshot()):changes()
            for _, namespace in ipairs({"app.relative_first", "app.relative_other"}) do
                changes:create({id = namespace .. ":grant", kind = "security.policy", data = {
                    groups = {"members"}, policy = {actions = "read", resources = namespace .. ":record", effect = "allow"}}})
            end
            assert(changes:apply())
            local ok, failure = pcall(function()
                local actor = assert(security.new_actor("relative-source-member"))
                local group = "app.relative_first:members"
                local native = assert(security.named_scope(group))
                test.eq(native:evaluate(actor, "read", "app.relative_first:record"), "allow")
                for _, projected in ipairs({false, true}) do
                    if projected then
                        projector = writer.start_projector()
                        assert(trigger.trigger())
                        writer.stop_projector(projector)
                    end
                    local scope = assert(source_scope.resolve(group))
                    test.eq(scope:evaluate(actor, "read", "app.relative_first:record"), "allow")
                    test.eq(scope:evaluate(actor, "read", "app.relative_other:record"), "undefined")
                end
                changes = assert(registry.snapshot()):changes()
                changes:delete("app.relative_first:grant")
                assert(changes:apply())
                local scope, err = source_scope.resolve(group)
                test.is_nil(scope)
                test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
                local other = assert(source_scope.resolve("app.relative_other:members"))
                test.eq(other:evaluate(actor, "read", "app.relative_other:record"), "allow")
            end)
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)
        test.it("resolves Runtime expression groups with Runtime's exact group spelling", function()
            local original = assert(registry.current_version())
            writer.stop_projector(projector)
            local relative_policy = "app.resolver_expression:relative"
            local qualified_policy = "app.resolver_expression:qualified"
            local relative_group = "app.resolver_expression:members"
            -- Runtime v0.3.55a exposes fully qualified expression groups using
            -- the same canonical registry ID as ordinary policy groups.
            local qualified_group = "app.other:members"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = relative_policy, kind = "security.policy.expr", data = {
                groups = {"members"}, policy = {actions = "read", resources = "app:expression_relative", expression = "true", effect = "allow"}}})
            changes:create({id = qualified_policy, kind = "security.policy.expr", data = {
                groups = {"app.other:members"}, policy = {actions = "read", resources = "app:expression_qualified", expression = "true", effect = "allow"}}})
            assert(changes:apply())
            local ok, failure = pcall(function()
                local actor = assert(security.new_actor("expression-source-member"))
                for _, selected in ipairs({
                    {group = relative_group, policy = relative_policy, resource = "app:expression_relative"},
                    {group = qualified_group, policy = qualified_policy, resource = "app:expression_qualified"},
                }) do
                    local native = assert(security.named_scope(selected.group))
                    test.eq(native:evaluate(actor, "read", selected.resource), "allow")
                    local scope = assert(source_scope.resolve(selected.group))
                    test.eq(scope:evaluate(actor, "read", selected.resource), "allow")
                    local found = false
                    for _, policy in ipairs(scope:policies()) do if policy:id() == selected.policy then found = true end end
                    test.is_true(found, "resolver returns the executable expression source ID")
                end
                local wrong, wrong_err = source_scope.resolve("app.resolver_expression:app.other:members")
                test.is_nil(wrong)
                test.is_true(errors.is(wrong_err, errors.NOT_FOUND), tostring(wrong_err))
                changes = assert(registry.snapshot()):changes()
                changes:delete(relative_policy)
                assert(changes:apply())
                local retired, retired_err = source_scope.resolve(relative_group)
                test.is_nil(retired)
                test.is_true(errors.is(retired_err, errors.NOT_FOUND), tostring(retired_err))
            end)
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)
        test.it("keeps an expression source after its projected rule composition is removed", function()
            local original = assert(registry.current_version())
            local group = "app:resolver_expression_composed"
            local expression = "app:resolver_expression_composed_expression"
            local declaration = "app:resolver_expression_composed_declaration"
            writer.stop_projector(projector)
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = expression, kind = "security.policy.expr", data = {
                groups = {group}, policy = {actions = "read", resources = "app:expression_composed", expression = "true", effect = "allow"}}})
            changes:create({id = declaration, kind = "registry.entry",
                meta = {type = "kickside.security.group_composition"},
                data = {group_id = group, policies = {"app:module_access"}}})
            assert(changes:apply())
            projector = writer.start_projector()
            assert(trigger.trigger())
            writer.stop_projector(projector)
            local ok, failure = pcall(function()
                local actor = assert(security.new_actor("expression-composed-member"))
                local before = assert(source_scope.resolve(group))
                test.eq(before:evaluate(actor, "read", "app:expression_composed"), "allow")
                test.eq(before:evaluate(actor, "access", "app:module.endpoint"), "allow")
                changes = assert(registry.snapshot()):changes()
                changes:delete(declaration)
                assert(changes:apply())
                local after = assert(source_scope.resolve(group))
                test.eq(after:evaluate(actor, "read", "app:expression_composed"), "allow")
                test.eq(after:evaluate(actor, "access", "app:module.endpoint"), "undefined")
                local expression_found = false
                for _, policy in ipairs(after:policies()) do
                    if policy:id() == expression then expression_found = true end
                end
                test.is_true(expression_found)
            end)
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)
        test.it("keeps a pending registry plan valid while resolving live authority", function()
            writer.stop_projector(projector)
            local original = assert(registry.current_version())
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = "app:resolver_read_marker", kind = "registry.entry", data = {}})
            local ok, failure = pcall(function()
                test.not_nil(assert(source_scope.resolve("app.security:user")))
                test.eq(assert(registry.current_version()):id(), original:id())
                assert(changes:apply())
            end)
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)
        test.it("resolves selected policy IDs when the caller cannot inspect their declarations", function()
            local original = assert(registry.current_version())
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = "app:resolver_boundary_source_deny", kind = "security.policy", data = {
                policy = {actions = "registry.get", resources = "app:module_access", effect = "deny"},
            }})
            assert(changes:apply())
            local ok, failure = pcall(function()
                local scope = assert(security.new_scope({assert(security.policy("app:resolver_boundary_calls")),
                    assert(security.policy("app:resolver_boundary_source_deny"))}))
                local actor = assert(security.new_actor("resolver-client"))
                test.eq(scope:evaluate(actor, "registry.get", "app:module_access"), "deny")
                local result, err = funcs.new():with_actor(actor):with_scope(scope):call(
                    "app:resolver_boundary_client", {groups = {"kickside.security.scopes:" .. slug}})
                test.is_nil(err, tostring(err))
                test.is_true(result.database_denied)
                test.eq(result.selected.policy_ids[1], "app:module_access")
                test.eq(#result.selected.groups, 0)
                test.eq(scope:evaluate(actor, "registry.get", "app:module_access"), "deny")
            end)
            test.is_true(assert(registry.apply_version(original)))
            if not ok then error(failure) end
        end)
        test.it("reads Security's independently configured database while the caller keeps only its own database", function()
            writer.stop_projector(projector)
            local original = assert(registry.current_version())
            local ok, failure = pcall(function()
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:separate_scope_db", kind = "db.sql.sqlite", data = {file = ":memory:"}})
                local selector = assert(registry.get("kickside.security:db_config"))
                local meta = {}
                for k, v in pairs(selector.meta or {}) do meta[k] = v end
                meta.db_id = "app:separate_scope_db"
                changes:update({id = tostring(selector.id), kind = selector.kind, meta = meta, data = selector.data})
                local database_policy = assert(registry.get("kickside.security.service:group_set_db"))
                changes:update({id = tostring(database_policy.id), kind = database_policy.kind, meta = database_policy.meta,
                    data = {policy = {actions = "db.get", resources = {"app:separate_scope_db"}, effect = "allow"}}})
                assert(changes:apply())
                local db = assert(sql.get("app:separate_scope_db"))
                local _, schema_err = db:execute([[CREATE TABLE kickside_security_scopes
                    (slug TEXT PRIMARY KEY, target TEXT, policies TEXT, enabled INTEGER)]])
                test.is_nil(schema_err, tostring(schema_err))
                local _, seed_err = db:execute([[INSERT INTO kickside_security_scopes (slug,target,policies,enabled)
                    VALUES ($1,'','["app.security:user.app_shell_access"]',1)]], {slug})
                db:release()
                test.is_nil(seed_err, tostring(seed_err))
                local scope = assert(security.new_scope({assert(security.policy("app:resolver_boundary_calls")),
                    assert(security.policy("app:resolver_boundary_own_db"))}))
                local result, err = funcs.new():with_actor(assert(security.new_actor("resolver-client"))):with_scope(scope):call(
                    "app:resolver_boundary_client", {groups = {"kickside.security.scopes:" .. slug},
                        denied_db = "app:separate_scope_db", allowed_db = "app:db"})
                test.is_nil(err, tostring(err))
                test.is_true(result.database_denied)
                test.is_true(result.own_database)
                test.eq(result.selected.policy_ids[1], "app.security:user.app_shell_access")
                test.eq(#result.selected.policy_ids, 1)
            end)
            test.is_true(assert(registry.apply_version(original)))
            projector = writer.start_projector()
            if not ok then error(failure) end
        end)

        test.it("rejects authored group cycles without recursing forever", function()
            local original = assert(registry.current_version())
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = "app:resolver_cycle_a", kind = "security.scope", data = {groups = {"app:resolver_cycle_b"}}})
            changes:create({id = "app:resolver_cycle_b", kind = "security.scope", data = {groups = {"app:resolver_cycle_a"}}})
            assert(changes:apply())
            local result, err = funcs.call("kickside.security.runtime:resolve_groups", {groups = {"app:resolver_cycle_a"}})
            test.is_true(assert(registry.apply_version(original)))
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.contains(tostring(err), "cyclic")
        end)

        test.it("still requires the caller's explicit permission to invoke the resolver", function()
            local scope = assert(security.new_scope({assert(security.policy("app:resolver_boundary_client_only"))}))
            local result, err = funcs.new():with_actor(assert(security.new_actor("resolver-client"))):with_scope(scope):call(
                "app:resolver_boundary_client", {groups = {"kickside.security.scopes:" .. slug}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("does not grant the internal reader authority when it is called directly", function()
            local scope = assert(security.new_scope({assert(security.policy("app:resolver_boundary_calls")),
                assert(security.policy("app:resolver_boundary_reader_call"))}))
            local actor = assert(security.new_actor("resolver-client"))
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.security.runtime:read_groups"), "allow")
            local result, err = funcs.new():with_actor(actor):with_scope(scope):call(
                "kickside.security.runtime:read_groups", {groups = {"kickside.security.scopes:" .. slug}})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
    end)
end
return {run = test.run_cases(run)}
