-- The batched thread append (CONTRACTS threads.append_tx): one transaction
-- sequences a batch after the thread head, answers each event with its id and
-- sequence, deduplicates on the external identity inside the batch and against
-- the log, refuses a sequence the prune boundary has already covered, and
-- reports the wake demand generation its insert published.
-- Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local append = require("append")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("append test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

local function query(statement: string, params: { any }): { table }
    local db = open_db()
    local rows, err = db:query(statement, params)
    db:release()
    if err then error(tostring(err)) end
    return rows :: { table }
end

local function exec(statement: string, params: { any }): ()
    local db = open_db()
    local _, err = db:execute(statement, params)
    db:release()
    if err then error(tostring(err)) end
end

local function make_thread(): string
    local id = uuid.v7()
    exec("INSERT INTO kickside_thread (id, thread_class, component_id, event_count) VALUES ($1, $2, $3, 0)",
        { id, "append_test", id })
    return id
end

-- Run fn(tx) and commit on success, roll back on error.
local function in_tx(fn: (sql.Transaction) -> (any?, error?)): (any?, error?)
    local db = open_db()
    local tx = db:begin()
    local result, err = fn(tx :: sql.Transaction)
    if err then tx:rollback() else tx:commit() end
    db:release()
    return result, err
end

local function head_of(thread_id: string): integer
    return math.floor(tonumber(query("SELECT event_count FROM kickside_thread WHERE id = $1", { thread_id })[1].event_count) :: number)
end

local function define_tests()
    test.describe("Threads append_tx", function()
        test.it("refuses malformed metadata without committing any part of a batch", function()
            local thread_id = make_thread()
            for _, event in ipairs({
                {external = {external_source = "source", external_id = 17}},
                {content = {content_bytes = "unknown"}},
                {content = {content_type = false}},
            }) do
                local result, err = in_tx(function(tx)
                    return append.append_events_tx(tx, thread_id, {{subject = "valid"}, event})
                end)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(head_of(thread_id), 0)
                test.eq(#query("SELECT id FROM kickside_event WHERE thread_id=$1", {thread_id}), 0)
            end
        end)
        test.it("retains native trace refusals before writing an event", function()
            local thread_id = make_thread()
            local result, err = in_tx(function(tx)
                return append.append_events_tx(tx, thread_id,
                    { { type = "test.trace", trace_context = { run_id = "only-run" } } })
            end)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.is_false(err:retryable())
            test.eq(err:details().code, "trace_context_trace_id_required")
            test.eq(head_of(thread_id), 0)
        end)
        test.it("reuses a caller-locked thread snapshot while retaining event deduplication", function()
            local thread_id = make_thread()
            local first, first_err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = { { event_type = "test.snapshot" } } })
            end)
            test.is_nil(first_err)
            local db = open_db()
            local tx = assert(db:begin())
            local suffix = tostring(tx:db_type()) == sql.type.POSTGRES and " FOR UPDATE" or ""
            local rows, lock_err = tx:query("SELECT id,event_count,max_pruned_seq,deleting_at FROM kickside_thread WHERE id=$1" .. suffix, { thread_id })
            test.is_nil(lock_err)
            local reads = 0
            local probe: sql.Transaction = {
                query = function(_, statement: string, ...) reads = reads + 1; return tx:query(statement, ...) end,
                execute = function(_, statement: string, ...) return tx:execute(statement, ...) end,
                prepare = function(_, statement: string) return tx:prepare(statement) end,
                savepoint = function(_, name: string) return tx:savepoint(name) end,
                rollback_to = function(_, name: string) return tx:rollback_to(name) end,
                release = function(_, name: string) return tx:release(name) end,
                db_type = function() return tx:db_type() end,
                commit = function() return tx:commit() end,
                rollback = function(_, name: string?) return tx:rollback(name) end,
            }
            local retried, retry_err = append.append_events_tx(probe, thread_id,
                { { id = first.events[1].event_id, type = "test.snapshot" } }, { locked_thread = rows[1] })
            tx:rollback()
            db:release()
            test.is_nil(retry_err)
            test.eq(retried.inserted, 0)
            test.eq(retried.duplicates, 1)
            test.eq(retried.max_seq, 1)
            test.eq(reads, 1)
        end)

        test.it("sequences a batch after the head and answers each event's id and sequence", function()
            local thread_id = make_thread()
            local result, err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = {
                    { event_type = "test.one", payload = { n = 1 } },
                    { event_type = "test.two", payload = { n = 2 }, occurred_at = "2026-09-01T10:00:00Z" },
                } })
            end)
            test.is_nil(err)
            test.eq(#result.events, 2)
            test.eq(result.events[1].seq, 1)
            test.eq(result.events[2].seq, 2)
            test.eq(head_of(thread_id), 2)

            local rows = query("SELECT id, type, body, seq FROM kickside_event WHERE thread_id = $1 ORDER BY seq", { thread_id })
            test.eq(#rows, 2)
            test.eq(rows[1].id, result.events[1].event_id)
            test.eq(rows[2].type, "test.two")
            local body = json.decode(tostring(rows[1].body))
            test.eq(body.n, 1)

            local fanout = query("SELECT demand_generation FROM kickside_wake_fanout WHERE key = $1", { "thread:" .. thread_id })
            test.eq(result.wake_generation, math.floor(tonumber(fanout[1].demand_generation) :: number))

            local next, next_err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = { { event_type = "test.three", payload = {} } } })
            end)
            test.is_nil(next_err)
            test.eq(next.events[1].seq, 3)
            test.eq(next.wake_generation, result.wake_generation + 1)
        end)

        test.it("answers a duplicate external identity with the stored event, in the batch and against the log", function()
            local thread_id = make_thread()
            local identity = { source = "crm", id = "rec-1", version = "v1" }
            local first, err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = {
                    { event_type = "test.ext", payload = { a = 1 }, external_identity = identity },
                    { event_type = "test.ext", payload = { a = 2 }, external_identity = identity },
                    { event_type = "test.ext", payload = { a = 3 }, external_identity = { source = "crm", id = "rec-1" } },
                } })
            end)
            test.is_nil(err)
            test.eq(#first.events, 3)
            test.eq(first.events[2].event_id, first.events[1].event_id)
            test.eq(first.events[2].seq, first.events[1].seq)
            test.eq(first.events[3].seq, 2)
            test.eq(head_of(thread_id), 2)

            local again = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = {
                    { event_type = "test.ext", payload = { a = 9 }, external_identity = identity },
                } })
            end)
            test.eq(again.events[1].event_id, first.events[1].event_id)
            test.eq(again.events[1].seq, 1)
            test.eq(head_of(thread_id), 2)
            test.is_nil(again.wake_generation)
        end)

        test.it("appends a batch larger than one insert statement", function()
            local thread_id = make_thread()
            local events: { table } = {}
            for i = 1, append.INSERT_CHUNK * 2 + 7 do
                events[i] = { event_type = "test.bulk", payload = { i = i } }
            end
            local result, err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = events })
            end)
            test.is_nil(err)
            test.eq(#result.events, #events)
            test.eq(result.events[#events].seq, #events)
            local count = query("SELECT COUNT(*) AS n, MAX(seq) AS top FROM kickside_event WHERE thread_id = $1", { thread_id })[1]
            test.eq(math.floor(tonumber(count.n) :: number), #events)
            test.eq(math.floor(tonumber(count.top) :: number), #events)
        end)

        test.it("refuses an explicit sequence at or below the prune boundary", function()
            local thread_id = make_thread()
            exec("UPDATE kickside_thread SET event_count = 5, max_pruned_seq = 5 WHERE id = $1", { thread_id })
            local _, err = in_tx(function(tx)
                return append.append_events_tx(tx, thread_id, { { type = "test.old", seq = 4 } }, {})
            end)
            test.not_nil(err)
            test.eq(err:kind(), errors.CONFLICT)
            test.eq(#query("SELECT 1 AS one FROM kickside_event WHERE thread_id = $1", { thread_id }), 0)

            local ok, ok_err = in_tx(function(tx)
                return append.append_events_tx(tx, thread_id, { { type = "test.new" } }, {})
            end)
            test.is_nil(ok_err)
            test.eq(ok.max_seq, 6)
        end)

        test.it("rejects a malformed request before writing", function()
            local thread_id = make_thread()
            local _, type_err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = { { payload = {} } } })
            end)
            test.eq(type_err:kind(), errors.INVALID)
            local _, empty_err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = thread_id, events = {} })
            end)
            test.eq(empty_err:kind(), errors.INVALID)
            local _, missing_err = in_tx(function(tx)
                return append.append_tx(tx, { thread_id = uuid.v7(), events = { { event_type = "x", payload = {} } } })
            end)
            test.eq(missing_err:kind(), errors.NOT_FOUND)
            test.eq(head_of(thread_id), 0)
        end)
    end)
end

return test.run_cases(define_tests)
