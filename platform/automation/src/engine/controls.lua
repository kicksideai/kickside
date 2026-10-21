-- Drive controls (design v5 §4.7, §7.5; CONTRACTS §8, §19): pause, resume,
-- run_now, replay and resync of one drive (default main) enter the
-- automation's command stream. WRITE access. The command fences the drive
-- (new revision, cleared round token, wake demand), so a round in flight cannot
-- commit over the control, and the drive's slot is woken to run under it.
--
--   pause / resume / run_now / replay -- reserved, applied and finalized in one
--                                       automation-DB transaction
--   resync of a collection or timer drive -- likewise: the cursor restarts under
--                                       a new rewind generation and delivery
--                                       revision (A37)
--   resync of an event drive        -- cross-store (§4.9): the command stays
--                                       pending while the core retention pin is
--                                       lowered under its id and generation;
--                                       finalization applies the position with
--                                       the pin receipt under a new delivery
--                                       revision. A position below the
--                                       thread's prune boundary finalizes the
--                                       command failed without moving the drive.
--                                       The step is recoverable from the command.
--
-- replay and resync require the caller's request_id; a repeated request id
-- with the same input reads back its recorded outcome.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")

type Map = { [string]: any }

local identity = require("delivery_identity")
local provenance = require("round_provenance")

local part = {}

local CONTROLS = support.DRIVE_CONTROLS
local ALL_DRIVES: { [string]: boolean } = { pause = true, resume = true }
local RESYNC_EVENT = "resync_event"
local RESYNC_OWNER = "kickside.automation:command_dispatcher"
local RECONCILE_DRIVE = "reconcile"
-- run_now and resync make a round due; the command's success records that,
-- and the round itself runs when a worker claims the drive's slot.
local ROUND_QUEUED = "queued"

-- The parked phases resume releases (design v5 §4.4): an explicit pause, and
-- a deterministic declaration or access failure the operator has corrected
-- (a fixed configuration, a restored grant). The round re-evaluates the drive
-- on its next stamp and parks it again if the cause remains. An identity block
-- waits for an authorized identity selection, and a deleted source never
-- resumes.
local function resumable_phases(PHASE: Map): { [string]: boolean }
    return { [PHASE.PAUSED] = true, [PHASE.BLOCKED_DECLARATION] = true, [PHASE.BLOCKED_ACCESS] = true }
end

