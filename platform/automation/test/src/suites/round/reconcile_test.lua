-- Reconciliation over receipts (design v5 §5.3, §9 #2; A33): a reconcile
-- drive enumerates its source's keys through the port's pull_keys into its
-- cursor, stamping each page's receipts with the pass id (a destination
-- delivered during the pass is receipted under it); once enumeration ends it
-- sweeps the receipts the pass did not stamp to the kind's round consumer as
-- delete items through the ordinary delivery path, and the commit removes
-- their receipts. Resync starts a pass
-- at once. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local drive = require("drive")
local h = require("round_harness")
local round_write = require("round_write")

type Map = { [string]: any }

local PAST = h.PAST
local RECORDS = "kickside.automation.round.fixture:records"
local STORE = "kickside.automation.round.fixture:store"
local read_drive, new_drive, set_drive = h.read_drive, h.new_drive, h.set_drive

local function items(keys: { string }): { Map }
    local out: { Map } = {}
    for i, key in ipairs(keys) do out[i] = { key = key } end
    return out
end

local function define_tests()
    test.describe("automation reconciliation", function()
        local env: Map = {}
        local automation_id = ""
        local run: (string, string) -> (Map?, any) = function(_: string, _k: string): (Map?, any) return nil, nil end

        test.before_each(function()
            env = h.setup("round_reconcile")
            automation_id = env.automation_id
            run = env.run
        end)

        local function receipts(prefix: string): { string }
            local out: { string } = {}
            for _, row in ipairs(h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id = $1 AND item_key LIKE $2 ORDER BY item_key",
                { automation_id, prefix .. "%" })) do out[#out + 1] = row.item_key end
            return out
        end

        local function receipt_rows(): integer
            local rows = h.query("SELECT COUNT(*) AS n FROM kickside_automation_receipt WHERE owner_id=$1", { automation_id })
            return math.tointeger(tonumber(rows[1].n)) or 0
        end

        local function deliver_main(key: string, keys: { string }): ()
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection", applied = { sink_port = STORE },
                action = { source_ref = RECORDS, config = { items = items(keys) }, schedule = { type = "interval", expression = "30m" } } })
            set_drive(automation_id, key, "next_run_at = $1", { PAST })
            run(automation_id, key)
        end

        -- reconcile_drive installs the automation's one reconcile drive, replacing
        -- a previous test's.
        local function reconcile_drive(keys: { string }, page_size: integer?): ()
            local key = "reconcile"
            h.exec("DELETE FROM kickside_automation_drive WHERE automation_id = $1 AND drive_key = 'reconcile'", { automation_id })
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "reconcile", applied = { sink_port = STORE },
                action = { source_ref = RECORDS, config = { items = items(keys) }, pull_keys = "kickside.automation.round.fixture:record_keys" },
                policy = { round = { page_size = page_size or 100 } } })
            set_drive(automation_id, key, "reconcile_next_at = $1", { PAST })
        end

        test.it("deletes the destinations whose source keys vanished and keeps the rest", function()
            local before = receipt_rows()
            deliver_main("rec_main", { "rv-a", "rv-b", "rv-c" })
            test.eq(#receipts("rv-"), 3)
            test.eq(receipt_rows(), before + 3)
            reconcile_drive({ "rv-a", "rv-c" }, 1)

            -- Enumeration: one key per page, each stamping its receipt.
            run(automation_id, "reconcile")
            local d = read_drive(automation_id, "reconcile")
            test.not_nil(d.reconcile_pass_id)
            test.is_false(d.sweep_pending)
            run(automation_id, "reconcile")
            test.is_true(read_drive(automation_id, "reconcile").sweep_pending)

            -- Sweep: the unstamped receipt's destination is deleted and its receipt removed.
            run(automation_id, "reconcile")
            test.eq(json.encode(receipts("rv-")), (json.encode({ "rv-a", "rv-c" })))
            local deletes = h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key = 'sink' AND detail_json LIKE $1",
                { "%rec:" .. round_write.keys({ automation_id = automation_id, source_port = RECORDS }, { item_key = "rv-b" }).identity_key .. "%" })
            test.eq(#deletes, 1)
            test.eq(receipt_rows(), before + 2, "reconciliation removes only the proven deleted destination")

            -- Nothing stale is left: the pass ends and the next one waits for the cadence.
            run(automation_id, "reconcile")
            local done = read_drive(automation_id, "reconcile")
            test.is_nil(done.reconcile_pass_id)
            test.is_false(done.sweep_pending)
            test.is_true(done.reconcile_next_at > drive.utc_now())
            test.eq(json.encode(receipts("rv-")), (json.encode({ "rv-a", "rv-c" })))
            test.eq(receipt_rows(), before + 2, "a repeated reconciliation does not mint receipts")
        end)

        test.it("keeps a destination delivered while its pass runs", function()
            deliver_main("late_main", { "lt-a" })
            reconcile_drive({ "lt-a" })
            run(automation_id, "reconcile")
            test.is_true(read_drive(automation_id, "reconcile").sweep_pending)
            -- The source gains an item after the enumeration listed its keys;
            -- the main drive delivers it while the pass runs.
            set_drive(automation_id, "late_main", "action_json = $1, cursor = NULL, next_run_at = $2", {
                json.encode({ source_ref = RECORDS, config = { items = items({ "lt-a", "lt-new" }) },
                    schedule = { type = "interval", expression = "30m" } }), PAST })
            run(automation_id, "late_main")
            run(automation_id, "reconcile")
            run(automation_id, "reconcile")
            test.is_nil(read_drive(automation_id, "reconcile").reconcile_pass_id)
            test.eq(json.encode(receipts("lt-")), (json.encode({ "lt-a", "lt-new" })))
        end)

        test.it("keeps an unchanged destination redelivered while its pass runs", function()
            deliver_main("stamp_main", { "st-a" })
            local before = h.query("SELECT dest_ref_json, dest_version FROM kickside_automation_receipt"
                .. " WHERE owner_id=$1 AND item_key='st-a'", { automation_id })[1]
            -- The enumeration ends before the source lists st-a again.
            reconcile_drive({})
            run(automation_id, "reconcile")
            local pass = read_drive(automation_id, "reconcile")
            test.is_true(pass.sweep_pending)
            -- A new revision of st-a lands at its unchanged destination during the pass.
            set_drive(automation_id, "stamp_main", "action_json = $1, cursor = NULL, next_run_at = $2", {
                json.encode({ source_ref = RECORDS, config = { items = { { key = "st-a", dedup_key = "st-a:revision-2" } } },
                    schedule = { type = "interval", expression = "30m" } }), PAST })
            run(automation_id, "stamp_main")
            local stamped = h.query("SELECT dest_ref_json, dest_version, pass_id FROM kickside_automation_receipt"
                .. " WHERE owner_id=$1 AND item_key='st-a'", { automation_id })[1]
            test.eq(stamped.dest_ref_json, before.dest_ref_json)
            test.eq(stamped.dest_version, before.dest_version)
            test.eq(stamped.pass_id, pass.reconcile_pass_id, "the pass stamps a redelivered destination")
            run(automation_id, "reconcile")
            run(automation_id, "reconcile")
            test.is_nil(read_drive(automation_id, "reconcile").reconcile_pass_id)
            test.eq(json.encode(receipts("st-")), (json.encode({ "st-a" })))
        end)

        test.it("keeps a mapped receipt after destination reconciliation fails", function()
            local failed_env = h.setup("round_reconcile_failure")
            local owner = failed_env.automation_id
            h.exec([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                VALUES ($1,$2,'failed-delete','','failed-delete','{"id":"fail-delete"}',$3)]],
                { owner, RECORDS, PAST })
            new_drive({ automation_id = owner, drive_key = "reconcile", source_kind = "reconcile",
                applied = { sink_port = STORE }, action = { source_ref = RECORDS,
                    config = { items = {} }, pull_keys = "kickside.automation.round.fixture:record_keys" } })
            set_drive(owner, "reconcile", "reconcile_next_at = $1", { PAST })
            local _, enumerate_err = failed_env.run(owner, "reconcile")
            test.is_nil(enumerate_err, tostring(enumerate_err))
            test.is_true(read_drive(owner, "reconcile").sweep_pending)
            local _, sweep_err = failed_env.run(owner, "reconcile")
            test.is_nil(sweep_err, tostring(sweep_err))
            local mapped = h.query("SELECT dest_ref_json FROM kickside_automation_receipt"
                .. " WHERE owner_id=$1 AND item_key='failed-delete'", { owner })
            test.eq(#mapped, 1)
            test.eq(json.decode(mapped[1].dest_ref_json).id, "fail-delete")
        end)

        test.it("installs a kind that declares itself disabled with every drive paused", function()
            local installed = env.caller:call("kickside.automation.agent:automations_manage", { action = "install",
                type = "kickside.automation.round.fixture:collection_kind", input = { enabled = false } })
            test.is_true(installed.success, tostring(installed.error))
            for _, key in ipairs({ "main", "reconcile" }) do
                local d = read_drive(installed.id, key)
                test.eq(d.enabled, false, key)
                test.eq(d.phase, drive.PHASE.PAUSED, key)
            end
        end)

        test.it("starts a reconcile pass at once when the automation is resynced", function()
            local installed = env.caller:call("kickside.automation.agent:automations_manage", { action = "install",
                type = "kickside.automation.round.fixture:collection_kind", input = {} })
            test.is_true(installed.success, tostring(installed.error))
            local rd = read_drive(installed.id, "reconcile")
            test.eq(rd.source_kind, "reconcile")
            test.eq(rd.action.pull_keys, "kickside.automation.round.fixture:record_keys")
            test.is_true(rd.reconcile_next_at > drive.utc_now())
            local resynced = env.caller:call("kickside.automation.agent:automations_manage", { action = "control", id = installed.id,
                control = "resync", request_id = "rs-" .. installed.id })
            test.is_true(resynced.success, tostring(resynced.error))
            test.is_true(read_drive(installed.id, "reconcile").reconcile_next_at <= drive.utc_now())
        end)
    end)
end

return test.run_cases(define_tests)
