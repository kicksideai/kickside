local scope_writer = require("scope_writer")
local trigger_reconcile = require("trigger_reconcile")
local execution_identity = require("execution_identity")
local source_scope = require("source_scope")
local test = require("test")
local registry = require("registry")
local store = require("scope_store")
local projection = require("scope_projection")
local consts = require("security_consts")
local time = require("time")
local storage = require("store")
local security = require("security")

-- Exercises the DB -> security.scope projection (the event-driven reconcile the
-- admin write endpoints trigger). DB is authoritative; reconcile creates/updates/
-- deletes the projected registry entry to match enabled rows, idempotently.
local function define_tests()
    test.describe("scope projection", function()
        local projector
        test.before_all(function() projector = scope_writer.start_projector() end)
        test.after_all(function() scope_writer.stop_projector(projector) end)

        local SLUG = "projectiontest_scope"
        local SID = consts.CUSTOM_SCOPE_NS .. ":" .. SLUG

        test.it("retains selected source IDs with identical native decisions for conditions and denies", function()
            local slug = "coverage_decisions"
            local rules = {
                {actions = "read", resources = "documents:*", effect = "allow"},
                {actions = "read", resources = "documents:*", effect = "allow"},
                {actions = "read", resources = "documents:one", effect = "allow"},
                {actions = "write", resources = "documents:two", effect = "allow"},
                {actions = "read", resources = "secrets:*", effect = "allow",
                    conditions = {{field = "actor.id", operator = "eq", value = "selected"}}},
                {actions = "read", resources = "documents:restricted", effect = "deny"},
            }
            local ids, originals = {}, {}
            local changes = assert(registry.snapshot()):changes()
            for index, rule in ipairs(rules) do
                local id = "app:coverage_decision_" .. index
                ids[#ids + 1] = id
                changes:create({id = id, kind = "security.policy", data = {policy = rule}})
            end
            test.is_nil(select(2, changes:apply()))
            for _, id in ipairs(ids) do originals[#originals + 1] = assert(security.policy(id)) end
            local before = assert(security.new_scope(originals))
            test.not_nil((store.upsert({slug = slug, policies = ids}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            local after = assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug))
            local assigned = {}
            for _, policy in ipairs(after:policies()) do assigned[#assigned + 1] = policy:id() end
            table.sort(assigned)
            test.eq(#assigned, #ids, table.concat(assigned, ", "))
            for _, actor_id in ipairs({"selected", "other"}) do
                local actor = assert(security.new_actor(actor_id, {}))
                for _, action in ipairs({"read", "write", "delete"}) do
                    for _, resource in ipairs({"documents:one", "documents:two", "documents:restricted",
                        "documents:nested:three", "documents_extra:one", "secrets:one", "unrelated:one"}) do
                        test.eq(after:evaluate(actor, action, resource), before:evaluate(actor, action, resource),
                            actor_id .. " " .. action .. " " .. resource)
                    end
                end
            end
            test.is_true((store.delete(slug)))
            test.not_nil((trigger_reconcile.trigger()))
            changes = assert(registry.snapshot()):changes()
            for _, id in ipairs(ids) do changes:delete(id) end
            test.is_nil(select(2, changes:apply()))
        end)

        test.it("declares platform Members before planning and projects every installed module bundle", function()
            local entry, read_err = registry.get("kickside.security.groups:members")
            test.is_nil(read_err)
            test.not_nil(entry)
            test.eq(tostring(entry.kind), "security.scope")
            local result, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.not_nil(result)
            local scope, scope_err = source_scope.resolve("kickside.security.groups:members")
            test.is_nil(scope_err)
            test.not_nil(scope)
            local actor = security.new_actor("member", {})
            test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "allow")
            test.eq(scope:evaluate(actor, "registry.get", "app:module_view"), "allow")
            test.eq(scope:evaluate(actor, "access", "unrelated:list.endpoint"), "undefined")
        end)

        test.it("plans a composed catalog of distinct module grants in time linear in its policies", function()
            local original = assert(registry.current_version())
            local changes = assert(registry.snapshot()):changes()
            for index = 1, 1200 do
                changes:create({id = "app:catalog_grant_" .. index, kind = "security.policy",
                    meta = {intent = "module_access"},
                    data = {groups = {"app:catalog_group_" .. (index % 12)}, policy = {
                        actions = {"access", "registry.get"},
                        resources = {"app:catalog_endpoint_" .. index, "app:catalog_view_" .. index},
                        effect = "allow"}}})
            end
            test.is_nil(select(2, changes:apply()))
            test.not_nil((trigger_reconcile.trigger()))
            local started = time.now()
            local result, err = trigger_reconcile.trigger()
            local elapsed = time.now():sub(started):seconds()
            local scope = assert(source_scope.resolve("app:declared_members"))
            local granted = scope:evaluate(security.new_actor("member"), "access", "app:catalog_endpoint_1200")
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
            test.not_nil((trigger_reconcile.trigger()))
            test.is_nil(err)
            test.eq(result.created + result.updated + result.deleted, 0)
            test.eq(granted, "allow")
            test.ok(elapsed < 5, "a no-op projection pass over 1,200 composed grants takes " .. tostring(elapsed) .. "s")
        end)

        test.it("preserves sessions when boot rebuilds unchanged native policy bindings", function()
            test.not_nil((trigger_reconcile.trigger()))
            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            local changes = assert(registry.snapshot()):changes()
            for _, entry in ipairs(assert(registry.find({[".kind"] = "security.policy"}))) do
                local meta, data = entry.meta or {}, entry.data or {}
                if meta.managed_by ~= consts.MANAGED_BY then
                    changes:update({id = tostring(entry.id), kind = entry.kind, meta = meta, data = data})
                end
            end
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local version = assert(registry.snapshot()):version():id()
            local result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(result)
            test.eq(result.created, 0)
            test.eq(result.updated, 0)
            test.eq(result.deleted, 0)
            test.eq(assert(registry.snapshot()):version():id(), version)
            test.eq(#(records:get("calls") or {}), 0)
            local scope = assert(source_scope.resolve("app:declared_members"))
            test.eq(scope:evaluate(security.new_actor("member"), "access", "app:module.endpoint"), "allow")
            records:release()
        end)

        test.it("canonicalizes policy sets and keeps metadata edits outside session fencing", function()
            local slug = "canonical_policy_order"
            test.not_nil((store.upsert({slug = slug, label = "Original", policies = {"app:module_runtime", "app:module_access"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            local version = assert(registry.snapshot()):version():id()
            test.not_nil((store.upsert({slug = slug, label = "Original", policies = {"app:module_access", "app:module_runtime"}}, "tester")))
            local result = assert(trigger_reconcile.trigger())
            test.eq(result.created, 0)
            test.eq(result.updated, 0)
            test.eq(result.deleted, 0)
            test.eq(assert(registry.snapshot()):version():id(), version)
            test.eq(#(records:get("calls") or {}), 0)
            test.not_nil((store.upsert({slug = slug, label = "Renamed", policies = {"app:module_access"}}, "tester")))
            result = assert(trigger_reconcile.trigger())
            test.eq(result.updated, 1)
            test.eq(#(records:get("calls") or {}), 1)
            test.is_true((store.delete(slug)))
            test.not_nil((trigger_reconcile.trigger()))
            records:release()
        end)

        test.it("keeps equivalent action and resource sets outside registry writes and session fencing", function()
            test.not_nil((trigger_reconcile.trigger()))
            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            local entry = assert(registry.get("app:module_runtime"))
            entry.data.policy.actions = {"funcs.call", "registry.find", "registry.get", "registry.find"}
            entry.data.policy.resources = {"app:module_view"}
            local changes = assert(registry.snapshot()):changes()
            changes:update({id = tostring(entry.id), kind = entry.kind, meta = entry.meta, data = entry.data})
            test.is_nil(select(2, changes:apply()))
            local version = assert(registry.snapshot()):version():id()
            test.not_nil((trigger_reconcile.trigger()))
            test.eq(assert(registry.snapshot()):version():id(), version)
            test.eq(#(records:get("calls") or {}), 0)
            records:release()
        end)

        for _, field in ipairs({"actions", "resources"}) do
            test.it("keeps existing allow " .. field .. " expansions outside session fencing", function()
                local slug = "allow_expansion_" .. field
                local id = "app:allow_expansion_" .. field
                local policy = {actions = "access", resources = "app:expansion_original", effect = "allow"}
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = id, kind = "security.policy", data = {policy = policy}})
                test.is_nil(select(2, changes:apply()))
                test.not_nil((store.upsert({slug = slug, policies = {id}}, "tester")))
                test.not_nil((trigger_reconcile.trigger()))
                local records = assert(storage.get("app:invalidation_records"))
                records:set("calls", {})
                local original = policy[field]
                policy[field] = {original, field == "actions" and "smoke.expanded" or "app:expansion_added"}
                changes = assert(registry.snapshot()):changes()
                changes:update({id = id, kind = "security.policy", data = {policy = policy}})
                test.is_nil(select(2, changes:apply()))
                local result, err = trigger_reconcile.trigger()
                test.is_nil(err, tostring(err))
                test.not_nil(result)
                local calls = records:get("calls") or {}
                local scope = assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug))
                local actor = security.new_actor("expansion_member")
                local retained = scope:evaluate(actor, "access", "app:expansion_original")
                local expanded = scope:evaluate(actor, field == "actions" and "smoke.expanded" or "access",
                    field == "resources" and "app:expansion_added" or "app:expansion_original")
                test.is_true((store.delete(slug)))
                test.not_nil((trigger_reconcile.trigger()))
                changes = assert(registry.snapshot()):changes()
                changes:delete(id)
                test.is_nil(select(2, changes:apply()))
                records:release()
                test.eq(retained, "allow")
                test.eq(expanded, "allow")
                test.eq(#calls, 0, "an existing allow expansion fences unchanged credentials")
            end)
        end

        for _, split in ipairs({false, true}) do
            test.it(split and "preserves authority when an allow divides across policy bindings"
                or "preserves authority when an equivalent policy uses another binding", function()
                local slug = split and "split_policy_bindings" or "equivalent_policy_binding"
                local before_id, first_id, second_id = "app:" .. slug .. "_before", "app:" .. slug .. "_first", "app:" .. slug .. "_second"
                local resources = {"app:binding_first", "app:binding_second"}
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = before_id, kind = "security.policy", data = {policy = {
                    actions = {"access", "smoke.write"}, resources = resources, effect = "allow"}}})
                changes:create({id = first_id, kind = "security.policy", data = {policy = {
                    actions = split and "access" or {"access", "smoke.write"}, resources = resources, effect = "allow"}}})
                changes:create({id = second_id, kind = "security.policy", data = {policy = {
                    actions = "smoke.write", resources = resources, effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                test.not_nil((store.upsert({slug = slug, policies = {before_id}}, "tester")))
                test.not_nil((trigger_reconcile.trigger()))
                local records = assert(storage.get("app:invalidation_records"))
                records:set("calls", {})
                test.not_nil((store.upsert({slug = slug, policies = split and {first_id, second_id} or {first_id}}, "tester")))
                test.not_nil((trigger_reconcile.trigger()))
                local calls = records:get("calls") or {}
                local scope = assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug))
                local actor = security.new_actor("binding_member")
                for _, action in ipairs({"access", "smoke.write"}) do
                    for _, resource in ipairs(resources) do test.eq(scope:evaluate(actor, action, resource), "allow") end
                end
                test.is_true((store.delete(slug)))
                test.not_nil((trigger_reconcile.trigger()))
                changes = assert(registry.snapshot()):changes()
                for _, id in ipairs({before_id, first_id, second_id}) do changes:delete(id) end
                test.is_nil(select(2, changes:apply()))
                records:release()
                test.eq(#calls, 1, "a changed source selection advances the authority epoch")
            end)
        end

        for _, conditional in ipairs({false, true}) do
            test.it(conditional and "fences an allow narrowed by action conditions"
                or "fences a divided allow with an uncovered action and resource pair", function()
                local slug = conditional and "conditional_policy_reduction" or "partial_policy_reduction"
                local before_id, first_id, second_id = "app:" .. slug .. "_before", "app:" .. slug .. "_first", "app:" .. slug .. "_second"
                local resources = {"app:reduction_first", "app:reduction_second"}
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = before_id, kind = "security.policy", data = {policy = {
                    actions = {"access", "smoke.write"}, resources = resources, effect = "allow"}}})
                changes:create({id = first_id, kind = "security.policy", data = {policy = {
                    actions = conditional and {"access", "smoke.write"} or "access", resources = resources,
                    effect = "allow", conditions = conditional and {{field = "action", operator = "nin", value = {"smoke.write"}}} or nil}}})
                changes:create({id = second_id, kind = "security.policy", data = {policy = {
                    actions = "smoke.write", resources = "app:reduction_first", effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                test.not_nil((store.upsert({slug = slug, policies = {before_id}}, "tester")))
                test.not_nil((trigger_reconcile.trigger()))
                local records = assert(storage.get("app:invalidation_records"))
                records:set("calls", {})
                test.not_nil((store.upsert({slug = slug, policies = conditional and {first_id} or {first_id, second_id}}, "tester")))
                test.not_nil((trigger_reconcile.trigger()))
                local calls = records:get("calls") or {}
                local scope = assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug))
                local actor = security.new_actor("reduction_member")
                test.eq(scope:evaluate(actor, "access", "app:reduction_second"), "allow")
                test.eq(scope:evaluate(actor, "smoke.write", "app:reduction_second"), "undefined")
                test.is_true((store.delete(slug)))
                test.not_nil((trigger_reconcile.trigger()))
                changes = assert(registry.snapshot()):changes()
                for _, id in ipairs({before_id, first_id, second_id}) do changes:delete(id) end
                test.is_nil(select(2, changes:apply()))
                records:release()
                test.eq(#calls, 1)
                for _, call in ipairs(calls) do
                    test.eq(#call.groups, 1)
                    test.eq(call.groups[1], consts.CUSTOM_SCOPE_NS .. ":" .. slug)
                end
            end)
        end

        test.it("resolves the current native rule when a selected policy keeps its ID", function()
            test.not_nil((store.upsert({slug = "unaffected_policy", policies = {"app:module_runtime"}}, "tester")))
            local row, save_err = store.upsert({slug = "policy_body_change", policies = {"app:module_access"}}, "tester")
            test.is_nil(save_err)
            test.not_nil(row)
            test.not_nil((trigger_reconcile.trigger()))
            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            local entry = assert(registry.get("app:module_access"))
            entry.data.policy.resources = "app:changed.endpoint"
            local changes = assert(registry.snapshot()):changes()
            changes:update({id = tostring(entry.id), kind = entry.kind, meta = entry.meta, data = entry.data})
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(result)
            local calls = records:get("calls") or {}
            test.eq(#calls, 0)
            local current = assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":policy_body_change"))
            local actor = security.new_actor("member")
            test.eq(current:evaluate(actor, "access", "app:module.endpoint"), "undefined")
            test.eq(current:evaluate(actor, "access", "app:changed.endpoint"), "allow")
            entry.data.policy.resources = "app:module.endpoint"
            changes = assert(registry.snapshot()):changes()
            changes:update({id = tostring(entry.id), kind = entry.kind, meta = entry.meta, data = entry.data})
            _, apply_err = changes:apply()
            test.is_nil(apply_err)
            test.not_nil((trigger_reconcile.trigger()))
            test.is_true((store.delete("unaffected_policy")))
            test.is_true((store.delete("policy_body_change")))
            test.not_nil((trigger_reconcile.trigger()))
            records:release()
        end)

        test.it("materializes a declared group before its native bindings exist", function()
            local group, declaration = "app:hot_declared_group", "app:hot_group_composition"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = declaration, kind = "registry.entry",
                meta = {type = "kickside.security.group_composition"},
                data = {group_id = group, policies = {"app:module_access"}}})
            test.is_nil(select(2, changes:apply()))
            local absent = source_scope.resolve(group)
            test.is_nil(absent, "the group has no native bindings before projection")
            local result, err = trigger_reconcile.trigger()
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            local scope = assert(source_scope.resolve(group))
            test.eq(scope:evaluate(security.new_actor("fresh_member"), "access", "app:module.endpoint"), "allow")
            test.eq(scope:evaluate(security.new_actor("fresh_member"), "access", "app:unassigned"), "undefined")
            changes = assert(registry.snapshot()):changes()
            changes:delete(declaration)
            test.is_nil(select(2, changes:apply()))
            test.not_nil((trigger_reconcile.trigger()))
        end)

        test.it("returns a typed not-found error for an unknown group", function()
            local result, err = source_scope.resolve("app:unknown_hot_group")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
            test.eq(err:retryable(), false)
        end)

        test.it("composes a native scope union without registry writes and preserves denies", function()
            local snap = assert(registry.snapshot())
            local changes = snap:changes()
            changes:create({id = "app:set_allow", kind = "security.policy", data = {
                groups = {"app:sales"}, policy = {actions = "access", resources = "app:crm", effect = "allow"}}})
            changes:create({id = "app:set_second", kind = "security.policy", data = {
                groups = {"app:support"}, policy = {actions = "access", resources = "app:kb", effect = "allow"}}})
            changes:create({id = "app:set_deny", kind = "security.policy", data = {
                groups = {"app:restricted"}, policy = {actions = "access", resources = "app:crm", effect = "deny"}}})
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local scope = assert(execution_identity.scope_from_groups({"app:support", "app:sales"}))
            local same = assert(execution_identity.scope_from_groups({"app:sales", "app:support", "app:sales"}))
            test.eq(#scope:policies(), #same:policies())
            local actor = security.new_actor("set_member")
            test.eq(scope:evaluate(actor, "access", "app:crm"), "allow")
            test.eq(scope:evaluate(actor, "access", "app:kb"), "allow")
            test.eq(scope:evaluate(actor, "access", "app:unassigned"), "undefined")
            local denied_scope = assert(execution_identity.scope_from_groups({"app:support", "app:restricted", "app:sales"}))
            test.eq(denied_scope:evaluate(actor, "access", "app:crm"), "deny")
            test.eq(denied_scope:evaluate(actor, "access", "app:kb"), "allow")
            changes = assert(registry.snapshot()):changes()
            changes:delete("app:set_second")
            _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local reconciled, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(reconciled)
            scope = assert(execution_identity.scope_from_groups({"app:sales"}))
            test.eq(scope:evaluate(actor, "access", "app:kb"), "undefined")
            changes = assert(registry.snapshot()):changes()
            changes:delete("app:set_allow")
            changes:delete("app:set_deny")
            _, apply_err = changes:apply()
            test.is_nil(apply_err)
            reconciled, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
        end)

        test.it("fences deletion of an empty group as a restrictive change", function()
            local records, records_err = storage.get("app:invalidation_records")
            test.is_nil(records_err)
            local slug = "deleted_empty_group"
            local row, save_err = store.upsert({slug = slug, policies = {}}, "tester")
            test.is_nil(save_err)
            test.not_nil(row)
            local result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(result)
            records:set("calls", {})
            local deleted, delete_err = store.delete(slug)
            test.is_nil(delete_err)
            test.not_nil(deleted)
            result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(result)
            local calls = records:get("calls")
            test.eq(#calls, 1)
            test.eq(calls[1].groups[1], consts.CUSTOM_SCOPE_NS .. ":" .. slug)
            test.eq(calls[1].allow_only, false)
            records:release()
        end)

        test.it("advances authority epochs for both expanded and reduced source selections", function()
            local records = assert(storage.get("app:invalidation_records"))
            local expanding, reducing = "expanding_group", "reducing_group"
            test.not_nil((store.upsert({slug = expanding, policies = {}}, "tester")))
            test.not_nil((store.upsert({slug = reducing, policies = {"app:module_access"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            records:set("calls", {})
            test.not_nil((store.upsert({slug = expanding, policies = {"app:module_access"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            test.eq(#(records:get("calls") or {}), 1)
            local actor = security.new_actor("expansion_member")
            local scope = assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. expanding))
            test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "allow")
            test.not_nil((store.upsert({slug = expanding, policies = {"app:module_runtime"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            records:set("calls", {})
            test.not_nil((store.upsert({slug = expanding, policies = {"app:module_access"}}, "tester")))
            test.not_nil((store.upsert({slug = reducing, policies = {}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            local calls = records:get("calls") or {}
            test.eq(#calls, 2)
            test.eq(#calls[1].groups, 1)
            test.eq(calls[1].groups[1], consts.CUSTOM_SCOPE_NS .. ":" .. expanding)
            test.eq(calls[2].groups[1], consts.CUSTOM_SCOPE_NS .. ":" .. reducing)
            test.is_true((store.delete(expanding)))
            test.is_true((store.delete(reducing)))
            test.not_nil((trigger_reconcile.trigger()))
            records:release()
        end)

        test.it("advances authority epochs when a selected deny is added or removed", function()
            local slug, policy_id = "deny_change", "app:projection_deny"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = policy_id, kind = "security.policy", data = {
                policy = {actions = "access", resources = "app:module.endpoint", effect = "deny"}}})
            test.is_nil(select(2, changes:apply()))
            test.not_nil((store.upsert({slug = slug, policies = {"app:module_access"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            local records = assert(storage.get("app:invalidation_records"))
            records:set("calls", {})
            test.not_nil((store.upsert({slug = slug, policies = {"app:module_access", policy_id}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            local calls = records:get("calls") or {}
            test.eq(#calls, 1)
            test.eq(#calls[1].groups, 1)
            test.eq(calls[1].groups[1], consts.CUSTOM_SCOPE_NS .. ":" .. slug)
            test.eq(calls[1].allow_only, false)
            local actor = security.new_actor("deny_member")
            test.eq(assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug))
                :evaluate(actor, "access", "app:module.endpoint"), "deny")
            records:set("calls", {})
            test.not_nil((store.upsert({slug = slug, policies = {"app:module_access"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            test.eq(#(records:get("calls") or {}), 1)
            test.eq(assert(source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug))
                :evaluate(actor, "access", "app:module.endpoint"), "allow")
            test.is_true((store.delete(slug)))
            test.not_nil((trigger_reconcile.trigger()))
            changes = assert(registry.snapshot()):changes()
            changes:delete(policy_id)
            test.is_nil(select(2, changes:apply()))
            records:release()
        end)

        test.it("fences source selection changes before committing the new policy list", function()
            local records, records_err = storage.get("app:invalidation_records")
            test.is_nil(records_err)
            local initial, initial_err = trigger_reconcile.trigger()
            test.is_nil(initial_err)
            test.not_nil(initial)
            local slug = "invalidation_composition"
            local row, save_err = store.upsert({slug = slug, policies = {"app:module_access"}}, "tester")
            test.is_nil(save_err)
            test.not_nil(row)
            local result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            test.not_nil(result)
            records:set("calls", {})
            row, save_err = store.upsert({slug = slug, policies = {}}, "tester")
            test.is_nil(save_err)
            result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            local calls = records:get("calls")
            test.eq(#calls, 1)
            test.eq(calls[1].groups[1], consts.CUSTOM_SCOPE_NS .. ":" .. slug)
            test.eq(calls[1].decision, "allow")
            test.eq(calls[1].allow_only, false)
            test.is_nil(calls[1].preserve_sessions)
            test.eq(calls[1].operation, "delegation_fencing")
            for _, call in ipairs(calls) do
                test.is_nil(call.previous_group_rules, "source selection changes do not carry policy-body coverage proofs")
            end
            local deleted, delete_err = store.delete(slug)
            test.is_nil(delete_err)
            test.not_nil(deleted)
            result, reconcile_err = trigger_reconcile.trigger()
            test.is_nil(reconcile_err)
            records:release()
        end)
        test.it("returns the unconfigured host delegation fencer error for a reduction", function()
            test.not_nil((trigger_reconcile.trigger()))
            local slug = "unconfigured_fencer"
            test.not_nil((store.upsert({slug = slug, policies = {"app:module_access"}}, "tester")))
            test.not_nil((trigger_reconcile.trigger()))
            local config = assert(registry.get("kickside.security:composition_config"))
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = "app:unconfigured_fencer_deny", kind = "security.policy", data = {
                policy = {actions = "access", resources = "app:module.endpoint", effect = "deny"}}})
            changes:update({id = config.id, kind = config.kind, meta = {delegation_fencer = ""}, data = config.data})
            test.is_nil(select(2, changes:apply()))
            local ok, failure = pcall(function()
                local result, err = store.upsert({slug = slug, policies = {"app:unconfigured_fencer_deny"}}, "tester")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
            end)
            changes = assert(registry.snapshot()):changes()
            changes:update(config)
            test.is_nil(select(2, changes:apply()))
            test.not_nil((trigger_reconcile.trigger()))
            test.is_true((store.delete(slug)))
            test.not_nil((trigger_reconcile.trigger()))
            changes = assert(registry.snapshot()):changes()
            changes:delete("app:unconfigured_fencer_deny")
            test.is_nil(select(2, changes:apply()))
            if not ok then error(failure) end
        end)
        test.it("composes an application-declared group from selectable module policies", function()
            local result, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.not_nil(result)
            local scope, scope_err = source_scope.resolve("app:declared_members")
            test.is_nil(scope_err)
            test.not_nil(scope)
            local actor = security.new_actor("declared_member", {})
            test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "allow")
            test.eq(scope:evaluate(actor, "registry.get", "app:module_view"), "allow")
            test.eq(scope:evaluate(actor, "access", "unrelated:module.endpoint"), "undefined")
            local again, again_err = trigger_reconcile.trigger()
            test.is_nil(again_err)
            test.eq(again.updated, 0)
        end)

        test.it("removes an unavailable registry composition contributor during reconciliation", function()
            local group = "app:missing_contributor_group"
            local old_id = "app:missing_contributor_before"
            local new_id = "app:missing_contributor_after"
            local old_resource = "app:missing.contributor.before"
            local new_resource = "app:missing.contributor.after"
            local composition_id = "app:missing_contributor_composition"
            local ok, failure = pcall(function()
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = composition_id, kind = "registry.entry", meta = {
                    type = "kickside.security.group_composition"}, data = {group_id = group, policies = {old_id}}})
                changes:create({id = old_id, kind = "security.policy", data = {groups = {group},
                    policy = {actions = "access", resources = old_resource, effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                test.is_nil(select(2, trigger_reconcile.trigger()))
                local bindings = assert(registry.find({[".kind"] = "security.policy",
                    ["meta.scope_projection_policy"] = old_id}))
                test.eq(#bindings, 0)

                changes = assert(registry.snapshot()):changes()
                changes:delete(old_id)
                changes:create({id = new_id, kind = "security.policy", data = {groups = {group},
                    policy = {actions = "access", resources = new_resource, effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                local result, reconcile_err = trigger_reconcile.trigger()
                test.is_nil(reconcile_err)
                test.not_nil(result)
                local scope = assert(source_scope.resolve(group))
                test.eq(scope:evaluate(security.new_actor("member"), "access", old_resource), "undefined")
                test.eq(scope:evaluate(security.new_actor("member"), "access", new_resource), "allow")
                bindings = assert(registry.find({[".kind"] = "security.policy",
                    ["meta.scope_projection_policy"] = old_id}))
                test.eq(#bindings, 0)
            end)
            local changes = assert(registry.snapshot()):changes()
            for _, id in ipairs({composition_id, old_id, new_id}) do
                if registry.get(id) then changes:delete(id) end
            end
            test.is_nil(select(2, changes:apply()))
            test.is_nil(select(2, trigger_reconcile.trigger()))
            if not ok then error(failure) end
        end)

        test.it("keeps projecting a stored group whose selected policy an update retired", function()
            local slug = "retired_selection_group"
            local retired_id = "app:retired_selection_before"
            local kept_id = "app:retired_selection_kept"
            local retired_resource = "app:retired.selection.before"
            local kept_resource = "app:retired.selection.kept"
            local sid = consts.CUSTOM_SCOPE_NS .. ":" .. slug
            local ok, failure = pcall(function()
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = retired_id, kind = "security.policy",
                    data = {policy = {actions = "access", resources = retired_resource, effect = "allow"}}})
                changes:create({id = kept_id, kind = "security.policy",
                    data = {policy = {actions = "access", resources = kept_resource, effect = "allow"}}})
                test.is_nil(select(2, changes:apply()))
                test.not_nil((store.upsert({slug = slug, policies = {retired_id, kept_id}}, "tester")))
                test.is_nil(select(2, trigger_reconcile.trigger()))

                changes = assert(registry.snapshot()):changes()
                changes:delete(retired_id)
                test.is_nil(select(2, changes:apply()))
                local result, reconcile_err = trigger_reconcile.trigger()
                test.is_nil(reconcile_err)
                test.not_nil(result)
                local scope = assert(source_scope.resolve(sid))
                local actor = security.new_actor("retired_selection_member")
                test.eq(scope:evaluate(actor, "access", retired_resource), "undefined")
                test.eq(scope:evaluate(actor, "access", kept_resource), "allow")
                test.eq(table.concat(assert(store.get(slug)).policies, ","), retired_id .. "," .. kept_id)
            end)
            store.delete(slug)
            local changes = assert(registry.snapshot()):changes()
            for _, id in ipairs({retired_id, kept_id}) do
                if registry.get(id) then changes:delete(id) end
            end
            test.is_nil(select(2, changes:apply()))
            test.is_nil(select(2, trigger_reconcile.trigger()))
            if not ok then error(failure) end
        end)

        test.it("projects a selected module policy with its declared companion grants", function()
            local slug = "projection_module_access"
            local row, save_err = store.upsert({ slug = slug, policies = { "app:module_access" } }, "tester")
            test.is_nil(save_err)
            test.not_nil(row)
            local result, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.not_nil(result)
            local entry = registry.get(consts.CUSTOM_SCOPE_NS .. ":" .. slug)
            test.not_nil(entry)
            local data: any = entry.data or entry
            test.eq(#data.policies, 2)
            test.eq(data.policies[1], "app:module_access")
            test.eq(data.policies[2], "app:module_runtime")
            local scope, scope_err = source_scope.resolve(consts.CUSTOM_SCOPE_NS .. ":" .. slug)
            test.is_nil(scope_err)
            test.not_nil(scope)
            local actor = security.new_actor("module_member", { security_groups = { consts.CUSTOM_SCOPE_NS .. ":" .. slug } })
            test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "allow")
            test.eq(scope:evaluate(actor, "registry.get", "app:module_view"), "allow")
            local same, same_err = trigger_reconcile.trigger()
            test.is_nil(same_err)
            test.eq(same.updated, 0)
            local deleted, delete_err = store.delete(slug)
            test.is_nil(delete_err)
            test.not_nil(deleted)
            local cleanup, cleanup_err = trigger_reconcile.trigger()
            test.is_nil(cleanup_err)
            test.not_nil(cleanup)
        end)

        test.it("store upsert + get round-trips a custom scope", function()
            local row, err = store.upsert({
                slug = SLUG,
                label = "Projection Test",
                policies = { "app.security:user.app_shell_access" },
                enabled = true,
            }, "tester")
            test.is_nil(err)
            test.not_nil(row)

            local got = store.get(SLUG)
            test.not_nil(got)
            test.eq(got.slug, SLUG)
            test.is_true(got.enabled)
        end)

        test.it("keeps an empty group executable without granting module access", function()
            local slug = "empty_module_group"
            local row, save_err = store.upsert({ slug = slug, policies = {} }, "tester")
            test.is_nil(save_err)
            test.not_nil(row)
            local result, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.not_nil(result)
            local sid = consts.CUSTOM_SCOPE_NS .. ":" .. slug
            local scope, scope_err = source_scope.resolve(sid)
            test.is_nil(scope_err)
            test.not_nil(scope)
            local actor = security.new_actor("empty_member")
            test.eq(scope:evaluate(actor, "registry.get", sid), "undefined")
            test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "undefined")
            local deleted, delete_err = store.delete(slug)
            test.is_nil(delete_err)
            test.eq(deleted, true)
            local cleaned, cleanup_err = trigger_reconcile.trigger()
            test.is_nil(cleanup_err)
            test.not_nil(cleaned)
            local removed, removed_err = source_scope.resolve(sid)
            test.is_nil(removed)
            test.is_true(errors.is(removed_err, errors.NOT_FOUND))
        end)

        test.it("reconcile projects an enabled DB scope into a security.scope entry", function()
            local res, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.not_nil(res)

            local entry = registry.get(SID)
            test.not_nil(entry)
            test.eq(tostring((entry :: any).kind), consts.SCOPE_KIND)
        end)

        test.it("preserves an authored descriptor while adding and removing its DB overlay", function()
            test.not_nil((trigger_reconcile.trigger()))
            local original = assert(registry.current_version())
            local group, native = "app:authored_scope", "app:authored_scope_native"
            local slug = "authored_scope_overlay"
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = group, kind = "security.scope", meta = {label = "Authored scope"},
                data = {policies = {}, marker = "authored"}})
            changes:create({id = native, kind = "security.policy", data = {groups = {group},
                policy = {actions = "read", resources = "app:authored_native", effect = "allow"}}})
            test.not_nil(assert(changes:apply()))
            local ok, failure = pcall(function()
                assert(store.upsert({slug = slug, target = group, policies = {"app:module_access"}}))
                assert(trigger_reconcile.trigger())
                local active = assert(registry.get(group))
                test.eq(#active.data.policies, 0, "DB overlays retain authored descriptor selections")
                test.eq(active.data.marker, "authored")
                local actor = assert(security.new_actor("member"))
                local scope = assert(source_scope.resolve(group))
                test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "allow")
                assert(store.delete(slug))
                assert(trigger_reconcile.trigger())
                local restored = assert(registry.get(group))
                test.eq(restored.meta.label, "Authored scope")
                test.eq(#restored.data.policies, 0)
                test.is_nil(restored.data.scope_sources)
                test.is_nil(restored.data.direct_policies)
                test.is_nil(restored.data.groups)
                scope = assert(source_scope.resolve(group))
                test.eq(scope:evaluate(actor, "read", "app:authored_native"), "allow")
                test.eq(scope:evaluate(actor, "access", "app:module.endpoint"), "undefined")
            end)
            assert(store.delete(slug))
            assert(trigger_reconcile.trigger())
            test.is_true(assert(registry.apply_version(original)))
            assert(trigger_reconcile.trigger())
            if not ok then error(failure) end
        end)

        test.it("reconcile is idempotent when DB and registry agree", function()
            local res, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.eq(res.created, 0)
            test.eq(res.updated, 0)
            test.eq(res.deleted, 0)
        end)

        test.it("editing the DB row re-projects on the next reconcile", function()
            store.upsert({
                slug = SLUG,
                label = "Projection Test 2",
                policies = { "app.security:user.app_shell_access", "app.security:user.runtime_registry_read" },
                enabled = true,
            }, "tester")
            local res, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.ok(res.updated >= 1)
        end)

        test.it("deleting the DB row removes the projected entry on reconcile", function()
            store.delete(SLUG)
            local res, err = trigger_reconcile.trigger()
            test.is_nil(err)
            test.ok(res.deleted >= 1)
            test.is_nil((registry.get(SID)))
        end)

        test.it("persists timestamps as Z-suffixed RFC3339 UTC strings", function()
            local TS_SLUG = "tstest_scope"
            store.upsert({ slug = TS_SLUG, label = "TS", enabled = true }, "tester")
            local got = store.get(TS_SLUG)
            test.not_nil(got)
            for _, col in ipairs({ "created_at", "updated_at" }) do
                local raw = tostring((got :: any)[col])
                test.eq(raw:sub(-1), "Z")
                local parsed, perr = time.parse(time.RFC3339, raw)
                test.is_nil(perr)
                test.not_nil(parsed)
            end
            store.delete(TS_SLUG)
        end)
    end)
end

return test.run_cases(define_tests)
