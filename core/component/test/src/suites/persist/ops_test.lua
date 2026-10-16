local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local test = require("test")
local ops = require("ops")
local component_command = require("component_command")
local component_client = require("component_client")
local placement_ops = require("placement_ops")
local context_ops = require("context_ops")
local identity_ops = require("identity_ops")
local contract = require("contract")
local lifecycle_stub = require("lifecycle_stub")

-- Registers this process as the lifecycle commit probe; take() reports whether one
-- committed notification arrived and drains it.
local function commit_probe()
    local mailbox, listen_err = process.listen(lifecycle_stub.COMMIT_TOPIC, { message = true })
    if listen_err or not mailbox then error("commit probe listen failed: " .. tostring(listen_err)) end
    local _, register_err = process.registry.register(lifecycle_stub.COMMIT_PROBE)
    if register_err then error("commit probe register failed: " .. tostring(register_err)) end
    local probe = {}
    function probe.take(): boolean
        return channel.select({ mailbox:case_receive(), default = true }).channel == mailbox
    end
    function probe.close()
        process.registry.unregister(lifecycle_stub.COMMIT_PROBE)
        process.unlisten(mailbox)
    end
    return probe
end

local function db()
    local d, err = sql.get("app:db")
    if err then error(tostring(err)) end
    return d
end

local function seed(d, context)
    local id = uuid.v7()
    local now = time.now():format(time.RFC3339)
    local encoded, err = json.encode(context)
    if err then error(tostring(err)) end
    local _, insert_err = sql.builder.insert("kickside_components"):set_map({
        component_id = id, impl_id = "kickside.test:security", private_context = encoded,
        position = "n", created_at = now, updated_at = now,
    }):run_with(d):exec()
    if insert_err then error(tostring(insert_err)) end
    return id
end

local function context(d, id)
    local rows, err = sql.builder.select("private_context", "context_revision")
        :from("kickside_components"):where("component_id = ?", id):limit(1):run_with(d):query()
    if err then error(tostring(err)) end
    local decoded, decode_err = json.decode(tostring(rows[1].private_context))
    if decode_err then error(tostring(decode_err)) end
    return decoded, tonumber(rows[1].context_revision)
end

local function component_count(d)
    local rows, err = d:query("SELECT COUNT(*) AS total FROM kickside_components")
    if err then error(tostring(err)) end
    return tonumber(rows[1].total)
end

local function grant(d, id, mask)
    local _, err = sql.builder.insert("kickside_component_access"):set_map({
        access_id = uuid.v7(), subject_id = "system:automation", subject_type = "user",
        component_id = id, source_component_id = id, access_mask = mask,
        inherited = 0,
    }):run_with(d):exec()
    if err then error(tostring(err)) end
end

local function dispatch(d, kind, payload)
    local tx, begin_err = d:begin()
    if begin_err then error(tostring(begin_err)) end
    local result, err = ops.dispatch(tx, d, { type = kind, payload = payload })
    if err then tx:rollback() else
        local first, second = tx:commit()
        if first == false or second == false or (first ~= nil and first ~= true)
            or (second ~= nil and second ~= true) then
            error(tostring(first ~= true and first or second))
        end
    end
    return result, err
end

local function apply_declaration(d, input)
    local token, prepare_err = ops.prepare_declaration(input, function(request)
        return {
            valid = true, operator_valid = true, subject_valid = true, pins_lowered = true,
            operator_id = "operator", execution_subject_id = "subject",
            component_id = request.component_id, automation_id = request.automation_id,
            command_id = request.command_id, generation = request.generation,
            declaration_hash = request.declaration_hash, declaration = request.declaration,
            affected_drive_keys = { "drive-a" },
        }
    end)
    if prepare_err then return nil, prepare_err end
    local tx, begin_err = d:begin()
    if begin_err then error(tostring(begin_err)) end
    local result, err = ops.apply_declaration_tx(tx, token)
    if err then tx:rollback() else tx:commit() end
    return result, err
