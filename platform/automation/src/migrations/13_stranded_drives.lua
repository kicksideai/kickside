-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Jobs commits independently of Automation. Never provision while holding a
-- migration transaction: distinct resource IDs can name the same SQLite file.
-- A page may be partially repaired; canonical slot identities make replay safe.
local sql = require("sql")
local time = require("time")
local json = require("json")
local jobs = require("jobs")
local slot = require("slot")
local ledger = require("migration_repository")

local DESCRIPTION = "13 stranded drives"

local function checked(value, err)
    if err then error(err) end
    return value
end

local function eligible(row)
    return row and row.source_kind ~= "none"
        and row.pending_command_id ~= "owner-delete:" .. row.automation_id
end

local function read_drive(db, row)
    local rows = checked(db:query("SELECT automation_id,drive_key,revision,command_generation,source_kind,source_thread_id,job_id,pending_command_id"
        .. " FROM kickside_automation_drive WHERE automation_id=$1 AND drive_key=$2", {row.automation_id,row.drive_key}))
    return rows[1]
end

local function repair_drive(db, row)
    local before = row
    for attempt = 1, 3 do
        if not eligible(before) then return end
        local id, err = slot.provision(row.automation_id, row.drive_key)
        local after = read_drive(db, row)
        if err then
            -- Verified deletion can race provisioning. An infrastructure error
            -- still stops the page and leaves its canonical job available.
            if (errors.is(err, errors.CONFLICT) or errors.is(err, errors.NOT_FOUND)) and not eligible(after) then return end
            error(err)
        end
        if not after or after.pending_command_id == "owner-delete:" .. row.automation_id then return end
        if after.source_kind == "none" then
            local _, cancel_err = slot.provision(row.automation_id, row.drive_key)
            if cancel_err then error(cancel_err) end
            return
        end
        if before.revision == after.revision and before.command_generation == after.command_generation
            and before.source_kind == after.source_kind and before.source_thread_id == after.source_thread_id
            and after.job_id == id then return end
        if attempt == 3 then
            -- Sustained source churn must remain repairable on replay, even if
            -- the canonical job is pending. Detach only our recorded reference;
            -- provisioning will reuse the same active identity, never duplicate it.
            checked(db:execute("UPDATE kickside_automation_drive SET job_id=NULL WHERE automation_id=$1"
                .. " AND drive_key=$2 AND job_id=$3 AND (pending_command_id IS NULL OR pending_command_id<>$4)",
                {row.automation_id,row.drive_key,id,"owner-delete:" .. row.automation_id}))
            error(errors.new({kind = errors.CONFLICT, retryable = true,
                message = "drive changed during stranded-slot repair; replay the page"}))
        end
        before = after
    end
end

