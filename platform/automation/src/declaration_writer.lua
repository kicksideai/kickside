-- The automation declaration writer: the framework system actor that writes a
-- validated automation declaration into its component (design v4 §6.3,
-- OWNERSHIP A14). It runs under its own system identity, never a caller's,
-- and each write names a reserved automation command that verify reads back
-- from the automation DB: the component write proceeds only for the pending
-- command with that id, generation and declaration hash.
--   create(input) -> component_command.create_declared (install)
--   apply(input)  -> component_command.apply_declaration (reconfigure)
-- It is also the declaration owner the component consults before a
-- SET_EXECUTION_IDENTITY on an automation-owned component:
--   verify_identity_command(request) confirms the pending set_execution_identity command.

local errors = require("errors")
local sql = require("sql")
local types = require("types")
local command = require("command")
local component_command = require("component_command")
local references = require("declaration_references")
local drive = require("drive")
local core_db = require("core_db")
local authority = require("declaration_authority")
local retention_pin = require("retention_pin")

local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, details = { error_kind = "declaration" } }) :: error)
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false,
        details = { error_kind = "access" } }) :: error)
end

local function same_references(left: any, right: any): boolean
    if type(left) ~= "table" or type(right) ~= "table" or #left ~= #right then return false end
    for i, ref in ipairs(left) do
        local other = right[i]
        if type(other) ~= "table" or ref.path ~= other.path or ref.kind ~= other.kind
            or ref.id ~= other.id or ref.access ~= other.access then return false end
    end
    return true
end

local function pin_unavailable(err: any): error
    return (errors.new({ message = "retention pin lookup failed: " .. tostring(err), kind = errors.UNAVAILABLE,
        retryable = true, details = { error_kind = "infrastructure" } }) :: error)
end

