-- Automation status and health (design v4 §5.1, §6.2; CONTRACTS §19): the read
-- model over drive and command state. status pages one automation's drives in
-- stable drive_key order with its command state and drive counters; health
-- aggregates the caller's readable automations. Both require READ.

local automation_types = require("types")
local support = require("engine_support")
local errors = require("errors")
local history = require("history_reader")

type Map = { [string]: any }

local part = {}

local DEFAULT_PAGE_SIZE = 50
local MAX_PAGE_SIZE = 1000
-- Readable automations are listed and aggregated in bounded chunks.
local LIST_CHUNK = 500
local AGGREGATE_CHUNK = 200

-- The public projection of a drive: position, phase, fences and counters.
-- The applied declaration, round token and occurrence payload stay private.
local function public_drive(row: Map, json_mod: any): Map
    local last_error: any = nil
    if type(row.last_error_json) == "string" and row.last_error_json ~= "" then
        last_error = select(1, json_mod.decode(row.last_error_json))
    end
    return {
        drive_key = row.drive_key,
        source_kind = row.source_kind,
        phase = row.phase,
        enabled = row.enabled,
        revision = row.revision,
        command_generation = row.command_generation,
        pending_command_id = row.pending_command_id,
        next_run_at = row.next_run_at,
        last_round_at = row.last_round_at,
        last_run_at = row.source_kind == "timer" and (tonumber(row.last_committed_occurrence_seq) or 0) > 0
            and row.last_round_at or nil,
        unresolved_count = row.unresolved_count or 0,
        uncertain_count = row.uncertain_count or 0,
        wake_pending = (row.wake_generation or 0) > (row.wake_applied_generation or 0),
        last_error = last_error,
    }
end

-- "$from, ..., $(from + n - 1)". Placeholders number in the order they
-- appear in the statement: SQLite binds by position.
local function placeholders(from: integer, n: integer): string
    local out: { string } = {}
    for i = 1, n do out[i] = "$" .. tostring(from + i - 1) end
    return table.concat(out, ", ")
end

