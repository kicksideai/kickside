-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Jobs commits independently of Automation. Never provision while holding a
-- migration transaction: distinct resource IDs can name the same SQLite file.
-- A page may be partially repaired; canonical slot identities make replay safe.
local sql = require("sql")
local json = require("json")
local jobs = require("jobs")
local slot = require("slot")
local slot_repair = require("slot_repair")
local migration_api = require("migration")

local function checked(value: any, err: any): any
    if err then error(err) end
    return value
end

local function eligible(row: any): boolean?
    return row and row.source_kind ~= "none"
        and row.pending_command_id ~= "owner-delete:" .. row.automation_id
end

local function page(db: any, cursor: string?): string?
    local after = cursor and checked(json.decode(cursor)) or nil
    local rows = checked(db:query("SELECT automation_id,drive_key,revision,command_generation,source_kind,source_thread_id,job_id,pending_command_id FROM kickside_automation_drive "
        .. (after and "WHERE (automation_id,drive_key) > ($1,$2) " or "")
        .. "ORDER BY automation_id,drive_key LIMIT 200", after and {after[1],after[2]} or {}))
    local job_ids = {}
    for _, row in ipairs(rows) do if row.job_id then job_ids[#job_ids + 1] = row.job_id end end
    local statuses = checked(jobs.get_job_statuses(job_ids))
    for _, row in ipairs(rows) do
        local status = row.job_id and statuses[row.job_id] or nil
        if eligible(row) and status ~= "pending" and status ~= "running" then checked(slot_repair.repair_drive({slot = slot}, db, row.automation_id, row.drive_key)) end
    end
    if #rows < 200 then
        local sourced = checked(db:query("SELECT automation_id FROM kickside_automation_drive WHERE source_kind <> 'none'"
            .. " AND (pending_command_id IS NULL OR pending_command_id <> 'owner-delete:' || automation_id) LIMIT 1"))
        -- A notification is part of this idempotent repair. The framework must
        -- not record completion until it succeeds, including on a replay.
        if #sourced > 0 then checked(slot.wake_dispatcher()) end
        return nil
    end
    local last = rows[#rows]
    return checked(json.encode({last.automation_id,last.drive_key}))
end

local M = {}
function M.define(description: string): any
    return migration_api.define(function()
        migration(description, function()
            for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
                database(dialect, function()
                    up(page, "external_batch")
                    -- Repair does not introduce a schema or reversible state.
                    down(function() end)
                end)
            end
        end)
    end)
end
return M
