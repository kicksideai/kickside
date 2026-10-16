local test = require("test")
local owner_hooks = require("owner_hooks")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local threads_writer = require("threads_writer")
local retention_repo = require("retention_repo")
local runner = require("retention_runner")
local sweeper = require("sweeper")
local pin = require("pin")
local receipts = require("write_receipt")
local retention_policy = require("retention_policy")

local function stamp(db: sql.DB, instant: any): string
    local dbtype = tostring(db:type())
    if dbtype == sql.type.SQLITE then
        return instant:utc():format("2006-01-02 15:04:05.000000")
    end
    return instant:utc():format(time.RFC3339)
end

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = id, thread_class = "retention_service_test", component_id = "",
            event_count = 0 })
        :run_with(db):exec()
    if err then error("retention service thread insert failed: " .. tostring(err)) end
    return id
end

local function add_event(db: sql.DB, thread_id: string, created_at: string): ()
    local result, err = threads_writer.ingest_events_batch(db, thread_id, {
        system = true,
        events = { { type = "retention.service.test", body_json = "{}", created_at = created_at } },
    })
    if err or not result then error("retention service event append failed: " .. tostring(err)) end
end

local function count_events(db: sql.DB, thread_id: string): integer
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1", { thread_id })
    if err or type(rows) ~= "table" then error("retention service event count failed: " .. tostring(err)) end
    return tonumber((rows :: table[])[1].n) :: integer
end

local function earlier_deadline(first: integer?, second: integer): integer
    return first == nil and second or math.min(first :: integer, second)
end

local function reserve_receipt(db: sql.DB, sink_id: string, key: string): ()
    local tx, begin_err = db:begin()
    if begin_err or not tx then error("receipt reservation transaction failed: " .. tostring(begin_err)) end
    local _, reserve_err = receipts.reserve(tx :: sql.Transaction, {
        sink_id = sink_id,
        idempotency_key = key,
        identity_key = "service-test:" .. key,
        payload_hash = "service-test-hash",
        created_at = stamp(db, time.now()),
        owner_locator = { kind = "service-test", id = sink_id },
    })
    if reserve_err then tx:rollback(); error("receipt reservation failed: " .. tostring(reserve_err)) end
    local _, commit_err = tx:commit()
    if commit_err then error("receipt reservation commit failed: " .. tostring(commit_err)) end
end

