-- Drive controls (design v5 §4.7, §7.5; CONTRACTS §8, §19): pause, resume,
-- run_now, replay and resync enter the automation's command stream through the
-- automations_manage tool as the owner, change the drive and its ledger, and
-- the round honours the result. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local uuid = require("uuid")
local errors = require("errors")
local drive = require("drive")
local h = require("round_harness")

type Map = { [string]: any }

local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local READ_TOOL = "kickside.automation.agent:automations_read"

local function define_tests(group: integer)
    test.describe("drive controls", function()
        local env: Map = {}

        local function control(args: Map): Map
            local call: Map = { action = "control", id = env.automation_id }
            for k, v in pairs(args) do call[k] = v end
            local result, err = env.caller:call(MANAGE_TOOL, call)
            if err then error("control transport: " .. tostring(err)) end
            return result :: Map
        end

        local function status_of(drive_key: string): Map
            local result = env.caller:call(READ_TOOL, { action = "status", id = env.automation_id })
            for _, d in ipairs((result.drives or {}) :: { Map }) do
                if d.drive_key == drive_key then return d end
            end
            error("status lists no drive " .. drive_key .. ": " .. json.encode(result))
        end

        local function event_drive(drive_key: string): ()
            h.new_drive({ automation_id = env.automation_id, drive_key = drive_key, source_kind = "event",
                source_thread_id = env.thread_id, action = { source_ref = "fixture:" .. drive_key, event_type = h.EVENT_TYPE } })
        end

        test.before_all(function() env = h.setup("control_owner") end)

        local function control_error(args: any): any
            local result, err = env.caller:call(MANAGE_TOOL, {
                action = "control", id = env.automation_id, control = args.control,
                drive_key = args.drive_key, request_id = args.request_id, keys = args.keys,
            })
            test.is_nil(result)
            test.not_nil(err)
            return err
        end

        if group == 1 then
        test.it("pauses a drive so its round parks, and resumes it with wake demand the round acknowledges", function()
            event_drive("paused")
            local paused = control({ control = "pause", drive_key = "paused" })
            test.is_true(paused.success, tostring(paused.error))
            test.eq(paused.state, "succeeded")
            local d = h.read_drive(env.automation_id, "paused")
            test.eq(d.phase, drive.PHASE.PAUSED)
            test.is_false(d.enabled)
            test.is_nil(d.pending_command_id)
            env.append("while paused")
            env.run(env.automation_id, "paused")
            test.eq(env.last_completion().options.record.status, "parked")
            test.eq(#h.log_rows(env.automation_id, "paused"), 0)

            local again = control({ control = "pause", drive_key = "paused" })
            test.is_true(again.success, tostring(again.error))

            local resumed = control({ control = "resume", drive_key = "paused" })
            test.is_true(resumed.success, tostring(resumed.error))
            local r = h.read_drive(env.automation_id, "paused")
            test.eq(r.phase, drive.PHASE.ACTIVE)
            test.is_true(r.enabled)
            test.is_true(status_of("paused").wake_pending)
            env.run(env.automation_id, "paused")
            test.is_true(#h.log_rows(env.automation_id, "paused") > 0)
            test.is_false(status_of("paused").wake_pending)
        end)

        test.it("resumes a corrected declaration, access or identity block with acknowledged wake demand", function()
            for _, phase in ipairs({ drive.PHASE.BLOCKED_DECLARATION, drive.PHASE.BLOCKED_ACCESS, drive.PHASE.BLOCKED_IDENTITY }) do
                event_drive(phase)
                env.append("while " .. phase)
                h.set_drive(env.automation_id, phase, "phase = $1, last_error_json = $2",
                    { phase, json.encode({ kind = errors.INVALID, message = "fixed by the operator", attempts = 1 }) })
                env.run(env.automation_id, phase)
                test.eq(env.last_completion().options.record.status, "parked")
                test.eq(#h.log_rows(env.automation_id, phase), 0)

                local resumed = control({ control = "resume", drive_key = phase })
                test.is_true(resumed.success, tostring(resumed.error))
                test.is_true(resumed.outcome.changed, json.encode(resumed))
                local r = h.read_drive(env.automation_id, phase)
                test.eq(r.phase, drive.PHASE.ACTIVE)
                test.is_true(r.enabled)
                test.is_true(status_of(phase).wake_pending)
                env.run(env.automation_id, phase)
                test.is_true(#h.log_rows(env.automation_id, phase) > 0, phase)
                test.is_false(status_of(phase).wake_pending)
            end
        end)

        test.it("keeps a drive blocked on a deleted source parked through resume", function()
            for _, phase in ipairs({ drive.PHASE.BLOCKED_SOURCE_DELETED }) do
                event_drive(phase)
                h.set_drive(env.automation_id, phase, "phase = $1", { phase })
                local resumed = control({ control = "resume", drive_key = phase })
                test.is_true(resumed.success, tostring(resumed.error))
                test.is_false(resumed.outcome.changed, json.encode(resumed))
                test.eq(h.read_drive(env.automation_id, phase).phase, phase)
            end
        end)

        test.it("runs a drive blocked on its declaration again once a reconfigure corrects the declaration", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "all" } })
            test.is_true(installed.success, tostring(installed.error))
            local id = installed.id
            h.set_drive(id, "main", "phase = $1, last_error_json = $2",
                { drive.PHASE.BLOCKED_DECLARATION, json.encode({ kind = errors.INVALID, message = "bad declaration", attempts = 1 }) })
            local reconfigured = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id, input = { thread_id = env.thread_id, start = "all" } })
            test.is_true(reconfigured.success, tostring(reconfigured.error))
            local d = h.read_drive(id, "main")
            test.eq(d.phase, drive.PHASE.ACTIVE)
            test.is_true(d.enabled)
            test.is_true(d.wake_generation > d.wake_applied_generation)
            env.append("after the correction")
            env.run(id, "main")
            test.is_true(#h.log_rows(id, "main") > 0)
        end)

        test.it("makes a scheduled drive due at once with run_now", function()
            h.new_drive({ automation_id = env.automation_id, drive_key = "nightly", source_kind = "timer",
                action = { schedule = { type = "cron", expression = "0 3 * * *" } } })
            env.run(env.automation_id, "nightly")
            test.is_true(h.read_drive(env.automation_id, "nightly").next_run_at > drive.utc_now())
            local ran = control({ control = "run_now", drive_key = "nightly" })
            test.is_true(ran.success, tostring(ran.error))
            test.eq(ran.state, "succeeded")
            test.eq(ran.outcome.round, "queued")
            test.is_true(h.read_drive(env.automation_id, "nightly").next_run_at <= drive.utc_now())
            env.run(env.automation_id, "nightly")
            local pings = h.query("SELECT item_key FROM round_fixture_log WHERE automation_id = $1 AND item_key = 'nightly:1'", { env.automation_id })
            test.eq(#pings, 1)
        end)

        test.it("reconfigures the native timer cadence in place and retires its source without reusing occurrence keys", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install",
                type = "kickside.automation.round.fixture:scheduled_kind", input = { cadence = "1h" } })
            test.is_true(installed.success, tostring(installed.error))
            local id = tostring(installed.id)
            local first = h.read_drive(id, "main")
            test.not_nil(first.job_id)
            local invalid, invalid_err = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id,
                input = { cadence = "" } })
            test.is_nil(invalid)
            test.not_nil(invalid_err)
            test.eq(h.read_drive(id, "main").action.schedule.expression, "1h")
            local due = env.caller:call(MANAGE_TOOL, { action = "control", id = id,
                control = "run_now", drive_key = "main" })
            test.is_true(due.success, tostring(due.error))
            local _, first_err = env.run(id, "main")
            test.is_nil(first_err, tostring(first_err))
            test.eq(h.read_drive(id, "main").last_committed_occurrence_seq, 1)

            local changed = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id,
                input = { cadence = "4h" } })
            test.is_true(changed.success, tostring(changed.error))
            local cadence = h.read_drive(id, "main")
            test.eq(cadence.action.schedule.expression, "4h")
            test.eq(cadence.last_committed_occurrence_seq, 1)
            test.is_nil(cadence.next_run_at)
            local _, arm_err = env.run(id, "main")
            test.is_nil(arm_err, tostring(arm_err))
            local armed = h.read_drive(id, "main")
            test.is_true(armed.next_run_at > drive.utc_after(3 * 3600000))
            test.is_true(armed.next_run_at < drive.utc_after(5 * 3600000))
            h.set_drive(id, "main", "next_run_at = $1", { h.PAST })
            local _, next_err = env.run(id, "main")
            test.is_nil(next_err, tostring(next_err))
            test.eq(h.read_drive(id, "main").last_committed_occurrence_seq, 2)
            test.eq(#h.query("SELECT item_key FROM round_fixture_log WHERE automation_id = $1 AND item_key = 'main:2'", { id }), 1)

            local removed = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id,
                input = { cadence = "4h", remove = true } })
            test.is_true(removed.success, tostring(removed.error))
            test.eq(h.read_drive(id, "main").source_kind, "none")
            local job = h.query("SELECT status FROM kickside_job WHERE id = $1", { first.job_id })
            test.eq(job[1].status, "cancelled")
            test.eq(h.read_drive(id, "main").last_committed_occurrence_seq, 2)
        end)

        test.it("keeps an uncommitted timer occurrence stable across a cadence edit", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install",
                type = "kickside.automation.round.fixture:scheduled_kind", input = { cadence = "1h" } })
            test.is_true(installed.success, tostring(installed.error))
            local id = tostring(installed.id)
            h.set_drive(id, "main", "last_committed_occurrence_seq = 6, occurrence_seq = 7,"
                .. " occurrence_due_at = $1, occurrence_key = 'main:7', occurrence_payload_json = $2, next_run_at = $3",
                { h.PAST, json.encode({ fired_at = h.PAST }), h.PAST })
            local changed = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id,
                input = { cadence = "4h" } })
            test.is_true(changed.success, tostring(changed.error))
            local pending = h.read_drive(id, "main")
            test.eq(pending.occurrence_seq, 7)
            test.eq(pending.occurrence_key, "main:7")
            test.eq(pending.occurrence_due_at, h.PAST)
            local _, err = env.run(id, "main")
            test.is_nil(err, tostring(err))
            test.eq(h.read_drive(id, "main").last_committed_occurrence_seq, 7)
            test.eq(#h.query("SELECT item_key FROM round_fixture_log WHERE automation_id = $1 AND item_key = 'main:7'", { id }), 1)
            test.is_true(h.read_drive(id, "main").next_run_at > drive.utc_after(3 * 3600000))
        end)

        test.it("makes a reconcile drive due at once with run_now", function()
            h.new_drive({ automation_id = env.automation_id, drive_key = "reconcile", source_kind = "reconcile",
                action = { source_ref = "kickside.automation.round.fixture:records",
                    pull_keys = "kickside.automation.round.fixture:record_keys", config = { items = {} } } })
            h.set_drive(env.automation_id, "reconcile", "reconcile_next_at = $1", { "2099-01-01T00:00:00Z" })
            local ran = control({ control = "run_now", drive_key = "reconcile" })
            test.is_true(ran.success, tostring(ran.error))
            test.is_true(h.read_drive(env.automation_id, "reconcile").reconcile_next_at <= drive.utc_now())
        end)

        test.it("reconfigures the reconcile drive with the collection source", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install",
                type = "kickside.automation.round.fixture:collection_kind",
                input = { items = { { key = "retained" }, { key = "removed" } } } })
            test.is_true(installed.success, tostring(installed.error))
            local id = tostring(installed.id)
            local changed = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id,
                input = { items = { { key = "retained" } } } })
            test.is_true(changed.success, tostring(changed.error))
            local main = h.read_drive(id, "main")
            local reconcile = h.read_drive(id, "reconcile")
            test.eq(#main.action.config.items, 1)
            test.eq(#reconcile.action.config.items, 1)
            test.eq(reconcile.action.config.items[1].key, "retained")
            test.is_true(reconcile.reconcile_next_at <= drive.utc_now())
        end)

        end
        if group == 2 then
        test.it("replays dead and uncertain items under a request id and the round redelivers them", function()
            event_drive("replayed")
            h.set_drive(env.automation_id, "replayed", "event_seq = (SELECT COALESCE(MAX(seq), 0) FROM kickside_event WHERE thread_id = $1)", { env.thread_id })
            env.append("fail_dead")
            env.append("uncertain")
            env.run(env.automation_id, "replayed")
            test.eq(h.read_drive(env.automation_id, "replayed").unresolved_count, 1)

            local missing = control_error({ control = "replay", drive_key = "replayed" })
            test.not_nil(missing)
            test.contains(tostring(missing), "request_id")

            local replayed = control({ control = "replay", drive_key = "replayed", request_id = "replay-1" })
            test.is_true(replayed.success, tostring(replayed.error))
            test.eq(replayed.outcome.replayed, 2)
            local retried = h.query("SELECT envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND source_port=$2",
                { env.automation_id, "fixture:replayed" })
            for _, row in ipairs(retried) do test.eq(json.decode(row.envelope_json).attempt_generation, 1) end
            test.eq(h.read_drive(env.automation_id, "replayed").unresolved_count, 2)
            local repeated = control({ control = "replay", drive_key = "replayed", request_id = "replay-1" })
            test.is_true(repeated.success, tostring(repeated.error))
            test.eq(repeated.generation, replayed.generation)

            env.run(env.automation_id, "replayed")
            local rows = h.log_rows(env.automation_id, "replayed")
            test.eq(#rows, 4)
            test.eq(tonumber(rows[3].attempts), 1)
        end)

        test.it("discards selected uncertain items durably without another send", function()
            event_drive("discarded")
            h.set_drive(env.automation_id, "discarded", "event_seq = (SELECT COALESCE(MAX(seq), 0) FROM kickside_event WHERE thread_id = $1)", { env.thread_id })
            env.append("uncertain")
            env.run(env.automation_id, "discarded")
            local items = h.query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND source_port=$2 AND state='uncertain'",
                { env.automation_id, "fixture:discarded" })
            test.eq(#items, 1)
            local before = #h.log_rows(env.automation_id, "discarded")
            local args = { control = "discard", drive_key = "discarded", request_id = "discard-1", keys = { items[1].item_key } }
            local discarded = control(args)
            test.is_true(discarded.success, tostring(discarded.error))
            test.eq(discarded.outcome.discarded, 1)
            test.eq(h.read_drive(env.automation_id, "discarded").unresolved_count, 0)
            local repeated = control(args)
            test.eq(repeated.generation, discarded.generation)
            env.run(env.automation_id, "discarded")
            test.eq(#h.log_rows(env.automation_id, "discarded"), before)
        end)

        test.it("resyncs a collection drive from its beginning under a new rewind generation", function()
            h.new_drive({ automation_id = env.automation_id, drive_key = "resynced", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = { { key = "r-1" }, { key = "r-2" } } },
                    schedule = { type = "interval", expression = "1h" } } })
            h.set_drive(env.automation_id, "resynced", "next_run_at = $1", { h.PAST })
            env.run(env.automation_id, "resynced")
            test.eq(#h.log_rows(env.automation_id, "resynced"), 2)
            local before = h.read_drive(env.automation_id, "resynced")

            local resynced = control({ control = "resync", drive_key = "resynced", request_id = "resync-1" })
            test.is_true(resynced.success, tostring(resynced.error))
            test.eq(resynced.outcome.round, "queued")
            local d = h.read_drive(env.automation_id, "resynced")
            test.is_nil(d.cursor)
            test.eq(d.rewind_generation, before.rewind_generation + 1)
            test.eq(d.delivery_revision, before.delivery_revision + 1)
            test.is_true(d.next_run_at <= drive.utc_now())
            env.run(env.automation_id, "resynced")
            test.eq(#h.log_rows(env.automation_id, "resynced"), 4)
        end)

        test.it("resyncs an event drive by lowering its retention pin first, and refuses a position below the prune boundary", function()
            env = h.setup("control_resync")
            event_drive("rewound")
            env.append("rewind me")
            env.run(env.automation_id, "rewound")
            local delivered = #h.log_rows(env.automation_id, "rewound")
            test.is_true(delivered > 0)

            local before = h.read_drive(env.automation_id, "rewound")
            local resynced = control({ control = "resync", drive_key = "rewound", request_id = "resync-event-1" })
            test.is_true(resynced.success, tostring(resynced.error))
            test.eq(resynced.outcome.round, "queued")
            local d = h.read_drive(env.automation_id, "rewound")
            test.eq(d.event_seq, 0)
            test.eq(d.delivery_revision, before.delivery_revision + 1)
            test.not_nil(d.pin_generation)
            local pins = h.query("SELECT cursor_seq FROM kickside_retention_pin WHERE thread_id = $1 AND consumer_key = $2",
                { env.thread_id, "drive:" .. env.automation_id .. ":rewound" })
            test.eq(tonumber(pins[1].cursor_seq), 0)
            env.run(env.automation_id, "rewound")
            test.eq(#h.log_rows(env.automation_id, "rewound"), delivered * 2)

            h.exec("UPDATE kickside_thread SET max_pruned_seq = 1 WHERE id = $1", { env.thread_id })
            local refused, refused_err = env.caller:call(MANAGE_TOOL, { action = "control", id = env.automation_id,
                control = "resync", drive_key = "rewound", request_id = "resync-event-2" })
            h.exec("UPDATE kickside_thread SET max_pruned_seq = 0 WHERE id = $1", { env.thread_id })
            test.is_nil(refused)
            test.is_true(errors.is(refused_err, errors.CONFLICT))
            test.contains(tostring(refused_err), "prune boundary")
            -- The same recorded refusal through the catalog/MCP call route
            -- must retain its typed error instead of a successful action result.
            local called, call_err = env.caller:call(MANAGE_TOOL, { action = "call", id = env.automation_id,
                method = "resync", args = { drive_key = "rewound", request_id = "resync-event-2" } })
            test.is_nil(called)
            test.is_true(errors.is(call_err, errors.CONFLICT))
            test.contains(tostring(call_err), "prune boundary")
            test.eq(call_err:details().request_id, "resync-event-2")
            local observed, observed_err = env.caller:call(READ_TOOL, { action = "status", id = env.automation_id })
            test.is_nil(observed_err)
            test.is_true(observed.success)
            local details = refused_err:details()
            test.eq(details.state, "failed")
            test.eq(observed.commands.generation, details.generation)
            test.is_nil(observed.commands.pending)
            test.is_true(h.read_drive(env.automation_id, "rewound").event_seq > 0)
            test.eq(h.read_drive(env.automation_id, "rewound").delivery_revision, d.delivery_revision)
            test.is_nil(h.read_drive(env.automation_id, "rewound").pending_command_id)
        end)

        test.it("installs an event drive with its retention pin lowered under the install command", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id } })
            test.is_true(installed.success, tostring(installed.error))
            local main = h.read_drive(installed.id, "main")
            test.eq(main.source_kind, "event")
            test.not_nil(main.pin_generation)
            local pins = h.query("SELECT cursor_seq, command_id, command_generation, generation FROM kickside_retention_pin"
                .. " WHERE thread_id = $1 AND consumer_key = $2", { env.thread_id, "drive:" .. installed.id .. ":main" })
            test.eq(#pins, 1)
            test.eq(tonumber(pins[1].cursor_seq), 0)
            test.eq(pins[1].command_id, "install:" .. installed.id)
            test.eq(tonumber(pins[1].generation), main.pin_generation)
        end)

        test.it("installs a new-only event drive at the thread head with its pin there", function()
            env.append("history one")
            env.append("history two")
            local head = tonumber(h.query("SELECT COALESCE(MAX(seq), 0) AS head FROM kickside_event WHERE thread_id = $1",
                { env.thread_id })[1].head)
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "new" } })
            test.is_true(installed.success, tostring(installed.error))
            local main = h.read_drive(installed.id, "main")
            test.eq(main.event_seq, head)
            local pins = h.query("SELECT cursor_seq FROM kickside_retention_pin WHERE thread_id = $1 AND consumer_key = $2",
                { env.thread_id, "drive:" .. installed.id .. ":main" })
            test.eq(tonumber(pins[1].cursor_seq), head)
            env.run(installed.id, "main")
            test.eq(#h.log_rows(installed.id, "main"), 0)
            env.append("after install")
            env.run(installed.id, "main")
            local rows = h.log_rows(installed.id, "main")
            test.eq(#rows, 1)
            test.eq(json.decode(rows[1].detail_json).directive, "after install")
        end)

        test.it("refuses to install an event drive whose start lies below the thread's prune boundary", function()
            h.exec("UPDATE kickside_thread SET max_pruned_seq = 1 WHERE id = $1", { env.thread_id })
            local installed, installed_err = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id } })
            h.exec("UPDATE kickside_thread SET max_pruned_seq = 0 WHERE id = $1", { env.thread_id })
            test.is_nil(installed)
            test.not_nil(installed_err)
            test.contains(tostring(installed_err), "prune")
        end)

        end
        if group == 3 then
        test.it("releases the pin of an install that failed after lowering it, behind a tombstone, with a visible outcome", function()
            local stranger_id = "stranger_owner_" .. uuid.v4():sub(1, 8)
            local stranger = require("funcs").new():with_actor(require("security").new_actor(stranger_id, { security_groups = { "automation_test" } }))
                :with_scope(env.scope)
            local foreign = stranger:call(MANAGE_TOOL, { action = "install", type = h.NON_ROUND_KIND, input = { title = "Foreign" } })
            test.is_true(foreign.success, tostring(foreign.error))

            local failed, failed_err = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "all" }, parent_id = foreign.id })
            test.is_nil(failed)
            test.not_nil(failed_err)
            local tombs = h.query("SELECT consumer_key, command_id, terminal_op_id FROM kickside_retention_pin_tombstone"
                .. " WHERE thread_id = $1 AND terminal_op_id LIKE 'install:%'", { env.thread_id })
            test.eq(#tombs, 1)
            local automation_id = string.sub(tombs[1].terminal_op_id, #"install:" + 1)
            test.eq(tombs[1].consumer_key, "drive:" .. automation_id .. ":main")
            local pins = h.query("SELECT cursor_seq FROM kickside_retention_pin WHERE thread_id = $1 AND consumer_key = $2",
                { env.thread_id, tombs[1].consumer_key })
            test.eq(#pins, 0)
            local cleanup = h.query("SELECT request_id, state, outcome_json FROM kickside_automation_op WHERE automation_id = $1"
                .. " AND request_id = $2", { automation_id, tombs[1].command_id })
            test.eq(#cleanup, 1)
            test.eq(cleanup[1].state, "succeeded")
            test.eq(json.decode(cleanup[1].outcome_json).released, 1)
            local install_op = h.query("SELECT state FROM kickside_automation_op WHERE automation_id = $1 AND request_id = $2",
                { automation_id, "install:" .. automation_id })
            test.eq(install_op[1].state, "failed")
            test.eq(#h.query("SELECT drive_key FROM kickside_automation_drive WHERE automation_id = $1", { automation_id }), 0)
        end)

        test.it("keeps an event resync pending through a failed pin step and completes it through drive and dispatcher recovery", function()
            local real_pin = require("retention_pin")
            local failing = true
            local flaky_pin = {
                pin_lower = function(db: any, request: Map): (any?, any)
                    if failing then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "core pin store unavailable" }) end
                    return real_pin.pin_lower(db, request)
                end,
                cleanup_tombstone_tx = real_pin.cleanup_tombstone_tx,
            }
            local engine = require("automation_test_engine").new({
                retention_pin = flaky_pin,
            })
            for _, drive_key in ipairs({ "deferred_a", "deferred_b" }) do
                event_drive(drive_key)
                env.append("before resync " .. drive_key)
                env.run(env.automation_id, drive_key)
                test.is_true(h.read_drive(env.automation_id, drive_key).event_seq > 0)
            end

            -- recover_drive: the drive's own recovery runs the pending step.
            local pending, err = env.caller:call("kickside.automation:resync_control_probe", {id = env.automation_id,
                control = { control = "resync", drive_key = "deferred_a", request_id = "resync-deferred-a" }})
            test.is_nil(err, tostring(err))
            test.eq(pending.state, "pending")
            local held = h.read_drive(env.automation_id, "deferred_a")
            test.eq(held.pending_command_id, "resync-deferred-a")
            test.is_true(held.event_seq > 0)
            failing = false
            local recovered, recover_err = engine.recover_drive(env.automation_id, "deferred_a")
            test.is_nil(recover_err, tostring(recover_err))
            test.is_true(recovered.stamp)
            test.eq(recovered.state, "succeeded")
            local a = h.read_drive(env.automation_id, "deferred_a")
            test.eq(a.event_seq, 0)
            test.is_nil(a.pending_command_id)
            test.not_nil(a.pin_generation)

            -- The dispatcher runs a due deferred step as well.
            failing = true
            local second = env.caller:call("kickside.automation:resync_control_probe", {id = env.automation_id,
                control = { control = "resync", drive_key = "deferred_b", request_id = "resync-deferred-b" }})
            test.eq(second.state, "pending")
            failing = false
            h.exec("UPDATE kickside_automation_command SET next_attempt_at = $1 WHERE automation_id = $2", { h.PAST, env.automation_id })
            local _, dispatch_err = engine.dispatch({ limit = 1000 })
            test.is_nil(dispatch_err, tostring(dispatch_err))
            local b = h.read_drive(env.automation_id, "deferred_b")
            test.eq(b.event_seq, 0)
            test.is_nil(b.pending_command_id)
            local op = h.query("SELECT state FROM kickside_automation_op WHERE automation_id = $1 AND request_id = 'resync-deferred-b'",
                { env.automation_id })
            test.eq(op[1].state, "succeeded")
        end)

        test.it("recovers a WRITE sharee's resync through its live group grant without changing execution identity", function()
            local installed, install_err = env.caller:call(MANAGE_TOOL, {action = "install",
                type = "kickside.automation.round.fixture:event_kind", input = {thread_id = env.thread_id, start = "all"}})
            test.is_nil(install_err, tostring(install_err))
            local id = installed.id
            h.set_drive(id, "main", "event_seq=$1", {17})
            local before = h.query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id})[1].private_context
            local granted, grant_err = env.caller:call("kickside.component.binding:grant_subtree_func", {
                root_component_id = id, subject = {subject_type = "group", subject_id = "automation_test"}, access_mask = 2})
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(granted.success)
            local caller = require("funcs").new():with_actor(require("security").new_actor("sharee_" .. uuid.v7(),
                {security_groups = {"automation_test"}})):with_scope(env.scope)
            local pending, pending_err = caller:call("kickside.automation:resync_control_probe", {id = id,
                control = {control = "resync", request_id = "shared-resync", from = 0}})
            test.is_nil(pending_err, tostring(pending_err))
            test.eq(pending.state, "pending")
            h.exec("UPDATE kickside_component_access SET access_mask=0 WHERE component_id=$1 AND subject_type='group' AND subject_id=$2",
                {id, "automation_test"})
            local engine = require("automation_test_engine").new({})
            local denied, denied_err = engine.recover_drive(id, "main")
            test.is_nil(denied_err, tostring(denied_err))
            test.eq(h.read_drive(id, "main").event_seq, 17)
            test.not_nil(h.read_drive(id, "main").pending_command_id)
            local receipts = h.query("SELECT target_receipts_json FROM kickside_automation_op WHERE automation_id=$1 AND request_id='shared-resync'", {id})
            test.is_nil(json.decode(receipts[1].target_receipts_json)["pin:main"])
            h.exec("UPDATE kickside_component_access SET access_mask=2 WHERE component_id=$1 AND subject_type='group' AND subject_id=$2",
                {id, "automation_test"})
            local recovered, recovery_err = engine.recover_drive(id, "main")
            test.is_nil(recovery_err, tostring(recovery_err))
            test.eq(h.read_drive(id, "main").event_seq, 0)
            test.is_nil(h.read_drive(id, "main").pending_command_id)
            test.eq(h.query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id})[1].private_context, before)
        end)

        test.it("reconfigures an event automation onto a new thread: new pin, new position, re-keyed slot, old pin released", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "all" } })
            test.is_true(installed.success, tostring(installed.error))
            local id = installed.id
            local before = h.read_drive(id, "main")
            local created = env.threads:upsert({ thread_class = "kickside.test.round",
                impl_id = "kickside.automation.round.fixture:round_source_kind",
                external_ref = "round-next:" .. env.owner, title = "Next source" })
            local next_thread = tostring(created.thread_id)
            env.threads:append_event({ thread_id = next_thread, event = { type = h.EVENT_TYPE, role = "user", body = { text = "old history" } } })

            local reconfigured = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id, input = { thread_id = next_thread, start = "new" } })
            test.is_true(reconfigured.success, tostring(reconfigured.error))
            local d = h.read_drive(id, "main")
            test.eq(d.source_thread_id, next_thread)
            test.eq(d.event_seq, 1)
            test.is_nil(d.pending_command_id)
            test.eq(d.rewind_generation, before.rewind_generation + 1)
            local new_pin = h.query("SELECT cursor_seq, generation FROM kickside_retention_pin WHERE thread_id = $1 AND consumer_key = $2",
                { next_thread, "drive:" .. id .. ":main" })
            test.eq(tonumber(new_pin[1].cursor_seq), 1)
            test.eq(tonumber(new_pin[1].generation), d.pin_generation)
            local old_pin = h.query("SELECT cursor_seq FROM kickside_retention_pin WHERE thread_id = $1 AND consumer_key = $2",
                { env.thread_id, "drive:" .. id .. ":main" })
            test.eq(#old_pin, 0)
            local tomb = h.query("SELECT terminal_op_id FROM kickside_retention_pin_tombstone WHERE thread_id = $1 AND consumer_key = $2",
                { env.thread_id, "drive:" .. id .. ":main" })
            test.eq(#tomb, 1)
            local jobs_rows = h.query("SELECT wake_key FROM kickside_job WHERE id = $1", { d.job_id })
            test.eq(jobs_rows[1].wake_key, "thread:" .. next_thread)
        end)

        test.it("resolves the drive policy into the applied state at install and a reconfigure's declared overrides, within limits", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "new" } })
            test.is_true(installed.success, tostring(installed.error))
            local d = h.read_drive(installed.id, "main")
            test.eq(d.applied.declaration.thread_id, env.thread_id)
            test.eq(d.applied.policy.round.page_size, 100)
            test.eq(d.applied.policy.delivery.retry_after_ms, 10000)

            local reconfigured = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = installed.id,
                input = { thread_id = env.thread_id, start = "new", page_size = 7 } })
            test.is_true(reconfigured.success, tostring(reconfigured.error))
            test.eq(h.read_drive(installed.id, "main").applied.policy.round.page_size, 7)

            local refused, refused_err = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "new", page_size = 5000 } })
            test.is_nil(refused)
            test.not_nil(refused_err)
            test.contains(tostring(refused_err), "limits")
        end)

        test.it("reconfigures without a source change and keeps the drive's position and pin", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "all" } })
            local id = installed.id
            env.run(id, "main")
            local before = h.read_drive(id, "main")
            local reconfigured = env.caller:call(MANAGE_TOOL, { action = "reconfigure", id = id, input = { thread_id = env.thread_id, start = "all" } })
            test.is_true(reconfigured.success, tostring(reconfigured.error))
            local d = h.read_drive(id, "main")
            test.eq(d.event_seq, before.event_seq)
            test.eq(d.pin_generation, before.pin_generation)
            test.eq(d.rewind_generation, before.rewind_generation)
        end)

        test.it("refuses a control from a caller without WRITE access and an unknown control", function()
            event_drive("guarded")
            local stranger = require("funcs").new():with_actor(require("security").new_actor("stranger_" .. uuid.v4():sub(1, 8), {}))
                :with_scope(env.scope)
            local denied, denied_err = stranger:call(MANAGE_TOOL, { action = "control", id = env.automation_id, control = "pause", drive_key = "guarded" })
            test.is_nil(denied)
            test.not_nil(denied_err)
            test.eq(h.read_drive(env.automation_id, "guarded").phase, drive.PHASE.PENDING)
            local unknown = control_error({ control = "explode", drive_key = "guarded" })
            test.not_nil(unknown)
        end)
        end
    end)
end

local cases = {}
for group = 1, 3 do
    local selected = group
    cases[group] = test.run_cases(function() define_tests(selected) end)
end

return {
    run_1 = function(options: any): any return cases[1](options) end,
    run_2 = function(options: any): any return cases[2](options) end,
    run_3 = function(options: any): any return cases[3](options) end,
}
