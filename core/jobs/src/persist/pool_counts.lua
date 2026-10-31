-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local boundary = require("sql_boundary")
local M = {}
local function malformed(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "Jobs queue counts response is invalid", details = {code = "jobs_pool_counts_response", field = field}})
end
function M.read(db_id: string): (table?, error?)
    local db, err = sql.get(db_id)
    if err then return nil, err end
    local dialect, type_err = db:type()
    if type_err then return nil, boundary.release(db, type_err, "pool count release failed") end
    local rows, query_err = db:query([[SELECT queue_tier,status,COUNT(*) AS count FROM kickside_job
        WHERE status='running' OR (status='pending' AND (scheduled_at IS NOT NULL OR dispatch_requested_at IS NOT NULL))
        GROUP BY queue_tier,status]], {})
    rows, query_err = boundary.rows(rows, query_err, "Jobs queue count query failed", "rows", malformed)
    local release_err = boundary.release(db, query_err, "pool count release failed")
    if release_err then return nil, release_err end
    local counts = {database = dialect, queued = {live = 0, backfill = 0, maintenance = 0},
        running = {live = 0, backfill = 0, maintenance = 0}}
    for _, row in ipairs(rows) do
        local tier = row.status == "running" and counts.running or counts.queued
        if (row.status ~= "running" and row.status ~= "pending") or tier[row.queue_tier] == nil then return nil, malformed("tier") end
        local count, count_err = boundary.number_value(row.count, "count", 0, true, false, malformed)
        if count_err then return nil, count_err end
        tier[row.queue_tier] = count
    end
    return counts, nil
end
return M
