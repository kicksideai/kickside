-- Main drive sources and their retention pins (design v5 §4.9, §4.10;
-- CONTRACTS §19 pin tombstone): the pins an install lowers before creating its
-- component, the start position an event main drive takes (A27), a
-- reconfigure's re-declared source (a moved source restarts under a new pin
-- and releases the old one), and pin release behind core tombstones through a
-- recoverable command.

local support = require("engine_support")
local drive_plan = require("engine_drive_plan")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

-- The drive every installed automation starts with.

-- The command that releases a failed install's retention pins.
local PIN_RELEASE = "release_pins"

-- install_pins(automation_id, main_source) -> the retention pins an install
-- lowers before its component is created (design v5 §4.9, §4.10): the main
-- event drive's pin on its source thread at its start sequence.
local function install_pins(automation_id: string, main_source: Map?, start_seq: integer): { Map }
    if type(main_source) ~= "table" or main_source.source_kind ~= "event" then return {} end
    return { { drive_key = drive_plan.MAIN, thread_id = main_source.source_thread_id,
        consumer_key = "drive:" .. automation_id .. ":" .. drive_plan.MAIN, target = start_seq } }
end

-- attach(M, dependencies, P) publishes P.install_pins, P.start_position,
-- P.lower_pins, P.plan_source_update, P.apply_source_update_tx,
-- P.reserve_pin_release_tx and P.reserve_install_pin_release_tx, and registers
-- the pin release step.
function part.attach(M: any, dependencies: any, P: any): ()
    local automation_error = support.automation_error

    local with_automation_db = (dependencies.automation_db :: any).with_db

    local function defer(pending: Map, failure: Map): (Map?, any)
        return P.defer_command(pending, failure)
    end

    local function read_recorded(automation_id: string, request_id: string): (Map?, any)
        return P.read_recorded(automation_id, request_id)
    end

    local in_automation_tx = (dependencies.automation_db :: any).in_tx

    -- start_position(main_source) -> the event sequence a new main event drive
    -- starts after (A27): 0 for start = all, the source thread's head for start
    -- = new, read through the core threads contract under the installer.
    local function start_position(main_source: Map?): (integer?, any)
        if type(main_source) ~= "table" or main_source.source_kind ~= "event" or main_source.start ~= "new" then return 0, nil end
        local def, def_err = (dependencies.contract :: any).get("kickside.core:threads")
        if def_err or not def then return nil, automation_error("threads contract unavailable", errors.UNAVAILABLE, def_err) end
        local threads, open_err = (def :: any):open()
        if open_err or not threads then return nil, automation_error("threads contract open failed", errors.UNAVAILABLE, open_err) end
        local page, list_err = (threads :: any):list_events({ thread_id = main_source.source_thread_id, limit = 1 })
        if list_err then return nil, list_err end
        local p = type(page) == "table" and (page :: Map) or {}
        local head = math.floor(tonumber(p.max_pruned_seq) or 0)
        local events = type(p.events) == "table" and (p.events :: { Map }) or {}
        if events[1] ~= nil then head = math.floor(math.max(head, math.floor(tonumber(events[1].seq) or 0))) end
        return head, nil
    end

    -- lower_pins lowers each pin a pending command names (input.pins: an
    -- install's, a reconfigure's moved source, an event resync's) under its
    -- command id and generation, records the receipt on the command as step
    -- "pin:<drive_key>" and the pin generation on the drive; a pin the command
    -- already holds a receipt for is done. The core step is idempotent for the
    -- same id, generation and target. Returns { [drive_key] = receipt }.
    local function apply_pin_steps(p: Map, pins: { Map }, fencing: boolean): (Map?, any)
        local lowered: Map = {}
        if #pins == 0 then return lowered, nil end
        local command = dependencies.command :: any
        local op, op_err = with_automation_db(function(db: any): (any?, any) return command.read_op(db, p.automation_id, p.request_id) end)
        if op_err then return nil, op_err end
        local receipts = op and (op :: Map).target_receipts or {}
        for _, pin_spec in ipairs(pins) do
            local step = fencing and ("pin_fence:" .. tostring(pin_spec.thread_id) .. ":" .. tostring(pin_spec.consumer_key))
                or ("pin:" .. tostring(pin_spec.drive_key))
            lowered[fencing and step or tostring(pin_spec.drive_key)] = (receipts :: Map)[step]
            if (receipts :: Map)[step] == nil then
                local core, core_err = (dependencies.sql :: any).get((dependencies.core_db :: any).id())
                if core_err or not core then
                    return nil, automation_error("core database unavailable", errors.UNAVAILABLE, core_err)
                end
                local method = fencing and (dependencies.retention_pin :: any).pin_fence or (dependencies.retention_pin :: any).pin_lower
                local receipt, pin_err = method(core, {
                    thread_id = pin_spec.thread_id, consumer_key = pin_spec.consumer_key,
                    command_id = p.request_id, command_generation = p.generation, target_cursor = pin_spec.target,
                })
                core:release()
                if pin_err then return nil, pin_err end
                local _, record_err = in_automation_tx(function(tx: any): (any?, any)
                    local err = command.record_receipt_tx(tx, p.automation_id, p.request_id, p.generation, p.digest, step, receipt :: Map)
                    if err then return nil, err end
                    local drive = dependencies.drive :: any
                    local held, held_err = drive.get(tx, p.automation_id, tostring(pin_spec.drive_key))
                    if held_err then return nil, held_err end
                    if not fencing or (held and held.source_thread_id == pin_spec.thread_id) then
                        local fields: Map = { pin_generation = fencing and not receipt.present
                            and (dependencies.sql :: any).NULL or (receipt :: Map).pin_generation }
                        if not fencing then
                            fields.pin_advance_cursor = (dependencies.sql :: any).NULL
                            fields.pin_next_at = (dependencies.sql :: any).NULL
                            fields.pin_error_json = (dependencies.sql :: any).NULL
                        end
                        local changed, set_err = drive.update_cas_tx(tx, p.automation_id, tostring(pin_spec.drive_key),
                            {command_generation=p.generation,pending_command_id=p.request_id}, fields)
                        if set_err then return nil, set_err end
                        if not changed then return nil, automation_error("drive lost its retention command fence", errors.CONFLICT) end
                    end
                    return true, nil
                end)
                if record_err then return nil, record_err end
                lowered[fencing and step or tostring(pin_spec.drive_key)] = receipt
            end
        end
        return lowered, nil
    end

    local function lower_pins(p: Map): (Map?, any)
        local input = type(p.input) == "table" and p.input or {}
        return apply_pin_steps(p, type(input.pins) == "table" and input.pins or {}, false)
    end

    function P.fence_pins(p: Map): (Map?, any)
        local input = type(p.input) == "table" and p.input or {}
        return apply_pin_steps(p, type(input.recovery_pins) == "table" and input.recovery_pins or {}, true)
    end

    function P.recovery_pins_tx(tx: any, automation_id: string, keys: { string }, pending: Map): ({ Map }?, any)
        local result: { Map } = {}
        local seen: Map = {}
        local function include(spec: Map): ()
            if type(spec.thread_id) ~= "string" or type(spec.consumer_key) ~= "string" then return end
            local key = spec.thread_id .. ":" .. spec.consumer_key
            if seen[key] then return end
            seen[key] = true
            result[#result + 1] = {drive_key=spec.drive_key,thread_id=spec.thread_id,consumer_key=spec.consumer_key}
        end
        for _, key in ipairs(keys) do
            local row, row_err = (dependencies.drive :: any).get(tx, automation_id, key)
            if row_err then return nil, row_err end
            if row and type(row.source_thread_id) == "string" then
                include({drive_key=key,thread_id=row.source_thread_id,consumer_key="drive:" .. automation_id .. ":" .. key})
            end
        end
        local input = type(pending.input) == "table" and pending.input or {}
        for _, field in ipairs({"pins", "releases", "recovery_pins"}) do
            for _, spec in ipairs(type(input[field]) == "table" and input[field] or {}) do include(spec) end
        end
        local update = type(input.source_update) == "table" and input.source_update or {}
        if type(update.old_pin) == "table" then include(update.old_pin) end
        table.sort(result, function(a, b)
            return (a.thread_id .. ":" .. a.consumer_key) < (b.thread_id .. ":" .. b.consumer_key)
        end)
        return result, nil
    end

    -- reserve_pin_release_tx(tx, pending, releases, remove_drives) reserves,
    -- over the pending command's drives, the command that releases the given
    -- retention pins (design v5 §4.9; CONTRACTS §19 pin tombstone). Its higher
    -- generation fences every delayed pin step of the command it follows.
    -- remove_drives also removes the drives once the pins are released.
    local function reserve_pin_release_tx(tx: any, pending: Map, releases: { Map }, remove_drives: boolean): (Map?, any)
        local command = dependencies.command :: any
        local request_id = PIN_RELEASE .. ":" .. tostring(pending.request_id)
        return command.reserve_tx(tx, {
            automation_id = pending.automation_id, request_id = request_id, digest = request_id, kind = PIN_RELEASE,
            input = { releases = releases, terminal_op_id = pending.request_id, remove_drives = remove_drives },
            drive_keys = pending.drive_keys,
        })
    end

    -- reserve_install_pin_release_tx reserves the release of the pins a failed
    -- install lowered, removing its drives after. Returns nil when the install
    -- lowered no pin.
    local function reserve_install_pin_release_tx(tx: any, pending: Map): (Map?, any)
        local command = dependencies.command :: any
        local op, op_err = command.read_op(tx, pending.automation_id, pending.request_id)
        if op_err then return nil, op_err end
        local receipts = op and (op :: Map).target_receipts or {}
        local input = type(pending.input) == "table" and pending.input or {}
        local releases: { Map } = {}
        for _, pin_spec in ipairs(type(input.pins) == "table" and (input.pins :: { Map }) or {}) do
            local receipt = (receipts :: Map)["pin:" .. tostring(pin_spec.drive_key)]
            if type(receipt) == "table" then
                releases[#releases + 1] = { drive_key = pin_spec.drive_key, thread_id = pin_spec.thread_id,
                    consumer_key = pin_spec.consumer_key, expected_pin_generation = (receipt :: Map).pin_generation }
            end
        end
        if #releases == 0 then return nil, nil end
        return reserve_pin_release_tx(tx, pending, releases, true)
    end

    -- The pin release step (recoverable): each pin is deleted behind a core
    -- tombstone at the release command's generation; then the command
    -- finalizes with the number released and, for a failed install, the drives
    -- are removed.
    local function release_pins_step(pending: Map): (Map?, any)
        local command = dependencies.command :: any
        local drive = dependencies.drive :: any
        local input = type(pending.input) == "table" and pending.input or {}
        local core, core_err = (dependencies.sql :: any).get((dependencies.core_db :: any).id())
        if core_err or not core then
            return defer(pending, { kind = errors.UNAVAILABLE, message = "core database unavailable: " .. tostring(core_err) })
        end
        local tombstones: { Map } = {}
        for _, release in ipairs(type(input.releases) == "table" and (input.releases :: { Map }) or {}) do
            local tx, begin_err = (core :: any):begin()
            if begin_err or not tx then
                core:release()
                return defer(pending, { kind = errors.UNAVAILABLE, message = "core transaction failed: " .. tostring(begin_err) })
            end
            local tomb, tomb_err = (dependencies.retention_pin :: any).cleanup_tombstone_tx(tx, {
                thread_id = release.thread_id, consumer_key = release.consumer_key,
                command_id = pending.request_id, command_generation = pending.generation,
                expected_pin_generation = release.expected_pin_generation, terminal_op_id = input.terminal_op_id,
            })
            if tomb_err then
                tx:rollback()
                core:release()
                local classified = (dependencies.failure_classification :: any).classify(tomb_err)
                return defer(pending, { kind = classified.kind, message = classified.message })
            end
            local _, commit_err = tx:commit()
            if commit_err then
                core:release()
                return defer(pending, { kind = errors.UNAVAILABLE, message = "core commit failed: " .. tostring(commit_err) })
            end
            tombstones[#tombstones + 1] = { consumer_key = release.consumer_key, tombstone_generation = (tomb :: Map).tombstone_generation }
        end
        core:release()
        local outcome: Map = { released = #tombstones, tombstones = tombstones, terminal_op_id = input.terminal_op_id }
        local finalized, final_err = in_automation_tx(function(tx: any): (any?, any)
            local result, err = command.finalize_tx(tx, {
                automation_id = pending.automation_id, request_id = pending.request_id, generation = pending.generation,
                digest = pending.digest, state = "succeeded", outcome = outcome,
            })
            if err then return nil, err end
            if input.remove_drives then
                for _, key in ipairs(pending.drive_keys or {}) do
                    local _, delete_err = drive.delete_tx(tx, pending.automation_id, key)
                    if delete_err then return nil, delete_err end
                end
            end
            return result, nil
        end)
        if final_err then
            local details = type(final_err) == "userdata" and (final_err :: any):details() or nil
            if type(details) == "table" and details.reason == command.REASON.STALE then
                return read_recorded(pending.automation_id, pending.request_id)
            end
            return nil, final_err
        end
        P.wake_dispatcher(pending.automation_id, pending.request_id)
        return { state = "succeeded", request_id = pending.request_id, generation = pending.generation, outcome = outcome }, nil
    end

    -- plan_source_update(automation_id, main_source) -> how a reconfigure
    -- re-declares the main drive's source: the new action, and whether the
    -- source moved (another kind, thread or port). A moved source restarts the
    -- drive at its start position (A27) under a newly lowered pin and releases
    -- the old pin; an unmoved one keeps position and pin.
    local function plan_source_update(automation_id: string, main_source: Map): (Map?, any)
        local current, read_err = with_automation_db(function(db: any): (any?, any)
            return (dependencies.drive :: any).get(db, automation_id, drive_plan.MAIN)
        end)
        if read_err then return nil, read_err end
        if not current then
            return nil, automation_error("automation " .. automation_id .. " holds no main drive", errors.INVALID)
        end
        local reconciler, reconcile_err = with_automation_db(function(db: any): (any?, any)
            return (dependencies.drive :: any).get(db, automation_id, drive_plan.RECONCILE)
        end)
        if reconcile_err then return nil, reconcile_err end
        local declares_reconcile = type(main_source.reconcile) == "table"
        if (reconciler ~= nil) ~= declares_reconcile then
            return nil, automation_error("reconcile mode changes require reinstalling the automation", errors.INVALID)
        end
        local d = current :: Map
        local planned = drive_plan.main_drive(main_source, 0)
        local action = type(d.action) == "table" and d.action or {}
        local changed = d.source_kind ~= planned.source_kind or d.source_thread_id ~= planned.source_thread_id
            or action.source_ref ~= (planned.action :: Map).source_ref
        local old_schedule = type(action.schedule) == "table" and action.schedule or {}
        local new_schedule = type(planned.action.schedule) == "table" and planned.action.schedule or {}
        local cadence_changed = old_schedule.type ~= new_schedule.type or old_schedule.expression ~= new_schedule.expression
        local start_seq = 0
        if changed then
            local resolved, start_err = P.start_position(main_source)
            if start_err then return nil, start_err end
            start_seq = resolved :: integer
        end
        local old_pin: Map? = nil
        if changed and d.pin_generation ~= nil and type(d.source_thread_id) == "string" then
            old_pin = { drive_key = drive_plan.MAIN, thread_id = d.source_thread_id,
                consumer_key = "drive:" .. automation_id .. ":" .. drive_plan.MAIN, expected_pin_generation = d.pin_generation }
        end
        local reconcile_action = declares_reconcile and drive_plan.reconcile_drive(main_source, nil).action or nil
        return { changed = changed, cadence_changed = cadence_changed, start_seq = start_seq, source_kind = planned.source_kind,
            source_thread_id = planned.source_thread_id, action = planned.action,
            reconcile_action = reconcile_action, old_pin = old_pin }, nil
    end

    -- apply_source_update_tx writes a finalized reconfigure's main source onto
    -- the drive: the new action always; for a moved source also the new kind,
    -- thread and start position under a new rewind generation, the pin the
    -- command lowered, and the reserved release of the old pin.
    local function apply_source_update_tx(tx: any, pending: Map, update: Map): error?
        local drive = dependencies.drive :: any
        local fields: Map = { action = update.action }
        if update.cadence_changed or update.changed then
            local locked, lock_err = drive.lock_tx(tx, pending.automation_id, { drive_plan.MAIN })
            if lock_err then return lock_err end
            local current = (locked :: { [string]: Map })[drive_plan.MAIN]
            local sql_null = (dependencies.sql :: any).NULL
            fields.last_error_json = sql_null
            if current.occurrence_seq == nil then fields.next_run_at = sql_null end
            if current.phase == drive.PHASE.BLOCKED_DECLARATION then
                fields.phase = current.enabled and drive.PHASE.ACTIVE or drive.PHASE.PAUSED
            end
        end
        if update.changed then
            local locked, lock_err = drive.lock_tx(tx, pending.automation_id, { drive_plan.MAIN })
            if lock_err then return lock_err end
            local d = (locked :: { [string]: Map })[drive_plan.MAIN]
            local sql_null = (dependencies.sql :: any).NULL
            fields.source_kind = update.source_kind
            fields.source_thread_id = update.source_thread_id or sql_null
            fields.event_seq = update.start_seq
            fields.cursor = sql_null
            fields.pin_advance_cursor = sql_null
            fields.pin_next_at = sql_null
            fields.pin_error_json = sql_null
            fields.next_run_at = sql_null
            fields.pass_pages = 0
            fields.pass_items = 0
            fields.rewind_generation = (d.rewind_generation :: integer) + 1
            if update.source_kind ~= "event" then fields.pin_generation = sql_null end
        end
        local _, set_err = drive.update_cas_tx(tx, pending.automation_id, drive_plan.MAIN, {}, fields)
        if set_err then return set_err end
        if update.reconcile_action ~= nil then
            local sql_null = (dependencies.sql :: any).NULL
            local _, reconcile_err = drive.update_cas_tx(tx, pending.automation_id, drive_plan.RECONCILE, {}, {
                action = update.reconcile_action, reconcile_next_at = drive.utc_now(),
                reconcile_pass_id = sql_null, sweep_pending = false, cursor = sql_null,
            })
            if reconcile_err then return reconcile_err end
        end
        if update.changed and type(update.old_pin) == "table" then
            local _, release_err = P.reserve_pin_release_tx(tx, pending, { update.old_pin :: Map }, false)
            if release_err then return release_err end
        end
        return nil
    end

    -- Advance one persisted intent outside the Automation transaction, then
    -- acknowledge exactly its generation, cursor and observed retry deadline.
    -- A newer cursor or a control's new pin generation owns its own intent.
    function P.advance_pin(d: Map, now: string, retry_ms: integer): (boolean?, any)
        if d.pin_advance_cursor == nil or d.pin_next_at > now then return false, nil end
        local core, core_err = (dependencies.sql :: any).get((dependencies.core_db :: any).id())
        local raise_err: any = core_err
        if not core then
            raise_err = core_err or automation_error("core database unavailable", errors.UNAVAILABLE)
        else
            local _, err = (dependencies.retention_pin :: any).pin_raise(core, {
                thread_id = d.source_thread_id, consumer_key = "drive:" .. tostring(d.automation_id) .. ":" .. tostring(d.drive_key),
                expected_pin_generation = d.pin_generation, new_cursor = d.pin_advance_cursor,
            })
            core:release()
            raise_err = err
        end
        local sql_null = (dependencies.sql :: any).NULL
        local next_at: any = sql_null
        local detail: any = sql_null
        if raise_err then
            local classified = (dependencies.failure_classification :: any).classify(raise_err)
            local encoded, encode_err = (dependencies.json :: any).encode(classified)
            if encode_err then return nil, encode_err end
            detail = encoded
            local parsed, parse_err = (dependencies.time :: any).parse((dependencies.time :: any).RFC3339, now)
            if parse_err or not parsed then return nil, parse_err end
            next_at = parsed:utc():add(math.max(retry_ms, math.floor(tonumber(classified.retry_after_ms) or 0))
                * (dependencies.time :: any).MILLISECOND):format((dependencies.time :: any).RFC3339)
        end
        local _, record_err = in_automation_tx(function(tx: any): (any?, any)
            return tx:execute("UPDATE kickside_automation_drive SET pin_advance_cursor=$1,pin_next_at=$2,pin_error_json=$3"
                .. " WHERE automation_id=$4 AND drive_key=$5 AND pin_generation=$6 AND pin_advance_cursor=$7 AND pin_next_at=$8",
                { raise_err and d.pin_advance_cursor or sql_null, next_at, detail,
                    d.automation_id, d.drive_key, d.pin_generation, d.pin_advance_cursor, d.pin_next_at })
        end)
        if record_err then return nil, record_err end
        return raise_err == nil, nil
    end

    -- The round consumes this path immediately after committing an intent;
    -- the dispatcher consumes the same path after a crash or failed raise.
    function M.advance_pin(automation_id: string, drive_key: string): (boolean?, any)
        local d, read_err = with_automation_db(function(db: any): (any?, any)
            return (dependencies.drive :: any).get(db, automation_id, drive_key)
        end)
        if read_err then return nil, read_err end
        if not d then return false, nil end
        -- Wake before crossing the owner boundary; a crash after the Core
        -- call still leaves the persisted intent reachable by maintenance.
        local _, initial_wake_err = (dependencies.slot :: any).wake_dispatcher()
        if initial_wake_err then return nil, initial_wake_err end
        local policy, policy_err = (dependencies.policy :: any).policy()
        if policy_err then return nil, policy_err end
        local result, raise_err = P.advance_pin(d, (dependencies.drive :: any).utc_now(), policy.round_retry_after_ms)
        if raise_err then return nil, raise_err end
        local _, wake_err = (dependencies.slot :: any).wake_dispatcher()
        if wake_err then return nil, wake_err end
        return result, nil
    end

    P.plan_source_update = plan_source_update
    P.apply_source_update_tx = apply_source_update_tx
    P.install_pins = install_pins
    P.start_position = start_position
    P.lower_pins = lower_pins
    P.reserve_pin_release_tx = reserve_pin_release_tx
    P.reserve_install_pin_release_tx = reserve_install_pin_release_tx
    P.command_steps = P.command_steps or {}
    P.command_steps[PIN_RELEASE] = release_pins_step
end

return part
