-- Automation declaration commands (design v5 §4.7, §6.3): install and
-- reconfigure each reserve one command over the automation's drives in the
-- automation DB; the command's step then has the declaration writer (the
-- framework system actor) apply the declaration to the component, and the
-- command finalizes with the outcome.
--
-- The step is recoverable from its immutable pending input. The caller's
-- attempt and every recovery attempt (the command dispatcher, a drive's slot
-- before stamping) run the same execute_pending; the component's declaration
-- fence makes the writer idempotent per command id, generation and hash, and a
-- finalization that finds the command already finished reads its durable
-- outcome. An install's drives get their slots once its command succeeds; a
-- failed install removes its drives and replays its rollback chain.

local automation_types = require("types")
local support = require("engine_support")
local drive_plan = require("engine_drive_plan")
local slot_repair = require("engine_slot_repair")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

-- The command kinds whose step is a declaration writer call.
local CREATES_DRIVES: { [string]: boolean } = { install = true, install_selected = true }

local WRITER_STEPS: { [string]: boolean } = { install = true, reconfigure = true }

-- attach(M, dependencies, P) publishes P.in_automation_tx, P.run_declaration_command,
-- P.execute_pending, P.defer_command and P.command_steps.
function part.attach(M: any, dependencies: any, P: any): ()
    local uuid = dependencies.uuid
    local automation_error = support.automation_error

    local in_automation_tx = (dependencies.automation_db :: any).in_tx

    local with_automation_db = (dependencies.automation_db :: any).with_db

    local function wake_dispatcher(automation_id: string, request_id: string?): any
        return slot_repair.wake_dispatcher(dependencies, automation_id, request_id) end
    local function provision_slots(automation_id: string, drive_keys: { string }): any
        return slot_repair.provision_slots(dependencies, automation_id, drive_keys) end

    -- The result a finished op records: its outcome, or the failure it recorded.
    local function recorded(op: Map): (Map?, any)
        local outcome = type(op.outcome) == "table" and op.outcome or {}
        if op.state == "succeeded" then
            return { state = "succeeded", request_id = op.request_id, generation = op.generation, outcome = outcome }, nil
        end
        if op.state == "pending" then
            return { state = "pending", request_id = op.request_id, generation = op.generation }, nil
        end
        if op.state == "superseded" then
            return nil, errors.new({ message = "command " .. tostring(op.request_id) .. " was superseded",
                kind = errors.CONFLICT, retryable = false })
        end
        return nil, errors.new({ message = tostring(outcome.message or ("command " .. tostring(op.request_id) .. " failed")),
            kind = tostring(outcome.kind or errors.INTERNAL), retryable = false })
    end

    -- The command's op, read back as its recorded result.
    local function read_recorded(automation_id: string, request_id: string): (Map?, any)
        local op, op_err = with_automation_db(function(db: any): (any?, any)
            return (dependencies.command :: any).read_op(db, automation_id, request_id)
        end)
        if op_err then return nil, op_err end
        if not op then
            return nil, automation_error("command " .. request_id .. " of automation " .. automation_id .. " not found", errors.NOT_FOUND)
        end
        return recorded(op :: Map)
    end

    -- The writer arguments of a pending command's step.
    local function step_args(pending: Map): Map
        local input = type(pending.input) == "table" and pending.input or {}
        local args: Map = {}
        for k, v in pairs(type(input.writer_args) == "table" and input.writer_args or {}) do args[k] = v end
        args.component_id = pending.automation_id
        args.automation_id = pending.automation_id
        args.command_id = pending.request_id
        args.generation = pending.generation
        args.declaration_hash = pending.digest
        return args
    end

    -- finish(pending, state, outcome) finalizes the pending command; a
    -- succeeded one records its declaration, resolved drive policy and hash as
    -- every affected drive's applied state. A failed install also removes the drives it reserved, or,
    -- when it had lowered retention pins, reserves their release in the same
    -- transaction (the release removes the drives). Returns (result?, err?,
    -- elsewhere): elsewhere when another executor already finalized the command,
    -- whose recorded outcome is then the answer. A finalization that finds the
    -- command no longer pending reads the outcome another attempt recorded.
    local function finish(pending: Map, state: string, outcome: Map): (Map?, any)
        local command = dependencies.command :: any
        local drive = dependencies.drive :: any
        local input = type(pending.input) == "table" and pending.input or {}
        local finalized, final_err = in_automation_tx(function(tx: any): (any?, any)
            local result, err = command.finalize_tx(tx, {
                automation_id = pending.automation_id, request_id = pending.request_id,
                generation = pending.generation, digest = pending.digest, state = state, outcome = outcome,
                applied = { declaration = input.declaration, policy = input.drive_policy, hash = pending.digest },
                required_receipts = pending.kind == "install_selected" and {"declaration", "identity"} or nil,
            })
            if err then return nil, err end
            if state == "succeeded" and type(input.source_update) == "table" then
                local update_err = P.apply_source_update_tx(tx, pending, input.source_update :: Map)
                if update_err then return nil, update_err end
            end
            -- A succeeded reconfigure follows the declared enabled state, and
            -- its declaration is the correction a drive blocked on its
            -- declaration waits for (design v5 §4.4): that drive runs again
            -- under the new declaration, its old failure cleared.
            if state == "succeeded" and pending.kind == "reconfigure" then
                local keys, keys_err = drive.keys(tx, pending.automation_id)
                if keys_err then return nil, keys_err end
                for _, key in ipairs(keys :: { string }) do
                    local row, row_err = drive.get(tx, pending.automation_id, key)
                    if row_err then return nil, row_err end
                    if row then
                        local fields: Map = {}
                        local enabled = row.enabled
                        if input.enabled ~= nil then
                            enabled = input.enabled
                            fields.enabled = enabled
                        end
                        if row.phase == drive.PHASE.BLOCKED_SOURCE_DELETED then
                            fields.phase = drive.PHASE.BLOCKED_SOURCE_DELETED
                        elseif input.enabled == false then
                            fields.phase = drive.PHASE.PAUSED
                        elseif row.phase == drive.PHASE.BLOCKED_DECLARATION then
                            fields.phase = enabled and drive.PHASE.ACTIVE or drive.PHASE.PAUSED
                            fields.last_error_json = (dependencies.sql :: any).NULL
                        elseif row.phase == drive.PHASE.PAUSED and input.enabled == true then
                            fields.phase = drive.PHASE.ACTIVE
                        end
                        if next(fields) ~= nil then
                            local changed, update_err = drive.update_cas_tx(tx, pending.automation_id, key,
                                { command_generation = pending.generation }, fields)
                            if update_err then return nil, update_err end
                            if not changed then return nil, automation_error("drive " .. key .. " lost its declaration fence", errors.CONFLICT) end
                        end
                    end
                end
            end
            if state == "succeeded" and pending.kind == "install_selected" then
                for _, key in ipairs(pending.drive_keys or {}) do
                    local enabled = input.enabled ~= false
                    local changed, change_err = drive.update_cas_tx(tx, pending.automation_id, key,
                        {command_generation = pending.generation}, {enabled = enabled,
                            phase = enabled and drive.PHASE.ACTIVE or drive.PHASE.PAUSED})
                    if change_err then return nil, change_err end
                    if not changed then return nil, automation_error("selected install loses its drive fence", errors.CONFLICT) end
                end
            end
            if state == "failed" and CREATES_DRIVES[tostring(pending.kind)] then
                local cleanup, cleanup_err = P.reserve_install_pin_release_tx(tx, pending)
                if cleanup_err then return nil, cleanup_err end
                if not cleanup then
                    for _, key in ipairs(pending.drive_keys or {}) do
                        local _, delete_err = drive.delete_tx(tx, pending.automation_id, key)
                        if delete_err then return nil, delete_err end
                    end
                end
            end
            return result, nil
        end)
        if final_err then
            local details = type(final_err) == "userdata" and (final_err :: any):details() or nil
            if type(details) == "table" and details.reason == command.REASON.STALE then
                local answer, answer_err = read_recorded(pending.automation_id, pending.request_id)
                return answer, answer_err, true
            end
            return nil, final_err, false
        end
        -- The release just committed raised every affected drive's control demand (A52): wake the dispatcher.
        local wake_err = wake_dispatcher(pending.automation_id, pending.request_id)
        if wake_err then return nil, wake_err, false end
        return finalized, nil, false
    end

    -- defer(pending, failure) keeps the command { automation_id, request_id,
    -- generation, digest } pending with the classified failure, its attempt
    -- count and its next attempt. A command another attempt already finished
    -- answers with that outcome.
    local function defer(pending: Map, failure: Map): (Map?, any)
        local command = dependencies.command :: any
        local drive = dependencies.drive :: any
        local policy, policy_err = (dependencies.policy :: any).policy()
        if policy_err then return nil, policy_err end
        local deferred, defer_err = in_automation_tx(function(tx: any): (any?, any)
            local current, current_err = command.pending(tx, pending.automation_id)
            if current_err then return nil, current_err end
            local last = current and (current :: Map).request_id == pending.request_id and (current :: Map).last_error or nil
            local attempts = (type(last) == "table" and math.floor(tonumber((last :: Map).attempts) or 0) or 0) + 1
            -- Capped full jitter between the policy's retry_after_ms and a cap
            -- doubling per attempt up to max_delay_ms (design v5 §4.4), without
            -- terminal exhaustion: the one backoff of rounds and commands.
            local next_attempt_at = drive.utc_after((dependencies.round_outcome :: any).backoff_ms(attempts,
                (policy :: Map).command_retry_after_ms, (policy :: Map).command_max_delay_ms))
            local recorded_failure: Map = {}
            for key, value in pairs(failure) do recorded_failure[key] = value end
            recorded_failure.attempts = attempts
            if failure.kind == errors.PERMISSION_DENIED and failure.retriable ~= true then
                recorded_failure.state = "blocked_authority"
            end
            local err = command.defer_tx(tx, pending.automation_id, pending.request_id, pending.generation, pending.digest,
                recorded_failure, next_attempt_at)
            if err then return nil, err end
            return { next_attempt_at = next_attempt_at, error = recorded_failure }, nil
        end)
        if defer_err or not deferred then
            local details = type(defer_err) == "userdata" and (defer_err :: any):details() or nil
            if type(details) == "table" and details.reason == command.REASON.STALE then
                return read_recorded(pending.automation_id, pending.request_id)
            end
            return nil, defer_err
        end
        -- The new next_attempt_at is a deadline no one else will observe on its own (A52): wake the dispatcher.
        local wake_err = wake_dispatcher(pending.automation_id, pending.request_id)
        if wake_err then return nil, wake_err end
        return { state = "pending", request_id = pending.request_id, generation = pending.generation,
            next_attempt_at = (deferred :: Map).next_attempt_at, error = (deferred :: Map).error }, nil
    end

    -- execute_pending(automation_id, request_id?) runs the automation's pending
    -- declaration step and finalizes it. With request_id, a command that is no
    -- longer pending answers with its recorded outcome. A pending command whose
    -- step is not a writer call stays pending for its own path.
    -- Returns { state = "none"|"pending"|"succeeded", request_id?, generation?,
    -- outcome?, written?, next_attempt_at?, error? }, or the step's terminal
    -- failure; a retriable failure answers pending with its next attempt.
    local function execute_pending(automation_id: string, request_id: string?): (Map?, any)
        local command = dependencies.command :: any
        local pending, pending_err = with_automation_db(function(db: any): (any?, any)
            return command.pending(db, automation_id)
        end)
        if pending_err then return nil, pending_err end
        if request_id ~= nil and (not pending or (pending :: Map).request_id ~= request_id) then
            return read_recorded(automation_id, request_id :: string)
        end
        if not pending then return { state = "none" }, nil end
        local p = pending :: Map
        local step = P.command_steps[tostring(p.kind)]
        if step then return step(p) end
        if not WRITER_STEPS[tostring(p.kind)] then
            return { state = "pending", request_id = p.request_id, generation = p.generation, kind = p.kind,
                next_attempt_at = p.next_attempt_at }, nil
        end
        local input = type(p.input) == "table" and p.input or {}

        local funcs = dependencies.funcs :: automation_types.FuncsModule
        local written: any, write_err: any = nil, nil
        local pin_err: any = nil
        local _, lower_err = P.lower_pins(p)
        pin_err = lower_err
        if pin_err ~= nil then
            write_err = pin_err
        else
            local executor, executor_err = funcs.new()
            if executor_err or not executor then
                write_err = automation_error("declaration writer executor unavailable", errors.INTERNAL, executor_err)
            else
                written, write_err = (executor :: any):call(tostring(input.writer), step_args(p))
                if write_err == nil and written == nil then
                    write_err = automation_error("declaration writer returned no result", errors.INTERNAL)
                end
            end
        end

        if write_err ~= nil then
            -- Only a terminal failure finishes the command; a retriable one keeps
            -- it pending for recovery (CONTRACTS §4 one classification rule).
            local classified = (dependencies.failure_classification :: any).classify(write_err)
            local holds_targets = false
            if not CREATES_DRIVES[tostring(p.kind)] and classified.kind == errors.PERMISSION_DENIED then
                local op, op_err = with_automation_db(function(db: any): (any?, any)
                    return command.read_op(db, p.automation_id, p.request_id)
                end)
                if op_err then return nil, op_err end
                holds_targets = op ~= nil and next(op.target_receipts) ~= nil
            end
            if classified.retriable or holds_targets then
                return defer(p, classified)
            end
            local recorded_answer, finish_err, elsewhere = finish(p, "failed", { kind = classified.kind, message = classified.message })
            -- Another executor of this command finalized it first: its durable
            -- outcome is the answer, and this step's failure (it found the
            -- command no longer pending) is not.
            if elsewhere then return recorded_answer, finish_err end
            if finish_err then
                return nil, automation_error("automation " .. tostring(p.kind) .. " failed (" .. tostring(write_err)
                    .. ") and its command could not be finalized", errors.INTERNAL, finish_err)
            end
            if p.kind == "install" and type(input.writer_args) == "table" then
                M.replay((input.writer_args :: Map).rollback or {})
            end
            if CREATES_DRIVES[tostring(p.kind)] then
                -- A reserved pin release runs now; a deferred one recovers later.
                local _, release_err = execute_pending(automation_id, nil)
                if release_err then
                    (dependencies.logger :: any):named("automation.install"):error("pin release deferred to recovery",
                        { automation_id = automation_id, error = tostring(release_err) })
                end
            end
            return nil, automation_error("automation " .. tostring(p.kind) .. " failed", errors.INTERNAL, write_err)
        end

        local outcome: Map = { component_id = automation_id, generation = p.generation }
        local finished, finish_err = finish(p, "succeeded", outcome)
        if finish_err or not finished then return nil, finish_err end
        if CREATES_DRIVES[tostring(p.kind)] then
            local provision_err = provision_slots(automation_id, p.drive_keys or {})
            if provision_err then return nil, provision_err end
        end
        local update = type(input.source_update) == "table" and (input.source_update :: Map) or nil
        if update and update.changed then
            -- The main drive's slot is keyed by its source; a moved source moves its key,
            -- and the old pin's reserved release runs now (recovery runs it later).
            local _, slot_err = (dependencies.slot :: any).provision(automation_id, drive_plan.MAIN)
            if slot_err then return nil, slot_err end
            local _, release_err = execute_pending(automation_id, nil)
            if release_err then
                (dependencies.logger :: any):named("automation.reconfigure"):error("old pin release deferred to recovery",
                    { automation_id = automation_id, error = tostring(release_err) })
            end
        end
        return { state = "succeeded", request_id = p.request_id, generation = p.generation, outcome = outcome, written = written }, nil
    end

    -- run_declaration_command(spec) -> (writer result?, err?). spec = { kind =
    -- "install"|"reconfigure", automation_id, operator_id, subject_id,
    -- operator_identity?, subject_identity?, type_id, schema, declaration,
    -- main_source?, enabled?, writer, writer_args }. An
    -- install with enabled = false creates its source drives paused.
    -- An install creates its source drives and provisions their slots once
    -- the command succeeds; a reconfigure covers every drive
    -- the automation holds. An install that cannot be reserved replays its
    -- rollback chain; one whose step fails replays it through execute_pending.
    local function run_declaration_command(spec: Map): (Map?, any)
        local drive = dependencies.drive :: any
        local command = dependencies.command :: any
        local automation_id = spec.automation_id :: string
        local installing = spec.kind == "install"
        local creating = CREATES_DRIVES[tostring(spec.kind)] == true
        local writer_args: Map = type(spec.writer_args) == "table" and spec.writer_args or {}

        local function refuse(err: any): (Map?, any)
            if installing then M.replay(writer_args.rollback or {}) end
            return nil, err
        end

        -- The declaration's resource references (A26) with the operator and
        -- execution subject whose live access the declaration writer checks.
        local references, references_err = (dependencies.declaration_references :: any).collect(spec.schema, spec.declaration)
        if references_err or not references then return refuse(references_err) end
        local writes = spec.writer ~= nil
        local operator_identity: any = spec.operator_identity
        if operator_identity == nil and writes then
            local captured, capture_err = (dependencies.execution_identity :: any).capture()
            if capture_err or not captured then return refuse(capture_err) end
            operator_identity = captured
        end
        local subject_identity: any = installing and operator_identity or spec.subject_identity
        if writes and type(subject_identity) ~= "table" then
            return refuse(automation_error("execution subject identity is required", errors.INVALID))
        end

        local digest, digest_err = (dependencies.canonical_json :: any).hash(spec.request_digest_input or spec.declaration)
        if digest_err or not digest then return refuse(digest_err) end
        local request_id = spec.request_id or (creating and (tostring(spec.kind) .. ":" .. automation_id) or ("reconfigure:" .. uuid.v7()))
        local start_seq = 0
        local source_update: Map? = nil
        if creating then
            local resolved, start_err = P.start_position(spec.main_source)
            if start_err then return refuse(start_err) end
            start_seq = resolved :: integer
        elseif spec.main_source ~= nil then
            local planned, plan_err = P.plan_source_update(automation_id, spec.main_source :: Map)
            if plan_err or not planned then return refuse(plan_err) end
            source_update = planned
            start_seq = (planned :: Map).start_seq
        end
        local pins: { Map } = {}
        if creating or (source_update and (source_update :: Map).changed) then
            pins = P.install_pins(automation_id, spec.main_source, start_seq)
        end
        local policy, policy_err = (dependencies.policy :: any).policy()
        if policy_err then return refuse(policy_err) end
        -- The drive policy is resolved once here (design v5 §8): the registered
        -- policy with the declaration's overrides, from its main source or,
        -- for a reconfigure that keeps its source, from the main drive's action.
        local overrides: Map = {}
        if spec.main_source ~= nil then
            overrides = { round = (spec.main_source :: Map).round, delivery = (spec.main_source :: Map).delivery }
        elseif not creating then
            local current, current_err = with_automation_db(function(db: any): (any?, any)
                return drive.get(db, automation_id, drive_plan.MAIN)
            end)
            if current_err then return refuse(current_err) end
            local action = current and type((current :: Map).action) == "table" and (current :: Map).action or {}
            overrides = { round = action.round, delivery = action.delivery }
        end
        local drive_policy, drive_policy_err = (dependencies.policy :: any).drive_policy(overrides)
        if drive_policy_err or not drive_policy then return refuse(drive_policy_err) end
        -- A none-source automation can gain its first slot here. Establish
        -- maintenance before reservation so a crash with the command pending
        -- still has a worker to recover and provision that slot.
        if spec.kind == "reconfigure" and source_update and source_update.changed then
            local _, dispatcher_err = (dependencies.slot :: any).ensure_dispatcher()
            if dispatcher_err then return refuse(dispatcher_err) end
        end
        -- The caller runs the step now; recovery waits one retry interval first.
        local first_recovery = drive.utc_after((policy :: Map).command_retry_after_ms :: integer)

        local reserved, reserve_err = in_automation_tx(function(tx: any): (any?, any)
            local drive_keys: { string } = {}
            local prepare_tx: any = nil
            if creating then
                local reconcile_due = drive.utc_after(((drive_policy :: Map).reconcile :: Map).interval_ms :: integer)
                local planned_drives = drive_plan.install_drives(spec.main_source, start_seq, reconcile_due,
                    spec.enabled == false or spec.kind == "install_selected")
                for _, planned in ipairs(planned_drives) do drive_keys[#drive_keys + 1] = planned.drive_key end
                prepare_tx = function(inner: any): any
                    for _, planned in ipairs(planned_drives) do
                        local row: Map = {}
                        for k, v in pairs(planned) do row[k] = v end
                        row.automation_id = automation_id
                        if row.source_kind == "event" and row.drive_key == drive_plan.MAIN then row.event_seq = start_seq end
                        row.applied = { declaration = spec.declaration, policy = drive_policy }
                        row.applied_hash = digest
                        local _, drive_err = drive.insert_tx(inner, row)
                        if drive_err then return drive_err end
                    end
                    return nil
                end
            else
                local keys, keys_err = drive.keys(tx, automation_id)
                if keys_err then return nil, keys_err end
                if not keys or #(keys :: { string }) == 0 then
                    return nil, automation_error("automation " .. automation_id .. " holds no drives", errors.INVALID)
                end
                drive_keys = keys :: { string }
            end
            return command.reserve_tx(tx, {
                automation_id = automation_id, request_id = request_id, digest = digest, kind = spec.kind,
                input = {
                    operator_id = spec.operator_id, subject_id = spec.subject_id, declaration = spec.declaration,
                    writer = spec.writer, writer_args = writer_args, pins = pins, source_update = source_update,
                    drive_policy = drive_policy, type_id = spec.type_id,
                    state = spec.state, public_meta = spec.public_meta, enabled = spec.enabled,
                    schema = spec.schema, references = references,
                    operator_identity = operator_identity, subject_identity = subject_identity,
                    principal = spec.principal, expected_identity_generation = spec.expected_identity_generation,
                    declaration_hash = digest, request_fingerprint = spec.request_fingerprint,
                },
                drive_keys = drive_keys,
                next_attempt_at = first_recovery,
            }, prepare_tx)
        end)
        if reserve_err or not reserved then return refuse(reserve_err) end

        local executed, execute_err = execute_pending(automation_id, request_id)
        if execute_err or not executed then return nil, execute_err end
        local result = executed :: Map
        if result.state == "pending" then
            local failure = type(result.error) == "table" and result.error or {}
            return nil, errors.new({
                message = "automation " .. tostring(spec.kind) .. " " .. automation_id .. " is pending (" .. tostring(failure.message)
                    .. "); command " .. request_id .. " completes through recovery from " .. tostring(result.next_attempt_at),
                kind = tostring(failure.kind or errors.UNAVAILABLE),
                retryable = true,
                details = { state = "pending", request_id = request_id, next_attempt_at = result.next_attempt_at },
            })
        end
        if type(result.written) == "table" then return result.written :: Map, nil end
        return result.outcome :: Map, nil
    end

    P.finish_command = finish
    P.in_automation_tx = in_automation_tx
    P.run_declaration_command = run_declaration_command
    -- Cross-store command steps other parts own, by command kind; execute_pending
    -- runs a pending command of such a kind through its step.
    P.command_steps = P.command_steps or {}
    P.execute_pending = execute_pending
    P.read_recorded = read_recorded
    P.defer_command = defer
    P.wake_dispatcher = wake_dispatcher
end

return part
