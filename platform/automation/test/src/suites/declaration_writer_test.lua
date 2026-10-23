-- The real trusted writer reads a reserved command and refuses forged
-- references, inaccessible resources, invalid subjects and missing pin receipts.
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local command = require("command")
local drive = require("drive")
local types = require("types")
local component = require("component")
local json = require("json")

local VERIFY = "kickside.automation:declaration_writer_verify"
local THREAD_ID = "11111111-1111-4111-8111-111111111111"

local function identity(user_id: string): any
    return { version = 2, principal = { kind = "user", id = user_id },
        authorized_by = { kind = "user", id = user_id }, captured_at = "2026-09-26T00:00:00Z" }
end

local function reserved(input: any, kind: string?, component_id: string?): (any, any)
    local id = component_id or uuid.v7()
    for _, pin in ipairs(input.pins or {}) do
        if pin.consumer_key == "" then pin.consumer_key = "drive:" .. id .. ":main" end
    end
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then error("automation DB unavailable: " .. tostring(db_err)) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then error("automation transaction unavailable: " .. tostring(begin_err)) end
    local _, drive_err = drive.insert_tx(tx, { automation_id = id, drive_key = "main",
        source_kind = "none", applied = {}, applied_hash = "test" })
    if drive_err then error("drive fixture failed: " .. tostring(drive_err)) end
    local request_id = "install:" .. id
    local digest = "writer-test:" .. id
    local op, reserve_err = command.reserve_tx(tx, {
        automation_id = id, request_id = request_id, digest = digest, kind = kind or "install",
        drive_keys = { "main" }, input = input,
    })
    if reserve_err or not op then error("command fixture failed: " .. tostring(reserve_err)) end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then error("command fixture commit failed: " .. tostring(commit_err)) end
    return { automation_id = id, component_id = id, command_id = request_id,
        generation = op.generation, declaration_hash = digest }, input
end

local function input(schema: any, declaration: any, refs: any, pins: any?): any
    return { operator_id = "writer_operator", subject_id = "writer_subject",
        operator_identity = identity("writer_operator"), subject_identity = identity("writer_subject"),
        type_id = "test:kind", schema = schema, declaration = declaration,
        references = refs, pins = pins or {} }
end

local function verify(request: any): (any?, any)
    local executor, exec_err = funcs.new()
    if exec_err or not executor then return nil, exec_err end
    return executor:call(VERIFY, request)
end

local function reconfigured(schema: any, before: any, after: any, same_subject: boolean?): (any?, any)
    local service = assert(component.get_service())
    local id = tostring(uuid.v7())
    local created, create_err = service:register({ component_id = id,
        impl_id = "kickside.automation.agent.fixture:automation_type" })
    test.is_nil(create_err, tostring(create_err))
    test.is_true(created.success)
    local db = assert(sql.get(types.db_id()))
    local _, context_err = db:execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2", {
        json.encode({ _portable_input = before }), id,
    })
    db:release()
    test.is_nil(context_err, tostring(context_err))
    local command_input = input(schema, after, {})
    if same_subject then
        command_input.subject_id = command_input.operator_id
        command_input.subject_identity = command_input.operator_identity
    end
    local request = reserved(command_input, "reconfigure", id)
    local receipt, err = verify(request)
    local context, read_err = component.get_private_context(id)
    local _, delete_err = service:delete({ component_id = id })
    test.is_nil(read_err, tostring(read_err))
    local actual_json, actual_err = json.encode(context._portable_input)
    local expected_json, expected_err = json.encode(before)
    test.is_nil(actual_err, tostring(actual_err))
    test.is_nil(expected_err, tostring(expected_err))
    test.eq(actual_json, expected_json)
    test.is_nil(delete_err, tostring(delete_err))
    return receipt, err
end

