-- Stored declaration upgrade: brings an automation kind's stored declarations
-- to the current Trigger Spec v2 through the automation's own reconfigure
-- command, so the component declaration, its fence and every drive's applied
-- declaration advance together at the next command generation.
--
-- The upgraded declaration is derived from the stored one by the engine's
-- trigger rule alone. The command runs as the automation's execution subject,
-- the principal its drives already run as, as both operator and subject; the
-- declaration writer rechecks that principal's live grants. The command is
-- reserved over the command generation the stored declaration was read at,
-- so a reconfigure that lands in between makes it stale and the next run
-- derives the upgrade from that newer declaration. Its request id names the
-- upgraded declaration and that baseline: a replay of a pending or applied
-- attempt reads it back, and a run after a refused attempt starts a new one.
-- The main drive keeps its source; a legacy retry delay carried into
-- trigger.delivery is re-declared on the main drive's action, so its policy
-- applies the configured delay.

local support = require("engine_support")
local declaration_mod = require("engine_declaration")
local schema = require("engine_schema")
local drive_plan = require("engine_drive_plan")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

local PAGE = 100

function part.attach(M: any, dependencies: any, P: any): ()
    local EXECUTION_IDENTITY_KEY = support.EXECUTION_IDENTITY_KEY
    local PORTABLE_INPUT_KEY = support.PORTABLE_INPUT_KEY
    local automation_error = support.automation_error
    local with_automation_db = (dependencies.automation_db :: any).with_db

    -- baseline(component_id) -> the automation's last command generation and
    -- its pending command id, read before the stored declaration.
    local function baseline(component_id: string): (Map?, any)
        return with_automation_db(function(db: any): (any?, any)
            local state, state_err = (dependencies.command :: any).state(db, component_id)
            if state_err or not state then return nil, state_err end
            local pending = (state :: Map).pending
            return { generation = (state :: Map).generation,
                pending_request_id = type(pending) == "table" and (pending :: Map).request_id or nil }, nil
        end)
    end

    -- main_source_with_retry(component_id, retry_after_ms) -> the main drive's
    -- current source with delivery.retry_after_ms declared, and its reconcile
    -- over the same pull keys when the automation holds a reconcile drive.
    local function main_source_with_retry(component_id: string, retry_after_ms: any): (Map?, any)
        local drives, drives_err = with_automation_db(function(db: any): (any?, any)
            local drive = dependencies.drive :: any
            local main, main_err = drive.get(db, component_id, drive_plan.MAIN)
            if main_err then return nil, main_err end
            local reconcile, reconcile_err = drive.get(db, component_id, drive_plan.RECONCILE)
            if reconcile_err then return nil, reconcile_err end
            return { main = main, reconcile = reconcile }, nil
        end)
        if drives_err or not drives then return nil, drives_err end
        local main = (drives :: Map).main
        if type(main) ~= "table" then
            return nil, automation_error("automation " .. component_id .. " holds no main drive", errors.INVALID)
        end
        local action = type(main.action) == "table" and (main.action :: Map) or {}
        local source: Map = { source_kind = main.source_kind, source_thread_id = main.source_thread_id }
        for _, field in ipairs({ "source_ref", "event_type", "config", "schedule", "round" }) do
            source[field] = action[field]
        end
        local delivery: Map = {}
        for key, value in pairs(type(action.delivery) == "table" and (action.delivery :: Map) or {}) do delivery[key] = value end
        delivery.retry_after_ms = retry_after_ms
        source.delivery = delivery
        local reconcile = (drives :: Map).reconcile
        if type(reconcile) == "table" then
            local reconcile_action = type(reconcile.action) == "table" and (reconcile.action :: Map) or {}
            source.reconcile = { pull_keys = reconcile_action.pull_keys }
        end
        return source, nil
    end

    -- upgrade_one(component_id, type_id, inputs) -> { changes, generation?,
    -- pending_request_id? }: changes.removed is empty for a declaration
    -- already current; pending_request_id names a command the automation
    -- holds pending, which the upgrade waits behind.
    local function upgrade_one(component_id: string, type_id: string, inputs: any): (Map?, any)
        local base, base_err = baseline(component_id)
        if base_err or not base then return nil, base_err end
        local ctx, ctx_err = P.owned_context(component_id)
        if ctx_err or not ctx then return nil, ctx_err end
        local stored = (ctx :: Map)[PORTABLE_INPUT_KEY]
        if type(stored) ~= "table" then return { changes = { removed = {} } }, nil end
        local trigger, changes = declaration_mod.upgrade_trigger((stored :: Map).trigger)
        if #changes.removed == 0 then return { changes = changes }, nil end
        if (base :: Map).pending_request_id ~= nil then
            return { changes = changes, pending_request_id = (base :: Map).pending_request_id }, nil
        end
        local upgraded = support.portable_copy(stored) :: Map
        upgraded.trigger = trigger
        local input_err = schema.validate_install_input(inputs, upgraded)
        if input_err then return nil, input_err end
        local identity = (ctx :: Map)[EXECUTION_IDENTITY_KEY]
        if type(identity) ~= "table" or type((identity :: Map).principal) ~= "table" then
            return nil, automation_error("automation " .. component_id .. " has no execution identity", errors.INVALID)
        end
        local main_source: Map? = nil
        if changes.retry_after_ms ~= nil then
            local source, source_err = main_source_with_retry(component_id, changes.retry_after_ms)
            if source_err or not source then return nil, source_err end
            main_source = source
        end
        local subject_id = (dependencies.execution_identity :: any).actor_key((identity :: Map).principal)
        local digest, digest_err = (dependencies.canonical_json :: any).hash(upgraded)
        if digest_err or not digest then return nil, digest_err end
        local generation = (base :: Map).generation
        local applied, apply_err = P.run_declaration_command({
            kind = "reconfigure",
            request_id = "declaration-upgrade:" .. component_id .. ":" .. tostring(generation) .. ":" .. tostring(digest),
            expected_generation = generation,
            automation_id = component_id,
            operator_id = subject_id,
            subject_id = subject_id,
            operator_identity = identity,
            subject_identity = identity,
            type_id = type_id,
            schema = inputs,
            declaration = upgraded,
            main_source = main_source,
            writer = "kickside.automation:declaration_writer_apply",
            writer_args = {},
        })
        if apply_err or not applied then return nil, apply_err end
        return { changes = changes, generation = (applied :: Map).generation }, nil
    end

    -- upgrade_declarations(type_id) -> { upgraded, current, pending, failed }:
    -- every installed automation of the kind brought to the current
    -- declaration shape. upgraded lists { id, removed, generation,
    -- retry_after_ms?, superseded_retry_after_ms? }; pending lists { id,
    -- request_id } for an automation holding another command pending, which
    -- the next run upgrades; failed lists { id, error } for an automation whose
    -- upgrade is refused, which the next run retries; current counts the
    -- automations already current. Each change, wait and refusal is logged.
    function M.upgrade_declarations(type_id: string): (Map?, any)
        if type(type_id) ~= "string" or type_id == "" then
            return nil, automation_error("type_id is required", errors.INVALID)
        end
        local entry, entry_err = (dependencies.registry :: any).get(type_id)
        if entry_err then return nil, entry_err end
        if type(entry) ~= "table" or type(entry.meta) ~= "table" then
            return nil, automation_error("automation kind " .. type_id .. " is not registered", errors.NOT_FOUND)
        end
        local inputs = entry.meta.inputs
        local log = (dependencies.logger :: any):named("automation.upgrade")
        local report: Map = { upgraded = {}, current = 0, pending = {}, failed = {} }
        local offset = 0
        while true do
            local rows, rows_err = (dependencies.component :: any).list_system({ impl_ids = { type_id },
                limit = PAGE, offset = offset, order_by = { field = "created_at", direction = "ASC" } })
            if rows_err then return nil, rows_err end
            if type(rows) ~= "table" or #rows == 0 then break end
            for _, row in ipairs(rows) do
                local id = tostring(row.component_id)
                local result, err = upgrade_one(id, type_id, inputs)
                if err or not result then
                    report.failed[#report.failed + 1] = { id = id, error = tostring(err) }
                    log:error("stored declaration upgrade refused", { automation_id = id, type_id = type_id,
                        error = tostring(err) })
                elseif #result.changes.removed == 0 then
                    report.current = report.current + 1
                elseif result.pending_request_id ~= nil then
                    report.pending[#report.pending + 1] = { id = id, request_id = result.pending_request_id }
                    log:info("stored declaration upgrade waits behind a pending command", { automation_id = id,
                        type_id = type_id, request_id = result.pending_request_id })
                else
                    local changes = result.changes :: Map
                    report.upgraded[#report.upgraded + 1] = { id = id, removed = changes.removed,
                        generation = result.generation, retry_after_ms = changes.retry_after_ms,
                        superseded_retry_after_ms = changes.superseded_retry_after_ms }
                    log:info("stored declaration upgraded to the current trigger spec", { automation_id = id,
                        type_id = type_id, removed = table.concat(changes.removed, ","), generation = result.generation,
                        retry_after_ms = changes.retry_after_ms })
                    if changes.superseded_retry_after_ms ~= nil then
                        log:warn("legacy delivery retry delay set aside for the declared trigger.delivery.retry_after_ms",
                            { automation_id = id, type_id = type_id, legacy_retry_after_ms = changes.superseded_retry_after_ms })
                    end
                end
            end
            if #rows < PAGE then break end
            offset = offset + #rows
        end
        return report, nil
    end
end

return part
