-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local json = require("json")
local sql = require("sql")
local identity = require("test_identity")
local component = require("component")
local user_groups = require("user_groups")
local addressed = require("addressed")
local jobs = require("jobs")
local time = require("time")
local channel = require("channel")
local prune = require("retention_prune")

local function frame(id: string, denied: boolean?, groups: { string }?, extra_policy: string?, deny_assignment: boolean?): (any, any)
    identity.ensure_user(id)
    local policies = { assert(security.policy("app:addressed_runtime")) }
    if extra_policy then policies[#policies + 1] = assert(security.policy(extra_policy)) end
    if deny_assignment then policies[#policies + 1] = assert(security.policy("app:addressed_no_assignment")) end
    if not denied then policies[#policies + 1] = assert(security.policy("app:addressed_send")) end
    local actor = assert(security.new_actor(id, { security_groups = groups or { "app:user" } }))
    local scope = assert(security.new_scope(policies))
    local service = assert(assert(contract.get("kickside.component:component_service")):with_actor(actor):with_scope(scope):open())
    return funcs.new():with_actor(actor):with_scope(scope), service
end

local function source(service: any): string
    local result, err = service:register({ impl_id = "kickside.core:thread" })
    test.is_nil(err, "source: " .. tostring(err))
    test.is_true(result.success)
    return result.component_id :: string
end

local function catchup(caller: any): ()
    local _, err = caller:call("app:inbox_catchup_probe", {})
    test.is_nil(err, "catchup: " .. tostring(err))
end

local function read(caller: any, id: string): any
    catchup(caller)
    local item, err = caller:call("app:inbox_read_probe", { id = id })
    test.is_nil(err, "read: " .. tostring(err))
    return item
end

local function upsert(caller: any, params: any): any
    local result, err = caller:call("app:addressed_probe", { params = params })
    test.is_nil(err, "upsert: " .. tostring(err))
    test.not_nil(result)
    return result
end

-- Age only the test fixture's existing projection body, then let Core run and
-- persist the next real event fold. Production never writes projection storage.
local function materialized(thread_id: string, body: any?): any
    local db = assert(sql.get("app:db"))
    if body then
        local _, err = sql.builder.update("kickside_projection"):set("body", assert(json.encode(body)))
            :where(sql.builder.eq({ thread_id = thread_id, kind = "kickside.inbox:items" })):run_with(db):exec()
        db:release()
        test.is_nil(err, tostring(err))
        return body
    end
    local rows, err = sql.builder.select("body"):from("kickside_projection")
        :where(sql.builder.eq({ thread_id = thread_id, kind = "kickside.inbox:items" })):run_with(db):query()
    db:release()
    test.is_nil(err, tostring(err))
    test.eq(#rows, 1)
    return assert(json.decode(rows[1].body :: string))
end

local function notifications(user_id: string): { any }
    local db = assert(sql.get("app:db"))
    assert(db:execute("CREATE TABLE IF NOT EXISTS inbox_notifications (request TEXT NOT NULL, authorized TEXT NOT NULL)"))
    local rows = assert(db:query("SELECT request, authorized FROM inbox_notifications"))
    db:release()
    local found = {}
    for _, row in ipairs(rows) do
        local request = assert(json.decode(row.request))
        if request.user_id == user_id and request.topic == "inbox.changed" then
            test.eq(row.authorized, "yes")
            test.eq(request.topic, "inbox.changed")
            test.is_true(request.data == nil or next(request.data) == nil, "invalidation must carry no item content or identifiers")
            for key in pairs(request) do
                test.is_true(key == "user_id" or key == "topic" or key == "data", "unexpected invalidation field " .. key)
            end
            found[#found + 1] = request
        end
    end
    return found
end

local function await_notifications(id: string, count: integer): { any }
    local found = {}
    for _ = 1, 100 do
        found = notifications(id)
        if #found >= count then break end
        time.sleep("50ms")
    end
    return found
end

local target = test.run_cases(function()
    test.describe("Inbox committed notification target", function()
        test.it("uses the committed item recipient before an event argument", function()
            local owner_id, other_id = "target-owner-" .. uuid.v4(), "target-other-" .. uuid.v4()
            local owner = frame(owner_id)
            frame(other_id)
            local item = upsert(owner, { id = uuid.v4(), item_type = "addressed_review", title = "Review",
                recipient = { kind = "user", id = owner_id } })
            test.not_nil(read(owner, item.id))
            test.eq(#await_notifications(owner_id, 1), 1)
            local thread_id = addressed.component_id({ kind = "user", id = owner_id })
            local result, err = owner:call("kickside.inbox.persist:projection_committed", {
                thread_id = thread_id, range = { to_seq = 1 }, projection = { body = materialized(thread_id) },
                events = { { body = { id = item.id, recipient = { kind = "user", id = other_id } } } },
            })
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(#await_notifications(owner_id, 2), 2)
            test.eq(#notifications(other_id), 0)
        end)
        test.it("ignores forged and stale Jobs notification references", function()
            local owner_id, other_id = "job-owner-" .. uuid.v4(), "job-other-" .. uuid.v4()
            local owner = frame(owner_id)
            frame(other_id)
            local item = upsert(owner, { id = uuid.v4(), item_type = "addressed_review", title = "Review",
                recipient = { kind = "user", id = owner_id } })
            test.not_nil(read(owner, item.id))
            test.eq(#await_notifications(owner_id, 1), 1)
            local thread_id = addressed.component_id({ kind = "user", id = owner_id })
            for _, payload in ipairs({
                { recipient = { kind = "user", id = other_id } },
                { thread_id = thread_id, item_id = item.id, to_seq = 2, recipient = { kind = "user", id = other_id } },
                { thread_id = thread_id, item_id = uuid.v4(), to_seq = 1, recipient = { kind = "user", id = other_id } },
            }) do
                local queued, enqueue_err = jobs.enqueue({ namespace = "kickside.inbox", scope = thread_id,
                    key = uuid.v4(), owner_locator = { kind = "thread", id = thread_id }, thread_id = thread_id,
                    job_type = "kickside.inbox.persist:notify_addressed_job", max_attempts = 1,
                    immutable_payload = payload })
                test.is_nil(enqueue_err, tostring(enqueue_err))
                local completed
                for _ = 1, 100 do
                    completed = assert(jobs.get_job(queued.id))
                    if completed.status == "done" or completed.status == "failed" then break end
                    time.sleep("50ms")
                end
                test.eq(completed.status, "done", tostring(completed.last_error))
                test.eq(#notifications(other_id), 0)
                test.eq(#notifications(owner_id), 1)
            end
        end)
    end)
end)

return { target = target, run = test.run_cases(function()
    test.describe("Inbox principal addressing", function()
        test.it("keeps hidden and absent components indistinguishable through Inbox APIs", function()
            local _, owner_service = frame("oracle-owner-" .. uuid.v4())
            local hidden = source(owner_service)
            local viewer_id = "oracle-viewer-" .. uuid.v4()
            local viewer, viewer_service = frame(viewer_id)
            local actor = assert(security.new_actor(viewer_id, { security_groups = { "app:user" } }))
            local scope = assert(security.new_scope({
                assert(security.policy("kickside.inbox.security:module_access")),
                assert(security.policy("kickside.inbox.security:module_runtime")),
                assert(security.policy("app:addressed_app_db")),
                assert(security.policy("kickside.component.security:module_access")),
                assert(security.policy("kickside.component.security:module_runtime")),
                assert(security.policy("kickside.core.security:module_access")),
                assert(security.policy("kickside.core.security:module_runtime")),
            }))
            local member = funcs.new():with_actor(actor):with_scope(scope)
            local baselines = {}
            for _, id in ipairs({ hidden, uuid.v4() }) do
                local access, access_err = viewer_service:get_access_context({ component_id = id, access_level = 1 })
                test.is_true(access_err ~= nil or (access and access.success == false))
                local found, err = member:call("kickside.inbox.persist:addressed_sources", { ids = { id } })
                test.is_nil(found, "member must not learn source existence")
                test.not_nil(err)
                for _, carried in ipairs({ false, true }) do
                    local item = { id = "forged", item_type = "addressed_review", title = "Forged",
                        source_id = id, aggregate_key = "forged", created_at = 1, status = "pending",
                        recipient = { kind = "user", id = viewer_id } }
                    local input = { range = { to_seq = 1 } }
                    if carried then input.projection = { body = { items = { forged = item } } }
                    else input.events = { { type = "kickside.inbox.events:item.version", body = item } } end
                    local folded, fold_err = member:call("app:addressed_probe", { operation = "fold", input = input })
                    test.is_nil(fold_err, tostring(fold_err))
                    test.not_nil(folded.body.items.forged)
                    test.is_nil(folded.body.items.forged.retired_at, "fold must not derive source existence")
                    -- Compare every returned field after normalizing the supplied ID.
                    folded.body.items.forged.source_id = "supplied"
                    local encoded = assert(json.encode(folded))
                    local key = tostring(carried)
                    if baselines[key] then test.eq(encoded, baselines[key]) else baselines[key] = encoded end
                end
                test.is_nil(read(viewer, id))
                local resolved, resolve_err = viewer:call("app:addressed_probe", { operation = "resolve", id = id })
                test.is_nil(resolved)
                test.is_true(errors.is(resolve_err, errors.NOT_FOUND), tostring(resolve_err))
                local deleted = assert(viewer:call("app:addressed_probe", { operation = "api_delete", id = id }))
                test.eq(deleted.status, 404)
            end
            local listed = assert(viewer:call("app:addressed_probe", { operation = "api_list" }))
            test.eq(#listed.items, 0)
            test.eq(listed.item_count, 0)
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 0)
        end)
        test.it("checks every source across existence pages without recipient source access", function()
            local sender, service = frame("source-pages-" .. uuid.v4())
            local items = {}
            local sources = {}
            for i = 1, 129 do
                local id = source(service)
                sources[#sources + 1] = id
                items[tostring(i)] = { recipient = { kind = "user", id = "another-recipient" },
                    aggregate_key = "page", source_id = id }
            end
            items.duplicate = items["1"]
            local live, err = addressed.live_sources(items)
            test.is_nil(err)
            for _, id in ipairs(sources) do test.is_true(live[id], "source was truncated at an existence page boundary") end
        end)
        for _, kind in ipairs({ "user", "group" }) do
            test.it("hides a deleted source for an addressed " .. kind .. " aggregate", function()
                local owner = "source-lifetime-" .. uuid.v4()
                local viewer, viewer_service = frame(owner)
                local sender, service = frame("source-sender-" .. uuid.v4())
                local group = "app:cleanup_team"
                if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, group))) end
                local source_id = source(service)
                local live_source = source(service)
                local recipient = { kind = kind, id = kind == "user" and owner or group }
                local item = upsert(sender, { recipient = recipient, item_type = "addressed_review",
                    source_id = source_id, aggregate_key = "gone", id = uuid.v4(), title = "Gone", priority = "urgent" })
                local live = upsert(sender, { recipient = recipient, item_type = "addressed_review",
                    source_id = live_source, aggregate_key = "live", id = uuid.v4(), title = "Live" })
                local access, access_err = viewer_service:get_access_context({ component_id = source_id, access_level = 1 })
                test.is_true(access_err ~= nil or (access and access.success == false), "viewer must have no source READ")
                test.not_nil(read(viewer, item.id))
                test.not_nil(read(viewer, live.id))
                local before = assert(viewer:call("app:inbox_read_probe", { list = true }))
                local badge = assert(viewer:call("kickside.inbox:badge_count", {}))
                local deleted, delete_err = component.system_delete(source_id)
                test.is_true(deleted or errors.is(delete_err, errors.CONFLICT), tostring(delete_err))
                local remaining
                for _ = 1, 100 do
                    remaining = assert(component.list_system({ component_ids = { source_id }, limit = 1 }))
                    if #remaining == 0 then break end
                    time.sleep("50ms")
                end
                test.eq(#remaining, 0, "source deletion must complete")
                test.is_nil(read(viewer, item.id), "deleted source item remains visible")
                test.not_nil(read(viewer, live.id), "live source without viewer READ must remain visible")
                local after = assert(viewer:call("app:inbox_read_probe", { list = true }))
                test.eq(after.counts.item_count, before.counts.item_count - 1)
                test.eq(after.counts.pending_count, before.counts.pending_count - 1)
                test.eq(after.counts.urgent_count, before.counts.urgent_count - 1)
                test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), badge - 1)
                local resolved, resolve_err = viewer:call("app:addressed_probe", { operation = "resolve", id = item.id })
                test.is_nil(resolved)
                test.is_true(errors.is(resolve_err, errors.NOT_FOUND), tostring(resolve_err))
                local listed = assert(viewer:call("app:addressed_probe", { operation = "api_list" }))
                for _, row in ipairs(listed.items) do test.is_false(row.id == item.id) end
                local db = assert(sql.get("app:db"))
                local pruned, prune_err = prune.prune_thread(db, addressed.component_id(recipient), { cutoff = "2100-01-01T00:00:00Z" })
                db:release()
                test.is_nil(prune_err)
                test.is_true(pruned.deleted > 0)
                test.is_nil(read(viewer, item.id), "event retention exposed a deleted-source item")
                test.not_nil(read(viewer, live.id))
                if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, group))) end
            end)
        end
        for _, store in ipairs({ "personal", "user", "group" }) do
            test.it("persists item reclamation, reopen snapshots and matching counts in the " .. store .. " store", function()
                local owner = "persist-retention-" .. uuid.v4()
                local viewer, service = frame(owner)
                local recipient = store ~= "personal" and { kind = store, id = store == "group" and "app:retention_team" or owner } or nil
                if store == "group" then
                    local assigned, assign_err = user_groups.assign_user_to_group(owner, "app:retention_team")
                    test.not_nil(assigned, tostring(assign_err))
                end
                local live_source = source(service)
                local function send(key: string, closing: boolean?, source_id: string?): any
                    local params = { recipient = recipient, item_type = "addressed_review", source_id = source_id or live_source,
                        aggregate_key = owner .. key, title = key, idempotency_key = uuid.v4() }
                    if closing then return assert(viewer:call("app:addressed_probe", { operation = "close", params = params })) end
                    return upsert(viewer, params)
                end
                local old, recent, pending = send("old"), send("recent"), send("pending")
                send("old", true)
                send("recent", true)
                catchup(viewer)
                local thread_id = recipient and addressed.component_id(recipient) or component.singleton_component_id(owner, "kickside.inbox")
                local hidden, dead_source
                if recipient then
                    dead_source = source(service)
                    hidden = send("hidden", false, dead_source)
                    catchup(viewer)
                    local deleted, delete_err = component.system_delete(dead_source)
                    test.is_true(deleted or errors.is(delete_err, errors.CONFLICT), tostring(delete_err))
                    local remaining
                    for _ = 1, 100 do
                        remaining = assert(component.list_system({ component_ids = { dead_source }, limit = 1 }))
                        if #remaining == 0 then break end
                        time.sleep("50ms")
                    end
                    test.eq(#remaining, 0)
                    send("pending")
                    catchup(viewer)
                end
                local body = materialized(thread_id :: string)
                test.not_nil(body.items[old.id])
                body.items[old.id].resolved_at = os.time() - 31 * 86400
                body.items[pending.id].created_at = 1
                if hidden then
                    test.is_nil(body.items[hidden.id].retired_at)
                    body.items[hidden.id].created_at = 1
                end
                materialized(thread_id :: string, body)
                send("pending")
                catchup(viewer)
                body = materialized(thread_id :: string)
                test.is_nil(body.items[old.id], "expired terminal remains in committed projection")
                if hidden then test.not_nil(body.items[hidden.id], "pending deleted-source item must remain materialized") end
                test.not_nil(body.items[recent.id])
                test.not_nil(body.items[pending.id])
                test.eq(body.counts.item_count, hidden and 3 or 2)
                test.eq(body.counts.pending_count, hidden and 2 or 1)
                test.eq(body.counts.resolved_count, 1)
                local listed = assert(viewer:call("app:inbox_read_probe", { list = true }))
                test.eq(listed.counts.item_count, 2)
                test.eq(listed.counts.pending_count, 1)
                test.eq(listed.counts.resolved_count, 1)
                test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 1)
                if store == "personal" then
                    local actor = assert(security.new_actor(owner, { security_groups = { "app:user" } }))
                    local scope = assert(security.new_scope({ assert(security.policy("app:addressed_runtime")) }))
                    local threads = assert(assert(contract.get("kickside.core:threads")):with_actor(actor):with_scope(scope):open())
                    local creation = assert(threads:find_event_by_external({ thread_id = thread_id,
                        event_type = "kickside.inbox.events:item.created", external_source = "kickside.inbox",
                        external_id = "item:" .. old.id, external_version = "1" }))
                    test.not_nil(creation.event, "creation receipt must still be retained")
                end
                local reopened = send("old")
                test.eq(reopened.id, old.id)
                test.eq(reopened.outcome, "updated")
                test.not_nil(read(viewer, old.id), "reopen snapshot must reconstruct the pruned aggregate")
                body = materialized(thread_id :: string)
                test.eq(body.items[old.id].status, "pending")
                test.eq(body.items[old.id].title, "old")
                test.eq(body.counts.item_count, hidden and 4 or 3)
                test.eq(body.counts.pending_count, hidden and 3 or 2)
                test.eq(body.counts.resolved_count, 1)
                listed = assert(viewer:call("app:inbox_read_probe", { list = true }))
                test.eq(listed.counts.item_count, 3)
                test.eq(listed.counts.pending_count, 2)
                test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 2)
                if store == "group" then test.not_nil((user_groups.remove_user_from_group(owner, "app:retention_team"))) end
            end)
        end
        for _, kind in ipairs({ "user", "group" }) do
            test.it("never prunes pending " .. kind .. " items even with legacy retirement timestamps", function()
                local items = {}
                for i = 1, 129 do
                    items[tostring(i)] = { id = tostring(i), status = "pending", created_at = 1,
                        retired_at = 1, recipient = { kind = kind, id = "recipient" },
                        aggregate_key = "visit", source_id = "absent-source-" .. tostring(i) }
                end
                local out, err = funcs.call("kickside.inbox.persist:projection_worker", {
                    projection = { body = { items = items } }, events = {}, range = { to_seq = 1 } })
                test.is_nil(err, tostring(err))
                for i = 1, 129 do test.not_nil(out.body.items[tostring(i)], "pending item was pruned") end
                test.eq(out.body.counts.item_count, 129)
                test.eq(out.body.counts.pending_count, 129)
                test.eq(out.body.counts.resolved_count, 0)
            end)
        end
        for _, storage in ipairs({ "addressed", "personal" }) do
            for _, write in ipairs({ "close", "snapshot" }) do
                for _, caught_up in ipairs({ false, true }) do
                    test.it("records the " .. storage .. " human action when its callback sends " .. write .. " catchup=" .. tostring(caught_up), function()
                        local owner = "terminal-owner-" .. uuid.v4()
                        local viewer, service = frame(owner)
                        local params = { recipient = storage == "addressed" and { kind = "user", id = owner } or nil, item_type = "terminal_addressed_review",
                            source_id = source(service), aggregate_key = "visit", title = "Review",
                            idempotency_key = uuid.v4(), metadata = { sender_write = write, catchup = caught_up } }
                        local item = upsert(viewer, params)
                        local before = read(viewer, item.id :: string)
                        local result, err = viewer:call("app:addressed_probe", { operation = "resolve", id = item.id, action = "approve" })
                        test.is_nil(err, tostring(err))
                        test.eq(result.status, "approved")
                        local current = read(viewer, item.id :: string)
                        test.eq(current.status, "approved")
                        test.eq(current.action, "approve")
                        test.eq(current.resolved_by, owner)
                        test.eq(current.resolution_id, "resolve:" .. item.id .. ":" .. before.created_event_id)
                        test.eq(current.resolution_id, result.resolution_id)
                        test.not_nil(current.resolved_event_id)
                        params.idempotency_key = item.id .. ":later-close"
                        test.is_nil(select(2, viewer:call("app:addressed_probe", { operation = "close", params = params })))
                        current = read(viewer, item.id :: string)
                        test.eq(current.status, "approved", "sender closure overwrote the human outcome")
                        test.eq(current.action, "approve")
                        test.eq(current.resolved_by, owner)
                        test.eq(current.resolution_id, result.resolution_id)
                        params.idempotency_key, params.metadata = item.id .. ":next-visit", {}
                        upsert(viewer, params)
                        test.eq(read(viewer, item.id :: string).status, "pending")
                        local next_visit, next_err = viewer:call("app:addressed_probe", { operation = "resolve", id = item.id })
                        test.is_nil(next_err)
                        test.is_false(next_visit.resolution_id == result.resolution_id)
                    end)
                end
            end
        end
        for _, storage in ipairs({ "addressed", "personal" }) do
            test.it("keeps the " .. storage .. " human outcome after sender closure", function()
                local owner = "closure-owner-" .. uuid.v4()
                local viewer, service = frame(owner)
                local params = { recipient = storage == "addressed" and { kind = "user", id = owner } or nil,
                    item_type = "terminal_addressed_review", source_id = source(service), aggregate_key = "visit",
                    title = "Review", idempotency_key = uuid.v4() }
                local item = upsert(viewer, params)
                test.not_nil(read(viewer, item.id :: string))
                local result, err = viewer:call("app:addressed_probe", { operation = "resolve", id = item.id, action = "approve" })
                test.is_nil(err)
                local human = read(viewer, item.id :: string)
                params.idempotency_key = item.id .. ":close"
                test.is_nil(select(2, viewer:call("app:addressed_probe", { operation = "close", params = params })))
                local current = read(viewer, item.id :: string)
                test.eq(current.status, "approved")
                test.eq(current.action, "approve")
                test.eq(current.resolved_by, owner)
                test.eq(current.resolution_id, result.resolution_id)
                test.eq(current.resolved_event_id, human.resolved_event_id)
            end)
        end
        test.it("records exactly one resolution when two humans finish their callbacks concurrently", function()
            local first_id, second_id = "human-" .. uuid.v4(), "human-" .. uuid.v4()
            local first, service = frame(first_id)
            local second = frame(second_id)
            local group = "app:addressed_team"
            test.not_nil((user_groups.assign_user_to_group(first_id, group)))
            test.not_nil((user_groups.assign_user_to_group(second_id, group)))
            local db = assert(sql.get("app:db"))
            assert(db:execute("CREATE TABLE IF NOT EXISTS inbox_resolution_callbacks (resolution_id TEXT NOT NULL, resolver TEXT NOT NULL)"))
            db:release()
            local item = upsert(first, { recipient = { kind = "group", id = group }, item_type = "terminal_addressed_review",
                source_id = source(service), aggregate_key = uuid.v4(), title = "Shared review",
                idempotency_key = "shared", metadata = { race = true } })
            local before = read(first, item.id :: string)
            test.not_nil(read(second, item.id :: string))
            local done = channel.new(2)
            for n, caller in ipairs({ first, second }) do
                local viewer, resolver_id, action = caller, n == 1 and first_id or second_id, n == 1 and "approve" or "dismiss"
                coroutine.spawn(function()
                    local result, err = viewer:call("app:addressed_probe", { operation = "resolve", id = item.id, action = action })
                    done:send({ result = result, err = err, resolver = resolver_id, action = action })
                end)
            end
            local winners, losers, winner = 0, 0, nil
            for _ = 1, 2 do
                local outcome = done:receive()
                if outcome.result then winners = winners + 1; winner = outcome
                else losers = losers + 1; test.is_true(errors.is(outcome.err, errors.CONFLICT), tostring(outcome.err)) end
            end
            test.eq(winners, 1)
            test.eq(losers, 1)
            local current = read(first, item.id :: string)
            test.eq(current.action, winner.action)
            test.eq(current.resolved_by, winner.resolver)
            db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1 AND type=$2 AND external_id=$3",
                { addressed.component_id(before.recipient), "kickside.inbox.events:item.resolved", current.resolution_id }))
            db:release()
            test.eq(tonumber(rows[1].n), 1)
        end)
        test.it("isolates nonaggregate identities by type including workflow decision ids", function()
            local sender = frame("identity-sender-" .. uuid.v4())
            local owner = "identity-owner-" .. uuid.v4()
            local viewer = frame(owner)
            local raw = "workflow-decision:df:" .. uuid.v4()
            local first = upsert(sender, { recipient = { kind = "user", id = owner },
                id = raw, item_type = "addressed_review", title = "Type A", idempotency_key = "type-a" })
            local second = upsert(sender, { recipient = { kind = "user", id = owner },
                id = raw, item_type = "other_addressed_review", title = "Type B", idempotency_key = "type-b" })
            test.is_false(first.id == second.id, "type A occupies type B identity")
            test.eq(read(viewer, first.id).item_type, "addressed_review")
            test.eq(read(viewer, second.id).item_type, "other_addressed_review")
        end)
        test.it("keeps nonaggregate user and group recipients distinct in a combined view", function()
            local owner = "recipient-identity-" .. uuid.v4()
            local viewer = frame(owner)
            local group = "app:cleanup_team"
            test.not_nil((user_groups.assign_user_to_group(owner, group)))
            local id = uuid.v4()
            local personal = upsert(viewer, { id = id, recipient = { kind = "user", id = owner },
                item_type = "addressed_review", title = "For user" })
            local shared = upsert(viewer, { id = id, recipient = { kind = "group", id = group },
                item_type = "addressed_review", title = "For group" })
            test.is_false(personal.id == shared.id, "recipient identity collides in the combined view")
            test.eq(read(viewer, personal.id).title, "For user")
            test.eq(read(viewer, shared.id).title, "For group")
            test.not_nil((user_groups.remove_user_from_group(owner, group)))
        end)
        test.it("cannot suppress a real workflow decision using another authorized type", function()
            local owner = "poison-reviewer-" .. uuid.v4()
            local viewer = frame(owner)
            local attacker = frame("poison-sender-" .. uuid.v4(), true, nil, "app:addressed_other_send", true)
            local runner = frame("poison-runner-" .. uuid.v4())
            local signal = assert(viewer:call("app:upgrade_signal", { state = "parked", assignee = owner }))
            local raw = "workflow-decision:" .. signal.dataflow_id .. ":" .. signal.signal_id
            local forbidden, forbidden_err = attacker:call("app:addressed_probe", { params = {
                recipient = { kind = "user", id = owner }, id = raw, item_type = "flow_decision", title = "Forbidden" } })
            test.is_nil(forbidden)
            test.is_true(errors.is(forbidden_err, errors.PERMISSION_DENIED))
            local poison = upsert(attacker, { recipient = { kind = "user", id = owner }, id = raw,
                item_type = "other_addressed_review", title = "Other type", idempotency_key = "poison" })
            local decision, err = runner:call("kickside.inbox:arm_decision", {
                dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "Real decision" } })
            test.is_nil(err)
            test.is_false(decision.id == poison.id)
            test.eq(read(viewer, decision.id).item_type, "flow_decision")
            test.eq(read(viewer, poison.id).item_type, "other_addressed_review")
            local _, resolve_err = viewer:call("app:addressed_probe", { operation = "resolve", id = decision.id, action = "approve" })
            test.is_nil(resolve_err)
        end)
        test.it("refuses another delivery occupying an existing nonaggregate identity", function()
            local owner = "delivery-owner-" .. uuid.v4()
            local sender = frame(owner)
            local params = { recipient = { kind = "user", id = owner }, id = uuid.v4(),
                item_type = "addressed_review", title = "Original", idempotency_key = "original" }
            local original = upsert(sender, params)
            params.title, params.idempotency_key = "Replacement", "different"
            local result, err = sender:call("app:addressed_probe", { params = params })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.eq(read(sender, original.id).title, "Original")
        end)
        test.it("rearms a populated preupgrade recipient decision without a private pending copy", function()
            local owner = "legacy-reviewer-" .. uuid.v4()
            local reviewer = frame(owner)
            local sender = frame("legacy-runner-" .. uuid.v4())
            local signal = assert(reviewer:call("app:upgrade_signal", { state = "parked", assignee = owner }))
            local id = "workflow-decision:" .. signal.dataflow_id .. ":" .. signal.signal_id
            local _, seed_err = reviewer:call("app:addressed_probe", { operation = "legacy_decision", params = {
                id = id, item_type = "flow_decision", title = "Preupgrade", actor_id = owner, created_at = os.time(),
                metadata = { dataflow_id = signal.dataflow_id, signal_id = signal.signal_id, assignee = owner } } })
            test.is_nil(seed_err)
            test.not_nil(read(reviewer, id))
            local _, resolve_err = reviewer:call("app:addressed_probe", { operation = "resolve", id = id, action = "approve" })
            test.is_nil(resolve_err)
            catchup(reviewer)
            local armed, arm_err = sender:call("kickside.inbox:arm_decision", {
                dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "Rearmed" } })
            test.is_nil(arm_err)
            test.eq(armed.id, id, "rearm did not use the populated legacy decision")
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1 AND type=$2",
                { addressed.component_id({ kind = "user", id = owner }), "kickside.inbox.events:item.version" }))
            db:release()
            test.eq(tonumber(rows[1].n), 0, "rearm created a hidden private pending copy")
            test.eq(read(reviewer, id).status, "approved")
            test.not_nil((reviewer:call("app:addressed_probe", { operation = "delete", id = id })))
            test.is_nil(read(reviewer, id))
            local rearmed, rearm_err = sender:call("kickside.inbox:arm_decision", {
                dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "Rearmed after deletion" } })
            test.is_nil(rearm_err)
            test.eq(rearmed.id, id)
            test.is_nil(read(reviewer, id), "deleting legacy history exposed or recreated a pending copy")
            test.eq(assert(reviewer:call("kickside.inbox:badge_count", {})), 0)
        end)
        test.it("rearms a retained materialized legacy decision after creation events are pruned", function()
            local owner = "legacy-reviewer-" .. uuid.v4()
            local reviewer = frame(owner)
            local sender = frame("legacy-runner-" .. uuid.v4())
            local signal = assert(reviewer:call("app:upgrade_signal", { state = "parked", assignee = owner }))
            local id = "workflow-decision:" .. signal.dataflow_id .. ":" .. signal.signal_id
            local _, seed_err = reviewer:call("app:addressed_probe", { operation = "legacy_decision", params = {
                id = id, item_type = "flow_decision", title = "Preupgrade", actor_id = owner, created_at = os.time(),
                metadata = { dataflow_id = signal.dataflow_id, signal_id = signal.signal_id, assignee = owner } } })
            test.is_nil(seed_err)
            test.not_nil(read(reviewer, id))
            local _, resolve_err = reviewer:call("app:addressed_probe", { operation = "resolve", id = id, action = "approve" })
            test.is_nil(resolve_err)
            catchup(reviewer)
            local thread_id = assert(component.singleton_component_id(owner, "kickside.inbox"))
            local db = assert(sql.get("app:db"))
            local pruned, prune_err = prune.prune_thread(db, thread_id, { cutoff = "2100-01-01T00:00:00Z" })
            test.is_nil(prune_err)
            test.is_true(pruned.deleted > 0, "real retention must prune the caught-up events")
            local events = assert(db:query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1 AND type=$2",
                { thread_id, "kickside.inbox.events:item.created" }))
            db:release()
            test.eq(tonumber(events[1].n), 0, "creation event must be absent")
            test.eq(read(reviewer, id).status, "approved", "retention must keep the materialized card")
            local armed, arm_err = sender:call("kickside.inbox:arm_decision", {
                dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "Rearmed" } })
            test.is_nil(arm_err)
            test.eq(armed.id, id, "rearm did not use the populated legacy decision")
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1 AND type=$2",
                { addressed.component_id({ kind = "user", id = owner }), "kickside.inbox.events:item.version" }))
            db:release()
            test.eq(tonumber(rows[1].n), 0, "rearm created a hidden private pending copy")
            test.eq(read(reviewer, id).status, "approved")
            local deleted = assert(reviewer:call("app:addressed_probe", { operation = "api_delete", id = id }))
            test.eq(deleted.status, 200, "a materialized legacy card must remain deletable after retention")
            test.is_true(deleted.body.success)
            test.is_nil(read(reviewer, id))
        end)
        test.it("rearms private decisions as the assignee without creating a personal copy", function()
            local owner = "rearm-self-" .. uuid.v4()
            local viewer = frame(owner)
            local runner = frame("rearm-runner-" .. uuid.v4())
            local signal = assert(viewer:call("app:upgrade_signal", { state = "parked", assignee = owner }))
            local args = { dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "One decision" } }
            local first = assert(runner:call("kickside.inbox:arm_decision", args))
            test.not_nil(read(viewer, first.id))
            local rearmed, rearm_err = viewer:call("kickside.inbox:arm_decision", args)
            test.is_nil(rearm_err)
            test.eq(rearmed.id, first.id, "self rearm duplicated the private decision in personal storage")
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 1)
            test.is_nil(select(2, viewer:call("app:addressed_probe", { operation = "resolve", id = first.id, action = "approve" })))
            catchup(viewer)
            test.eq(assert(viewer:call("kickside.inbox:arm_decision", args)).id, first.id)
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 0)
            test.not_nil((viewer:call("app:addressed_probe", { operation = "delete", id = first.id })))
            test.is_nil(read(viewer, first.id))
            test.eq(assert(viewer:call("kickside.inbox:arm_decision", args)).id, first.id)
            test.is_nil(read(viewer, first.id), "self rearm reopened deleted private history")
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 0)
        end)
        test.it("invalidates the computed badge for personal notices", function()
            local owner = "badge-notice-" .. uuid.v4()
            local viewer = frame(owner)
            local item = upsert(viewer, { item_type = "notice", title = "Personal notice" })
            test.not_nil(read(viewer, item.id))
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 1)
            test.eq(#await_notifications(owner, 1), 1, "personal creation did not invalidate inbox.changed")
            test.is_nil(select(2, viewer:call("app:addressed_probe", { operation = "resolve", id = item.id })))
            catchup(viewer)
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 0)
            test.eq(#await_notifications(owner, 2), 2, "personal resolution did not invalidate inbox.changed")
        end)
        test.it("invalidates the computed badge for self-assigned decisions", function()
            local owner = "badge-decision-" .. uuid.v4()
            local viewer = frame(owner)
            local signal = assert(viewer:call("app:upgrade_signal", { state = "parked", assignee = owner }))
            local item = assert(viewer:call("kickside.inbox:arm_decision", {
                dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "Self review" } }))
            test.not_nil(read(viewer, item.id))
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 1)
            test.eq(#await_notifications(owner, 1), 1, "self decision creation did not invalidate inbox.changed")
            test.is_nil(select(2, viewer:call("app:addressed_probe", { operation = "resolve", id = item.id, action = "approve" })))
            catchup(viewer)
            test.eq(assert(viewer:call("kickside.inbox:badge_count", {})), 0)
            test.eq(#await_notifications(owner, 2), 2, "self decision resolution did not invalidate inbox.changed")
        end)
        test.it("refuses concurrent delivery key reuse with different content after both lookups miss", function()
            local owner = "race-owner-" .. uuid.v4()
            local sender, service = frame(owner)
            -- Provision before the barrier so the race concerns delivery, not first touch.
            local src = source(service)
            upsert(sender, { recipient = { kind = "user", id = owner }, item_type = "addressed_review",
                source_id = src, aggregate_key = "provision", title = "Provision", idempotency_key = "provision" })
            local race, err = sender:call("app:addressed_race_probe", { params = {
                recipient = { kind = "user", id = owner }, item_type = "addressed_review",
                source_id = src, aggregate_key = "race", idempotency_key = "racing-key" } })
            test.is_nil(err)
            test.eq(race.misses, 2, "both preliminary lookups must miss")
            test.eq(race.duplicates, 1, "second append must hit Core's real deduplication")
            local id
            for _, result in ipairs(race.results) do
                if result.title == "First" then
                    test.is_nil(result.err)
                    id = result.result.id
                else
                    test.is_nil(result.result, "different content was reported delivered")
                    test.is_true(errors.is(result.err, errors.CONFLICT))
                end
            end
            test.eq(read(sender, id).title, "First")
        end)
        test.it("deletes private user items only for their viewer and preserves delete replay", function()
            local sender = frame("delete-sender-" .. uuid.v4())
            local owner = "delete-owner-" .. uuid.v4()
            local viewer = frame(owner)
            local item = upsert(sender, { recipient = { kind = "user", id = owner }, id = uuid.v4(),
                item_type = "addressed_review", title = "Delete private" })
            test.not_nil(read(viewer, item.id))
            local denied, denied_err = sender:call("app:addressed_probe", { operation = "delete", id = item.id })
            test.is_nil(denied)
            test.is_true(errors.is(denied_err, errors.NOT_FOUND))
            test.is_nil(select(2, viewer:call("app:addressed_probe", { operation = "resolve", id = item.id })))
            catchup(viewer)
            local deleted, delete_err = viewer:call("app:addressed_probe", { operation = "delete", id = item.id, key = "delete" })
            test.is_nil(delete_err)
            test.eq(deleted.id, item.id)
            test.is_nil(read(viewer, item.id))
            test.eq(assert(viewer:call("app:addressed_probe", { operation = "delete", id = item.id, key = "delete" })).id, item.id)
            test.eq(#await_notifications(owner, 3), 3, "deleting the last private item must invalidate its viewer")
            local other = upsert(sender, { recipient = { kind = "user", id = owner }, id = uuid.v4(),
                item_type = "addressed_review", title = "Another private item" })
            test.not_nil(read(viewer, other.id))
            local conflict, conflict_err = viewer:call("app:addressed_probe", { operation = "delete", id = other.id, key = "delete" })
            test.is_nil(conflict)
            test.is_true(errors.is(conflict_err, errors.CONFLICT))
            test.not_nil(read(viewer, other.id))
        end)
        for _, kind in ipairs({ "user", "group" }) do
            test.it("deletes a revived " .. kind .. " aggregate again through HTTP without a delivery key", function()
                local owner = "revived-delete-" .. uuid.v4()
                local viewer, service = frame(owner)
                local group = "app:delete_team"
                if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, group))) end
                local params = { recipient = { kind = kind, id = kind == "user" and owner or group }, item_type = "addressed_review",
                    source_id = source(service), aggregate_key = uuid.v4(), title = "First visit", idempotency_key = "first" }
                local item = upsert(viewer, params)
                test.not_nil(read(viewer, item.id))
                local deleted, delete_err = viewer:call("app:addressed_probe", { operation = "api_delete", id = item.id })
                test.is_nil(delete_err)
                test.eq(deleted.status, 200)
                test.is_true(deleted.body.success)
                test.is_nil(read(viewer, item.id))
                local replay = assert(viewer:call("app:addressed_probe", { operation = "api_delete", id = item.id }))
                test.eq(replay.status, 200)
                test.is_true(replay.body.success)
                params.idempotency_key, params.title = "revived", "Second visit"
                test.eq(upsert(viewer, params).id, item.id :: string)
                local revived = read(viewer, item.id :: string)
                test.eq(revived.title, "Second visit")
                test.eq(revived.status, "pending")
                local again, again_err = viewer:call("app:addressed_probe", { operation = "api_delete", id = item.id })
                test.is_nil(again_err)
                test.eq(again.status, 200)
                test.is_true(again.body.success)
                test.is_nil(read(viewer, item.id), "second delete acknowledged an old deletion and left the revived card")
                test.eq(assert(viewer:call("app:addressed_probe", { operation = "api_delete", id = item.id })).status, 200)
                if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, group))) end
            end)
        end
        test.it("deletes shared work only for current members", function()
            local group = "app:delete_team"
            local owner = "delete-member-" .. uuid.v4()
            local viewer = frame(owner, false, { "app:user", group })
            local sender, service = frame("delete-group-sender-" .. uuid.v4())
            test.not_nil((user_groups.assign_user_to_group(owner, group)))
            local item = upsert(sender, { recipient = { kind = "group", id = group }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = uuid.v4(), title = "Shared deletion" })
            test.not_nil(read(viewer, item.id))
            test.eq(#await_notifications(owner, 1), 1, "wait for creation while the viewer is still a member")
            test.not_nil((user_groups.remove_user_from_group(owner, group)))
            local denied, denied_err = viewer:call("app:addressed_probe", { operation = "delete", id = item.id })
            test.is_nil(denied)
            test.is_true(errors.is(denied_err, errors.NOT_FOUND))
            test.not_nil((user_groups.assign_user_to_group(owner, group)))
            local deleted, delete_err = viewer:call("app:addressed_probe", { operation = "delete", id = item.id })
            test.is_nil(delete_err)
            test.eq(deleted.id, item.id)
            test.is_nil(read(viewer, item.id))
            test.eq(#await_notifications(owner, 2), 2, "group deletion must invalidate even after its last card disappears")
            test.not_nil((user_groups.remove_user_from_group(owner, group)))
            local replay, replay_err = viewer:call("app:addressed_probe", { operation = "delete", id = item.id })
            test.is_nil(replay)
            test.is_true(errors.is(replay_err, errors.NOT_FOUND))
        end)
        test.it("metadata cleanup discards only actor-owned items and leaves addressed work", function()
            local owner = "cleanup-owner-" .. uuid.v4()
            local viewer, service = frame(owner)
            local metadata = { cleanup = uuid.v4() }
            local personal = upsert(viewer, { item_type = "notice", title = "Owned", metadata = metadata })
            local private = upsert(viewer, { recipient = { kind = "user", id = owner }, id = uuid.v4(),
                item_type = "addressed_review", title = "Inbox owned", metadata = metadata })
            local group = "app:cleanup_team"
            test.not_nil((user_groups.assign_user_to_group(owner, group)))
            local shared = upsert(viewer, { recipient = { kind = "group", id = group }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = uuid.v4(), title = "Group owned", metadata = metadata })
            test.not_nil(read(viewer, personal.id))
            local result, err = viewer:call("app:addressed_probe", { operation = "cleanup", match = metadata })
            test.is_nil(err)
            test.eq(result.discarded, 1)
            test.is_nil(read(viewer, personal.id))
            test.not_nil(read(viewer, private.id))
            test.not_nil(read(viewer, shared.id))
            test.not_nil((user_groups.remove_user_from_group(owner, group)))
        end)
        test.it("notifies the addressed user after write and resolution commits without content", function()
            local sender, service = frame("notify-sender-" .. uuid.v4())
            local id = "notify-viewer-" .. uuid.v4()
            local viewer = frame(id)
            local params = { recipient = { kind = "user", id = id }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "review", title = "Private title", content = "Private content", idempotency_key = "first" }
            local item = upsert(sender, params)
            read(viewer, item.id :: string)
            test.eq(#await_notifications(id, 1), 1)
            params.title, params.content, params.idempotency_key = "Updated", "Private update", "next"
            upsert(sender, params)
            test.eq(read(viewer, item.id :: string).title, "Updated")
            test.eq(#await_notifications(id, 2), 2, "a content refresh must invalidate even when counts are unchanged")
            local _, err = viewer:call("app:addressed_probe", { operation = "resolve", id = item.id })
            test.is_nil(err)
            read(viewer, item.id :: string)
            test.eq(#await_notifications(id, 3), 3, "resolution must invalidate the viewer too")
        end)
        test.it("keeps an addressed write and its projection committed when notification fails", function()
            local sender, service = frame("notify-sender-" .. uuid.v4())
            local id = "notify-fail-" .. uuid.v4()
            local viewer = frame(id)
            local item = upsert(sender, { recipient = { kind = "user", id = id }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "review", title = "Committed", idempotency_key = "first" })
            test.eq(read(viewer, item.id).title, "Committed")
            test.eq(#await_notifications(id, 1), 1, "failure must be exercised")
            test.eq(read(viewer, item.id).title, "Committed")
        end)
        test.it("delivers and refreshes an aggregate for another user without giving the sender Inbox access", function()
            local sender_id, recipient_id = "sender-" .. uuid.v4(), "recipient-" .. uuid.v4()
            local sender, service = frame(sender_id)
            local recipient, recipient_service = frame(recipient_id)
            local inbox_id = component.singleton_component_id(recipient_id, "kickside.inbox")
            test.is_true(assert(recipient_service:register({ component_id = inbox_id,
                impl_id = "kickside.inbox:inbox_binding" })).success)
            upsert(recipient, { item_type = "notice", title = "Provisioned" })
            local params = { recipient = { kind = "user", id = recipient_id },
                item_type = "addressed_review", source_id = source(service), aggregate_key = "review",
                title = "First", idempotency_key = "first" }
            local first = upsert(sender, params)
            local item = read(recipient, first.id :: string)
            test.not_nil(item, "recipient does not receive the aggregate")
            test.eq(item.recipient.id, recipient_id)
            test.eq(item.sender_id, sender_id)
            test.is_nil(read(sender, first.id))
            params.title, params.idempotency_key = "Current", "current"
            test.eq(upsert(sender, params).id, first.id)
            test.eq(read(recipient, first.id).title, "Current")
            params.title, params.idempotency_key = "First", "first"
            upsert(sender, params)
            test.eq(read(recipient, first.id).title, "Current")
            local foreign, access_err = service:get({ component_id = inbox_id })
            test.is_nil(access_err)
            test.is_false(foreign.success)
            params.idempotency_key = "close"
            local closed, close_err = sender:call("app:addressed_probe", { operation = "close", params = params })
            test.is_nil(close_err)
            test.eq(closed.id, first.id)
            test.eq(read(recipient, first.id).status, "resolved")
        end)

        test.it("commits one aggregate event per addressed delivery", function()
            local sender_id = "atomic-" .. uuid.v4()
            local sender, service = frame(sender_id)
            local created = upsert(sender, { recipient = { kind = "user", id = sender_id },
                item_type = "addressed_review", source_id = source(service), aggregate_key = "atomic",
                title = "One", idempotency_key = "atomic" })
            local run = assert(assert(contract.get("kickside.core:threads")):with_actor(
                assert(security.new_actor("system:kickside.inbox.addressed", {}))):with_scope(
                assert(security.new_scope({ assert(security.policy("app:addressed_runtime")) }))):open())
            local result = assert(run:list_events({ thread_id = addressed.component_id({ kind = "user", id = sender_id }), limit = 200 }))
            local count = 0
            for _, event in ipairs(result.events) do
                local body = type(event.body) == "string" and assert(json.decode(event.body)) or event.body
                if body.id == created.id then count = count + 1 end
            end
            test.eq(count, 1, "delivery splits aggregate creation and update")
        end)

        test.it("refuses a sender without the declaring type's exact send permission", function()
            local sender, service = frame("unauthorized-" .. uuid.v4(), true)
            local result, err = sender:call("app:addressed_probe", { params = {
                recipient = { kind = "user", id = "someone-else" }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "review", title = "Refused",
            } })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)

        test.it("includes the item type and recipient in addressed aggregate identity", function()
            local sender_id = "identity-" .. uuid.v4()
            local sender, service = frame(sender_id)
            local params = { recipient = { kind = "user", id = sender_id },
                item_type = "addressed_review", source_id = source(service), aggregate_key = "review",
                title = "One", idempotency_key = "one" }
            local first = upsert(sender, params)
            params.item_type, params.idempotency_key = "other_addressed_review", "two"
            local other = upsert(sender, params)
            test.is_false(first.id == other.id)
        end)

        for _, kind in ipairs({ "user", "group" }) do
            for _, operation in ipairs({ "close", "delete" }) do
                test.it("lets an exact-type sender " .. operation .. " existing " .. kind .. " work after source READ is gone", function()
                    local owner = "no-read-close-" .. uuid.v4()
                    local viewer = frame(owner)
                    local sender_id = "no-read-sender-" .. uuid.v4()
                    local sender, service = frame(sender_id)
                    local recipient = { kind = kind, id = kind == "user" and owner or "app:cleanup_team" }
                    if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, recipient.id))) end
                    local source_id = source(service)
                    local params = { recipient = recipient, item_type = "addressed_review", source_id = source_id,
                        aggregate_key = "visit", title = "Original", idempotency_key = "create" }
                    local created = upsert(sender, params)
                    test.not_nil(read(viewer, created.id))
                    local identity = assert(sender:call("app:addressed_probe", { operation = "identity", params = params }))
                    -- Another exact-type sender has no READ, even while the source is live.
                    local closer, closer_service = frame("closer-" .. uuid.v4())
                    local access, access_err = closer_service:get_access_context({ component_id = source_id, access_level = 1 })
                    test.is_true(access_err ~= nil or (access and access.success == false))
                    params.idempotency_key = "update-denied"
                    for _, key in ipairs({ "visit", "new" }) do
                        params.aggregate_key = key
                        local updated, update_err = closer:call("app:addressed_probe", { params = params })
                        test.is_nil(updated)
                        test.not_nil(update_err)
                    end
                    params.aggregate_key = "visit"
                    local deleted, delete_err = component.system_delete(source_id)
                    test.is_true(deleted or errors.is(delete_err, errors.CONFLICT), tostring(delete_err))
                    local remaining
                    for _ = 1, 100 do
                        remaining = assert(component.list_system({ component_ids = { source_id }, limit = 1 }))
                        if #remaining == 0 then break end
                        time.sleep("50ms")
                    end
                    test.eq(#remaining, 0)
                    test.is_nil(read(viewer, created.id))
                    local after = assert(closer:call("app:addressed_probe", { operation = "identity", params = params }))
                    test.eq(after.id, identity.id, "delete identity must remain usable without source READ")
                    local denied = frame(sender_id, true, nil, "app:addressed_other_send")
                    local denied_result, denied_err = denied:call("app:addressed_probe", {
                        operation = operation, params = params, identity = identity })
                    test.is_nil(denied_result)
                    test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED))
                    params.idempotency_key = "close"
                    local closing_sender = operation == "close" and sender or closer
                    local closed, close_err = closing_sender:call("app:addressed_probe", {
                        operation = operation, params = params, identity = identity })
                    test.is_nil(close_err, tostring(close_err))
                    test.eq(closed.id, created.id)
                    catchup(viewer)
                    local thread_id = addressed.component_id(recipient)
                    local body = materialized(thread_id)
                    if operation == "close" then
                        test.eq(body.items[created.id].status, "resolved")
                        test.eq(body.items[created.id].title, "Original")
                        body.items[created.id].resolved_at = os.time() - 31 * 86400
                        materialized(thread_id, body)
                    else test.is_nil(body.items[created.id]) end
                    -- Neither a content update nor new creation may use a gone source.
                    for _, key in ipairs({ "visit", "new" }) do
                        params.aggregate_key, params.idempotency_key = key, "denied-" .. key
                        local written, write_err = sender:call("app:addressed_probe", { params = params })
                        test.is_nil(written)
                        test.not_nil(write_err)
                    end
                    params.aggregate_key, params.idempotency_key = "never-created", "absent-close"
                    local absent, absent_err = closer:call("app:addressed_probe", { operation = "close", params = params })
                    test.is_nil(absent)
                    test.is_true(errors.is(absent_err, errors.NOT_FOUND), tostring(absent_err))
                    -- A live unrelated delivery drives the real persisted retention fold.
                    params.source_id, params.aggregate_key, params.idempotency_key = source(service), "next", "next"
                    upsert(sender, params)
                    catchup(viewer)
                    test.is_nil(materialized(thread_id).items[created.id], "closed item did not age out")
                    if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, recipient.id))) end
                end)
            end
        end

        test.it("lets the sender close and reopen addressed work with replay-safe snapshots", function()
            local sender_id = "close-" .. uuid.v4()
            local sender, service = frame(sender_id)
            local params = { recipient = { kind = "user", id = sender_id },
                item_type = "addressed_review", source_id = source(service), aggregate_key = "review",
                title = "Awaiting", idempotency_key = "open" }
            local first = upsert(sender, params)
            params.idempotency_key = "close"
            local closed, close_err = sender:call("app:addressed_probe", { operation = "close", params = params })
            test.is_nil(close_err)
            test.eq(closed.id, first.id)
            test.eq(read(sender, first.id).status, "resolved")
            params.idempotency_key = "reopen"
            upsert(sender, params)
            params.idempotency_key = "close"
            local _, replay_err = sender:call("app:addressed_probe", { operation = "close", params = params })
            test.is_nil(replay_err)
            test.eq(read(sender, first.id).status, "pending")
        end)

        test.it("lets one live group member resolve an item for all members", function()
            local group = "app:addressed_team"
            local sender, sender_service = frame("group-sender-" .. uuid.v4())
            local group_inbox = addressed.component_id({ kind = "group", id = group })
            local one_id, two_id = "member-one-" .. uuid.v4(), "member-two-" .. uuid.v4()
            local one = frame(one_id, false, { "app:user", group })
            local two, two_service = frame(two_id, false, { "app:user", group })
            test.not_nil((user_groups.assign_user_to_group(one_id, group)))
            test.not_nil((user_groups.assign_user_to_group(two_id, group)))
            upsert(one, { item_type = "notice", title = "Personal" })
            upsert(two, { item_type = "notice", title = "Personal" })
            local params = { recipient = { kind = "group", id = group }, item_type = "addressed_review",
                source_id = source(sender_service), aggregate_key = "review", title = "Shared", idempotency_key = "shared" }
            local created = upsert(sender, params)
            test.not_nil(read(one, created.id), "live group member does not receive the item")
            test.not_nil(read(two, created.id))
            local pending, list_err = two:call("app:addressed_probe", { operation = "api_list" })
            test.is_nil(list_err)
            test.eq(pending.pending_count, 2)
            local badge, badge_err = two:call("kickside.inbox:badge_count", {})
            test.is_nil(badge_err)
            test.eq(badge, 2)
            test.is_true(#pending.component_ids >= 2)
            local summary = assert(two_service:get({ component_id = pending.component_id }))
            test.eq(tonumber(summary.meta.pending_count), 1)
            local joiner_id = "new-member-" .. uuid.v4()
            local joiner = frame(joiner_id)
            upsert(joiner, { item_type = "notice", title = "Personal" })
            test.is_nil(read(joiner, created.id))
            test.not_nil((user_groups.assign_user_to_group(joiner_id, group)))
            test.not_nil(read(joiner, created.id), "new member cannot read with unchanged session")
            local joined_list, joined_err = joiner:call("app:addressed_probe", { operation = "api_list" })
            test.is_nil(joined_err)
            test.eq(joined_list.pending_count, 2)
            local targets, targets_err = joiner:call("app:addressed_probe", { operation = "targets" })
            test.is_nil(targets_err)
            test.is_true(#targets >= 1)
            local found = false
            for _, id in ipairs(targets) do if id == group_inbox then found = true end end
            test.is_true(found)
            test.not_nil((user_groups.remove_user_from_group(joiner_id, group)))
            local departed, departed_err = joiner:call("app:addressed_probe", { operation = "targets" })
            test.is_nil(departed_err)
            for _, id in ipairs(departed) do test.is_false(id == group_inbox) end
            test.not_nil((user_groups.remove_user_from_group(two_id, group)))
            test.is_nil(read(two, created.id), "departed member retains pending work")
            local revoked_list, revoked_list_err = two:call("app:addressed_probe", { operation = "api_list" })
            test.is_nil(revoked_list_err)
            test.eq(revoked_list.pending_count, 1, "departed member still lists group work")
            local denied, denial = two:call("app:addressed_probe", { operation = "resolve", id = created.id })
            test.is_nil(denied)
            test.is_true(errors.is(denial, errors.NOT_FOUND))
            test.not_nil((user_groups.assign_user_to_group(two_id, group)))
            local resolved, resolve_err = one:call("app:addressed_probe", { operation = "resolve", id = created.id })
            test.is_nil(resolve_err)
            test.eq(resolved.status, "dismissed")
            test.eq(read(two, created.id).status, "dismissed")
            test.eq(read(two, created.id).resolved_by, one_id)
            test.not_nil((user_groups.remove_user_from_group(two_id, group)))
            local models = assert(assert(contract.get("kickside.core:read_models")):with_actor(
                assert(security.new_actor(two_id, { security_groups = { "app:user", group } }))
            ):with_scope(assert(security.new_scope({ assert(security.policy("app:addressed_runtime")) }))):open())
            local exposed, exposed_err = models:get({ owner_id = group_inbox, kind = "kickside.inbox:items", projection_key = "default" })
            test.is_nil(exposed, "Core exposes group item contents to departed member")
            test.not_nil(exposed_err)
            local threads = assert(assert(contract.get("kickside.core:threads")):with_actor(
                assert(security.new_actor(two_id, { security_groups = { "app:user", group } }))
            ):with_scope(assert(security.new_scope({ assert(security.policy("app:addressed_runtime")) }))):open())
            local leaked_events, events_err = threads:list_events({ thread_id = group_inbox })
            test.is_nil(leaked_events)
            test.not_nil(events_err)
            test.is_nil(read(two, created.id), "departed member retains the item through stamped groups")
            local refused, refused_err = two:call("app:addressed_probe", { operation = "resolve", id = created.id })
            test.is_nil(refused)
            test.is_true(errors.is(refused_err, errors.NOT_FOUND))


        end)

        test.it("refuses a sender granted only another item type", function()
            local sender, service = frame("cross-type-" .. uuid.v4(), true, nil, "app:addressed_other_send")
            local result, err = sender:call("app:addressed_probe", { params = {
                recipient = { kind = "user", id = "unqueried" }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "review", title = "Refused" } })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)

        test.it("survives the partial-delivery failure window and retries without overwriting newer work or reopening closure", function()
            local owner = "interleave-" .. uuid.v4()
            local sender, service = frame(owner)
            local params = { recipient = { kind = "user", id = owner }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "race", title = "OLD", idempotency_key = "A" }
            -- Reject the old writer's second append after creation commits. The
            -- production writer must finish in one event, leaving no such window.
            local db = assert(sql.get("app:db"))
            local postgres = db:type() == sql.type.POSTGRES
            local private_id = addressed.component_id(params.recipient)
            local personal_id = component.singleton_component_id(owner, "kickside.inbox")
            local condition = "NEW.type='kickside.inbox.events:item.version' AND NEW.thread_id IN ('"
                .. private_id .. "','" .. personal_id .. "') AND EXISTS (SELECT 1 FROM kickside_event e WHERE "
                .. "e.thread_id=NEW.thread_id AND e.type='kickside.inbox.events:item.created')"
            if postgres then
                assert(db:execute("CREATE FUNCTION inbox_partial_delivery() RETURNS trigger LANGUAGE plpgsql AS $$ "
                    .. "BEGIN IF " .. condition .. " THEN RAISE EXCEPTION 'injected second delivery append failure'; END IF; RETURN NEW; END; $$"))
                assert(db:execute("CREATE TRIGGER inbox_partial_delivery BEFORE INSERT ON kickside_event FOR EACH ROW EXECUTE FUNCTION inbox_partial_delivery()"))
            else
                assert(db:execute("CREATE TRIGGER inbox_partial_delivery BEFORE INSERT ON kickside_event WHEN "
                    .. condition .. " BEGIN SELECT RAISE(ABORT,'injected second delivery append failure'); END"))
            end
            local first, first_err = sender:call("app:addressed_probe", { params = params })
            if postgres then
                assert(db:execute("DROP TRIGGER inbox_partial_delivery ON kickside_event"))
                assert(db:execute("DROP FUNCTION inbox_partial_delivery()"))
            else
                assert(db:execute("DROP TRIGGER inbox_partial_delivery"))
            end
            db:release()
            test.is_nil(first_err, "delivery still has a partial-commit window: " .. tostring(first_err))
            test.not_nil(first)
            -- Treat the committed response as lost, deliver B, and retry A.
            params.title, params.idempotency_key = "NEW", "B"
            local newer = upsert(sender, params)
            params.title, params.idempotency_key = "OLD", "A"
            upsert(sender, params)
            test.eq(read(sender, newer.id).title, "NEW")
            params.idempotency_key = "close"
            test.not_nil((sender:call("app:addressed_probe", { operation = "close", params = params })))
            params.idempotency_key = "A"
            upsert(sender, params)
            test.eq(read(sender, newer.id).status, "resolved")
        end)

        test.it("keeps personal items readable when the live group lookup fails", function()
            local viewer = frame("lookup-failure-" .. uuid.v4(), false, nil, "app:addressed_groups_fail")
            local personal = upsert(viewer, { item_type = "notice", title = "Personal" })
            test.not_nil(read(viewer, personal.id))
            local listed, err = viewer:call("app:addressed_probe", { operation = "api_list" })
            test.is_nil(err)
            test.eq(listed.pending_count, 1)
        end)

        test.it("runs both shared callbacks through the real resolver under the viewer", function()
            local owner = "callback-" .. uuid.v4()
            local sender, service = frame(owner)
            test.not_nil((user_groups.assign_user_to_group(owner, "app:addressed_team")))
            local params = { recipient = { kind = "group", id = "app:addressed_team" },
                item_type = "callback_addressed_review", source_id = source(service), aggregate_key = owner,
                title = "Callback", metadata = { expected_resolver = owner }, idempotency_key = owner }
            local item = upsert(sender, params)
            test.not_nil(read(sender, item.id))
            local resolved, err = sender:call("app:addressed_probe", { operation = "resolve", id = item.id })
            test.is_nil(err)
            test.eq(resolved.status, "dismissed")
            test.eq(read(sender, item.id).resolved_by, owner)
            test.not_nil((user_groups.remove_user_from_group(owner, "app:addressed_team")))
        end)

        test.it("reads and resolves populated actor aggregates and stored decisions after upgrade", function()
            local owner = "upgrade-" .. uuid.v4()
            local viewer, service = frame(owner)
            local aggregate = upsert(viewer, { item_type = "notice", source_id = source(service),
                aggregate_key = "legacy", title = "Existing personal aggregate", idempotency_key = "legacy" })
            local signal, signal_err = viewer:call("app:upgrade_signal", { state = "parked", assignee = owner })
            test.is_nil(signal_err)
            local decision_id = "workflow-decision:" .. signal.dataflow_id .. ":" .. signal.signal_id
            local _, seed_err = viewer:call("app:addressed_probe", { operation = "legacy_decision", params = {
                id = decision_id, item_type = "flow_decision", title = "Stored before upgrade", actor_id = owner,
                created_at = os.time(), source_id = decision_id,
                metadata = { dataflow_id = signal.dataflow_id, signal_id = signal.signal_id, assignee = owner } } })
            test.is_nil(seed_err)
            test.not_nil(read(viewer, aggregate.id))
            test.not_nil(read(viewer, decision_id))
            local resolved, err = viewer:call("app:addressed_probe", { operation = "resolve", id = aggregate.id })
            test.is_nil(err)
            test.eq(resolved.status, "dismissed")
            local approved, approve_err = viewer:call("app:addressed_probe", { operation = "resolve", id = decision_id, action = "approve" })
            test.is_nil(approve_err)
            test.eq(approved.status, "approved")
            test.eq(read(viewer, decision_id).status, "approved")
        end)

        test.it("accepts addressed snapshots and exposes their badge counts through the public API", function()
            local sender, service = frame("api-sender-" .. uuid.v4())
            local recipient_id = "api-recipient-" .. uuid.v4()
            local recipient, recipient_service = frame(recipient_id)
            upsert(recipient, { item_type = "notice", title = "Personal" })
            local params = { recipient = { kind = "user", id = recipient_id }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "api-review", title = "Addressed", idempotency_key = "api-create" }
            local created, create_err = sender:call("app:addressed_probe", { operation = "api_create", params = params })
            test.is_nil(create_err)
            test.is_true(created.success)
            test.not_nil(read(recipient, created.item.id), "POST drops recipient or aggregate identity")
            local listed, list_err = recipient:call("app:addressed_probe", { operation = "api_list" })
            test.is_nil(list_err)
            test.eq(listed.pending_count, 2)
            local personal_store = addressed.component_id({ kind = "user", id = recipient_id })
            local subscribes_personal_store = false
            for _, id in ipairs(listed.component_ids) do
                if id == personal_store then subscribes_personal_store = true end
            end
            test.is_true(subscribes_personal_store, "addressed personal store missing from invalidation targets")
            local current = assert(recipient_service:get({ component_id = listed.component_id }))
            test.eq(tonumber(current.meta.pending_count), 1)
            params.status, params.idempotency_key, params.title = "resolved", "api-close", nil
            local closed, close_err = sender:call("app:addressed_probe", { operation = "api_create", params = params })
            test.is_nil(close_err)
            test.is_true(closed.success)
            test.eq(read(recipient, created.item.id).status, "resolved")
        end)

        test.it("passes addressed upserts and lifecycle closure through the writable sink", function()
            local sender, service = frame("sink-sender-" .. uuid.v4())
            local recipient_id = "sink-recipient-" .. uuid.v4()
            local recipient = frame(recipient_id)
            upsert(recipient, { item_type = "notice", title = "Personal" })
            local request = { origin = "addressed-test", sink_op = "upsert", idempotency_key = "sink-create",
                config = { item_type = "addressed_review", source_id = source(service), aggregate_key = "review",
                    recipient = { kind = "user", id = recipient_id } }, input = { content = "Awaiting" } }
            local created, create_err = sender:call("kickside.inbox.sink:inbox_write", request)
            test.is_nil(create_err)
            test.is_true(created.success)
            test.not_nil(read(recipient, created.dest_ref.item_id), "sink drops recipient")
            request.idempotency_key = "sink-close"
            request.input = { status = "resolved" }
            local closed, close_err = sender:call("kickside.inbox.sink:inbox_write", request)
            test.is_nil(close_err)
            test.is_true(closed.success)
            test.eq(closed.dest_ref.item_id, created.dest_ref.item_id)
            test.eq(read(recipient, created.dest_ref.item_id).status, "resolved")
        end)
        test.it("sink deletion carries the legacy recipient owner across callers", function()
            local owner = "legacy-bob-" .. uuid.v4()
            local bob = frame(owner)
            local alice = frame("legacy-alice-" .. uuid.v4())
            upsert(bob, { id = "record-1", item_type = "addressed_review", title = "Bob's review" })
            upsert(alice, { id = "record-1", item_type = "notice", title = "Alice's notice" })
            local before = json.encode(read(alice, "record-1"))
            test.not_nil(read(bob, "record-1"))
            local request = { origin = "addressed-test", sink_op = "delete", identity_key = "record-1",
                idempotency_key = "delete-bob", config = { item_type = "addressed_review",
                    recipient = { kind = "user", id = owner } } }
            for _ = 1, 2 do
                local deleted, err = alice:call("kickside.inbox.sink:inbox_write", request)
                test.is_nil(err)
                test.is_true(deleted.success)
                test.eq(deleted.dest_ref.item_id, "record-1")
                test.is_nil(read(bob, "record-1"), "Bob's legacy review was not deleted")
                test.eq(json.encode(read(alice, "record-1")), before, "Alice's same-named notice changed")
            end
        end)
        test.it("sink upsert resolves the legacy recipient store across callers", function()
            local owner = "legacy-upsert-bob-" .. uuid.v4()
            local bob = frame(owner)
            local alice = frame("legacy-upsert-alice-" .. uuid.v4())
            upsert(bob, { id = "record-1", item_type = "addressed_review", title = "Bob's review" })
            upsert(alice, { id = "record-1", item_type = "notice", title = "Alice's notice" })
            local bob_before, alice_before = json.encode(read(bob, "record-1")), json.encode(read(alice, "record-1"))
            local params = { id = "record-1", item_type = "addressed_review", recipient = { kind = "user", id = owner } }
            local resolved, identity_err = alice:call("app:addressed_probe", { operation = "identity", params = params })
            test.is_nil(identity_err)
            test.eq(json.encode(resolved), (json.encode({ id = "record-1", owner_id = owner, params = params })))
            local result = assert(alice:call("kickside.inbox.sink:inbox_write", {
                origin = "addressed-test", identity_key = "record-1", idempotency_key = "acknowledge",
                config = { item_type = params.item_type, recipient = params.recipient }, input = { content = "Replacement" } }))
            test.is_true(result.success)
            test.eq(result.dest_ref.item_id, "record-1")
            test.eq(json.encode(read(bob, "record-1")), bob_before, "upsert reopened legacy history")
            test.eq(json.encode(read(alice, "record-1")), alice_before)
            test.is_nil(read(bob, addressed.item_id(params.item_type, params.id, params.recipient)))
        end)
        test.it("rearm resolves the legacy recipient store across callers with colliding ids", function()
            local owner = "legacy-arm-bob-" .. uuid.v4()
            local bob = frame(owner)
            local alice = frame("legacy-arm-alice-" .. uuid.v4())
            local signal = assert(bob:call("app:upgrade_signal", { state = "parked", assignee = owner }))
            local id = "workflow-decision:" .. signal.dataflow_id .. ":" .. signal.signal_id
            local params = { id = id, item_type = "flow_decision", recipient = { kind = "user", id = owner } }
            assert(bob:call("app:addressed_probe", { operation = "legacy_decision", params = {
                id = id, item_type = "flow_decision", title = "Bob's decision", actor_id = owner, created_at = os.time(),
                metadata = { dataflow_id = signal.dataflow_id, signal_id = signal.signal_id, assignee = owner } } }))
            upsert(alice, { id = id, item_type = "notice", title = "Alice's notice" })
            local bob_before, alice_before = json.encode(read(bob, id)), json.encode(read(alice, id))
            local resolved, identity_err = alice:call("app:addressed_probe", { operation = "identity", params = params })
            test.is_nil(identity_err)
            test.eq(json.encode(resolved), (json.encode({ id = id, owner_id = owner, params = params })))
            local armed = assert(alice:call("kickside.inbox:arm_decision", {
                dataflow_id = signal.dataflow_id, signal_id = signal.signal_id,
                config = { assignee = owner, prompt = "Rearmed" } }))
            test.eq(armed.id, id)
            test.eq(json.encode(read(bob, id)), bob_before)
            test.eq(json.encode(read(alice, id)), alice_before)
            test.is_nil(read(bob, addressed.item_id(params.item_type, id, params.recipient)))
        end)
        test.it("rejects a forged legacy owner and rechecks sender authorization on deletion", function()
            local owner = "legacy-auth-bob-" .. uuid.v4()
            local bob = frame(owner)
            local alice_id = "legacy-auth-alice-" .. uuid.v4()
            local alice = frame(alice_id)
            upsert(bob, { id = "record-1", item_type = "addressed_review", title = "Bob's review" })
            upsert(alice, { id = "record-1", item_type = "notice", title = "Alice's notice" })
            local bob_before, alice_before = json.encode(read(bob, "record-1")), json.encode(read(alice, "record-1"))
            local params = { id = "record-1", item_type = "addressed_review", recipient = { kind = "user", id = owner } }
            local resolved, identity_err = alice:call("app:addressed_probe", { operation = "identity", params = params })
            test.is_nil(identity_err)
            test.is_true(type(resolved) == "table", "resolved identity must name its store")
            resolved.owner_id = alice_id
            local forged, forged_err = alice:call("app:addressed_probe", { operation = "delete", identity = resolved })
            test.is_nil(forged)
            test.is_true(errors.is(forged_err, errors.INVALID))
            resolved.owner_id = owner
            local denied = frame(alice_id, true)
            local result, err = denied:call("app:addressed_probe", { operation = "delete", identity = resolved })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(json.encode(read(bob, "record-1")), bob_before)
            test.eq(json.encode(read(alice, "record-1")), alice_before)
        end)
        for _, kind in ipairs({ "user", "group" }) do
            test.it("authorized sink retraction names the private " .. kind .. " store across callers", function()
                local owner = "private-retract-bob-" .. uuid.v4()
                local bob = frame(owner)
                local alice = frame("private-retract-alice-" .. uuid.v4())
                local recipient = { kind = kind, id = kind == "user" and owner or "app:delete_team" }
                if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, recipient.id))) end
                local raw = owner .. ":record-1"
                upsert(alice, { id = raw, item_type = "notice", title = "Alice's notice" })
                local alice_before = json.encode(read(alice, raw))
                local request = { origin = "addressed-test", identity_key = raw, idempotency_key = raw .. ":create",
                    config = { item_type = "addressed_review", recipient = recipient }, input = { content = "Review" } }
                local created = assert(alice:call("kickside.inbox.sink:inbox_write", request))
                test.is_true(created.success)
                local id = addressed.item_id("addressed_review", raw, recipient)
                test.eq(created.dest_ref.item_id, id)
                test.not_nil(read(bob, id))
                local params = { id = raw, item_type = "addressed_review", recipient = recipient }
                local resolved, identity_err = alice:call("app:addressed_probe", { operation = "identity", params = params })
                test.is_nil(identity_err)
                request.sink_op, request.idempotency_key, request.input = "delete", raw .. ":delete", {}
                for _ = 1, 2 do
                    local deleted = assert(alice:call("kickside.inbox.sink:inbox_write", request))
                    test.is_true(deleted.success)
                    test.eq(deleted.dest_ref.item_id, id)
                    test.is_nil(read(bob, id), "retraction selected the sender's stores")
                    test.eq(json.encode(read(alice, raw)), alice_before)
                end
                test.eq(json.encode(resolved), (json.encode({ id = id, recipient = recipient, params = params })))
                if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, recipient.id))) end
            end)
        end
        test.it("sink delete uses the retained legacy identity acknowledged by upsert", function()
            local owner = "sink-legacy-" .. uuid.v4()
            local viewer = frame(owner)
            local legacy = upsert(viewer, { id = "record-1", item_type = "addressed_review", title = "Preupgrade" })
            test.not_nil(read(viewer, legacy.id))
            local request = { origin = "addressed-test", identity_key = legacy.id, idempotency_key = "create",
                config = { item_type = "addressed_review", recipient = { kind = "user", id = owner } },
                input = { content = "Delivery after upgrade" } }
            local created, create_err = viewer:call("kickside.inbox.sink:inbox_write", request)
            test.is_nil(create_err)
            test.is_true(created.success)
            test.eq(created.dest_ref.item_id, legacy.id)
            request.sink_op, request.idempotency_key, request.input = "delete", "delete", {}
            local deleted, delete_err = viewer:call("kickside.inbox.sink:inbox_write", request)
            test.is_nil(delete_err)
            test.is_true(deleted.success, "legacy delete: " .. tostring(deleted.error and deleted.error.message))
            test.eq(deleted.dest_ref.item_id, created.dest_ref.item_id)
            test.is_nil(read(viewer, legacy.id))
        end)

        test.it("sink delete uses the personal aggregate identity", function()
            local owner = "sink-personal-aggregate-" .. uuid.v4()
            local viewer, service = frame(owner)
            local personal = upsert(viewer, { id = "record-1", item_type = "notice", title = "Personal" })
            local request = { origin = "addressed-test", identity_key = "record-1", idempotency_key = "create",
                config = { source_id = source(service), aggregate_key = "review" }, input = { content = "Aggregate" } }
            local created, create_err = viewer:call("kickside.inbox.sink:inbox_write", request)
            test.is_nil(create_err)
            test.is_true(created.success, "created: " .. tostring(created.error and created.error.message))
            test.not_nil(read(viewer, created.dest_ref.item_id))
            request.sink_op, request.idempotency_key, request.input = "delete", "delete", {}
            local deleted, delete_err = viewer:call("kickside.inbox.sink:inbox_write", request)
            test.is_nil(delete_err)
            test.is_true(deleted.success, "deleted: " .. tostring(deleted.error and deleted.error.message))
            test.eq(deleted.dest_ref.item_id, created.dest_ref.item_id)
            test.is_nil(read(viewer, created.dest_ref.item_id))
            test.not_nil(read(viewer, personal.id))
        end)

        for _, kind in ipairs({ "user", "group" }) do
            for _, aggregate in ipairs({ false, true }) do
                test.it("sink delete preserves personal and other-type items for a " .. kind .. (aggregate and " aggregate" or " record"), function()
                    local owner = "sink-delete-" .. uuid.v4()
                    local viewer, service = frame(owner)
                    local recipient = { kind = kind, id = kind == "user" and owner or "app:addressed_team" }
                    if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, recipient.id))) end
                    local personal = upsert(viewer, { id = "record-1", item_type = "notice", title = "Personal" })
                    local fields = { item_type = "addressed_review", recipient = recipient, content = "Review" }
                    if aggregate then
                        fields.source_id, fields.aggregate_key = source(service), "review"
                    end
                    local request = { origin = "addressed-test", identity_key = "record-1", idempotency_key = "create",
                        config = kind == "user" and fields or {}, input = kind == "group" and fields or {} }
                    local created, create_err = viewer:call("kickside.inbox.sink:inbox_write", request)
                    test.is_nil(create_err)
                    test.is_true(created.success, "created: " .. tostring(created.error and created.error.message))
                    test.not_nil(read(viewer, created.dest_ref.item_id))
                    fields.item_type = "other_addressed_review"
                    request.idempotency_key = "other-create"
                    local other, other_err = viewer:call("kickside.inbox.sink:inbox_write", request)
                    test.is_nil(other_err)
                    test.is_true(other.success, "other: " .. tostring(other.error and other.error.message))
                    test.not_nil(read(viewer, other.dest_ref.item_id))
                    fields.item_type = "addressed_review"
                    fields.content = nil
                    request.sink_op, request.idempotency_key = "delete", owner .. ":delete"
                    local deleted, delete_err = viewer:call("kickside.inbox.sink:inbox_write", request)
                    test.is_nil(delete_err)
                    test.is_true(deleted.success, "deleted: " .. tostring(deleted.error and deleted.error.message))
                    test.eq(deleted.dest_ref.item_id, created.dest_ref.item_id)
                    test.is_nil(read(viewer, created.dest_ref.item_id), "addressed review must be removed")
                    test.not_nil(read(viewer, personal.id), "same-named personal notice must survive")
                    test.not_nil(read(viewer, other.dest_ref.item_id), "other canonical type must survive")
                    local retry, retry_err = viewer:call("kickside.inbox.sink:inbox_write", request)
                    test.is_nil(retry_err)
                    test.is_true(retry.success, "retry: " .. tostring(retry.error and retry.error.message))
                    if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, recipient.id))) end
                end)
            end
            test.it("sink delete leaves other items unchanged for an absent addressed " .. kind .. " item", function()
                local owner = "sink-absent-" .. uuid.v4()
                local viewer = frame(owner)
                local personal = upsert(viewer, { id = "absent", item_type = "notice", title = "Personal" })
                local recipient = { kind = kind, id = kind == "user" and owner or "app:addressed_team" }
                if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, recipient.id))) end
                local other = upsert(viewer, { id = "absent", item_type = "other_addressed_review", recipient = recipient, title = "Other type" })
                local personal_before = json.encode(read(viewer, personal.id))
                local other_before = json.encode(read(viewer, other.id))
                local id = addressed.item_id("addressed_review", "absent", recipient)
                local missing, missing_err = viewer:call("app:addressed_probe", { operation = "delete", id = id })
                test.is_nil(missing)
                test.is_true(errors.is(missing_err, errors.NOT_FOUND), "writer keeps its own NOT_FOUND contract")
                test.eq(assert(viewer:call("app:addressed_probe", { operation = "api_delete", id = id })).status, 404)
                local result, err = viewer:call("kickside.inbox.sink:inbox_write", {
                    origin = "addressed-test", sink_op = "delete", identity_key = "absent", idempotency_key = "delete-absent",
                    config = { item_type = "addressed_review", recipient = recipient }, input = {} })
                test.is_nil(err)
                test.is_true(result.success)
                test.eq(result.result, "deleted")
                test.eq(result.dest_ref.item_id, id)
                test.eq(result.dest_refs.default.dest_ref.item_id, id)
                test.is_nil(read(viewer, id))
                test.eq(json.encode(read(viewer, personal.id)), personal_before)
                test.eq(json.encode(read(viewer, other.id)), other_before)
                if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, recipient.id))) end
            end)
            test.it("sink redelivered retraction after resolution returns deleted for a " .. kind .. " item", function()
                local owner = "sink-resolved-" .. uuid.v4()
                local viewer = frame(owner)
                local recipient = { kind = kind, id = kind == "user" and owner or "app:addressed_team" }
                if kind == "group" then test.not_nil((user_groups.assign_user_to_group(owner, recipient.id))) end
                local raw = owner .. ":record-1"
                local personal = upsert(viewer, { id = raw, item_type = "notice", title = "Personal" })
                local personal_before = json.encode(read(viewer, personal.id))
                local request = { origin = "addressed-test", identity_key = raw, idempotency_key = owner .. ":create",
                    config = { item_type = "addressed_review", recipient = recipient }, input = { content = "Review" } }
                local created = assert(viewer:call("kickside.inbox.sink:inbox_write", request))
                test.is_true(created.success)
                test.not_nil(read(viewer, created.dest_ref.item_id))
                local resolved = assert(viewer:call("app:addressed_probe", { operation = "resolve", id = created.dest_ref.item_id }))
                test.eq(resolved.status, "dismissed")
                test.eq(read(viewer, created.dest_ref.item_id).status, "dismissed")
                -- Purge the resolved history before Sync redelivers its retraction.
                test.eq(assert(viewer:call("app:addressed_probe", { operation = "api_delete", id = created.dest_ref.item_id })).status, 200)
                test.is_nil(read(viewer, created.dest_ref.item_id))
                request.sink_op, request.idempotency_key, request.input = "delete", owner .. ":retract", {}
                for _ = 1, 2 do
                    local retracted, retract_err = viewer:call("kickside.inbox.sink:inbox_write", request)
                    test.is_nil(retract_err)
                    test.is_true(retracted.success, "retraction: " .. tostring(retracted.error and retracted.error.message))
                    test.eq(retracted.result, "deleted")
                    test.eq(retracted.dest_ref.item_id, created.dest_ref.item_id)
                    test.eq(retracted.dest_refs.default.dest_ref.item_id, created.dest_ref.item_id)
                    test.is_nil(read(viewer, created.dest_ref.item_id))
                    test.eq(json.encode(read(viewer, personal.id)), personal_before)
                end
                if kind == "group" then test.not_nil((user_groups.remove_user_from_group(owner, recipient.id))) end
            end)
        end

        test.it("pages current group members through the public contract without loading the whole group", function()
            local group = "app:notification_page_team"
            local ids = { "page-a-" .. uuid.v4(), "page-b-" .. uuid.v4(), "page-c-" .. uuid.v4() }
            for _, id in ipairs(ids) do
                identity.ensure_user(id)
                test.not_nil((user_groups.assign_user_to_group(id, group)))
            end
            local members = assert(assert(contract.get("kickside.contract:group_members")):open())
            local first, first_err = members:members({ group_id = group, limit = 2 })
            test.is_nil(first_err)
            test.eq(#first.user_ids, 2, "directory paging must bound the membership query")
            test.eq(first.user_ids[1], ids[1])
            test.eq(first.user_ids[2], ids[2])
            test.not_nil(first.next_cursor)
            test.not_nil((user_groups.remove_user_from_group(ids[2], group)))
            local second, second_err = members:members({ group_id = group, limit = 2, cursor = first.next_cursor })
            test.is_nil(second_err)
            test.eq(#second.user_ids, 1)
            test.eq(second.user_ids[1], ids[3], "membership changes must not shift an offset continuation")
            test.is_nil(second.next_cursor)
            for _, id in ipairs(ids) do test.not_nil((user_groups.remove_user_from_group(id, group))) end
        end)
        test.it("persists a real Jobs continuation for a group larger than one notification window", function()
            local group = "app:notification_window_team"
            local prefix = "window-" .. uuid.v4() .. "-"
            local sender, service = frame("window-sender-" .. uuid.v4())
            local first = frame(prefix .. "001", false, { "app:user", group })
            for i = 1, 129 do
                local id = prefix .. string.format("%03d", i)
                identity.ensure_user(id)
                test.not_nil((user_groups.assign_user_to_group(id, group)))
            end
            local item = upsert(sender, { recipient = { kind = "group", id = group }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "window", title = "Private window", idempotency_key = "window" })
            test.not_nil(read(first, item.id :: string))
            test.eq(#await_notifications(prefix .. "001", 1), 1, "initial first member")
            test.eq(#await_notifications(prefix .. "128", 1), 1, "initial window end")
            local rows = {}
            for _ = 1, 100 do
                local db = assert(sql.get("app:db"))
                rows = assert(db:query("SELECT id, payload FROM kickside_job WHERE job_type=$1 AND thread_id=$2",
                    { "kickside.inbox.persist:notify_addressed_job", addressed.component_id({ kind = "group", id = group }) }))
                db:release()
                if #rows > 0 then break end
                time.sleep("50ms")
            end
            test.eq(#rows, 1, "continuation must use the existing Jobs store")
            local payload = assert(json.decode(rows[1].payload))
            test.eq(payload.cursor, prefix .. "128")
            test.is_nil(payload.content)
            local completed
            for _ = 1, 100 do
                completed = assert(jobs.get_job(rows[1].id :: string))
                if completed.status == "done" then break end
                time.sleep("50ms")
            end
            test.eq(completed.status, "done", "Jobs continuation failed: " .. tostring(completed.last_error))
            test.eq(#await_notifications(prefix .. "129", 1), 1, "continued last member")
            test.eq(#await_notifications(prefix .. "001", 1), 1, "continuation must not repeat the first window")
            for i = 1, 129 do
                test.not_nil((user_groups.remove_user_from_group(prefix .. string.format("%03d", i), group)))
            end
        end)
        test.it("notifies only current group members after the addressed projection commits", function()
            local group = "app:notification_team"
            local sender, service = frame("notify-group-sender-" .. uuid.v4())
            local current_id, departed_id = "notify-member-" .. uuid.v4(), "notify-departed-" .. uuid.v4()
            local current = frame(current_id, false, { "app:user", group })
            frame(departed_id, false, { "app:user", group })
            test.not_nil((user_groups.assign_user_to_group(current_id, group)))
            test.not_nil((user_groups.assign_user_to_group(departed_id, group)))
            test.not_nil((user_groups.remove_user_from_group(departed_id, group)))
            local item = upsert(sender, { recipient = { kind = "group", id = group }, item_type = "addressed_review",
                source_id = source(service), aggregate_key = "group", title = "Private group title", idempotency_key = "first" })
            read(current, item.id :: string)
            test.eq(#await_notifications(current_id, 1), 1)
            test.eq(#notifications(departed_id), 0)
            local _, resolve_err = current:call("app:addressed_probe", { operation = "resolve", id = item.id })
            test.is_nil(resolve_err)
            read(current, item.id :: string)
            test.eq(#await_notifications(current_id, 2), 2, "group resolution must invalidate the current members")
            test.eq(#notifications(departed_id), 0)
            test.not_nil((user_groups.remove_user_from_group(current_id, group)))
        end)

    end)
end) }
