-- The drives a declaration creates (design v5 §4.1, §7.5; A22, A33): the main
-- drive over the declared source, its reconcile drive when the source declares
-- one.

local M = {}

type Map = { [string]: any }

-- The drive every installed automation starts with; the round runtime owns
-- what it acquires.
M.MAIN = "main"

-- The drive a collection source declaring reconcile = { pull_keys } adds.
M.RECONCILE = "reconcile"

-- The main drive with the source its install declares (A22): the source kind,
-- the source thread of an event source, and in the action the source port
-- (source_ref) with its event type, pull config and schedule, and the
-- declaration's round and delivery overrides of the drive policy (§8).
function M.main_drive(source: Map?, start_seq: integer): Map
    local s: Map = source or { source_kind = "none" }
    local action: Map = {}
    for _, field in ipairs({ "source_ref", "event_type", "config", "schedule", "round", "delivery" }) do
        if s[field] ~= nil then action[field] = s[field] end
    end
    return { drive_key = M.MAIN, source_kind = s.source_kind, source_thread_id = s.source_thread_id,
        enabled = true, action = action, event_seq = start_seq }
end

-- The reconcile drive a collection source declaring reconcile = { pull_keys }
-- gets (A33): it enumerates the source's keys through pull_keys and sweeps the
-- destinations whose keys vanished, first due one reconcile interval after
-- the declaration.

function M.reconcile_drive(source: Map, first_due: string?): Map
    return { drive_key = M.RECONCILE, source_kind = "reconcile", enabled = true, reconcile_next_at = first_due,
        action = { source_ref = source.source_ref, config = source.config, pull_keys = (source.reconcile :: Map).pull_keys } }
end

-- The drives an install creates: main, its reconcile drive when the source
-- declares one, in drive_key order.
function M.install_drives(main_source: Map?, start_seq: integer?, reconcile_due: string?,
    disabled: boolean?): { Map }
    local drives: { Map } = { M.main_drive(main_source, start_seq or 0) }
    if type(main_source) == "table" and type(main_source.reconcile) == "table" then
        drives[#drives + 1] = M.reconcile_drive(main_source :: Map, reconcile_due)
    end
    -- A kind installed disabled starts with its source drives paused.
    if disabled then
        for _, d in ipairs(drives) do
            d.enabled = false
            d.phase = "paused"
        end
    end
    table.sort(drives, function(a: Map, b: Map): boolean return a.drive_key < b.drive_key end)
    return drives
end

-- install_drive_keys(main_source) -> the drive keys an install
-- creates, in drive_key order.
function M.install_drive_keys(main_source: Map?): { string }
    local keys: { string } = {}
    for _, planned in ipairs(M.install_drives(main_source)) do keys[#keys + 1] = planned.drive_key end
    return keys
end

return M
