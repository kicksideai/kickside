-- The automation round's collection paging and sink delivery (design v5 §4.2,
-- §4.6, §5.3-5.4) over a real installed automation, drive, ledger and the
-- fixture store and notify sinks. These cases hold the heaviest live round
-- work (a 250-item page through an exactly-once sink), so they run as their
-- own test entry, apart from round_test's event and control cases, each well
-- inside the runner's per-entry budget. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local drive = require("drive")
local h = require("round_harness")
local round_write = require("round_write")
local time = require("time")
local runtime_policy = require("runtime_policy")

type Map = { [string]: any }

local PAST = h.PAST
local query = h.query
local read_drive, new_drive, set_drive = h.read_drive, h.new_drive, h.set_drive
local log_rows, ledger_row = h.log_rows, h.ledger_row

local function define_tests(group: integer)
    test.describe("automation round: collection paging and sink delivery", function()
        local automation_id = ""
        local run: (string, string, any?, any?, any?) -> (Map?, any) = function(_: string, _k: string, _r: any?, _d: any?, _c: any?): (Map?, any) return nil, nil end
        local last_completion: () -> Map = function(): Map return {} end

        local current_env: Map = {}
        test.before_each(function()
            local env = h.setup("round_sink")
            current_env = env
            automation_id, run, last_completion = env.automation_id, env.run, env.last_completion
        end)

        if group == 1 then
        test.it("pages a collection, rearms at once while more remain and at the schedule after the last page", function()
            local items: { Map } = {}
            for i = 1, 150 do items[i] = { key = "rec-" .. tostring(i) } end
            new_drive({ automation_id = automation_id, drive_key = "records", source_kind = "collection",
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = items },
                    schedule = { type = "interval", expression = "30m" } } })
            local _, arm_err = run(automation_id, "records")
            test.is_nil(arm_err, tostring(arm_err))
            test.eq(#log_rows(automation_id, "records"), 0)
            test.not_nil(read_drive(automation_id, "records").next_run_at)
            set_drive(automation_id, "records", "next_run_at = $1", { PAST })

            run(automation_id, "records")
            test.eq(#log_rows(automation_id, "records"), 100, json.encode(read_drive(automation_id, "records")) .. json.encode(last_completion()))
            local rearm = last_completion().options.rearm
            test.is_true(rearm <= drive.utc_now())
            run(automation_id, "records")
            test.eq(#log_rows(automation_id, "records"), 150)
            test.is_true(last_completion().options.rearm > drive.utc_now())
            test.eq(json.decode(read_drive(automation_id, "records").cursor), 150)
        end)

        test.it("bounds its source pull and sink writes by a work deadline inside the job's execution ceiling", function()
            local env_deadline_ms = 120000
            current_env.job_deadline_ms = env_deadline_ms
            new_drive({ automation_id = automation_id, drive_key = "bounded", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" },
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = { { key = "b-1" } } },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "bounded", "next_run_at = $1", { PAST })
            local acquired_deadline: string? = nil
            local _, err = run(automation_id, "bounded", function(identity: any, target: string, args: any, opts: any): (any?, any)
                if target == "kickside.automation:round_acquire" then acquired_deadline = args.deadline end
                return current_env.run_as(identity, target, args, opts)
            end)
            test.is_nil(err, tostring(err))
            local policy = runtime_policy.policy() :: Map
            -- The job's ceiling is nearer than round.timeout, so it ends the
            -- round's fence; the work deadline leaves the commit its reserve.
            local fence = time.parse(time.RFC3339, tostring(current_env.last_job.deadline)) :: any
            local expected = fence:add(-(policy.round_commit_reserve_ms :: integer) * time.MILLISECOND):utc():format(time.RFC3339)
            test.eq(acquired_deadline, expected, "the source pull runs under the round's work deadline")
            local identity = round_write.keys({ automation_id = automation_id,
                source_port = "kickside.automation.round.fixture:records" }, { item_key = "b-1" }).identity_key
            local writes = query("SELECT detail_json FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1",
                { identity })
            test.eq(#writes, 1)
            test.eq(json.decode(writes[1].detail_json).deadline, expected, "the sink write opens under the round's work deadline")
            test.is_nil(ledger_row(automation_id, "b-1"), "a first-attempt delivery writes no ledger row")
        end)

        test.it("writes through the kind's sink, records receipts, settles prepared output and updates in place on redelivery", function()
            local items = { { key = "w-1" }, { key = "w-2", directive = "capacity" }, { key = "w-3", directive = "invalid" } }
            new_drive({ automation_id = automation_id, drive_key = "writes", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" },
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = items },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "writes", "next_run_at = $1", { PAST })
            local _, err = run(automation_id, "writes")
            test.is_nil(err, tostring(err))
            local receipts = query("SELECT item_key, identity_key, dest_ref_json, dest_version FROM kickside_automation_receipt"
                .. " WHERE owner_id = $1 ORDER BY item_key", { automation_id })
            test.eq(#receipts, 1)
            test.eq(receipts[1].item_key, "w-1")
            test.eq(json.decode(receipts[1].dest_ref_json).id, "rec:" .. receipts[1].identity_key)
            test.eq(receipts[1].dest_version, "v1")
            local prepared = query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1", { automation_id })
            test.eq(#prepared, 2, "only the undelivered items keep their prepared output")
            test.eq((ledger_row(automation_id, "w-2") :: Map).state, "waiting")
            test.eq((ledger_row(automation_id, "w-3") :: Map).state, "dead")

            -- A distinct source revision updates the same stable destination.
            items[1].dedup_key = "w-1:revision-2"
            set_drive(automation_id, "writes", "cursor = NULL, next_run_at = $1, action_json = $2", { PAST, json.encode({ source_ref = "kickside.automation.round.fixture:records", config = { items = items }, schedule = { type = "interval", expression = "30m" } }) })
            run(automation_id, "writes")
            local writes = query("SELECT detail_json FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1 ORDER BY id",
                { receipts[1].identity_key })
            test.eq(#writes, 2)
            test.is_nil(json.decode(writes[1].detail_json).dest_ref)
            test.eq(json.decode(writes[2].detail_json).dest_ref.id, "rec:" .. receipts[1].identity_key)
            test.eq(#query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id = $1 AND item_key = 'w-1'",
                { automation_id }), 1, "an update reuses the stable receipt slot")
        end)
        end

        if group == 2 then
        for _, count in ipairs({125, 250, 500}) do
        local size = count
        test.it("records every receipt and settles prepared output for " .. tostring(size) .. " items", function()
            local items: { Map } = {}
            for i = 1, size do items[i] = { key = "bulk-" .. tostring(i) } end
            new_drive({ automation_id = automation_id, drive_key = "bulk", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" },
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = items },
                    schedule = { type = "interval", expression = "30m" } }, policy = { round = { page_size = size } } })
            set_drive(automation_id, "bulk", "next_run_at = $1", { PAST })
            run(automation_id, "bulk")
            test.eq(#query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id = $1 AND item_key LIKE 'bulk-%'", { automation_id }), size)
            test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1 AND idempotency_key LIKE $2",
                { automation_id, "%" }), 0)
        end)
        end
        end

        if group == 3 then
        test.it("records a receipt per destination slot a sink answers and removes every slot a delivered delete names", function()
            local action = { source_ref = "kickside.automation.round.fixture:records", config = { items = { { key = "s-1", directive = "slots" } } },
                schedule = { type = "interval", expression = "30m" } }
            new_drive({ automation_id = automation_id, drive_key = "slotted", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" }, action = action })
            set_drive(automation_id, "slotted", "next_run_at = $1", { PAST })
            run(automation_id, "slotted")
            local slots = query("SELECT map_slot, dest_ref_json FROM kickside_automation_receipt WHERE owner_id = $1 AND item_key = 's-1'"
                .. " ORDER BY map_slot", { automation_id })
            test.eq(#slots, 2)
            test.eq(slots[1].map_slot, "a")
            test.eq(slots[2].map_slot, "b")
            test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1 AND idempotency_key LIKE $2",
                { automation_id, "%" }), 0, "the delivered item's prepared output is settled")

            action.config = { items = { { key = "s-1", op = "delete" } } }
            set_drive(automation_id, "slotted", "action_json = $1, cursor = NULL, next_run_at = $2", { json.encode(action), PAST })
            run(automation_id, "slotted")
            test.eq(#query("SELECT map_slot FROM kickside_automation_receipt WHERE owner_id = $1 AND item_key = 's-1'", { automation_id }), 0)
            local deletes = query("SELECT detail_json FROM round_fixture_log WHERE drive_key = 'sink' AND detail_json LIKE $1", { "%rec:" .. round_write.keys({ automation_id = automation_id, source_port = "kickside.automation.round.fixture:records" }, { item_key = "s-1" }).identity_key .. ":%" })
            test.eq(#deletes, 2, "each slot is deleted through its own destination ref")
        end)

        test.it("refuses a round that delivers two identities of one item to the same receipt slot", function()
            local items = { { key = "dup-1", dedup_key = "dup-1:a" }, { key = "dup-1", dedup_key = "dup-1:b" } }
            new_drive({ automation_id = automation_id, drive_key = "duplicate", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" },
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = items },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "duplicate", "next_run_at = $1", { PAST })
            local outcome, err = run(automation_id, "duplicate")
            local d = read_drive(automation_id, "duplicate")
            test.eq(#query("SELECT map_slot FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key='dup-1'",
                { automation_id }), 0, json.encode({ outcome = outcome, err = tostring(err), drive = d }))
            test.not_nil(d.last_error_json, json.encode({ outcome = outcome, err = tostring(err) }))
            test.not_nil(string.find(tostring(d.last_error_json), "duplicate receipt slot in one round", 1, true),
                tostring(d.last_error_json))
        end)

        test.it("resolves an at-most-once reservation when the round commits the delivery and keeps an ambiguous one uncertain", function()
            local items = { { key = "n-1" }, { key = "n-2", directive = "timeout" } }
            new_drive({ automation_id = automation_id, drive_key = "notify", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:notify" },
                action = { source_ref = "kickside.automation.round.fixture:records", config = { items = items },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "notify", "next_run_at = $1", { PAST })
            local _, err = run(automation_id, "notify")
            test.is_nil(err, tostring(err))
            test.eq((ledger_row(automation_id, "n-1") :: Map).state, "resolved")
            test.eq((ledger_row(automation_id, "n-2") :: Map).state, "uncertain")
            test.eq(read_drive(automation_id, "notify").unresolved_count, 1)
        end)

        test.it("retains uncertain evidence when a successful sink response exceeds the declared slot bound", function()
            new_drive({ automation_id = automation_id, drive_key = "overflow", source_kind = "collection",
                applied = { sink_port = "kickside.automation.round.fixture:store" },
                action = { source_ref = "kickside.automation.round.fixture:records",
                    config = { items = { { key = "overflow-1", directive = "too_many_slots" } } },
                    schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, "overflow", "next_run_at = $1", { PAST })
            local _, err = run(automation_id, "overflow")
            test.is_nil(err, tostring(err))
            test.eq((ledger_row(automation_id, "overflow-1") :: Map).state, "uncertain")
            test.eq(#query("SELECT map_slot FROM kickside_automation_receipt"
                .. " WHERE owner_id=$1 AND item_key='overflow-1'", { automation_id }), 0)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key='sink'"
                .. " AND item_key LIKE $1", { round_write.keys({ automation_id = automation_id, source_port = "kickside.automation.round.fixture:records" }, { item_key = "overflow-1" }).identity_key }), 1)
        end)
        end
    end)
end

local run_cases = {}
for group = 1, 3 do
    local selected = group
    run_cases[group] = test.run_cases(function() define_tests(selected) end)
end

return {
    run = function(options: any): any return run_cases[1](options) end,
    run_bulk = function(options: any): any return run_cases[2](options) end,
    run_slots = function(options: any): any return run_cases[3](options) end,
}
