-- OAuth owns refresh timing and durable Jobs wake demand for each connection.
local time = require("time")
local sql = require("sql")
local jobs = require("jobs")
local jobs_config = require("jobs_config")
local support = require("oauth_repo_support")
local M = {}
type Map = { [string]: any }
local TABLE = "kickside_oauth_connections"

local function unavailable(message: string, err: any): error
    return errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = message .. ": " .. tostring(err) })
end
local function now(): string return time.now():utc():format(time.RFC3339) end
local function with_db(fn: (any) -> (any?, any)): (any?, any)
    local db, err = support.get_db()
    if err or not db then return nil, unavailable("OAuth database unavailable", err) end
    local value, call_err = fn(db)
    db:release()
    return value, call_err
end

function M.deadline(expires_at: any, issued_at: any): (string?, error?)
    if expires_at == nil then return nil, nil end
    local expiry, issued = tonumber(expires_at), tonumber(issued_at)
    if not expiry or not issued then
        return nil, errors.new({ kind = errors.INVALID, retryable = false, message = "refresh expiry and issued_at must be numeric" })
    end
    local due = issued + math.floor((expiry - issued) * 0.75)
    return time.unix(math.floor(due), 0):utc():format(time.RFC3339), nil
end

function M.read(component_id: string): (Map?, any)
    return with_db(function(db: any): (any?, any)
        local rows, err = db:query("SELECT component_id,expires_at,refresh_issued_at,refresh_enabled,schedule_id,"
            .. " refresh_wake_generation,refresh_wake_applied_generation,refresh_retry_at FROM " .. TABLE .. " WHERE component_id=$1", { component_id })
        if err then return nil, err end
        local row = rows[1]
        if row then row.refresh_enabled = row.refresh_enabled == true or row.refresh_enabled == 1 end
        return row, nil
    end)
end

function M.connection_deadline(row: Map): (string?, any)
    if row.refresh_enabled == false or row.refresh_enabled == 0 or row.expires_at == nil then return nil, nil end
    local issued, err = time.parse(time.RFC3339, row.refresh_issued_at)
    if err or not issued then return nil, unavailable("invalid durable token issue time", err) end
    return M.deadline(row.expires_at, issued:unix())
end

