local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local test = require("test")
local ops = require("ops")
local component_command = require("component_command")
local component_client = require("component_client")
local funcs = require("funcs")
local security = require("security")
local identity_ops = require("identity_ops")
local contract = require("contract")

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













        test.describe("SET_EXECUTION_IDENTITY fence", function()
            -- Mirrors migration 07 until F registers it: identity_generation /
            -- identity_hash columns plus the audit table, idempotent on both
            -- engines so the suite runs before and after registration.
            local function ensure_identity_schema(d)
                local _, column_err = sql.builder.select("identity_generation")
                    :from("kickside_components"):limit(0):run_with(d):query()
                if column_err then
                    local _, generation_err = d:execute(
                        "ALTER TABLE kickside_components ADD COLUMN identity_generation INTEGER NOT NULL DEFAULT 0")
                    if generation_err
                        and not tostring(generation_err):find("already exists", 1, true)
                        and not tostring(generation_err):find("duplicate", 1, true) then
                        error(tostring(generation_err))
                    end
                    local _, hash_err = d:execute(
                        "ALTER TABLE kickside_components ADD COLUMN identity_hash TEXT")
                    if hash_err
                        and not tostring(hash_err):find("already exists", 1, true)
                        and not tostring(hash_err):find("duplicate", 1, true) then
                        error(tostring(hash_err))
                    end
                end
                local _, audit_err = d:execute([[CREATE TABLE IF NOT EXISTS kickside_execution_identity_audit (
                    component_id TEXT NOT NULL, identity_generation INTEGER NOT NULL,
                    request_id TEXT NOT NULL, record_json TEXT NOT NULL,
                    created_at TEXT NOT NULL, published_at TEXT,
                    PRIMARY KEY (component_id, identity_generation),
                    UNIQUE (component_id, request_id))]])
                if audit_err then error(tostring(audit_err)) end
            end

            local selection_actor
            local function with_actor(actor_id, body)
                local original = selection_actor
                selection_actor = assert(security.new_actor(actor_id, {}))
                local ok, err = pcall(body)
                selection_actor = original
                if not ok then error(err) end
            end

            local function set_identity(id, principal, request_id, expected)
                return funcs.new():with_actor(selection_actor)
                    :with_scope(assert(security.new_scope({assert(security.policy("app:test_scope_policy"))})))
                    :call("app:identity_selection_probe", {component_id = id, principal = principal,
                        request_id = request_id, expected_identity_generation = expected})
            end

            local function grant_for(d, id, subject, mask)
                local _, err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(), subject_id = subject, subject_type = "user",
                    component_id = id, source_component_id = id, access_mask = mask,
                    inherited = 0,
                }):run_with(d):exec()
                if err then error(tostring(err)) end
            end

            local function generation(d, id)
                local rows, err = sql.builder.select("identity_generation", "identity_hash")
                    :from("kickside_components"):where("component_id = ?", id)
                    :limit(1):run_with(d):query()
                if err then error(tostring(err)) end
                return tonumber(rows[1].identity_generation), rows[1].identity_hash
            end

            local function audit_rows(d, id)
                local rows, err = sql.builder.select("identity_generation", "request_id", "record_json")
                    :from("kickside_execution_identity_audit"):where("component_id = ?", id)
                    :run_with(d):query()
                if err then error(tostring(err)) end
                return rows or {}
            end

            test.it("initializes a user creator as their own v2 principal with an audit row", function()
                local d = db()
                ensure_identity_schema(d)
                local id = uuid.v7()
                local created, create_err = dispatch(d, ops.COMMAND_TYPES.CREATE_COMPONENT, {
                    component_id = id, impl_id = "kickside.test:security",
                    actor_id = "creator-1", private_context = { label = "kept" },
                })
                test.is_nil(create_err)
                test.not_nil(created)
                local stored = context(d, id)
                test.eq(stored.label, "kept")
                test.eq(stored._execution_identity.version, 2)
                test.eq(stored._execution_identity.principal.kind, "user")
                test.eq(stored._execution_identity.principal.id, "creator-1")
                test.eq(stored._execution_identity.authorized_by.id, "creator-1")
                local gen, hash = generation(d, id)
                test.eq(gen, 0)
                test.not_nil(hash)
                local audits = audit_rows(d, id)
                test.eq(#audits, 1)
                test.eq(audits[1].request_id, "initial:" .. id)
                d:release()
            end)

            test.it("leaves framework creators without an identity until SET", function()
                local d = db()
                ensure_identity_schema(d)
                local id = uuid.v7()
                local _, create_err = dispatch(d, ops.COMMAND_TYPES.CREATE_COMPONENT, {
                    component_id = id, impl_id = "kickside.test:security",
                    actor_id = "system:automation", private_context = {},
                })
                test.is_nil(create_err)
                local stored = context(d, id)
                test.is_nil(stored._execution_identity)
                test.eq(#audit_rows(d, id), 0)
                d:release()
            end)

            test.it("sets self with ADMIN, fencing the generation and auditing once", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                with_actor("owner-1", function()
                    local result, err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-1", 0)
                    test.is_nil(err)
                    test.eq(result.identity_generation, 1)
                    test.eq(result.principal.id, "owner-1")
                    test.eq(result.request_id, "req-1")
                end)
                local stored = context(d, id)
                test.eq(stored._execution_identity.version, 2)
                test.eq(stored._execution_identity.authorized_by.id, "owner-1")
                local gen, hash = generation(d, id)
                test.eq(gen, 1)
                test.not_nil(hash)
                local audits = audit_rows(d, id)
                test.eq(#audits, 1)
                test.is_true(string.find(audits[1].record_json, "user:owner-1", 1, true) ~= nil)
                d:release()
            end)

            test.it("preserves inherited credential and link restrictions when adopting an identity", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                local stored = context(d, id)
                stored._execution_identity = {
                    version = 2,
                    principal = { kind = "user", id = "prior-1" },
                    authorized_by = { kind = "user", id = "admin-1" },
                    component_id = id,
                    credential_id = "cred-1",
                    link_id = "link-1",
                    captured_at = "2026-10-07T00:00:00Z",
                }
                local encoded, encode_err = json.encode(stored)
                test.is_nil(encode_err)
                local _, update_err = sql.builder.update("kickside_components")
                    :set("private_context", encoded):where("component_id = ?", id):run_with(d):exec()
                test.is_nil(update_err)
                with_actor("owner-1", function()
                    local result, err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-preserve-restrictions", 0)
                    test.is_nil(err)
                    test.not_nil(result)
                end)
                local adopted = context(d, id)._execution_identity
                test.eq(adopted.principal.id, "owner-1")
                test.eq(adopted.credential_id, "cred-1")
                test.eq(adopted.link_id, "link-1")
                local _, hash = generation(d, id)
                test.is_true(string.find(hash, "\"credential_id\":\"cred-1\"", 1, true) ~= nil)
                test.is_true(string.find(hash, "\"link_id\":\"link-1\"", 1, true) ~= nil)
                d:release()
            end)

            test.it("requires ADMIN and refuses forged identity without mutation", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, { label = "kept" })
                grant_for(d, id, "owner-1", ops.ACCESS.WRITE)
                with_actor("owner-1", function()
                    local _, denied = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-write", 0)
                    test.not_nil(denied)
                    test.eq(errors.is(denied, errors.PERMISSION_DENIED), true)
                end)
                local stored = context(d, id)
                test.is_nil(stored._execution_identity)
                test.eq(stored.label, "kept")
                test.eq(#audit_rows(d, id), 0)
                local gen = generation(d, id)
                test.eq(gen, 0)
                d:release()
            end)

            test.it("refuses a group actor as SET authorizer with a typed access denial", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                with_actor("principal:group:eng", function()
                    local _, denied = set_identity(id,
                        { kind = "group", id = "eng" }, "req-group", 0)
                    test.not_nil(denied)
                    test.eq(errors.is(denied, errors.PERMISSION_DENIED), true)
                end)
                test.eq(#audit_rows(d, id), 0)
                d:release()
            end)

            test.it("denies another principal without delegation and keeps the old identity", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                with_actor("owner-1", function()
                    local first, first_err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-first", 0)
                    test.is_nil(first_err)
                    test.eq(first.identity_generation, 1)
                    local _, denied = set_identity(id,
                        { kind = "user", id = "intruder" }, "req-intruder", 1)
                    test.not_nil(denied)
                    test.eq(errors.is(denied, errors.PERMISSION_DENIED), true)
                end)
                local stored = context(d, id)
                test.eq(stored._execution_identity.principal.id, "owner-1")
                local gen = generation(d, id)
                test.eq(gen, 1)
                test.eq(#audit_rows(d, id), 1)
                d:release()
            end)

            -- A declaration fence row makes the component automation-owned: its
            -- declaration owner's command stream is the only identity writer, so a
            -- SET succeeds only for a pending set_execution_identity command that owner confirms.
            local function fence_for(d, id, automation_id)
                local _, err = sql.builder.insert("kickside_component_declaration_fence"):set_map({
                    component_id = id, automation_id = automation_id, applied_command_generation = 1,
                    command_id = "install:" .. automation_id, declaration_hash = "h",
                    updated_at = time.now():utc():format(time.RFC3339),
                }):run_with(d):exec()
                if err then error(tostring(err)) end
            end

            test.it("refuses a direct SET on an automation-owned component with a typed denial", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, { label = "kept" })
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                fence_for(d, id, id)
                with_actor("owner-1", function()
                    local _, denied = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-direct", 0)
                    test.not_nil(denied)
                    test.eq(errors.is(denied, errors.PERMISSION_DENIED), true)
                    test.contains(tostring(denied), "declaration owner")
                end)
                local stored = context(d, id)
                test.is_nil(stored._execution_identity)
                test.eq(#audit_rows(d, id), 0)
                local gen = generation(d, id)
                test.eq(gen, 0)
                d:release()
            end)

            test.it("sets an automation-owned identity for the pending set_execution_identity command its owner confirms", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                fence_for(d, id, id)
                with_actor("owner-1", function()
                    local result, err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "owned-set_execution_identity-1", 0)
                    test.is_nil(err, tostring(err))
                    test.eq(result.identity_generation, 1)
                end)
                test.eq(context(d, id)._execution_identity.principal.id, "owner-1")
                local receipt, receipt_err = component_client.get_identity_receipt(id)
                test.is_nil(receipt_err, tostring(receipt_err))
                test.eq(receipt.component_id, id)
                test.eq(receipt.identity_generation, 1)
                test.eq(receipt.principal.id, "owner-1")
                test.eq(type(receipt.identity_hash), "string")
                test.eq(receipt.declaration_hash, "h")
                d:release()
            end)

            test.it("fences stale generations and replays request ids idempotently", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                with_actor("owner-1", function()
                    local _, stale_err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-stale", 7)
                    test.not_nil(stale_err)
                    test.eq(errors.is(stale_err, errors.CONFLICT), true)
                    local first, first_err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-once", 0)
                    test.is_nil(first_err)
                    test.eq(first.changes_made, true)
                    local again, again_err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-once", 0)
                    test.is_nil(again_err)
                    test.eq(again.changes_made, false)
                    test.eq(again.identity_generation, 1)
                    local _, conflict_err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-once", 1)
                    test.not_nil(conflict_err)
                    test.eq(errors.is(conflict_err, errors.CONFLICT), true)
                end)
                local gen = generation(d, id)
                test.eq(gen, 1)
                test.eq(#audit_rows(d, id), 1)
                d:release()
            end)

            test.it("pins the canonical identity hash vector", function()
                local d = db()
                ensure_identity_schema(d)
                local id = seed(d, {})
                grant_for(d, id, "owner-1", ops.ACCESS.ADMIN)
                with_actor("owner-1", function()
                    local _, err = set_identity(id,
                        { kind = "user", id = "owner-1" }, "req-hash", 0)
                    test.is_nil(err)
                end)
                local _, hash = generation(d, id)
                test.is_true(type(hash) == "string"
                    and string.find(hash, "\"principal\":{\"id\":\"owner-1\",\"kind\":\"user\"}", 1, true) ~= nil)
                test.is_true(string.find(hash, "\"version\":2}", 1, true) ~= nil)
                d:release()
            end)


            test.it("defines no identity primitive of its own (single core owner)", function()
                test.is_nil((identity_ops :: any).check_grant)
                test.is_nil((identity_ops :: any).DELEGATE_ACTION)
                test.is_nil((identity_ops :: any).check_principal)
                test.is_nil((identity_ops :: any).is_valid_id)
                test.is_nil((identity_ops :: any).same_principal)
                test.is_nil((identity_ops :: any).utc_now)
                test.not_nil(identity_ops.canonical_identity)
                test.not_nil(identity_ops.audit_record)
            end)

        end)
    end)
end)

return { run = function(options) return run_cases(options) end }
