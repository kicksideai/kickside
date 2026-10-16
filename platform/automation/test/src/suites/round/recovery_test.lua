-- Round failure and recovery paths (design v5 §4.2-4.4, §4.9, §5.2): capped
-- jittered backoff and the degraded rearm, occupancy takeover after an expired
-- token, stamp parking for blocked phases and a racing command, recovery of a
-- pending or removed drive, a pruned source gap, round consumer contract
-- violations, waiting redelivery against uncertain retention, and event
-- continuation pages. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local time = require("time")
local uuid = require("uuid")
local drive = require("drive")
local claim = require("round_claim")
local round = require("round_runner")
local round_write = require("round_write")
local h = require("round_harness")

type Map = { [string]: any }

local PAST = h.PAST
local EVENT_TYPE = h.EVENT_TYPE
local read_drive, new_drive, set_drive, log_rows, ledger_row = h.read_drive, h.new_drive, h.set_drive, h.log_rows, h.ledger_row

local function unix(timestamp: string): integer
    return math.floor((time.parse(time.RFC3339, timestamp) :: any):unix())
end

local function define_tests(group: integer)
    test.describe("automation round recovery", function()
        local env: Map = {}
        local automation_id, thread_id = "", ""
        local run: (string, string, any?, any?) -> (Map?, any) = function(_: string, _k: string, _run_as: any?, _recover: any?): (Map?, any) return nil, nil end
        local last_completion: () -> Map = function(): Map return {} end

        test.before_each(function()
            env = h.setup("round_recovery")
            automation_id, thread_id = env.automation_id, env.thread_id
            run, last_completion = env.run, env.last_completion
        end)


        local function event_drive(drive_key: string, policy: Map?): ()
            new_drive({ automation_id = automation_id, drive_key = drive_key, source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:" .. drive_key, event_type = EVENT_TYPE }, policy = policy })
            local current = h.query("SELECT MAX(seq) AS seq FROM kickside_event WHERE thread_id = $1", { thread_id })[1]
            set_drive(automation_id, drive_key, "event_seq = $1", { math.floor(tonumber(current.seq) or 0) })
        end

        if group == 1 then
        test.it("backs off with capped full jitter between retry_after and a doubling ceiling", function()
            for _ = 1, 50 do
                test.eq(round.backoff_ms(1, 1000, 8000), 1000)
                local second = round.backoff_ms(2, 1000, 8000)
                test.is_true(second >= 1000 and second <= 2000, tostring(second))
                local capped = round.backoff_ms(40, 1000, 8000)
                test.is_true(capped >= 1000 and capped <= 8000, tostring(capped))
            end
        end)

        test.it("degrades the drive on an infrastructure failure and rearms it within the jittered backoff", function()
            new_drive({ automation_id = automation_id, drive_key = "flaky", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { fail = "unavailable" },
                    schedule = { type = "interval", expression = "30m" } }, policy = { round = { retry_after_ms = 2000, max_delay_ms = 16000 } } })
            set_drive(automation_id, "flaky", "next_run_at = $1", { PAST })
            local before = os.time()
            run(automation_id, "flaky")
            local after = os.time()
            local d = read_drive(automation_id, "flaky")
            test.eq(d.phase, drive.PHASE.DEGRADED)
            local failure = json.decode(d.last_error_json)
            test.eq(failure.attempts, 1)
            local rearm = unix(last_completion().options.rearm)
            test.is_true(rearm >= before + 1 and rearm <= after + 3, tostring(rearm - before))
            test.is_nil(last_completion().options.record)

            set_drive(automation_id, "flaky", "next_run_at = $1", { PAST })
            run(automation_id, "flaky")
            test.eq(json.decode(read_drive(automation_id, "flaky").last_error_json).attempts, 2)
            local second = unix(last_completion().options.rearm)
            test.is_true(second >= before + 1 and second <= os.time() + 5, tostring(second - before))
        end)

        test.it("takes over a drive whose previous round token expired", function()
            event_drive("expired")
            env.append("after expiry")
            set_drive(automation_id, "expired", "round_token = 'stale', round_until = $1", { PAST })
            run(automation_id, "expired")
            local d = read_drive(automation_id, "expired")
            test.is_nil(d.round_token)
            test.eq(d.round_seq, 1)
            test.eq(#log_rows(automation_id, "expired"), 1)
        end)

        test.it("recovers a pending command but skips recovery for a normal round", function()
            event_drive("recovery_fast")
            local calls = 0
            local recover = function(id: string, key: string): (Map?, any)
                test.eq(id, automation_id)
                calls = calls + 1
                if key == "recovery_pending" then
                    set_drive(automation_id, key, "pending_command_id = NULL", {})
                end
                return { stamp = true, state = "succeeded" }, nil
            end
            local normal, normal_err = run(automation_id, "recovery_fast", nil, recover)
            test.is_nil(normal_err, tostring(normal_err))
            test.is_true(normal.self_completed)
            test.eq(calls, 0)
            test.eq(read_drive(automation_id, "recovery_fast").round_seq, 1)

            event_drive("recovery_pending")
            set_drive(automation_id, "recovery_pending", "pending_command_id = 'recover-me'", {})
            local pending, pending_err = run(automation_id, "recovery_pending", nil, recover)
            test.is_nil(pending_err, tostring(pending_err))
            test.is_true(pending.self_completed)
            test.eq(calls, 1)
            test.eq(read_drive(automation_id, "recovery_pending").round_seq, 1)
        end)

        test.it("parks a drive in any blocked phase without delivering", function()
            for _, phase in ipairs({ "blocked_declaration", "blocked_access", "blocked_identity" }) do
                event_drive(phase)
                env.append("while " .. phase)
                set_drive(automation_id, phase, "phase = $1", { phase })
                run(automation_id, phase)
                test.eq(last_completion().options.record.status, "parked")
                test.eq(#log_rows(automation_id, phase), 0)
                test.is_nil(read_drive(automation_id, phase).round_token)
            end
        end)

        test.it("parks a stamp that meets a command reserved after recovery", function()
            event_drive("raced")
            set_drive(automation_id, "raced", "pending_command_id = 'racing'", {})
            local d = h.db()
            local tx = d:begin()
            local stamped, err = claim.stamp_tx(tx, automation_id, "raced", { token = uuid.v7(), until_at = drive.utc_after(60000) }, drive.utc_now())
            tx:commit()
            d:release()
            test.is_nil(err, tostring(err))
            test.eq(stamped.state, claim.STATE.PARKED)
            test.is_nil(read_drive(automation_id, "raced").round_token)
        end)

        test.it("holds the stamp while the drive's command is pending and parks a removed drive", function()
            local owner = "pending-" .. uuid.v4():sub(1, 8)
            new_drive({ automation_id = owner, drive_key = "main", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:pending", event_type = EVENT_TYPE } })
            h.exec("INSERT INTO kickside_automation_command (automation_id, generation, pending_request_id, pending_digest, pending_kind,"
                .. " pending_input_json, pending_drives_json, pending_step) VALUES ($1, 1, 'set_execution_identity-1', 'd', 'set_execution_identity', '{}', '[\"main\"]', 'set_execution_identity')",
                { owner })
            set_drive(owner, "main", "pending_command_id = 'set_execution_identity-1', command_generation = 1", {})
            local result, run_err = run(owner, "main", nil, function(): (Map?, any)
                return { state = "pending", stamp = false }, nil
            end)
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(result)
            test.not_nil(last_completion().options.rearm)
            test.is_nil(last_completion().options.record)
            local held = read_drive(owner, "main")
            test.is_nil(held.round_token)
            test.eq(held.round_seq, 0)

            run(owner, "absent")
            test.eq(last_completion().options.record.status, "parked")
            test.eq(last_completion().options.record.error, "drive removed")
        end)

        test.it("rearms a pending owner-delete drive at its persisted retry floor", function()
            local owner = "pending-floor-" .. uuid.v4():sub(1, 8)
            local request_id = "owner-delete:" .. owner
            local retry_floor = "2999-01-01T00:00:00Z"
            new_drive({ automation_id = owner, drive_key = "main", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:pending-floor", event_type = EVENT_TYPE } })
            h.exec([[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,pending_input_json,
                 pending_drives_json,pending_step,next_attempt_at)
                VALUES ($1,1,$2,$2,'owner_delete','{}','[]','rollback_done',$3)]],
                { owner, request_id, retry_floor })
            set_drive(owner, "main", "pending_command_id = $1, command_generation = 1", { request_id })

            run(owner, "main")

            test.eq(last_completion().options.rearm, retry_floor)
            test.is_nil(last_completion().options.record)
            test.eq(read_drive(owner, "main").round_seq, 0)
        end)

        end
        if group == 2 then
        test.it("blocks a drive whose position fell below the source's pruned boundary", function()
            local created = env.threads:upsert({ thread_class = "kickside.test.round", external_ref = "round-gap:" .. env.owner, title = "Pruned" })
            local gap_thread = tostring(created.thread_id)
            h.exec("UPDATE kickside_thread SET max_pruned_seq = 10 WHERE id = $1", { gap_thread })
            new_drive({ automation_id = automation_id, drive_key = "gap", source_kind = "event", source_thread_id = gap_thread,
                action = { source_ref = "fixture:gap", event_type = EVENT_TYPE } })
            run(automation_id, "gap")
            local d = read_drive(automation_id, "gap")
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION)
            test.not_nil((string.find(tostring(d.last_error_json), "resync", 1, true)))
            test.eq(d.event_seq, 0)
            test.eq(last_completion().options.record.status, "parked")
        end)

        test.it("rejects a consumer answer that repeats a key or answers a key it was not given", function()
            for _, what in ipairs({ "duplicate", "foreign" }) do
                event_drive(what)
                env.append(what)
                run(automation_id, what)
                local d = read_drive(automation_id, what)
                test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION, tostring(d.last_error_json))
                test.not_nil((string.find(tostring(d.last_error_json), "round consumer", 1, true)))
                test.is_nil(d.round_token)
                local position = h.query("SELECT event_seq FROM kickside_automation_drive WHERE automation_id = $1 AND drive_key = $2",
                    { automation_id, what })[1]
                test.eq(math.floor(tonumber(position.event_seq) or 0), d.event_seq)
            end
        end)

        test.it("parks a consumer that answers an item_key and names the delivery_key outcome key space", function()
            event_drive("item_key")
            env.append("item_key")
            run(automation_id, "item_key")
            local d = read_drive(automation_id, "item_key")
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION, tostring(d.last_error_json))
            test.contains(tostring(d.last_error_json), "waiting_items answers a key that was not delivered")
            test.contains(tostring(d.last_error_json), "outcomes answer each item's delivery_key")
            local position = h.query("SELECT event_seq FROM kickside_automation_drive WHERE automation_id = $1 AND drive_key = $2",
                { automation_id, "item_key" })[1]
            test.eq(math.floor(tonumber(position.event_seq) or 0), d.event_seq)
        end)

        test.it("redelivers a due waiting item without counting an attempt and never redelivers an uncertain one", function()
            event_drive("held")
            env.append("wait")
            env.append("uncertain")
            run(automation_id, "held")
            local wait_key, uncertain_key = "", ""
            for _, r in ipairs(log_rows(automation_id, "held")) do
                local what = json.decode(r.detail_json).directive
                if what == "wait" then wait_key = r.item_key else uncertain_key = r.item_key end
            end
            test.eq((ledger_row(automation_id, wait_key) :: Map).attempts, 0)
            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at = $1 WHERE owner_id = $2", { PAST, automation_id })
            run(automation_id, "held")
            local rows = log_rows(automation_id, "held")
            test.eq(#rows, 3)
            test.eq(rows[3].item_key, wait_key)
            test.eq((ledger_row(automation_id, wait_key) :: Map).state, "waiting")
            test.eq((ledger_row(automation_id, wait_key) :: Map).attempts, 0)
            test.eq((ledger_row(automation_id, uncertain_key) :: Map).state, "uncertain")
        end)

        test.it("redelivers a due ledger item while the drive's next pull is still in the future, keeping its schedule and cursor", function()
            new_drive({ automation_id = automation_id, drive_key = "drain_future", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records",
                    config = { items = { { key = "df-1", directive = "fail_retry" } } },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "drain_future", "next_run_at = $1", { PAST })
            run(automation_id, "drain_future")
            test.eq((ledger_row(automation_id, "df-1") :: Map).state, "retrying")
            test.eq(json.decode(read_drive(automation_id, "drain_future").cursor), 1, "the cursor passes the pending change")
            set_drive(automation_id, "drain_future", "next_run_at = $1", { drive.utc_after(1800000) })
            local after_pull = read_drive(automation_id, "drain_future")
            test.is_true(after_pull.next_run_at > drive.utc_now())

            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at = $1 WHERE owner_id = $2 AND item_key = 'df-1'", { PAST, automation_id })
            run(automation_id, "drain_future")
            test.eq((ledger_row(automation_id, "df-1") :: Map).state, "resolved", "the due item is redelivered before the next pull")
            test.eq(#log_rows(automation_id, "drain_future"), 2)
            local drained = read_drive(automation_id, "drain_future")
            test.eq(drained.next_run_at, after_pull.next_run_at)
            test.eq(drained.cursor, after_pull.cursor)
            test.eq(drained.unresolved_count, 0)
            test.eq(last_completion().options.rearm, after_pull.next_run_at)
        end)

        test.it("redelivers due ledger items while the source pull fails and records the pull failure without moving the position", function()
            local port = "kickside.automation.round.fixture:records"
            local schedule = { type = "interval", expression = "30m" }
            new_drive({ automation_id = automation_id, drive_key = "source_down", source_kind = "collection",
                action = { source_ref = port, config = { items = { { key = "sd-1", directive = "fail_retry" } } }, schedule = schedule } })
            set_drive(automation_id, "source_down", "next_run_at = $1", { PAST })
            run(automation_id, "source_down")
            test.eq((ledger_row(automation_id, "sd-1") :: Map).state, "retrying")
            local pulled = read_drive(automation_id, "source_down")
            test.eq(json.decode(pulled.cursor), 1)
            test.eq(pulled.unresolved_count, 1)

            set_drive(automation_id, "source_down", "action_json = $1, next_run_at = $2",
                { json.encode({ source_ref = port, config = { fail = "unavailable" }, schedule = schedule }), PAST })
            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at = $1 WHERE owner_id = $2 AND item_key = 'sd-1'", { PAST, automation_id })
            local before = os.time()
            local _, err = run(automation_id, "source_down")
            test.is_nil(err, tostring(err))

            test.eq((ledger_row(automation_id, "sd-1") :: Map).state, "resolved", "the due item goes out while the source is down")
            local rows = log_rows(automation_id, "source_down")
            test.eq(#rows, 2)
            test.eq(rows[2].item_key, "sd-1")
            local d = read_drive(automation_id, "source_down")
            test.eq(d.unresolved_count, 0)
            test.eq(d.phase, drive.PHASE.DEGRADED)
            local failure = json.decode(d.last_error_json)
            test.contains(failure.message, "records provider down")
            test.eq(failure.attempts, 1)
            test.eq(d.cursor, pulled.cursor, "a failed pull keeps the cursor")
            test.eq(d.pass_pages, pulled.pass_pages)
            test.eq(d.pass_items, pulled.pass_items)
            test.is_nil(d.round_token)
            test.eq(d.next_run_at, failure.next_attempt_at)
            test.eq(last_completion().options.rearm, d.next_run_at)
            test.is_true(unix(d.next_run_at) >= before)
            test.is_nil(last_completion().options.record)
        end)

        test.it("redelivers a due ledger item of a drive whose once schedule is exhausted", function()
            new_drive({ automation_id = automation_id, drive_key = "drain_once", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = {} },
                    schedule = { type = "once", expression = PAST } } })
            set_drive(automation_id, "drain_once", "unresolved_count = 1, cursor = $1", { "7" })
            h.exec("INSERT INTO kickside_trigger_item_ledger (owner_id, source_port, item_key, dedup_key, identity_key, envelope_json,"
                .. " state, attempts, first_failed_at, last_failed_at, next_attempt_at, error_code, retriable, terminal, created_at, updated_at)"
                .. " VALUES ($1, $2, 'do-1', 'do-1', $3, $4, 'retrying', 1, $5, $5, $5, 'Unavailable', true, false, $5, $5)",
                { automation_id, "kickside.automation.round.fixture:records",
                    round_write.keys({ automation_id = automation_id, source_port = "kickside.automation.round.fixture:records", delivery_revision = 1 }, { item_key = "do-1", dedup_key = "do-1", op = "upsert" }).idempotency_key,
                    json.encode({ item_key = "do-1", dedup_key = "do-1", op = "upsert", payload = { directive = "late" } }), PAST })
            run(automation_id, "drain_once")
            test.eq((ledger_row(automation_id, "do-1") :: Map).state, "resolved")
            test.eq(#log_rows(automation_id, "drain_once"), 1)
            local d = read_drive(automation_id, "drain_once")
            test.eq(d.cursor, "7")
            test.eq(d.unresolved_count, 0)
            test.is_nil(last_completion().options.rearm)
        end)

        test.it("continues an event drive at once while its source has more and waits for wake demand after the last page", function()
            event_drive("burst", { round = { page_size = 2 } })
            env.append("b1")
            env.append("b2")
            env.append("b3")
            run(automation_id, "burst")
            test.eq(#log_rows(automation_id, "burst"), 2)
            test.is_true(last_completion().options.rearm <= drive.utc_now())
            run(automation_id, "burst")
            test.eq(#log_rows(automation_id, "burst"), 3)
            test.is_nil(last_completion().options.rearm)
        end)
        end
    end)
end

return {
    run_lifecycle = test.run_cases(function() define_tests(1) end),
    run_delivery = test.run_cases(function() define_tests(2) end),
}
