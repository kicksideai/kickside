-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local deletion_worker = require("deletion_worker")
local placement = require("placement")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")

return {run = test.run_cases(function()
    test.describe("Component kind mutation authority", function()
        local ids = {}
        local actor_id = uuid.v4()
        local function scope(extra)
            local policies = {assert(security.policy("app:kind_member_runtime"))}
            if extra then policies[#policies + 1] = assert(security.policy(extra)) end
            return assert(security.new_scope(policies))
        end
        local function service(extra, actor)
            return assert(assert(contract.get("kickside.component:component_service"))
                :with_actor(assert(security.new_actor(actor or actor_id, {})))
                :with_scope(scope(extra)):open())
        end
        local function admit(method, args)
            local result, err = funcs.new():with_actor(assert(security.new_actor(actor_id, {})))
                :with_scope(scope()):call("app:kind_admission", {method = method, args = args})
            test.is_nil(err)
            return result
        end
        local function remember(result)
            if result and result.component_id then ids[#ids + 1] = result.component_id end
            return result
        end
        local function unchanged(id)
            local db = assert(sql.get("app:db"))
            local rows, err = db:query("SELECT private_context, context_revision, position FROM kickside_components WHERE component_id=$1", {id})
            local meta, meta_err = db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='title'", {id})
            db:release()
            test.is_nil(err)
            test.is_nil(meta_err)
            test.eq(tonumber(rows[1].context_revision), 0)
            local context, decode_err = json.decode(rows[1].private_context :: string)
            test.is_nil(decode_err)
            test.eq(context.value, "original")
            test.eq(#meta, 0)
            test.is_true(rows[1].position ~= "z")
        end
        local function create_closed(): string
            local result = remember(admit("register", {impl_id = "app:closed_kind", private_context = {value = "original"}}))
            test.is_true(result.success, tostring(result.error))
            return result.component_id :: string
        end
        local function refusal(result, err)
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.kind, errors.PERMISSION_DENIED)
            test.eq(result.details.code, "component_kind_mutation_denied")
        end
        test.after_each(function()
            local db = assert(sql.get("app:db"))
            for _, id in ipairs(ids) do
                assert(db:execute("DELETE FROM kickside_execution_identity_audit WHERE component_id=$1", {id}))
                assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
            end
            db:release()
            ids = {}
        end)
        test.it("refuses direct member registration of a closed kind", function()
            local result, err = service():register({impl_id = "app:closed_kind"})
            remember(result)
            refusal(result, err)
        end)
        for _, command in ipairs({"SET_CONTEXT", "PATCH_CONTEXT", "SET_META"}) do
            test.it("refuses direct member " .. command .. " of an owned closed kind", function()
                local id = create_closed()
                local result, err = service():update({component_id = id, commands = {{type = command,
                    payload = {private_context = {value = "forged"}, patch = {value = "forged"}, fields = {title = "forged"}}}}})
                refusal(result, err)
                unchanged(id)
            end)
        end
        test.it("refuses direct member metadata changes of a closed kind", function()
            local id = create_closed()
            refusal(service():set_meta({component_id = id, fields = {title = "forged"}}))
            unchanged(id)
        end)
        test.it("refuses direct member placement changes of a closed kind", function()
            local id = create_closed()
            refusal(service():set_placement({component_id = id, position = "z"}))
            unchanged(id)
        end)
        local function create_at(kind: string, parent: string?): string
            local result = remember(admit("register", {impl_id = kind, parent_id = parent}))
            test.is_true(result.success, tostring(result.error))
            return result.component_id :: string
        end
        local function row(id)
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT parent_id,path,deleting_at,delete_intent FROM kickside_components WHERE component_id=$1", {id}))
            db:release()
            return rows[1]
        end
        for _, nested in ipairs({false, true}) do
            test.it("refuses parent deletion that re-roots a closed " .. (nested and "descendant" or "child"), function()
                local parent = create_at("app:open_kind")
                local child = nested and create_at("app:open_kind", parent) or parent
                local closed = create_at("app:closed_kind", child)
                local before = row(closed)
                refusal(service():set_placement({component_id = closed, parent_id = false}))
                refusal(service():delete({component_id = parent, child_policy = "reparent_root"}))
                test.is_nil(row(parent).deleting_at)
                test.is_nil(row(parent).delete_intent)
                test.eq(row(closed).parent_id, child)
                test.eq(row(closed).path, before.path)
                local db = assert(sql.get("app:db"))
                local jobs = assert(db:query("SELECT id FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", {parent}))
                db:release()
                test.eq(#jobs, 0)
            end)
        end
        test.it("refuses moving an open parent with a closed descendant", function()
            local parent = create_at("app:open_kind")
            local child = create_at("app:open_kind", parent)
            local closed = create_at("app:closed_kind", child)
            local destination = create_at("app:open_kind")
            local before = row(closed)
            refusal(service():set_placement({component_id = parent, parent_id = destination}))
            test.is_nil(row(parent).parent_id)
            test.eq(row(closed).path, before.path)
        end)
        test.it("checks every affected child kind rather than the first child", function()
            local parent = create_at("app:open_kind")
            create_at("app:closed_kind", parent)
            local other = create_at("app:open_kind", parent)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET impl_id='app:other_closed_kind' WHERE component_id=$1", {other}))
            db:release()
            refusal(admit("delete", {component_id = parent, child_policy = "reparent_root"}), nil)
            test.is_nil(row(parent).deleting_at)
        end)
        test.it("allows reordering an open parent without moving its closed descendants", function()
            local parent = create_at("app:open_kind")
            local closed = create_at("app:closed_kind", parent)
            local before = row(closed)
            local result, err = service():set_placement({component_id = parent, position = "z"})
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
            test.eq(row(closed).path, before.path)
        end)
        test.it("admits descendant placement changes before the deletion worker runs", function()
            local parent = create_at("app:open_kind")
            local child = create_at("app:closed_kind", parent)
            local grandchild = create_at("app:closed_kind", child)
            local destination = create_at("app:open_kind")
            test.is_true(admit("set_placement", {component_id = parent, parent_id = destination}).success)
            local accepted = admit("delete", {component_id = parent, child_policy = "reparent_root"})
            test.is_true(accepted.success, tostring(accepted.error))
            local completed, completion_err = deletion_worker.run(parent)
            test.is_nil(completion_err)
            test.not_nil(completed)
            test.is_nil(row(parent))
            test.is_nil(row(child).parent_id)
            test.eq(row(grandchild).parent_id, child)
            test.is_true(row(grandchild).path:sub(1, #row(child).path) == row(child).path)
        end)
        test.it("refuses a new closed grandchild after ancestor deletion acceptance", function()
            local parent = create_at("app:open_kind")
            local child = create_at("app:open_kind", parent)
            local accepted, accept_err = service():delete({component_id = parent, child_policy = "reparent_root"})
            test.is_nil(accept_err)
            test.is_true(accepted.success, tostring(accepted.error))
            local created, create_err = service("app:kind_create_only"):register({impl_id = "app:closed_kind", parent_id = child})
            remember(created)
            test.is_nil(create_err)
            test.is_false(created.success)
            local completed, completion_err = deletion_worker.run(parent)
            test.is_nil(completion_err)
            test.not_nil(completed)
            test.is_nil(row(child).parent_id)
        end)
        test.it("refuses moving into or out of an accepted deletion subtree", function()
            local parent = create_at("app:open_kind")
            local child = create_at("app:open_kind", parent)
            local closed = create_at("app:closed_kind")
            local accepted, accept_err = service():delete({component_id = parent, child_policy = "reparent_root"})
            test.is_nil(accept_err)
            test.is_true(accepted.success, tostring(accepted.error))
            test.is_false(admit("set_placement", {component_id = closed, parent_id = child}).success)
            test.is_false(admit("set_placement", {component_id = child, parent_id = false}).success)
            test.eq(row(child).parent_id, parent)
            test.is_nil(row(closed).parent_id)
        end)
        test.it("keeps the subtree fenced while a reroot page retains its parent pointer", function()
            local parent = create_at("app:open_kind")
            local child = create_at("app:open_kind", parent)
            local grandchild = create_at("app:open_kind", child)
            test.is_true(service():delete({component_id = parent, child_policy = "reparent_root"}).success)
            local db = assert(sql.get("app:db"))
            local child_path = placement.build_path(db, child, nil)
            local grandchild_path = placement.build_path(db, grandchild, child_path)
            assert(db:execute("UPDATE kickside_components SET path=$1 WHERE component_id=$2", {child_path, child}))
            assert(db:execute("UPDATE kickside_components SET path=$1 WHERE component_id=$2", {grandchild_path, grandchild}))
            assert(db:execute("DELETE FROM kickside_component_ancestor WHERE ancestor_id=$1 AND component_id IN ($2,$3)",
                {parent, child, grandchild}))
            db:release()
            local moved, move_err = service():set_placement({component_id = grandchild, parent_id = false})
            test.is_nil(move_err)
            test.is_false(moved.success)
            test.eq(row(grandchild).parent_id, child)
            local completed, completion_err = deletion_worker.run(parent)
            test.is_nil(completion_err)
            test.not_nil(completed)
            test.is_true(service():set_placement({component_id = grandchild, parent_id = false}).success)
        end)
        test.it("allows DELETE and teardown of a closed kind without an update grant", function()
            local id = create_closed()
            local accepted, err = service():delete({component_id = id})
            test.is_nil(err)
            test.is_true(accepted.success, tostring(accepted.error))
            local completed, completion_err = deletion_worker.run(id)
            test.is_nil(completion_err)
            test.not_nil(completed)
            test.is_nil(row(id))
        end)
        for _, granted in ipairs({true, false}) do
            test.it("checks a hidden closed kind in the requesting frame " .. (granted and "with" or "without") .. " its grant", function()
                local policies = {assert(security.policy("app:kind_member_runtime")), assert(security.policy("app:kind_registry_deny"))}
                if granted then policies[#policies + 1] = assert(security.policy("app:kind_update_only")) end
                local result, err = funcs.new():with_actor(assert(security.new_actor(actor_id, {})))
                    :with_scope(assert(security.new_scope(policies))):call("app:kind_authority_probe", "app:closed_kind")
                test.is_nil(err)
                test.is_false(result.visible)
                test.eq(result.admitted, granted)
                if not granted then test.eq(result.code, "component_kind_mutation_denied") end
            end)
        end
        for _, method in ipairs({"update", "set_meta", "set_placement"}) do
            test.it("admits " .. method .. " of retained rows whose kind binding is absent", function()
                local id = create_closed()
                local db = assert(sql.get("app:db"))
                assert(db:execute("UPDATE kickside_components SET impl_id='app:removed_kind' WHERE component_id=$1", {id}))
                db:release()
                local args = {component_id = id}
                if method == "update" then
                    args.commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "forged"}}}}
                elseif method == "set_meta" then args.fields = {title = "forged"}
                else args.position = "z" end
                local client = service()
                local result, err = client[method](client, args)
                test.is_nil(err)
                test.is_true(result.success, tostring(result.error))
                if method == "set_placement" then test.eq(row(id).parent_id, nil) end
            end)
        end
        for _, nested in ipairs({false, true}) do
        test.it("moves and reroots an absent-kind " .. (nested and "descendant" or "child"), function()
            local parent = create_at("app:open_kind")
            local child = nested and create_at("app:open_kind", parent) or parent
            local retained = create_at("app:open_kind", child)
            local destination = create_at("app:open_kind")
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET impl_id='app:removed_kind' WHERE component_id=$1", {retained}))
            db:release()
            local before = row(retained).path
            local moved, move_err = service():set_placement({component_id = retained, parent_id = destination})
            test.is_nil(move_err)
            test.is_true(moved.success, tostring(moved.error))
            test.eq(row(retained).parent_id, destination)
            test.is_true(row(retained).path ~= before)
            test.is_true(service():set_placement({component_id = retained, parent_id = child}).success)
            local moved_parent, parent_err = service():set_placement({component_id = parent, parent_id = destination})
            test.is_nil(parent_err)
            test.is_true(moved_parent.success, tostring(moved_parent.error))
            test.is_true(row(retained).path:sub(1, #row(parent).path) == row(parent).path)
            local accepted, accept_err = service():delete({component_id = parent, child_policy = "reparent_root"})
            test.is_nil(accept_err)
            test.is_true(accepted.success, tostring(accepted.error))
            local completed, completion_err = deletion_worker.run(parent)
            test.is_nil(completion_err)
            test.not_nil(completed)
            test.is_nil(row(parent))
            test.eq(row(retained).parent_id, nested and child or nil)
            if nested then test.is_nil(row(child).parent_id) end
        end)
        end
        test.it("admits creation and context changes through the owning admission entry", function()
            local id = create_closed()
            local result = admit("update", {component_id = id, commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "admitted"}}}}})
            test.is_true(result.success, tostring(result.error))
        end)
        test.it("refuses direct member import of a closed kind", function()
            local id = create_closed()
            local exported, export_err = service():export({component_id = id})
            test.is_nil(export_err)
            test.is_true(exported.success, tostring(exported.error))
            local result, err = service():import({shell = exported.shell})
            remember(result)
            refusal(result, err)
        end)
        test.it("allows admitted metadata and placement writes", function()
            local id = create_closed()
            test.is_true(admit("set_meta", {component_id = id, fields = {title = "admitted"}}).success)
            test.is_true(admit("set_placement", {component_id = id, position = "z"}).success)
        end)
        test.it("kind authority still requires object WRITE access", function()
            local id = create_closed()
            local result, err = service("app:kind_admission_grant", uuid.v4()):update({component_id = id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "forged"}}}}})
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.kind, errors.PERMISSION_DENIED)
            unchanged(id)
        end)
        test.it("an update grant cannot create a closed kind", function()
            local result, err = service("app:kind_update_only"):register({impl_id = "app:closed_kind"})
            remember(result)
            refusal(result, err)
        end)
        test.it("keeps grants exact to both kind and action", function()
            local result = remember(admit("register", {impl_id = "app:other_closed_kind"}))
            refusal(result, nil)
            local id = create_closed()
            refusal(service("app:kind_create_only"):update({component_id = id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "forged"}}}}}))
        end)
        for _, kind in ipairs({"app:open_kind", "app:legacy_kind"}) do
            test.it("preserves member creation and updates for " .. kind, function()
                local client = service()
                local result, err = client:register({impl_id = kind})
                test.is_nil(err)
                remember(result)
                test.is_true(result.success, tostring(result.error))
                local updated, update_err = client:update({component_id = result.component_id,
                    commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "member"}}}}})
                test.is_nil(update_err)
                test.is_true(updated.success, tostring(updated.error))
            end)
        end
        test.it("requires both exact kind admission and maintenance ownership on creation", function()
            local denied, deny_err = service("app:kind_maintenance_ownership", "system:kind-owner"):register({impl_id = "app:closed_kind"})
            remember(denied)
            refusal(denied, deny_err)
            local policies = {assert(security.policy("app:kind_member_runtime")),
                assert(security.policy("app:kind_maintenance_ownership")), assert(security.policy("app:kind_admission_grant"))}
            local client = assert(assert(contract.get("kickside.component:component_service"))
                :with_actor(assert(security.new_actor("system:kind-owner", {})))
                :with_scope(assert(security.new_scope(policies))):open())
            local result, err = client:register({impl_id = "app:closed_kind"})
            test.is_nil(err)
            remember(result)
            test.is_true(result.success, tostring(result.error))
            refusal(service("app:kind_maintenance_ownership", "system:kind-owner"):update({
                component_id = result.component_id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "forged"}}}}}))
            local updated, update_err = client:update({component_id = result.component_id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "maintenance"}}}}})
            test.is_nil(update_err)
            test.is_true(updated.success, tostring(updated.error))
            local no_ownership, ownership_err = service("app:kind_admission_grant", "system:kind-owner"):register({impl_id = "app:closed_kind"})
            remember(no_ownership)
            test.is_nil(ownership_err)
            test.is_false(no_ownership.success)
            test.eq(no_ownership.kind, errors.PERMISSION_DENIED)
        end)
        test.it("admits closed imports through the owning function grant", function()
            local id = create_closed()
            local exported, export_err = service():export({component_id = id})
            test.is_nil(export_err)
            test.is_true(exported.success, tostring(exported.error))
            local imported = remember(admit("import", {shell = exported.shell}))
            test.is_true(imported.success, tostring(imported.error))
        end)
        for _, granted in ipairs({false, true}) do
            test.it("checks verified framework creation " .. (granted and "with" or "without") .. " the exact kind grant", function()
                local id = uuid.v4()
                ids[#ids + 1] = id
                local policies = {assert(security.policy("app:kind_member_runtime")),
                    assert(security.policy("app:kind_declaration_create_only"))}
                if granted then policies[#policies + 1] = assert(security.policy("app:kind_create_only")) end
                local result, err = funcs.new():with_actor(assert(security.new_actor("system:kind-install", {})))
                    :with_scope(assert(security.new_scope(policies))):call("app:kind_declared_create", {
                        operator = actor_id, input = {component_id = id, impl_id = "app:closed_kind", automation_id = id,
                            command_id = "install:" .. id, generation = 1, declaration_hash = "closed", rollback = {}}})
                test.is_nil(err)
                if granted then
                    test.is_true(result.success, tostring(result.error))
                    test.not_nil(row(id))
                else
                    refusal(result, err)
                    test.is_nil(row(id))
                end
            end)
        end
        for _, populated in ipairs({false, true}) do
            test.it("admits " .. (populated and "populated" or "empty") .. " receipt metadata with only the create grant", function()
                local id = uuid.v4()
                ids[#ids + 1] = id
                local policies = {assert(security.policy("app:kind_member_runtime")),
                    assert(security.policy("app:kind_declaration_create_only")),
                    assert(security.policy("app:kind_create_only"))}
                local result, err = funcs.new():with_actor(assert(security.new_actor("system:kind-install", {})))
                    :with_scope(assert(security.new_scope(policies))):call("app:kind_declared_create", {
                        operator = actor_id, public_meta = populated and {title = "receipt", count = 2} or {},
                        input = {component_id = id, impl_id = "app:closed_kind", automation_id = id,
                            command_id = "install:" .. id, generation = 1, declaration_hash = "closed", rollback = {},
                            meta = {title = "initial", retained = "yes"}}})
                test.is_nil(err)
                test.is_true(result.success, tostring(result.error))
                local function metadata()
                    local db = assert(sql.get("app:db"))
                    local rows = assert(db:query("SELECT key,value FROM kickside_component_meta WHERE component_id=$1", {id}))
                    db:release()
                    local fields = {}
                    for _, field in ipairs(rows) do fields[field.key] = field.value end
                    return fields
                end
                test.eq(metadata().title, populated and "receipt" or "initial")
                test.eq(metadata().retained, "yes")
                test.eq(metadata().count, populated and "2" or nil)
                local denied, deny_err = service("app:kind_create_only"):set_meta({component_id = id, fields = {title = "later"}})
                refusal(denied, deny_err)
                test.eq(denied.details.operation, "update")
                test.eq(metadata().title, populated and "receipt" or "initial")
                test.is_true(admit("set_meta", {component_id = id, fields = {title = "updated"}}).success)
                test.eq(metadata().title, "updated")
            end)
        end
        test.it("adopts a closed orphan under operator authority without a kind grant", function()
            local policies = {assert(security.policy("app:kind_member_runtime")),
                assert(security.policy("app:kind_maintenance_ownership")), assert(security.policy("app:kind_create_only"))}
            local client = assert(assert(contract.get("kickside.component:component_service"))
                :with_actor(assert(security.new_actor("system:kind-owner", {})))
                :with_scope(assert(security.new_scope(policies))):open())
            local created, create_err = client:register({impl_id = "app:closed_kind"})
            test.is_nil(create_err)
            remember(created)
            test.is_true(created.success, tostring(created.error))
            local adopted, adopt_err = service("app:kind_adopt_only"):adopt({component_id = created.component_id})
            test.is_nil(adopt_err)
            test.is_true(adopted.success, tostring(adopted.error))
            test.eq(adopted.adopted_by, actor_id)
            refusal(service():update({component_id = created.component_id,
                commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "forged"}}}}}))
        end)
    end)
end)}
