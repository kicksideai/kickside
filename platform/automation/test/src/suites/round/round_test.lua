-- The automation round (design v5 §4.1-4.4, §5.2) over a real installed
-- automation, real drive, ledger and retention pin rows, a real thread and the
-- real events and timer pullables. Two seams mirror the real wrappers: the
-- slot completion (jobs.complete with the dispatched lease) is captured, and
-- run_as calls its target in-process under the automation's own actor, as
-- execution_identity.run_as does after resolving it. Runs on SQLite and
-- PostgreSQL.

local test = require("test")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local drive = require("drive")
local pin = require("retention_pin")
local slot = require("slot")
local ledger = require("round_ledger")
local row_size = require("row_size")
local h = require("round_harness")
local errors = require("errors")
local engine_harness = require("automation_test_engine")

type Map = { [string]: any }

local PAST = h.PAST
local EVENT_TYPE = h.EVENT_TYPE
local OUTPUT_EVENT_TYPE = h.OUTPUT_EVENT_TYPE
local db, exec, query = h.db, h.exec, h.query
local read_drive, new_drive, set_drive = h.read_drive, h.new_drive, h.set_drive
local log_rows, ledger_row = h.log_rows, h.ledger_row

-- Jobs store timestamps in each database's native representation, so compare
-- against its clock rather than attempting to parse the driver's result.
local function dispatcher_state(dispatcher_id: string): Map?
    local opened = db()
    local dialect = tostring(opened:type())
    opened:release()
    local due = dialect == "sqlite"
        and "CASE WHEN scheduled_at IS NOT NULL AND julianday(scheduled_at) <= julianday('now') THEN 1 ELSE 0 END"
        or "CASE WHEN scheduled_at IS NOT NULL AND scheduled_at <= CURRENT_TIMESTAMP THEN TRUE ELSE FALSE END"
    return query("SELECT status,scheduled_at," .. due .. " AS is_due FROM kickside_job WHERE id=$1", { dispatcher_id })[1]
end

local function dispatcher_is_due(dispatcher: Map): boolean
    return dispatcher.is_due == true or dispatcher.is_due == 1 or dispatcher.is_due == "1" or dispatcher.is_due == "t"
end

