-- Automation execution-identity change (design v4 §4.7, §6.2; IDENTITY-1 §2, §5):
-- set_execution_identity selects the principal an installed automation runs as. It
-- enters the automation's command stream over every drive; its one
-- recoverable executor (the set_execution_identity command step, run by the caller,
-- the drive's own round or the dispatcher) writes the identity through the
-- identity writer, which applies the component's SET_EXECUTION_IDENTITY under
-- the operator's live frame (ADMIN, may_act_as, the identity generation fence
-- and the audit row). The command finalizes with the resulting identity
-- generation.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

local KIND = "set_execution_identity"
local IDENTITY_WRITER = "kickside.automation:identity_writer"

-- attach(M, dependencies, P) defines M.set_execution_identity.
function part.attach(M: any, dependencies: any, P: any): ()
    local automation_error = support.automation_error

    local function invalid(message: string): error
        return automation_error(message, errors.INVALID)
    end

    -- The request digest covers the selected principal, the expected identity
    -- generation and the declaration the identity is selected for, named by the
    -- hash its drives applied (a stable value, unlike a re-encoding of the
    -- stored declaration table).
    local function request_digest(component_id: string, principal: Map, expected: integer, supersede_request_id: string?, captured: any): (string?, any, string?)
        local applied, applied_err = P.in_automation_tx(function(tx: any): (any?, any)
            return (dependencies.drive :: any).get(tx, component_id, "main")
        end)
        if applied_err then return nil, applied_err end
        if not applied then
            return nil, automation_error("automation " .. component_id .. " holds no main drive", errors.INVALID)
        end
        local declaration_hash = tostring((applied :: Map).applied_hash)
        local digest, digest_err = (dependencies.canonical_json :: any).hash({ kind = KIND,
            principal = { kind = principal.kind, id = principal.id },
            expected_identity_generation = expected, declaration_hash = declaration_hash,
            supersede_request_id = supersede_request_id, credential_id = captured.credential_id, link_id = captured.link_id })
        return digest, digest_err, declaration_hash
    end

    -- The durable outcome of a finished op, as the caller's result or error.
    local function recorded(op: Map): (Map?, any)
        local outcome = type(op.outcome) == "table" and op.outcome or {}
        if op.state == "failed" then
            return nil, errors.new({
                message = tostring(outcome.message or "execution-identity change failed"),
                kind = tostring(outcome.kind or errors.INTERNAL),
                retryable = false,
            })
        end
        if op.state ~= "succeeded" then
            return nil, errors.new({
                message = "execution-identity change " .. tostring(op.request_id) .. " was superseded",
                kind = errors.CONFLICT,
                retryable = false,
            })
        end
        return {
            request_id = op.request_id,
            generation = op.generation,
            state = op.state,
            outcome = outcome,
            identity_generation = outcome.identity_generation,
        }, nil
    end

    -- finalize(pending, state, outcome, receipt?) finalizes the command; a
    -- successful identity change first records its durable identity receipt.
    local function finalize(pending: Map, state: string, outcome: Map, receipt: Map?, core_fences: Map?): (Map?, any)
        local command = dependencies.command :: any
        local finalized, final_err = P.in_automation_tx(function(tx: any): (any?, any)
            if receipt then
                local receipt_err = command.record_receipt_tx(tx, pending.automation_id, pending.request_id,
                    pending.generation, pending.digest, "identity", receipt)
                if receipt_err then return nil, receipt_err end
            end
            if core_fences then
                local fence_err = command.record_receipt_tx(tx, pending.automation_id, pending.request_id,
                    pending.generation, pending.digest, "core_fences", core_fences)
                if fence_err then return nil, fence_err end
            end
            local result, err = command.finalize_tx(tx, {
                automation_id = pending.automation_id, request_id = pending.request_id, generation = pending.generation,
                digest = pending.digest, state = state, outcome = outcome,
                required_receipts = receipt and (core_fences and { "identity", "core_fences" } or { "identity" }) or nil,
            })
            if err then return nil, err end
            -- The selected identity runs the drives an unproven or refused
            -- identity blocked.
            if state == "succeeded" then
                local unblock_err = (dependencies.drive :: any).unblock_identity_tx(tx, pending.automation_id)
                if unblock_err then return nil, unblock_err end
            end
            return result, nil
        end)
        if final_err then
            local details = type(final_err) == "userdata" and (final_err :: any):details() or nil
            if type(details) == "table" and details.reason == command.REASON.STALE then
                return P.read_recorded(pending.automation_id, pending.request_id)
            end
            return nil, final_err
        end
        -- The release the finalize committed raised every affected drive's
        -- control demand (design v5 §4.7; A52): wake the dispatcher.
        local wake_err = P.wake_dispatcher(pending.automation_id, pending.request_id)
        if wake_err then return nil, wake_err end
        local f = finalized :: Map
        return { state = f.state, request_id = f.request_id, generation = f.generation, outcome = f.outcome }, nil
    end

    -- set_execution_identity_step(pending) is the identity command's executor: the identity
    -- writer applies the selection under the operator's frame; a retriable
    -- failure keeps the command pending for recovery, a terminal one finalizes
    -- it failed.
    local function set_execution_identity_step(pending: Map): (Map?, any)
        local input = type(pending.input) == "table" and pending.input or {}
        local core_fences: Map? = nil
        if input.supersede_request_id ~= nil then
            local fenced, fence_err = P.fence_pins(pending)
            if fence_err then return P.defer_command(pending, (dependencies.failure_classification :: any).classify(fence_err)) end
            core_fences = fenced
        end
        local executor, executor_err = (dependencies.funcs :: any).new()
        if executor_err or not executor then
            return P.defer_command(pending, { kind = errors.UNAVAILABLE, message = "identity writer executor unavailable: " .. tostring(executor_err) })
        end
        local written, write_err = (executor :: any):call(IDENTITY_WRITER, {
            component_id = pending.automation_id, operator_id = input.operator_id, principal = input.principal,
            request_id = pending.request_id, expected_identity_generation = input.expected_identity_generation,
            command_generation = pending.generation,
        })
        if write_err ~= nil or type(written) ~= "table" then
            local classified = (dependencies.failure_classification :: any).classify(write_err or "identity write returned no result")
            local _, parks = (dependencies.round_outcome :: any).failure_phase(classified)
            if not parks or input.supersede_request_id ~= nil then
                return P.defer_command(pending, classified)
            end
            return finalize(pending, "failed", { kind = classified.kind, message = classified.message })
        end
        -- The component's durable identity fence must agree with the command
        -- before the identity command acknowledges any drive.
        local component = dependencies.component :: any
        local target, target_err = component.get_identity_receipt(pending.automation_id)
        if target_err or not target then
            return P.defer_command(pending, { kind = errors.UNAVAILABLE,
                message = "identity target receipt unavailable: " .. tostring(target_err) })
        end
        local principal = input.principal :: Map
        local t = target :: Map
        if t.component_id ~= pending.automation_id or t.identity_generation ~= (written :: Map).identity_generation
            or type(t.identity_hash) ~= "string" or t.identity_hash == "" or t.declaration_hash ~= input.declaration_hash
            or (input.supersede_request_id ~= nil and t.declaration_command_generation == nil)
            or (t.declaration_command_generation ~= nil and (t.declaration_command_generation ~= pending.generation
                or t.declaration_command_id ~= pending.request_id))
            or type(t.principal) ~= "table" or t.principal.kind ~= principal.kind or t.principal.id ~= principal.id then
            return P.defer_command(pending, { kind = errors.CONFLICT,
                message = "durable identity target disagrees with the identity command" })
        end
        return finalize(pending, "succeeded", {
            identity_generation = (written :: Map).identity_generation, principal = input.principal,
        }, { component_id = pending.automation_id, command_id = pending.request_id, generation = pending.generation,
            request_digest = pending.digest, declaration_hash = input.declaration_hash,
            identity_generation = t.identity_generation, identity_hash = t.identity_hash, principal = principal }, core_fences)
    end
    P.command_steps[KIND] = set_execution_identity_step

    -- set_execution_identity(component_id, { principal, request_id,
    -- expected_identity_generation }) -> { request_id, generation, state,
    -- outcome, identity_generation }. ADMIN only. A repeated request with the
    -- same input reads back its outcome, or completes it when it is still
    -- pending; a changed input conflicts.
    function M.set_execution_identity(component_id: string, args: any): (Map?, any)
        if type(component_id) ~= "string" or component_id == "" then return nil, invalid("automation id is required") end
        local a: Map = type(args) == "table" and args or {}
        local actor = (dependencies.security :: any).actor()
        local operator_id = actor and actor:id() or nil
        if type(operator_id) ~= "string" or operator_id == "" then
            return nil, automation_error("an authenticated actor is required to select an execution identity", errors.PERMISSION_DENIED)
        end
        local execution_identity = dependencies.execution_identity :: any
        local principal, principal_err = execution_identity.check_principal(a.principal, "principal")
        if principal_err or not principal then return nil, principal_err end
        if type(a.request_id) ~= "string" or a.request_id == "" then return nil, invalid("request_id is required") end
        if a.supersede_request_id ~= nil and (type(a.supersede_request_id) ~= "string" or a.supersede_request_id == "") then
            return nil, invalid("supersede_request_id must name the authority-blocked command")
        end
        if a.supersede_request_id == a.request_id then return nil, invalid("replacement request_id must be new") end
        local expected = a.expected_identity_generation
        if type(expected) ~= "number" or expected < 0 or expected ~= math.floor(expected) then
            return nil, invalid("expected_identity_generation must be a non-negative integer")
        end
        local request_id = a.request_id :: string

        local component = dependencies.component :: automation_types.ComponentModule
        local _, access_err = component.validate_access(component_id, component.ACCESS.ADMIN)
        if access_err then return nil, access_err end

        local captured, capture_err = execution_identity.capture({component_id = component_id})
        if capture_err or not captured then return nil, capture_err end
        local operator, operator_err = execution_identity.principal_of_key(operator_id)
        if operator_err or not operator then return nil, operator_err end
        if not execution_identity.same_principal(captured.principal, operator)
            or not execution_identity.same_principal(captured.authorized_by, operator) then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                message = "execution selection requires its authenticated authorizer"})
        end
        local digest, digest_err, declaration_hash = request_digest(component_id, principal :: Map, expected :: integer,
            a.supersede_request_id, captured)
        if digest_err or not digest then return nil, digest_err end

        local drive = dependencies.drive :: any
        local command = dependencies.command :: any
        local reserved, reserve_err = P.in_automation_tx(function(tx: any): (any?, any)
            local keys, keys_err = drive.keys(tx, component_id)
            if keys_err then return nil, keys_err end
            if not keys or #(keys :: { string }) == 0 then
                return nil, invalid("automation " .. component_id .. " holds no drives")
            end
            local request: Map = {
                automation_id = component_id, request_id = request_id, digest = digest, kind = KIND,
                input = { operator_id = operator_id, operator_identity = captured, principal = principal, expected_identity_generation = expected,
                    declaration_hash = declaration_hash, supersede_request_id = a.supersede_request_id },
                drive_keys = keys,
            }
            local reservation, err
            if a.supersede_request_id ~= nil then
                local pending, pending_err = command.pending(tx, component_id)
                if pending_err then return nil, pending_err end
                local pins, pins_err = P.recovery_pins_tx(tx, component_id, keys, pending or {})
                if pins_err then return nil, pins_err end
                request.input.recovery_pins = pins
                request.require_authority_failure = true
                reservation, err = command.supersede_tx(tx, request, a.supersede_request_id)
            else
                reservation, err = command.reserve_tx(tx, request)
            end
            if err or not reservation or not (reservation :: Map).existing or (reservation :: Map).state ~= "pending" then
                return reservation, err
            end
            return command.read_op(tx, component_id, request_id)
        end)
        if reserve_err or not reserved then return nil, reserve_err end
        local reservation = reserved :: Map
        if reservation.existing and reservation.state ~= "pending" then
            local prior, prior_err = recorded(reservation)
            if prior_err or not prior or prior.state ~= "succeeded" then return prior, prior_err end
            return prior, nil
        end

        local ran, run_err = P.execute_pending(component_id, request_id)
        if run_err or not ran then return nil, run_err end
        local r = ran :: Map
        if r.state == "pending" then
            if type(r.error) ~= "table" then
                return nil, automation_error("execution-identity change " .. request_id .. " is pending without a recorded failure", errors.INTERNAL)
            end
            return nil, (dependencies.failure_classification :: any).native(r.error)
        end
        local result, result_err = recorded(r)
        if result_err or not result or result.state ~= "succeeded" then return result, result_err end
        return result, nil
    end
end

return part
