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

local VERIFY = "kickside.automation:declaration_writer_verify"
local THREAD_ID = "11111111-1111-4111-8111-111111111111"

local function identity(user_id: string): any
    return { version = 2, principal = { kind = "user", id = user_id },
        authorized_by = { kind = "user", id = user_id }, captured_at = "2026-09-26T00:00:00Z" }
end

local function reserved(input: any): (any, any)
    local id = uuid.v7()
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
        automation_id = id, request_id = request_id, digest = digest, kind = "install",
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

local function define_tests(): ()
    test.describe("automation declaration writer authority", function()
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
