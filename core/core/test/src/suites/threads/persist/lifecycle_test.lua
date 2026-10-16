-- Lifecycle thread behavior: recursion exemption, deterministic ids, idempotent
-- ensure that mints NO backing component (the audited component id lives in attrs), and
-- at-least-once append that dedupes on the external key. Direct kickside_thread /
-- kickside_event reads assert the persisted rows. Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local teardown = require("threads_teardown")
local fence = require("teardown_fence")
local sweeper = require("sweeper")
local jobs = require("jobs")

local DB = "app:db"

local function define_tests()
    test.describe("Threads Lifecycle", function()
        local suffix = uuid.v4():sub(1, 8)

        local function db()
            local d, e = sql.get(DB)
            if e then error("db: " .. tostring(e)) end
            return d
        end

        local function count(d, tbl, col, value)
            local rows, err = sql.builder.select("COUNT(*) AS c")
                :from(tbl)
                :where(sql.builder.eq({ [col] = value }))
                :run_with(d):query()
            test.is_nil(err, tostring(err))
            return tonumber(rows[1].c) :: integer
        end

        test.it("exempts the thread impl from a lifecycle thread", function()
            test.is_true(lifecycle.is_exempt("kickside.core:thread"))
            test.is_false(lifecycle.is_exempt("kickside.knowledge:kb"))
            test.is_false(lifecycle.is_exempt(nil))
        end)

        test.it("derives a stable, distinct thread id per component", function()
            local a = "comp-a-" .. suffix
            local b = "comp-b-" .. suffix
            test.eq(lifecycle.thread_id(a), lifecycle.thread_id(a))
            test.is_true(lifecycle.thread_id(a) ~= lifecycle.thread_id(b))
        end)

        test.it("ensure creates one lifecycle thread idempotently, minting no component", function()
            local d = db()
            local cid = "lc-comp-" .. suffix
            local tid, err = lifecycle.ensure(d, cid, "knowledge_base")
            test.is_nil(err)
            test.eq(tid, lifecycle.thread_id(cid))
            test.eq(count(d, "kickside_thread", "id", tid), 1)

            -- No backing component is minted: lifecycle threads are internal raw
            -- logs, so the component link column stays blank and the audited
            -- component id lives in attrs.
            local row = sql.builder.select("component_id", "thread_class", "attrs")
                :from("kickside_thread"):where(sql.builder.eq({ id = tid }))
                :run_with(d):query()
            test.eq(row[1].component_id, "")
            test.eq(row[1].thread_class, "lifecycle.knowledge_base")
            test.is_true(tostring(row[1].attrs):find(cid, 1, true) ~= nil)

            -- Idempotent: a second ensure adds no row.
            local tid2, err2 = lifecycle.ensure(d, cid, "knowledge_base")
            test.is_nil(err2)
            test.eq(tid2, tid)
            test.eq(count(d, "kickside_thread", "id", tid), 1)
            d:release()
        end)

        test.it("append writes a typed event and dedupes by key (at-least-once safe)", function()
            local d = db()
            local cid = "lc-app-" .. suffix
            local _, eerr = lifecycle.ensure(d, cid, "agent")
            test.is_nil(eerr)
            local tid = lifecycle.thread_id(cid)

            local r1, a1 = lifecycle.append(d, cid, lifecycle.KIND.CREATED, "op-1", { who = cid })
            test.is_nil(a1)
            test.eq(r1.inserted, 1)

            -- Same dedup key => duplicate; head is not advanced.
            local r2, a2 = lifecycle.append(d, cid, lifecycle.KIND.CREATED, "op-1", { who = cid })
            test.is_nil(a2)
            test.eq(r2.inserted, 0)
            test.eq(r2.duplicates, 1)

            -- A distinct key inserts.
            local r3, a3 = lifecycle.append(d, cid, lifecycle.KIND.DELETED, "op-2", {})
            test.is_nil(a3)
            test.eq(r3.inserted, 1)

            -- Exactly two events; head == 2; first is the typed created event.
            test.eq(count(d, "kickside_event", "thread_id", tid), 2)
            local trow = sql.builder.select("event_count"):from("kickside_thread")
                :where(sql.builder.eq({ id = tid })):run_with(d):query()
            test.eq(tonumber(trow[1].event_count), 2)
            local first = sql.builder.select("type"):from("kickside_event")
                :where(sql.builder.eq({ thread_id = tid, seq = 1 })):run_with(d):query()
            test.eq(first[1].type, "kickside.component.events:created")
            d:release()
        end)

        test.it("purge removes the primary thread without erasing lifecycle audit", function()
            local d = db()
            local cid = uuid.v7()
            local _, perr = sql.builder.insert("kickside_thread")
                :set_map({
                    id = cid,
                    component_id = cid,
                    thread_class = "knowledge_base",
                    attrs = "{}",
                    state = "open",
                    event_count = 0,
                })
                :run_with(d):exec()
            test.is_nil(perr)

            local lifecycle_tid, ensure_err = lifecycle.ensure(d, cid, "knowledge_base")
            test.is_nil(ensure_err)
            local _, append_err = lifecycle.append(d, cid, lifecycle.KIND.DELETED, "delete-" .. suffix, {})
            test.is_nil(append_err)
            test.eq(count(d, "kickside_thread", "component_id", cid), 1)
            test.eq(count(d, "kickside_event", "thread_id", lifecycle_tid), 1)

            local ok, purge_err = teardown.purge_thread(d, cid, nil)
            test.is_nil(purge_err)
            test.is_true(ok.purged)
            test.eq(count(d, "kickside_thread", "component_id", cid), 0)
            test.eq(count(d, "kickside_thread", "id", lifecycle_tid), 1)
            test.eq(count(d, "kickside_event", "thread_id", lifecycle_tid), 1)
            d:release()
        end)

        test.it("appends a lifecycle event once under its stable key past the former per-thread count", function()
            local d = db()
            local cid = uuid.v7()
            local tid, ensure_err = lifecycle.ensure(d, cid, "agent")
            test.is_nil(ensure_err)
            local seed: string
            if tostring(d:type()) == sql.type.POSTGRES then
                seed = [[INSERT INTO kickside_event (id,thread_id,type,role,body,seq)
                    SELECT md5($1::text || ':' || n::text)::uuid,$1::uuid,'test.bulk','user','{}',n
                    FROM generate_series(1,100000) AS n]]
            else
                seed = [[WITH RECURSIVE numbered(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbered WHERE n<100000)
                    INSERT INTO kickside_event (id,thread_id,type,role,body,seq)
                    SELECT lower(hex(randomblob(16))),$1,'test.bulk','user','{}',n FROM numbered]]
            end
            local seeded, seed_err = d:execute(seed, { tid })
            test.is_nil(seed_err)
            test.eq(tonumber(seeded.rows_affected), 100000)
            local head, head_err = d:execute("UPDATE kickside_thread SET event_count=100000 WHERE id=$1", { tid })
            test.is_nil(head_err)
            test.eq(tonumber(head.rows_affected), 1)
            local appended, append_err = lifecycle.append(d, cid, lifecycle.KIND.DELETED,
                "deleted:" .. cid, {})
            test.is_nil(append_err)
            test.not_nil(appended)
            local retried, retry_err = lifecycle.append(d, cid, lifecycle.KIND.DELETED,
                "deleted:" .. cid, {})
            test.is_nil(retry_err)
            test.not_nil(retried)
            test.eq(count(d, "kickside_event", "thread_id", tid), 100001)
            d:release()
        end)

        test.it("purge removes pins, tombstones, projections, policy and both edge directions", function()
            local d = db()
            local doomed, survivor, projection_id = uuid.v7(), uuid.v7(), uuid.v7()
            local function insert(statement, args)
                local _, err = d:execute(statement, args)
                test.is_nil(err, tostring(err))
            end
            for _, id in ipairs({ doomed, survivor }) do
                insert("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,0)",
                    { id, id })
            end
            insert("INSERT INTO kickside_projection (id,thread_id,kind) VALUES ($1,$2,'gc')",
                { projection_id, doomed })
            insert("INSERT INTO kickside_projection_cursor (id,projection_id,thread_id) VALUES ($1,$2,$3)",
                { uuid.v7(), projection_id, doomed })
            insert("INSERT INTO kickside_retention_policy (id,thread_id) VALUES ($1,$2)", { uuid.v7(), doomed })
            insert("INSERT INTO kickside_retention_pin (thread_id,consumer_key,cursor_seq,generation) VALUES ($1,$2,0,1)",
                { doomed, "self:" .. doomed })
            local event_id = uuid.v7()
            insert("INSERT INTO kickside_event (id,thread_id,type,seq) VALUES ($1,$2,'gc',1)",
                { event_id, doomed })
            insert([[INSERT INTO kickside_retention_pin_tombstone
                (thread_id,consumer_key,command_id,command_generation,pin_generation,terminal_op_id,installed_at)
                VALUES ($1,'retired','delete',2,1,'terminal','2000-01-01T00:00:00Z')]], { doomed })
            insert("INSERT INTO kickside_thread_edge (id,from_thread_id,to_thread_id,edge_type) VALUES ($1,$2,$3,'gc')",
                { uuid.v7(), doomed, survivor })
            insert("INSERT INTO kickside_thread_edge (id,from_thread_id,to_thread_id,edge_type) VALUES ($1,$2,$3,'gc')",
                { uuid.v7(), survivor, doomed })
            insert("INSERT INTO kickside_thread_edge (id,from_thread_id,to_thread_id,edge_type) VALUES ($1,$2,$2,'self')",
                { uuid.v7(), survivor })
            local owned_job, other_job = uuid.v7(), uuid.v7()
            for _, spec in ipairs({ { owned_job, doomed }, { other_job, survivor } }) do
                insert([[INSERT INTO kickside_job (id,thread_id,job_type,job_identity,owner_kind,owner_id)
                    VALUES ($1,$2,'gc',$3,'thread',$4)]], { spec[1], spec[2], "gc:" .. spec[1], spec[2] })
                insert([[INSERT INTO kickside_job_run
                    (id,job_id,thread_id,job_type,attempt_no,execution_seq,status,owner_kind,owner_id)
                    VALUES ($1,$2,$3,'gc',1,1,'success','thread',$4)]], { uuid.v7(), spec[1], spec[2], spec[2] })
            end

            local result, purge_err = teardown.purge_thread(d, doomed, nil)
            test.is_nil(purge_err, tostring(purge_err))
            test.is_true(result.purged)
            test.eq(result.discarded.unresolved.kickside_event, 1)
            test.eq(result.discarded.unresolved.kickside_retention_pin, 1)
            test.is_nil(result.discarded.unresolved.kickside_job_run)
            for _, table_name in ipairs({ "kickside_thread", "kickside_projection", "kickside_projection_cursor",
                "kickside_retention_policy", "kickside_retention_pin", "kickside_retention_pin_tombstone" }) do
                local column = table_name == "kickside_thread" and "id" or "thread_id"
                test.eq(count(d, table_name, column, doomed), 0, table_name)
            end
            test.eq(count(d, "kickside_thread", "id", survivor), 1)
            test.eq(count(d, "kickside_event", "thread_id", doomed), 0)
            test.eq(count(d, "kickside_job", "id", owned_job), 0)
            test.eq(count(d, "kickside_job_run", "job_id", owned_job), 0)
            test.eq(count(d, "kickside_job", "id", other_job), 1)
            test.eq(count(d, "kickside_job_run", "job_id", other_job), 1)
            local edges, edge_err = d:query("SELECT from_thread_id,to_thread_id FROM kickside_thread_edge WHERE edge_type IN ('gc','self')")
            test.is_nil(edge_err, tostring(edge_err))
            test.eq(#edges, 1)
            test.eq(edges[1].from_thread_id, survivor)
            test.eq(edges[1].to_thread_id, survivor)
            d:release()
        end)

        test.it("retains a surviving owner's unresolved job and run when its thread is purged", function()
            local d = db()
            local doomed, job, run, owner = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            local statements = {
                { "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,0)", { doomed, doomed } },
                { [[INSERT INTO kickside_job (id,thread_id,job_type,job_identity,owner_kind,owner_id,status)
                    VALUES ($1,$2,'gc',$3,'user',$4,'pending')]], { job, doomed, "gc:" .. job, owner } },
                { [[INSERT INTO kickside_job_run
                    (id,job_id,thread_id,job_type,attempt_no,execution_seq,status,owner_kind,owner_id)
                    VALUES ($1,$2,$3,'gc',1,1,'running','user',$4)]], { run, job, doomed, owner } },
            }
            for _, statement in ipairs(statements) do
                local result, err = d:execute(statement[1], statement[2])
                test.is_nil(err, tostring(err))
                test.eq(tonumber(result.rows_affected), 1)
            end
            local result, err = teardown.purge_thread(d, doomed, nil)
            test.is_nil(err, tostring(err))
            test.is_true(result.purged)
            test.is_nil(result.discarded.kickside_job)
            test.is_nil(result.discarded.kickside_job_run)
            local rows, read_err = d:query([[SELECT j.thread_id,j.status,r.thread_id AS run_thread_id,
                r.status AS run_status FROM kickside_job j
                JOIN kickside_job_run r ON r.job_id=j.id
                WHERE j.id=$1]], { job })
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1)
            test.is_nil(rows[1].thread_id)
            test.is_nil(rows[1].run_thread_id)
            test.eq(rows[1].status, "pending")
            test.eq(rows[1].run_status, "running")
            d:release()
        end)

        test.it("pages a large thread cascade through a durable delete mark", function()
            local d = db()
            local doomed = uuid.v7()
            local _, create_err = d:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,205)", { doomed, doomed })
            test.is_nil(create_err, tostring(create_err))
            local _, policy_err = d:execute("INSERT INTO kickside_retention_policy"
                .. " (id,thread_id,event_hot_retention_days) VALUES ($1,$2,1)", { uuid.v7(), doomed })
            test.is_nil(policy_err, tostring(policy_err))
            for seq = 1, 205 do
                local _, event_err = d:execute("INSERT INTO kickside_event (id,thread_id,type,seq,created_at)"
                    .. " VALUES ($1,$2,'gc',$3,'2000-01-01T00:00:00Z')",
                    { uuid.v7(), doomed, seq })
                test.is_nil(event_err, tostring(event_err))
            end
            local first, first_err = teardown.purge_thread(d, doomed, nil)
            test.is_nil(first)
            test.not_nil(first_err)
            test.is_true(first_err:details().cleanup_pending)
            test.is_true(count(d, "kickside_event", "thread_id", doomed) >= 105)
            local before_tick = count(d, "kickside_event", "thread_id", doomed)
            local _, tick_err = sweeper.run(d)
            test.is_nil(tick_err, tostring(tick_err))
            test.eq(count(d, "kickside_event", "thread_id", doomed), before_tick,
                "Core age retention leaves delete-marked threads to the teardown owner")
            local finished = false
            for _ = 1, 30 do
                local result, retry_err = teardown.purge_thread(d, doomed, nil)
                if result then
                    test.is_nil(retry_err)
                    finished = result.purged
                    break
                end
                test.not_nil(retry_err)
                test.is_true(retry_err:details().cleanup_pending)
            end
            test.is_true(finished)
            test.eq(count(d, "kickside_thread", "id", doomed), 0)
            test.eq(count(d, "kickside_event", "thread_id", doomed), 0)
            d:release()
        end)

        test.it("completes when a concurrent owner purges the marked thread before the page lock", function()
            local d = db()
            local doomed = uuid.v7()
            local _, create_err = d:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,0)", { doomed, doomed })
            test.is_nil(create_err, tostring(create_err))
            local original = jobs.cleanup_thread_page
            local peer_result, peer_err
            local raced = false
            jobs.cleanup_thread_page = function(id, page_seq)
                local page, err = original(id, page_seq)
                if not raced then
                    raced = true
                    peer_result, peer_err = teardown.purge_thread(d, doomed, nil)
                end
                return page, err
            end
            local result, err = teardown.purge_thread(d, doomed, nil)
            jobs.cleanup_thread_page = original
            test.is_nil(peer_err, tostring(peer_err))
            test.is_true(peer_result.purged)
            test.is_nil(err, tostring(err))
            test.is_true(result.purged)
            test.eq(count(d, "kickside_thread", "id", doomed), 0)
            d:release()
        end)

        test.it("reports a page a peer advanced before the page lock as pending continuation", function()
            local d = db()
            local doomed = uuid.v7()
            local _, create_err = d:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,205)", { doomed, doomed })
            test.is_nil(create_err, tostring(create_err))
            for seq = 1, 205 do
                local _, event_err = d:execute("INSERT INTO kickside_event (id,thread_id,type,seq,created_at)"
                    .. " VALUES ($1,$2,'gc',$3,'2000-01-01T00:00:00Z')",
                    { uuid.v7(), doomed, seq })
                test.is_nil(event_err, tostring(event_err))
            end
            local original = jobs.cleanup_thread_page
            local peer_err
            local raced = false
            jobs.cleanup_thread_page = function(id, page_seq)
                local page, err = original(id, page_seq)
                if not raced then
                    raced = true
                    local _, advanced_err = teardown.purge_thread(d, doomed, nil)
                    peer_err = advanced_err
                end
                return page, err
            end
            local result, err = teardown.purge_thread(d, doomed, nil)
            jobs.cleanup_thread_page = original
            test.not_nil(peer_err)
            test.is_true(peer_err:details().cleanup_pending)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.CONFLICT)
            test.is_true(err:details().cleanup_pending)
            test.is_true(err:details().needs_continue)
            local finished = false
            for _ = 1, 30 do
                local done, retry_err = teardown.purge_thread(d, doomed, nil)
                if done then
                    test.is_nil(retry_err)
                    finished = done.purged
                    break
                end
                test.is_true(retry_err:details().cleanup_pending)
            end
            test.is_true(finished)
            test.eq(count(d, "kickside_thread", "id", doomed), 0)
            test.eq(count(d, "kickside_event", "thread_id", doomed), 0)
            d:release()
        end)

        local reads = {
            { name = "mark proof", sql = "SELECT deleting_at FROM kickside_thread WHERE id=$1" },
            { name = "fence state", sql = "SELECT component_id,teardown_fence_cursor,teardown_fence_done FROM kickside_thread WHERE id=$1" },
            { name = "fence proof", sql = "SELECT teardown_fence_cursor,teardown_fence_done FROM kickside_thread WHERE id=$1" },
        }
        local function seed_purge_thread(d: any): string
            local id = uuid.v7()
            local _, err = d:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,0)", { id, id })
            test.is_nil(err, tostring(err))
            return id
        end
        local function intercept(d: any, query: any): any
            return {
                query = function(_self: any, statement: string, args: any): (any?, any?)
                    return query(statement, args)
                end,
                execute = function(_self: any, statement: string, args: any): (any?, any?)
                    return d:execute(statement, args)
                end,
                type = function(_self: any): (any?, any?) return d:type() end,
                begin = function(_self: any): (any?, any?) return d:begin() end,
            }
        end
        for _, boundary in ipairs(reads) do
            test.it("converges a peer's canonical purge before " .. boundary.name, function()
                local d = db()
                local id = seed_purge_thread(d)
                local peer_result: any = nil
                local peer_err: any = nil
                local proxy = intercept(d, function(statement: string, args: any): (any?, any?)
                    if statement == boundary.sql then
                        peer_result, peer_err = teardown.purge_thread(d, id, nil)
                    end
                    return d:query(statement, args)
                end)
                local err: any = nil
                if boundary.name == "mark proof" then
                    err = fence.mark(proxy, id)
                else
                    test.is_nil(fence.mark(d, id))
                    local fenced, fence_err = fence.fence_page(proxy, id)
                    err = fence_err
                    test.is_true(fenced)
                end
                test.is_nil(peer_err, tostring(peer_err))
                test.not_nil(peer_result)
                test.is_true(peer_result.purged)
                test.is_nil(err, tostring(err))
                local result, purge_err = teardown.purge_thread(d, id, nil)
                test.is_nil(purge_err, tostring(purge_err))
                test.not_nil(result)
                test.is_true(result.purged)
                test.eq(#result.notified, 0)
                test.eq(count(d, "kickside_thread", "id", id), 0)
                d:release()
            end)
            for _, invalid in ipairs({ "read failure", "nil result", "scalar result", "non-array result", "scalar row", "missing fields" }) do
                test.it("refuses " .. invalid .. " at " .. boundary.name, function()
                    local d = db()
                    local id = seed_purge_thread(d)
                    local source = errors.new({kind = errors.UNAVAILABLE, message = "forced read failure", retryable = false,
                        details = {code = "teardown_read_refusal", nested = {boundary = boundary.name}}})
                    local proxy = intercept(d, function(statement: string, args: any): (any?, any?)
                        if statement == boundary.sql then
                            if invalid == "read failure" then return nil, source end
                            if invalid == "nil result" then return nil, nil end
                            if invalid == "scalar result" then return "invalid", nil end
                            if invalid == "non-array result" then return { unexpected = true }, nil end
                            if invalid == "scalar row" then return { 17 }, nil end
                            return { {} }, nil
                        end
                        return d:query(statement, args)
                    end)
                    local err: any = nil
                    if boundary.name == "mark proof" then
                        err = fence.mark(proxy, id)
                    else
                        test.is_nil(fence.mark(d, id))
                        local result, fence_err = fence.fence_page(proxy, id)
                        test.is_nil(result)
                        err = fence_err
                    end
                    test.not_nil(err)
                    if invalid == "read failure" then
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "teardown_read_refusal")
                        test.eq(err:details().nested.boundary, boundary.name)
                        test.eq(source:details().nested.boundary, boundary.name)
                    else
                        test.eq(err:kind(), errors.INTERNAL)
                        test.is_false(err:retryable())
                        test.eq(err:details().code, "thread_teardown_fence_response")
                    end
                    test.eq(count(d, "kickside_thread", "id", id), 1)
                    local cleaned, cleanup_err = teardown.purge_thread(d, id, nil)
                    test.is_nil(cleanup_err, tostring(cleanup_err))
                    test.is_true(cleaned.purged)
                    d:release()
                end)
            end
        end

        test.it("keeps pinned events when a surviving consumer cannot be fenced", function()
            local d = db()
            local doomed, survivor = uuid.v7(), uuid.v7()
            local _, create_err = d:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'gc',$2,1)", { doomed, doomed })
            test.is_nil(create_err, tostring(create_err))
            local _, event_err = d:execute("INSERT INTO kickside_event (id,thread_id,type,seq) VALUES ($1,$2,'gc',1)", { uuid.v7(), doomed })
            test.is_nil(event_err, tostring(event_err))
            local _, pin_err = d:execute("INSERT INTO kickside_retention_pin (thread_id,consumer_key,cursor_seq,generation) VALUES ($1,$2,0,1)",
                { doomed, "drive:" .. survivor .. ":main" })
            test.is_nil(pin_err, tostring(pin_err))
            local result, purge_err = teardown.purge_thread(d, doomed, nil)
            test.is_nil(result)
            test.not_nil(purge_err)
            test.eq(count(d, "kickside_event", "thread_id", doomed), 1)
            test.eq(count(d, "kickside_retention_pin", "thread_id", doomed), 1)
            local _, release_err = d:execute("DELETE FROM kickside_retention_pin WHERE thread_id=$1", { doomed })
            test.is_nil(release_err, tostring(release_err))
            local finished, retry_err = teardown.purge_thread(d, doomed, nil)
            test.is_nil(retry_err, tostring(retry_err))
            test.is_true(finished.purged)
            d:release()
        end)

        test.it("rejects an unknown kind and empty ids", function()
            local d = db()
            local _, e1 = lifecycle.append(d, "x-" .. suffix, "bogus", "k", {})
            test.not_nil(e1)
            local _, e2 = lifecycle.ensure(d, "", "agent")
            test.not_nil(e2)
            local _, e3 = lifecycle.append(d, "x-" .. suffix, lifecycle.KIND.CREATED, "", {})
            test.not_nil(e3)
            d:release()
        end)

        test.it("rejects unencodable lifecycle payloads instead of writing an empty body", function()
            local d = db()
            local cid = "lc-bad-json-" .. suffix
            local _, eerr = lifecycle.ensure(d, cid, "agent")
            test.is_nil(eerr)
            local tid = lifecycle.thread_id(cid)

            local refusal = errors.new({kind = errors.INVALID, message = "forced encode failure", retryable = false,
                details = {code = "lifecycle_encoder_invalid", nested = {field = "payload"}}})
            local real_json = lifecycle._json
            lifecycle._json = {
                encode = function(_value: any)
                    return nil, refusal
                end,
            }
            local result, err = lifecycle.append(d, cid, lifecycle.KIND.CREATED, "bad-json", { value = "bad" })
            lifecycle._json = real_json
            test.is_nil(result)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
            test.is_false((err :: any):retryable())
            test.eq((err :: any):details().code, "lifecycle_encoder_invalid")
            test.eq((err :: any):details().nested.field, "payload")
            test.eq(count(d, "kickside_event", "thread_id", tid), 0)
            d:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
