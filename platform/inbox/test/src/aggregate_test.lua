-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local channel = require("channel")
local uuid = require("uuid")
local identity = require("test_identity")

local WRITE = "kickside.inbox.sink:inbox_write"

local function frame(id: string): (any, any, any)
    identity.ensure_user(id)
    local policy, err = security.policy("app:user")
    test.is_nil(err)
    local actor = security.new_actor(id, { security_groups = { "app:user" } })
    local scope = security.new_scope({ policy })
    local definition, get_err = contract.get("kickside.component:component_service")
    test.is_nil(get_err)
    local service, open_err = definition:with_actor(actor):with_scope(scope):open()
    test.is_nil(open_err)
    local writable, writable_err = contract.get("kickside.data:writable")
    test.is_nil(writable_err)
    local sink, sink_err = writable:with_actor(actor):with_scope(scope):open("kickside.inbox.sink:inbox_sink")
    test.is_nil(sink_err)
    return funcs.new():with_actor(actor):with_scope(scope), service, sink
end

local function source(service: any): string
    local result, err = service:register({ impl_id = "kickside.core:thread" })
    test.is_nil(err)
    test.is_true(result.success)
    return result.component_id
end

local function write(caller: any, source_id: string, key: string, body: string?, op: string?, delivery: string?): any
    local result, err = caller:call(WRITE, {
        origin = "aggregate-test", sink_op = "upsert",
        idempotency_key = delivery,
        input = { source_id = source_id, aggregate_key = key, content = body,
            status = op == "resolve" and "resolved" or nil,
            metadata = { count = body == "Three" and 3 or 1, link = "/review" } },
    })
    test.is_nil(err)
    test.is_true(result.success, tostring(result.error and result.error.message))
    return result
end

local function item(caller: any, id: string): any
    local _, catchup_err = caller:call("app:inbox_catchup_probe", {})
    test.is_nil(catchup_err)
    local result, err = caller:call("app:inbox_read_probe", { id = id })
    test.is_nil(err)
    return result
end

