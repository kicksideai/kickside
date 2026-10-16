-- Command recovery and page/check phases using the installed fixture.
local sql = require("sql")
local time = require("time")
local support = require("driver_support")
local command = require("command_lib")
local automations = require("automations_lib")
local canonical_json = require("canonical_json")
local slot = require("slot")
local jobs = require("jobs")
local uuid = require("uuid")
local process = require("process")
local M = {}
type Map = { [string]: any }
local fail, open_db, query, metric, state_get, fmt =
    support.fail, support.open_db, support.query, support.metric, support.state_get, support.fmt
local exec, head = support.exec, support.head

function M.command_recovery(): Map
    local drives = query([[SELECT a.id AS automation_id,d.event_seq,d.source_thread_id
        FROM kickside_lod_automations a JOIN kickside_automation_drive d
          ON d.automation_id=a.id AND d.drive_key='main'
        ORDER BY a.ordinal]])
    local expected = state_get("smoke") == "1" and #drives or 200
    if #drives ~= expected then fail("command recovery needs " .. tostring(expected) .. " installed automations") end
    local db = open_db()
    local reserve_started = time.now():unix_nano()
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); fail("command setup begin failed: " .. tostring(begin_err)) end
    for _, row in ipairs(drives) do
        local id = tostring(row.automation_id)
        local thread_id = tostring(row.source_thread_id)
        local target = tonumber(row.event_seq) or 0
        local request_id = "lod-resync:" .. uuid.v7()
        local digest, hash_err = canonical_json.hash({ control = "resync", drive_key = "main", keys = {}, from = target })
        if hash_err or not digest then tx:rollback(); db:release(); fail("command digest failed: " .. tostring(hash_err)) end
        local reserved, reserve_err = command.reserve_tx(tx, {
            automation_id = id, request_id = request_id, digest = digest, kind = "resync_event",
            input = { control = "resync", drive_key = "main", target = target,
                pins = { { drive_key = "main", thread_id = thread_id, target = target,
                    consumer_key = "drive:" .. id .. ":main" } } },
            drive_keys = { "main" },
        })
        if reserve_err or not reserved then tx:rollback(); db:release(); fail("command reserve failed: " .. tostring(reserve_err)) end
    end
    local _, commit_err = tx:commit()
    local reserve_ms = (time.now():unix_nano() - reserve_started) / 1000000
    db:release()
    if commit_err then fail("command setup commit failed: " .. tostring(commit_err)) end
    -- A producer of pending commands wakes the dispatcher after its commit.
    local woken, wake_err = slot.wake_dispatcher()
    if wake_err or not woken then fail("command dispatcher wake failed: " .. tostring(wake_err)) end
    if support.dbtype() == sql.type.SQLITE then
        metric("SQLite 200-command reservation transaction", "diagnostic", fmt(reserve_ms), "MEASURED",
            "Public db:begin through db:commit boundary enclosing 200 production command.reserve_tx calls")
    end
    local started = time.now():unix_nano()
    local fresh = support.dbtype() == sql.type.POSTGRES
        and "last_seen_at > NOW() - INTERVAL '30 seconds'"
        or "last_seen_at > datetime('now','-30 seconds')"
    local workers = query("SELECT worker_id FROM kickside_job_worker_pulse WHERE " .. fresh
        .. " ORDER BY worker_id")
    local old: { [string]: boolean } = {}
    local restarted = 0
    for _, worker in ipairs(workers) do
        local pid = tostring(worker.worker_id)
        old[pid] = true
        local ok, stop_err = process.terminate(pid)
        if stop_err or ok == false then fail("worker termination failed: " .. tostring(stop_err)) end
        restarted = restarted + 1
    end
    if restarted < (support.dbtype() == sql.type.POSTGRES and 4 or 1) then
        fail("command recovery did not find the expected worker pool")
    end
    local deadline = started + 60 * 1000000000
    local recovered = 0
    local replacements = 0
    while time.now():unix_nano() < deadline do
        recovered = tonumber(support.scalar([[SELECT COUNT(*) AS n FROM kickside_automation_op op
            JOIN kickside_lod_automations a ON a.id=op.automation_id
            WHERE op.request_id LIKE 'lod-resync:%' AND op.state='succeeded']], nil, "n")) or 0
        replacements = 0
        local live = query("SELECT worker_id FROM kickside_job_worker_pulse WHERE " .. fresh)
        for _, worker in ipairs(live) do
            if not old[tostring(worker.worker_id)] then replacements = replacements + 1 end
        end
        if recovered >= expected and replacements >= restarted then break end
        time.sleep("20ms")
    end
    local elapsed_ms = (time.now():unix_nano() - started) / 1000000
    local command_states: { string } = {}
    for _, row in ipairs(query([[SELECT op.state,c.pending_step,c.last_error_json,COUNT(*) AS n
        FROM kickside_automation_op op JOIN kickside_lod_automations a ON a.id=op.automation_id
        LEFT JOIN kickside_automation_command c ON c.automation_id=op.automation_id
        WHERE op.request_id LIKE 'lod-resync:%'
        GROUP BY op.state,c.pending_step,c.last_error_json]])) do
        command_states[#command_states + 1] = tostring(row.state) .. "/" .. tostring(row.pending_step)
            .. "=" .. tostring(row.n) .. " error=" .. tostring(row.last_error_json)
    end
    for _, row in ipairs(query([[SELECT status,scheduled_at,wake_generation,attempts FROM kickside_job
        WHERE job_type='kickside.automation:command_dispatcher']])) do
        command_states[#command_states + 1] = "dispatcher job=" .. tostring(row.status) .. ",scheduled="
            .. tostring(row.scheduled_at) .. ",wake_generation=" .. tostring(row.wake_generation)
            .. ",attempts=" .. tostring(row.attempts)
    end
    print("Command recovery state: " .. table.concat(command_states, "; "))
    local status = state_get("smoke") == "1" and "SMOKE" or
        (recovered == expected and replacements >= restarted and elapsed_ms <= 60000 and "PASS" or "FAIL")
    metric("200 due command recoveries", "200 ≤60,000 ms", tostring(recovered) .. "/" .. tostring(expected)
        .. " in " .. fmt(elapsed_ms) .. " ms", status,
        "Production command reservation, dispatcher and drive recovery after terminating "
        .. tostring(restarted) .. " worker loops; " .. tostring(replacements) .. " replacement pulses")
    return { expected = expected, recovered = recovered, elapsed_ms = elapsed_ms,
        terminated_workers = restarted, replacements = replacements }
end

local function control_pending(row: Map): boolean
    local token: string? = nil
    repeat
        local status, err = automations.status(tostring(row.automation_id), {page_size = 1000, page_token = token})
        if err or not status then fail("page-size control status unavailable: " .. tostring(err)) end
        for _, drive in ipairs(status.drives) do
            if drive.drive_key == row.drive_key then
                return drive.wake_pending or (status.commands and status.commands.pending ~= nil) or false
            end
        end
        token = status.next_page_token
    until not token
    return fail("page-size drive is absent from its public status")
end

function M.pause_event_slots(source_thread: string): ()
    local rows = query([[SELECT automation_id,drive_key,job_id FROM kickside_automation_drive
        WHERE source_thread_id=$1 AND source_kind='event'
          AND automation_id IN (SELECT id FROM kickside_lod_automations)
        ORDER BY automation_id,drive_key]], {source_thread})
    if #rows == 0 then fail("page-size source has no event slots") end
    local deadline = time.now():unix_nano() + 30000000000
    local active: boolean
    repeat
        active = false
        for _, row in ipairs(rows) do
            local pending = control_pending(row)
            local job, err = jobs.get_job(tostring(row.job_id))
            if err or not job then fail("page-size job status unavailable: " .. tostring(err)) end
            if pending or job.status ~= "pending" or job.scheduled_at ~= nil or job.wake_control_pending == true
                or tonumber(job.wake_control_pending) == 1 then active = true end
        end
        if active then time.sleep("10ms") end
    until not active or time.now():unix_nano() >= deadline
    if active then fail("page-size drives did not quiesce before policy override") end
    exec([[UPDATE kickside_job SET wake_enabled=FALSE,scheduled_at=NULL WHERE status='pending' AND id IN
        (SELECT job_id FROM kickside_automation_drive WHERE source_thread_id=$1 AND source_kind='event'
         AND automation_id IN (SELECT id FROM kickside_lod_automations))]], {source_thread})
    for _, row in ipairs(rows) do
        local job, err = jobs.get_job(tostring(row.job_id))
        if err or not job then fail("page-size disabled job status unavailable: " .. tostring(err)) end
        if job.status ~= "pending" or job.wake_enabled == true or tonumber(job.wake_enabled) == 1 then
            fail("page-size slot changes after control acknowledgement")
        end
    end
end

function M.page_sizes(): Map
    local postgres = support.dbtype() == sql.type.POSTGRES
    local candidates = query([[SELECT id,thread_id FROM kickside_lod_automations
        WHERE thread_id=(SELECT thread_id FROM kickside_lod_automations ORDER BY ordinal DESC LIMIT 1)
        ORDER BY ordinal LIMIT 2]])
    if #candidates ~= 2 then fail("page-size fixture needs two automations on one source thread") end
    local first, hundred = tostring(candidates[1].id), tostring(candidates[2].id)
    local source_thread = tostring(candidates[1].thread_id)
    local originals = query([[SELECT automation_id,applied_json FROM kickside_automation_drive
        WHERE drive_key='main' AND automation_id IN ($1,$2)]], { first, hundred })
    if #originals ~= 2 then fail("page-size drives are missing") end
    M.pause_event_slots(source_thread)
    exec("DELETE FROM kickside_lod_page_observation")
    -- The backlog is appended through the production Threads append while
    -- every event slot on the thread is wake-disabled, so the two selected
    -- drives see the same 100-item backlog at release.
    local first_seq = head(source_thread)
    local _actor, threads = support.actor_and_threads()
    for i = 1, 100 do support.append_one(threads, source_thread, "lod-page-" .. tostring(i)) end
    if head(source_thread) ~= first_seq + 100 then fail("page fixture backlog did not land contiguously") end
    local last_seq = first_seq + 100
    local mutation = postgres
        and [[UPDATE kickside_automation_drive SET applied_json=jsonb_set(applied_json::jsonb,
            '{policy,round,page_size}',to_jsonb($1::integer))::text WHERE automation_id=$2 AND drive_key='main']]
        or [[UPDATE kickside_automation_drive SET applied_json=json_set(applied_json,
            '$.policy.round.page_size',$1) WHERE automation_id=$2 AND drive_key='main']]
    exec(mutation, { 1, first })
    exec(mutation, { 100, hundred })
    local policy_expr = postgres and "applied_json::jsonb #>> '{policy,round,page_size}'"
        or "json_extract(applied_json,'$.policy.round.page_size')"
    local configured = query("SELECT automation_id," .. policy_expr .. " AS page_size"
        .. " FROM kickside_automation_drive WHERE automation_id IN ($1,$2) AND drive_key='main'",
        { first, hundred })
    local one_configured, hundred_configured = false, false
    for _, row in ipairs(configured) do
        if tostring(row.automation_id) == first and tonumber(row.page_size) == 1 then one_configured = true end
        if tostring(row.automation_id) == hundred and tonumber(row.page_size) == 100 then hundred_configured = true end
    end
    if not one_configured or not hundred_configured then fail("page-size policy override did not persist") end
    for _, row in ipairs(query([[SELECT job_id FROM kickside_automation_drive
        WHERE automation_id IN ($1,$2) AND drive_key='main']], { first, hundred })) do
        local woken, wake_err = slot.wake(tostring(row.job_id))
        if wake_err or not woken or woken.woken ~= true then
            fail("page-size slot release failed: " .. tostring(wake_err))
        end
    end
    local deadline = time.now():unix_nano() + 120 * 1000000000
    local one, hundred_seen = 0, 0
    while time.now():unix_nano() < deadline do
        local observed = query([[SELECT automation_id,item_count,COUNT(*) AS n
            FROM kickside_lod_page_observation WHERE automation_id IN ($1,$2)
            GROUP BY automation_id,item_count]], { first, hundred })
        for _, row in ipairs(observed) do
            if tostring(row.automation_id) == first and tonumber(row.item_count) == 1 then
                one = tonumber(row.n) or 0
            elseif tostring(row.automation_id) == hundred and tonumber(row.item_count) == 100 then
                hundred_seen = tonumber(row.n) or 0
            end
        end
        local settled = tonumber(support.scalar([[SELECT COUNT(*) AS n FROM kickside_automation_drive d
            JOIN kickside_job j ON j.id=d.job_id WHERE d.automation_id IN ($1,$2)
            AND d.drive_key='main' AND d.round_token IS NULL
            AND j.status='pending']],
            { first, hundred }, "n")) or 0
        if one > 0 and hundred_seen > 0 and settled == 2 then break end
        time.sleep("20ms")
    end
    local drive_states: { string } = {}
    for _, row in ipairs(query([[SELECT d.automation_id,d.phase,d.event_seq,d.round_seq,j.status,
        d.last_error_json,d.next_run_at,d.pending_command_id,d.round_token,j.scheduled_at,j.wake_enabled,
        (SELECT event_count FROM kickside_thread t WHERE t.id=d.source_thread_id) AS head FROM kickside_automation_drive d JOIN kickside_job j ON j.id=d.job_id
        WHERE d.automation_id IN ($1,$2) AND d.drive_key='main' ORDER BY d.automation_id]], { first, hundred })) do
        drive_states[#drive_states + 1] = tostring(row.automation_id) .. ":phase=" .. tostring(row.phase)
            .. ",event_seq=" .. tostring(row.event_seq) .. ",round_seq=" .. tostring(row.round_seq)
            .. ",head=" .. tostring(row.head) .. ",next_run_at=" .. tostring(row.next_run_at)
            .. ",pending_command=" .. tostring(row.pending_command_id) .. ",round_token=" .. tostring(row.round_token)
            .. ",job=" .. tostring(row.status) .. ",scheduled=" .. tostring(row.scheduled_at)
            .. ",wake_enabled=" .. tostring(row.wake_enabled) .. ",error=" .. tostring(row.last_error_json)
    end
    for _, row in ipairs(query([[SELECT automation_id,item_count,COUNT(*) AS n
        FROM kickside_lod_page_observation WHERE automation_id IN ($1,$2)
        GROUP BY automation_id,item_count ORDER BY automation_id,item_count]], { first, hundred })) do
        drive_states[#drive_states + 1] = tostring(row.automation_id) .. ":pages[" .. tostring(row.item_count)
            .. "]=" .. tostring(row.n)
    end
    for _, row in ipairs(originals) do
        exec("UPDATE kickside_automation_drive SET applied_json=$1 WHERE automation_id=$2 AND drive_key='main'",
            { tostring(row.applied_json), tostring(row.automation_id) })
    end
    exec([[UPDATE kickside_automation_drive SET event_seq=$1
        WHERE source_thread_id=$2 AND source_kind='event'
          AND automation_id IN (SELECT id FROM kickside_lod_automations)]], { last_seq, source_thread })
    exec([[UPDATE kickside_job SET wake_enabled=TRUE,scheduled_at=NULL WHERE id IN
        (SELECT job_id FROM kickside_automation_drive WHERE source_thread_id=$1 AND source_kind='event'
          AND automation_id IN (SELECT id FROM kickside_lod_automations))]], { source_thread })
    local status = state_get("smoke") == "1" and "SMOKE" or (one > 0 and hundred_seen > 0 and "PASS" or "FAIL")
    print("Page-size state: " .. table.concat(drive_states, "; "))
    metric("1- and 100-item pages", "both page sizes exercised", tostring(one) .. "/" .. tostring(hundred_seen),
        status, "Production event pull and fixture provider receipt path; first/second counts are observed page invocations")
    return { one_item_pages = one, hundred_item_pages = hundred_seen }
end

return M