end

local run_cases = test.run_cases(function()
    test.describe("component identity boundary", function()
        test.it("refuses forged runtime context on every create entry", function()
            local d = db()
            local service, service_err = contract.get("kickside.component:component_service")
            if service_err then error(tostring(service_err)) end
            local instance, open_err = service:open()
            if open_err then error(tostring(open_err)) end
            local paths = {
                { name = "direct placement writer", invoke = function(id, private)
                    local tx = d:begin()
                    local result, err = placement_ops.create_component(tx, d,
                        { type = ops.COMMAND_TYPES.CREATE_COMPONENT, payload = {
                            component_id = id, impl_id = "kickside.test:security",
                            actor_id = "system:automation", private_context = private,
                        } })
                    tx:rollback()
                    return result, err
                end },
                { name = "persist dispatch", invoke = function(id, private)
                    return dispatch(d, ops.COMMAND_TYPES.CREATE_COMPONENT, {
                        component_id = id, impl_id = "kickside.test:security",
                        actor_id = "system:automation", private_context = private,
                    })
                end },
                { name = "registration contract", invoke = function(id, private)
                    local result = instance:register({ component_id = id,
                        impl_id = "kickside.test:security", private_context = private })
                    if result and result.success then return result, nil end
                    return nil, result
                end },
                { name = "portable import", invoke = function(_id, private)
                    local shell, encode_err = json.encode({ schema_version = 1,
                        impl_id = "app:portable_impl", meta = {}, context = private })
                    if encode_err then error(tostring(encode_err)) end
                    local result = instance:import({ shell = shell })
                    if result and result.success then return result, nil end
                    return nil, result
                end },
            }
            for _, path in ipairs(paths) do
                for _, key in ipairs({ "_portable_input", "_execution_identity", "_rollback" }) do
                    local id = uuid.v7()
                    local before_count = component_count(d)
                    local result, err = path.invoke(id, { public = "allowed", [key] = { actor_id = "forged" } })
                    test.is_nil(result)
                    test.not_nil(err)
                    local denied = type(err.kind) == "string" and err.kind == errors.PERMISSION_DENIED
                        or errors.is(err, errors.PERMISSION_DENIED)
                    test.eq(denied, true)
                    test.eq(component_count(d), before_count)
                    local rows, read_err = sql.builder.select("component_id")
                        :from("kickside_components"):where("component_id = ?", id):run_with(d):query()
                    if read_err then error(tostring(read_err)) end
                    test.eq(#(rows or {}), 0)
                end
            end
            d:release()
        end)

        test.it("refuses forged keys through every generic update and direct persist entry", function()
            local d = db()
            local id = seed(d, { public = "before" })
            grant(d, id, ops.ACCESS.WRITE)
            local paths = {
                { name = "direct SET_CONTEXT", invoke = function(key)
                    local tx = d:begin()
                    local result, err = context_ops.set_context(tx, { component_id = id,
                        private_context = { [key] = { actor_id = "forged" } } })
                    tx:rollback()
                    return result, err
                end },
                { name = "direct PATCH_CONTEXT", invoke = function(key)
                    local tx = d:begin()
                    local result, err = context_ops.patch_context(tx, { component_id = id,
                        patch = { [key] = { actor_id = "forged" } } })
                    tx:rollback()
                    return result, err
                end },
                { name = "dispatch SET_CONTEXT", invoke = function(key)
                    return dispatch(d, ops.COMMAND_TYPES.SET_CONTEXT,
                        { component_id = id, private_context = { [key] = { actor_id = "forged" } } })
                end },
                { name = "dispatch PATCH_CONTEXT", invoke = function(key)
                    return dispatch(d, ops.COMMAND_TYPES.PATCH_CONTEXT,
                        { component_id = id, patch = { [key] = { actor_id = "forged" } } })
                end },
                { name = "public update SET_CONTEXT", invoke = function(key)
                    return component_client.update(id, { { type = ops.COMMAND_TYPES.SET_CONTEXT,
                        payload = { private_context = { [key] = { actor_id = "forged" } } } } })
                end },
                { name = "public update PATCH_CONTEXT", invoke = function(key)
                    return component_client.update(id, { { type = ops.COMMAND_TYPES.PATCH_CONTEXT,
                        payload = { patch = { [key] = { actor_id = "forged" } } } } })
                end },
            }
            local _, before_revision = context(d, id)
            for _, path in ipairs(paths) do
                for _, key in ipairs({ "_portable_input", "_execution_identity", "_rollback" }) do
                    local result, err = path.invoke(key)
                    test.is_nil(result)
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                    local stored, revision = context(d, id)
                    test.eq(stored.public, "before")
                    test.is_nil(stored[key])
                    test.eq(revision, before_revision)
                end
            end
            d:release()
        end)

        test.it("refuses replacement and patch of runtime owned keys before a write", function()
            local d = db()
            local id = seed(d, {
                public = "before", _portable_input = { source = "old" },
                _execution_identity = { version = 2, principal = { kind = "user", id = "owner" }, authorized_by = { kind = "user", id = "owner" }, authorized_via = "interactive" }, _rollback = { step = 1 },
            })
            local _, before_revision = context(d, id)
            for _, key in ipairs({ "_portable_input", "_execution_identity", "_rollback" }) do
                local replacement = { public = "after" }
                replacement[key] = { attacker = true }
                local _, set_err = dispatch(d, ops.COMMAND_TYPES.SET_CONTEXT,
                    { component_id = id, private_context = replacement })
                test.not_nil(set_err)
                local _, patch_err = dispatch(d, ops.COMMAND_TYPES.PATCH_CONTEXT,
                    { component_id = id, patch = { [key] = { attacker = true } } })
                test.not_nil(patch_err)
                local _, delete_err = dispatch(d, ops.COMMAND_TYPES.PATCH_CONTEXT,
                    { component_id = id, patch = {}, delete_keys = { key } })
                test.not_nil(delete_err)
            end
            local stored, after_revision = context(d, id)
            test.eq(stored.public, "before")
            test.eq(stored._execution_identity.principal.id, "owner")
            test.eq(after_revision, before_revision)
            d:release()
        end)

        test.it("preserves runtime keys in a generic replacement", function()
            local d = db()
            local id = seed(d, { public = "before", _portable_input = { source = "old" },
                _execution_identity = { version = 2, principal = { kind = "user", id = "owner" }, authorized_by = { kind = "user", id = "owner" }, authorized_via = "interactive" }, _rollback = { step = 1 } })
            local _, err = dispatch(d, ops.COMMAND_TYPES.SET_CONTEXT,
                { component_id = id, private_context = { public = "after" } })
            test.is_nil(err)
            local stored = context(d, id)
            test.eq(stored.public, "after")
            test.eq(stored._portable_input.source, "old")
            test.eq(stored._execution_identity.principal.id, "owner")
            test.eq(stored._rollback.step, 1)
            d:release()
        end)

        test.it("rejects runtime keys through the public update contract", function()
            local d = db()
            local id = seed(d, { public = "before", _execution_identity = { version = 2, principal = { kind = "user", id = "owner" }, authorized_by = { kind = "user", id = "owner" }, authorized_via = "interactive" } })
            grant(d, id, ops.ACCESS.WRITE)
            local _, set_err = component_client.update(id, { {
                type = ops.COMMAND_TYPES.SET_CONTEXT,
                payload = { private_context = { public = "after", _execution_identity = { actor_id = "attacker" } } },
            } })
            test.not_nil(set_err)
            test.eq(errors.is(set_err, errors.PERMISSION_DENIED), true)
            local _, patch_err = component_client.update(id, { {
                type = ops.COMMAND_TYPES.PATCH_CONTEXT,
                payload = { patch = { _execution_identity = { actor_id = "attacker" } } },
            } })
            test.not_nil(patch_err)
            test.eq(errors.is(patch_err, errors.PERMISSION_DENIED), true)
            local stored = context(d, id)
            test.eq(stored.public, "before")
            test.eq(stored._execution_identity.principal.id, "owner")
            d:release()
        end)

        test.it("does not expose the identity command through generic dispatch", function()
            local d = db()
            local id = seed(d, {})
            local _, err = dispatch(d, "SET_EXECUTION_IDENTITY",
                { component_id = id, identity = { actor_id = "attacker" } })
            test.not_nil(err)
            test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
            d:release()
        end)

        test.it("refuses direct privileged persist invocation without a validated token", function()
            local d = db()
            local id = seed(d, {})
            local tx = d:begin()
            local _, err = ops.apply_declaration_tx(tx, {
                component_id = id, automation_id = "fake", generation = 999,
                declaration = { source = "attacker" },
            })
            tx:rollback()
            test.not_nil(err)
            local identity_tx = d:begin()
            local _, identity_err = ops.set_execution_identity_tx(identity_tx,
                { forged = true })
            identity_tx:rollback()
            test.not_nil(identity_err)
            test.eq(errors.is(identity_err, errors.PERMISSION_DENIED), true)
            local stored = context(d, id)
            test.is_nil(stored._portable_input)
            test.is_nil(stored._execution_identity)
            d:release()
        end)

        test.it("redacts runtime keys at READ and WRITE, retaining them at ADMIN", function()
            local private = { label = "visible", _portable_input = { credential = "secret" },
                _execution_identity = { version = 2, principal = { kind = "user", id = "owner" }, authorized_by = { kind = "user", id = "owner" }, authorized_via = "interactive" }, _rollback = { previous = "secret" } }
            for _, mask in ipairs({ ops.ACCESS.READ, ops.ACCESS.WRITE, ops.ACCESS.READ_WRITE }) do
                local visible = ops.redact_context(private, mask)
                test.eq(visible.label, "visible")
                test.is_nil(visible._portable_input)
                test.is_nil(visible._execution_identity)
                test.is_nil(visible._rollback)
            end
            test.eq(ops.redact_context(private, ops.ACCESS.ADMIN)._execution_identity.principal.id, "owner")
            test.eq(private._portable_input.credential, "secret")
        end)

        test.it("lets a framework system actor read both direct service contexts", function()
            local d = db()
            local id = seed(d, { label = "visible", _portable_input = { source = "secret" },
                _execution_identity = { version = 2, principal = { kind = "user", id = "owner" }, authorized_by = { kind = "user", id = "owner" }, authorized_via = "interactive" }, _rollback = { previous = 1 } })
            grant(d, id, ops.ACCESS.READ)
            local _, meta_err = sql.builder.insert("kickside_component_meta"):set_map({
                meta_id = uuid.v7(), component_id = id, key = "s_security_class", value = id,
                created_at = time.now():format(time.RFC3339), updated_at = time.now():format(time.RFC3339),
            }):run_with(d):exec()
            if meta_err then error(tostring(meta_err)) end
            local service, service_err = component_client.get_service()
            if service_err or not service then error(tostring(service_err or "component service unavailable")) end
            local by_id, id_err = service:get_access_context({
                component_id = id, access_mask = ops.ACCESS.READ, include_context = true,
            })
            if id_err then error(tostring(id_err)) end
            test.eq(by_id.success, true)
            test.eq(by_id.context.label, "visible")
            test.eq(by_id.context._portable_input.source, "secret")
            test.eq(by_id.context._execution_identity.principal.id, "owner")
            test.eq(by_id.context._rollback.previous, 1)
            local by_meta, meta_call_err = service:get_access_context_by_meta({
                meta = { s_security_class = id }, access_mask = ops.ACCESS.READ, include_context = true,
            })
            if meta_call_err then error(tostring(meta_call_err)) end
            test.eq(by_meta.success, true)
            test.eq(by_meta.context._execution_identity.principal.id, "owner")
            d:release()
        end)

        test.it("keeps an access failure classified through the component client", function()
            local _, err = component_client.get_context(uuid.v7(), ops.ACCESS.READ)
            test.not_nil(err)
            local details = assert(err):details()
            test.eq(details.error_kind, "access")
        end)

        test.it("fences declaration generations and rejects a changed command", function()
            local d = db()
            local id = seed(d, { _portable_input = { source = "initial" }, other = 1 })
            local input = { component_id = id, automation_id = "automation-a", generation = 2,
                command_id = "command-2", declaration_hash = "hash-2", declaration = { source = "new" } }
            local first, first_err = apply_declaration(d, input)
            test.is_nil(first_err)
            test.eq(first.changes_made, true)
            local stored, revision = context(d, id)
            test.eq(stored._portable_input.source, "new")
            test.eq(stored.other, 1)

            local again, again_err = apply_declaration(d, input)
            test.is_nil(again_err)
            test.eq(again.changes_made, false)
            local _, same_revision = context(d, id)
            test.eq(same_revision, revision)

            local _, stale_err = apply_declaration(d, { component_id = id, automation_id = "automation-a",
                generation = 1, command_id = "command-1", declaration_hash = "hash-1",
                declaration = { source = "stale" } })
            test.not_nil(stale_err)
            local _, changed_err = apply_declaration(d, { component_id = id, automation_id = "automation-a",
                generation = 2, command_id = "command-2", declaration_hash = "different",
                declaration = { source = "changed" } })
            test.not_nil(changed_err)
            local replacement = { component_id = id, automation_id = "automation-a", generation = 3,
                command_id = "command-3", declaration_hash = "hash-3",
                declaration = { source = "resolved" } }
            local next_result, next_err = apply_declaration(d, replacement)
            test.is_nil(next_err)
            test.eq(next_result.generation, 3)
            local _, delayed_err = apply_declaration(d, input)
            test.not_nil(delayed_err)
            local final = context(d, id)
            test.eq(final._portable_input.source, "resolved")
            d:release()
        end)

        test.it("creates an automation component through the one privileged create path", function()
            local d = db()
            local id = uuid.v7()
            local operator = "operator-" .. string.sub(uuid.v7(), 1, 8)
            local declaration = { source = "ns:events", sink = "test:sink" }
            local function receipt_for(subject)
                return function(request)
                    return {
                        valid = true, operator_valid = true, subject_valid = true, pins_lowered = true,
                        operator_id = operator, execution_subject_id = subject,
                        component_id = request.component_id, automation_id = request.automation_id,
                        command_id = request.command_id, generation = request.generation,
                        declaration_hash = request.declaration_hash, declaration = declaration,
                        affected_drive_keys = { "main" },
                    }
                end
            end
            local input = {
                component_id = id, impl_id = "kickside.test:security", automation_id = id,
                command_id = "install:" .. id, generation = 1, declaration_hash = "hash-1",
                context = { title = "Watch" }, meta = { title = "Watch" },
                rollback = { { target = "kickside.test:undo", args = { child = "c1" } } },
            }

            local _, subject_err = component_command.create_declared(input, receipt_for("someone-else"))
            test.not_nil(subject_err)
            test.eq(errors.is(subject_err, errors.INVALID), true)
            local _, generation_err = component_command.create_declared(
                { component_id = id, impl_id = "kickside.test:security", automation_id = id, command_id = "c",
                  generation = 2, declaration_hash = "h", rollback = {} }, receipt_for(operator))
            test.not_nil(generation_err)
            local _, forged_err = component_command.create_declared(
                { component_id = id, impl_id = "kickside.test:security", automation_id = id, command_id = "c",
                  generation = 1, declaration_hash = "h", rollback = {}, context = { _rollback = {} } }, receipt_for(operator))
            test.not_nil(forged_err)

            local probe = commit_probe()
            local created, err = component_command.create_declared(input, receipt_for(operator))
            test.is_nil(err)
            test.eq(created.component_id, id)
            test.is_true(probe.take(), "a committed declared create does not notify its lifecycle work")
            local stored = context(d, id)
            test.eq(stored.title, "Watch")
            test.eq(stored._portable_input.source, "ns:events")
            test.eq(stored._execution_identity.version, 2)
            test.eq(stored._execution_identity.principal.id, operator)
            test.eq(stored._execution_identity.authorized_by.id, operator)
            test.eq(#stored._rollback, 1)
            test.eq(stored._rollback[1].target, "kickside.test:undo")
            test.eq(stored._rollback[1].args.child, "c1")
            local fences, fence_err = d:query("SELECT applied_command_generation, command_id FROM kickside_component_declaration_fence WHERE component_id = $1", { id })
            test.is_nil(fence_err)
            test.eq(tonumber(fences[1].applied_command_generation), 1)
            test.eq(fences[1].command_id, "install:" .. id)
            local access, access_err = d:query("SELECT access_mask FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2", { id, operator })
            test.is_nil(access_err)
            test.eq(tonumber(access[1].access_mask), ops.ACCESS.FULL)

            -- A repeated step of the same install command is idempotent; another
            -- command for the existing component is a conflict.
            local again, again_err = component_command.create_declared(input, receipt_for(operator))
            test.is_nil(again_err, tostring(again_err))
            test.eq(again.component_id, id)
            test.eq(again.changes_made, false)
            test.is_false(probe.take(), "an idempotent declared create notifies lifecycle work it did not record")
            probe.close()
            local other = {}
            for k, v in pairs(input) do other[k] = v end
            other.command_id = "install:other"
            local _, other_err = component_command.create_declared(other, receipt_for(operator))
            test.not_nil(other_err)
            test.eq(errors.is(other_err, errors.CONFLICT), true)
            d:release()
        end)

        test.it("refuses a nested authority change when validation rejects it", function()
            local d = db()
            local id = seed(d, { _portable_input = { transform = { type = "func",
                config = { resource = "allowed" } } } })
            local input = { component_id = id, automation_id = "automation-a", generation = 1,
                command_id = "retarget", declaration_hash = "retarget-hash",
                declaration = { transform = { type = "func", config = { resource = "other" } } } }
            local _, err = ops.prepare_declaration(input, function(request)
                return { valid = false, operator_valid = false, subject_valid = true,
                    pins_lowered = true, component_id = request.component_id,
                    operator_id = "operator", execution_subject_id = "subject",
                    automation_id = request.automation_id, command_id = request.command_id,
                    generation = request.generation, declaration_hash = request.declaration_hash,
                    declaration = request.declaration, affected_drive_keys = { "drive-a" } }
            end)
            test.not_nil(err)
            local _, revoked_err = ops.prepare_declaration(input, function(request)
                return { valid = true, operator_valid = true, subject_valid = false,
                    pins_lowered = true, component_id = request.component_id,
                    operator_id = "operator", execution_subject_id = "subject",
                    automation_id = request.automation_id, command_id = request.command_id,
                    generation = request.generation, declaration_hash = request.declaration_hash,
                    declaration = request.declaration, affected_drive_keys = { "drive-a" } }
            end)
            test.not_nil(revoked_err)
            test.eq(errors.is(revoked_err, errors.PERMISSION_DENIED), true)
            test.eq(revoked_err:details().error_kind, "access")
            local stored = context(d, id)
            test.eq(stored._portable_input.transform.config.resource, "allowed")
            d:release()
        end)

    end)
end)

return { run = function(options) return run_cases(options) end }
