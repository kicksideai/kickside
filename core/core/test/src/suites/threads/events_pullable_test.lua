-- Thread events as a pullable source (CONTRACTS events_pullable): integer
-- cursor paging with stable event-id keys, the type filter, READ gating, and
-- source_gap exactly when the cursor is below the prune boundary. Runs on
-- SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local expr = require("expr")

local THREADS = "kickside.core:threads"
local PULL = "kickside.core.threads:events_pullable"

local function define_tests()
    test.describe("Thread events pullable", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "ep-owner-" .. suffix
        local stranger = "ep-stranger-" .. suffix

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function actor(user_id)
            return security.new_actor(user_id, { security_groups = {} })
        end

        local function open_threads(user_id)
            local svc, cerr = contract.get(THREADS)
            if cerr or not svc then error("threads contract unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor(user_id)):with_scope(test_scope()):open()
            if oerr or not inst then error("open threads contract failed: " .. tostring(oerr)) end
            return inst
        end

        local function pull_as(user_id, request)
            local result, err = funcs.new():with_actor(actor(user_id)):with_scope(test_scope()):call(PULL, request)
            if err then error("pull failed: " .. tostring(err)) end
            return result
        end

        local function publish_as_owner(thread_id, event)
            return funcs.new():with_actor(actor(owner)):with_scope(test_scope()):call("app:test_output_publisher", {
                thread_id = thread_id, event = event,
            })
        end

        local function thread_with(events)
            local created, err = open_threads(owner):create({ thread_class = "ep_" .. suffix,
                impl_id = "app:threads_test_event_kind" })
            if err then error("create failed: " .. tostring(err)) end
            if #events > 0 then
                for _, event in ipairs(events) do
                    if event.role == nil then event.role = "system" end
                    local _, append_err = publish_as_owner(created.thread_id, event)
                    if append_err then error("append failed: " .. tostring(append_err)) end
                end
            end
            return created.thread_id
        end

        local function request(thread_id, cursor, limit, event_type)
            return { config = { thread_id = thread_id, event_type = event_type }, cursor = cursor, limit = limit,
                idempotency_key = "pull-" .. tostring(cursor) }
        end

        test.it("evaluates declared body fields directly on the pulled payload", function()
            local thread_id = thread_with({ { type = "app:threads_note", body = { n = 41 } } })
            local page = pull_as(owner, request(thread_id, 0, 1))
            local result, err = expr.eval("payload.n + 1", { payload = page.items[1].payload })
            test.is_nil(err, tostring(err))
            test.eq(result, 42)
            test.eq(page.items[1].payload.n, 41)
            test.eq(page.items[1].event_type, "app:threads_note")
            test.eq(page.items[1].role, "system")
        end)

        test.it("pages from the cursor with stable event-id keys", function()
            local thread_id = thread_with({
                { type = "app:threads_note", body = { n = 1 } },
                { type = "app:threads_note", body = { n = 2 } },
                { type = "app:threads_note", body = { n = 3 }, external = { external_source = "crm", external_id = "r-1" } },
            })
            local first = pull_as(owner, request(thread_id, 0, 2))
            test.is_true(first.success)
            test.eq(#first.items, 2)
            test.eq(first.items[1].seq, 1)
            test.eq(first.items[2].seq, 2)
            test.eq(first.next_cursor, 2)
            test.is_true(first.has_more)
            test.eq(first.items[1].item_key, first.items[1].dedup_key)
            test.eq(first.items[1].op, "upsert")
            test.eq(first.items[1].event_type, "app:threads_note")
            test.eq(first.items[1].payload.n, 1)
            test.not_nil(string.match(first.items[1].occurred_at, "^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%dZ$"))
            test.is_nil(first.source_gap)

            local replay = pull_as(owner, request(thread_id, 0, 2))
            test.eq(replay.items[1].item_key, first.items[1].item_key)

            local rest = pull_as(owner, request(thread_id, first.next_cursor, 2))
            test.eq(#rest.items, 1)
            test.eq(rest.items[1].seq, 3)
            test.eq(rest.items[1].external_identity.id, "r-1")
            test.eq(rest.next_cursor, 3)
            test.is_false(rest.has_more)

            local idle = pull_as(owner, request(thread_id, 3, 2))
            test.eq(#idle.items, 0)
            test.eq(idle.next_cursor, 3)
            test.is_false(idle.has_more)
        end)

        test.it("filters by event type", function()
            local thread_id = thread_with({
                { type = "app:threads_keep", role = "user", body = {} },
                { type = "app:threads_skip", role = "user", body = {} },
                { type = "app:threads_keep", role = "user", body = {} },
            })
            local page = pull_as(owner, request(thread_id, 0, 10, "app:threads_keep"))
            test.eq(#page.items, 2)
            test.eq(page.items[1].seq, 1)
            test.eq(page.items[2].seq, 3)
            test.eq(page.next_cursor, 3)
        end)

        test.it("reports source_gap exactly when the cursor is below the prune boundary", function()
            local thread_id = thread_with({
                { type = "app:threads_note", body = {} }, { type = "app:threads_note", body = {} },
                { type = "app:threads_note", body = {} }, { type = "app:threads_note", body = {} },
            })
            local db, db_err = sql.get("app:db")
            if db_err then error(tostring(db_err)) end
            db:execute("DELETE FROM kickside_event WHERE thread_id = $1 AND seq <= 2", { thread_id })
            db:execute("UPDATE kickside_thread SET max_pruned_seq = 2 WHERE id = $1", { thread_id })
            db:release()

            local gap = pull_as(owner, request(thread_id, 1, 10))
            test.is_true(gap.success)
            test.eq(#gap.items, 0)
            test.eq(gap.next_cursor, 1)
            test.is_false(gap.has_more)
            test.eq(gap.source_gap.max_pruned_seq, 2)
            test.eq(gap.source_gap.earliest_seq, 3)

            local at_boundary = pull_as(owner, request(thread_id, 2, 10))
            test.is_nil(at_boundary.source_gap)
            test.eq(#at_boundary.items, 2)
            test.eq(at_boundary.items[1].seq, 3)
        end)

        test.it("answers typed data errors for bad requests and denied reads", function()
            local thread_id = thread_with({ { type = "app:threads_note", body = {} } })
            local denied = pull_as(stranger, request(thread_id, 0, 10))
            test.is_false(denied.success)
            test.eq(denied.error.code, "permission_denied")

            local missing = pull_as(owner, request(uuid.v7(), 0, 10))
            test.is_false(missing.success)
            test.eq(missing.error.code, "not_found")

            local bad_cursor = pull_as(owner, { config = { thread_id = thread_id }, cursor = -1, limit = 1, idempotency_key = "k" })
            test.eq(bad_cursor.error.code, "invalid_request")
            local bad_config = pull_as(owner, { config = {}, cursor = 0, limit = 1, idempotency_key = "k" })
            test.eq(bad_config.error.code, "invalid_config")
        end)
    end)
end

return test.run_cases(define_tests)
