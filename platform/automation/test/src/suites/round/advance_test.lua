-- The round's cursor advances past items it could not deliver (owner decision
-- 2026-10-03): an unresolved item stays in the ledger, in its record's order,
-- and retries on its own pacing while later items keep flowing. The ledger
-- holds only items that are not delivered (retrying, waiting, uncertain,
-- dead) and the resolved tombstones of formerly unresolved items; every
-- terminal row carries an expiry. A destination receipt is written only when
-- the destination it maps changes, and every sink write names its origin.
-- Real installed fixture automation, drives, ledger and receipts; runs on
-- SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local drive = require("drive")
local h = require("round_harness")

type Map = { [string]: any }

local PAST = h.PAST
local SENTINEL = "2001-01-01T00:00:00Z"
local PORT = "kickside.automation.round.fixture:records"
local exec, query = h.exec, h.query
local read_drive, new_drive, set_drive = h.read_drive, h.new_drive, h.set_drive
local log_rows, ledger_row = h.log_rows, h.ledger_row

local function collection(items: { Map }): Map
    return { source_ref = PORT, config = { items = items }, schedule = { type = "interval", expression = "1h" } }
end

local function define_tests()
    test.describe("automation round: cursor advance and delivery bookkeeping", function()
        local automation_id = ""
        local env: Map = {}
        local run: (string, string, any?, any?, any?) -> (Map?, any) = function(_: string, _k: string, _run_as: any?, _recover: any?, _check: any?): (Map?, any) return nil, nil end

        test.before_each(function()
            env = h.setup("round_advance")
            automation_id, run = env.automation_id, env.run
        end)

        test.it("advances the cursor past an item that keeps failing and keeps delivering later items", function()
            local key = "stuck"
            local items: { Map } = { { key = "stuck-1", directive = "fail_always" }, { key = "ok-1" } }
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection", action = collection(items) })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            local d = read_drive(automation_id, key)
            test.eq(json.decode(d.cursor), 2, "the cursor passes the failing item")
            test.eq(d.unresolved_count, 1)
            test.eq((ledger_row(automation_id, "stuck-1") :: Map).state, "retrying")
            test.is_nil(ledger_row(automation_id, "ok-1"), "a first-attempt delivery writes no ledger row")

            items[3] = { key = "ok-2" }
            set_drive(automation_id, key, "action_json=$1, next_run_at=$2", { json.encode(collection(items)), PAST })
            local _, next_err = run(automation_id, key)
            test.is_nil(next_err, tostring(next_err))
            local delivered: { string } = {}
            for _, row in ipairs(log_rows(automation_id, key)) do delivered[#delivered + 1] = row.item_key end
            test.eq(table.concat(delivered, ","), "stuck-1,ok-1,ok-2", "the next page delivers while the stuck item waits its retry")
            test.eq(json.decode(read_drive(automation_id, key).cursor), 3)

            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND item_key='stuck-1'", { PAST, automation_id })
            local _, retry_err = run(automation_id, key)
            test.is_nil(retry_err, tostring(retry_err))
            local rows = log_rows(automation_id, key)
            test.eq(rows[#rows].item_key, "stuck-1")
            test.eq(tonumber(rows[#rows].attempts), 1, "the retry carries its recorded attempt")
            test.eq((ledger_row(automation_id, "stuck-1") :: Map).state, "retrying")
            test.eq(json.decode(read_drive(automation_id, key).cursor), 3, "a redelivery leaves the advanced cursor")
        end)

        test.it("keeps polling at its cadence while an undelivered item waits far in the future", function()
            local key = "poll_held"
            local items: { Map } = { { key = "held-1", directive = "wait" }, { key = "p-1" }, { key = "p-2" }, { key = "p-3" } }
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                action = collection(items), policy = { round = { page_size = 2 } } })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local far = drive.utc_after(86400000)
            local function round(): Map
                local _, err = run(automation_id, key)
                test.is_nil(err, tostring(err))
                exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND item_key='held-1'", { far, automation_id })
                return env.last_completion().options
            end
            local first = round()
            test.eq((ledger_row(automation_id, "held-1") :: Map).state, "waiting")
            test.not_nil(first.rearm)
            test.is_true(first.rearm <= drive.utc_now(), "a continuing pass rearms at once, not at the held item's retry: " .. tostring(first.rearm))
            local second = round()
            local delivered: { string } = {}
            for _, row in ipairs(log_rows(automation_id, key)) do delivered[#delivered + 1] = row.item_key end
            test.eq(table.concat(delivered, ","), "held-1,p-1,p-2,p-3", "the pass delivers past the held item")
            local d = read_drive(automation_id, key)
            test.not_nil(second.rearm)
            test.eq(second.rearm, d.next_run_at, "the finished pass rearms at the drive's cadence, before the held item's retry")
            test.is_true(d.next_run_at < far)
        end)

        test.it("writes no ledger row for a first-attempt delivery or skip and expires only resolved tombstones", function()
            local key = "first_attempt"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection", action = collection({
                { key = "d-1" }, { key = "s-1", directive = "skip" }, { key = "x-1", directive = "fail_dead" },
                { key = "r-1", directive = "fail_retry" } }) })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            test.is_nil(ledger_row(automation_id, "d-1"))
            test.is_nil(ledger_row(automation_id, "s-1"))
            test.eq((ledger_row(automation_id, "x-1") :: Map).state, "dead")
            test.is_nil((ledger_row(automation_id, "x-1") :: Map).expires_at, "dead evidence has no automatic expiry")

            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND item_key='r-1'", { PAST, automation_id })
            local _, retry_err = run(automation_id, key)
            test.is_nil(retry_err, tostring(retry_err))
            local resolved = ledger_row(automation_id, "r-1") :: Map
            test.eq(resolved.state, "resolved", "a formerly unresolved item keeps its tombstone")
            test.not_nil(resolved.expires_at)
            test.eq(#query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1"
                .. " AND state='resolved' AND expires_at IS NULL", { automation_id }), 0)
            test.eq(#query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1"
                .. " AND state='dead' AND expires_at IS NOT NULL", { automation_id }), 0)
            test.eq(read_drive(automation_id, key).unresolved_count, 0)
        end)

        test.it("rewrites no other ledger row in a round that holds an unresolved item", function()
            local key = "no_rewrite"
            local items: { Map } = { { key = "dead-1", directive = "fail_dead" }, { key = "dead-2", directive = "fail_dead" } }
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection", action = collection(items) })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            run(automation_id, key)
            local before = query("SELECT item_key, expires_at FROM kickside_trigger_item_ledger WHERE owner_id=$1 ORDER BY item_key", { automation_id })
            test.eq(#before, 2)
            exec("UPDATE kickside_trigger_item_ledger SET updated_at=$1 WHERE owner_id=$2", { SENTINEL, automation_id })

            items[3] = { key = "held-1", directive = "fail_always" }
            set_drive(automation_id, key, "action_json=$1, next_run_at=$2", { json.encode(collection(items)), PAST })
            run(automation_id, key)
            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND item_key='held-1'", { PAST, automation_id })
            run(automation_id, key)
            test.eq((ledger_row(automation_id, "held-1") :: Map).state, "retrying")
            local after = query("SELECT item_key, expires_at, updated_at FROM kickside_trigger_item_ledger"
                .. " WHERE owner_id=$1 AND state='dead' ORDER BY item_key", { automation_id })
            test.eq(#after, 2)
            for index, row in ipairs(after) do
                test.eq(row.expires_at, before[index].expires_at, "dead evidence keeps its retention state")
                test.eq(row.updated_at, SENTINEL, "a terminal row is not rewritten by another item's round")
            end
        end)

        test.it("writes a destination receipt only when its destination changes and names the writing origin", function()
            local key = "receipt_change"
            local items: { Map } = { { key = "w-1" } }
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store", replay_safe = true },
                action = collection(items) })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
            local receipts = query("SELECT identity_key FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='w-1'", { automation_id })
            test.eq(#receipts, 1)
            local identity_key = receipts[1].identity_key
            local writes = query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' AND item_key=$1 ORDER BY id", { identity_key })
            test.eq(#writes, 1)
            test.eq(json.decode(writes[1].detail_json).origin, automation_id, "the write names its origin")

            local function redeliver(revision: string): ()
                items[1] = { key = "w-1", dedup_key = "w-1:" .. revision }
                set_drive(automation_id, key, "action_json=$1, cursor=NULL, next_run_at=$2", { json.encode(collection(items)), PAST })
                local _, redeliver_err = run(automation_id, key)
                test.is_nil(redeliver_err, tostring(redeliver_err))
            end
            exec("UPDATE kickside_automation_receipt SET updated_at=$1 WHERE owner_id=$2", { SENTINEL, automation_id })
            redeliver("revision-2")
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key='sink' AND item_key=$1", { identity_key }), 2)
            local unchanged = query("SELECT dest_version, updated_at FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='w-1'", { automation_id })[1]
            test.eq(unchanged.updated_at, SENTINEL, "an unchanged destination writes no receipt")

            exec("UPDATE kickside_automation_receipt SET dest_version='stale' WHERE owner_id=$1", { automation_id })
            redeliver("revision-3")
            local changed = query("SELECT dest_version, updated_at FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='w-1'", { automation_id })[1]
            test.eq(changed.dest_version, "v1", "a changed destination is recorded")
            test.is_true(changed.updated_at ~= SENTINEL)
        end)

        test.it("resends an interrupted round's delivery under the same key and prepared payload", function()
            local key = "interrupted"
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" }, action = collection({ { key = "c-1" } }) })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
            -- The sink receives the write, then a control moves the fence: the
            -- round's commit is discarded as a crash before commit would be.
            local _, err = run(automation_id, key, function(identity: any, target: string, args: any, opts: any): (any?, any)
                local answer, call_err = env.run_as(identity, target, args, opts)
                if target == "kickside.automation:round_deliver" then
                    local d = h.db()
                    local tx = d:begin()
                    drive.fence_for_command_tx(tx, automation_id, { key }, "interrupt-1", 50)
                    tx:commit()
                    d:release()
                end
                return answer, call_err
            end)
            test.is_nil(err, tostring(err))
            local fenced = read_drive(automation_id, key)
            test.is_nil(fenced.cursor, "the discarded commit leaves the cursor")
            set_drive(automation_id, key, "pending_command_id=NULL, round_token=NULL, round_until=NULL", {})
            local _, rerun_err = run(automation_id, key)
            test.is_nil(rerun_err, tostring(rerun_err))

            local identity_key = query("SELECT identity_key FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='c-1'", { automation_id })[1].identity_key
            local writes = query("SELECT detail_json FROM round_fixture_log WHERE drive_key='sink' AND item_key=$1 ORDER BY id", { identity_key })
            test.eq(#writes, 2, "the interrupted delivery is sent again")
            test.eq(json.decode(writes[2].detail_json).idempotency_key, json.decode(writes[1].detail_json).idempotency_key)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE automation_id=$1 AND drive_key='transform' AND item_key='c-1'",
                { automation_id }), 1, "the replay reuses the prepared output")
            test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id }), 0)
            test.is_nil(ledger_row(automation_id, "c-1"))
            test.eq(json.decode(read_drive(automation_id, key).cursor), 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return {
    run = function(options: any): any return run_cases(options) end,
}
