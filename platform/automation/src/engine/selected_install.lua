local slots = require("engine_slot_repair")
local support = require("engine_support")
local errors = require("errors")

local part = {}
local KIND = "install_selected"
local CREATE = "kickside.automation:declaration_writer_create_selected"
local APPLY = "kickside.automation:declaration_writer_apply"
local IDENTITY = "kickside.automation:identity_writer"
local CONTRACT = "kickside.automation:prepared_installable"

type Map = {[string]: any}

function part.attach(M: any, dependencies: any, P: any): ()
    local function unavailable(message: string): error
        return errors.new({kind = errors.UNAVAILABLE, retryable = true, message = message})
    end

    local function record(pending: Map, name: string, receipt: Map): any
        local _, err = P.in_automation_tx(function(tx: any): (any?, any)
            return true, (dependencies.command :: any).record_receipt_tx(tx, pending.automation_id,
                pending.request_id, pending.generation, pending.digest, name, receipt)
        end)
        return err
    end

    local function step(pending: Map): (any?, any)
        local input: Map = pending.input
        local function defer(err: any): (any?, any)
            return P.defer_command(pending, (dependencies.failure_classification :: any).classify(err))
        end
        local executor, executor_err = (dependencies.funcs :: any).new()
        if executor_err or not executor then return defer(executor_err or unavailable("selected install executor is unavailable")) end
        local _, pins_err = P.lower_pins(pending)
        if pins_err then return defer(pins_err) end
        local op, op_err = (dependencies.automation_db :: any).with_db(function(db: any): (any?, any)
            return (dependencies.command :: any).read_op(db, pending.automation_id, pending.request_id)
        end)
        if op_err or not op then return defer(op_err or unavailable("selected install command receipt is unavailable")) end
        if op.target_receipts.creation == nil then
            local args: Map = support.copy_map(input.writer_args)
            args.component_id = pending.automation_id
            args.automation_id = pending.automation_id
            args.command_id = pending.request_id
            args.generation = pending.generation
            args.declaration_hash = pending.digest
            local created, create_err = executor:call(CREATE, args)
            if create_err or not created then return defer(create_err or unavailable("selected install creation returns no proof")) end
            local receipt_err = record(pending, "creation", {component_id = pending.automation_id,
                command_id = pending.request_id, generation = pending.generation, declaration_hash = pending.digest})
            if receipt_err then return defer(receipt_err) end
        end
        local selected, selection_err = executor:call(IDENTITY, {
            component_id = pending.automation_id, operator_id = input.operator_id, principal = input.principal,
            request_id = pending.request_id, expected_identity_generation = input.expected_identity_generation,
            command_generation = pending.generation,
        })
        if selection_err or not selected then return defer(selection_err or unavailable("selected install identity returns no proof")) end
        local declared, declaration_err = executor:call(APPLY, {
            component_id = pending.automation_id, automation_id = pending.automation_id,
            command_id = pending.request_id, generation = pending.generation, declaration_hash = pending.digest,
        })
        if declaration_err or not declared then return defer(declaration_err or unavailable("selected install declaration returns no proof")) end
        local target, target_err = (dependencies.component :: any).get_identity_receipt(pending.automation_id)
        if target_err or not target then return defer(target_err or unavailable("selected install target receipt is unavailable")) end
        local captured = input.operator_identity
        local stored = target.execution_identity
        if type(stored) ~= "table" or type(stored.authorized_by) ~= "table"
            or stored.authorized_by.kind ~= captured.authorized_by.kind or stored.authorized_by.id ~= captured.authorized_by.id
            or stored.component_id ~= pending.automation_id or type(stored.principal) ~= "table"
            or stored.principal.kind ~= input.principal.kind or stored.principal.id ~= input.principal.id
            or stored.credential_id ~= captured.credential_id or stored.link_id ~= captured.link_id
            or target.component_id ~= pending.automation_id or target.identity_generation ~= selected.identity_generation
            or type(target.identity_hash) ~= "string" or target.identity_hash == ""
            or target.declaration_hash ~= pending.digest or target.declaration_command_id ~= pending.request_id
            or target.declaration_command_generation ~= pending.generation or type(target.principal) ~= "table"
            or target.principal.kind ~= input.principal.kind or target.principal.id ~= input.principal.id then
            return defer(errors.new({kind = errors.CONFLICT, retryable = false,
                message = "selected install target disagrees with its command"}))
        end
        local identity_err = record(pending, "identity", {component_id = pending.automation_id,
            command_id = pending.request_id, generation = pending.generation, request_digest = pending.digest,
            identity_generation = target.identity_generation, identity_hash = target.identity_hash,
            declaration_hash = target.declaration_hash, principal = target.principal})
        if identity_err then return defer(identity_err) end
        local declaration_receipt_err = record(pending, "declaration", {component_id = pending.automation_id,
            command_id = pending.request_id, generation = pending.generation, declaration_hash = target.declaration_hash})
        if declaration_receipt_err then return defer(declaration_receipt_err) end
        local outcome: Map = {id = pending.automation_id, type = input.type_id, metadata = input.public_meta,
            principal = target.principal, identity_generation = target.identity_generation,
            request_fingerprint = input.request_fingerprint}
        local finished, finish_err = P.finish_command(pending, "succeeded", outcome)
        if finish_err or not finished then return nil, finish_err end
        local slot_err = slots.provision_slots(dependencies, pending.automation_id, pending.drive_keys)
        if slot_err then return nil, slot_err end
        return finished, nil
    end
    P.command_steps[KIND] = step

    function M.install_type_selected(type_id: string, input: any, args: any): (any?, any)
        local a: Map = type(args) == "table" and args or {}
        if type(a.component_id) ~= "string" or not a.component_id:match("^%x%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$")
            or type(a.request_id) ~= "string" or a.request_id == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "component UUID and request_id are required"})
        end
        if a.parent_id ~= nil and (type(a.parent_id) ~= "string" or a.parent_id == "") then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "parent_id must be a nonempty string"})
        end
        local entry, entry_err = P.install_binding(type_id, input)
        if entry_err or not entry then return nil, entry_err end
        local identity, capture_err = (dependencies.execution_identity :: any).capture()
        if capture_err or not identity then return nil, capture_err end
        local actor = (dependencies.security :: any).actor()
        local operator_id = actor and actor:id() or nil
        if not operator_id or identity.principal.kind ~= "user" or identity.principal.id ~= operator_id
            or identity.authorized_by.kind ~= "user" or identity.authorized_by.id ~= operator_id then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                message = "selected installation requires its authenticated operator"})
        end
        local principal, principal_err = (dependencies.execution_identity :: any).check_principal(a.principal, "principal")
        if principal_err or not principal then return nil, principal_err end
        if principal.kind ~= "user" then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "selected installation requires a user principal"})
        end
        local subject, subject_err = (dependencies.execution_identity :: any).capture({principal = principal, component_id = a.component_id})
        if subject_err or not subject then return nil, subject_err end
        local fingerprint, fingerprint_err = (dependencies.canonical_json :: any).hash({type = type_id, input = input,
            parent_id = a.parent_id, operator_id = operator_id, principal = principal,
            credential_id = identity.credential_id, link_id = identity.link_id})
        if fingerprint_err or not fingerprint then return nil, fingerprint_err end
        local op, op_err = (dependencies.automation_db :: any).with_db(function(db: any): (any?, any)
            return (dependencies.command :: any).read_op(db, a.component_id, a.request_id)
        end)
        if op_err then return nil, op_err end
        if op then
            local stored: any = op.outcome
            if op.state ~= "succeeded" then
                local pending, pending_err = (dependencies.automation_db :: any).with_db(function(db: any): (any?, any)
                    return (dependencies.command :: any).pending(db, a.component_id)
                end)
                if pending_err then return nil, pending_err end
                stored = pending
            end
            local recorded = stored and (stored.input or stored)
            if not recorded or recorded.request_fingerprint ~= fingerprint then
                return nil, errors.new({kind = errors.CONFLICT, retryable = false, message = "selected install request changes its input"})
            end
            if op.state == "succeeded" then return op.outcome, nil end
            local executed, recovery_err = P.execute_pending(a.component_id, a.request_id)
            if recovery_err or not executed then return nil, recovery_err end
            if executed.state == "succeeded" then return executed.outcome, nil end
            return nil, unavailable("selected installation remains pending")
        end
        local authorized, authorization_err = (dependencies.execution_identity :: any).authorize(subject)
        if authorization_err or not authorized then return nil, authorization_err end
        local prepare: string? = nil
        for _, contract in ipairs(support.entry_contracts(entry)) do
            if contract.contract == CONTRACT and type(contract.methods) == "table"
                and type(contract.methods.prepare_install) == "string" then prepare = contract.methods.prepare_install end
        end
        if not prepare then
            return nil, errors.new({kind = errors.INVALID, retryable = false,
                message = "automation type has no prepared installation capability"})
        end
        local executor, executor_err = (dependencies.funcs :: any).new()
        if executor_err or not executor then return nil, executor_err or unavailable("preparation executor is unavailable") end
        local contextual, context_err = executor:with_context({component_id = a.component_id})
        if context_err or not contextual then return nil, context_err or unavailable("preparation context is unavailable") end
        local result, prepare_err = contextual:call(prepare, type(input) == "table" and input or {})
        if prepare_err then return nil, prepare_err end
        entry.id = type_id
        local spec, spec_err = P.install_spec(entry, result, input, a.parent_id, a.component_id, operator_id, identity)
        if spec_err or not spec then return nil, spec_err end
        spec.kind = KIND
        spec.request_id = a.request_id
        spec.request_fingerprint = fingerprint
        spec.principal = principal
        spec.expected_identity_generation = 0
        spec.subject_id = principal.id
        spec.subject_identity = subject
        spec.writer = CREATE
        spec.request_digest_input = {request_fingerprint = fingerprint, plan = result}
        local _, dispatcher_err = (dependencies.slot :: any).ensure_dispatcher()
        if dispatcher_err then return nil, dispatcher_err end
        return P.run_declaration_command(spec)
    end
end

return part
