local fixture_cleanup = require("fixture_cleanup")
local fixtures: { string } = {}
-- Redelivery identity of the kb_embed_sink writable. The poller carries a stable
-- idempotency_key (the source item's dedup key, e.g. fireflies:transcript:<id>) in
-- the writable envelope. The sink must project that key into the KB content event's
-- external_id so that redelivering the same item -- even with changed content --
-- reconciles to ONE document rather than minting a fresh random content:<uuid> id
-- and appending a duplicate on every poll cycle.
--
-- The source projection worker is not driven in this harness, so materialization to
-- documents is async. This asserts at the content-event boundary (kickside_event):
-- both deliveries emit content.upserted events carrying the SAME external_id equal to
-- the idempotency_key. The one-document reconcile-by-external_id over those events is
-- covered by kb10's canonical-reconcile fixtures (kb_ingest_test).

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")
local json = require("json")
local contract = require("contract")
local registry = require("registry")
local kb_embed_sink = require("kb_embed_sink")

local DB = "app:db"
local SINK_WRITE = "kickside.knowledge.sink:kb_embed_write"
local THREADS_CONTRACT = "kickside.core:threads"
local THREAD_CLASS = "kickside.knowledge.injection"
-- The harness KB engine (test_engine_wiki) binds this impl for embeddable, so the
-- sink's component.open drives the full embed_content -> thread_ingest -> emit path.
local EMBED_BINDING = "test.kb:embeddable"
-- The engine binding whose meta.projections declares the source projection. The KB
-- create path provisions the primary thread under it; this harness seeds a KB row
-- directly, so it provisions the same way before delivering.
local ENGINE_IMPL = "app:test_engine_wiki"
local CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"
local CONTENT_DELETED = "kickside.knowledge.events:content.deleted"
local DELIVERY_CLAIMED = "kickside.knowledge.events:delivery.claimed"
local IDEMPOTENCY_KEY = "fireflies:transcript:t1"
-- The writing automation every direct sink write names as its origin.
local ORIGIN = "kb-embed-sink-test-automation"

local function db(): any
    local d, err = sql.get(DB)
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

-- A reconstructable user scope: declaring the source projection persists the caller's
-- execution identity, which requires a scope the resolver can rebuild (a named process
-- scope cannot be reconstructed here). Mirrors thread_ingest_identity_test.
local function limited_scope(): any
    local pol, err = security.policy("app:limited_user")
    if not pol then error("limited policy missing: " .. tostring(err)) end
    local deny, deny_err = security.policy("app:limited_no_process_scope")
    if not deny then error("limited deny policy missing: " .. tostring(deny_err)) end
    return security.new_scope({ pol, deny })
end

local function insert_meta(d: any, component_id: string, key: string, value: string): ()
    local _, err = sql.builder.insert("kickside_component_meta")
        :set_map({
            meta_id = uuid.v7(),
            component_id = component_id,
            key = key,
            value = value,
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if err then error("meta insert failed: " .. tostring(err)) end
end

local function seed_kb(component_id: string, owner: string): ()
    fixtures[#fixtures + 1] = component_id
    local d = db()
    local _, comp_err = sql.builder.insert("kickside_components")
        :set_map({
            component_id = component_id,
            impl_id = EMBED_BINDING,
            private_context = "{}",
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if comp_err then d:release() error("component insert failed: " .. tostring(comp_err)) end

    local _, access_err = sql.builder.insert("kickside_component_access")
        :set_map({
            access_id = uuid.v7(),
            subject_id = owner,
            subject_type = "user",
            component_id = component_id,
            source_component_id = component_id,
            access_mask = 15,
            inherited = 0,
            created_at = 0,
        })
        :run_with(d):exec()
    if access_err then d:release() error("access insert failed: " .. tostring(access_err)) end

    insert_meta(d, component_id, "class", "knowledge_base")
    insert_meta(d, component_id, "kb_type", "wiki")
    insert_meta(d, component_id, "status", "ready")
    insert_meta(d, component_id, "title", "Sink redelivery target")
    d:release()
end

-- Provision the KB primary thread under the engine binding so its declared source
-- projection is registered -- the owner mechanism the KB create path runs. Opened
-- with the caller's actor + scope so the projection is owned by them.
local function provision_primary_thread(component_id: string, actor: any, scope: any): ()
    local def, get_err = contract.get(THREADS_CONTRACT)
    if get_err then error("threads contract unavailable: " .. tostring(get_err)) end
    local threads, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err then error("threads open failed: " .. tostring(open_err)) end
    local _, ensure_err = threads:ensure_thread({
        component_id = component_id,
        impl_id = ENGINE_IMPL,
        thread_class = THREAD_CLASS,
    })
    if ensure_err then error("provision primary thread failed: " .. tostring(ensure_err)) end
end

local function cleanup(component_id: string): ()
    fixture_cleanup.cleanup(component_id)
end

local function cleanup_fixtures(): ()
    for _, id in ipairs(fixtures) do cleanup(id) end
    fixtures = {}
end

local function events_of_type(thread_id: string, event_type: string): { any }
    local d = db()
    local rows, err = d:query(
        [[SELECT external_id, external_version, body, seq
          FROM kickside_event
          WHERE thread_id = $1 AND type = $2
          ORDER BY seq]],
        { thread_id, event_type }
    )
    d:release()
    if err then error("event query failed: " .. tostring(err)) end
    for _, row in ipairs(rows or {}) do
        if type(row.body) == "string" and row.body ~= "" then
            local decoded, derr = json.decode(row.body)
            if not derr then row.body = decoded end
        end
    end
    return (rows or {}) :: { any }
end

-- Every non-delete sink write must return dest_refs keyed by map_slot ("default"
-- when the request carries none) — the sync destination map records these slots.
local function assert_dest_refs(result: any, kb_id: string, slot: string)
    test.not_nil(result.dest_refs, "sink write must return a dest_refs map")
    local row = result.dest_refs[slot]
    test.not_nil(row, "dest_refs must be keyed by map_slot " .. slot)
    test.not_nil(row.dest_ref)
    test.eq(kb_id, row.dest_ref.kb_id)
end

local function deliver(exec: any, kb_id: string, content: string, map_slot: string?, delivery_key: string?): any
    local result, err = exec:call(SINK_WRITE, {
        origin = ORIGIN,
        config = { kb_id = kb_id },
        identity_key = IDEMPOTENCY_KEY,
        idempotency_key = delivery_key or IDEMPOTENCY_KEY,
        map_slot = map_slot,
        input = { content = content, content_type = "text/plain" },
    })
    test.is_nil(err)
    test.not_nil(result)
    test.is_true(result.success, "sink write: " .. tostring(result and result.error and result.error.message))
    assert_dest_refs(result, kb_id, map_slot or "default")
    return result
end

-- Mirror the delete envelope the poller builds for a DataSourceItem.op == "delete":
-- input carries {item_key, dedup_key, metadata}, idempotency_key == dedup_key, and
-- sink_op selects the delete branch.
local function deliver_delete(exec: any, kb_id: string, key: string): any
    local metadata = { item_key = key, dedup_key = key, source_ref = { origin = { type = "poller", id = key }, external_id = key } }
    local result, err = exec:call(SINK_WRITE, {
        origin = ORIGIN,
        config = { kb_id = kb_id },
        sink_op = "delete",
        identity_key = key,
        idempotency_key = "delete:" .. key,
        input = { item_key = key, dedup_key = key, metadata = metadata },
    })
    test.is_nil(err)
    test.not_nil(result)
    test.is_true(result.success, "sink delete: " .. tostring(result and result.error and result.error.message))
    -- effect=delete MUST return result=deleted (kickside.data:writable ABI).
    test.eq("deleted", result.result)
    assert_dest_refs(result, kb_id, "default")
    return result
end

local function define_tests()
    test.describe("consolidated sink ownership references", function()
        test.after_each(cleanup_fixtures)
        test.it("keeps the caller's single map slot on writes, replays and deletes", function()
            local owner = "sink-slots-" .. uuid.v4()
            local component_id = uuid.v7()
            seed_kb(component_id, owner)
            local actor = security.new_actor(owner, { user_id = owner, email = owner,
                status = "active", security_groups = { "app.security:user" } })
            local scope = limited_scope()
            provision_primary_thread(component_id, actor, scope)
            local exec = funcs.new():with_actor(actor):with_scope(scope)
            for index, slot in ipairs({ { expected = "default" },
                { request = "   ", expected = "default" },
                { request = "  archive  ", expected = "archive" } }) do
                local identity = "slot-document-" .. tostring(index)
                local delivery = "slot-delivery-" .. tostring(index)
                for _, operation in ipairs({ "created", "noop", "deleted" }) do
                    local result, write_err = exec:call(SINK_WRITE, {
                        origin = ORIGIN, config = { kb_id = component_id },
                        identity_key = identity,
                        idempotency_key = operation == "deleted" and ("delete:" .. delivery) or delivery,
                        map_slot = slot.request,
                        sink_op = operation == "deleted" and "delete" or "upsert",
                        input = { content = "slot content" },
                    })
                    test.is_nil(write_err)
                    test.is_true(result.success)
                    test.eq(result.result, operation)
                    assert_dest_refs(result, component_id, slot.expected)
                    test.eq(result.dest_refs[slot.expected].dest_ref.external_id, identity)
                    local count = 0
                    for _ in pairs(result.dest_refs) do count = count + 1 end
                    test.eq(count, 1)
                end
            end
            cleanup(component_id)
        end)
    end)

    test.describe("kb_embed_sink access classification", function()
        test.after_each(cleanup_fixtures)
        test.it("classifies a missing destination as permanent invalid configuration", function()
            for _, config in ipairs({ {}, { kb_id = "" }, { kb_ids = {} } }) do
                local result = kb_embed_sink.write({ origin = ORIGIN, config = config,
                    input = { content = "content" } })
                test.is_false(result.success)
                test.eq(result.error.code, "invalid_config")
                test.is_false(result.error.retriable)
                test.eq(result.error.scope, "flow")
            end
        end)
        test.it("parks typed access refusals from delivery checks and embed calls", function()
            local denied = errors.new({ message = "KB WRITE revoked", kind = errors.PERMISSION_DENIED })
            for _, stage in ipairs({ "before", "embed", "embed_envelope", "after" }) do
                local checks = 0
                local result = kb_embed_sink.write({ origin = ORIGIN, config = { kb_id = "kb" }, input = { content = "content" },
                    identity_key = "document", idempotency_key = "delivery" }, {
                    component = { open = function()
                        return { embed_content = function()
                            if stage == "embed" then return nil, denied end
                            if stage == "embed_envelope" then
                                return { success = false, kind = errors.PERMISSION_DENIED, error = "KB WRITE revoked" }, nil
                            end
                            return { success = true }, nil
                        end }, nil
                    end },
                    thread_ingest = {
                        claim_delivery = function() return true, nil end,
                        check_delivery = function()
                            checks = checks + 1
                            if stage == "before" or (stage == "after" and checks == 2) then return false, denied end
                            return false, nil
                        end,
                    },
                })
                test.is_false(result.success)
                test.eq(result.error.code, "permission_denied")
                test.is_false(result.error.retriable)
            end
        end)
    end)
    test.describe("kb_embed_sink declaration", function()
        test.after_each(cleanup_fixtures)
        test.it("declares its downgraded delivery and content input", function()
            local binding, err = registry.get("kickside.knowledge.sink:kb_embed_sink")
            test.is_nil(err)
            test.not_nil(binding)
            test.eq(binding.meta.delivery, "at_least_once")
            test.eq(binding.meta.input_shape, "content")
        end)
    end)
    test.describe("kb_embed_sink writing origin", function()
        test.after_each(cleanup_fixtures)
        test.it("refuses a write that names no origin before emitting content", function()
            local owner = "sink-origin-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)
            local actor = security.new_actor(owner, { user_id = owner, email = owner,
                status = "active", security_groups = { "app.security:user" } })
            local scope = limited_scope()
            provision_primary_thread(component_id, actor, scope)
            local exec = funcs.new():with_actor(actor):with_scope(scope)

            local result, err = exec:call(SINK_WRITE, {
                config = { kb_id = component_id },
                identity_key = IDEMPOTENCY_KEY, idempotency_key = "origin-missing@1",
                input = { content = "must not append" },
            })
            test.is_nil(err)
            test.is_false(result.success)
            test.eq("invalid_request", result.error.code)
            test.is_false(result.error.retriable)
            test.eq(0, #events_of_type(component_id, CONTENT_UPSERTED))
            test.eq(0, #events_of_type(component_id, DELIVERY_CLAIMED))
            cleanup(component_id)
        end)
    end)
    test.describe("kb_embed_sink redelivery identity", function()
        test.after_each(cleanup_fixtures)
        test.it("keys both redeliveries by the idempotency_key so reconciliation collapses to one document", function()
            local owner = "sink-redeliver-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {
                user_id = owner,
                email = owner,
                status = "active",
                security_groups = { "app.security:user" },
            })
            local scope = limited_scope()
            provision_primary_thread(component_id, actor, scope)
            local exec = funcs.new():with_actor(actor):with_scope(scope)

            local stranger = security.new_actor("sink-other-" .. uuid.v4(), {
                security_groups = { "app.security:user" }, status = "active",
            })
            local denied, denied_err = funcs.new():with_actor(stranger):with_scope(scope):call(SINK_WRITE, {
                origin = ORIGIN,
                config = { kb_id = component_id }, sink_op = "upsert",
                identity_key = "forbidden", idempotency_key = "forbidden@1",
                input = { content = "must not append" },
            })
            test.is_nil(denied_err)
            test.is_false(denied.success)
            test.eq(denied.error.code, "permission_denied")
            test.eq(0, #events_of_type(component_id, CONTENT_UPSERTED))

            local denied_delete, denied_delete_err = funcs.new():with_actor(stranger):with_scope(scope):call(SINK_WRITE, {
                origin = ORIGIN,
                config = { kb_id = component_id }, sink_op = "delete",
                identity_key = IDEMPOTENCY_KEY, idempotency_key = "forbidden-delete@1",
                input = {},
            })
            test.is_nil(denied_delete_err)
            test.is_false(denied_delete.success)
            test.eq(denied_delete.error.code, "permission_denied")
            test.is_false(denied_delete.error.retriable)
            test.eq(0, #events_of_type(component_id, CONTENT_DELETED))

            deliver(exec, component_id, "v1", nil, "delivery-v1")
            deliver(exec, component_id, "v2", nil, "delivery-v2")

            local conflict, conflict_err = exec:call(SINK_WRITE, {
                origin = ORIGIN,
                config = { kb_id = component_id }, identity_key = IDEMPOTENCY_KEY,
                idempotency_key = "delivery-v2", input = { content = "changed under delivery-v2" },
            })
            test.is_nil(conflict_err)
            test.is_false(conflict.success)
            test.eq("idempotency_conflict", conflict.error.code)

            local moved, moved_err = exec:call(SINK_WRITE, {
                origin = ORIGIN,
                config = { kb_id = component_id }, identity_key = "another-document",
                idempotency_key = "delivery-v2", input = { content = "v2" },
            })
            test.is_nil(moved_err)
            test.is_false(moved.success)
            test.eq("idempotency_conflict", moved.error.code)

            local repeated = deliver(exec, component_id, "v2", nil, "delivery-v2")
            test.eq("noop", repeated.result)
            test.eq(2, #events_of_type(component_id, DELIVERY_CLAIMED), "a repeated key must keep its original claim")

            local events = events_of_type(component_id, CONTENT_UPSERTED)
            test.eq(2, #events, "both redeliveries emit a content.upserted event")

            -- Both events carry the stable, source-provided external id -- never a
            -- random content:<uuid> -- so the source projection reconciles them to a
            -- single document keyed by external_id.
            for _, event in ipairs(events) do
                test.eq(IDEMPOTENCY_KEY, event.external_id)
                test.eq(IDEMPOTENCY_KEY, event.body.source_ref.external_id)
                test.eq("test.kb.embed", event.body.source_ref.origin.type)
                test.eq(IDEMPOTENCY_KEY, event.body.source_ref.origin.id)
                test.is_nil(event.body.source_ref.id)
            end

            -- Changed content still shares one external id; only the version differs,
            -- which is exactly what an upsert reconcile keys off of.
            test.eq("v1", events[1].body.content)
            test.eq("v2", events[2].body.content)
            test.ok(events[1].external_version ~= events[2].external_version,
                "changed content must yield distinct external_version under one external_id")


            cleanup(component_id)
        end)
    end)

    test.describe("kb_embed_sink delete operation", function()
        test.after_each(cleanup_fixtures)
        test.it("rejects a delete delivery key reused for another document or operation", function()
            local owner = "sink-delete-conflict-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)
            local actor = security.new_actor(owner, { user_id = owner, email = owner,
                status = "active", security_groups = { "app.security:user" } })
            local scope = limited_scope()
            provision_primary_thread(component_id, actor, scope)
            local exec = funcs.new():with_actor(actor):with_scope(scope)
            local first, first_err = exec:call(SINK_WRITE, { origin = ORIGIN, config = { kb_id = component_id },
                sink_op = "delete", identity_key = "first-doc", idempotency_key = "shared-delete@1", input = {} })
            test.is_nil(first_err)
            test.is_true(first.success)
            local moved, moved_err = exec:call(SINK_WRITE, { origin = ORIGIN, config = { kb_id = component_id },
                sink_op = "delete", identity_key = "second-doc", idempotency_key = "shared-delete@1", input = {} })
            test.is_nil(moved_err)
            test.is_false(moved.success)
            test.eq(moved.error.code, "idempotency_conflict")
            local changed, changed_err = exec:call(SINK_WRITE, { origin = ORIGIN, config = { kb_id = component_id },
                sink_op = "upsert", identity_key = "first-doc", idempotency_key = "shared-delete@1",
                input = { content = "different operation" } })
            test.is_nil(changed_err)
            test.is_false(changed.success)
            test.eq(changed.error.code, "idempotency_conflict")
            test.eq(1, #events_of_type(component_id, CONTENT_DELETED))
            cleanup(component_id)
        end)
        -- Upsert then delete through the sink: the delete branch resolves the document
        -- external_id from the idempotency_key and emits content.deleted on the same
        -- knowledge ingest thread. The projection worker (not driven here) reconciles
        -- that event into the document reap by external_id -- the subtree cleanup
        -- (chunks + embeddings) is covered by kb10's kb10_test / source_worker_test
        -- delete_documents_by_external_id fixtures. This asserts at the event boundary.
        test.it("emits a content.deleted keyed by the idempotency_key so the document is reaped", function()
            local owner = "sink-delete-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {
                user_id = owner,
                email = owner,
                status = "active",
                security_groups = { "app.security:user" },
            })
            local scope = limited_scope()
            provision_primary_thread(component_id, actor, scope)
            local exec = funcs.new():with_actor(actor):with_scope(scope)

            deliver(exec, component_id, "v1")
            test.eq(1, #events_of_type(component_id, CONTENT_UPSERTED), "upsert emits content.upserted")

            deliver_delete(exec, component_id, IDEMPOTENCY_KEY)

            local deletes = events_of_type(component_id, CONTENT_DELETED)
            test.eq(1, #deletes, "delete emits exactly one content.deleted event")
            -- The delete carries the same external identity as the upsert, so it
            -- reconciles to the document that redelivery keyed by idempotency_key.
            test.eq(IDEMPOTENCY_KEY, deletes[1].external_id)
            test.eq(IDEMPOTENCY_KEY, deletes[1].body.source_ref.external_id)
            test.eq("poller", deletes[1].body.source_ref.origin.type)
            test.eq(IDEMPOTENCY_KEY, deletes[1].body.source_ref.origin.id)
            test.is_nil(deletes[1].body.source_ref.id)

            cleanup(component_id)
        end)

        -- A delete for a key with no matching document is a clean queued no-op: the
        -- content.deleted event is emitted and the downstream reap finds nothing to
        -- remove, so the sink still returns the normative result=deleted.
        test.it("returns result=deleted for a key with no existing document", function()
            local owner = "sink-delete-missing-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {
                user_id = owner,
                email = owner,
                status = "active",
                security_groups = { "app.security:user" },
            })
            local scope = limited_scope()
            provision_primary_thread(component_id, actor, scope)
            local exec = funcs.new():with_actor(actor):with_scope(scope)

            test.eq(0, #events_of_type(component_id, CONTENT_UPSERTED), "no document was embedded")
            deliver_delete(exec, component_id, "fireflies:transcript:absent")

            local deletes = events_of_type(component_id, CONTENT_DELETED)
            test.eq(1, #deletes, "delete of an absent key still queues one content.deleted event")
            test.eq("fireflies:transcript:absent", deletes[1].external_id)

            cleanup(component_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