-- Called in the same OAuth transaction as the token or authorization update.
function M.changed_tx(tx: any, component_id: string, issued_at: string?, refreshable: boolean?): any
    local enabled = "CASE WHEN connection_state<>'connected' THEN false ELSE refresh_enabled END"
    if refreshable ~= nil then
        enabled = "CASE WHEN connection_state='connected' THEN " .. (refreshable and "true" or "false") .. " ELSE false END"
    end
    local statement = "UPDATE " .. TABLE .. " SET refresh_wake_generation=refresh_wake_generation+1,refresh_retry_at=NULL,refresh_enabled=" .. enabled
    local params: { any } = {}
    if issued_at ~= nil then
        statement = statement .. ",refresh_issued_at=$1"
        params[#params + 1] = issued_at
    end
    params[#params + 1] = component_id
    local _, err = tx:execute(statement .. " WHERE component_id=$" .. tostring(#params), params)
    return err
end

function M.notify(): (any?, any)
    local slot, err = jobs.enqueue({ namespace = "oauth", scope = "maintenance", key = "refresh_dispatcher",
        owner_locator = { kind = "installation", id = "kickside.oauth" }, slot = true, parked = true,
        queue_tier = "maintenance", job_type = "kickside.oauth:dispatch_refresh", immutable_payload = {} })
    if err or not slot then return nil, err end
    return jobs.wake_job(slot.id, { control = true })
end

local function defer(row: Map, failure: any): (string?, any, boolean?)
    local policy, policy_err = jobs_config.policy()
    if policy_err or not policy then return nil, policy_err end
    local deadline = time.now():utc():add(policy.slot_retry_after_ms * time.MILLISECOND):format(time.RFC3339)
    local persisted, err = with_db(function(db: any): (any?, any)
        return db:execute("UPDATE " .. TABLE .. " SET refresh_retry_at=$1 WHERE component_id=$2 AND refresh_wake_generation=$3",
            { deadline, row.component_id, row.refresh_wake_generation })
    end)
    if err then return nil, err end
    if not persisted or tonumber(persisted.rows_affected) == nil then return nil, unavailable("refresh retry persistence returned no count", failure) end
    local _, wake_err = M.notify()
    if wake_err then return nil, wake_err, tonumber(persisted.rows_affected) == 1 end
    return nil, failure, tonumber(persisted.rows_affected) == 1
end

function M.arm(component_id: string): (string?, any, boolean?)
    local row, read_err = M.read(component_id)
    if read_err then return nil, read_err end
    if not row then return nil, errors.new({ kind = errors.NOT_FOUND, retryable = false, message = "OAuth connection not found" }) end
    local r = row :: Map
    if r.refresh_wake_generation == r.refresh_wake_applied_generation then return r.schedule_id, nil end
    local deadline, deadline_err = M.connection_deadline(r)
    if deadline_err then return defer(r, deadline_err) end
    local job_id: any = nil
    do
        local slot, enqueue_err = jobs.enqueue({ namespace = "oauth", scope = "refresh", key = component_id,
            owner_locator = { kind = "connection", id = component_id }, slot = true,
            job_type = "kickside.oauth:refresh_connection", immutable_payload = { component_id = component_id },
            scheduled_at = deadline, parked = deadline == nil })
        if enqueue_err or not slot then return defer(r, enqueue_err) end
        job_id = slot.id
        if not deadline then
            local _, cancel_err = jobs.cancel(job_id)
            if cancel_err then return defer(r, cancel_err) end
        elseif slot.existing then
            local _, wake_err = jobs.wake_job(job_id, { control = true })
            if wake_err then return defer(r, wake_err) end
        end
    end
    local ack, ack_err = with_db(function(db: any): (any?, any)
        return db:execute("UPDATE " .. TABLE .. " SET schedule_id=$1,refresh_wake_applied_generation=$2,refresh_retry_at=NULL"
            .. " WHERE component_id=$3 AND refresh_wake_generation=$4",
            { job_id or sql.NULL, r.refresh_wake_generation, component_id, r.refresh_wake_generation })
    end)
    if ack_err then return defer(r, ack_err) end
    if not ack or tonumber(ack.rows_affected) == nil then return defer(r, "missing refresh acknowledgment count") end
    if tonumber(ack.rows_affected) == 0 then
        local current, current_err = M.read(component_id)
        if current_err then return nil, current_err end
        if not current then
            local _, cancel_err = jobs.cancel(job_id)
            if cancel_err then return nil, cancel_err end
        else
            local _, mark_err = with_db(function(db: any): (any?, any)
                return db:execute("UPDATE " .. TABLE .. " SET refresh_wake_generation=refresh_wake_generation+1,refresh_retry_at=NULL WHERE component_id=$1", { component_id })
            end)
            if mark_err then return nil, mark_err end
            local _, notify_err = M.notify()
            if notify_err then return nil, notify_err end
        end
    end
    return job_id, nil
end

function M.cancel(component_id: string): (any?, any)
    local _, mark_err = with_db(function(db: any): (any?, any)
        return db:execute("UPDATE " .. TABLE .. " SET refresh_enabled=false,refresh_wake_generation=refresh_wake_generation+1,refresh_retry_at=NULL"
            .. " WHERE component_id=$1", { component_id })
    end)
    if mark_err then return nil, mark_err end
    local _, wake_err = M.notify()
    if wake_err then return nil, wake_err end
    return M.arm(component_id)
end

function M.dispatch(): (Map?, any)
    local stamp = now()
    local rows, read_err = with_db(function(db: any): (any?, any)
        return db:query("SELECT component_id FROM " .. TABLE
            .. " WHERE refresh_wake_generation>refresh_wake_applied_generation AND (refresh_retry_at IS NULL OR refresh_retry_at<=$1)"
            .. " ORDER BY component_id LIMIT 100", { stamp })
    end)
    if read_err then return nil, read_err end
    local failures = 0
    for _, row in ipairs(rows :: { Map }) do
        local _, err, deferred = M.arm(row.component_id)
        if err and not deferred then return nil, err end
        if err then failures = failures + 1 end
    end
    local remaining, remaining_err = with_db(function(db: any): (any?, any)
        return db:query("SELECT MIN(COALESCE(refresh_retry_at,$1)) AS deadline FROM " .. TABLE
            .. " WHERE refresh_wake_generation>refresh_wake_applied_generation", { stamp })
    end)
    if remaining_err then return nil, remaining_err end
    return { failures = failures, rearm = remaining[1].deadline }, nil
end

-- Boot is a recovery signal, not a timer. Rechecking Jobs identity repairs a
-- slot lost across the owner boundary, including acknowledged wake demand.
function M.bootstrap(): (any?, any)
    local _, mark_err = with_db(function(db: any): (any?, any)
        return db:execute("UPDATE " .. TABLE .. " SET refresh_wake_generation=refresh_wake_applied_generation+1 WHERE refresh_wake_generation=refresh_wake_applied_generation")
    end)
    if mark_err then return nil, mark_err end
    return M.notify()
end

return M