local function define_tests()
    test.describe("Core retention service runner", function()
        test.it("keeps recent event heads inside Postgres storage during a recovery pass", function()
            local db = assert(sql.get("app:db"))
            local recent: { [string]: boolean } = {}
            for index = 1, 3 do
                local id = make_thread(db)
                add_event(db, id, stamp(db, time.now():add(index * time.HOUR)))
                local rows, read_err = db:query("SELECT created_at FROM kickside_event WHERE thread_id=$1", { id })
                test.is_nil(read_err)
                recent[tostring(rows[1].created_at)] = true
            end
            local original_deadline = sweeper.deadline_ms
            local event_parses = 0
            sweeper.deadline_ms = function(stored, window, dialect)
                if recent[stored] then event_parses = event_parses + 1 end
                return original_deadline(stored, window, dialect)
            end
            local result, run_err = sweeper.run(db)
            sweeper.deadline_ms = original_deadline
            local dialect = tostring(db:type())
            db:release()
            test.is_nil(run_err)
            test.not_nil(result)
            if dialect == sql.type.POSTGRES then
                test.eq(event_parses, 0, "recent timestamp heads must be filtered in storage")
            else
                test.eq(event_parses, 3, "SQLite validates every recent fixture text timestamp")
            end
        end)

        test.it("coalesces unscoped durable changes into one recovery and preserves scoped owner requests", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error("retention database is absent") end
            local original_sweep, original_owners, original_deadline = sweeper.run, owner_hooks.run, sweeper.next_deadline_ms
            local sweeps, deadlines = 0, 0
            local requests: table[] = {}
            sweeper.run = function(handle)
                sweeps = sweeps + 1
                return original_sweep(handle)
            end
            sweeper.next_deadline_ms = function(handle)
                deadlines = deadlines + 1
                return original_deadline(handle)
            end
            owner_hooks.run = function(change)
                requests[#requests + 1] = { change = change }
                return original_owners(change)
            end
            local ok, failure = pcall(function()
                local changes: table[] = {}
                for index = 1, 50 do changes[#changes + 1] = { kind = "events_appended", thread_id = "thread-" .. tostring(index) } end
                local pass, pass_err = runner.on_wakes(db, "retention-test", changes)
                test.is_nil(pass_err)
                test.not_nil(pass)
                test.eq(sweeps, 1)
                test.eq(deadlines, 1)
                test.eq(#requests, 1)
                test.is_nil(requests[1].change)
                local scoped = { kind = "lease_released", owner_locator = { kind = "component", id = "scope" } }
                local next_pass, next_err = runner.on_wakes(db, "retention-test", { scoped })
                test.is_nil(next_err)
                test.not_nil(next_pass)
                test.eq(sweeps, 2)
                test.eq(deadlines, 2)
                test.eq(requests[2].change.owner_locator.id, "scope")
            end)
            sweeper.run, owner_hooks.run, sweeper.next_deadline_ms = original_sweep, original_owners, original_deadline
            db:release()
            if not ok then error(failure) end
        end)

        test.it("wakes from an empty snapshot and arms the new event's exact stored deadline", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local _db = db :: sql.DB
            local thread_id = make_thread(_db)
            local _, policy_err = retention_repo.upsert(_db, thread_id, {
                event_hot_retention_days = 1, archive_mode = "tombstone_only", enabled = true,
            })
            test.is_nil(policy_err)

            local _, idle_err = runner.recover(_db, "retention-test")
            test.is_nil(idle_err)

            local created_at = stamp(_db, time.now())
            add_event(_db, thread_id, created_at)
            local wake, wake_err = runner.on_wake(_db, "retention-test", { kind = "events_appended" })
            test.is_nil(wake_err)
            local expected, expected_err = sweeper.deadline_ms(created_at, 86400000, tostring(_db:type()))
            test.is_nil(expected_err)
            local current, current_err = sweeper.next_deadline_ms(_db)
            test.is_nil(current_err)
            test.not_nil(current)
            test.eq((wake :: table).deadline_ms, current,
                "the service must arm the earliest exact deadline returned by Core storage")
            test.is_true((current :: integer) <= (expected :: integer),
                "the event's own deadline must be included in the service's exact deadline set")
            test.eq(count_events(_db, thread_id), 1)
            _db:release()
        end)

        test.it("boot recovery prunes an eligible row left durable across a service restart", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local _db = db :: sql.DB
            local thread_id = make_thread(_db)
            local _, policy_err = retention_repo.upsert(_db, thread_id, {
                event_hot_retention_days = 1, archive_mode = "tombstone_only", enabled = true,
            })
            test.is_nil(policy_err)
            add_event(_db, thread_id, stamp(_db, time.now():add(-2 * 24 * time.HOUR)))
            test.eq(count_events(_db, thread_id), 1)

            local recovered, recover_err = runner.recover(_db, "retention-restarted")
            test.is_nil(recover_err)
            test.is_true(((recovered :: table).stats :: table).events >= 1)
            test.eq(count_events(_db, thread_id), 0)
            _db:release()
        end)

        test.it("a pin release wake rechecks a previously blocked eligible head", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local _db = db :: sql.DB
            local thread_id = make_thread(_db)
            local _, policy_err = retention_repo.upsert(_db, thread_id, {
                event_hot_retention_days = 1, archive_mode = "tombstone_only", enabled = true,
            })
            test.is_nil(policy_err)
            local protected, protect_err = pin.pin_lower(_db, {
                thread_id = thread_id, consumer_key = "service-test", command_id = "pin-service-test",
                command_generation = 1, target_cursor = 0,
            })
            test.is_nil(protect_err)
            test.not_nil(protected)
            local baseline_deadline, baseline_err = sweeper.next_deadline_ms(_db)
            test.is_nil(baseline_err)
            add_event(_db, thread_id, stamp(_db, time.now():add(-2 * 24 * time.HOUR)))
            local blocked_deadline, blocked_deadline_err = sweeper.next_deadline_ms(_db)
            test.is_nil(blocked_deadline_err)
            test.eq(blocked_deadline, baseline_deadline,
                "a pinned head adds no timer before its owner releases the pin")
            local blocked, recover_err = runner.recover(_db, "retention-pin-test")
            test.is_nil(recover_err)
            test.not_nil(blocked)
            test.eq(count_events(_db, thread_id), 1)

            local released, release_err = pin.pin_release(_db, {
                thread_id = thread_id, consumer_key = "service-test", expected_pin_generation = 1,
                terminal_op_id = "release-service-test",
            })
            test.is_nil(release_err)
            test.not_nil(released)
            local awakened, wake_err = runner.on_wake(_db, "retention-pin-test", { kind = "pin_released" })
            test.is_nil(wake_err)
            test.is_true(((awakened :: table).stats :: table).events >= 1)
            test.eq(count_events(_db, thread_id), 0)
            _db:release()
        end)

        test.it("a cursor-advance wake rechecks a previously blocked eligible head", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local _db = db :: sql.DB
            local thread_id = make_thread(_db)
            local _, policy_err = retention_repo.upsert(_db, thread_id, {
                event_hot_retention_days = 1, archive_mode = "tombstone_only", enabled = true,
            })
            test.is_nil(policy_err)
            local event_at = stamp(_db, time.now():add(-2 * 24 * time.HOUR))
            local baseline_deadline, baseline_err = sweeper.next_deadline_ms(_db)
            test.is_nil(baseline_err)
            add_event(_db, thread_id, event_at)
            local projection_id, cursor_id = uuid.v7(), uuid.v7()
            local _, projection_err = sql.builder.insert("kickside_projection")
                :set_map({ id = projection_id, thread_id = thread_id, kind = "service_test",
                    projection_key = "cursor-wake", last_event_seq = 0 })
                :run_with(_db):exec()
            test.is_nil(projection_err)
            local _, cursor_err = sql.builder.insert("kickside_projection_cursor")
                :set_map({ id = cursor_id, projection_id = projection_id, thread_id = thread_id,
                    last_seq = 0, status = "active" })
                :run_with(_db):exec()
            test.is_nil(cursor_err)

            local blocked_deadline, blocked_deadline_err = sweeper.next_deadline_ms(_db)
            test.is_nil(blocked_deadline_err)
            test.eq(blocked_deadline, baseline_deadline,
                "an active cursor below the event head adds no timer until it advances")
            local blocked, recover_err = runner.recover(_db, "retention-cursor-test")
            test.is_nil(recover_err)
            test.not_nil(blocked)
            test.eq(count_events(_db, thread_id), 1)

            local _, advance_err = _db:execute("UPDATE kickside_projection_cursor SET last_seq=1 WHERE id=$1", { cursor_id })
            test.is_nil(advance_err)
            local awakened, wake_err = runner.on_wake(_db, "retention-cursor-test", { kind = "projection_cursor_advanced" })
            test.is_nil(wake_err)
            test.is_true(((awakened :: table).stats :: table).events >= 1)
            test.eq(count_events(_db, thread_id), 0)
            _db:release()
        end)

        test.it("a committed receipt resolution wake arms its stored purge deadline", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local _db = db :: sql.DB
            local sink_id = "retention-service:" .. uuid.v7()
            local key = "receipt-resolution"
            local recovered, recover_err = runner.recover(_db, "retention-receipt-test")
            test.is_nil(recover_err)
            test.not_nil(recovered)
            reserve_receipt(_db, sink_id, key)

            local completed_at = stamp(_db, time.now())
            local settled, settle_err = receipts.resolve_pending({
                sink_id = sink_id,
                idempotency_key = key,
                config = { service_test = true },
                reconcile_binding = {
                    lookup = function(_request: table): (table, error?)
                        return { state = "settled_committed", dest_refs = {}, outcome = {} }, nil
                    end,
                },
                completed_at = completed_at,
            })
            test.is_nil(settle_err)
            test.eq((settled :: table).state, "committed")

            local policy, policy_err = retention_policy.policy()
            test.is_nil(policy_err)
            local row_deadline, row_deadline_err = sweeper.deadline_ms(completed_at,
                (policy :: table).receipts_orphan_ms, tostring(_db:type()))
            test.is_nil(row_deadline_err)
            local awakened, wake_err = runner.on_wake(_db, "retention-receipt-test", { kind = "receipt_resolution" })
            test.is_nil(wake_err)
            local armed = (awakened :: table).deadline_ms
            test.not_nil(armed, "receipt settlement must leave a known deadline armed")
            test.is_true((armed :: integer) <= (row_deadline :: integer),
                "the next service deadline must not skip the committed receipt's exact deadline")
            _db:release()
        end)

        test.it("a per-thread policy change wake recomputes the event deadline", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local _db = db :: sql.DB
            local thread_id = make_thread(_db)
            local _, policy_err = retention_repo.upsert(_db, thread_id, {
                event_hot_retention_days = 1, archive_mode = "tombstone_only", enabled = true,
            })
            test.is_nil(policy_err)
            local created_at = stamp(_db, time.now())
            add_event(_db, thread_id, created_at)
            local baseline, baseline_err = sweeper.next_deadline_ms(_db)
            test.is_nil(baseline_err)

            local _, update_err = retention_repo.upsert(_db, thread_id, {
                event_hot_retention_days = 2, archive_mode = "tombstone_only", enabled = true,
            })
            test.is_nil(update_err)
            local row_deadline, row_deadline_err = sweeper.deadline_ms(created_at, 2 * 86400000,
                tostring(_db:type()))
            test.is_nil(row_deadline_err)
            local expected = earlier_deadline(baseline, row_deadline :: integer)
            local awakened, wake_err = runner.on_wake(_db, "retention-policy-test", { kind = "thread_policy_changed" })
            test.is_nil(wake_err)
            test.eq((awakened :: table).deadline_ms, expected,
                "a committed thread policy change must replace the previous deadline")
            _db:release()
        end)
    end)
end

return test.run_cases(define_tests)
