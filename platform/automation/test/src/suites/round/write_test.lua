-- R's preparation/write library (design v5 §3.2, §4.6; CONTRACTS §11): the
-- keys a delivery writes under, prepared output persisted before a writable
-- call, the round's fence before every send, the sink's declared
-- delivery semantics, and the classified write outcome, over the real
-- automation DB and fixture writable bindings. Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local channel = require("channel")
local process = require("process")
local time = require("time")
local errors = require("errors")
local round_write = require("round_write")
local drive = require("drive")
local h = require("round_harness")

type Map = { [string]: any }

local DB = "app:db"
local STORE = "kickside.automation.round.fixture:store"
local NOTIFY = "kickside.automation.round.fixture:notify"
local UNDECLARED = "kickside.automation.round.fixture:undeclared"

local function query(statement: string, params: { any }?): { Map }
    local d, db_err = sql.get(DB)
    if db_err or not d then error("database unavailable: " .. tostring(db_err)) end
    local rows, err = d:query(statement, params or {})
    d:release()
    if err then error(tostring(err)) end
    return rows :: { Map }
end

local function exec(statement: string, params: { any }?): ()
    local d, db_err = sql.get(DB)
    if db_err or not d then error("database unavailable: " .. tostring(db_err)) end
    local _, err = d:execute(statement, params or {})
    d:release()
    if err then error(tostring(err)) end
end

local function fresh_rows(owner: string): Map
    local pid, spawn_err = process.spawn_monitored("kickside.automation:automation_retention_restart_probe", "app:processes", { owner_id = owner })
    test.is_nil(spawn_err, tostring(spawn_err))
    local events, deadline = process.events(), time.after("10s")
    while true do
        local selected = channel.select({ events:case_receive(), deadline:case_receive() })
        if selected.channel ~= events then error("automation retention restart probe did not exit") end
        local event = selected.value
        if type(event) == "table" and tostring(event.from) == tostring(pid) then
            test.eq(event.kind, process.event.EXIT)
            test.is_nil(event.result.error, tostring(event.result.error))
            return event.result.value :: Map
        end
    end
end

local function drive_of(automation_id: string, revision: integer?): Map
    return { automation_id = automation_id, drive_key = "main", source_port = "fixture:records", delivery_revision = revision or 1 }
end

-- stamped(id, round_until?) inserts a drive a round holds until round_until
-- and answers the drive block that round hands its consumer: identity, source
-- port and the round's fence, naming the running job whose lease it holds.
local function stamped(_id: string, round_until: string?): Map
    local env = h.setup("write_authority")
    local id = tostring(env.automation_id)
    exec("UPDATE kickside_automation_drive SET revision=1,rewind_generation=0,command_generation=0,pending_command_id=NULL WHERE automation_id=$1 AND drive_key='main'",{id})
    exec("UPDATE kickside_automation_drive SET round_token = $1, round_until = $2 WHERE automation_id = $3 AND drive_key = 'main'",
        { "round-" .. id, round_until or "2999-01-01T00:00:00Z", id })
    local job = h.running_job()
    return { automation_id = id, drive_key = "main", source_port = "fixture:records", ledger_port = "fixture:records", delivery_revision = 1,
        automation_revision = 3, fence = { round_token = "round-" .. id, revision = 1, rewind_generation = 0, command_generation = 0,
            round_until = round_until or "2999-01-01T00:00:00Z",
            job = { id = job.id, lease_token = job.lease_token, execution_seq = job.execution_seq } } }
end

