-- The automation component's deletable owner path. Fence every drive through
-- its command stream before crossing into core pins, jobs slots and rollback;
-- only then remove the automation DB's owned rows in one transaction. The
-- records a sync wrote belong to their destination and stay there: the owner
-- delete discards the automation's own map to them (its receipts) and reports
-- each mapped one as receipt_mapped, like every other discarded class (A48).

local sql = require("sql")
local json = require("json")
local automation_db = require("automation_db")
local drive = require("drive")
local command = require("command")
local retention_pin = require("retention_pin")
local core_db = require("core_db")
local slot_purge = require("slot_purge")
local automations_lib = require("automations_lib")

local M = {}
type Map = { [string]: any }

local DELETE_KIND = command.OWNER_DELETE_KIND
local DELETE_FLOOR = "9999-12-31T23:59:59Z"

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function internal(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = errors.INTERNAL,
        retryable = true }) :: error)
end

local function fenced(id: string): (Map?, error?)
    return automation_db.in_tx(function(tx: any): (any?, error?)
        local pending, pending_err = command.pending(tx, id)
        if pending_err then return nil, pending_err end
        local request_id = "owner-delete:" .. id
        local generation: integer
        local prior_pins: { Map } = {}
        local prior_request_id: string? = nil
        local pin_cursor = 0
        local rollback_done = false
        if pending and (pending :: Map).request_id == request_id and (pending :: Map).kind == DELETE_KIND then
            local dialect, dialect_err = tx:db_type()
            if dialect_err or not dialect then return nil, internal("owner command dialect unavailable", dialect_err) end
            local lock_sql = "SELECT generation FROM kickside_automation_command WHERE automation_id=$1"
            if tostring(dialect) ~= sql.type.SQLITE then lock_sql = lock_sql .. " FOR UPDATE" end
            local locked, lock_err = tx:query(lock_sql, { id })
            if lock_err or type(locked) ~= "table" or not locked[1] then
                return nil, internal("owner command lock failed", lock_err or "missing result")
            end
            pending, pending_err = command.pending(tx, id)
            if pending_err or not pending or (pending :: Map).request_id ~= request_id then
                return nil, pending_err or internal("owner command changed under lock", id)
            end
            local input = (pending :: Map).input
            prior_pins = type(input) == "table" and input.prior_pins or {}
            prior_request_id = type(input) == "table" and input.prior_request_id or nil
            pin_cursor = type(input) == "table" and tonumber(input.pin_cursor) or 0
            generation = (pending :: Map).generation
            rollback_done = (pending :: Map).step == "rollback_done"
        else
            local old_input = pending and (pending :: Map).input or nil
            prior_pins = type(old_input) == "table" and old_input.pins or {}
            prior_request_id = pending and (pending :: Map).request_id or nil
            local request = { automation_id = id, request_id = request_id, digest = request_id,
                kind = DELETE_KIND, drive_keys = {}, next_attempt_at = DELETE_FLOOR,
                input = { prior_pins = prior_pins, prior_request_id = prior_request_id, pin_cursor = 0 } }
            local reserved, reserve_err
            if pending then reserved, reserve_err = command.supersede_tx(tx, request, (pending :: Map).request_id)
            else reserved, reserve_err = command.reserve_tx(tx, request) end
            if reserve_err or not reserved then return nil, reserve_err end
            generation = (reserved :: Map).generation
        end
        local unfenced, read_err = tx:query("SELECT drive_key FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 AND (pending_command_id IS NULL OR pending_command_id<>$2"
            .. " OR command_generation<>$3) ORDER BY drive_key LIMIT 101", { id, request_id, generation })
        if read_err or type(unfenced) ~= "table" then
            return nil, internal("owner drive fence page read failed", read_err or "missing result")
        end
        local keys: { string } = {}
        for i = 1, math.min(#unfenced, 100) do keys[#keys + 1] = tostring(unfenced[i].drive_key) end
        local _, drive_lock_err = drive.lock_tx(tx, id, keys)
        if drive_lock_err then return nil, drive_lock_err end
        local drive_fence_err = drive.fence_for_command_tx(tx, id, keys, request_id, generation)
        if drive_fence_err then return nil, drive_fence_err end
        local one, more_key, drive_err = drive.list(tx, id, { limit = 1 })
        if drive_err then return nil, drive_err end
        return { drives = one, more_drives = more_key ~= nil, fence_pending = #unfenced > 100,
            generation = generation, pins = prior_pins, prior_request_id = prior_request_id,
            pin_cursor = pin_cursor,
            rollback_done = rollback_done }, nil
    end)
end

local function continuation(message: string): error
    return (errors.new({ message = message, kind = errors.CONFLICT, retryable = true,
        details = { cleanup_pending = true, needs_continue = true } }) :: error)
end

-- Locks the owner-delete command row the page was fenced under. A peer that
-- finished or superseded the command leaves this page stale; the continuation
-- re-fences from the committed state.
local function hold_command(tx: any, id: string, generation: integer): error?
    local dialect, dialect_err = tx:db_type()
    if dialect_err or not dialect then return internal("owner command dialect unavailable", dialect_err) end
    local lock = tostring(dialect) == sql.type.SQLITE and "" or " FOR UPDATE"
    local rows, read_err = tx:query("SELECT generation,pending_request_id,pending_kind FROM"
        .. " kickside_automation_command WHERE automation_id=$1" .. lock, { id })
    if read_err or type(rows) ~= "table" then
        return internal("owner command lock failed", read_err or "missing result")
    end
    local row = rows[1]
    if not row or tonumber(row.generation) ~= generation or row.pending_request_id ~= "owner-delete:" .. id
        or row.pending_kind ~= DELETE_KIND then
        return continuation("automation owner delete page is stale")
    end
    return nil
end

local function pins_for(id: string, state: Map): { Map }
    local seen: { [string]: boolean } = {}
    local pins: { Map } = {}
    local function add(thread_id: any, consumer_key: any, generation: any): ()
        if type(thread_id) ~= "string" or thread_id == "" or type(consumer_key) ~= "string" or consumer_key == "" then return end
        local identity = thread_id .. "\0" .. consumer_key
        if seen[identity] then return end
        seen[identity] = true
        pins[#pins + 1] = { thread_id = thread_id, consumer_key = consumer_key, generation = generation }
    end
    for _, row in ipairs(state.drives :: { Map }) do
        if row.source_kind == "event" and row.pin_generation ~= nil then
            add(row.source_thread_id, "drive:" .. id .. ":" .. tostring(row.drive_key), row.pin_generation)
        end
    end
    for _, spec in ipairs(state.pins :: { Map }) do
        if type(spec) == "table" then add(spec.thread_id, spec.consumer_key, spec.pin_generation) end
    end
    table.sort(pins, function(a: Map, b: Map): boolean
        if a.thread_id ~= b.thread_id then return a.thread_id < b.thread_id end
        return a.consumer_key < b.consumer_key
    end)
    return pins
end

local function release_pins(id: string, state: Map): error?
    local pins = pins_for(id, state)
    if #pins == 0 then return nil end
    local core, core_err = sql.get(core_db.id())
    if core_err or not core then return internal("core pin database unavailable", core_err) end
    local tx, begin_err = core:begin()
    if begin_err or not tx then core:release(); return internal("core pin transaction failed", begin_err) end
    for _, spec in ipairs(pins) do
        local current, read_err = retention_pin.read(tx, spec.thread_id, spec.consumer_key)
        if read_err then tx:rollback(); core:release(); return read_err end
        local terminal_id = current and current.command_id or state.prior_request_id
        if terminal_id ~= nil then
            -- No live pin means the initial generation is the floor for a
            -- tombstone against the captured old pending command. A released
            -- pin with no pending predecessor already has its own tombstone.
            local generation = current and current.generation or spec.generation or 1
            local _, cleanup_err = retention_pin.cleanup_tombstone_tx(tx, {
                thread_id = spec.thread_id, consumer_key = spec.consumer_key,
                command_id = "owner-delete:" .. id, command_generation = state.generation,
                expected_pin_generation = generation, terminal_op_id = terminal_id,
            })
            if cleanup_err then tx:rollback(); core:release(); return cleanup_err end
        end
    end
    local _, commit_err = tx:commit()
    core:release()
    if commit_err then return internal("core pin release commit failed", commit_err) end
    return nil
end

local function purge_rows(id: string, generation: integer): (Map?, error?)
    return automation_db.in_tx(function(tx: any): (any?, error?)
        local hold_err = hold_command(tx, id, generation)
        if hold_err then return nil, hold_err end
        local command_rows, command_err = tx:query("SELECT pending_input_json FROM kickside_automation_command"
            .. " WHERE automation_id=$1", { id })
        if command_err or type(command_rows) ~= "table" or not command_rows[1] then
            return nil, internal("owner count pointer unavailable", command_err or "missing result")
        end
        local input, decode_err = json.decode(tostring(command_rows[1].pending_input_json))
        if decode_err or type(input) ~= "table" then
            return nil, internal("owner count pointer corrupt", decode_err or "missing input")
        end
        local discarded: Map = (input :: Map).discarded or { ledger_unresolved = 0, prepared_unsettled = 0,
            op_pending = 0, command_pending = 0, receipt_mapped = 0 }
        for _, class in ipairs({ "ledger_unresolved", "prepared_unsettled", "op_pending",
            "command_pending", "receipt_mapped" }) do
            if type(discarded[class]) ~= "number" or discarded[class] < 0 then
                return nil, internal("owner discard count corrupt", class)
            end
        end
        local removed = 0
        local remaining = 100
        for _, spec in ipairs({
            { "kickside_trigger_item_ledger", "owner_id", { "source_port", "item_key", "identity_key" }, "ledger_unresolved" },
            { "kickside_automation_receipt", "owner_id", { "source_port", "item_key", "map_slot" }, "receipt_mapped" },
            { "kickside_automation_prepared", "automation_id", { "idempotency_key" }, "prepared_unsettled" },
            { "kickside_automation_op", "automation_id", { "request_id" }, "op_pending" },
        }) do
            if remaining == 0 then break end
            local keys = spec[3] :: { string }
            local columns = table.concat(keys, ",")
            if spec[4] == "ledger_unresolved" or spec[4] == "op_pending" then columns = columns .. ",state" end
            if spec[4] == "prepared_unsettled" then columns = columns .. ",settled_at" end
            if spec[4] == "receipt_mapped" then columns = columns .. ",dest_ref_json" end
            local rows, read_err = tx:query("SELECT " .. columns .. " FROM " .. spec[1]
                .. " WHERE " .. spec[2] .. "=$1 ORDER BY " .. table.concat(keys, ",") .. " LIMIT $2", { id, remaining })
            if read_err or type(rows) ~= "table" then
                return nil, internal("automation owner page read failed for " .. spec[1], read_err or "missing result")
            end
            for _, row in ipairs(rows :: { Map }) do
                local args: { any } = { id }
                local terms: { string } = {}
                for i, key in ipairs(keys) do
                    args[#args + 1] = row[key]
                    terms[#terms + 1] = key .. "=$" .. tostring(i + 1)
                end
                local result, delete_err = tx:execute("DELETE FROM " .. spec[1] .. " WHERE " .. spec[2]
                    .. "=$1 AND " .. table.concat(terms, " AND "), args)
                if delete_err or not result or tonumber(result.rows_affected) ~= 1 then
                    return nil, internal("automation owner page delete failed for " .. spec[1], delete_err or "missing row proof")
                end
                local class = spec[4]
                if class == "ledger_unresolved" and row.state ~= "resolved" and row.state ~= "dead"
                    or class == "prepared_unsettled" and row.settled_at == nil
                    or class == "op_pending" and row.state == "pending"
                    or class == "receipt_mapped" and row.dest_ref_json ~= nil then
                    discarded[class] = discarded[class] + 1
                end
                removed = removed + 1
                remaining = remaining - 1
            end
        end
        local more = false
        for _, spec in ipairs({
            { "kickside_trigger_item_ledger", "owner_id" }, { "kickside_automation_receipt", "owner_id" },
            { "kickside_automation_prepared", "automation_id" }, { "kickside_automation_op", "automation_id" },
        }) do
            local rows, read_err = tx:query("SELECT 1 FROM " .. spec[1] .. " WHERE " .. spec[2] .. "=$1 LIMIT 1", { id })
            if read_err or type(rows) ~= "table" then
                return nil, internal("automation owner continuation read failed for " .. spec[1], read_err or "missing result")
            end
            if rows[1] then more = true end
        end
        local function stamp_counts(): error?
            (input :: Map).discarded = discarded
            local encoded, encode_err = json.encode(input)
            if encode_err or type(encoded) ~= "string" then return internal("owner count encode failed", encode_err) end
            local stamped, stamp_err = tx:execute("UPDATE kickside_automation_command SET pending_input_json=$1"
                .. " WHERE automation_id=$2", { encoded, id })
            if stamp_err or not stamped or tonumber(stamped.rows_affected) ~= 1 then
                return internal("owner count stamp failed", stamp_err or "missing row proof")
            end
            return nil
        end
        if more or remaining < 3 then
            local stamp_err = stamp_counts()
            if stamp_err then return nil, stamp_err end
            return { removed = removed, discarded = discarded, pending = true }, nil
        end
        local drives, drive_err = tx:query("SELECT drive_key FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 LIMIT 1", { id })
        if drive_err or type(drives) ~= "table" then
            return nil, internal("automation drive completion read failed", drive_err or "missing result")
        end
        if drives[1] then return nil, internal("automation drive survived owner page", id) end
        local rows, read_err = tx:query("SELECT pending_request_id FROM kickside_automation_command"
            .. " WHERE automation_id=$1", { id })
        if read_err or type(rows) ~= "table" then return nil, internal("automation command read failed", read_err or "missing result") end
        if rows[1] then
            if rows[1].pending_request_id ~= nil then discarded.command_pending = discarded.command_pending + 1 end
            local result, delete_err = tx:execute("DELETE FROM kickside_automation_command WHERE automation_id=$1", { id })
            if delete_err or not result or tonumber(result.rows_affected) ~= 1 then
                return nil, internal("automation command delete failed", delete_err or "missing row proof")
            end
            removed = removed + 1
        end
        return { removed = removed, discarded = discarded, pending = false }, nil
    end)
end

local function delete_fenced_drive(id: string, key: string, generation: integer): (boolean?, error?)
    return automation_db.in_tx(function(tx: any): (any?, error?)
        local hold_err = hold_command(tx, id, generation)
        if hold_err then return nil, hold_err end
        local result, delete_err = tx:execute("DELETE FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 AND drive_key=$2 AND pending_command_id=$3 AND command_generation=$4",
            { id, key, "owner-delete:" .. id, generation })
        if delete_err or not result then
            return nil, internal("automation fenced drive delete failed", delete_err or "missing result")
        end
        local rows, read_err = tx:query("SELECT drive_key FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 LIMIT 1", { id })
        if read_err or type(rows) ~= "table" then
            return nil, internal("automation next drive read failed", read_err or "missing result")
        end
        return rows[1] ~= nil, nil
    end)
end

local function advance_pin_cursor(id: string, generation: integer, state: Map, cursor: integer): error?
    local encoded, encode_err = json.encode({ prior_pins = state.pins,
        prior_request_id = state.prior_request_id, pin_cursor = cursor,
        discarded = state.discarded })
    if encode_err or type(encoded) ~= "string" then return internal("automation pin cursor encode failed", encode_err) end
    local _, stamp_err = automation_db.in_tx(function(tx: any): (any?, error?)
        local hold_err = hold_command(tx, id, generation)
        if hold_err then return nil, hold_err end
        local result, update_err = tx:execute("UPDATE kickside_automation_command SET pending_input_json=$1"
            .. " WHERE automation_id=$2 AND generation=$3 AND pending_request_id=$4",
            { encoded, id, generation, "owner-delete:" .. id })
        if update_err or not result or tonumber(result.rows_affected) ~= 1 then
            return nil, internal("automation pin cursor stamp failed", update_err or "missing row proof")
        end
        return true, nil
    end)
    return stamp_err
end

local function mark_rollback_done(id: string, generation: integer): error?
    local _, stamp_err = automation_db.in_tx(function(tx: any): (any?, error?)
        local hold_err = hold_command(tx, id, generation)
        if hold_err then return nil, hold_err end
        local result, update_err = tx:execute("UPDATE kickside_automation_command"
            .. " SET pending_step='rollback_done' WHERE automation_id=$1 AND generation=$2"
            .. " AND pending_request_id=$3 AND pending_kind=$4",
            { id, generation, "owner-delete:" .. id, DELETE_KIND })
        if update_err or not result or tonumber(result.rows_affected) ~= 1 then
            return nil, internal("automation rollback completion stamp failed", update_err or "missing row proof")
        end
        return true, nil
    end)
    return stamp_err
end

function M.delete(id: string, rollback: any?, options: any?): (Map?, error?)
    if type(id) ~= "string" or id == "" then return nil, invalid("automation_id is required") end
    local state, fence_err = fenced(id)
    if fence_err or not state then return nil, fence_err end
    if (state :: Map).fence_pending then
        return nil, continuation("automation drive fence has another bounded page")
    end
    local replayed = 0
    if not (state :: Map).rollback_done then
        local replay_opts: Map? = type(options) == "table" and { options = options } or nil
        local failed: integer = 0
        local replay_err: any
        replayed, failed, replay_err = automations_lib.replay(rollback or {}, replay_opts)
        if failed > 0 then
            if type(replay_err) == "userdata" then return nil, replay_err end
            return nil, internal("automation rollback incomplete", failed .. " step(s) failed: " .. tostring(replay_err))
        end
        local stamp_err = mark_rollback_done(id, (state :: Map).generation)
        if stamp_err then return nil, stamp_err end
    end
    local owned_drive = ((state :: Map).drives :: { Map })[1]
    if owned_drive then
        local pin_err = release_pins(id, { drives = { owned_drive }, pins = {},
            generation = (state :: Map).generation, prior_request_id = (state :: Map).prior_request_id })
        if pin_err then return nil, pin_err end
        local _, job_err = slot_purge.purge_slot({ namespace = "drive", scope = id, key = owned_drive.drive_key })
        if job_err then return nil, job_err end
        local more_drives, delete_err = delete_fenced_drive(id, tostring(owned_drive.drive_key), (state :: Map).generation)
        if delete_err then return nil, delete_err end
        if more_drives then
            return nil, continuation("automation drives have another bounded owner page")
        end
    end
    local cursor = math.floor(tonumber((state :: Map).pin_cursor) or 0)
    local prior_pins = (state :: Map).pins :: { Map }
    if cursor < #prior_pins then
        local pin_err = release_pins(id, { drives = {}, pins = { prior_pins[cursor + 1] },
            generation = (state :: Map).generation, prior_request_id = (state :: Map).prior_request_id })
        if pin_err then return nil, pin_err end
        local stamp_err = advance_pin_cursor(id, (state :: Map).generation, state :: Map, cursor + 1)
        if stamp_err then return nil, stamp_err end
        if cursor + 1 < #prior_pins then
            return nil, continuation("automation old pins have another bounded owner page")
        end
    end
    local summary, purge_err = purge_rows(id, (state :: Map).generation)
    if purge_err then return nil, purge_err end
    if (summary :: Map).pending then
        return nil, (errors.new({ message = "automation owner cleanup has another bounded page",
            kind = errors.CONFLICT, retryable = true, details = {
                cleanup_pending = true, needs_continue = true, discarded = (summary :: Map).discarded,
                removed = (summary :: Map).removed } }) :: error)
    end
    return { replayed = replayed, removed = (summary :: Map).removed,
        discarded = (summary :: Map).discarded }, nil
end

return M
