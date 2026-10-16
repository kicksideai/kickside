-- Round limits (design v5 §4.11 admission, §8 round policy) and the typed
-- failures of a drive's stored state: backpressure while unresolved items
-- reach round.max_unresolved, the page and item bounds of one scheduled pass,
-- the drive round deadline, a stamp-time declaration failure, a corrupt
-- cursor and a malformed event position. Runs on SQLite and PostgreSQL.

local test = require("test")
local registry = require("registry")
local json = require("json")
local time = require("time")
local drive = require("drive")
local runtime_policy = require("runtime_policy")
local h = require("round_harness")

type Map = { [string]: any }

local PAST = h.PAST
local EVENT_TYPE = h.EVENT_TYPE
local read_drive, new_drive, set_drive, log_rows, ledger_row = h.read_drive, h.new_drive, h.set_drive, h.log_rows, h.ledger_row

local function unix(timestamp: string): integer
    return math.floor((time.parse(time.RFC3339, timestamp) :: any):unix())
end

local function records(n: integer): { Map }
    local items: { Map } = {}
    for i = 1, n do items[i] = { key = "rec-" .. tostring(i) } end
    return items
end

local function define_tests()
    test.describe("automation round limits", function()
        local env: Map = {}
        local automation_id, thread_id = "", ""
        local run: (string, string) -> (Map?, any) = function(_: string, _k: string): (Map?, any) return nil, nil end
        local last_completion: () -> Map = function(): Map return {} end

        test.before_all(function()
            env = h.setup("round_limits")
            automation_id, thread_id = env.automation_id, env.thread_id
            run, last_completion = env.run, env.last_completion
        end)


        test.it("resolves the round limits of the registered policy into a drive policy validated against its limits", function()
            local p, err = runtime_policy.drive_policy({})
            test.is_nil(err, tostring(err))
            test.eq(p.round.max_unresolved, 1000)
            test.eq(p.round.max_pages, 50)
            test.eq(p.round.max_items, 0)
            test.eq(p.round.timeout_ms, 600000)
            test.eq(p.round.page_size, 100)
            test.eq(p.delivery.retry_after_ms, 10000)
            local declared = runtime_policy.drive_policy({ round = { page_size = 7, max_items = 20 }, delivery = { retry_after_ms = 20000 } })
            test.eq(declared.round.page_size, 7)
            test.eq(declared.round.max_items, 20)
            test.eq(declared.delivery.retry_after_ms, 20000)
            local _, over_err = runtime_policy.drive_policy({ round = { page_size = 5000 } })
            test.not_nil(over_err)
            test.contains(tostring(over_err), "limits")
            local _, unknown_err = runtime_policy.drive_policy({ round = { timeout_ms = 1 } })
            test.not_nil(unknown_err)
            local bad = runtime_policy.resolve({
                command = { retry_after_ms = 1, max_delay_ms = 1 }, dispatcher = { batch = 1 },
                round = { page_size = 1, redelivery_per_round = 1, retry_after_ms = 1, max_delay_ms = 1,
                    max_pages = 1, max_items = -1, timeout = "1m", max_unresolved = 1 },
                limits = { page_size = 1, max_pages = 1, max_items = 1 },
                delivery = { retry_after_ms = 1, max_delay_ms = 1 },
                retention = { ledger_resolved = "1d", ops = "1d", prepared = "7d", receipts = "30d" } })
            test.is_nil(bad)
            -- The commit reserve is carved out of the round's deadline.
            local reserved, reserved_err = runtime_policy.policy()
            test.is_nil(reserved_err)
            test.eq(reserved.round_commit_reserve_ms, 30000)
            local registered = registry.get(runtime_policy.ENTRY) :: any
            local encoded = json.encode(registered.meta)
            local meta = json.decode(encoded :: string)
            meta.round.commit_reserve = meta.round.timeout
            local _, reserve_err = runtime_policy.resolve(meta)
            test.not_nil(reserve_err)
            test.contains(tostring(reserve_err), "round.commit_reserve must be shorter than round.timeout")
        end)

        test.it("holds pulling in backpressure while unresolved items reach round.max_unresolved and resumes once drained", function()
            new_drive({ automation_id = automation_id, drive_key = "pressure", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:pressure", event_type = EVENT_TYPE }, policy = { round = { max_unresolved = 2 } } })
            env.append("fail_retry")
            env.append("wait")
            run(automation_id, "pressure")
            local first = read_drive(automation_id, "pressure")
            test.eq(first.unresolved_count, 2)
            test.eq(#log_rows(automation_id, "pressure"), 2)

            env.append("later")
            run(automation_id, "pressure")
            local held = read_drive(automation_id, "pressure")
            test.eq(held.phase, "backpressure")
            test.eq(held.event_seq, first.event_seq)
            test.eq(#log_rows(automation_id, "pressure"), 2)
            test.not_nil(last_completion().options.rearm, "a backpressured drive rearms at its next redelivery")

            local retry_key = ""
            for _, r in ipairs(log_rows(automation_id, "pressure")) do
                if json.decode(r.detail_json).directive == "fail_retry" then retry_key = r.item_key end
            end
            h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at = $1 WHERE owner_id = $2 AND item_key = $3",
                { PAST, automation_id, retry_key })
            run(automation_id, "pressure")
            test.eq((ledger_row(automation_id, retry_key) :: Map).state, "resolved")
            test.eq(read_drive(automation_id, "pressure").unresolved_count, 1)
            test.is_true(last_completion().options.rearm <= drive.utc_now(), "a drained drive rearms at once to resume pulling")

            run(automation_id, "pressure")
            local resumed = read_drive(automation_id, "pressure")
            test.eq(resumed.phase, drive.PHASE.ACTIVE)
            test.is_true(resumed.event_seq > first.event_seq, "the cursor passes the later change while the waiting one retries from the ledger")
            test.eq(resumed.unresolved_count, 1)
            test.eq(#log_rows(automation_id, "pressure"), 4)
        end)

        test.it("does not accumulate unresolved ledger rows through repeated failed rounds", function()
            new_drive({ automation_id = automation_id, drive_key = "bounded_failures", source_kind = "event",
                source_thread_id = thread_id,
                action = { source_ref = "fixture:bounded_failures", event_type = EVENT_TYPE },
                policy = { round = { max_unresolved = 2, page_size = 2 } } })
            env.append("fail_retry")
            env.append("fail_retry")
            run(automation_id, "bounded_failures")
            test.eq(read_drive(automation_id, "bounded_failures").unresolved_count, 2)
            test.eq(#log_rows(automation_id, "bounded_failures"), 2)

            for _ = 1, 5 do
                env.append("fail_retry")
                run(automation_id, "bounded_failures")
                test.eq(read_drive(automation_id, "bounded_failures").phase, "backpressure")
                test.eq(#log_rows(automation_id, "bounded_failures"), 2,
                    "a backpressured source must retain retry evidence without acquiring more rows")
            end
        end)

        test.it("ends a scheduled pass after round.max_pages pages and continues from its cursor at the next due time", function()
            new_drive({ automation_id = automation_id, drive_key = "paged", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = records(250) },
                    schedule = { type = "interval", expression = "30m" } }, policy = { round = { page_size = 100, max_pages = 2 } } })
            set_drive(automation_id, "paged", "next_run_at = $1", { PAST })
            run(automation_id, "paged")
            test.eq(#log_rows(automation_id, "paged"), 100)
            test.is_true(last_completion().options.rearm <= drive.utc_now())
            run(automation_id, "paged")
            test.eq(#log_rows(automation_id, "paged"), 200)
            test.is_true(last_completion().options.rearm > drive.utc_now(), "the pass ends at max_pages and waits for its schedule")
            test.eq(json.decode(read_drive(automation_id, "paged").cursor), 200)
            run(automation_id, "paged")
            test.eq(#log_rows(automation_id, "paged"), 200, "a pass that ended at its bound waits for the schedule")

            set_drive(automation_id, "paged", "next_run_at = $1", { PAST })
            run(automation_id, "paged")
            test.eq(#log_rows(automation_id, "paged"), 250)
            test.is_true(last_completion().options.rearm > drive.utc_now())
        end)

        test.it("bounds a scheduled pass by round.max_items, shrinking its last page to the remaining budget", function()
            local counted_env = h.setup("round_counted")
            local automation_id, run, last_completion = counted_env.automation_id, counted_env.run, counted_env.last_completion
            new_drive({ automation_id = automation_id, drive_key = "counted", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = records(400) },
                    schedule = { type = "interval", expression = "30m" } },
                policy = { round = { page_size = 100, max_pages = 50, max_items = 150 } } })
            set_drive(automation_id, "counted", "next_run_at = $1", { PAST })
            run(automation_id, "counted")
            test.eq(#log_rows(automation_id, "counted"), 100)
            run(automation_id, "counted")
            test.eq(#log_rows(automation_id, "counted"), 150)
            test.is_true(last_completion().options.rearm > drive.utc_now())
            test.eq(json.decode(read_drive(automation_id, "counted").cursor), 150)
        end)

        test.it("holds the drive for round.timeout, independent of the job lease", function()
            new_drive({ automation_id = automation_id, drive_key = "lease", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records",
                    config = { items = { { key = "observed", directive = "observe_lease" } } },
                    schedule = { type = "interval", expression = "30m" } }, policy = { round = { timeout_ms = 600000 } } })
            set_drive(automation_id, "lease", "next_run_at = $1", { PAST })
            local before = os.time()
            run(automation_id, "lease")
            local observed: string? = nil
            for _, r in ipairs(log_rows(automation_id, "lease")) do
                local detail = json.decode(r.detail_json)
                if detail.round_until ~= nil then observed = detail.round_until end
            end
            test.not_nil(observed)
            local until_at = unix(observed :: string)
            test.is_true(until_at >= before + 590, "the round deadline is round.timeout past the stamp")
        end)

        test.it("delivers nothing once the round deadline lapsed and leaves the drive to the next attempt", function()
            new_drive({ automation_id = automation_id, drive_key = "lapsed", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records",
                    config = { items = records(3), lapse = { automation_id = automation_id, drive_key = "lapsed" } },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "lapsed", "next_run_at = $1", { PAST })
            run(automation_id, "lapsed")
            test.eq(#log_rows(automation_id, "lapsed"), 0)
            test.is_true(last_completion().options.rearm <= drive.utc_now())
            test.is_nil(read_drive(automation_id, "lapsed").cursor)
        end)

        test.it("blocks the drive visibly when its schedule cannot be resolved at stamp", function()
            new_drive({ automation_id = automation_id, drive_key = "bad_schedule", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = records(1) },
                    schedule = { type = "interval", expression = "not-a-duration" } } })
            run(automation_id, "bad_schedule")
            local d = read_drive(automation_id, "bad_schedule")
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION)
            test.not_nil(d.last_error_json)
            test.not_nil((string.find(json.decode(d.last_error_json).message, "schedule", 1, true)))
            test.eq(last_completion().options.record.status, "parked")
        end)

        test.it("blocks the drive visibly on a cursor that is not JSON instead of restarting the source", function()
            new_drive({ automation_id = automation_id, drive_key = "corrupt", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = records(3) },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "corrupt", "next_run_at = $1, cursor = $2", { PAST, "{not json" })
            run(automation_id, "corrupt")
            test.eq(#log_rows(automation_id, "corrupt"), 0)
            local d = read_drive(automation_id, "corrupt")
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION)
            test.not_nil((string.find(json.decode(d.last_error_json).message, "cursor", 1, true)))
        end)

        test.it("refuses an event page whose next position is not a sequence and keeps the drive's position", function()
            new_drive({ automation_id = automation_id, drive_key = "bad_position", source_kind = "event", source_thread_id = thread_id,
                action = { source_ref = "fixture:bad_position", event_type = EVENT_TYPE } })
            env.run(automation_id, "bad_position", function(identity: any, target: string, args: any, opts: any): (any?, any)
                if target == "kickside.automation:round_acquire" then
                    return { success = true, items = {}, next_cursor = "not-a-sequence", has_more = false }, nil
                end
                return env.run_as(identity, target, args, opts)
            end)
            local d = read_drive(automation_id, "bad_position")
            test.eq(d.event_seq, 0)
            test.eq(d.phase, drive.PHASE.BLOCKED_DECLARATION)
            test.not_nil((string.find(json.decode(d.last_error_json).message, "sequence", 1, true)))
        end)
    end)
end

return test.run_cases(define_tests)
