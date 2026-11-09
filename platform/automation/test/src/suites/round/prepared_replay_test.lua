-- Prepared output across a reconfigure and an operator replay (design v5
-- §4.6, §4.7): a replayed delivery reuses the output prepared under the key
-- it was admitted under while that output's payload or declaration still
-- holds; output prepared under a superseded or unrecorded declaration is
-- re-prepared only for an item whose every attempt was refused without a
-- sink effect, and every other payload change stays an idempotency
-- conflict. Drives a real installed
-- collection automation through reconfigure, replay and rounds into the
-- fixture store sink. Runs on SQLite and PostgreSQL.

local test = require("test")
local prepared_retention = require("prepared_retention")
local automation_db = require("automation_db")
local json = require("json")
local h = require("round_harness")
local round_write = require("round_write")
local round_ledger = require("round_ledger")
local time = require("time")
local runtime_policy = require("runtime_policy")

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

        test.it("refuses re-preparation without event summaries explicitly and permits discard",function()
            local items={{key="earlier-delivery",directive="invalid"},{key="pending-delivery",directive="timeout"}}
            local id=install(items)
            run(id)
            local stored=h.query("SELECT envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='earlier-delivery'",{id})[1]
            local envelope=json.decode(stored.envelope_json)
            envelope.delivery_evidence=nil
            h.exec("UPDATE kickside_trigger_item_ledger SET envelope_json=$1 WHERE owner_id=$2 AND item_key='earlier-delivery'",{json.encode(envelope),id})
            reconfigure(id,items,{directive="deliver"})
            test.eq(call({action="control",id=id,control="replay",drive_key="main",request_id="earlier-replay",keys={"earlier-delivery"}}).outcome.replayed,1)
            run(id)
            local refused=h.query("SELECT state,error_code,error_message FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='earlier-delivery'",{id})[1]
            test.eq(refused.state,"dead")
            test.eq(refused.error_code,"replay_evidence_unavailable")
            test.contains(refused.error_message,"predates this version or has aged out")
            test.eq(#sink_writes(id,"earlier-delivery"),1)
            test.eq(transforms(id,"earlier-delivery"),1)
            test.eq(h.read_drive(id,"main").unresolved_count,1)
            test.eq(call({action="control",id=id,control="discard",drive_key="main",request_id="earlier-discard",keys={"earlier-delivery"}}).outcome.discarded,1)
            test.eq(h.read_drive(id,"main").unresolved_count,1,"discarding a terminal item releases no unresolved capacity")
            test.eq(ledger(id,"earlier-delivery").state,"resolved")
        end)

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

        -- refused_after_reconfigure(id, key) reconfigures the transform, replays
        -- and asserts the replay refuses the new payload without a send.
        local function refused_after_reconfigure(id: string, key: string, items: { Map }, sends: integer, unavailable: boolean?): ()
            reconfigure(id, items, { directive = "deliver" })
            test.eq(replay(id, key .. "-replay").outcome.replayed, 1)
            run(id)
            test.eq(#sink_writes(id, key), sends, "output that may have reached the sink is never replaced")
            test.eq(transforms(id, key), 1)
            local refused = ledger(id, key)
            test.eq(refused.state, "dead")
            test.contains(tostring(refused.error_message), unavailable and "predates this version or has aged out" or "has another payload")
        end

        test.it("refuses a reconfigured replay of an item the sink may have accepted", function()
            local items = { { key = "accepted", directive = "too_many_slots" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "accepted").state, "uncertain")
            refused_after_reconfigure(id, "accepted", items, 1)
        end)

        test.it("refuses a reconfigured replay of an item whose sink call failed retriably", function()
            local items = { { key = "timed_out", directive = "timeout" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "timed_out").state, "retrying")
            refused_after_reconfigure(id, "timed_out", items, 1)
        end)

        test.it("refuses a replay of an unrecorded declaration's output the sink may have accepted", function()
            local items = { { key = "accepted_published", directive = "too_many_slots" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "accepted_published").state, "uncertain")
            h.exec("UPDATE kickside_automation_prepared SET declaration_hash = NULL WHERE automation_id = $1", { id })
            refused_after_reconfigure(id, "accepted_published", items, 1)
        end)

        test.it("refuses a reconfigured replay of an item a sink slot accepted before another refused", function()
            local items = { { key = "partial", directive = "partial" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "partial").state, "dead")
            test.eq(receipts(id, "partial"), 1, "the accepted slot recorded its destination")
            refused_after_reconfigure(id, "partial", items, 1)
        end)

        test.it("refuses a reconfigured replay of a write whose answer lacked its acknowledgement", function()
            local items = { { key = "unacknowledged", directive = "unacknowledged" } }
            local id = install(items)
            run(id)
            local failed = h.query("SELECT state, error_code FROM kickside_trigger_item_ledger WHERE owner_id = $1 AND item_key = 'unacknowledged'",
                { id })[1]
            test.eq(failed.state, "dead")
            test.eq(failed.error_code, "unacknowledged_write")
            refused_after_reconfigure(id, "unacknowledged", items, 1)
        end)

        test.it("retains a live drive's sole prepared output regardless of age",function()
            local items={{key="aged-output",directive="invalid"}}
            local id=install(items)
            run(id)
            h.exec("UPDATE kickside_automation_prepared SET created_at='1700-01-01T00:00:00Z' WHERE automation_id=$1",{id})
            local removed,err=automation_db.in_tx(function(tx)
                return prepared_retention.prune_orphans_tx(tx,"1750-01-01T00:00:00Z",100)
            end)
            test.is_nil(err,tostring(err));test.eq(removed,0)
            test.eq(#h.query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1",{id}),1)
            test.eq(replay(id,"aged-output-replay").outcome.replayed,1)
            run(id)
            test.eq(#sink_writes(id,"aged-output"),2)
            test.eq(transforms(id,"aged-output"),1,"cached prepared output remains available")
        end)

        test.it("expires dead prepared output on a live drive and refuses replay after expiry",function()
            local id=install({{key="expiring",directive="invalid"}})
            run(id)
            test.eq(transforms(id,"expiring"),1)
            local function prune(at: string): integer
                local count,err=automation_db.in_tx(function(tx) return round_ledger.prune_tx(tx,at,100) end)
                test.is_nil(err,tostring(err))
                return count
            end
            prune("1900-01-01T00:00:00Z")
            test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),1)
            test.eq(replay(id,"before-expiry").outcome.replayed,1)
            run(id)
            test.eq(transforms(id,"expiring"),1,"within the window replay uses cached output")
            h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1900-01-01T00:00:00Z' WHERE owner_id=$1",{id})
            prune("1950-01-01T00:00:00Z")
            test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
            test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0)
            local answer,err=env.caller:call(MANAGE_TOOL,{action="control",id=id,control="replay",drive_key="main",
                request_id="after-expiry",keys={"expiring"}})
            test.not_nil(err,"aged-out evidence explicitly refuses replay")
            test.contains(tostring(err),"replay evidence predates this version or has aged out")
            test.eq(err:details().code,"replay_evidence_unavailable")
            test.eq(transforms(id,"expiring"),1)
            test.eq(#sink_writes(id,"expiring"),2)
            reconfigure(id,{{key="expiring",dedup_key="version-2",directive="deliver"}})
            h.set_drive(id,"main","cursor=NULL",{})
            run(id)
            test.eq(transforms(id,"expiring"),2,"a new source version is a fresh delivery")
            test.eq(#sink_writes(id,"expiring"),3)
        end)

        test.it("bounds permanently rejected prepared items by arrival rate times the dedupe window",function()
            local id=install({})
            local policy=assert(runtime_policy.policy())
            local window=policy.ledger_resolved_ms
            local start=time.now():utc()
            local clock=start
            local ok,message=pcall(function()
                local populations={}
                for pass=0,7 do
                    clock=start:add(pass*window/3*time.MILLISECOND)
                    local key="rejected-" .. tostring(pass)
                    reconfigure(id,{{key=key,directive="invalid"}})
                    h.set_drive(id,"main","cursor=NULL",{})
                    run(id)
                    h.exec("UPDATE kickside_trigger_item_ledger SET expires_at=$1 WHERE owner_id=$2 AND item_key=$3",
                        {clock:add(window*time.MILLISECOND):format(time.RFC3339),id,key})
                    test.eq(ledger(id,key).state,"dead")
                    test.eq(transforms(id,key),1)
                    local _,err=automation_db.in_tx(function(tx) return round_ledger.prune_tx(tx,clock:format(time.RFC3339),100) end)
                    test.is_nil(err,tostring(err))
                    local ledgers=#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})
                    local prepared=#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id})
                    test.eq(ledgers,math.min(pass+1,3),"three arrivals fit the dedupe window")
                    test.eq(prepared,ledgers,"expired failures leave no prepared payload")
                    populations[#populations+1]={pass=pass,ledger_rows=ledgers,prepared_rows=prepared}
                end
                h.exec("INSERT INTO round_fixture_log (automation_id,drive_key,item_key,attempts,detail_json) VALUES ($1,'main','dead_steady_state',0,$2)",
                    {id,h.encoded(populations)})
            end)
            if not ok then error(message) end
        end)

        test.it("never renews unavailable replay proof through repeated refusals",function()
            for _,missing in ipairs({false,true}) do
                local key=missing and "missing-proof" or "aged-proof"
                local items={{key=key,directive="invalid"}}
                local id=install(items)
                run(id)
                local stored=h.query("SELECT envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key=$2",{id,key})[1]
                local envelope=json.decode(stored.envelope_json)
                if missing then envelope.delivery_evidence=nil
                else envelope.delivery_evidence.event.round_at="2000-01-01T00:00:00Z" end
                h.exec("UPDATE kickside_trigger_item_ledger SET envelope_json=$1 WHERE owner_id=$2 AND item_key=$3",{json.encode(envelope),id,key})
                reconfigure(id,items,{directive="deliver"})
                for attempt=1,2 do
                    test.eq(replay(id,key .. "-replay-" .. tostring(attempt)).outcome.replayed,1)
                    run(id)
                    local refused=h.query("SELECT state,error_code FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key=$2",{id,key})[1]
                    test.eq(refused.state,"dead")
                    test.eq(refused.error_code,"replay_evidence_unavailable")
                    test.eq(transforms(id,key),1,"refusal cannot authorize a later recomputation")
                    test.eq(#sink_writes(id,key),1,"refusal cannot authorize a later effect")
                end
            end
        end)

        test.it("refuses a reconfigured replay once the delivery history no longer covers every attempt", function()
            local items = { { key = "pruned", directive = "invalid" } }
            local id = install(items)
            run(id)
            test.eq(ledger(id, "pruned").state, "dead")
            h.exec("DELETE FROM kickside_automation_delivery_history WHERE automation_id = $1 AND item_key = 'pruned'", { id })
            refused_after_reconfigure(id, "pruned", items, 1, true)
        end)
    end)
end

return test.run_cases(define_tests)
