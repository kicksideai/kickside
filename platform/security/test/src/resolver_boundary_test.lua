-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local sql = require("sql")
local funcs = require("funcs")
local security = require("security")
local writer = require("scope_writer")
local trigger = require("trigger_reconcile")
local store = require("scope_store")
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
    end)
end
return {run = test.run_cases(run)}