return { run = test.run_cases(function()
    test.describe("Inbox aggregate lifecycle", function()
        test.it("creates, updates, resolves and reopens one source-key item", function()
            local caller, service = frame("aggregate-lifecycle-" .. uuid.v4())
            local sid = source(service)
            local first = write(caller, sid, "review", "One", nil, "aggregate-first")
            local id = first.dest_ref.item_id
            test.eq(first.result, "created")
            local original = item(caller, id)
            test.not_nil(original)
            test.eq(original.status, "pending")
            local updated = write(caller, sid, "review", "Three", nil, "aggregate-update")
            test.eq(updated.dest_ref.item_id, id)
            test.eq(updated.result, "updated")
            local current = item(caller, id)
            test.eq(current.content, "Three")
            test.eq(current.metadata.count, 3)
            test.eq(current.metadata.link, "/review")
            test.eq(current.created_event_id, original.created_event_id)
            test.eq(write(caller, sid, "review", "Three", nil, "aggregate-update").result, "updated")
            local resolved = write(caller, sid, "review", nil, "resolve", "aggregate-resolve")
            test.eq(resolved.result, "updated")
            test.eq(item(caller, id).status, "resolved")
            test.eq(write(caller, sid, "review", "One").dest_ref.item_id, id)
            current = item(caller, id)
            test.eq(current.status, "pending")
            test.is_nil(current.resolved_at)
            test.is_nil(current.action)
            test.eq(current.content, "One")
            write(caller, sid, "review", nil, "resolve", "aggregate-resolve")
            test.eq(item(caller, id).status, "pending")
            test.eq(write(caller, sid, "other", "One").dest_ref.item_id == id, false)
            test.eq(write(caller, source(service), "review", "One").dest_ref.item_id == id, false)
        end)

        test.it("exposes aggregate configuration through the writable contract", function()
            local caller, service, sink = frame("aggregate-contract-" .. uuid.v4())
            local sid = source(service)
            local request = { config = { source_id = sid, aggregate_key = "review" },
                sink_op = "upsert", origin = "aggregate-test", idempotency_key = "contract-first",
                input = { content = "One" } }
            local created, create_err = sink:write(request)
            test.is_nil(create_err)
            test.is_true(created.success)
            local id = created.dest_ref.item_id
            test.eq(item(caller, id).status, "pending")
            request.idempotency_key = "contract-resolve"
            request.input = { status = "resolved" }
            local resolved, resolve_err = sink:write(request)
            test.is_nil(resolve_err)
            test.is_true(resolved.success)
            test.eq(resolved.result, "updated")
            test.eq(resolved.dest_ref.item_id, id)
            test.eq(item(caller, id).status, "resolved")
            request.input = { content = "Changed" }
            local conflict, conflict_err = sink:write(request)
            test.is_nil(conflict_err)
            test.is_false(conflict.success)
            test.eq(conflict.error.code, "idempotency_conflict")
        end)

        test.it("resolving absent work stays absent and cannot close a later creation on replay", function()
            local caller, service = frame("aggregate-absent-" .. uuid.v4())
            local sid = source(service)
            local resolved = write(caller, sid, "review", nil, "resolve", "absent-resolve")
            test.is_nil(item(caller, resolved.dest_ref.item_id))
            local created = write(caller, sid, "review", "One")
            write(caller, sid, "review", nil, "resolve", "absent-resolve")
            test.eq(item(caller, created.dest_ref.item_id).status, "pending")
        end)

        test.it("keeps legacy source status and empty optional aggregate config inert", function()
            local caller = frame("aggregate-legacy-" .. uuid.v4())
            local result, err = caller:call(WRITE, { origin = "aggregate-test", identity_key = "legacy",
                config = { aggregate_key = "" }, idempotency_key = "legacy-first",
                input = { content = "One", status = "complete" } })
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(result.dest_ref.item_id, "legacy")
            test.eq(item(caller, "legacy").status, "pending")
        end)

        test.it("allows a human action again after the aggregate reopens", function()
            local caller, service = frame("aggregate-actions-" .. uuid.v4())
            local sid = source(service)
            local id = write(caller, sid, "review", "One").dest_ref.item_id
            item(caller, id)
            local first, err = caller:call("app:inbox_delivery_probe", { operation = "resolve", id = id })
            test.is_nil(err)
            test.eq(first.status, "dismissed")
            write(caller, sid, "review", "Three")
            test.eq(item(caller, id).status, "pending")
            local second, second_err = caller:call("app:inbox_delivery_probe", { operation = "resolve", id = id })
            test.is_nil(second_err)
            test.eq(second.status, "dismissed")
            test.is_false(first.resolution_id == second.resolution_id)
        end)

        test.it("keeps refreshed work pending when an older human decision arrives late", function()
            local result, err = funcs.call("kickside.inbox.persist:projection_worker", {
                projection = { body = {} }, range = { to_seq = 3 }, events = {
                    { id = "created", type = "kickside.inbox.events:item.created", body = {
                        id = "item", item_type = "notice", title = "One", source_id = "source", aggregate_key = "review" } },
                    { id = "refreshed", type = "kickside.inbox.events:item.version", body = {
                        id = "item", title = "Three", source_id = "source", aggregate_key = "review", status = "pending" } },
                    { id = "late", type = "kickside.inbox.events:item.resolved", body = {
                        id = "item", status = "dismissed", resolution_id = "resolve:item:created" } },
                },
            })
            test.is_nil(err)
            test.eq(result.body.items.item.status, "pending")
            local decided, decision_err = funcs.call("kickside.inbox.persist:projection_worker", {
                projection = { body = result.body }, range = { to_seq = 4 }, events = {
                    { id = "current", type = "kickside.inbox.events:item.resolved", body = {
                        id = "item", status = "dismissed", resolution_id = "resolve:item:refreshed" } },
                },
            })
            test.is_nil(decision_err)
            test.eq(decided.body.items.item.status, "dismissed")
        end)

        test.it("racing updates share one item and retain both durable deliveries", function()
            local caller, service = frame("aggregate-race-" .. uuid.v4())
            local sid = source(service)
            local ready, start, done = channel.new(2), channel.new(2), channel.new(2)
            for n = 1, 2 do
                coroutine.spawn(function()
                    ready:send(true)
                    start:receive()
                    local result, err = caller:call(WRITE, { origin = "aggregate-test",
                        idempotency_key = "aggregate-race-" .. tostring(n),
                        input = { source_id = sid, aggregate_key = "review", content = tostring(n) } })
                    done:send({ result = result, err = err })
                end)
            end
            ready:receive(); ready:receive()
            start:send(true); start:send(true)
            local first, second = done:receive(), done:receive()
            test.is_nil(first.err); test.is_nil(second.err)
            test.is_true(first.result.success, tostring(first.result.error and first.result.error.message))
            test.is_true(second.result.success, tostring(second.result.error and second.result.error.message))
            test.eq(first.result.dest_ref.item_id, second.result.dest_ref.item_id)
            local current = item(caller, first.result.dest_ref.item_id)
            test.is_true(current.content == "1" or current.content == "2")
            local listing, list_err = caller:call("app:inbox_read_probe", { list = true })
            test.is_nil(list_err)
            test.eq(#listing.items, 1)
            test.eq(listing.counts.pending_count, 1)
            for n = 1, 2 do
                local replay, replay_err = caller:call(WRITE, { origin = "aggregate-test",
                    idempotency_key = "aggregate-race-" .. tostring(n),
                    input = { source_id = sid, aggregate_key = "review", content = tostring(n) } })
                test.is_nil(replay_err)
                test.is_true(replay.success)
            end
            test.eq(item(caller, current.id).content, current.content)
        end)

        test.it("requires live source authority for writes and reads", function()
            local owner_id, recipient_id = "aggregate-owner-" .. uuid.v4(), "aggregate-reader-" .. uuid.v4()
            local owner, service = frame(owner_id)
            local recipient = frame(recipient_id)
            local sid = source(service)
            local grant, err = service:grant_subtree({ root_component_id = sid,
                subject = { subject_id = recipient_id, subject_type = "user" }, access_mask = 1 })
            test.is_nil(err); test.is_true(grant.success)
            local id = write(recipient, sid, "review", "One").dest_ref.item_id
            test.not_nil(item(recipient, id))
            local other_id = write(owner, sid, "review", "Three").dest_ref.item_id
            test.not_nil(item(owner, other_id))
            test.is_nil(item(owner, id))
            local revoked, revoke_err = service:revoke_subtree({ root_component_id = sid,
                subject = { subject_id = recipient_id, subject_type = "user" } })
            test.is_nil(revoke_err); test.is_true(revoked.success)
            test.is_nil(item(recipient, id))
            local listing, list_err = recipient:call("app:inbox_read_probe", { list = true })
            test.is_nil(list_err)
            test.eq(#listing.items, 0)
            test.eq(listing.counts.pending_count, 0)
            for _, op in ipairs({ "upsert", "resolve" }) do
                local denied, denied_err = recipient:call(WRITE, { origin = "aggregate-test", sink_op = "upsert",
                    input = { source_id = sid, aggregate_key = "review", content = "Private",
                        status = op == "resolve" and "resolved" or "pending" } })
                test.is_nil(denied_err)
                test.is_false(denied.success)
                test.eq(denied.error.code, "permission_denied")
            end
        end)
    end)
end) }