local function run(db, dialect, opts)
    local id = opts.id
    if type(id) ~= "string" or id == "" or #id > 512 then error("Migration ID must contain 1 to 512 characters") end
    if opts.direction and opts.direction ~= "up" then error("Stranded-drive repair has no down migration") end
    if dialect ~= sql.type.SQLITE and dialect ~= sql.type.POSTGRES then error("Unsupported repair database: " .. tostring(dialect)) end
    checked(ledger.init_tracking_table(db))
    local ids = {id}
    for _, alias in ipairs(opts.aliases or {}) do ids[#ids + 1] = tostring(alias) end
    local progress_table

    -- Only ledger reads/writes and the bounded Automation scan run under this
    -- lock. Use the framework's lock so other migration runners interoperate.
    local function transaction(fn: any): any
        local tx = checked(db:begin(dialect == sql.type.POSTGRES and {isolation = sql.isolation.READ_COMMITTED} or nil))
        local ok, result = pcall(function()
            if dialect == sql.type.POSTGRES then
                checked(tx:query("SELECT pg_advisory_xact_lock(hashtext(current_database()), hashtext('wippy.migration:_migrations'))"))
            else
                checked(tx:execute("UPDATE _migrations SET id = id WHERE 0"))
            end
            return fn(tx)
        end)
        if not ok then tx:rollback(); error(result) end
        local committed, commit_err = tx:commit()
        if commit_err or not committed then
            tx:rollback()
            error(commit_err or "Repair checkpoint commit failed")
        end
        return result
    end
    local function applied(tx)
        for _, key in ipairs(ids) do
            if checked(ledger.is_applied(tx, key)) then
                if opts.force then error("Cannot force an applied repair migration") end
                return true
            end
        end
        return false
    end

    while true do
        local page = transaction(function(tx)
            if applied(tx) then return {applied = true} end
            if not progress_table then progress_table = checked(ledger.init_progress_table(tx, dialect)) end
            local cursor = checked(ledger.get_progress(tx, progress_table, ids))
            local after = cursor and checked(json.decode(cursor)) or nil
            local rows = checked(tx:query("SELECT automation_id,drive_key,revision,command_generation,source_kind,source_thread_id,job_id,pending_command_id FROM kickside_automation_drive "
                .. (after and "WHERE (automation_id,drive_key) > ($1,$2) " or "")
                .. "ORDER BY automation_id,drive_key LIMIT 200", after and {after[1],after[2]} or {}))
            return {cursor = cursor, rows = rows}
        end)
        if page.applied then return "skipped" end

        local job_ids = {}
        for _, row in ipairs(page.rows) do if row.job_id then job_ids[#job_ids + 1] = row.job_id end end
        local statuses = checked(jobs.get_job_statuses(job_ids))
        for _, row in ipairs(page.rows) do
            local status = row.job_id and statuses[row.job_id] or nil
            if eligible(row) and status ~= "pending" and status ~= "running" then repair_drive(db, row) end
        end
        local finished = #page.rows < 200
        if finished then
            -- Also recover a missing dispatcher when every drive was healthy.
            -- No sourced drives means there is no new maintenance work to run.
            local sourced = checked(db:query("SELECT automation_id FROM kickside_automation_drive WHERE source_kind <> 'none'"
                .. " AND (pending_command_id IS NULL OR pending_command_id <> 'owner-delete:' || automation_id) LIMIT 1"))
            if #sourced > 0 then checked(slot.wake_dispatcher()) end
        end
        local committed = transaction(function(tx)
            if applied(tx) then return true end
            -- A peer may have advanced or finished while this page repaired.
            -- Never move its checkpoint backwards or complete from stale work.
            if checked(ledger.get_progress(tx, progress_table, ids)) ~= page.cursor then return false end
            if finished then
                checked(ledger.record_migration(tx, id, DESCRIPTION))
                checked(ledger.remove_progress(tx, progress_table, ids))
            else
                local last = page.rows[#page.rows]
                checked(ledger.record_progress(tx, progress_table, id, checked(json.encode({last.automation_id,last.drive_key}))))
            end
            return true
        end)
        if committed and finished then return "applied" end
    end
end

return function(opts)
    opts = opts or {}
    local db, db_err = opts.db, nil
    if not db and not opts.database_id then return {status = "error", error = "Migration database is required"} end
    if not db then db, db_err = sql.get(opts.database_id) end
    if db_err or not db then return {status = "error", error = tostring(db_err or "Migration database is required")} end
    local ok, result, dialect
    for attempt = 1, 5 do
        ok, result = pcall(function()
            dialect = checked(db:type())
            return run(db, dialect, opts)
        end)
        if ok or dialect ~= sql.type.SQLITE or attempt == 5 then break end
        local message = tostring(result):lower()
        -- SQLite reports BUSY/BUSY_SNAPSHOT and shared-cache LOCKED through
        -- these driver messages. Every failed transaction was rolled back;
        -- replay from the last checkpoint rather than retrying a stale snapshot.
        if not (message:find("database is locked", 1, true)
            or message:find("database table is locked", 1, true)
            or message:find("database schema is locked", 1, true)) then break end
        time.sleep(tostring(50 * 2 ^ (attempt - 1)) .. "ms")
    end
    if not opts.db then
        local _, release_err = db:release()
        if release_err and ok then ok, result = false, release_err end
    end
    if not ok then return {status = "error", error = tostring(result)} end
    return {status = "complete", migrations = {{status = result, description = DESCRIPTION, name = DESCRIPTION}}}
end