local function define_tests(): ()
    test.describe("automation declaration writer authority", function()
        local opaque_schema = { type = "object", properties = {
            title = { type = "string" },
            behavior = { type = "object", properties = {
                target = { type = "string", ["x-authority"] = "subject" },
                config = { type = "object", ["x-authority"] = "subject" },
                enabled = { type = "boolean", ["x-authority"] = "subject" },
                expression = { type = "string" },
            } },
            steps = { type = "array", items = { type = "object", properties = {
                code = { type = "string", ["x-authority"] = "subject" },
                note = { type = "string" },
            } } },
        } }
        local changes = {
            { name = "nested opaque config", before = { behavior = { config = { nested = { resource = "first" } } } },
                after = { behavior = { config = { nested = { resource = "second" } } } } },
            { name = "function target", before = { behavior = { target = "example:first" } },
                after = { behavior = { target = "example:second" } } },
            { name = "added authority", before = {}, after = { behavior = { target = "example:first" } } },
            { name = "removed authority", before = { behavior = { target = "example:first" } }, after = {} },
            { name = "false authority value", before = { behavior = { enabled = true } }, after = { behavior = { enabled = false } } },
            { name = "removed false authority value", before = { behavior = { enabled = false } }, after = {} },
            { name = "array item code", before = { steps = { { code = "return 1" } } },
                after = { steps = { { code = "return 2" } } } },
            { name = "removed array item", before = { steps = { { code = "return 1" } } }, after = { steps = {} } },
        }
        for _, change in ipairs(changes) do
            test.it("rejects non-subject edits to " .. change.name, function()
                local receipt, err = reconfigured(opaque_schema, change.before, change.after)
                test.is_nil(receipt)
                test.not_nil(err)
                test.contains(tostring(err), "execution subject")
                test.eq(err:kind(), errors.PERMISSION_DENIED)
                test.eq(err:details().error_kind, "access")
            end)
            test.it("accepts subject edits to " .. change.name, function()
                local receipt, err = reconfigured(opaque_schema, change.before, change.after, true)
                test.is_nil(err, tostring(err))
                test.is_true(receipt.valid)
            end)
        end
        test.it("accepts pure edits with unchanged opaque fields", function()
            local receipt, err = reconfigured(opaque_schema,
                { title = "Before", behavior = { config = { a = 1, b = false }, expression = "1" } },
                { title = "After", behavior = { config = { b = false, a = 1 }, expression = "2" } })
            test.is_nil(err, tostring(err))
            test.is_true(receipt.valid)
        end)
        test.it("preserves edits for schemas without authority annotations", function()
            local receipt, err = reconfigured({ type = "object", properties = { config = { type = "object" } } },
                { config = { resource = "first" } }, { config = { resource = "second" } })
            test.is_nil(err, tostring(err))
            test.is_true(receipt.valid)
        end)
        test.it("rejects non-subject installation of marked fields", function()
            local request = reserved(input(opaque_schema, { behavior = { target = "example:first" } }, {}))
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
            test.contains(tostring(err), "execution subject")
        end)
        for _, allowed in ipairs({ false, true }) do
            test.it(allowed and "accepts retained references with live grants on both principals"
                or "rejects a pure edit when only the subject can access a retained reference", function()
                local service = assert(component.get_service())
                local id = tostring(uuid.v7())
                local target = tostring(uuid.v7())
                for _, component_id in ipairs({ id, target }) do
                    local created, create_err = service:register({ component_id = component_id,
                        impl_id = "kickside.automation.agent.fixture:automation_type" })
                    test.is_nil(create_err, tostring(create_err))
                    test.is_true(created.success)
                end
                local db = assert(sql.get(types.db_id()))
                local _, context_err = db:execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2", {
                    json.encode({ _portable_input = { target = target, title = "Before" } }), id,
                })
                test.is_nil(context_err, tostring(context_err))
                local _, subject_err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(), subject_type = "user", subject_id = "writer_subject",
                    component_id = target, source_component_id = target, access_mask = 1, inherited = 0,
                }):run_with(db):exec()
                test.is_nil(subject_err, tostring(subject_err))
                if not allowed then
                    local _, revoke_err = db:execute("DELETE FROM kickside_component_access WHERE component_id=$1 AND subject_id=$2", {
                        target, "writer_operator",
                    })
                    test.is_nil(revoke_err, tostring(revoke_err))
                end
                db:release()
                local schema = { type = "object", properties = {
                    target = { type = "string", ["x-reference"] = { kind = "component", access = "READ" } },
                    title = { type = "string" },
                } }
                local request = reserved(input(schema, { target = target, title = "After" }, {
                    { path = "target", kind = "component", id = target, access = "READ" },
                }), "reconfigure", id)
                local receipt, err = verify(request)
                if allowed then
                    test.is_nil(err, tostring(err))
                    test.is_true(receipt.valid)
                else
                    test.is_nil(receipt)
                    test.not_nil(err)
                    test.contains(tostring(err), "operator lacks")
                end
                for _, component_id in ipairs({ id, target }) do
                    local _, delete_err = service:delete({ component_id = component_id })
                    test.is_nil(delete_err, tostring(delete_err))
                end
            end)
        end

        test.it("rejects omitted references that the kind schema declares", function()
            local schema = { type = "object", properties = {
                target = { type = "string", ["x-reference"] = { kind = "component", access = "READ" } },
            } }
            local request = reserved(input(schema, { target = "unowned-component" }, {}))
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
            test.contains(tostring(err), "recorded references")
        end)

        test.it("rejects a declared resource absent from the operator's live grants", function()
            local target = tostring(uuid.v7())
            local schema = { type = "object", properties = {
                target = { type = "string", ["x-reference"] = { kind = "component", access = "READ" } },
            } }
            local request = reserved(input(schema, { target = target }, {
                { path = "target", kind = "component", id = target, access = "READ" },
            }))
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
            test.is_true(tostring(err):find("operator lacks", 1, true) ~= nil, tostring(err))
        end)

        test.it("rejects an invalid recorded execution subject", function()
            local command_input = input(nil, {}, {})
            command_input.subject_identity.captured_at = nil
            local request = reserved(command_input)
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
        end)

        test.it("rejects a subject without the operator's declared resource grant", function()
            local target = tostring(uuid.v7())
            local service, service_err = component.get_service()
            test.is_nil(service_err, tostring(service_err))
            if not service then error("component service unavailable") end
            local created, create_err = service:register({ component_id = target,
                impl_id = "kickside.automation.agent.fixture:automation_type",
                meta = { title = "Authority fixture" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success)
            local schema = { type = "object", properties = {
                target = { type = "string", ["x-reference"] = { kind = "component", access = "READ" } },
            } }
            local request = reserved(input(schema, { target = target }, {
                { path = "target", kind = "component", id = target, access = "READ" },
            }))
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
            test.contains(tostring(err), "execution subject lacks")
            local _, delete_err = service:delete({ component_id = target })
            test.is_nil(delete_err, tostring(delete_err))
        end)

        test.it("rejects a pin target without a durable receipt", function()
            local schema = { type = "object", properties = {
                thread_id = { type = "string", ["x-reference"] = { kind = "thread", access = "READ" } },
            } }
            local request = reserved(input(schema, { thread_id = THREAD_ID }, {
                { path = "thread_id", kind = "thread", id = THREAD_ID, access = "READ" },
            }, { {
                drive_key = "main", thread_id = THREAD_ID, consumer_key = "", target = 0,
            } }))
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
            test.contains(tostring(err), "retention pin")
        end)

        test.it("rejects a recorded receipt when the core pin is absent", function()
            local schema = { type = "object", properties = {
                thread_id = { type = "string", ["x-reference"] = { kind = "thread", access = "READ" } },
            } }
            local request, recorded = reserved(input(schema, { thread_id = THREAD_ID }, {
                { path = "thread_id", kind = "thread", id = THREAD_ID, access = "READ" },
            }, { { drive_key = "main", thread_id = THREAD_ID, consumer_key = "", target = 0 } }))
            local db, db_err = sql.get(types.db_id())
            test.is_nil(db_err, tostring(db_err))
            if not db then error("database unavailable: " .. tostring(db_err)) end
            local tx, begin_err = db:begin()
            test.is_nil(begin_err, tostring(begin_err))
            local receipt_err = command.record_receipt_tx(tx, request.automation_id, request.command_id,
                request.generation, request.declaration_hash, "pin:main", {
                    thread_id = THREAD_ID, consumer_key = recorded.pins[1].consumer_key,
                    command_id = request.command_id, command_generation = request.generation,
                    target_cursor = 0, pin_generation = 1,
                })
            test.is_nil(receipt_err, tostring(receipt_err))
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(commit_err, tostring(commit_err))
            local result, err = verify(request)
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "retention pin")
        end)

        test.it("rejects a declared thread no pin of the automation retains", function()
            local schema = { type = "object", properties = {
                thread_id = { type = "string", ["x-reference"] = { kind = "thread", access = "READ" } },
            } }
            local request = reserved(input(schema, { thread_id = THREAD_ID }, {
                { path = "thread_id", kind = "thread", id = THREAD_ID, access = "READ" },
            }, {}))
            local receipt, err = verify(request)
            test.is_nil(receipt)
            test.not_nil(err)
            test.contains(tostring(err), "retained by no pin")
        end)

        test.it("returns the recorded subject identity in the verified creation receipt", function()
            local command_input = input(nil, {}, {})
            local request = reserved(command_input)
            local receipt, err = verify(request)
            test.is_nil(err, tostring(err))
            test.not_nil(receipt.captured_identity)
            test.eq(receipt.captured_identity.version, command_input.subject_identity.version)
            test.eq(receipt.captured_identity.principal.kind, command_input.subject_identity.principal.kind)
            test.eq(receipt.captured_identity.principal.id, command_input.subject_identity.principal.id)
            test.eq(receipt.captured_identity.authorized_by.kind, command_input.subject_identity.authorized_by.kind)
            test.eq(receipt.captured_identity.authorized_by.id, command_input.subject_identity.authorized_by.id)
            test.eq(receipt.captured_identity.captured_at, command_input.subject_identity.captured_at)
        end)

        test.it("records computed validity for a pure declaration", function()
            local request = reserved(input(nil, { title = "Pure" }, {}))
            local receipt, err = verify(request)
            test.is_nil(err, tostring(err))
            test.is_true(receipt.valid)
            test.is_true(receipt.operator_valid)
            test.is_true(receipt.subject_valid)
            test.is_true(receipt.pins_lowered)
        end)
    end)
end

return test.run_cases(define_tests)
