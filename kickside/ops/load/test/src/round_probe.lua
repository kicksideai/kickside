-- Observe empty rounds through the registered dispatcher and public Jobs reads.
local time = require("time")
local support = require("driver_support")
local jobs = require("jobs")
local M = {}
type Map = { [string]: any }

local function job_state(id: string): Map
    local row, err = jobs.get_job(id)
    if err or not row then support.fail("SQLite overhead job read failed: " .. tostring(err)) end
    return row :: Map
end

function M.run(): Map
    local rows = support.query([[SELECT d.automation_id,d.drive_key,d.job_id
        FROM kickside_automation_drive d
        WHERE d.source_kind='event' AND d.automation_id IN (SELECT id FROM kickside_lod_automations)
        ORDER BY d.automation_id,d.drive_key]])
    if #rows < 2 then support.fail("SQLite overhead probe requires at least two event drives") end
    support.exec([[CREATE TABLE IF NOT EXISTS kickside_lod_sqlite_round_sample(
        sample_no INTEGER PRIMARY KEY,job_id TEXT NOT NULL,overhead_ms REAL NOT NULL,
        round_seq INTEGER NOT NULL,execution_seq INTEGER NOT NULL)]])
    support.exec("DELETE FROM kickside_lod_sqlite_round_sample")
    local target = support.state_get("smoke") == "1" and 20 or 400
    local samples: { number } = {}
    local observations: { { number | string } } = {}
    local function drive_state(row: Map): Map
        local drive = support.query([[SELECT round_seq FROM kickside_automation_drive
            WHERE automation_id=$1 AND drive_key=$2]], {row.automation_id, row.drive_key})[1]
        if not drive then support.fail("SQLite overhead drive vanished") end
        return drive
    end
    for i = 1, target do
        local row = rows[((i - 1) % #rows) + 1]
        local id = tostring(row.job_id)
        local before = job_state(id)
        if before.status ~= "pending" or before.scheduled_at ~= nil then
            support.fail("SQLite overhead slot is not idle before wake")
        end
        local prior = drive_state(row)
        local pages_before = tonumber(support.scalar("SELECT COUNT(*) AS n FROM kickside_lod_page_observation", nil, "n")) or 0
        local started = time.now():unix_nano()
        local woken, wake_err = jobs.wake_job(id)
        if wake_err or not woken or woken.woken ~= true then
            support.fail("SQLite overhead wake failed: " .. tostring(wake_err))
        end
        local deadline = started + 30000000000
        local after: Map
        repeat
            after = job_state(id)
            if tonumber(after.execution_seq) > tonumber(before.execution_seq)
                and after.status == "pending" and after.scheduled_at == nil then break end
            if after.status ~= "pending" and after.status ~= "running" then
                support.fail("SQLite overhead round fails: " .. tostring(after.last_error or after.status))
            end
            if time.now():unix_nano() >= deadline then support.fail("SQLite overhead round does not complete") end
            time.sleep("1ms")
        until false
        local elapsed_ms = (time.now():unix_nano() - started) / 1000000
        local drive = drive_state(row)
        local pages_after = tonumber(support.scalar("SELECT COUNT(*) AS n FROM kickside_lod_page_observation", nil, "n")) or 0
        if tonumber(drive.round_seq) <= tonumber(prior.round_seq) or pages_after ~= pages_before then
            support.fail("SQLite overhead sample lacks an empty committed round")
        end
        samples[#samples + 1] = elapsed_ms
        observations[#observations + 1] = {i, id, elapsed_ms,
            tonumber(drive.round_seq) or 0, tonumber(after.execution_seq) or 0}
    end
    for _, item in ipairs(observations) do
        support.exec([[INSERT INTO kickside_lod_sqlite_round_sample
            (sample_no,job_id,overhead_ms,round_seq,execution_seq) VALUES($1,$2,$3,$4,$5)]], item)
    end
    local p95 = support.percentile(samples, 0.95)
    support.state_set("sqlite_empty_overhead_p95", support.fmt(p95))
    support.state_set("sqlite_empty_overhead_samples", target)
    support.metric("SQLite direct empty overhead samples", "20 smoke; 400 full",
        tostring(target) .. " committed and job-completed empty rounds", "MEASURED",
        "Public Jobs wake through dispatcher execution and public completion observation")
    support.metric("empty-round overhead p95", "≤100 ms", support.fmt(p95), p95 <= 100 and "PASS" or "FAIL",
        tostring(target) .. " wake-to-completion samples include queue, supervised worker and public read overhead")
    return {samples = target, p95_ms = p95}
end

return M