-- attach(M, dependencies, P) defines M.control and registers the event resync step.
function part.attach(M: any, dependencies: any, P: any): ()
    local automation_error = support.automation_error
    local RESUMABLE_PHASES = resumable_phases((dependencies.drive :: any).PHASE)

    local function invalid(message: string): error
        return automation_error(message, errors.INVALID)
    end

    local function record_initiation_tx(tx: any, automation_id: string, request_id: string,
        generation: integer, digest: string, actor_id: string?): error?
        if actor_id == nil then return nil end
        return (dependencies.command :: any).record_receipt_tx(tx, automation_id, request_id, generation,
            digest, "initiation", {actor_id = actor_id})
    end

    local function set(tx: any, automation_id: string, drive_key: string, fields: Map): error?
        local _, err = (dependencies.drive :: any).update_cas_tx(tx, automation_id, drive_key, {}, fields)
        return err
    end

    -- restart_reconcile_tx starts the automation's reconcile pass afresh and
    -- at once (A33): a resync supersedes any pass in progress.
    local function restart_reconcile_tx(tx: any, automation_id: string): error?
        local null = (dependencies.sql :: any).NULL
        return set(tx, automation_id, RECONCILE_DRIVE, { reconcile_next_at = (dependencies.drive :: any).utc_now(),
            reconcile_pass_id = null, sweep_pending = false, cursor = null })
    end

    -- replay_tx returns the drive's dead, uncertain, retrying and waiting items
    -- (or the named keys) to retrying, due now, and recounts the drive.
    local function replay_tx(tx: any, d: Map, keys: any): (Map?, error?)
        local ledger = dependencies.round_ledger :: any
        local port = ledger.source_port(d)
        local drive_mod = dependencies.drive :: any
        local now = drive_mod.utc_now()
        local params: { any } = { d.automation_id, port }
        local key_filter = ""
        if type(keys) == "table" and #(keys :: { any }) > 0 then
            local marks: { string } = {}
            for _, key in ipairs(keys :: { any }) do
                params[#params + 1] = tostring(key)
                marks[#marks + 1] = "$" .. tostring(#params)
            end
            key_filter = " AND item_key IN (" .. table.concat(marks, ", ") .. ")"
        end
        local rows, read_err = tx:query("SELECT item_key,identity_key,envelope_json FROM " .. ledger.TABLE
            .. " WHERE owner_id=$1 AND source_port=$2 AND state IN ('dead','uncertain','retrying','waiting','parked')" .. key_filter,
            params)
        if read_err then return nil, read_err end
        local replayed = 0
        for _, row in ipairs(rows :: { Map }) do
            local item, decode_err = (dependencies.json :: any).decode(tostring(row.envelope_json))
            if decode_err then return nil, decode_err end
            item.attempt_generation = math.floor(tonumber(item.attempt_generation) or 0) + 1
            item.reservation = nil
            identity.bind({ automation_id = d.automation_id, source_port = ledger.receipt_port(d), delivery_revision = d.delivery_revision }, item)
            local encoded, encode_err = (dependencies.json :: any).encode(item)
            if encode_err then return nil, encode_err end
            local result, err = tx:execute("UPDATE " .. ledger.TABLE
                .. " SET state='retrying',identity_parked=false,next_attempt_at=$1,updated_at=$1,envelope_json=$2,identity_key=$3"
                .. " WHERE owner_id=$4 AND source_port=$5 AND item_key=$6 AND identity_key=$7",
                { now, encoded, item.delivery_key, d.automation_id, port, row.item_key, row.identity_key })
            if err then return nil, err end
            replayed = replayed + math.floor(tonumber(result.rows_affected) or 0)
        end
        local counted, count_err = tx:query("SELECT COUNT(*) AS n FROM " .. ledger.TABLE
            .. " WHERE owner_id = $1 AND source_port = $2 AND state IN ('retrying', 'waiting', 'uncertain', 'parked')", { d.automation_id, port })
        if count_err then return nil, automation_error("replay recount failed", errors.INTERNAL, count_err) end
        local set_err = set(tx, d.automation_id, d.drive_key, { unresolved_count = math.floor(tonumber((counted :: { Map })[1].n) or 0) })
        if set_err then return nil, set_err end
        return { replayed = replayed }, nil
    end

    local function discard_tx(tx: any, d: Map, keys: any): (Map?, error?)
        if type(keys) ~= "table" or #keys == 0 then return nil, invalid("discard names the uncertain item keys") end
        local ledger = dependencies.round_ledger :: any
        local port = ledger.source_port(d)
        local now = (dependencies.drive :: any).utc_now()
        local policy, policy_err = (dependencies.policy :: any).policy()
        if policy_err then return nil, policy_err end
        local expires = (dependencies.drive :: any).utc_after(policy.ledger_resolved_ms)
        local discarded = 0
        for _, key in ipairs(keys) do
            local result, err = tx:execute("UPDATE " .. ledger.TABLE
                .. " SET state='resolved',error_code='discarded',next_attempt_at=NULL,resolved_at=$1,expires_at=$2,updated_at=$1"
                .. " WHERE owner_id=$3 AND source_port=$4 AND item_key=$5 AND state='uncertain'",
                { now, expires, d.automation_id, port, tostring(key) })
            if err then return nil, err end
            discarded = discarded + math.floor(tonumber(result.rows_affected) or 0)
        end
        local set_err = set(tx, d.automation_id, d.drive_key, { unresolved_count = math.max(0, d.unresolved_count - discarded) })
        if set_err then return nil, set_err end
        return { discarded = discarded }, nil
    end

    -- apply_simple_tx applies a single-transaction control to its locked drive.
    local function apply_simple_tx(tx: any, control: string, d: Map, args: Map): (Map?, error?)
        local drive_mod = dependencies.drive :: any
        local PHASE = drive_mod.PHASE
        if control == "pause" then
            if d.phase == PHASE.PAUSED and not d.enabled then return { changed = false }, nil end
            local fields = { phase = d.phase == PHASE.BLOCKED_SOURCE_DELETED and PHASE.BLOCKED_SOURCE_DELETED or PHASE.PAUSED,
                enabled = false }
            local err = set(tx, d.automation_id, d.drive_key, fields)
            if err then return nil, err end
            return { changed = true }, nil
        end
        if control == "resume" then
            local fields: Map = { enabled = true }
            local unparks = RESUMABLE_PHASES[tostring(d.phase)] == true
            if unparks then fields.phase = PHASE.ACTIVE end
            local err = set(tx, d.automation_id, d.drive_key, fields)
            if err then return nil, err end
            local ledger=dependencies.round_ledger :: any
            local _,release_err=tx:execute("UPDATE " .. ledger.TABLE .. " SET identity_parked=false"
                .. " WHERE owner_id=$1 AND source_port=$2 AND state='parked'", {d.automation_id,ledger.source_port(d)})
            if release_err then return nil,release_err end
            return { changed = unparks or not d.enabled }, nil
        end
        if control == "run_now" then
            local now = drive_mod.utc_now()
            local fields: Map = { next_run_at = now }
            if d.source_kind == drive_mod.SOURCE_KIND.MANUAL then
                fields.event_seq = math.max(d.event_seq :: integer, d.last_committed_occurrence_seq :: integer,
                    (d.occurrence_seq or 0) :: integer) + 1
            end
            if d.source_kind == drive_mod.SOURCE_KIND.RECONCILE then fields.reconcile_next_at = now end
            local err = set(tx, d.automation_id, d.drive_key, fields)
            if err then return nil, err end
            return { changed = true, round = ROUND_QUEUED }, nil
        end
        if control == "replay" then return replay_tx(tx, d, args.keys) end
        if control == "discard" then return discard_tx(tx, d, args.keys) end
        -- resync of a drive without a source thread: restart its cursor under a
        -- new delivery revision (A37), so re-pulled items are new deliveries.
        local fields: Map = { cursor = (dependencies.sql :: any).NULL, rewind_generation = (d.rewind_generation :: integer) + 1,
            delivery_revision = (d.delivery_revision :: integer) + 1, pass_pages = 0, pass_items = 0 }
        if d.source_kind == drive_mod.SOURCE_KIND.COLLECTION or d.source_kind == drive_mod.SOURCE_KIND.TIMER then
            fields.next_run_at = drive_mod.utc_now()
        end
        local err = set(tx, d.automation_id, d.drive_key, fields)
        if err then return nil, err end
        return { changed = true, round = ROUND_QUEUED }, nil
    end

    local function result_of(recorded: Map): (Map?, any)
        return {
            request_id = recorded.request_id, generation = recorded.generation, state = recorded.state,
            outcome = recorded.outcome,
        }, nil
    end

    local function resync_authority(pending: Map): error?
        local input = type(pending.input) == "table" and pending.input or {}
        if type(input.operator_identity) ~= "table" or type(input.operator_id) ~= "string" then
            return automation_error("resync has no captured operator authority", errors.PERMISSION_DENIED)
        end
        local execution_identity = dependencies.execution_identity :: any
        local valid, validation_err = execution_identity.validate(input.operator_identity)
        if not valid then return validation_err end
        if execution_identity.actor_key(input.operator_identity.principal) ~= input.operator_id then
            return automation_error("resync operator does not match its captured principal", errors.PERMISSION_DENIED)
        end
        local component = dependencies.component :: any
        local actor, actor_err = (dependencies.security :: any).actor()
        if actor_err then return actor_err end
        if actor and actor:id() == input.operator_id then
            local current, capture_err = execution_identity.capture()
            if capture_err then return capture_err end
            local saved = input.operator_identity
            if type(current) ~= "table" or not execution_identity.same_principal(current.principal, saved.principal)
                or not execution_identity.same_principal(current.authorized_by, saved.authorized_by)
                or current.component_id ~= saved.component_id or current.credential_id ~= saved.credential_id
                or current.link_id ~= saved.link_id then
                return automation_error("resync caller does not match its captured authority", errors.PERMISSION_DENIED)
            end
            local _, access_err = component.validate_access(pending.automation_id, component.ACCESS.WRITE)
            return access_err
        end
        local resolved, resolve_err = execution_identity.authorize(input.operator_identity, {deferred_owner = RESYNC_OWNER})
        if resolve_err then return resolve_err end
        if type(resolved) ~= "table" or type(resolved.meta) ~= "table" then
            return automation_error("resync operator authority is unavailable", errors.UNAVAILABLE)
        end
        local allowed, access_err = component.validate_principal_access(pending.automation_id, component.ACCESS.WRITE,
            resolved.principal, resolved.meta.security_groups, resolved.meta.access_filter)
        if access_err then return access_err end
        if not allowed then return automation_error("resync operator lacks automation WRITE", errors.PERMISSION_DENIED) end
        return nil
    end

    local function validate_resync(pending: Map): (Map?, any)
        local err = resync_authority(pending)
        if not err then return nil, nil end
        local classified = (dependencies.failure_classification :: any).classify(err)
        return P.defer_command(pending, classified)
    end

    -- The event resync step (recoverable): lower the retention pin under the
    -- command's id and generation, then finalize with the position and receipt.
    local function resync_event_step(pending: Map): (Map?, any)
        local input = type(pending.input) == "table" and pending.input or {}
        local command = dependencies.command :: any
        local denied, authority_err = validate_resync(pending)
        if denied or authority_err then return denied, authority_err end
        local lowered, pin_err = P.lower_pins(pending)
        local drive_key = tostring(input.drive_key)
        denied, authority_err = validate_resync(pending)
        if denied or authority_err then return denied, authority_err end
        if pin_err then
            local details = type(pin_err) == "userdata" and (pin_err :: any):details() or nil
            local reason = type(details) == "table" and details.reason or nil
            local classified = (dependencies.failure_classification :: any).classify(pin_err)
            if classified.retriable and reason ~= "below_prune_boundary" then
                return P.defer_command(pending, { kind = classified.kind, message = classified.message })
            end
            local failed, final_err = P.in_automation_tx(function(tx: any): (any?, any)
                return command.finalize_tx(tx, {
                    automation_id = pending.automation_id, request_id = pending.request_id, generation = pending.generation,
                    digest = pending.digest, state = "failed", outcome = { kind = classified.kind, message = classified.message, reason = reason },
                })
            end)
            if final_err or not failed then return nil, final_err end
            local wake_err = P.wake_dispatcher(pending.automation_id, pending.request_id)
            if wake_err then return nil, wake_err end
            return result_of(failed :: Map)
        end
        local receipt = (lowered :: Map)[drive_key] :: Map
        local finalized, final_err = P.in_automation_tx(function(tx: any): (any?, any)
            -- Receipt recording and every command writer lock command before
            -- drives. Validate the pending fence before changing any position,
            -- then prelock the entire drive set in the same order as rounds.
            local _, pending_err = command.lock_pending_tx(tx, pending.automation_id, pending.request_id,
                pending.generation, pending.digest)
            if pending_err then return nil, pending_err end
            local locked, lock_err = (dependencies.drive :: any).lock_tx(tx, pending.automation_id, pending.drive_keys)
            if lock_err then return nil, lock_err end
            local d = (locked :: { [string]: Map })[drive_key]
            local set_err = set(tx, pending.automation_id, drive_key, {
                event_seq = input.target, rewind_generation = (d.rewind_generation :: integer) + 1,
                delivery_revision = (d.delivery_revision :: integer) + 1,
            })
            if set_err then return nil, set_err end
            for _, key in ipairs(pending.drive_keys or {}) do
                if key == RECONCILE_DRIVE then
                    local restart_err = restart_reconcile_tx(tx, pending.automation_id)
                    if restart_err then return nil, restart_err end
                end
            end
            return command.finalize_tx(tx, {
                automation_id = pending.automation_id, request_id = pending.request_id, generation = pending.generation,
                digest = pending.digest, state = "succeeded", required_receipts = { "pin:" .. drive_key },
                outcome = { event_seq = input.target, pin_generation = (receipt :: Map).pin_generation, round = ROUND_QUEUED },
            })
        end)
        if final_err then
            local details = type(final_err) == "userdata" and (final_err :: any):details() or nil
            if type(details) == "table" and details.reason == command.REASON.STALE then
                return P.read_recorded(pending.automation_id, pending.request_id)
            end
            return nil, final_err
        end
        local wake_err = P.wake_dispatcher(pending.automation_id, pending.request_id)
        if wake_err then return nil, wake_err end
        return result_of(finalized :: Map)
    end
    P.command_steps[RESYNC_EVENT] = resync_event_step

    -- control(component_id, { control, drive_key?|drive_keys?, request_id?, keys?, from? })
    -- -> { request_id, generation, state, outcome? }.
    function M.control(component_id: string, args: any): (Map?, any)
        if type(component_id) ~= "string" or component_id == "" then return nil, invalid("automation id is required") end
        local a: Map = type(args) == "table" and args or {}
        local control = tostring(a.control or "")
        if not CONTROLS[control] then
            return nil, invalid("control must be pause, resume, run_now, replay, discard or resync; got " .. control)
        end
        local drive_key = type(a.drive_key) == "string" and a.drive_key ~= "" and a.drive_key or "main"
        local command_keys: { string } = {}
        if a.drive_keys ~= nil then
            if not ALL_DRIVES[control] or type(a.drive_keys) ~= "table" then
                return nil, invalid("drive_keys is supported only for pause and resume")
            end
            local seen: { [string]: boolean } = {}
            for _, key in ipairs(a.drive_keys :: { any }) do
                if type(key) ~= "string" or key == "" then return nil, invalid("drive_keys must contain non-empty strings") end
                if not seen[key] then seen[key] = true; command_keys[#command_keys + 1] = key end
            end
            table.sort(command_keys)
            if #command_keys == 0 then return nil, invalid("drive_keys must contain at least one drive") end
            drive_key = command_keys[1]
        else
            command_keys = { drive_key }
        end
        if CONTROLS[control].request_id_required and (type(a.request_id) ~= "string" or a.request_id == "") then
            return nil, invalid(control .. " requires a request_id")
        end
        local from = a.from
        if from ~= nil and (type(from) ~= "number" or from < 0 or from ~= math.floor(from)) then
            return nil, invalid("from must be a non-negative event sequence")
        end
        local component = dependencies.component :: automation_types.ComponentModule
        local _, access_err = component.validate_access(component_id, component.ACCESS.WRITE)
        if access_err then return nil, access_err end
        local actor, actor_err = (dependencies.security :: any).actor()
        if actor_err then return nil, actor_err end
        local actor_id = actor and actor:id() or nil

        local resolution_receipt: Map? = nil
        local resolution_generation: integer? = nil
        local resolution_delivery_keys: {string} = {}
        if a.resolve_identity ~= nil then
            local selection=a.resolve_identity
            if control ~= "replay" or type(selection) ~= "table" then return nil,invalid("identity resolution requires explicit replay") end
            for key in pairs(selection) do
                if key ~= "identity_generation" and key ~= "delivery_keys" then return nil,invalid("identity resolution contains an unsupported field") end
            end
            local expected=selection.identity_generation
            if type(expected) ~= "number" or expected < 0 or expected ~= math.floor(expected) then
                return nil,invalid("identity resolution requires the current identity generation")
            end
            if selection.delivery_keys ~= nil and type(selection.delivery_keys) ~= "table" then return nil,invalid("delivery_keys must be a list") end
            for _,key in ipairs(selection.delivery_keys or {}) do
                if type(key) ~= "string" or key == "" then return nil,invalid("delivery_keys require non-empty strings") end
                resolution_delivery_keys[#resolution_delivery_keys+1]=key
            end
            local count=#resolution_delivery_keys+(type(a.keys) == "table" and #a.keys or 0)
            if count < 1 or count > 200 then return nil,invalid("identity resolution names 1..200 retained item or delivery keys") end
            local _,admin_err=component.validate_access(component_id,component.ACCESS.ADMIN)
            if admin_err then return nil,admin_err end
            local state,state_err=P.in_automation_tx(function(tx: any): (any?,any)
                return (dependencies.command :: any).state(tx,component_id)
            end)
            if state_err or not state then return nil,state_err end
            local get_receipt=component.get_identity_receipt
            if type(get_receipt) ~= "function" then return nil,automation_error("identity receipt owner is unavailable",errors.UNAVAILABLE) end
            local receipt,receipt_err=get_receipt(component_id)
            if receipt_err or not receipt then return nil,receipt_err end
            if receipt.identity_generation ~= expected then return nil,automation_error("identity generation changes before delivery resolution",errors.CONFLICT) end
            local authorized,authorize_err=(dependencies.execution_identity :: any).authorize(receipt.execution_identity)
            if authorize_err or not authorized then return nil,authorize_err end
            resolution_receipt=receipt
            resolution_generation=state.generation
        end

        -- The digest is the canonical hash of the control's input, so a
        -- repeated request reads back its outcome and a changed one conflicts.
        local key_list: { string } = {}
        for _, key in ipairs(type(a.keys) == "table" and (a.keys :: { any }) or {}) do key_list[#key_list + 1] = tostring(key) end
        local digest, digest_err = (dependencies.canonical_json :: any).hash({ control = control, drive_keys = command_keys,
            keys = key_list, from = from,resolve_identity=a.resolve_identity })
        if digest_err or not digest then return nil, digest_err end
        local request_id = type(a.request_id) == "string" and a.request_id ~= "" and a.request_id
            or (control .. ":" .. (dependencies.uuid :: any).v7())
        local drive_mod = dependencies.drive :: any
        local command = dependencies.command :: any

        local d: Map? = nil
        if control == "resync" then
            local current, read_err = P.in_automation_tx(function(tx: any): (any?, any)
                return drive_mod.get(tx, component_id, drive_key)
            end)
            if read_err then return nil, read_err end
            if not current then
                return nil, automation_error("automation " .. component_id .. " has no drive " .. drive_key, errors.NOT_FOUND)
            end
            d = current :: Map
        end

        -- A resync also starts the automation's reconcile pass at once (A33):
        -- the command covers the reconcile drive too.
        if control == "resync" and drive_key ~= RECONCILE_DRIVE then
            local reconciler, reconciler_err = P.in_automation_tx(function(tx: any): (any?, any)
                return drive_mod.get(tx, component_id, RECONCILE_DRIVE)
            end)
            if reconciler_err then return nil, reconciler_err end
            if reconciler then command_keys[#command_keys + 1] = RECONCILE_DRIVE; table.sort(command_keys) end
        end

        if control == "resync" and (d :: Map).source_kind == drive_mod.SOURCE_KIND.EVENT then
            local captured, capture_err = (dependencies.execution_identity :: any).capture()
            if capture_err or not captured then return nil, capture_err end
            local reserved, reserve_err = P.in_automation_tx(function(tx: any): (any?, any)
                local result, err = command.reserve_tx(tx, {
                    automation_id = component_id, request_id = request_id, digest = digest, kind = RESYNC_EVENT,
                    input = { control = control, drive_key = drive_key, drive_keys = command_keys, target = from or 0,
                        operator_id = actor_id, operator_identity = captured,
                        pins = { { drive_key = drive_key, thread_id = (d :: Map).source_thread_id, target = from or 0,
                            consumer_key = "drive:" .. component_id .. ":" .. drive_key } } },
                    drive_keys = command_keys,
                })
                if err or not result then return nil, err end
                if not result.existing then
                    local initiation_err = record_initiation_tx(tx, component_id, request_id, result.generation, digest, actor_id)
                    if initiation_err then return nil, initiation_err end
                end
                return result, nil
            end)
            if reserve_err or not reserved then return nil, reserve_err end
            local r = reserved :: Map
            if r.existing and r.state ~= "pending" then return result_of(r) end
            return P.execute_pending(component_id, request_id)
        end

        local ran, run_err = P.in_automation_tx(function(tx: any): (any?, any)
            local locked_keys=command_keys
            if resolution_receipt then
                local keys,keys_err=drive_mod.keys(tx,component_id)
                if keys_err then return nil,keys_err end
                locked_keys=keys
            end
            return command.run_tx(tx, {
                automation_id = component_id, request_id = request_id, digest = digest, kind = control,
                input = { control = control, drive_key = drive_key, drive_keys = command_keys, keys = a.keys, from = from,resolve_identity=a.resolve_identity,
                    resolution_receipt=resolution_receipt },
                drive_keys = locked_keys,
            }, function(inner: any, drives: { [string]: Map }): (Map?, error?)
                local outcomes: { Map } = {}
                for _, key in ipairs(command_keys) do
                    local current = drives[key]
                    if not current then
                        return nil, automation_error("automation " .. component_id .. " has no drive " .. key, errors.NOT_FOUND)
                    end
                    local resolution_count: integer? = nil
                    if resolution_receipt then
                        if current.command_generation ~= (resolution_generation :: integer)+1 then
                            return nil,automation_error("automation command changes before delivery resolution",errors.CONFLICT)
                        end
                        local resolved,resolve_err=provenance.resolve_tx(inner,current,resolution_receipt,key_list,resolution_delivery_keys,drives)
                        if resolve_err then return nil,resolve_err end
                        resolution_count=resolved
                    end
                    local applied, apply_err = apply_simple_tx(inner, control, current, a)
                    if apply_err then return nil, apply_err end
                    if resolution_receipt then
                        applied.identity_resolution={count=resolution_count,identity_generation=resolution_receipt.identity_generation,
                            principal=resolution_receipt.principal,operator_id=(dependencies.security :: any).actor():id(),
                            item_keys=key_list,delivery_keys=resolution_delivery_keys}
                    end
                    outcomes[#outcomes + 1] = { drive_key = key, outcome = applied }
                end
                if control == "resync" and drives[RECONCILE_DRIVE] and drive_key ~= RECONCILE_DRIVE then
                    local restart_err = restart_reconcile_tx(inner, component_id)
                    if restart_err then return nil, restart_err end
                end
                local initiation_err = record_initiation_tx(inner, component_id, request_id,
                    drives[command_keys[1]].command_generation, digest, actor_id)
                if initiation_err then return nil, initiation_err end
                if #outcomes == 1 then return outcomes[1].outcome, nil end
                return { drives = outcomes }, nil
            end)
        end)
        if run_err or not ran then return nil, run_err end
        -- The fence and release inside run_tx raised the control's drives'
        -- control demand (design v5 §4.7; A52): wake the dispatcher.
        local wake_err = P.wake_dispatcher(component_id, request_id)
        if wake_err then return nil, wake_err end
        return result_of(ran :: Map)
    end

    -- generic_action(component_id, method, args) -> the generic control of an
    -- automation: all controls use this reserved path on every automation kind.
    function M.generic_action(component_id: string, method: string, args: any): (Map?, any)
        local a: Map = type(args) == "table" and args or {}
        if method == "status" then return M.status(component_id, a) end
        if method == "health" then return M.health() end
        if method == "reconfigure" then return M.generic_reconfigure(component_id, a) end
        if method == "set_execution_identity" then return M.set_execution_identity(component_id, a) end
        if CONTROLS[method] and not ALL_DRIVES[method] then
            return M.control(component_id, { control = method, drive_key = a.drive_key, request_id = a.request_id, keys = a.keys, from = a.from,resolve_identity=a.resolve_identity })
        end
        if method ~= "pause" and method ~= "resume" then return nil, invalid("unknown generic action " .. tostring(method)) end
        local keys, keys_err = P.in_automation_tx(function(tx: any): (any?, any)
            return (dependencies.drive :: any).keys(tx, component_id)
        end)
        if keys_err then return nil, keys_err end
        if not keys or #(keys :: { string }) == 0 then
            return nil, automation_error("automation " .. component_id .. " holds no drives", errors.INVALID)
        end
        return M.control(component_id, { control = method, drive_keys = keys, request_id = a.request_id })
    end
end

return part
