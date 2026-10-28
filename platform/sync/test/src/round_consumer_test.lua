-- The sync's round consumer (kickside.trigger:round_consumer.deliver; design
-- v5 §3.2, §4.6): the plan compiled from the drive's applied declaration
-- filters, transforms, normalizes and writes each item through round_write and
-- answers every item key in exactly one outcome list. An effectful transform
-- runs only on resources both the drive's operator and its execution
-- principal hold grants on (design v5 §6.2). Runs on SQLite and PostgreSQL
-- against fixture sinks that declare their delivery semantics.

local test = require("test")
local round_write = require("round_write")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local drive = require("drive")
local user_repo = require("user_repo")
local user_groups_repo = require("user_groups_repo")

type Map = { [string]: any }

local DB = "app:db"
local DELIVER = "kickside.sync:round_deliver"
local SOURCE = "app.fixture:records"

local function exec(statement: string, params: { any }?): ()
    local d, db_err = sql.get(DB)
    if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
    local _, err = d:execute(statement, params or {})
    d:release()
    if err then error(tostring(err)) end
end

local function query(statement: string, params: { any }?): { Map }
    local d, db_err = sql.get(DB)
    if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
    local rows, err = d:query(statement, params or {})
    d:release()
    if err then error(tostring(err)) end
    return rows :: { Map }
end

-- Storage failures are injected at real persistence boundaries, before any send.
local function reject_inserts(table_name: string, enabled: boolean): ()
    local d, db_err = sql.get(DB)
    if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
    local kind = d:type()
    d:release()
    if not enabled then
        exec("DROP TRIGGER sync_storage_fault" .. (kind == sql.type.POSTGRES and " ON " .. table_name or ""))
        if kind == sql.type.POSTGRES then exec("DROP FUNCTION sync_storage_fault()") end
    elseif kind == sql.type.POSTGRES then
        exec([[CREATE FUNCTION sync_storage_fault() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN RAISE EXCEPTION 'No space left on device (sync storage fault)' USING ERRCODE='53100'; END $$]])
        exec("CREATE TRIGGER sync_storage_fault BEFORE INSERT ON " .. table_name
            .. " FOR EACH ROW EXECUTE FUNCTION sync_storage_fault()")
    else
        exec("CREATE TRIGGER sync_storage_fault BEFORE INSERT ON " .. table_name
            .. " BEGIN SELECT RAISE(ABORT, 'sync storage fault'); END")
    end
end