-- check_pins(input, pending, receipts) -> whether every declared thread
-- reference is retained by a pin of this automation (A26 pins_lowered): a pin
-- this command lowered (its "pin:<drive_key>" receipt and the live core pin
-- agree), or, for a declaration keeping its source, the main drive's standing
-- pin on that thread. Pins are planned and lowered only by engine/pins.
local function check_pins(input: any, refs: { any }, pending: any, receipts: any): (boolean, error?)
    local threads: { string } = {}
    for _, ref in ipairs(refs) do
        if ref.kind == "thread" then threads[#threads + 1] = ref.id end
    end
    if #threads == 0 then return true, nil end
    local planned: { [string]: any } = {}
    for _, pin in ipairs(type(input.pins) == "table" and input.pins or {}) do
        if type(pin) ~= "table" or type(pin.thread_id) ~= "string" or type(pin.drive_key) ~= "string" then
            return false, invalid("invalid recorded retention pin")
        end
        planned[pin.thread_id] = pin
    end
    local main: any = nil
    if pending.kind == "reconfigure" then
        local db, db_err = sql.get(types.db_id())
        if db_err or not db then return false, pin_unavailable(db_err) end
        local d, d_err = drive.get(db, pending.automation_id, "main")
        db:release()
        if d_err then return false, d_err end
        main = d
    end
    local core, core_err = sql.get(core_db.id())
    if core_err or not core then return false, pin_unavailable(core_err) end
    for _, thread_id in ipairs(threads) do
        local pin = planned[thread_id]
        local ok = false
        if pin then
            local receipt = type(receipts) == "table" and receipts["pin:" .. pin.drive_key] or nil
            if type(receipt) == "table" and receipt.thread_id == thread_id and receipt.consumer_key == pin.consumer_key
                and receipt.command_id == pending.request_id and receipt.command_generation == pending.generation
                and type(receipt.pin_generation) == "number" then
                local row, row_err = retention_pin.read(core, thread_id, pin.consumer_key)
                if row_err then core:release(); return false, row_err end
                ok = row ~= nil and tonumber(row.generation) == receipt.pin_generation
                    and row.command_id == pending.request_id and tonumber(row.command_generation) == pending.generation
            end
        elseif main and main.source_thread_id == thread_id and main.pin_generation ~= nil then
            local row, row_err = retention_pin.read(core, thread_id, "drive:" .. pending.automation_id .. ":main")
            if row_err then core:release(); return false, row_err end
            ok = row ~= nil and tonumber(row.generation) == main.pin_generation
        else
            core:release()
            return false, invalid("declared thread " .. thread_id .. " is retained by no pin of this automation")
        end
        if not ok then core:release(); return false, nil end
    end
    core:release()
    return true, nil
end

-- verify(request) -> receipt for the pending command the request names.
local function verify(request: any): (any?, error?)
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then
        return nil, (errors.new({ message = "automation database unavailable: " .. tostring(db_err), kind = errors.UNAVAILABLE,
            retryable = true, details = { error_kind = "infrastructure" } }) :: error)
    end
    local pending, pending_err = command.pending(db, request.automation_id)
    local op: any, op_err: any = nil, nil
    if not pending_err and pending then
        op, op_err = command.read_op(db, request.automation_id, request.command_id)
    end
    db:release()
    if pending_err then return nil, pending_err end
    if op_err then return nil, op_err end
    if not pending or pending.request_id ~= request.command_id or pending.generation ~= request.generation
        or pending.digest ~= request.declaration_hash then
        return nil, invalid("declaration command " .. tostring(request.command_id) .. " is not the pending automation command")
    end
    if type(op) ~= "table" then return nil, invalid("pending declaration has no command receipt record") end
    local input = type(pending.input) == "table" and pending.input or {}
    if type(input.type_id) ~= "string" or type(input.declaration) ~= "table" then
        return nil, invalid("pending declaration has no kind or input")
    end
    local current_refs, refs_err = references.collect(input.schema, input.declaration)
    if refs_err or not current_refs then return nil, refs_err end
    if not same_references(current_refs, input.references) then
        return nil, invalid("recorded references do not match the kind input schema")
    end
    local pins_lowered, pins_err = check_pins(input, current_refs, pending, op.target_receipts)
    if pins_err then return nil, pins_err end
    if not pins_lowered then return nil, invalid("recorded retention pin has no live receipt") end
    local staging = pending.kind == "install_selected" and request.staged_creation == true
    local owner = staging and "kickside.automation:declaration_writer_create_selected"
        or (pending.kind == "install" and "kickside.automation:declaration_writer_create"
            or "kickside.automation:declaration_writer_apply")
    local operator_refs: { any } = {}
    for _, ref in ipairs(current_refs) do operator_refs[#operator_refs + 1] = ref end
    if pending.kind == "reconfigure" then
        operator_refs[#operator_refs + 1] = { kind = "component", id = pending.automation_id, access = "WRITE" }
    end
    local operator_valid, operator_err = authority.check(input.operator_identity,
        input.operator_id, operator_refs, owner)
    if operator_err then return nil, operator_err end
    if not operator_valid then return nil, denied("operator lacks a declared resource grant") end
    local subject_identity = staging and input.operator_identity or input.subject_identity
    local subject_id = staging and input.operator_id or input.subject_id
    local subject_valid, subject_err = authority.check(subject_identity,
        subject_id, current_refs, owner)
    if subject_err then return nil, subject_err end
    if not subject_valid then return nil, denied("execution subject lacks a declared resource grant") end
    return {
        valid = true,
        operator_valid = operator_valid,
        subject_valid = subject_valid,
        pins_lowered = pins_lowered,
        component_id = request.component_id,
        automation_id = request.automation_id,
        command_id = pending.request_id,
        generation = pending.generation,
        declaration_hash = pending.digest,
        declaration = input.declaration,
        state = input.state,
        public_meta = input.public_meta,
        operator_id = input.operator_id,
        execution_subject_id = subject_id,
        affected_drive_keys = pending.drive_keys,
    }, nil
end

M.verify = verify

-- verify_identity_command({ automation_id, component_id, command_id, operator_id,
-- principal, expected_identity_generation }) -> { valid, automation_id?, reason? }:
-- valid only for the automation's pending set_execution_identity command with that id,
-- reserved by that operator for that principal and generation.
function M.verify_identity_command(request: any): (any?, error?)
    local r = type(request) == "table" and request or {}
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then
        return nil, (errors.new({ message = "automation database unavailable: " .. tostring(db_err), kind = errors.UNAVAILABLE,
            retryable = true, details = { error_kind = "infrastructure" } }) :: error)
    end
    local pending, pending_err, reason = command.identity_pending(db, r)
    db:release()
    if pending_err then return nil, pending_err end
    if not pending then return {valid = false, reason = reason}, nil end
    local input = pending.input
    return { valid = true, automation_id = r.automation_id, command_id = pending.request_id,
        command_generation = pending.generation, declaration_hash = input.declaration_hash }, nil
end

function M.create(input: any): (any?, error?)
    return component_command.create_declared(input, verify)
end

function M.create_selected(input: any): (any?, error?)
    return component_command.create_declared(input, function(request: any): (any?, error?)
        request.staged_creation = true
        return verify(request)
    end)
end

function M.apply(input: any): (any?, error?)
    return component_command.apply_declaration(input, verify)
end

return M