local function define_tests()
    test.describe("round write library", function()
        test.before_all(function() h.ensure_log() end)

        test.it("separates record identity from source changes operations and tuple boundaries", function()
            local d = drive_of("owner", 1)
            local one = { item_key = "record", dedup_key = "change:1", op = "upsert" }
            local two = { item_key = "record", dedup_key = "change:2", op = "upsert" }
            local a, b = round_write.keys(d, one), round_write.keys(d, two)
            test.eq(a.identity_key, b.identity_key)
            test.is_true(a.idempotency_key ~= b.idempotency_key)
            two.op = "delete"
            test.is_true(round_write.keys(d, two).idempotency_key ~= b.idempotency_key)
            local left = round_write.keys({ automation_id = "a/b", source_port = "c", drive_key = "c" }, { item_key = "d", dedup_key = "d" })
            local right = round_write.keys({ automation_id = "a", source_port = "b/c", drive_key = "b/c" }, { item_key = "d", dedup_key = "d" })
            test.is_true(left.identity_key ~= right.identity_key, "tuple boundaries cannot collide")
        end)

        test.it("keeps one destination record while resync revisions and delivery signatures advance", function()
            local owner = uuid.v7()
            local original = round_write.keys(drive_of(owner, 1), { item_key = "source-record", dedup_key = "version-1" })
            local previous = original.idempotency_key
            for revision = 2, 5 do
                local next_delivery = round_write.keys(drive_of(owner, revision), {
                    item_key = "source-record", dedup_key = "version-" .. tostring(revision), input = { content = "changed" },
                })
                test.eq(next_delivery.identity_key, original.identity_key)
                test.is_true(next_delivery.idempotency_key ~= previous)
                previous = next_delivery.idempotency_key
            end
        end)

        test.it("keeps the identity key across delivery revisions and moves the idempotency key with them", function()
            local id = uuid.v7()
            local item = { item_key = "rec-1", dedup_key = "rec-1" }
            local first = round_write.keys(drive_of(id, 1), item, nil)
            local again = round_write.keys(drive_of(id, 1), item, nil)
            local next_revision = round_write.keys(drive_of(id, 2), item, nil)
            local slotted = round_write.keys(drive_of(id, 1), item, "attachments")
            test.eq(first.identity_key, again.identity_key)
            test.eq(first.idempotency_key, again.idempotency_key)
            test.eq(next_revision.identity_key, first.identity_key)
            test.is_true(next_revision.idempotency_key ~= first.idempotency_key)
            test.is_true(slotted.identity_key ~= first.identity_key)
        end)

        test.it("gives an explicit resend a new attempt identity", function()
            local d = drive_of((uuid.v7()))
            local first = round_write.keys(d, { item_key = "record", dedup_key = "change" })
            local resend = round_write.keys(d, { item_key = "record", dedup_key = "change", attempt_generation = 1 })
            test.eq(first.identity_key, resend.identity_key)
            test.is_true(first.idempotency_key ~= resend.idempotency_key)
        end)

        test.it("describes a sink's declared delivery and input shape and refuses one that declares none", function()
            local store, store_err = round_write.describe_sink(STORE)
            test.is_nil(store_err, tostring(store_err))
            test.eq(store.delivery, "exactly_once")
            test.eq(store.input_shape, "record")
            test.eq(store.binding, "kickside.automation.round.fixture:store_binding")
            local _, undeclared_err = round_write.describe_sink(UNDECLARED)
            test.not_nil(undeclared_err)
            test.is_true(errors.is(undeclared_err, errors.INVALID))
            test.contains(tostring(undeclared_err), "delivery")
        end)

        test.it("prepares one canonical spec and removes preparation list execution", function()
            local held = stamped((uuid.v7()))
            local spec: Map = { drive = held, key = "canonical", hash = "canonical-hash", prepared = true }
            local calls = 0
            local compute = function(): (any?, any)
                calls = calls + 1
                return { value = calls }, nil
            end
            local first, first_err = round_write.prepare(spec, compute)
            test.is_nil(first_err, tostring(first_err))
            test.eq(first.value, 1)
            local again, again_err = round_write.prepare(spec, compute)
            test.is_nil(again_err, tostring(again_err))
            test.eq(again.value, 1)
            test.eq(calls, 1)
            test.is_nil(round_write.prepare_many)
        end)

        test.it("persists prepared output once and reuses it for a retry under the same key and hash", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local calls = 0
            local compute = function(): (any?, any)
                calls = calls + 1
                return { title = "computed " .. tostring(calls) }, nil
            end
            local first, first_err = round_write.prepare({ drive = held, key = "key-1", hash = "hash-1", prepared = true }, compute)
            test.is_nil(first_err, tostring(first_err))
            local retried, retry_err = round_write.prepare({ drive = held, key = "key-1", hash = "hash-1", prepared = true }, compute)
            test.is_nil(retry_err, tostring(retry_err))
            test.eq(calls, 1)
            test.eq(retried.title, first.title)
            local rows = query("SELECT payload_hash, prepared_json FROM kickside_automation_prepared WHERE automation_id = $1", { id })
            test.eq(#rows, 1)
            test.eq(json.decode(rows[1].prepared_json).title, "computed 1")
            local _, conflict_err = round_write.prepare({ drive = held, key = "key-1", hash = "hash-2", prepared = true }, compute)
            test.not_nil(conflict_err)
            test.is_true(errors.is(conflict_err, errors.CONFLICT))
            test.eq(conflict_err:details().reason, "idempotency_conflict")
            test.eq(calls, 1)
        end)

        test.it("writes for an owner holding more receipts than any former per-owner count", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            exec([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<100000)
                INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                SELECT $1,'fixture:records','seed-' || CAST(x AS TEXT),'','seed-' || CAST(x AS TEXT),'{}',$2 FROM n]],
                { id, "2026-01-01T00:00:00Z" })
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local key = "past-" .. id
            local sent = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = key, idempotency_key = key .. "@1", max_destination_slots = 1 },
                held, { item_key = key, dedup_key = key })
            test.eq(sent.state, "delivered", json.encode(sent))
            test.eq(#sent.receipts, 1)
            test.eq(fresh_rows(id).receipts, 100000)
            exec("DELETE FROM kickside_automation_receipt WHERE owner_id=$1", { id })
        end)

        test.it("persists prepared output for an owner holding more prepared bytes than any former per-owner budget", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local blob = string.rep("x", 1048000)
            for index = 1, 65 do
                exec([[INSERT INTO kickside_automation_prepared
                    (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                    VALUES ($1,$2,'seed',$3,$4)]], { id, "seed-" .. tostring(index), '"' .. blob .. '"', "2026-01-01T00:00:00Z" })
            end
            local calls = 0
            local value, err = round_write.prepare({ drive = held, key = "past-budget", hash = "past-hash", prepared = true },
                function(): (any?, any) calls = calls + 1; return { title = "fits" }, nil end)
            test.is_nil(err, tostring(err))
            test.eq(value.title, "fits")
            test.eq(calls, 1)
            test.eq(fresh_rows(id).prepared, 66)
            exec("DELETE FROM kickside_automation_prepared WHERE automation_id=$1", { id })
        end)

        test.it("refuses one prepared item above the per-item byte limit without storing it", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local _, refusal = round_write.prepare({ drive = held, key = "oversized", hash = "oversized-hash", prepared = true },
                function(): (any?, any) return string.rep("x", 1048577), nil end)
            test.not_nil(refusal)
            test.is_true(errors.is(refusal, errors.INVALID), tostring(refusal))
            test.eq(refusal:details().reason, "row_too_large")
            test.eq(refusal:details().cap, 1048576)
            test.is_nil(refusal:details().status)
            test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { id }), 0)
        end)

        test.it("refuses a destination-slot bound above the per-item slot limit before any effect", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local slots, slots_err = round_write.destination_slots()
            if slots_err or not slots then error("destination slot limit unavailable: " .. tostring(slots_err)) end
            local key = "slots-" .. id
            local refused = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = key, idempotency_key = key .. "@1", max_destination_slots = slots + 1 },
                held, { item_key = key, dedup_key = key })
            test.eq(refused.state, "failed")
            test.eq(refused.error.kind, errors.INVALID)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1", { key }), 0)
        end)

        test.it("classifies each write outcome by the sink's declared delivery", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local notify, sink_err = round_write.describe_sink(NOTIFY)
            if sink_err or not notify then error("sink unavailable: " .. tostring(sink_err)) end
            local function write(sink: Map, directive: string, key: string): Map
                return round_write.write(sink, { config = {}, sink_op = "upsert", input = { directive = directive },
                    identity_key = key, idempotency_key = key .. "@1" }, held, { item_key = key, dedup_key = key })
            end
            local ok = write(store, "", "a")
            test.eq(ok.state, "delivered")
            test.eq(#ok.receipts, 1)
            test.eq(ok.receipts[1].map_slot, "")
            test.eq(ok.receipts[1].dest_ref.id, "rec:a")
            test.eq(ok.receipts[1].dest_version, "v1")
            test.eq(ok.receipts[1].identity_key, "a")
            test.eq(ok.receipts[1].idempotency_key, "a@1")

            local capacity = write(store, "capacity", "b")
            test.eq(capacity.state, "waiting")
            test.eq(capacity.retry_after_ms, 30000)

            local retry = write(store, "timeout", "c")
            test.eq(retry.state, "failed")
            test.is_true(retry.error.retriable)

            local dead = write(store, "invalid", "d")
            test.eq(dead.state, "failed")
            test.is_false(dead.error.retriable)

            local conflict = write(store, "conflict", "e")
            test.eq(conflict.state, "failed")
            test.is_false(conflict.error.retriable)

            -- At most once: the item is reserved uncertain before the request, so
            -- an ambiguous answer stays uncertain and is never repeated by itself.
            local ambiguous = write(notify, "timeout", "f")
            test.eq(ambiguous.state, "uncertain")
            local reserved = query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id = $1 AND item_key = 'f'", { id })
            test.eq(reserved[1].state, "uncertain")
            local sent = write(notify, "", "g")
            test.eq(sent.state, "delivered")
            local held = query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id = $1 AND item_key = 'g'", { id })
            test.eq(held[1].state, "uncertain")
            test.eq(tonumber(query("SELECT unresolved_count FROM kickside_automation_drive WHERE automation_id = $1", { id })[1].unresolved_count), 2)
        end)

        test.it("does not resend an uncertain delivery after the successful send lost its round commit", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local notify, sink_err = round_write.describe_sink(NOTIFY)
            test.is_nil(sink_err, tostring(sink_err))
            if not notify then error("notify sink is missing") end
            local key = "crash-" .. id
            local item = { item_key = key, dedup_key = key }
            local request = { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = key, idempotency_key = key .. "@1" }
            local sent = round_write.write(notify, request, held, item)
            test.eq(sent.state, "delivered")
            -- The durable reservation survived; the outcome/cursor commit did not.
            local reclaimed = round_write.write(notify, request, held, item)
            test.eq(reclaimed.state, "uncertain")
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key='sink' AND item_key=$1", { key }), 1)
            request.input = { directive = "changed" }
            local changed = round_write.write(notify, request, held, item)
            test.eq(changed.state, "failed")
            test.is_false(changed.error.retriable)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key='sink' AND item_key=$1", { key }), 1)
        end)

        test.it("names the invoking automation on every write, apart from the sink input", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local key = "named-" .. id
            local written = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = key, idempotency_key = key .. "@1" }, held, { item_key = key, dedup_key = key })
            test.eq(written.state, "delivered")
            local logged = query("SELECT detail_json FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1", { key })
            test.eq(#logged, 1)
            local detail = json.decode(logged[1].detail_json)
            test.eq(detail.automation_ref.kind, "automation")
            test.eq(detail.automation_ref.id, id)
            test.eq(detail.automation_ref.revision, 3)
            test.eq(detail.directive, "")
        end)

        test.it("answers one receipt per destination slot, refuses foreign slots and removes a deleted slot", function()
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local held = stamped((uuid.v7()))
            local item = { item_key = "m", dedup_key = "m" }
            local slotted = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "slots" },
                identity_key = "m", idempotency_key = "m@1" }, held, item)
            test.eq(slotted.state, "delivered")
            test.eq(#slotted.receipts, 2)
            test.eq(slotted.receipts[1].map_slot, "a")
            test.eq(slotted.receipts[2].dest_ref.id, "rec:m:b")

            local overflow = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "slots" },
                identity_key = "overflow", idempotency_key = "overflow@1", max_destination_slots = 1 },
                held, { item_key = "overflow", dedup_key = "overflow" })
            test.eq(overflow.state, "uncertain")
            test.is_true(errors.is(overflow.error, errors.CONFLICT), tostring(overflow.error))
            test.eq(overflow.error:details().reason, "destination_receipt_uncertain")
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key='sink' AND item_key='overflow'"), 1)

            local foreign = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "slots" },
                identity_key = "m", idempotency_key = "m@1", map_slot = "a", dest_ref = { id = "rec:m:a" } }, held, item)
            test.eq(foreign.state, "uncertain")
            test.is_true(errors.is(foreign.error, errors.CONFLICT), tostring(foreign.error))

            local deleted = round_write.write(store, { config = {}, sink_op = "delete", input = {},
                identity_key = "m", idempotency_key = "m@1", map_slot = "b", dest_ref = { id = "rec:m:b" } }, held, item)
            test.eq(deleted.state, "delivered")
            test.eq(#deleted.receipts, 1)
            test.eq(deleted.receipts[1].map_slot, "b")
            test.is_true(deleted.receipts[1].removed)

            local unnamed = round_write.write(store, { config = {}, input = {}, identity_key = "m", idempotency_key = "m@1" }, held, item)
            test.eq(unnamed.state, "failed")
        end)

        test.it("refuses pre-effect persistence and the effect once a control fenced the round", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            local d, db_err = sql.get(DB)
            if db_err or not d then error("database unavailable: " .. tostring(db_err)) end
            local tx = d:begin()
            drive.fence_for_command_tx(tx, id, { "main" }, "control-1", 1)
            tx:commit()
            d:release()
            local calls = 0
            local _, prepare_err = round_write.prepare({ drive = held, key = "key-f", hash = "hash-f", prepared = true }, function(): (any?, any)
                calls = calls + 1
                return { title = "never" }, nil
            end)
            test.not_nil(prepare_err)
            test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1", { id }), 0)
            local notify, sink_err = round_write.describe_sink(NOTIFY)
            if sink_err or not notify then error("sink unavailable: " .. tostring(sink_err)) end
            local sent = round_write.write(notify, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = "fenced-" .. id, idempotency_key = "fenced@1" }, held, { item_key = "x", dedup_key = "x" })
            test.eq(sent.state, "failed")
            test.is_true(sent.error.retriable)
            test.eq(#query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id = $1", { id }), 0)
            test.eq(tonumber(query("SELECT unresolved_count FROM kickside_automation_drive WHERE automation_id = $1", { id })[1].unresolved_count), 0)

            -- Exactly-once and at-least-once writes take the same fence before
            -- the provider call.
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local stored = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = "fenced-store-" .. id, idempotency_key = "fenced-store@1" }, held, { item_key = "y", dedup_key = "y" })
            test.eq(stored.state, "failed")
            test.is_true(stored.error.retriable)
            test.eq(stored.error.kind, errors.CONFLICT)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1", { "fenced-store-" .. id }), 0)
        end)

        -- The round's fence also expires with the round's deadline and with the
        -- job lease the round runs under (§4.2): a write past either sends
        -- nothing, and an at-most-once write re-checks the fence after its
        -- uncertain reservation, immediately before the send.
        test.it("sends nothing once the round's deadline passed", function()
            local id = uuid.v7()
            local held = stamped(id, "2000-01-01T00:00:00Z")
            id = tostring(held.automation_id)
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local key = "expired-" .. id
            local sent = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = key, idempotency_key = key .. "@1" }, held, { item_key = key, dedup_key = key })
            test.eq(sent.state, "failed")
            test.is_true(sent.error.retriable)
            test.eq(sent.error.kind, errors.CONFLICT)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1", { key }), 0)
        end)

        test.it("sends nothing once the round's job lease is gone, at-most-once after its reservation", function()
            local id = uuid.v7()
            local held = stamped(id)
            id = tostring(held.automation_id)
            exec("UPDATE kickside_job SET status = 'done', lease_token = NULL, lease_until = NULL WHERE id = $1", { held.fence.job.id })
            local store, sink_err = round_write.describe_sink(STORE)
            if sink_err or not store then error("sink unavailable: " .. tostring(sink_err)) end
            local key = "leased-" .. id
            local stored = round_write.write(store, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = key, idempotency_key = key .. "@1" }, held, { item_key = key, dedup_key = key })
            test.eq(stored.state, "failed")
            test.eq(stored.error.kind, errors.CONFLICT)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE drive_key = 'sink' AND item_key = $1", { key }), 0)
            local notify, sink_err = round_write.describe_sink(NOTIFY)
            if sink_err or not notify then error("sink unavailable: " .. tostring(sink_err)) end
            local notify_key = "leased-notify-" .. id
            local notified = round_write.write(notify, { config = {}, sink_op = "upsert", input = { directive = "" },
                identity_key = notify_key, idempotency_key = notify_key .. "@1" }, held, { item_key = notify_key, dedup_key = notify_key })
            test.eq(notified.state, "failed")
            test.eq(notified.error.kind, errors.CONFLICT)
            test.eq(#query("SELECT id FROM round_fixture_log WHERE item_key = $1", { notify_key }), 0)
        end)

        test.it("lists the receipts of a page's items in one read, each item's slots in order", function()
            local id = uuid.v7()
            for _, row in ipairs({ { "k", "b" }, { "k", "a" }, { "j", "" } }) do
                exec("INSERT INTO kickside_automation_receipt (owner_id, source_port, item_key, map_slot, identity_key, dest_ref_json,"
                    .. " dest_version, updated_at) VALUES ($1, 'p', $2, $3, 'i', $4, 'v1', '2026-01-01T00:00:00Z')",
                    { id, row[1], row[2], json.encode({ id = row[1] .. row[2] }) })
            end
            local listed, err = round_write.receipts(id, "p", { "k", "j", "none" })
            test.is_nil(err, tostring(err))
            test.eq(#listed.k, 2)
            test.eq(listed.k[1].map_slot, "a")
            test.eq(listed.k[2].dest_ref.id, "kb")
            test.eq(#listed.j, 1)
            test.is_nil(listed.none)
        end)
    end)
end

return test.run_cases(define_tests)