local function writes(identity: string): { Map }
    local out: { Map } = {}
    for _, row in ipairs(query("SELECT detail_json FROM sync_round_writes WHERE kind = 'write' AND record_key = $1 ORDER BY id", { identity })) do
        out[#out + 1] = json.decode(row.detail_json)
    end
    return out
end

local function by_key(list: { Map }): { [string]: Map }
    local out: { [string]: Map } = {}
    for _, entry in ipairs(list or {}) do out[entry.key] = entry end
    return out
end

local function item(key: string, payload: Map, op: string?): Map
    return { item_key = key, dedup_key = key, op = op or "upsert", payload = payload, attempts = 0 }
end

local function declaration(sink_port: string, transform: Map, filter: string?): Map
    local trigger: Map = { v = 2, source = SOURCE }
    if filter then trigger.filter = { expr = filter } end
    return { title = "Round sync", trigger = trigger, sink_port = sink_port, sink_config = {}, transform = transform, enabled = true }
end

local TRANSFORM_FN = "app.fixture:round_transform"

local function transform_calls(key: string): integer
    return #query("SELECT id FROM sync_round_writes WHERE kind = 'transform' AND record_key = $1", { key })
end

-- register_resource(owner, grantee?, group?) -> a component the owner holds
-- FULL on, with READ granted to the grantee user and to the group when named.
local function register_resource(owner: string, grantee: string?, group: string?): string
    local actor = security.new_actor(owner, { security_groups = { "automation_test" } })
    local policy = security.policy("app:user")
    local svc = contract.get("kickside.component:component_service")
    local inst = (svc :: any):with_actor(actor):with_scope(security.new_scope({ policy })):open()
    local id = uuid.v7()
    local registered = inst:register({ component_id = id, impl_id = "kickside.test:transform_resource", meta = { class = "transform_resource" } })
    if not registered or not registered.success then error("register resource: " .. tostring(registered and registered.error)) end
    for _, subject in ipairs({ { grantee, "user" }, { group, "group" } }) do
        if subject[1] then
            local granted = inst:grant_subtree({ root_component_id = id, subject = { subject_id = subject[1], subject_type = subject[2] }, access_mask = 1 })
            if not granted or not granted.success then error("grant resource: " .. tostring(granted and granted.error)) end
        end
    end
    return id
end

local RECORD_EXPR = { kind = "expr", expr = '{"directive": payload.directive, "title": "record " + item.item_key}' }

local function define_tests(section: string)
    test.describe("sync round consumer", function()
        local automation_id = ""
        local operator, principal = "", ""
        local shared = ""
        -- The running job whose lease the fixture round holds.
        local round_job: Map = {}

        local function delivery_key(key: string, op: string?): string
            return round_write.keys({ automation_id = automation_id, source_port = SOURCE, delivery_revision = 1 },
                { item_key = key, dedup_key = key, op = op or "upsert" }).idempotency_key
        end
        local function identity(key: string, slot: string?): string
            return round_write.keys({ automation_id = automation_id, source_port = SOURCE }, { item_key = key }, slot).identity_key
        end

        local function deliver(items: { Map }, config: Map, holders: Map?): (Map?, any)
            for _, item in ipairs(items) do item.delivery_key = delivery_key(item.item_key, item.op) end
            local who = holders or {}
            local caller = funcs.new()
            if who.actor then
                caller = caller:with_actor(security.new_actor(who.actor, { security_groups = { "automation_test" } }))
                    :with_scope(security.new_scope({ security.policy("app:user") }))
            end
            return caller:call(DELIVER, {
                drive = { automation_id = automation_id, drive_key = "main", source_kind = who.source_kind or "collection", source_ref = SOURCE,
                    source_port = SOURCE, ledger_port = SOURCE, delivery_revision = 1,
                    fence = { round_token = "round-" .. automation_id, revision = 1, rewind_generation = 0, command_generation = 0,
                        round_until = "2999-01-01T00:00:00Z", job = round_job },
                    operator = { kind = "user", id = who.operator or operator },
                    principal = { kind = "user", id = who.principal or principal } },
                items = items, config = config,
            })
        end

        local function func_transform(resource_id: string?): Map
            local t: Map = { kind = "func", ["function"] = TRANSFORM_FN }
            if resource_id then t.resource_id = resource_id end
            return t
        end

        local function receipt(key: string, slot: string, dest_id: string): ()
            exec("INSERT INTO kickside_automation_receipt (owner_id, source_port, item_key, map_slot, identity_key, dest_ref_json,"
                .. " dest_version, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'v1', '2026-01-01T00:00:00Z')",
                { automation_id, SOURCE, key, slot, identity(key), json.encode({ id = dest_id }) })
        end

        test.before_all(function()
            local suffix = uuid.v4():sub(1, 8)
            operator, principal = "sync_operator_" .. suffix, "sync_principal_" .. suffix
            -- Grants count for active directory users only (A32).
            for _, id in ipairs({ operator, principal }) do
                local _, create_err = user_repo.create({ user_id = id, email = id .. "@test.local", password = "testpass123", status = "active" })
                if create_err then error("create user " .. id .. ": " .. tostring(create_err)) end
                local assigned, group_err = user_groups_repo.assign_user_to_group(id, "automation_test")
                if group_err or not assigned then error("assign harness scope: " .. tostring(group_err)) end
            end
            local d, db_err = sql.get(DB)
            if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
            local kind = d:type()
            d:release()
            exec("CREATE TABLE IF NOT EXISTS sync_round_writes (id " .. (kind == sql.type.SQLITE
                and "INTEGER PRIMARY KEY AUTOINCREMENT" or "BIGSERIAL PRIMARY KEY") .. ", kind TEXT NOT NULL, record_key TEXT NOT NULL,"
                .. " detail_json TEXT NOT NULL)")
            shared = register_resource(operator, principal)
        end)

        test.before_each(function()
            automation_id = register_resource(principal, operator)
            round_job = { id = uuid.v7(), lease_token = uuid.v7(), execution_seq = 1 }
            local d, db_err = sql.get(DB)
            if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
            local tx = d:begin()
            local _, err = drive.insert_tx(tx, { automation_id = automation_id, drive_key = "main",
                source_kind = "collection", job_id = round_job.id })
            if err then tx:rollback() else tx:commit() end
            d:release()
            if err then error(tostring(err)) end
            exec("UPDATE kickside_automation_drive SET round_token = $1, round_until = $2 WHERE automation_id = $3 AND drive_key = 'main'",
                { "round-" .. automation_id, "2999-01-01T00:00:00Z", automation_id })
            exec("INSERT INTO kickside_job (id, job_type, job_identity, status, lease_token, lease_until, execution_seq,"
                .. " owner_kind, owner_id) VALUES ($1, 'kickside.automation:round', $2, 'running', $3, $4, 1, 'automation', $5)",
                { round_job.id, "test:" .. round_job.id, round_job.lease_token, "2999-01-01T00:00:00Z", automation_id })
        end)

        if section == "delivery" then
            test.it("skips explicit transform outcomes and replays their prepared reason without writing", function()
                local round_outcome = require("round_outcome")
                local round_commit = require("round_commit")
                local config = declaration("app.fixture:round_record", func_transform(shared))
                local events = { item("skip", { directive = "skip" }) }
                local final: Map = {}
                receipt("skip", "", "rec:existing")
                for _ = 1, 2 do
                    local out, err = deliver(events, config)
                    test.is_nil(err, tostring(err))
                    test.eq(#out.skipped_items, 1, json.encode(out))
                    test.eq(#out.failed_items, 0)
                    test.eq(#out.delivered_items, 0)
                    test.eq(#out.waiting_items, 0)
                    test.eq(#out.uncertain_items, 0)
                    local skipped = by_key(out.skipped_items)[delivery_key("skip")]
                    test.eq(skipped.reason, "no matching record")
                    test.eq(skipped.prepared_key, delivery_key("skip"))
                    final = out
                end
                test.eq(transform_calls("skip"), 1)
                test.eq(#writes(identity("skip")), 0)
                local prepared = query("SELECT prepared_json FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id })
                test.eq(#prepared, 1)
                test.eq(json.decode(prepared[1].prepared_json).skip, "no matching record")
                test.eq(#query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1", { automation_id }), 0)
                local destination = query("SELECT dest_ref_json FROM kickside_automation_receipt WHERE owner_id=$1", { automation_id })[1]
                test.eq(json.decode(destination.dest_ref_json).id, "rec:existing")

                local recorded, receipts = round_outcome.ledger_outcomes(events,
                    { delivered = final.delivered_items, skipped = final.skipped_items, waiting = final.waiting_items,
                        uncertain = final.uncertain_items, failed = final.failed_items }, {})
                test.eq(recorded[1].state, "resolved")
                test.eq(receipts[1].prepared_key, delivery_key("skip"))
                local db, db_err = sql.get(DB)
                test.is_nil(db_err)
                local tx = db:begin()
                local committed, commit_err = round_commit.commit_tx(tx,
                    { automation_id = automation_id, drive_key = "main", source_port = SOURCE, receipt_port = SOURCE,
                        captured = { round_token = "round-" .. automation_id, round_until = "2999-01-01T00:00:00Z",
                            revision = 1, rewind_generation = 0, command_generation = 0 },
                        now = drive.utc_now(), resolved_expires_at = "2999-01-01T00:00:00Z" },
                    { acquired = true, cursor = { page = 2 }, event_seq = 9, outcomes = recorded, receipts = receipts })
                if commit_err then tx:rollback() else tx:commit() end
                db:release()
                test.is_nil(commit_err, tostring(commit_err))
                test.is_true(committed.committed)
                test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id }), 0)
                test.eq(#query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1", { automation_id }), 0,
                    "a skip on first delivery creates no unresolved item")
                local state = query("SELECT state FROM kickside_automation_delivery_history WHERE automation_id=$1", { automation_id })
                test.eq(#state, 1)
                test.eq(state[1].state, "resolved")
                local progress = query("SELECT cursor,event_seq,unresolved_count FROM kickside_automation_drive WHERE automation_id=$1", { automation_id })[1]
                test.eq(json.decode(progress.cursor).page, 2)
                test.eq(tonumber(progress.event_seq), 9)
                test.eq(tonumber(progress.unresolved_count), 0)
                test.eq(#query("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1", { automation_id }), 1)
            end)

            test.it("skips replay-safe transforms before record and content normalization without preparing output", function()
                for _, sink in ipairs({ "app.fixture:round_record", "app.fixture:round_content" }) do
                    local key = "pure-skip-" .. sink
                    local out, err = deliver({ item(key, {}) }, declaration(sink,
                        { kind = "expr", expr = '{"present": false, "skip": "no matching record"}' }))
                    test.is_nil(err, tostring(err))
                    test.eq(#out.skipped_items, 1, json.encode(out))
                    test.eq(out.skipped_items[1].reason, "no matching record")
                    test.is_nil(out.skipped_items[1].prepared_key)
                    test.eq(#out.failed_items, 0)
                    test.eq(#writes(identity(key)), 0)
                end
                test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id }), 0)
            end)

            test.it("writes each item through the declared sink under stable keys and answers every key once", function()
                local out, err = deliver({ item("ok", { directive = "" }), item("busy", { directive = "capacity" }),
                    item("bad", { directive = "invalid" }) }, declaration("app.fixture:round_record", RECORD_EXPR))
                test.is_nil(err, tostring(err))
                local delivered = by_key(out.delivered_items)
                test.eq(#out.delivered_items, 1)
                test.eq(delivered[delivery_key("ok")].receipts[1].dest_ref.id, "rec:" .. identity("ok"))
                test.eq(delivered[delivery_key("ok")].receipts[1].map_slot, "")
                test.eq(by_key(out.waiting_items)[delivery_key("busy")].retry_after_ms, 30000)
                test.is_false(by_key(out.failed_items)[delivery_key("bad")].error.retriable)
                local written = writes(identity("ok"))
                test.eq(#written, 1)
                test.eq(written[1].sink_op, "upsert")
                test.eq(written[1].idempotency_key, delivery_key("ok"))
                test.eq(written[1].origin, automation_id, "the sink write names its writing origin")
                test.eq(written[1].input.title, "record ok")
            end)

            test.it("delivers for an owner holding more receipts than any former per-owner count", function()
                exec([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<100000)
                    INSERT INTO kickside_automation_receipt
                    (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                    SELECT $1,$2,'seed-' || CAST(x AS TEXT),'','seed-' || CAST(x AS TEXT),'{}',$3 FROM n]],
                    { automation_id, SOURCE, "2026-01-01T00:00:00Z" })
                local out, err = deliver({ item("past-receipts", { directive = "" }) },
                    declaration("app.fixture:round_record", func_transform(shared)))
                exec("DELETE FROM kickside_automation_receipt WHERE owner_id=$1 AND item_key LIKE 'seed-%'", { automation_id })
                test.is_nil(err, tostring(err))
                test.eq(#out.delivered_items, 1)
                test.eq(transform_calls("past-receipts"), 1)
                test.eq(#writes(identity("past-receipts")), 1)
            end)

            test.it("delivers a page of replay-unsafe upserts larger than any former per-owner prepared-byte budget", function()
                local count = 65
                local items: { Map } = {}
                for index = 1, count do items[#items + 1] = item("page-" .. tostring(index), { directive = "" }) end
                local out, err = deliver(items, declaration("app.fixture:round_record", func_transform(shared)))
                test.is_nil(err, tostring(err))
                test.eq(#out.delivered_items, count)
                test.eq(#out.failed_items, 0)
                local retained = query("SELECT prepared_json FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id })
                test.eq(#retained, count)
            end)

            test.it("writes the full fanout when an existing empty receipt expands", function()
                receipt("expand-ok", "", "rec:old")
                local out, err = deliver({ item("expand-ok", { directive = "slots" }) },
                    declaration("app.fixture:round_record", RECORD_EXPR))
                test.is_nil(err, tostring(err))
                test.eq(#by_key(out.delivered_items)[delivery_key("expand-ok")].receipts, 2)
            end)

            test.it("blocks the whole round when the sink resource denies the principal", function()
                local out, err = deliver({ item("denied", { directive = "permission" }) },
                    declaration("app.fixture:round_record", RECORD_EXPR))
                test.is_nil(out)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            end)

            test.it("skips an item its filter drops and fails an item whose filter cannot be evaluated", function()
                local out, err = deliver({ item("keep", { keep = true, name = "a" }), item("drop", { keep = false, name = "b" }),
                    item("broken", { keep = true, name = 7 }) },
                    declaration("app.fixture:round_record", { kind = "none" }, "payload.keep and len(payload.name) > 0"))
                test.is_nil(err, tostring(err))
                test.eq(#out.delivered_items, 1)
                test.not_nil(by_key(out.delivered_items)[delivery_key("keep")])
                test.not_nil(by_key(out.skipped_items)[delivery_key("drop")])
                test.is_false(by_key(out.failed_items)[delivery_key("broken")].error.retriable)
                test.eq(#writes(identity("drop")), 0)
            end)

            test.it("fails an item whose transform produces no value instead of skipping it", function()
                local out, err = deliver({ item("empty", { directive = "" }) },
                    declaration("app.fixture:round_record", { kind = "expr", expr = "payload.missing" }))
                test.is_nil(err, tostring(err))
                local failed = by_key(out.failed_items)[delivery_key("empty")]
                test.not_nil(failed)
                test.is_false(failed.error.retriable)
                test.eq(#writes(identity("empty")), 0)
                test.is_nil(failed.prepared_key)
                local unsafe = deliver({ item("empty-unsafe", { directive = "none" }) },
                    declaration("app.fixture:round_record", func_transform(shared)))
                local unsafe_failed = by_key(unsafe.failed_items)[delivery_key("empty-unsafe")]
                test.not_nil(unsafe_failed, json.encode(unsafe))
                test.eq(unsafe_failed.prepared_key, delivery_key("empty-unsafe"))
            end)

            test.it("preserves effectful transform failures without caching a null result", function()
                local out, err = deliver({ item("transform-error", { directive = "transform_error" }) },
                    declaration("app.fixture:round_record", func_transform(shared)))
                test.is_nil(err, tostring(err))
                local failed = by_key(out.failed_items)[delivery_key("transform-error")]
                test.not_nil(failed, json.encode(out))
                test.is_true(failed.error.retriable)
                test.is_true(string.find(failed.error.message, "fixture transform unavailable", 1, true) ~= nil,
                    json.encode(failed))
                test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id }), 0)
                test.eq(#writes(identity("transform-error")), 0)
            end)

            test.it("preserves permanent transform errors without preparing or writing", function()
                local transform = func_transform(shared)
                transform["function"] = ""
                local out, err = deliver({ item("invalid-skip", {}) },
                    declaration("app.fixture:round_record", transform))
                test.is_nil(err, tostring(err))
                local failed = by_key(out.failed_items)[delivery_key("invalid-skip")]
                test.not_nil(failed, json.encode(out))
                test.is_false(failed.error.retriable)
                test.eq(failed.error.code, "missing_function")
                test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id }), 0)
                test.eq(#writes(identity("invalid-skip")), 0)
            end)

            test.it("uses one record normalization rule regardless of a legacy flag", function()
                local config = declaration("app.fixture:round_record", { kind = "expr", expr = "payload.flag" })
                config.legacy_record = true
                local out, err = deliver({ item("canonical-false", { flag = false }) }, config)
                test.is_nil(err, tostring(err))
                test.eq(#out.delivered_items, 0)
                test.eq(#out.failed_items, 1)
                test.is_false(out.failed_items[1].error.retriable)
                test.eq(#writes(identity("canonical-false")), 0)
            end)

            test.it("shapes a content sink's document with the item's identity and source reference", function()
                local out, err = deliver({ item("doc", { text = "hello" }) },
                    declaration("app.fixture:round_content", { kind = "expr", expr = "payload.text" }))
                test.is_nil(err, tostring(err))
                test.eq(#out.delivered_items, 1)
                local input = writes(identity("doc"))[1].input
                test.eq(input.content, "hello")
                test.eq(input.metadata.item_key, "doc")
                test.eq(input.metadata.sync_origin, automation_id)
                test.eq(input.metadata.source_ref.external_id, "doc")
            end)

            -- Exercise the real Inbox binding through the consumer, rather than
            -- calling its handler with an already-normalized table. Seed and live
            -- event pages must both carry the owning sync's provenance.
            for _, mode in ipairs({ "string", "configured", "override" }) do
                test.it("delivers seed and live event records to Inbox: " .. mode, function()
                    local transform = mode == "string" and { kind = "expr", expr = '"Upload event"' } or { kind = "none" }
                    local config = declaration("kickside.inbox.sink:inbox_item", transform)
                    if mode ~= "string" then config.sink_config = { content = "Configured upload message" } end
                    for _, phase in ipairs({ "seed", "live" }) do
                        local key = mode .. "-" .. phase
                        local payload: Map = { upload_id = key, filename = "notes.txt", status = "completed" }
                        if mode == "override" then payload.content = "Source upload message" end
                        local event = item(key, payload)
                        event.source_version = "event-1"
                        local out, err = deliver({ event }, config, { actor = principal, source_kind = "event" })
                        test.is_nil(err, tostring(err))
                        test.eq(#out.failed_items, 0, json.encode(out.failed_items))
                        test.eq(#out.delivered_items, 1)
                        local rows = query("SELECT body FROM kickside_event WHERE type = 'kickside.inbox.events:item.created'")
                        -- The sink acknowledges only after the Inbox event append.
                        -- Read that durable boundary, independent of fold timing.
                        local created: Map? = nil
                        local matches = 0
                        for _, row in ipairs(rows) do
                            local body = type(row.body) == "table" and row.body or json.decode(row.body)
                            if body.id == identity(key) then created = body; matches = matches + 1 end
                        end
                        test.not_nil(created, "Inbox item event is missing")
                        test.eq(matches, 1, "Inbox item has duplicate creation events")
                        test.eq(created.delivery_key, delivery_key(key))
                        test.eq(created.content, mode == "string" and "Upload event"
                            or mode == "override" and "Source upload message" or "Configured upload message")
                        test.eq(created.metadata.sync_origin, automation_id)
                        test.eq(created.metadata.item_key, key)
                        test.eq(created.metadata.dedup_key, key)
                        test.eq(created.metadata.source_version, "event-1")
                        test.not_nil(created.metadata.source_ref)
                        test.eq(out.delivered_items[1].receipts[1].dest_ref.item_id, identity(key))
                    end
                end)
            end

            test.it("retains a legacy null preparation as a visible failure without rerunning its transform", function()
                local config = declaration("app.fixture:round_record", func_transform(shared))
                local first, err = deliver({ item("legacy-null", { directive = "flaky" }) }, config)
                test.is_nil(err, tostring(err))
                test.is_true(by_key(first.failed_items)[delivery_key("legacy-null")].error.retriable)
                exec("UPDATE kickside_automation_prepared SET prepared_json='null' WHERE automation_id=$1", { automation_id })
                local writes_before = #writes(identity("legacy-null"))
                local second = deliver({ item("legacy-null", { directive = "flaky" }) }, config)
                local failed = by_key(second.failed_items)[delivery_key("legacy-null")]
                test.not_nil(failed, json.encode(second))
                test.is_false(failed.error.retriable)
                test.eq(failed.error.code, "missing_transform_result")
                test.eq(transform_calls("legacy-null"), 1)
                test.eq(#writes(identity("legacy-null")), writes_before)
            end)

            test.it("persists a replay-unsafe transform once and reuses it when the write is retried", function()
                local config = declaration("app.fixture:round_record", func_transform(shared))
                local first, err = deliver({ item("unsafe", { directive = "flaky" }) }, config)
                test.is_nil(err, tostring(err))
                test.is_true(by_key(first.failed_items)[delivery_key("unsafe")].error.retriable)
                local prepared = query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1", { automation_id })
                test.eq(#prepared, 1, json.encode(first))
                test.eq(prepared[1].idempotency_key, delivery_key("unsafe"))

                local second = deliver({ item("unsafe", { directive = "flaky" }) }, config)
                local delivered = by_key(second.delivered_items)[delivery_key("unsafe")]
                test.not_nil(delivered)
                test.eq(delivered.prepared_key, delivery_key("unsafe"))
                test.eq(transform_calls("unsafe"), 1)

                local safe = deliver({ item("pure", { directive = "" }) }, declaration("app.fixture:round_record", RECORD_EXPR))
                test.is_nil(by_key(safe.delivered_items)[delivery_key("pure")].prepared_key)
                test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id = $1", { automation_id }), 1)
            end)

            test.it("updates in place every destination slot its receipts map", function()
                receipt("mapped", "a", "rec:a")
                receipt("mapped", "b", "rec:b")
                local out, err = deliver({ item("mapped", { directive = "" }) }, declaration("app.fixture:round_record", RECORD_EXPR))
                test.is_nil(err, tostring(err))
                local delivered = by_key(out.delivered_items)[delivery_key("mapped")]
                test.eq(#delivered.receipts, 2)
                test.eq(delivered.receipts[1].map_slot, "a")
                test.eq(delivered.receipts[2].dest_version, "v2")
                local written = writes(identity("mapped"))
                test.eq(#written, 2)
                test.eq(written[1].map_slot, "a")
                test.eq(written[1].dest_ref.id, "rec:a")
                test.eq(written[2].dest_ref.id, "rec:b")
            end)

            test.it("records every slot a first write answers", function()
                local out = deliver({ item("fanout", { directive = "slots" }) }, declaration("app.fixture:round_record", RECORD_EXPR))
                local delivered = by_key(out.delivered_items)[delivery_key("fanout")]
                test.eq(#delivered.receipts, 2)
                test.eq(delivered.receipts[2].map_slot, "b")
            end)

            test.it("deletes every mapped destination of a delete item and skips one it never wrote", function()
                receipt("gone", "a", "rec:a")
                receipt("gone", "b", "rec:b")
                local out, err = deliver({ item("gone", {}, "delete"), item("never", {}, "delete") },
                    declaration("app.fixture:round_record", RECORD_EXPR))
                test.is_nil(err, tostring(err))
                local removed = by_key(out.delivered_items)[delivery_key("gone", "delete")].receipts
                test.eq(#removed, 2)
                test.is_true(removed[1].removed)
                test.eq(removed[2].map_slot, "b")
                local written = writes(identity("gone"))
                test.eq(#written, 2)
                test.eq(written[1].sink_op, "delete")
                -- A record delete has no transform output; the sink is addressed
                -- by the dest_ref it answered for the slot.
                test.eq(written[1].dest_ref.id, "rec:a")
                test.is_nil(next(written[1].input), json.encode(written[1].input))
                test.eq(written[2].dest_ref.id, "rec:b")
                test.is_nil(next(written[2].input), json.encode(written[2].input))
                test.not_nil(by_key(out.skipped_items)[delivery_key("never", "delete")])
            end)

            test.it("deletes a mapped destination whatever the filter says of a source item", function()
                receipt("filtered_gone", "", "rec:fg")
                local out, err = deliver({ item("filtered_gone", {}, "delete") },
                    declaration("app.fixture:round_record", RECORD_EXPR, "payload.keep"))
                test.is_nil(err, tostring(err))
                test.eq(#by_key(out.delivered_items)[delivery_key("filtered_gone", "delete")].receipts, 1)
                test.is_true(by_key(out.delivered_items)[delivery_key("filtered_gone", "delete")].receipts[1].removed)
            end)

            test.it("keeps an ambiguous at-most-once write uncertain", function()
                local out, err = deliver({ item("maybe", { directive = "timeout" }) }, declaration("app.fixture:round_notify", RECORD_EXPR))
                test.is_nil(err, tostring(err))
                test.not_nil(by_key(out.uncertain_items)[delivery_key("maybe")], json.encode(out))
                local held = query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='maybe'", { automation_id })
                test.eq(#held, 1)
                test.eq(held[1].state, "uncertain")
                local repeated, repeat_err = deliver({ item("maybe", { directive = "timeout" }) }, declaration("app.fixture:round_notify", RECORD_EXPR))
                test.is_nil(repeat_err, tostring(repeat_err))
                test.not_nil(by_key(repeated.uncertain_items)[delivery_key("maybe")], json.encode(repeated))
                test.eq(#writes(identity("maybe")), 1)
            end)

        elseif section == "storage" then
            test.it("sends nothing when replay-unsafe output cannot be persisted", function()
                local key = "storage-unsafe"
                local config = declaration("app.fixture:round_record", func_transform(shared))
                reject_inserts("kickside_automation_prepared", true)
                local out, err = deliver({ item(key, { directive = "" }) }, config)
                reject_inserts("kickside_automation_prepared", false)
                test.is_nil(err, tostring(err))
                local failed = by_key(out.failed_items)[delivery_key(key)]
                test.not_nil(failed, json.encode(out))
                test.is_true(failed.error.retriable)
                test.contains(failed.error.message, "storage fault")
                test.eq(#out.delivered_items, 0)
                test.eq(#writes(identity(key)), 0)
                test.eq(transform_calls(key), 1)
                test.eq(#query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1", { automation_id }), 0)
            end)

            test.it("sends nothing when pre-send uncertainty cannot be persisted", function()
                local key = "storage-notify"
                reject_inserts("kickside_trigger_item_ledger", true)
                local out, err = deliver({ item(key, { directive = "timeout" }) }, declaration("app.fixture:round_notify", RECORD_EXPR))
                reject_inserts("kickside_trigger_item_ledger", false)
                test.is_nil(err, tostring(err))
                local failed = by_key(out.failed_items)[delivery_key(key)]
                test.not_nil(failed, json.encode(out))
                test.is_true(failed.error.retriable)
                test.contains(failed.error.message, "storage fault")
                test.eq(#out.uncertain_items, 0)
                test.eq(#out.delivered_items, 0)
                test.eq(#writes(identity(key)), 0)
                test.eq(#query("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1", { automation_id }), 0)
            end)

        else
            test.it("refreshes transform resource grants before the next effect", function()
                local resource = register_resource(operator, principal)
                local out, err = deliver({
                    item("grant-first", { revoke_resource = resource, revoke_principal = principal }),
                    item("grant-second", {}) }, declaration("app.fixture:round_record", func_transform(resource)))
                test.is_nil(err, tostring(err))
                test.not_nil(out)
                test.eq(#out.delivered_items, 1)
                test.not_nil(by_key(out.delivered_items)[delivery_key("grant-first")])
                local denied = by_key(out.failed_items)[delivery_key("grant-second")]
                test.not_nil(denied)
                test.eq(denied.error.kind, errors.PERMISSION_DENIED)
                test.eq(denied.error.details.error_kind, "access")
                test.eq(transform_calls("grant-first"), 1)
                test.eq(transform_calls("grant-second"), 0)
                test.eq(#writes(identity("grant-first")), 1)
                test.eq(#writes(identity("grant-second")), 0)
            end)
            test.it("runs an effectful transform on a resource its operator and principal both hold", function()
                local out, err = deliver({ item("granted", { directive = "" }) }, declaration("app.fixture:round_record", func_transform(shared)))
                test.is_nil(err, tostring(err))
                test.not_nil(by_key(out.delivered_items)[delivery_key("granted")])
                test.eq(transform_calls("granted"), 1)
            end)

            test.it("refuses an effectful transform whose resource the operator lacks", function()
                local stranger = "sync_stranger_" .. uuid.v4():sub(1, 8)
                local foreign = register_resource(stranger, principal)
                local out, err = deliver({ item("no_operator", { directive = "" }) }, declaration("app.fixture:round_record", func_transform(foreign)))
                test.is_nil(out)
                test.not_nil(err)
                test.contains(tostring(err), "operator")
                test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                test.eq(transform_calls("no_operator"), 0)
            end)

            test.it("counts the operator's group grants, resolved through the users directory", function()
                local member = "sync_member_" .. uuid.v4():sub(1, 8)
                local _, create_err = user_repo.create({ user_id = member, email = member .. "@test.local", password = "testpass123", status = "active" })
                test.is_nil(create_err, tostring(create_err))
                local _, group_err = user_groups_repo.assign_user_to_group(member, "app:user")
                test.is_nil(group_err, tostring(group_err))
                local stranger = "sync_stranger_" .. uuid.v4():sub(1, 8)
                local shared_with_group = register_resource(stranger, principal, "app:user")
                local out, err = deliver({ item("via_group", { directive = "" }) },
                    declaration("app.fixture:round_record", func_transform(shared_with_group)), { operator = member })
                test.is_nil(err, tostring(err))
                test.not_nil(by_key(out.delivered_items)[delivery_key("via_group")])
                test.eq(transform_calls("via_group"), 1)
            end)

            test.it("refuses an effectful transform whose resource the principal lacks", function()
                local private = register_resource(operator, nil)
                local out, err = deliver({ item("no_principal", { directive = "" }) }, declaration("app.fixture:round_record", func_transform(private)))
                test.is_nil(out)
                test.contains(tostring(err), "principal")
                test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                test.eq(transform_calls("no_principal"), 0)
            end)

            test.it("refuses an effectful transform whose resource use cannot be enforced", function()
                local out, err = deliver({ item("opaque", { directive = "" }) }, declaration("app.fixture:round_record", func_transform(nil)))
                test.is_nil(out)
                test.eq(errors.is(err, errors.INVALID), true)
                test.eq(transform_calls("opaque"), 0)
                local _, tools_err = deliver({ item("tooled", { directive = "" }) }, declaration("app.fixture:round_record",
                    { kind = "code", code = "return input", tool_ids = { "app.fixture:round_write" } }))
                test.eq(errors.is(tools_err, errors.INVALID), true)
            end)

            test.it("refuses a declaration whose sink declares no delivery semantics", function()
                local out, err = deliver({ item("x", {}) }, declaration("app.fixture:store", RECORD_EXPR))
                test.is_nil(out)
                test.not_nil(err)
                test.contains(tostring(err), "declares no delivery")
            end)
        end
    end)
end

return {
    run_delivery = test.run_cases(function() define_tests("delivery") end),
    run_storage = test.run_cases(function() define_tests("storage") end),
    run_authorization = test.run_cases(function() define_tests("authorization") end),
}
