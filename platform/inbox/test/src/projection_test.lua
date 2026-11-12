-- Canonical projection-worker contract for the inbox. The worker folds
-- item.created/resolved/deleted thread events into body.items (keyed by item id,
-- the read model materialized in kickside_projection) and returns { body, last_seq }.
-- Invoked exactly as the engine invokes it: funcs.call on the registered func://
-- worker with the standard input envelope.
--
-- Invariants under test: greenfield create/resolve/delete; malformed item events fail; resolve before create is a no-op; the resolve status guard makes a
-- second resolve a no-op (idempotency); trace context is retained for HIL waits;
-- unknown types are ignored; an empty batch advances last_seq; a missing body seeds
-- items; body.meta survives the fold.

local test = require("test")
local funcs = require("funcs")
local json = require("json")
local inbox_types = require("inbox_types")

local WORKER = "kickside.inbox.persist:projection_worker"
local EV = {
    CREATED = "kickside.inbox.events:item.created",
    RESOLVED = "kickside.inbox.events:item.resolved",
    DELETED = "kickside.inbox.events:item.deleted",
}

local function ev(etype: string, body: any, extra: any?): any
    local out = { type = etype, body = body }
    if type(extra) == "table" then
        for k, v in pairs(extra) do (out :: any)[k] = v end
    end
    return out
end

local function fold(prior: any, events: any, to_seq: any): any
    local out, err = funcs.call(WORKER, { projection = { body = prior }, events = events, range = { to_seq = to_seq } })
    if err then error(tostring(err)) end
    return out
end

local function fold_with_component(prior: any, events: any, to_seq: any, component: any): any
    local out, err = funcs.call(WORKER, {
        thread_id = "inbox-component-1",
        projection = { body = prior },
        events = events,
        range = { to_seq = to_seq },
        component = component,
    })
    if err then error(tostring(err)) end
    return out
end