local function define_tests()
    test.describe("automation round", function()
        local env: Map = {}
        local automation_id, thread_id = "", ""
        local append: (string) -> () = function(_: string) end
        local append_output: (string?) -> (any?, any?) = function(_actor_id: string?): (any?, any?) return nil, nil end
        local run: (string, string, any?, any?, any?) -> (Map?, any) = function(_: string, _k: string, _run_as: any?, _recover: any?, _check: any?): (Map?, any) return nil, nil end
        local last_completion: () -> Map = function(): Map return {} end
        test.before_all(function()
            env = h.setup("round_owner")
            automation_id, thread_id = env.automation_id, env.thread_id
            append, append_output, run, last_completion = env.append, env.append_output, env.run, env.last_completion
        end)


        for _, source_kind in ipairs({ "timer", "collection" }) do
            test.it("activates an idle " .. source_kind .. " drive before its first scheduled occurrence", function()
                local key = "scheduled_" .. source_kind
                new_drive({ automation_id = automation_id, drive_key = key, source_kind = source_kind,
                    action = { source_ref = "kickside.automation.round.fixture:records",
                        schedule = { type = "interval", expression = "1h" } } })
                test.eq(read_drive(automation_id, key).phase, "pending")
                local notifications, completions = #env.notifications, #env.completions
                local _, err = run(automation_id, key)
                test.is_nil(err, tostring(err))
                local waiting = read_drive(automation_id, key)
                test.eq(waiting.phase, "active")
                test.is_true(drive.after(waiting.next_run_at, drive.utc_now()))
                test.eq(waiting.round_seq, 0)
                test.is_nil(waiting.round_token)
                test.is_nil(waiting.occurrence_seq)
                test.eq(waiting.last_committed_occurrence_seq, 0)
                test.eq(#log_rows(automation_id, key), 0)
                test.eq(last_completion().options.rearm, waiting.next_run_at)
                test.eq(#env.notifications, notifications + 1)
                local notice = env.notifications[#env.notifications]
                test.eq(notice.phase, "active")
                test.eq(notice.completions, completions)

                local _, again_err = run(automation_id, key)
                test.is_nil(again_err, tostring(again_err))
                test.eq(read_drive(automation_id, key).next_run_at, waiting.next_run_at)
                test.eq(read_drive(automation_id, key).phase, "active")
            end)
        end

        test.it("notifies the component channel after an empty round commits its phase", function()
            local key = "phase_notify"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:phase", event_type = EVENT_TYPE } })
            local before = #env.notifications
            local completions = #env.completions
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            test.eq(#env.notifications, before + 1)
            local notice = env.notifications[#env.notifications]
            test.eq(notice.id, automation_id)
            test.is_nil(notice.topic)
            test.eq(notice.data.event, "component.meta.changed")
            test.eq(notice.data.component_id, automation_id)
            test.eq(notice.phase, "active", "notification must observe committed phase")
            test.eq(notice.completions, completions, "notify before completing the slot")
        end)

        test.it("wakes receipt maintenance when an empty event round releases its fence", function()
            local key, source_port = "empty_retention_release", "fixture:empty-retention-release"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = source_port, event_type = EVENT_TYPE } })
            -- The mapped-receipt guard treats a non-object admission journal as
            -- active work; model the settled journal retained by live drives.
            set_drive(automation_id, key, "admission_json='{}'", {})
            exec([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                VALUES ($1,$2,'aged','default','aged','{"id":"remote"}',$3)]], { automation_id, source_port, PAST })
            local dispatcher_id, dispatcher_err = slot.ensure_dispatcher()
            test.is_nil(dispatcher_err, tostring(dispatcher_err))
            test.not_nil(dispatcher_id)
            local future = "2999-01-01T00:00:00Z"
            exec([[UPDATE kickside_job SET status='pending',scheduled_at=$1,lease_token=NULL,lease_until=NULL,
                wake_enabled=TRUE,wake_demand_at=NULL,wake_control_pending=FALSE WHERE id=$2]], { future, dispatcher_id })

            local _, round_err = run(automation_id, key)
            test.is_nil(round_err, tostring(round_err))
            local dispatcher = dispatcher_state(dispatcher_id)
            test.not_nil(dispatcher)
            test.is_true(dispatcher.status == "running" or
                (type(dispatcher.scheduled_at) == "string" and dispatcher_is_due(dispatcher)),
                "releasing a retention blocker must demand a fresh dispatcher pass")
        end)

        test.it("propagates a component notification error after committing", function()
            local key = "phase_notify_error"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:phase", event_type = EVENT_TYPE } })
            local dispatcher_id, dispatcher_err = slot.ensure_dispatcher()
            test.is_nil(dispatcher_err, tostring(dispatcher_err))
            local future = "2999-01-01T00:00:00Z"
            exec([[UPDATE kickside_job SET status='pending',scheduled_at=$1,lease_token=NULL,lease_until=NULL,
                wake_enabled=TRUE,wake_demand_at=NULL,wake_control_pending=FALSE WHERE id=$2]], { future, dispatcher_id })
            env.notify_error = errors.new({ kind = errors.UNAVAILABLE, message = "notification failed" })
            local expected = env.notify_error
            local before = #env.completions
            local _, err = run(automation_id, key)
            env.notify_error = nil
            test.eq(err, expected)
            test.eq(read_drive(automation_id, key).phase, "active")
            test.eq(#env.completions, before)
            local dispatcher = dispatcher_state(dispatcher_id)
            test.not_nil(dispatcher)
            test.is_true(dispatcher.status == "running" or
                (type(dispatcher.scheduled_at) == "string" and dispatcher_is_due(dispatcher)),
                "the committed release must wake maintenance before notification can fail")
        end)

        test.it("logs a committed terminal delivery failure with its item and reason", function()
            local key = "dead_visible"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = {
                    { key = "bad", directive = "fail_dead" },
                } }, schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local before = #env.warnings
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            test.eq(ledger_row(automation_id, "bad").state, "dead")
            test.eq(#env.warnings, before + 1)
            local warning = env.warnings[#env.warnings]
            test.eq(warning.fields.automation_id, automation_id)
            test.eq(warning.fields.drive_key, key)
            test.eq(warning.fields.item_key, "bad")
            test.eq(warning.fields.message, "bad record")
            run(automation_id, key)
            test.eq(#env.warnings, before + 1, "a replay must not log the dead delivery again")
        end)

        test.it("delivers two revisions of a record in order from the ledger after the cursor passed them", function()
            local key = "ordered_revisions"
            local port = "kickside.automation.round.fixture:records"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                action = { source_ref = port, config = { items = {
                    { key = "mutable", dedup_key = "revision:1", directive = "fail_retry" },
                    { key = "mutable", dedup_key = "revision:2", directive = "second" },
                } }, schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local _, first_err = run(automation_id, key)
            test.is_nil(first_err, tostring(first_err))
            test.eq(json.decode(read_drive(automation_id, key).cursor), 2, "the cursor passes both revisions; the ledger keeps their order")
            test.eq((ledger_row(automation_id, "mutable") :: Map).state, "retrying")
            local before = #log_rows(automation_id, key)
            local _, waiting_err = run(automation_id, key)
            test.is_nil(waiting_err, tostring(waiting_err))
            test.eq(#log_rows(automation_id, key), before, "later revision cannot pass the older retry floor")
            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND source_port=$3", { PAST, automation_id, port })
            for _ = 1, 3 do
                local _, err = run(automation_id, key)
                test.is_nil(err, tostring(err))
            end
            local rows = log_rows(automation_id, key)
            test.eq(#rows, 3, "one failed first attempt, then both revisions once")
            test.eq(json.decode(rows[1].detail_json).directive, "fail_retry")
            test.eq(json.decode(rows[2].detail_json).directive, "fail_retry")
            test.eq(json.decode(rows[3].detail_json).directive, "second")
            test.eq(json.decode(read_drive(automation_id, key).cursor), 2)
        end)

        test.it("delivers a page's completed record once while another record of the page retries", function()
            local key, port = "page_retry", "kickside.automation.round.fixture:records"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                action = { source_ref = port, config = { items = {
                    { key = "completed" }, { key = "pending", directive = "fail_retry" },
                } }, schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            run(automation_id, key)
            test.is_nil(ledger_row(automation_id, "completed"), "a first-attempt delivery leaves no ledger row")
            test.eq(json.decode(read_drive(automation_id, key).cursor), 2, "the cursor passes the whole page")
            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND source_port=$3", { PAST, automation_id, port })
            run(automation_id, key)
            test.eq(#log_rows(automation_id, key), 3, "the completed record is not sent again")
            test.eq(json.decode(read_drive(automation_id, key).cursor), 2)
        end)

        test.it("honors the pull provider floor on an empty continuing page", function()
            local key = "paced_pull"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records",
                    config = { items = {}, continuing = true, retry_after_ms = 90000 },
                    schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local before = drive.utc_after(90000)
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            test.is_true(last_completion().options.rearm >= before)
            test.is_true(read_drive(automation_id, key).next_run_at >= before)
        end)

        test.it("delivers a thread's events once, advances the event sequence and parks for wake demand", function()
            new_drive({ automation_id = automation_id, drive_key = "feed", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:events", event_type = EVENT_TYPE } })
            append("one")
            append("two")
            local out, err = run(automation_id, "feed")
            test.is_nil(err, tostring(err))
            test.is_true(out.self_completed)
            test.eq(#log_rows(automation_id, "feed"), 2)
            local d = read_drive(automation_id, "feed")
            test.is_true(d.event_seq >= 2)
            test.is_nil(d.round_token)
            test.eq(d.phase, drive.PHASE.ACTIVE)
            test.eq(d.round_seq, 1)
            test.is_nil(last_completion().options.rearm)
            test.is_nil(last_completion().options.record)

            local again, again_err = run(automation_id, "feed")
            test.is_nil(again_err, tostring(again_err))
            test.eq(#log_rows(automation_id, "feed"), 2)
            append("three")
            run(automation_id, "feed")
            test.eq(#log_rows(automation_id, "feed"), 3)
        end)

        test.it("does not trigger Automation from a stranger's refused source output append", function()
            local drive_key = "forged_output"
            new_drive({ automation_id = automation_id, drive_key = drive_key, source_kind = "event",
                source_thread_id = thread_id,
                action = { source_ref = "fixture:forged_output", event_type = OUTPUT_EVENT_TYPE } })

            local appended, append_err = append_output("round-stranger")
            test.is_nil(appended)
            test.not_nil(append_err)
            test.is_true(errors.is(append_err, errors.PERMISSION_DENIED) or errors.is(append_err, errors.NOT_FOUND))

            local result, run_err = run(automation_id, drive_key)
            test.is_nil(run_err, tostring(run_err))
            test.is_true(result.self_completed)
            test.eq(#log_rows(automation_id, drive_key), 0)
            test.eq(read_drive(automation_id, drive_key).event_seq, 0)
        end)

        test.it("parks an empty event round without looking for a retry when none is unresolved", function()
            new_drive({ automation_id = automation_id, drive_key = "empty_no_retry", source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:empty_no_retry", event_type = EVENT_TYPE } })
            set_drive(automation_id, "empty_no_retry", "event_seq = (SELECT COALESCE(MAX(seq), 0) FROM kickside_event WHERE thread_id = $1)", { thread_id })
            local head = read_drive(automation_id, "empty_no_retry").event_seq
            local core = db()
            local receipt, pin_err = pin.pin_lower(core, { thread_id = thread_id,
                consumer_key = "drive:" .. automation_id .. ":empty_no_retry",
                command_id = "install:" .. automation_id, command_generation = 1, target_cursor = head })
            core:release()
            test.is_nil(pin_err, tostring(pin_err))
            set_drive(automation_id, "empty_no_retry", "pin_generation = $1", { receipt.pin_generation })
            local original = ledger.next_attempt
            local reads = 0
            ledger.next_attempt = function(executor: any, owner_id: string, source_port: string): (string?, error?)
                reads = reads + 1
                return original(executor, owner_id, source_port)
            end
            local original_raise = pin.pin_raise
            local raises = 0
            pin.pin_raise = function(pin_db: any, request: any): (any?, error?)
                raises = raises + 1
                return original_raise(pin_db, request)
            end
            local result, err = run(automation_id, "empty_no_retry")
            ledger.next_attempt = original
            pin.pin_raise = original_raise
            test.is_nil(err, tostring(err))
            test.is_true(result.self_completed)
            local finished = read_drive(automation_id, "empty_no_retry")
            test.eq(finished.unresolved_count, 0)
            test.eq(finished.round_seq, 1)
            test.eq(finished.event_seq, head)
            test.is_nil(last_completion().options.rearm)
            test.eq(reads, 0)
            test.eq(raises, 0)
        end)

        test.it("records failures in the ledger, redelivers a due retry and counts unresolved items on the drive", function()
            new_drive({ automation_id = automation_id, drive_key = "ledger", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:ledger", event_type = EVENT_TYPE } })
            set_drive(automation_id, "ledger", "event_seq = (SELECT event_seq FROM kickside_automation_drive WHERE automation_id = $1 AND drive_key = 'feed')", { automation_id })
            append("fail_retry")
            append("fail_dead")
            append("wait")
            append("uncertain")
            append("skip")
            local _, err = run(automation_id, "ledger")
            test.is_nil(err, tostring(err))
            local rows = log_rows(automation_id, "ledger")
            test.eq(#rows, 5)
            local states: Map = {}
            for _, r in ipairs(rows) do
                local l = ledger_row(automation_id, r.item_key)
                states[json.decode(r.detail_json).directive] = l and l.state or "none"
            end
            test.eq(states.fail_retry, "retrying")
            test.eq(states.fail_dead, "dead")
            for _, r in ipairs(rows) do
                if json.decode(r.detail_json).directive == "fail_dead" then
                    test.is_nil((ledger_row(automation_id, r.item_key) :: Map).expires_at, "dead evidence has no automatic expiry")
                end
            end
            test.eq(states.wait, "waiting")
            test.eq(states.uncertain, "uncertain")
            test.eq(states.skip, "none", "a first-attempt skip writes no ledger row")
            test.eq(read_drive(automation_id, "ledger").unresolved_count, 3)
            test.not_nil(last_completion().options.rearm)

            local retry_key = ""
            for _, r in ipairs(rows) do if json.decode(r.detail_json).directive == "fail_retry" then retry_key = r.item_key end end
            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at = $1 WHERE owner_id = $2 AND item_key = $3", { PAST, automation_id, retry_key })
            local _, redeliver_err = run(automation_id, "ledger")
            test.is_nil(redeliver_err, tostring(redeliver_err))
            local redelivered = log_rows(automation_id, "ledger")
            test.eq(#redelivered, 6)
            test.eq(redelivered[6].item_key, retry_key)
            test.eq(tonumber(redelivered[6].attempts), 1)
            test.eq((ledger_row(automation_id, retry_key) :: Map).state, "resolved")
            test.eq(read_drive(automation_id, "ledger").unresolved_count, 2)
        end)

        test.it("names the execution principal and its operator on the delivered drive", function()
            new_drive({ automation_id = automation_id, drive_key = "identity", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:identity", event_type = EVENT_TYPE } })
            set_drive(automation_id, "identity", "event_seq = (SELECT COALESCE(MAX(seq), 0) FROM kickside_event WHERE thread_id = $1)", { thread_id })
            append("observe_identity")
            run(automation_id, "identity")
            local observed: Map? = nil
            for _, r in ipairs(log_rows(automation_id, "identity")) do
                local detail = json.decode(r.detail_json)
                if detail.principal ~= nil then observed = detail end
            end
            test.not_nil(observed)
            test.eq((observed :: Map).principal.kind, "user")
            test.eq((observed :: Map).principal.id, env.owner)
            test.eq((observed :: Map).operator.id, env.owner)
        end)

        test.it("retries a failed pin advance on a quiet source at its durable deadline", function()
            local key = "quiet_pin"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:quiet_pin", event_type = EVENT_TYPE } })
            local core = db()
            local receipt, pin_err = pin.pin_lower(core, { thread_id = thread_id,
                consumer_key = "drive:" .. automation_id .. ":" .. key,
                command_id = "quiet-install:" .. automation_id, command_generation = 1, target_cursor = 0 })
            core:release()
            test.is_nil(pin_err, tostring(pin_err))
            set_drive(automation_id, key, "event_seq=(SELECT COALESCE(MAX(seq),0) FROM kickside_event WHERE thread_id=$1)", { thread_id })
            append("quiet success")
            -- A real failed Core raise after the fenced event cursor commit.
            set_drive(automation_id, key, "pin_generation=$1", { (receipt.pin_generation :: integer) + 1 })
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, key)
            test.not_nil(d.pin_next_at, "failed advance has a durable exact retry deadline")
            test.eq(d.pin_advance_cursor, d.event_seq)
            test.not_nil(d.pin_error_json)
            exec("UPDATE kickside_retention_pin SET generation=$1 WHERE thread_id=$2 AND consumer_key=$3",
                { d.pin_generation, thread_id, "drive:" .. automation_id .. ":" .. key })
            local cutoff = time.parse(time.RFC3339, d.pin_next_at):add(-time.SECOND):format(time.RFC3339)
            local clock_drive: Map = {}
            for name, value in pairs(drive) do clock_drive[name] = value end
            clock_drive.utc_now = function(): string return cutoff end
            local recovery = engine_harness.new({ drive = clock_drive })
            local before, before_err = recovery.dispatch({ limit = 1000 })
            test.is_nil(before_err, tostring(before_err))
            test.eq(before.pins_advanced, 0)
            -- The dispatcher also schedules retention and other owners' work;
            -- this pin's deadline must remain included in its earliest wake.
            test.not_nil(before.next_deadline)
            test.is_true(before.next_deadline <= d.pin_next_at)
            test.not_nil(read_drive(automation_id, key).pin_advance_cursor)
            cutoff = d.pin_next_at
            -- A newly constructed dispatcher observes the persisted intent.
            local after, after_err = engine_harness.new({ drive = clock_drive }).dispatch({ limit = 1000 })
            test.is_nil(after_err, tostring(after_err))
            test.eq(after.pins_advanced, 1)
            test.is_nil(read_drive(automation_id, key).pin_advance_cursor)
            local rows = query("SELECT cursor_seq FROM kickside_retention_pin WHERE thread_id=$1 AND consumer_key=$2",
                { thread_id, "drive:" .. automation_id .. ":" .. key })
            test.eq(tonumber(rows[1].cursor_seq), d.event_seq)
        end)

        test.it("raises the drive's retention pin to its committed event sequence", function()
            new_drive({ automation_id = automation_id, drive_key = "pinned", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:pinned", event_type = EVENT_TYPE } })
            local core = db()
            local receipt, pin_err = pin.pin_lower(core, { thread_id = thread_id, consumer_key = "drive:" .. automation_id .. ":pinned",
                command_id = "install:" .. automation_id, command_generation = 1, target_cursor = 0 })
            core:release()
            test.is_nil(pin_err, tostring(pin_err))
            set_drive(automation_id, "pinned", "pin_generation = $1", { receipt.pin_generation })
            local _, err = run(automation_id, "pinned")
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, "pinned")
            local pins = query("SELECT cursor_seq FROM kickside_retention_pin WHERE thread_id = $1 AND consumer_key = $2",
                { thread_id, "drive:" .. automation_id .. ":pinned" })
            test.eq(tonumber(pins[1].cursor_seq), d.event_seq, json.encode(d))
        end)

    end)
end

-- The round cases run as separate test entries (these, the cases below and
-- sink_test.lua) so each entry's live round work stays well inside the
-- runner's per-entry budget.
local function define_more_tests()
    test.describe("automation round: schedules, controls, blocks and the live slot", function()
        local env: Map = {}
        local automation_id, thread_id = "", ""
        local append: (string) -> () = function(_: string) end
        local run: (string, string, any?, any?, any?) -> (Map?, any) = function(_: string, _k: string, _run_as: any?, _recover: any?, _check: any?): (Map?, any) return nil, nil end
        local last_completion: () -> Map = function(): Map return {} end
        test.before_all(function()
            env = h.setup("round_owner_2")
            automation_id, thread_id = env.automation_id, env.thread_id
            append, run, last_completion = env.append, env.run, env.last_completion
        end)


        test.it("delivers a timer source once per persisted occurrence and consumes it", function()
            new_drive({ automation_id = automation_id, drive_key = "ping", source_kind = "timer",
                action = { schedule = { type = "interval", expression = "1h" } } })
            run(automation_id, "ping")
            local armed = read_drive(automation_id, "ping")
            test.is_nil(armed.occurrence_seq)
            test.eq(last_completion().options.rearm, armed.next_run_at)

            set_drive(automation_id, "ping", "next_run_at = $1", { PAST })
            local _, err = run(automation_id, "ping")
            test.is_nil(err, tostring(err))
            local pings = query("SELECT item_key, detail_json FROM round_fixture_log WHERE automation_id = $1 AND drive_key = 'ping'", { automation_id })
            test.eq(#pings, 1, json.encode(read_drive(automation_id, "ping")) .. json.encode(last_completion()))
            test.eq(pings[1].item_key, "ping:1")
            test.eq(json.decode(pings[1].detail_json).fired_at, PAST)
            local d = read_drive(automation_id, "ping")
            test.eq(d.last_committed_occurrence_seq, 1)
            test.is_nil(d.occurrence_seq)
            test.is_true(d.next_run_at > drive.utc_now())
        end)

        test.it("retries a persisted occurrence under its own key after a failed attempt", function()
            new_drive({ automation_id = automation_id, drive_key = "tick", source_kind = "timer",
                action = { schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, "tick", "next_run_at = $1, occurrence_seq = 4, occurrence_due_at = $2, occurrence_key = 'tick:4',"
                .. " occurrence_payload_json = $3, last_committed_occurrence_seq = 3", { PAST, PAST, json.encode({ fired_at = PAST }) })
            local _, err = run(automation_id, "tick")
            test.is_nil(err, tostring(err))
            local ticks = query("SELECT item_key FROM round_fixture_log WHERE automation_id = $1 AND item_key = 'tick:4'", { automation_id })
            test.eq(#ticks, 1)
            test.eq(read_drive(automation_id, "tick").last_committed_occurrence_seq, 4)
        end)

        test.it("rearms an occupied drive after the holder's deadline and parks a paused one", function()
            new_drive({ automation_id = automation_id, drive_key = "busy", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:busy", event_type = EVENT_TYPE } })
            local holder_until = time.now():utc():add(300 * time.SECOND):format(time.RFC3339)
            set_drive(automation_id, "busy", "round_token = 'other', round_until = $1", { holder_until })
            run(automation_id, "busy")
            test.is_true(last_completion().options.rearm > holder_until, json.encode(last_completion()) .. " vs " .. holder_until)
            test.eq(read_drive(automation_id, "busy").round_token, "other")

            set_drive(automation_id, "busy", "round_token = NULL, round_until = NULL, phase = 'paused'", {})
            run(automation_id, "busy")
            test.eq(last_completion().options.record.status, "parked")
            test.is_nil(read_drive(automation_id, "busy").round_token)
        end)

        test.it("discards a round whose drive a control fenced during the round", function()
            new_drive({ automation_id = automation_id, drive_key = "fenced", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:fenced", event_type = EVENT_TYPE } })
            append("fenced")
            local notifications = #env.notifications
            local _, err = env.run(automation_id, "fenced", function(identity: any, target: string, args: any, opts: any): (any?, any)
                if target == "kickside.automation:round_deliver" then
                    local d = db()
                    local tx = d:begin()
                    drive.fence_for_command_tx(tx, automation_id, { "fenced" }, "control-1", 99)
                    tx:commit()
                    d:release()
                end
                return env.run_as(identity, target, args, opts)
            end)
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, "fenced")
            test.eq(d.event_seq, 0)
            test.eq(d.pending_command_id, "control-1")
            test.eq(#env.notifications, notifications)
        end)

        test.it("blocks the drive visibly on a deterministic source failure", function()
            new_drive({ automation_id = automation_id, drive_key = "broken", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:missing_port", schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, "broken", "next_run_at = $1", { PAST })
            local notifications = #env.notifications
            local _, err = run(automation_id, "broken")
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, "broken")
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION, json.encode(d) .. json.encode(last_completion()))
            test.eq(#env.notifications, notifications + 1)
            test.eq(env.notifications[#env.notifications].phase, drive.PHASE.BLOCKED_DECLARATION)
            test.contains(tostring(d.last_error_json), "missing_port")
            test.is_nil(d.round_token)
            test.eq(last_completion().options.record.status, "parked")
        end)

        test.it("parks a drive whose round answers one row above the row byte limit", function()
            new_drive({ automation_id = automation_id, drive_key = "oversized", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:oversized", event_type = EVENT_TYPE } })
            append("oversized")
            local _, err = run(automation_id, "oversized", function(identity: any, target: string, args: any, opts: any): (any?, any)
                if target == "kickside.automation:round_deliver" then
                    return nil, row_size.refusal(automation_id, 4194305, 4194304, "destination_receipt")
                end
                return env.run_as(identity, target, args, opts)
            end)
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, "oversized")
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION, json.encode(d))
            test.contains(tostring(d.last_error_json), "row limit")
            test.eq(d.event_seq, 0)
            test.eq(last_completion().options.record.status, "parked")
        end)

        test.it("parks a drive whose kind implements no round consumer and leaves its state", function()
            local installed, install_err = env.caller:call("kickside.automation.agent:automations_manage", {
                action = "install", type = h.NON_ROUND_KIND, input = { title = "Non-round fixture" } })
            test.is_nil(install_err, tostring(install_err))
            test.not_nil(installed)
            local non_round_id = installed.id
            new_drive({ automation_id = non_round_id, drive_key = "feed", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:non_round", event_type = EVENT_TYPE } })
            local _, err = run(non_round_id, "feed")
            test.is_nil(err, tostring(err))
            test.eq(last_completion().options.record.status, "parked")
            local d = read_drive(non_round_id, "feed")
            test.eq(d.event_seq, 0)
            test.eq(d.phase, drive.PHASE.PENDING)
        end)

        test.it("checks the live lease before delivery but lets an empty commit use its own fence", function()
            local current = query("SELECT MAX(seq) AS seq FROM kickside_event WHERE thread_id=$1", { thread_id })[1]
            local at_head = math.floor(tonumber(current.seq) or 0)
            local checks = 0
            local check = function(): (boolean, any)
                checks = checks + 1
                return true, nil
            end
            new_drive({ automation_id = automation_id, drive_key = "empty_guard", source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:empty_guard", event_type = EVENT_TYPE } })
            set_drive(automation_id, "empty_guard", "event_seq=$1", { at_head })
            local empty, empty_err = run(automation_id, "empty_guard", nil, nil, check)
            test.is_nil(empty_err, tostring(empty_err))
            test.is_true(empty.self_completed)
            test.eq(checks, 0)

            new_drive({ automation_id = automation_id, drive_key = "item_guard", source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:item_guard", event_type = EVENT_TYPE } })
            set_drive(automation_id, "item_guard", "event_seq=$1", { at_head })
            append("lease guard item")
            local item, item_err = run(automation_id, "item_guard", nil, nil, check)
            test.is_nil(item_err, tostring(item_err))
            test.is_true(item.self_completed)
            test.eq(checks, 1)
        end)

        test.it("rejects an empty round commit fenced by a concurrent command", function()
            local current = query("SELECT MAX(seq) AS seq FROM kickside_event WHERE thread_id=$1", { thread_id })[1]
            new_drive({ automation_id = automation_id, drive_key = "empty_race", source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:empty_race", event_type = EVENT_TYPE } })
            set_drive(automation_id, "empty_race", "event_seq=$1", { math.floor(tonumber(current.seq) or 0) })
            local _, err = run(automation_id, "empty_race", function(identity: any, target: string, args: any, opts: any): (any?, any)
                if target == "kickside.automation:round_acquire" then
                    local d = db()
                    local tx = d:begin()
                    local _, fence_err = drive.fence_for_command_tx(tx, automation_id, { "empty_race" }, "empty-command", 101)
                    if fence_err then tx:rollback() else tx:commit() end
                    d:release()
                    test.is_nil(fence_err, tostring(fence_err))
                end
                return env.run_as(identity, target, args, opts)
            end)
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, "empty_race")
            test.eq(d.pending_command_id, "empty-command")
            test.is_nil(d.last_round_at)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
local run_more_cases = test.run_cases(define_more_tests)

return {
    run = function(options: any): any return run_cases(options) end,
    run_more = function(options: any): any return run_more_cases(options) end,
}
