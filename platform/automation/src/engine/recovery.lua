-- Pending command recovery and the command dispatcher pass (design v5 §4.7;
-- CONTRACTS §19 dispatcher protocol).
--
-- recover_command runs an automation's pending command step from the command
-- alone (execute_pending). recover_drive is the entry a drive's round calls
-- before stamping: it runs the pending step of the command the drive is
-- pending on and says whether the round may stamp. dispatch is one pass of
-- the supervised maintenance slot, run at boot and whenever a producer wakes
-- it (A52 no polling: no fixed-interval rearm):
--   1. every pending command whose retry floor (next_attempt_at) is due runs
--      its step, in (pending_step, next_attempt_at, automation_id) index order;
--   2. every drive whose control demand (wake_generation) exceeds its
--      acknowledged demand has its slot woken with control priority, and only
--      then is the demand observed before the wake acknowledged by CAS: newer
--      demand stays due, a failed wake leaves it for the next pass;
--   3. every drive without a slot and without a pending command has its slot
--      provisioned (an install whose slot enqueue failed, or a lost slot).
-- A failure of one item is logged and leaves its durable mark (pending
-- command, unacknowledged demand, missing slot) for the caller's own wake
-- after its commit. The pass ends by reading the earliest remaining pending
-- command's next_attempt_at from durable state: the caller rearms to exactly
-- that deadline, or not at all when none is pending.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines M.recover_command, M.recover_drive and M.dispatch.
function part.attach(M: any, dependencies: any, P: any): ()
    local automation_error = support.automation_error

    local with_automation_db = (dependencies.automation_db :: any).with_db

    local function log_failure(message: string, fields: Map): ()
        (dependencies.logger :: any):named("automation.dispatcher"):error(message, fields)
    end

    -- recover_command(automation_id) -> { state = "none"|"pending"|"succeeded",
    -- request_id?, generation?, outcome? }: runs the automation's pending
    -- command step and finalizes it.
    function M.recover_command(automation_id: string): (Map?, any)
        if type(automation_id) ~= "string" or automation_id == "" then
            return nil, automation_error("automation id is required", errors.INVALID)
        end
        local result, err = P.execute_pending(automation_id, nil)
        if err or not result then return nil, err end
        local r = result :: Map
        return { state = r.state, request_id = r.request_id, generation = r.generation, outcome = r.outcome }, nil
    end

    -- recover_drive(automation_id, drive_key) -> { stamp, state, request_id?,
    -- next_attempt_at?, error? }: the entry a drive's round calls before
    -- stamping (design v5 §4.7: the drive's own slot runs pending work first).
    -- A drive pending on a command runs that command's step; it may stamp only
    -- once no command is pending on it. state is "none" (nothing was pending),
    -- the step's result ("succeeded", or "failed" with the terminal error it
    -- recorded), "pending" (deferred or not a writer step: hold the stamp until
    -- next_attempt_at) or "removed" (its failed install removed the drive, so
    -- the slot has no drive to run).
    function M.recover_drive(automation_id: string, drive_key: string): (Map?, any)
        if type(automation_id) ~= "string" or automation_id == "" or type(drive_key) ~= "string" or drive_key == "" then
            return nil, automation_error("automation id and drive key are required", errors.INVALID)
        end
        local drive = dependencies.drive :: any
        local function read(): (Map?, any)
            return with_automation_db(function(db: any): (any?, any) return drive.get(db, automation_id, drive_key) end)
        end
        local current, read_err = read()
        if read_err then return nil, read_err end
        if not current then
            return nil, automation_error("drive " .. automation_id .. "/" .. drive_key .. " not found", errors.NOT_FOUND)
        end
        if (current :: Map).pending_command_id == nil then return { stamp = true, state = "none" }, nil end

        local executed, execute_err = P.execute_pending(automation_id, nil)
        local terminal: any = nil
        if execute_err then
            local classified = (dependencies.failure_classification :: any).classify(execute_err)
            local _, parks = (dependencies.round_outcome :: any).failure_phase(classified)
            if not parks then return nil, execute_err end
            terminal = classified
        end
        local after, after_err = read()
        if after_err then return nil, after_err end
        if not after then return { stamp = false, state = "removed" }, nil end
        local result = (executed or {}) :: Map
        if (after :: Map).pending_command_id ~= nil then
            return { stamp = false, state = "pending", request_id = (after :: Map).pending_command_id,
                next_attempt_at = result.next_attempt_at, error = result.error }, nil
        end
        if terminal ~= nil then
            return { stamp = true, state = "failed", error = { kind = terminal.kind, message = terminal.message } }, nil
        end
        return { stamp = true, state = result.state or "none", request_id = result.request_id }, nil
    end

    -- dispatch({ limit? }) -> one command, slot and owner-retention pass.
    function M.dispatch(opts: any): (Map?, any)
        local policy, policy_err = (dependencies.policy :: any).policy()
        if policy_err then return nil, policy_err end
        local o: Map = type(opts) == "table" and opts or {}
        local limit = math.floor(tonumber(o.limit) or (policy :: Map).dispatcher_batch)
        local drive = dependencies.drive :: any
        local command = dependencies.command :: any
        local slot = dependencies.slot :: any
        local function repair_deadline(d: Map, failed: boolean): error?
            local _, err = P.in_automation_tx(function(tx: any): (any?, any)
                return drive.update_cas_tx(tx, d.automation_id, d.drive_key, d.wake_generation and { wake_generation = d.wake_generation } or {},
                    { repair_next_at = failed and drive.utc_after((policy :: Map).command_retry_after_ms) or (dependencies.sql :: any).NULL })
            end)
            return err
        end
        local counts: Map = { commands = 0, woken = 0, provisioned = 0,
            pruned = 0, pruned_ops = 0, pruned_prepared = 0,
            pruned_receipts = 0, pruned_orphan_ledger = 0, failures = 0 }

        local due, due_err = with_automation_db(function(db: any): (any?, any)
            return command.due(db, drive.utc_now(), limit)
        end)
        if due_err then return nil, due_err end
        for _, pending in ipairs(due :: { Map }) do
            local _, err = P.execute_pending(pending.automation_id, nil)
            counts.commands = counts.commands + 1
            if err then
                local current, read_err = with_automation_db(function(db: any): (any?, any)
                    return command.pending(db, pending.automation_id)
                end)
                if read_err then return nil, read_err end
                if current and current.next_attempt_at <= drive.utc_now() then
                    local _, defer_err = P.defer_command(current, (dependencies.failure_classification :: any).classify(err))
                    if defer_err then return nil, defer_err end
                end
                counts.failures = counts.failures + 1
                log_failure("pending command step failed", { automation_id = pending.automation_id,
                    request_id = pending.request_id, error = tostring(err) })
            end
        end

        local demand, demand_err = with_automation_db(function(db: any): (any?, any)
            return drive.wake_due(db, limit)
        end)
        if demand_err then return nil, demand_err end
        for _, d in ipairs(demand :: { Map }) do
            if type(d.job_id) == "string" and d.job_id ~= "" then
                local _, wake_err = slot.wake(d.job_id)
                if wake_err then
                    local retry_err = repair_deadline(d, true)
                    if retry_err then return nil, retry_err end
                    counts.failures = counts.failures + 1
                    log_failure("drive slot wake failed", { automation_id = d.automation_id, drive_key = d.drive_key,
                        job_id = d.job_id, error = tostring(wake_err) })
                else
                    local _, ack_err = P.in_automation_tx(function(tx: any): (any?, any)
                        return drive.ack_wake_tx(tx, d.automation_id, d.drive_key, d.wake_applied_generation, d.wake_generation)
                    end)
                    if ack_err then
                        local retry_err = repair_deadline(d, true)
                        if retry_err then return nil, retry_err end
                        counts.failures = counts.failures + 1
                        log_failure("drive wake acknowledgment failed", { automation_id = d.automation_id,
                            drive_key = d.drive_key, error = tostring(ack_err) })
                    else
                        local clear_err = repair_deadline(d, false)
                        if clear_err then return nil, clear_err end
                        counts.woken = counts.woken + 1
                    end
                end
            end
        end

        local missing, missing_err = with_automation_db(function(db: any): (any?, any)
            return drive.missing_slots(db, limit)
        end)
        if missing_err then return nil, missing_err end
        for _, d in ipairs(missing :: { Map }) do
            local _, provision_err = slot.provision(d.automation_id, d.drive_key)
            if provision_err then
                local retry_err = repair_deadline(d, true)
                if retry_err then return nil, retry_err end
                counts.failures = counts.failures + 1
                log_failure("drive slot provisioning failed", { automation_id = d.automation_id, drive_key = d.drive_key,
                    error = tostring(provision_err) })
            else
                local clear_err = repair_deadline(d, false)
                if clear_err then return nil, clear_err end
                counts.provisioned = counts.provisioned + 1
            end
        end
        local pin_due, pin_due_err = with_automation_db(function(db: any): (any?, any)
            return db:query("SELECT automation_id,drive_key FROM kickside_automation_drive"
                .. " WHERE pin_advance_cursor IS NOT NULL AND pin_next_at<=$1 ORDER BY pin_next_at,automation_id,drive_key LIMIT $2",
                { drive.utc_now(), limit })
        end)
        if pin_due_err then return nil, pin_due_err end
        counts.pins_advanced = 0
        for _, intent in ipairs(pin_due :: { Map }) do
            local d, read_err = with_automation_db(function(db: any): (any?, any)
                return drive.get(db, intent.automation_id, intent.drive_key)
            end)
            if read_err then return nil, read_err end
            if d then
                local raised, raise_err = P.advance_pin(d, drive.utc_now(), (policy :: Map).round_retry_after_ms)
                if raise_err then return nil, raise_err end
                if raised then counts.pins_advanced = (counts.pins_advanced :: integer) + 1 end
            end
        end

        local pruned, prune_err = (dependencies.automation_db :: any).in_tx(function(tx: any): (any?, any)
            local prepared_count, prepared_err = (dependencies.prepared_retention :: any).prune_orphans_tx(tx,
                drive.utc_after(-(policy :: Map).prepared_ms), limit)
            if prepared_err then return nil, prepared_err end
            local ledger_count, ledger_err = (dependencies.round_ledger :: any).prune_tx(tx, drive.utc_now(), limit)
            if ledger_err then return nil, ledger_err end
            local orphan_ledger_count, orphan_ledger_err = (dependencies.round_ledger :: any).prune_orphans_tx(tx,
                drive.utc_after(-(policy :: Map).ledger_resolved_ms), limit)
            if orphan_ledger_err then return nil, orphan_ledger_err end
            local op_count, op_err = command.prune_ops_tx(tx, drive.utc_after(-(policy :: Map).ops_ms), limit)
            if op_err then return nil, op_err end
            local receipt_count, receipt_err = (dependencies.receipt_retention :: any).prune_orphans_tx(tx,
                drive.utc_after(-(policy :: Map).receipts_ms), limit)
            if receipt_err then return nil, receipt_err end
            local _,history_err=(dependencies.round_history :: any).prune_tx(tx,drive.utc_now(),limit)
            if history_err then return nil,history_err end
            return { ledger = ledger_count, orphan_ledger = orphan_ledger_count, ops = op_count,
                prepared = prepared_count, receipts = receipt_count }, nil
        end)
        if prune_err then return nil, prune_err end
        counts.pruned = (pruned :: Map).ledger
        counts.pruned_orphan_ledger = (pruned :: Map).orphan_ledger
        counts.pruned_ops = (pruned :: Map).ops
        counts.pruned_prepared = (pruned :: Map).prepared
        counts.pruned_receipts = (pruned :: Map).receipts

        local now = drive.utc_now()
        local deadline, deadline_err = with_automation_db(function(db: any): (any?, any)
            local rows, err = db:query([[SELECT MIN(next_attempt_at) AS at, CAST(0 AS BIGINT) AS delay FROM kickside_automation_command
                WHERE pending_request_id IS NOT NULL AND pending_kind <> $1
                UNION ALL SELECT MIN(COALESCE(repair_next_at,$2)), 0 FROM kickside_automation_drive
                WHERE (job_id IS NOT NULL AND wake_generation > wake_applied_generation)
                   OR (job_id IS NULL AND pending_command_id IS NULL AND source_kind <> 'none')
                UNION ALL SELECT MIN(expires_at), 0 FROM kickside_trigger_item_ledger WHERE state='resolved'
                UNION ALL SELECT MIN(expires_at), 0 FROM kickside_automation_delivery_history
                UNION ALL SELECT MIN(updated_at), CAST($3 AS BIGINT) FROM kickside_trigger_item_ledger l WHERE state IN ('resolved','dead')
                  AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=l.owner_id)
                  AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c WHERE c.automation_id=l.owner_id AND c.pending_request_id IS NOT NULL)
                UNION ALL SELECT MIN(CASE WHEN created_at > completed_at THEN created_at ELSE completed_at END), CAST($4 AS BIGINT)
                  FROM kickside_automation_op WHERE state IN ('succeeded','failed','superseded')
                UNION ALL SELECT MIN(created_at), CAST($5 AS BIGINT) FROM kickside_automation_prepared p
                  WHERE NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=p.automation_id)
                  AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c WHERE c.automation_id=p.automation_id AND c.pending_request_id IS NOT NULL)
                  AND NOT EXISTS (SELECT 1 FROM kickside_trigger_item_ledger l WHERE l.owner_id=p.automation_id AND l.state NOT IN ('resolved','dead'))
                UNION ALL SELECT MIN(updated_at), CAST($6 AS BIGINT) FROM kickside_automation_receipt r WHERE dest_ref_json IS NULL
                  AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=r.owner_id)
                  AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c WHERE c.automation_id=r.owner_id AND c.pending_request_id IS NOT NULL)]],
                { command.OWNER_DELETE_KIND, now, (policy :: Map).ledger_resolved_ms, (policy :: Map).ops_ms, (policy :: Map).prepared_ms, (policy :: Map).receipts_ms })
            if err then return nil, err end
            local earliest: string? = nil
            for _, row in ipairs(rows :: { Map }) do
                if row.at ~= nil then
                    local parsed, parse_err = (dependencies.time :: any).parse((dependencies.time :: any).RFC3339, tostring(row.at))
                    if parse_err then return nil, parse_err end
                    local at = parsed:utc():add((tonumber(row.delay) or 0) * (dependencies.time :: any).MILLISECOND):format((dependencies.time :: any).RFC3339)
                    if at < now then at = now end
                    if earliest == nil or at < earliest then earliest = at end
                end
            end
            return earliest, nil
        end)
        if deadline_err then return nil, deadline_err end
        local pin_deadline, pin_deadline_err = with_automation_db(function(db: any): (any?, any)
            return db:query("SELECT MIN(pin_next_at) AS next_at FROM kickside_automation_drive WHERE pin_advance_cursor IS NOT NULL")
        end)
        if pin_deadline_err then return nil, pin_deadline_err end
        local next_pin = (pin_deadline :: { Map })[1].next_at
        if next_pin ~= nil and (deadline == nil or next_pin < deadline) then deadline = next_pin end
        counts.next_deadline = deadline
        return counts, nil
    end
end

return part
