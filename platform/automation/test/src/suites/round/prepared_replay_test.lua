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
local round_commit = require("round_commit")
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

        for _,mode in ipairs({"retrying","waiting","uncertain","parked","in_flight","mirror"}) do
            test.it("retains shared prepared output until its last reference settles: " .. mode,function()
                local key="shared-" .. mode
                local id=install({{key=key,directive="invalid"}})
                run(id)
                local original=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].identity_key
                test.eq(replay(id,key .. "-replay").outcome.replayed,1)
                run(id)
                local replayed=h.query("SELECT identity_key,execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1]
                test.is_true(replayed.identity_key~=original)
                test.eq(json.decode(replayed.execution_identity_json).prepared_key,original)
                h.set_drive(id,"main","cursor=NULL",{})
                if mode~="in_flight" then run(id) end
                test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),mode=="in_flight" and 1 or 2,
                    "the source can re-present the original delivery after replay changes its ledger key")
                test.eq(transforms(id,key),1)
                local live=mode=="mirror" and replayed.identity_key or original
                local expired=mode=="mirror" and original or replayed.identity_key
                local state=(mode=="in_flight" or mode=="mirror") and "retrying" or mode
                h.exec("UPDATE kickside_trigger_item_ledger SET state=$1,expires_at=NULL,next_attempt_at=$2 WHERE owner_id=$3 AND identity_key=$4",
                    {state,h.PAST,id,live})
                h.set_drive(id,"main","unresolved_count=$1",{mode=="in_flight" and 0 or 1})
                h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1800-01-01T00:00:00Z' WHERE owner_id=$1 AND identity_key=$2",{id,expired})
                local function prune(in_flight: boolean?): ()
                    local _,err=automation_db.in_tx(function(tx) return round_ledger.prune_tx(tx,"1850-01-01T00:00:00Z",100) end)
                    test.is_nil(err,tostring(err))
                    test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),in_flight and 0 or 1)
                    test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{id,original}),1,
                        "another delivery still references the original prepared result")
                end
                if mode=="in_flight" then
                    h.set_drive(id,"main","next_run_at=$1",{h.PAST})
                    local observed=false
                    local _,err=env.run(id,"main",function(identity,target,args,options)
                        if target=="kickside.automation:round_deliver" then
                            observed=true
                            test.not_nil(h.read_drive(id,"main").round_token)
                            prune(true)
                        end
                        return env.run_as(identity,target,args,options)
                    end)
                    test.is_nil(err,tostring(err));test.is_true(observed)
                else
                    prune()
                    h.exec("UPDATE kickside_trigger_item_ledger SET state='retrying',identity_parked=false,next_attempt_at=$1 WHERE owner_id=$2 AND identity_key=$3",{h.PAST,id,live})
                    run(id)
                end
                if mode=="in_flight" then prune() end
                test.eq(transforms(id,key),1,"the retry reuses replay-unsafe output without recomputation")
                test.eq(#sink_writes(id,key),mode=="in_flight" and 3 or 4)
                h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1800-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                local _,err=automation_db.in_tx(function(tx) return round_ledger.prune_tx(tx,"1850-01-01T00:00:00Z",100) end)
                test.is_nil(err,tostring(err))
                test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0,
                    "expiry of the final reference reclaims the prepared output")
            end)
        end

        for _,finish in ipairs({"expires","resolves"}) do
            test.it("reclaims journal-retained output when its admitted delivery " .. finish,function()
                local key="journal-" .. finish
                local id=install({{key=key,directive="invalid"}})
                run(id)
                local original=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].identity_key
                test.eq(replay(id,key .. "-replay").outcome.replayed,1)
                run(id)
                h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1700-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                h.set_drive(id,"main","cursor=NULL,next_run_at=$1",{h.PAST})
                local observed=false
                local _,run_err=env.run(id,"main",function(identity,target,args,options)
                    if target=="kickside.automation:round_deliver" then
                        observed=true
                        local n,err=automation_db.in_tx(function(tx)
                            return round_ledger.prune_tx(tx,"1750-01-01T00:00:00Z",100)
                        end)
                        test.is_nil(err,tostring(err));test.eq(n,1,"expiry removes the journal-referenced tombstone")
                        test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
                        test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),1)
                    end
                    return env.run_as(identity,target,args,options)
                end)
                test.is_nil(run_err,tostring(run_err));test.is_true(observed)
                test.eq(transforms(id,key),1,"the admitted delivery reuses the protected transform result")
                test.eq(#sink_writes(id,key),3)
                test.eq(ledger(id,key).state,"dead")
                if finish=="expires" then
                    h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1700-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                    local n,err=automation_db.in_tx(function(tx)
                        return round_ledger.prune_tx(tx,"1750-01-01T00:00:00Z",100)
                    end)
                    test.is_nil(err,tostring(err));test.eq(n,1)
                else
                    h.exec("UPDATE kickside_trigger_item_ledger SET state='waiting',expires_at=NULL WHERE owner_id=$1",{id})
                    h.set_drive(id,"main","unresolved_count=1",{})
                    local item=json.decode(h.query("SELECT envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].envelope_json)
                    local job=h.running_job()
                    local token="journal-settlement"
                    h.set_drive(id,"main","round_token=$1,round_until=$2",{token,job.lease_until})
                    local before=h.read_drive(id,"main")
                    local result,err=automation_db.in_tx(function(tx)
                        return round_commit.commit_tx(tx,{automation_id=id,drive_key="main",source_port=RECORDS,receipt_port=RECORDS,
                            now=h.PAST,resolved_expires_at="2099-01-01T00:00:00Z",
                            captured={round_token=token,round_until=job.lease_until,revision=before.revision,
                                rewind_generation=before.rewind_generation,command_generation=before.command_generation}},
                            {outcomes={{item=item,state="resolved"}},receipts={{item=item,receipts={},prepared_key=original}}})
                    end)
                    test.is_nil(err,tostring(err));test.is_true(result.committed)
                    test.eq(ledger(id,key).state,"resolved")
                    h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
                end
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0,
                    "the admitted delivery releases its last prepared reference")
            end)
        end

        for _,finish in ipairs({"replay","expires","resolves"}) do
            test.it("preserves prepared ownership after a failure before materialization: " .. finish,function()
                local key="late-materialization-" .. finish
                local id=install({{key=key,directive="invalid"}})
                local original=""
                h.set_drive(id,"main","next_run_at=$1",{h.PAST})
                local _,first_err=env.run(id,"main",function(identity,target,args,options)
                    if target=="kickside.automation:round_deliver" then
                        local item=args.items[1]
                        original=item.delivery_key
                        local value,prepare_err=round_write.prepare({drive=args.drive,key=original,hash="first-attempt",prepared=true},
                            function() return nil,errors.new({kind=errors.UNAVAILABLE,retryable=true,message="transform unavailable"}) end)
                        test.is_nil(value);test.not_nil(prepare_err)
                        return {success=true,outcomes={delivered={},skipped={},waiting={},uncertain={},
                            failed={{key=original,error={kind=errors.UNAVAILABLE,retriable=true,message="transform unavailable"}}}}},nil
                    end
                    return env.run_as(identity,target,args,options)
                end)
                test.is_nil(first_err,tostring(first_err))
                test.eq(ledger(id,key).state,"retrying")
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0)
                h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2",{h.PAST,id})
                run(id)
                test.eq(ledger(id,key).state,"dead")
                test.eq(transforms(id,key),1)
                test.eq(#sink_writes(id,key),1)
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{id,original}),1)
                test.eq(replay(id,key .. "-replay").outcome.replayed,1)
                local row=h.query("SELECT identity_key,envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1]
                test.is_true(row.identity_key~=original)
                if finish=="replay" then
                    run(id)
                    test.eq(transforms(id,key),1,"the replay reuses output materialized by the retry")
                    test.eq(#sink_writes(id,key),2,"the replay reaches the sink with the retained output")
                    test.eq(ledger(id,key).state,"dead")
                    test.eq(json.decode(h.query("SELECT execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].execution_identity_json).prepared_key,original)
                elseif finish=="expires" then
                    h.exec("UPDATE kickside_trigger_item_ledger SET state='dead',expires_at='1700-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                    h.set_drive(id,"main","unresolved_count=0",{})
                    local n,err=automation_db.in_tx(function(tx) return round_ledger.prune_tx(tx,"1750-01-01T00:00:00Z",100) end)
                    test.is_nil(err,tostring(err));test.eq(n,1)
                    test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0,
                        "expiry releases output first materialized by a retry")
                else
                    h.exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at='2099-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                    h.set_drive(id,"main","cursor=NULL,next_run_at=$1",{h.PAST})
                    local _,err=env.run(id,"main",function(identity,target,args,options)
                        if target=="kickside.automation:round_deliver" then
                            test.eq(#args.items,1)
                            test.eq(args.items[1].delivery_key,original)
                            return {success=true,outcomes={delivered={},skipped={{key=original,reason="already delivered"}},
                                waiting={},uncertain={},failed={}}},nil
                        end
                        return env.run_as(identity,target,args,options)
                    end)
                    test.is_nil(err,tostring(err))
                    test.eq(ledger(id,key).state,"retrying")
                    test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{id,original}),1,
                        "settling the original leaves output owned by its unresolved replay")
                    test.is_nil(next(h.read_drive(id,"main").admission))
                end
            end)
        end

        for _,other_output in ipairs({false,true}) do
            test.it("reclaims journal-only output when a repeated snapshot is already delivered: " .. tostring(other_output),function()
                local key="journal-snapshot"
                local id=install({{key=key,directive="invalid"}})
                run(id)
                local original=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].identity_key
                test.eq(replay(id,key .. "-replay").outcome.replayed,1)
                run(id)
                local lineage=h.query("SELECT identity_key,execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1]
                test.is_true(lineage.identity_key~=original)
                test.eq(json.decode(lineage.execution_identity_json).prepared_key,original)
                test.eq(ledger(id,key).state,"dead")
                h.set_drive(id,"main","cursor=NULL,next_run_at=$1",{h.PAST})
                local _,delivered_err=env.run(id,"main",function(identity,target,args,options)
                    if target=="kickside.automation:round_deliver" then
                        local output=json.decode(h.query("SELECT prepared_json FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{id,original})[1].prepared_json)
                        output.directive="deliver"
                        h.exec("UPDATE kickside_automation_prepared SET prepared_json=$1 WHERE automation_id=$2 AND idempotency_key=$3",
                            {json.encode(output),id,original})
                    end
                    return env.run_as(identity,target,args,options)
                end)
                test.is_nil(delivered_err,tostring(delivered_err))
                test.eq(receipts(id,key),1)
                test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),1,
                    "the successful original identity creates no ledger row")
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),1,
                    "the dead replay retains the prepared output after delivery")
                if other_output then
                    h.exec("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at)"
                        .. " VALUES ($1,'other-item','other-hash','{}',$2)",{id,h.PAST})
                end
                h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1700-01-01T00:00:00Z' WHERE owner_id=$1",{id})
                h.set_drive(id,"main","cursor=NULL,next_run_at=$1",{h.PAST})
                local observed=false
                local _,skip_err=env.run(id,"main",function(identity,target,args,options)
                    if target=="kickside.automation:round_deliver" then
                        observed=true
                        test.eq(h.read_drive(id,"main").admission[original].prepared_key,original)
                        local n,err=automation_db.in_tx(function(tx)
                            return round_ledger.prune_tx(tx,"1750-01-01T00:00:00Z",100)
                        end)
                        test.is_nil(err,tostring(err));test.eq(n,1)
                        test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
                        test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),other_output and 2 or 1,
                            "only the admitted snapshot retains the output")
                        local answer,err=env.run_as(identity,"kickside.sync:round_deliver",{
                            drive=args.drive,items=args.items,config={sink_port=STORE,transform={kind="none"}}},options)
                        test.is_nil(err,tostring(err));test.not_nil(answer)
                        test.eq(#answer.skipped_items,1)
                        test.eq(answer.skipped_items[1].reason,"already delivered")
                        test.is_nil(answer.skipped_items[1].prepared_key)
                        return {success=true,outcomes={delivered=answer.delivered_items,skipped=answer.skipped_items,
                            waiting=answer.waiting_items,uncertain=answer.uncertain_items,failed=answer.failed_items}},nil
                    end
                    return env.run_as(identity,target,args,options)
                end)
                test.is_nil(skip_err,tostring(skip_err));test.is_true(observed)
                test.eq(transforms(id,key),1)
                test.eq(#sink_writes(id,key),3,"the repeated snapshot calls neither transform nor sink")
                test.is_nil(next(h.read_drive(id,"main").admission))
                test.eq(#h.query("SELECT 1 FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id}),0)
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),other_output and 1 or 0,
                    "a skip without a prepared key releases the journal's last reference")
            end)
        end

        for _,state in ipairs({"resolved","retrying","dead"}) do
            test.it("settles a journal prepared reference without consumer receipts: " .. state,function()
                local id=install({{key="journal-outcome",directive="invalid"}})
                run(id)
                local row=h.query("SELECT identity_key,envelope_json,execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1]
                local item=json.decode(row.envelope_json)
                h.exec("UPDATE kickside_trigger_item_ledger SET state='waiting',expires_at=NULL WHERE owner_id=$1",{id})
                h.set_drive(id,"main","unresolved_count=1",{})
                local job=h.running_job()
                local token="journal-outcome-" .. state
                h.set_drive(id,"main","round_token=$1,round_until=$2,admission_json=$3",
                    {token,job.lease_until,json.encode({[item.delivery_key]=json.decode(row.execution_identity_json)})})
                local before=h.read_drive(id,"main")
                local refs=0
                local reclaim=round_ledger.reclaim_prepared_tx
                round_ledger.reclaim_prepared_tx=function(tx,candidates)
                    refs=refs+#candidates
                    return reclaim(tx,candidates)
                end
                local result,err=automation_db.in_tx(function(tx)
                    return round_commit.commit_tx(tx,{automation_id=id,drive_key="main",source_port=RECORDS,receipt_port=RECORDS,
                        now=h.PAST,resolved_expires_at="2099-01-01T00:00:00Z",
                        captured={round_token=token,round_until=job.lease_until,revision=before.revision,
                            rewind_generation=before.rewind_generation,command_generation=before.command_generation}},
                        {outcomes={{item=item,state=state,next_attempt_at=state=="retrying" and h.PAST or nil}}})
                end)
                round_ledger.reclaim_prepared_tx=reclaim
                test.is_nil(err,tostring(err));test.is_true(result.committed)
                test.eq(refs,state=="resolved" and 1 or 0,"unresolved journal keys never enter settlement reclamation")
                test.eq(ledger(id,"journal-outcome").state,state)
                test.is_nil(next(h.read_drive(id,"main").admission))
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),state=="resolved" and 0 or 1,
                    "only resolved outcomes release the journal's prepared reference")
                h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
            end)
        end

        test.it("reclaims the original prepared key when a discarded replay lineage expires",function()
            local key="discarded-lineage"
            local id=install({{key=key,directive="invalid"}})
            run(id)
            local original=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].identity_key
            test.eq(replay(id,key .. "-replay").outcome.replayed,1)
            run(id)
            local lineage=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].identity_key
            h.set_drive(id,"main","cursor=NULL,next_run_at=$1",{h.PAST})
            local _,run_err=env.run(id,"main",function(identity,target,args,options)
                if target=="kickside.automation:round_deliver" then
                    local output=json.decode(h.query("SELECT prepared_json FROM kickside_automation_prepared WHERE automation_id=$1 AND idempotency_key=$2",{id,original})[1].prepared_json)
                    output.directive="deliver"
                    h.exec("UPDATE kickside_automation_prepared SET prepared_json=$1 WHERE automation_id=$2 AND idempotency_key=$3",
                        {json.encode(output),id,original})
                end
                return env.run_as(identity,target,args,options)
            end)
            test.is_nil(run_err,tostring(run_err))
            test.eq(receipts(id,key),1,"the original source delivery completes")
            test.eq(transforms(id,key),1)
            test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),1,
                "the dead replay lineage still retains the original prepared result")
            test.eq(call({action="control",id=id,control="discard",drive_key="main",request_id="discard-lineage",keys={key}}).outcome.discarded,1)
            test.eq(ledger(id,key).state,"resolved")
            h.exec("UPDATE kickside_trigger_item_ledger SET expires_at='1700-01-01T00:00:00Z' WHERE owner_id=$1 AND identity_key=$2",{id,lineage})
            local n,err=automation_db.in_tx(function(tx) return round_ledger.prune_tx(tx,"1750-01-01T00:00:00Z",100) end)
            test.is_nil(err,tostring(err));test.eq(n,1)
            test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),0,
                "resolved expiry releases the evidence prepared key as well as its identity")
        end)

        test.it("settles shared prepared output only after its last delivery resolves",function()
            local id=install({{key="shared-resolution",directive="invalid"}})
            run(id)
            local original=h.query("SELECT identity_key FROM kickside_trigger_item_ledger WHERE owner_id=$1",{id})[1].identity_key
            test.eq(replay(id,"shared-resolution-replay").outcome.replayed,1)
            run(id)
            h.set_drive(id,"main","cursor=NULL",{})
            run(id)
            h.exec("UPDATE kickside_trigger_item_ledger SET state='waiting',expires_at=NULL WHERE owner_id=$1",{id})
            h.set_drive(id,"main","unresolved_count=2",{})
            local retained=h.query("SELECT envelope_json FROM kickside_trigger_item_ledger WHERE owner_id=$1 ORDER BY identity_key",{id})
            for index,row in ipairs(retained) do
                local item=json.decode(row.envelope_json)
                local job=h.running_job()
                local token="settle-" .. tostring(index)
                h.set_drive(id,"main","round_token=$1,round_until=$2",{token,job.lease_until})
                local before=h.read_drive(id,"main")
                local round={automation_id=id,drive_key="main",source_port=RECORDS,receipt_port=RECORDS,
                    now=h.PAST,resolved_expires_at="2099-01-01T00:00:00Z",
                    captured={round_token=token,round_until=job.lease_until,revision=before.revision,
                        rewind_generation=before.rewind_generation,command_generation=before.command_generation}}
                local result,err=automation_db.in_tx(function(tx)
                    return round_commit.commit_tx(tx,round,{outcomes={{item=item,state="resolved"}},
                        receipts={{item=item,receipts={},prepared_key=item.delivery_key,original_prepared_key=original}}})
                end)
                test.is_nil(err,tostring(err));test.is_true(result.committed)
                test.eq(#h.query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}),index==1 and 1 or 0,
                    "settlement protects the other delivery and releases the last reference")
                h.exec("UPDATE kickside_job SET status='done',lease_token=NULL,lease_until=NULL WHERE id=$1",{job.id})
            end
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