local function define_tests()
    test.describe("Inbox Projection Worker", function()
        test.it("retains generic file references through creation and replacement versions", function()
            local files = { { component_id = "example:content", context = { file_id = "document" }, title = "Review document" } }
            local first = fold({}, { ev(EV.CREATED, { id = "file-item", item_type = "notice", title = "Review", files = files }) }, 1)
            test.not_nil(first.body.items["file-item"].files)
            test.eq(first.body.items["file-item"].files[1].context.file_id, "document")
            local next_files = { { component_id = "example:content", context = { file_id = "replacement" } } }
            local next = fold(first.body, { ev("kickside.inbox.events:item.version", { id = "file-item", files = next_files }) }, 2)
            test.eq(next.body.items["file-item"].files[1].context.file_id, "replacement")
            local unchanged = fold(next.body, { ev("kickside.inbox.events:item.version", { id = "file-item" }) }, 3)
            test.eq(unchanged.body.items["file-item"].files[1].context.file_id, "replacement")
            local cleared = fold(unchanged.body, { ev("kickside.inbox.events:item.version", { id = "file-item", files = {} }) }, 4)
            test.eq(#cleared.body.items["file-item"].files, 0)
        end)
        test.it("keeps the post-commit metadata failure typed", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "metadata owner unavailable" })
            local result, err = funcs.call("kickside.inbox.persist:projection_committed", {
                thread_id = "inbox-progress", range = { to_seq = 1 }, projection = { body = { counts = { item_count = 0, pending_count = 0, resolved_count = 0 } } },
                component = { set_meta = function() return false, failure end },
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)
        test.it("folds item.created into body.items keyed by id", function()
            local out = fold({}, { ev(EV.CREATED, { id = "i1", item_type = "approval", title = "T", content = "C" }) }, 1)
            test.not_nil((out :: any).body.items.i1)
            test.eq((out :: any).body.items.i1.title, "T")
            test.eq((out :: any).body.items.i1.status, inbox_types.STATUS.PENDING)
            test.eq((out :: any).body.counts.item_count, 1)
            test.eq((out :: any).body.counts.pending_count, 1)
            test.eq((out :: any).last_seq, 1)
        end)

        test.it("folds public counts without notifying before persistence", function()
            local writes = 0
            local out = fold_with_component({}, {
                ev(EV.CREATED, { id = "i1", priority = inbox_types.PRIORITY.URGENT }),
                ev(EV.CREATED, { id = "i2", priority = inbox_types.PRIORITY.HIGH }),
                ev(EV.RESOLVED, { id = "i2", status = inbox_types.STATUS.APPROVED }),
            }, 3, { set_meta = function(_id: string, _meta: any)
                writes = writes + 1
                return true
            end })
            test.eq(writes, 0)
            test.eq(out.body.counts.item_count, 2)
            test.eq(out.body.counts.pending_count, 1)
            test.eq(out.body.counts.resolved_count, 1)
            test.eq(out.body.counts.urgent_count, 1)
            test.eq(out.body.counts.high_count, 1)
        end)

        test.it("encodes empty metadata and resolved form as objects in the projection", function()
            local created = fold({}, { ev(EV.CREATED, { id = "plain", item_type = "notice" }) }, 1)
            local out = fold(created.body, { ev(EV.RESOLVED, {
                id = "plain", status = inbox_types.STATUS.DISMISSED, form = {},
            }) }, 2)
            test.eq(json.encode(out.body.items.plain.metadata), "{}")
            test.eq(json.encode(out.body.items.plain.form), "{}")
            local encoded, encode_err = json.encode(out.body)
            test.is_nil(encode_err)
            local stored, decode_err = json.decode(encoded :: string)
            test.is_nil(decode_err)
            out = fold(stored, { ev(EV.CREATED, { id = "next", item_type = "notice" }) }, 3)
            test.eq(json.encode(out.body.items.plain.metadata), "{}")
            test.eq(json.encode(out.body.items.plain.form), "{}")
        end)

        test.it("publishes flat component counts through the post-commit declaration", function()
            local out = fold({}, { ev(EV.CREATED, { id = "i1", priority = inbox_types.PRIORITY.HIGH }) }, 1)
            local writes = {}
            local result, err = funcs.call("kickside.inbox.persist:projection_committed", {
                thread_id = "inbox-component-1", projection = { body = out.body },
                component = { set_meta = function(id: string, meta: any)
                    writes[#writes + 1] = { id = id, meta = meta }
                    return true
                end },
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#writes, 1)
            test.eq(writes[1].id, "inbox-component-1")
            test.eq(writes[1].meta.status, "pending")
            test.eq(writes[1].meta.pending_count, 1)
            test.eq(writes[1].meta.item_count, 1)
            test.eq(writes[1].meta.resolved_count, 0)
            test.eq(writes[1].meta.high_count, 1)
            test.eq(writes[1].meta.urgent_count, 0)
        end)

        test.it("publishes committed progress when a content version leaves counts unchanged", function()
            local observed = {}
            for _, seq in ipairs({ 2, 3 }) do
                local result, err = funcs.call("kickside.inbox.persist:projection_committed", {
                    thread_id = "inbox-progress", range = { to_seq = seq },
                    projection = { body = { counts = { item_count = 1, pending_count = 0, resolved_count = 1 } } },
                    component = { set_meta = function(_id, meta)
                        observed[#observed + 1] = meta
                        return true, nil
                    end },
                })
                test.is_nil(err)
                test.not_nil(result)
            end
            test.eq(observed[1].last_event_seq, 2)
            test.eq(observed[2].last_event_seq, 3)
            test.eq(observed[1].item_count, observed[2].item_count)
        end)

        test.it("item.resolved flips a pending item's status and resolved_at", function()
            local created = (fold({}, { ev(EV.CREATED, { id = "i1", item_type = "approval" }) }, 1) :: any).body
            local out = fold(created, { ev(EV.RESOLVED, { id = "i1", status = inbox_types.STATUS.APPROVED, resolved_at = "2026-01-01" }) }, 2)
            test.eq((out :: any).body.items.i1.status, inbox_types.STATUS.APPROVED)
            test.eq((out :: any).body.items.i1.resolved_at, "2026-01-01")
            test.eq((out :: any).body.counts.pending_count, 0)
            test.eq((out :: any).body.counts.resolved_count, 1)
        end)

        test.it("item.resolved records the explicit action and resolving actor", function()
            local created = (fold({}, { ev(EV.CREATED, { id = "i1", item_type = "approval" }) }, 1) :: any).body
            local out = fold(created, {
                ev(EV.RESOLVED, {
                    id = "i1",
                    status = inbox_types.STATUS.APPROVED,
                    action = "approve",
                    resolution_id = "resolve:i1",
                    resolved_by = "reviewer-1",
                    resolved_at = "2026-01-01",
                }),
            }, 2)
            test.eq((out :: any).body.items.i1.action, "approve")
            test.eq((out :: any).body.items.i1.resolution_id, "resolve:i1")
            test.eq((out :: any).body.items.i1.resolved_by, "reviewer-1")
        end)

        test.it("retains submitted form values through resolution and later folds", function()
            local created = fold({}, { ev(EV.CREATED, { id = "decision", item_type = "flow_decision" }) }, 1)
            local out = fold(created.body, { ev(EV.RESOLVED, {
                id = "decision", status = inbox_types.STATUS.REJECTED, action = "reject",
                form = { reason = "", count = 0, confirmed = false, note = "Cannot approve" },
            }) }, 2)
            test.not_nil(out.body.items.decision.form)
            test.eq(out.body.items.decision.form.reason, "")
            test.eq(out.body.items.decision.form.count, 0)
            test.eq(out.body.items.decision.form.confirmed, false)
            out = fold(out.body, {}, 3)
            test.eq(out.body.items.decision.action, "reject")
            test.eq(out.body.items.decision.form.note, "Cannot approve")
        end)

        test.it("leaves action absent when an event does not declare one", function()
            local created = (fold({}, { ev(EV.CREATED, { id = "i1", item_type = "approval" }) }, 1) :: any).body
            local out = fold(created, {
                ev(EV.RESOLVED, { id = "i1", status = inbox_types.STATUS.APPROVED, resolved_by = "reviewer-1" }),
            }, 2)
            test.is_nil((out :: any).body.items.i1.action)
            test.eq((out :: any).body.items.i1.resolved_by, "reviewer-1")
        end)

        test.it("retains trace context and event ids for human-in-the-loop waits", function()
            local trace_context = { trace_id = "trace-1", run_id = "run-1", correlation_key = "case:42" }
            local created = (fold({}, {
                ev(EV.CREATED, { id = "i1", item_type = "approval" }, { id = "ev-created", trace_context = trace_context }),
            }, 1) :: any).body
            test.eq((created :: any).items.i1.created_event_id, "ev-created")
            test.eq((created :: any).items.i1.trace_context.run_id, "run-1")
            test.eq((created :: any).items.i1.trace_context.correlation_key, "case:42")

            local out = fold(created, {
                ev(EV.RESOLVED, { id = "i1", status = inbox_types.STATUS.APPROVED }, { id = "ev-resolved" }),
            }, 2)
            test.eq((out :: any).body.items.i1.resolved_event_id, "ev-resolved")
        end)

        test.it("ignores trace_context embedded in the event body", function()
            local out = fold({}, {
                ev(EV.CREATED, {
                    id = "i1",
                    item_type = "approval",
                    trace_context = { trace_id = "body-trace", run_id = "body-run" },
                }, { id = "ev-created" }),
            }, 1)
            test.is_nil((out :: any).body.items.i1.trace_context)
        end)

        test.it("folds a content version while the original review decision stands", function()
            local created = fold({}, { ev(EV.CREATED, {
                id = "reviewed", title = "Original", content = "Original body", created_at = 100,
            }, { id = "genesis" }) }, 1)
            local resolved = fold(created.body, { ev(EV.RESOLVED, {
                id = "reviewed", status = inbox_types.STATUS.REJECTED, action = "reject",
                resolved_at = 200, resolved_by = "reviewer", resolution_id = "resolve:reviewed",
                form = { confirmed = false },
            }, { id = "decision" }) }, 2)
            local out = fold(resolved.body, { ev("kickside.inbox.events:item.version", {
                id = "reviewed", title = "Updated", content = "Updated body", metadata = { source = "new" },
            }, { id = "version" }) }, 3)
            local item = out.body.items.reviewed
            test.eq(item.content, "Updated body")
            test.eq(item.title, "Updated")
            test.eq(item.metadata.source, "new")
            test.eq(item.status, inbox_types.STATUS.REJECTED)
            test.eq(item.action, "reject")
            test.eq(item.resolved_at, 200)
            test.eq(item.resolved_by, "reviewer")
            test.eq(item.resolution_id, "resolve:reviewed")
            test.eq(item.resolved_event_id, "decision")
            test.eq(item.form.confirmed, false)
            test.eq(item.created_event_id, "genesis")
            test.eq(item.created_at, 100)
            test.eq(out.body.counts.pending_count, 0)
            test.eq(out.body.counts.resolved_count, 1)
        end)

        test.it("a later version does not restore a deleted item", function()
            local created = fold({}, { ev(EV.CREATED, { id = "removed", content = "Original" }) }, 1)
            local removed = fold(created.body, { ev(EV.DELETED, { id = "removed" }) }, 2)
            local out = fold(removed.body, { ev("kickside.inbox.events:item.version", {
                id = "removed", content = "Late delivery",
            }) }, 3)
            test.is_nil(out.body.items.removed)
            test.eq(out.body.counts.item_count, 0)
        end)

        test.it("item.deleted removes the item", function()
            local created = (fold({}, { ev(EV.CREATED, { id = "i1" }) }, 1) :: any).body
            local out = fold(created, { ev(EV.DELETED, { id = "i1" }) }, 2)
            test.is_nil((out :: any).body.items.i1)
            test.eq((out :: any).body.counts.item_count, 0)
        end)

        test.it("reports a malformed stored event body instead of advancing over it", function()
            local result, err = funcs.call(WORKER, {
                projection = { body = {} }, events = { ev(EV.CREATED, "{broken") }, range = { to_seq = 1 },
            })
            test.is_nil(result)
            local _, decode_err = json.decode("{broken")
            test.eq(tostring(err), tostring(decode_err))
        end)

        test.it("rejects malformed item events without advancing the projection", function()
            for _, etype in ipairs({ EV.CREATED, EV.RESOLVED, EV.DELETED, "kickside.inbox.events:item.version" }) do
                for _, body in ipairs({ false, 1, { title = "missing id" }, { id = "" }, { id = 5 } }) do
                    local result, err = funcs.call(WORKER, { projection = { body = {} },
                        events = { ev(etype, body) }, range = { to_seq = 1 } })
                    test.is_nil(result)
                    test.not_nil(err)
                    test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                end
            end
        end)

        test.it("resolve for an unknown item is a no-op", function()
            local out = fold({}, { ev(EV.RESOLVED, { id = "ghost", status = inbox_types.STATUS.APPROVED }) }, 1)
            test.is_nil((out :: any).body.items.ghost)
        end)

        test.it("re-resolving an already-resolved item is a no-op (status guard)", function()
            local b = (fold({}, { ev(EV.CREATED, { id = "i1" }) }, 1) :: any).body
            b = (fold(b, { ev(EV.RESOLVED, { id = "i1", status = inbox_types.STATUS.APPROVED, resolved_at = "t1" }) }, 2) :: any).body
            local out = fold(b, { ev(EV.RESOLVED, { id = "i1", status = inbox_types.STATUS.APPROVED, resolved_at = "t2" }) }, 3)
            test.eq((out :: any).body.items.i1.resolved_at, "t1")
        end)

        test.it("ignores an unknown event type but still advances last_seq", function()
            local out = fold({}, { ev("kickside.inbox.events:bogus", { id = "i1" }) }, 3)
            test.is_nil(next((out :: any).body.items))
            test.eq((out :: any).last_seq, 3)
        end)

        test.it("an empty batch preserves items and advances last_seq", function()
            local created = (fold({}, { ev(EV.CREATED, { id = "i1" }) }, 1) :: any).body
            local out = fold(created, {}, 9)
            test.not_nil((out :: any).body.items.i1)
            test.eq((out :: any).last_seq, 9)
        end)

        test.it("seeds items from a missing body without crashing", function()
            local out = funcs.call(WORKER, { events = {}, range = {} })
            test.eq(type((out :: any).body.items), "table")
            test.is_nil((out :: any).last_seq)
        end)

        test.it("preserves body.meta across a fold", function()
            local seeded = { meta = { worker_input_mode = "prefetch_events" }, items = {} }
            local out = fold(seeded, { ev(EV.CREATED, { id = "i1" }) }, 1)
            test.eq((out :: any).body.meta.worker_input_mode, "prefetch_events")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
