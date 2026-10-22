-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local jobs = require("jobs")
local slot = require("slot")
local listing = require("job_listing")
local jobs_config = require("jobs_config")
local types = require("types")
return require("migration").define(function()
    migration("13 stranded drives", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx, checkpoint)
                    local after = checkpoint and assert(json.decode(checkpoint)) or nil
                    local rows, err = tx:query("SELECT automation_id,drive_key,source_kind,job_id,pending_command_id FROM kickside_automation_drive "
                        .. (after and "WHERE (automation_id,drive_key) > ($1,$2) " or "")
                        .. "ORDER BY automation_id,drive_key LIMIT 200" .. (dialect == "postgres" and " FOR UPDATE" or ""),
                        after and {after[1],after[2]} or {})
                    if err then error(err) end
                    if #rows == 0 then return nil end
                    local ids = {}
                    for _, row in ipairs(rows) do if row.job_id then ids[#ids + 1] = row.job_id end end
                    local statuses, read_err
                    if jobs_config.db_id() == types.db_id() then
                        statuses, read_err = listing.get_job_statuses(tx, ids)
                    else
                        statuses, read_err = jobs.get_job_statuses(ids)
                    end
                    if read_err then error(read_err) end
                    for _, row in ipairs(rows) do
                        local status = row.job_id and statuses[row.job_id] or nil
                        if row.source_kind ~= "none" and row.pending_command_id ~= "owner-delete:" .. row.automation_id
                            and status ~= "pending" and status ~= "running" then
                            local _, provision_err = slot.provision_tx(tx, row.automation_id, row.drive_key)
                            if provision_err then error(provision_err) end
                        end
                    end
                    if #rows < 200 then return nil end
                    local last = rows[#rows]
                    return assert(json.encode({last.automation_id,last.drive_key}))
                end, "batch")
            end)
        end
    end)
end)