-- Retained terminal delivery failures are ledger facts, independent of whether
-- the drive can keep acquiring other items. One ranked read per bounded owner
-- chunk supplies both the count and the latest structured reason.
local function delivery_failures(db: any, ids: { string }): ({ [string]: Map }?, error?)
    local out: { [string]: Map } = {}
    for _, id in ipairs(ids) do out[id] = { count = 0 } end
    if #ids == 0 then return out, nil end
    local rows, err = db:query("SELECT owner_id,item_key,error_code,error_message,last_failed_at,total FROM ("
        .. " SELECT owner_id,item_key,error_code,error_message,last_failed_at,"
        .. " COUNT(*) OVER (PARTITION BY owner_id) AS total,"
        .. " ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY last_failed_at DESC,source_port,item_key,identity_key) AS position"
        .. " FROM kickside_trigger_item_ledger WHERE state='dead' AND owner_id IN (" .. placeholders(1, #ids) .. ")"
        .. ") AS failures WHERE position=1", ids)
    if err then return nil, support.automation_error("failed to read terminal delivery failures", errors.INTERNAL, err) end
    if type(rows) ~= "table" then
        return nil, support.automation_error("terminal delivery failure read returned no rows", errors.INTERNAL)
    end
    for _, row in ipairs(rows) do
        local count = tonumber(row.total)
        if type(count) ~= "number" then
            return nil, support.automation_error("terminal delivery failure count is not a number", errors.INTERNAL)
        end
        out[tostring(row.owner_id)] = { count = math.floor(count),
            last_error = { code = row.error_code, message = row.error_message, at = row.last_failed_at, item_key = row.item_key } }
    end
    return out, nil
end

-- attach(M, dependencies, P) defines M.status and M.health, and publishes
-- P.drive_statuses for the automation listing.
function part.attach(M: any, dependencies: any, P: any): ()
    local automation_error = support.automation_error

    function M.get_execution_identity(component_id: string): (Map?, any)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, automation_error("automation id is required", errors.INVALID)
        end
        if not (dependencies.security :: any).actor() then
            return nil, automation_error("an authenticated operator is required", errors.PERMISSION_DENIED)
        end
        local component = dependencies.component :: any
        local _, access_err = component.validate_access(component_id, component.ACCESS.ADMIN)
        if access_err then return nil, access_err end
        local receipt, receipt_err = component.get_identity_receipt(component_id)
        if receipt_err then return nil, receipt_err end
        if type(receipt) ~= "table" or receipt.component_id ~= component_id
            or type(receipt.identity_generation) ~= "number" or receipt.identity_generation < 0
            or receipt.identity_generation ~= math.floor(receipt.identity_generation) then
            return nil, automation_error("invalid execution identity receipt", errors.INVALID)
        end
        local valid, identity_err = (dependencies.execution_identity :: any).validate(receipt.execution_identity)
        if not valid then return nil, identity_err end
        local identity = receipt.execution_identity
        return {principal = {kind = identity.principal.kind, id = identity.principal.id},
            authorized_by = {kind = identity.authorized_by.kind, id = identity.authorized_by.id},
            identity_generation = receipt.identity_generation}, nil
    end

    local function read_executor(work: (any) -> (any?, any)): (any?, any)
        local db, db_err = (dependencies.sql :: any).get(automation_types.db_id())
        if db_err or not db then return nil, automation_error("automation database unavailable", errors.UNAVAILABLE, db_err) end
        local result, err = work(db)
        db:release()
        return result, err
    end

    function P.routes_from_source(opts: any): (Map?, any)
        return read_executor(function(db: any): (any?, any)
            local rows, err = (dependencies.drive :: any).by_source(db, opts.source_thread_id)
            if err then return nil, err end
            local out: Map = {}
            for _, row in ipairs(rows) do
                local action = row.action or {}
                local declaration = row.applied and row.applied.declaration or {}
                local trigger = declaration.trigger or {}
                local filter = trigger.filter and trigger.filter.expr or nil
                if action.source_ref == opts.source_port
                    and (opts.source_filter == nil or filter == opts.source_filter) then
                    local id = tostring(row.automation_id)
                    out[id] = out[id] or {}
                    table.insert(out[id], {drive_key = row.drive_key, source_port = action.source_ref,
                        source_thread_id = row.source_thread_id, source_filter = filter,
                        sink_port = declaration.sink_port, sink_config = declaration.sink_config})
                end
            end
            return out, nil
        end)
    end

    function P.owned_automation_ids(): ({ string }?, any)
        return read_executor(function(db: any): ({ string }?, any)
            return (dependencies.command :: any).ids(db)
        end)
    end

    function M.history(component_id: string, opts: any): (Map?, any)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, automation_error("automation id is required", errors.INVALID)
        end
        local actor, actor_err = (dependencies.security :: any).actor()
        if actor_err then return nil, actor_err end
        if not actor then return nil, automation_error("an authenticated operator is required", errors.PERMISSION_DENIED) end
        local component = dependencies.component :: any
        local _, access_err = component.validate_access(component_id, component.ACCESS.ADMIN)
        if access_err then return nil, access_err end
        return read_executor(function(db: any): (any?, any)
            return history.list(db, component_id, opts, (dependencies.execution_identity :: any).validate)
        end)
    end

    -- Read the canonical drive, command and ledger status.
    function M.status(component_id: string, opts: any): (Map?, error?)
        if type(component_id) ~= "string" or component_id == "" then
            return nil, automation_error("automation id is required", errors.INVALID)
        end
        local o: Map = type(opts) == "table" and opts or {}
        local page_size = o.page_size == nil and DEFAULT_PAGE_SIZE or tonumber(o.page_size)
        if page_size == nil or page_size < 1 or page_size > MAX_PAGE_SIZE or page_size ~= math.floor(page_size) then
            return nil, automation_error("page_size must be an integer in [1, " .. tostring(MAX_PAGE_SIZE) .. "]", errors.INVALID)
        end
        if o.page_token ~= nil and (type(o.page_token) ~= "string" or o.page_token == "") then
            return nil, automation_error("page_token must be a non-empty string", errors.INVALID)
        end
        local component = dependencies.component :: automation_types.ComponentModule
        local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
        if access_err then return nil, access_err end

        local drive = dependencies.drive :: any
        local command = dependencies.command :: any
        local json_mod = dependencies.json :: any
        return read_executor(function(db: any): (any?, any)
            local rows, next_key, list_err = drive.list(db, component_id, { after_key = o.page_token, limit = page_size })
            if list_err then return nil, list_err end
            local drives: { Map } = {}
            for _, row in ipairs(rows or {}) do drives[#drives + 1] = public_drive(row, json_mod) end
            local state, state_err = command.state(db, component_id)
            if state_err or not state then return nil, state_err end
            local counts, count_err = db:query("SELECT COALESCE(SUM(unresolved_count), 0) AS unresolved,"
                .. " COALESCE(SUM(uncertain_count), 0) AS uncertain FROM " .. drive.TABLE .. " WHERE automation_id = $1",
                { component_id })
            if count_err then return nil, automation_error("failed to count drive items", errors.INTERNAL, count_err) end
            local count_row = (counts :: { Map })[1] or {}
            local pending: Map? = nil
            if type(state.pending) == "table" then
                local p = state.pending :: Map
                pending = {
                    request_id = p.request_id,
                    kind = p.kind,
                    generation = p.generation,
                    step = p.step,
                    next_attempt_at = p.next_attempt_at,
                    last_error = p.last_error,
                    drive_keys = p.drive_keys,
                }
            end
            local failures, failure_err = delivery_failures(db, { component_id })
            if failure_err or not failures then return nil, failure_err end
            return {
                drives = drives,
                delivery_failures = failures[component_id],
                commands = { generation = state.generation, pending = pending },
                ledger_counts = {
                    unresolved = math.floor(tonumber(count_row.unresolved) or 0),
                    uncertain = math.floor(tonumber(count_row.uncertain) or 0),
                },
                next_page_token = next_key,
            }, nil
        end)
    end

    -- drive_statuses(ids) -> { [automation_id] = { drives } }: the
    -- drive projection the status action answers, for
    -- listed automations the caller already reads, per chunk.
    function P.drive_statuses(ids: { string }): ({ [string]: Map }?, any)
        local drive = dependencies.drive :: any
        local json_mod = dependencies.json :: any
        local out: { [string]: Map } = {}
        for _, id in ipairs(ids) do out[id] = { drives = {} } end
        local _, read_err = read_executor(function(db: any): (any?, any)
            for first = 1, #ids, AGGREGATE_CHUNK do
                local chunk: { string } = {}
                for i = first, math.min(first + AGGREGATE_CHUNK - 1, #ids) do chunk[#chunk + 1] = ids[i] end
                local failures, failure_err = delivery_failures(db, chunk)
                if failure_err or not failures then return nil, failure_err end
                for _, id in ipairs(chunk) do out[id].delivery_failures = failures[id] end
                local rows, list_err = drive.list_for(db, chunk)
                if list_err then return nil, list_err end
                for _, row in ipairs(rows :: { Map }) do
                    local drives = (out[tostring(row.automation_id)] :: Map).drives :: { Map }
                    drives[#drives + 1] = public_drive(row, json_mod)
                end
            end
            return true, nil
        end)
        if read_err then return nil, read_err end
        return out, nil
    end

    -- The ids of every automation the caller can READ.
    local function readable_ids(actor_id: string): ({ string }?, any)
        local impl_ids, impl_err = P.automation_binding_ids()
        if impl_err or not impl_ids then return nil, impl_err end
        if #impl_ids == 0 then return {}, nil end
        local component = dependencies.component :: automation_types.ComponentModule
        local ids: { string } = {}
        local offset = 0
        while true do
            local rows, query_err = component.query({
                actor_id = actor_id,
                impl_ids = impl_ids,
                access_mask = component.ACCESS.READ,
                include = { meta = true },
                order_by = { field = "created_at", direction = "ASC" },
                limit = LIST_CHUNK,
                offset = offset,
            })
            if query_err then return nil, query_err end
            local page = (rows or {}) :: { automation_types.ComponentRow }
            for _, row in ipairs(page) do
                ids[#ids + 1] = tostring(row.component_id)
            end
            if #page < LIST_CHUNK then break end
            offset = offset + LIST_CHUNK
        end
        return ids, nil
    end

    local function overdue_cutoff(): (string?, any)
        local policy, policy_err = (dependencies.jobs_config :: any).policy()
        if policy_err or not policy then return nil, policy_err end
        local time_mod = dependencies.time :: any
        local cutoff = time_mod.now():add(-(policy :: Map).health_overdue_grace_ms * time_mod.MILLISECOND)
        return cutoff:utc():format(time_mod.RFC3339), nil
    end

    -- health() -> { degraded_drives, uncertain_items, oldest_pending_command_ms?,
    -- overdue_count } over the caller's readable
    -- automations.
    function M.health(): (Map?, error?)
        local actor = (dependencies.security :: any).actor()
        local actor_id = actor and actor:id() or nil
        if type(actor_id) ~= "string" or actor_id == "" then
            return nil, automation_error("an authenticated actor is required to read automation health", errors.PERMISSION_DENIED)
        end
        local ids, ids_err = readable_ids(actor_id :: string)
        if ids_err or not ids then return nil, ids_err end
        local cutoff, cutoff_err = overdue_cutoff()
        if cutoff_err or not cutoff then return nil, cutoff_err end

        local drive = dependencies.drive :: any
        local command = dependencies.command :: any
        local out: Map = { degraded_drives = 0, uncertain_items = 0, overdue_count = 0, dead_items = 0, delivery_failures = {} }
        local oldest: string? = nil
        local oldest_overdue: string? = nil
        local _, read_err = read_executor(function(db: any): (any?, any)
            for first = 1, #(ids :: { string }), AGGREGATE_CHUNK do
                local chunk: { any } = {}
                for i = first, math.min(first + AGGREGATE_CHUNK - 1, #(ids :: { string })) do chunk[#chunk + 1] = (ids :: { string })[i] end
                local params: { any } = { drive.PHASE.DEGRADED, cutoff }
                for _, id in ipairs(chunk) do params[#params + 1] = id end
                local drives, drive_err = db:query("SELECT"
                    .. " COALESCE(SUM(CASE WHEN phase = $1 THEN 1 ELSE 0 END), 0) AS degraded,"
                    .. " COALESCE(SUM(uncertain_count), 0) AS uncertain,"
                    .. " COALESCE(SUM(CASE WHEN next_run_at IS NOT NULL AND next_run_at < $2 THEN 1 ELSE 0 END), 0) AS overdue,"
                    .. " MIN(CASE WHEN next_run_at IS NOT NULL AND next_run_at < $2 THEN next_run_at END) AS oldest_overdue"
                    .. " FROM " .. drive.TABLE .. " WHERE automation_id IN (" .. placeholders(3, #chunk) .. ")", params)
                if drive_err then return nil, automation_error("failed to aggregate drive health", errors.INTERNAL, drive_err) end
                local row = (drives :: { Map })[1] or {}
                out.degraded_drives = out.degraded_drives + math.floor(tonumber(row.degraded) or 0)
                out.uncertain_items = out.uncertain_items + math.floor(tonumber(row.uncertain) or 0)
                out.overdue_count = out.overdue_count + math.floor(tonumber(row.overdue) or 0)
                local overdue_at = row.oldest_overdue
                if type(overdue_at) == "string" and overdue_at ~= "" and (oldest_overdue == nil or overdue_at < oldest_overdue) then
                    oldest_overdue = overdue_at
                end

                local failures, failure_err = delivery_failures(db, chunk)
                if failure_err or not failures then return nil, failure_err end
                for _, id in ipairs(chunk) do
                    local failure = failures[id]
                    out.dead_items = out.dead_items + failure.count
                    if failure.count > 0 then
                        out.delivery_failures[#out.delivery_failures + 1] = { automation_id = id,
                            count = failure.count, last_error = failure.last_error }
                    end
                end

                local pending, pending_err = db:query("SELECT MIN(o.created_at) AS oldest FROM " .. command.TABLE .. " c"
                    .. " JOIN " .. command.OP_TABLE .. " o ON o.automation_id = c.automation_id AND o.request_id = c.pending_request_id"
                    .. " WHERE c.pending_request_id IS NOT NULL AND c.automation_id IN (" .. placeholders(1, #chunk) .. ")", chunk)
                if pending_err then return nil, automation_error("failed to read pending commands", errors.INTERNAL, pending_err) end
                local candidate = ((pending :: { Map })[1] or {}).oldest
                if type(candidate) == "string" and candidate ~= "" and (oldest == nil or candidate < oldest) then
                    oldest = candidate
                end
            end
            return true, nil
        end)
        if read_err then return nil, read_err end
        if oldest then
            local time_mod = dependencies.time :: any
            local reserved_at, parse_err = time_mod.parse(time_mod.RFC3339, oldest)
            if parse_err or not reserved_at then
                return nil, automation_error("pending command time is not RFC3339: " .. tostring(oldest), errors.INTERNAL, parse_err)
            end
            local age = time_mod.now():sub(reserved_at)
            out.oldest_pending_command_ms = math.max(0, math.floor((age :: any):milliseconds()))
        end
        -- A drive due past the overdue grace has a round no worker has run:
        -- the execution backlog is an error, not a quiet counter.
        local issues: { Map } = {}
        if oldest_overdue then
            local time_mod = dependencies.time :: any
            local due_at, parse_err = time_mod.parse(time_mod.RFC3339, oldest_overdue)
            if parse_err or not due_at then
                return nil, automation_error("drive next_run_at is not RFC3339: " .. tostring(oldest_overdue), errors.INTERNAL, parse_err)
            end
            out.oldest_overdue_ms = math.max(0, math.floor((time_mod.now():sub(due_at) :: any):milliseconds()))
        end
        if out.overdue_count > 0 then
            issues[#issues + 1] = { code = "rounds_overdue", count = out.overdue_count, oldest_overdue_ms = out.oldest_overdue_ms,
                message = "automation rounds are due past the overdue grace and have not run" }
        end
        if out.degraded_drives > 0 then
            issues[#issues + 1] = { code = "drives_degraded", count = out.degraded_drives,
                message = "automation drives are degraded" }
        end
        if out.dead_items > 0 then
            issues[#issues + 1] = { code = "deliveries_failed", count = out.dead_items,
                message = "automation deliveries failed permanently" }
        end
        out.issues = issues
        out.healthy = #issues == 0
        return out, nil
    end
end

return part
