-- Prepared output across a reconfigure and an operator replay (design v5
-- §4.6, §4.7): a replayed delivery reuses the output prepared under the key
-- it was admitted under while that output's payload or declaration still
-- holds; output prepared under a superseded declaration is re-prepared for
-- the replay's new delivery key, and another payload under the same
-- declaration stays an idempotency conflict. Drives a real installed
-- collection automation through reconfigure, replay and rounds into the
-- fixture store sink. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local h = require("round_harness")
local round_write = require("round_write")

type Map = { [string]: any }

local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local COLLECTION_KIND = "kickside.automation.round.fixture:collection_kind"
local RECORDS = "kickside.automation.round.fixture:records"
local STORE = "kickside.automation.round.fixture:store"

local function define_tests()
    test.describe("prepared output across reconfigure and replay", function()
        local env: Map = {}
        test.before_all(function() env = h.setup("prepared_replay") end)

        local function call(args: Map): Map
            local result, err = env.caller:call(MANAGE_TOOL, args)
            if err then error("manage transport: " .. tostring(err)) end
            test.is_true(result.success, tostring(result.error))
            return result :: Map
        end

        local function install(items: { Map }): string
            return tostring(call({ action = "install", type = COLLECTION_KIND,
                input = { items = items, sink_port = STORE } }).id)
        end

        local function reconfigure(id: string, items: { Map }, transform: Map?): ()
            call({ action = "reconfigure", id = id, input = { items = items, sink_port = STORE, transform = transform } })
        end

        local function replay(id: string, request_id: string): Map
            return call({ action = "control", id = id, control = "replay", drive_key = "main", request_id = request_id })
        end

        local function run(id: string): ()
            h.set_drive(id, "main", "next_run_at = $1", { h.PAST })
            local _, err = env.run(id, "main")
            test.is_nil(err, tostring(err))
        end

        -- sink_writes(id, item_key) -> the fixture store's writes of the item, in order.
        local function sink_writes(id: string, item_key: string): { Map }
            local identity = round_write.keys({ automation_id = id, source_port = RECORDS }, { item_key = item_key }).identity_key
            local rows = h.query("SELECT detail_json FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1 ORDER BY id",
                { identity })
            local writes: { Map } = {}
            for _, row in ipairs(rows) do writes[#writes + 1] = json.decode(row.detail_json) :: Map end
            return writes
        end

        local function transforms(id: string, item_key: string): integer
            return #h.query("SELECT id FROM round_fixture_log WHERE automation_id = $1 AND drive_key = 'transform' AND item_key = $2",
                { id, item_key })
        end

        local function ledger(id: string, item_key: string): Map
            return h.query("SELECT state, error_message FROM kickside_trigger_item_ledger WHERE owner_id = $1 AND item_key = $2",
                { id, item_key })[1] :: Map
        end

        local function receipts(id: string, item_key: string): integer
            return #h.query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id = $1 AND item_key = $2",
                { id, item_key })
        end

        test.it("delivers a dead item's replay with the transform a reconfigure corrected", function()
            local items = { { key = "corrected", directive = "invalid" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "corrected").state, "dead")
            local applied = h.read_drive(id, "main").applied_hash
            local stored = h.query("SELECT declaration_hash FROM kickside_automation_prepared WHERE automation_id = $1", { id })
            test.eq(#stored, 1)
            test.eq(stored[1].declaration_hash, applied, "prepared output records the declaration it was prepared under")

            reconfigure(id, items, { directive = "deliver" })
            test.is_true(h.read_drive(id, "main").applied_hash ~= applied)
            test.eq(replay(id, "corrected-replay").outcome.replayed, 1)
            run(id)

            local writes = sink_writes(id, "corrected")
            test.eq(#writes, 2, json.encode(ledger(id, "corrected")))
            test.eq(writes[1].directive, "invalid")
            test.eq(writes[2].directive, "deliver", "the replay delivers the corrected transform's output")
            test.is_true(writes[2].idempotency_key ~= writes[1].idempotency_key)
            test.eq(transforms(id, "corrected"), 2)
            test.eq(ledger(id, "corrected").state, "resolved")
            test.eq(receipts(id, "corrected"), 1)
            test.eq(#h.query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1", { id }), 0,
                "the delivery settles the superseded and the re-prepared output")
        end)

        test.it("reuses the output a replay prepared under the new declaration for every later replay", function()
            local items = { { key = "again", directive = "invalid" } }
            local id = install(items)
            run(id)
            reconfigure(id, items, { directive = "invalid" })
            test.eq(replay(id, "again-replay-1").outcome.replayed, 1)
            run(id)
            test.eq(transforms(id, "again"), 2)
            test.eq(ledger(id, "again").state, "dead")
            local stored = h.query("SELECT declaration_hash FROM kickside_automation_prepared WHERE automation_id = $1", { id })
            test.eq(#stored, 1, "the replay replaces the superseded output under its admitted key")
            test.eq(stored[1].declaration_hash, h.read_drive(id, "main").applied_hash)

            test.eq(replay(id, "again-replay-2").outcome.replayed, 1)
            run(id)
            local writes = sink_writes(id, "again")
            test.eq(#writes, 3)
            test.eq(transforms(id, "again"), 2, "the second replay reuses the output its first replay prepared")
            test.eq(ledger(id, "again").state, "dead")
        end)

        test.it("re-prepares a replay whose output was prepared before its declaration was recorded", function()
            local items = { { key = "published", directive = "invalid" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "published").state, "dead")
            h.exec("UPDATE kickside_automation_prepared SET declaration_hash = NULL WHERE automation_id = $1", { id })

            reconfigure(id, items, { directive = "deliver" })
            test.eq(replay(id, "published-replay").outcome.replayed, 1)
            run(id)

            local writes = sink_writes(id, "published")
            test.eq(#writes, 2)
            test.eq(writes[2].directive, "deliver")
            test.eq(ledger(id, "published").state, "resolved")
        end)

        test.it("replays a dead item without a reconfigure with its stored prepared output", function()
            local id = install({ { key = "kept", directive = "invalid" } })
            run(id)
            test.eq(ledger(id, "kept").state, "dead")
            test.eq(replay(id, "kept-replay").outcome.replayed, 1)
            run(id)

            local writes = sink_writes(id, "kept")
            test.eq(#writes, 2)
            test.eq(writes[2].directive, "invalid")
            test.is_true(writes[2].idempotency_key ~= writes[1].idempotency_key)
            test.eq(transforms(id, "kept"), 1, "the replay reuses the output prepared under its admitted key")
            test.eq(ledger(id, "kept").state, "dead")
        end)

        test.it("keeps a delivered item delivered when a reconfigure precedes the replay", function()
            local items = { { key = "sent" }, { key = "failed", directive = "invalid" } }
            local id = install(items)
            run(id)
            test.eq(#sink_writes(id, "sent"), 1)
            test.eq(receipts(id, "sent"), 1)
            test.eq(ledger(id, "failed").state, "dead")

            reconfigure(id, items, { directive = "deliver" })
            test.eq(replay(id, "sent-replay").outcome.replayed, 1, "only the undelivered item replays")
            run(id)

            test.eq(#sink_writes(id, "sent"), 1, "the delivered item is not sent again")
            test.eq(receipts(id, "sent"), 1)
            local failed = sink_writes(id, "failed")
            test.eq(#failed, 2)
            test.eq(failed[2].directive, "deliver")
            test.eq(ledger(id, "failed").state, "resolved")
        end)

        test.it("refuses another payload under the declaration its replayed output was prepared under", function()
            local id = install({ { key = "changed", directive = "invalid" } })
            run(id)
            test.eq(ledger(id, "changed").state, "dead")
            -- The retained item carries another payload under its key while
            -- the declaration stays the one its output was prepared under.
            local row = h.query("SELECT identity_key, envelope_json FROM kickside_trigger_item_ledger WHERE owner_id = $1 AND item_key = 'changed'",
                { id })[1]
            local envelope = json.decode(row.envelope_json) :: Map
            envelope.payload.directive = "other"
            h.exec("UPDATE kickside_trigger_item_ledger SET envelope_json = $1 WHERE owner_id = $2 AND item_key = 'changed' AND identity_key = $3",
                { json.encode(envelope), id, row.identity_key })

            test.eq(replay(id, "changed-replay").outcome.replayed, 1)
            run(id)

            test.eq(#sink_writes(id, "changed"), 1, "the conflicting payload is never sent")
            test.eq(transforms(id, "changed"), 1)
            local refused = ledger(id, "changed")
            test.eq(refused.state, "dead")
            test.contains(tostring(refused.error_message), "has another payload")
        end)
    end)
end

return test.run_cases(define_tests)
