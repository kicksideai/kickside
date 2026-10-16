local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local time = require("time")
local claim = require("claim")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local function four(mode: string, scope: string, db_id: string?): table[]
    local events = process.events()
    local pending = {}
    for _ = 1, 4 do
        local pid, err = process.spawn_monitored("app:concurrency_probe", "app:processes", { mode = mode, scope = scope, db_id = db_id })
        test.is_nil(err)
        test.not_nil(pid)
        pending[tostring(pid)] = true
    end
    local results: table[] = {}
    local deadline = time.after("10s")
    while #results < 4 do
        local selected = channel.select({ events:case_receive(), deadline:case_receive() })
        if selected.channel ~= events then
            for pid in pairs(pending) do process.terminate(pid) end
            error("four concurrency probes did not exit")
        end
        local event = selected.value
        local pid = type(event) == "table" and tostring(event.from) or ""
        if pending[pid] then
            test.eq(event.kind, process.event.EXIT)
            test.is_nil(event.result.error)
            results[#results + 1] = event.result.value
            pending[pid] = nil
        end
    end
    return results
end

local function define_tests()
    test.describe("jobs P1 concurrent gates", function()
        test.it("threadless enqueue refuses a missing surviving owner locator", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local id, err = lifecycle.enqueue_job(db, dbtype, {
                job_type = "test.owner.required", parked = true,
                job_identity = { namespace = "drive", scope = uuid.v7(), key = "slot" },
            })
            test.is_nil(id)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            db:release()
        end)

        test.it("admits concurrent distinct enqueues of one owner", function()
            local owner = uuid.v7()
            local results = four("owner_enqueue", owner)
            local seen: { [string]: boolean } = {}
            for _, result in ipairs(results) do
                test.is_nil(result.error)
                test.not_nil(result.id)
                test.is_nil(seen[result.id])
                seen[result.id] = true
            end
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local rows, rows_err = db:query([[SELECT COUNT(*) AS n FROM kickside_job
                WHERE owner_kind='test' AND owner_id=$1]], { owner })
            db:release()
            test.is_nil(rows_err)
            test.eq(tonumber(rows[1].n), 4)
        end)

        test.it("four concurrent threadless enqueues share one active identity", function()
            local scope = "concurrent-" .. uuid.v7()
            local results = four("enqueue", scope)
            local id = results[1].id
            test.not_nil(id)
            for _, result in ipairs(results) do
                test.is_nil(result.error)
                test.eq(result.id, id)
            end
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local identity = lifecycle.identity_parts({ job_type = "test.concurrent.slot", job_identity = { namespace = "drive", scope = scope, key = "slot" } }, id)
            local rows, rows_err = sql.builder.select("id", "status")
                :from("kickside_job")
                :where(sql.builder.eq({ job_identity = identity }))
                :where("status IN ('pending','running')")
                :run_with(db):query()
            test.is_nil(rows_err)
            test.eq(#rows, 1)
            db:release()
        end)

        -- Eight keys with four jobs each: no single batch of four can prelock
        -- every candidate, so the four claimers genuinely compete for key
        -- ownership across processes instead of partitioning a prelocked set.
        -- The design (§4.5, §14) guarantees safe contention, never a
        -- one-round drain: a claimer that loses the cross-transaction
        -- running-key race converts the conflict to pending via savepoint and
        -- leaves the key for a later round. This gate asserts exactly that
        -- contract: clean contention, ordered acquisition, then completeness
        -- after bounded drain with no job lost or delayed.
        -- The claimers and the drain run on a private queue: every claimed and
        -- counted row is one this case enqueued.
        test.it("four reverse-key batch claimers contend safely and drain every key", function()
            local db, _, db_err = job_fixture.private_queue("app:private_queue_concurrency_test")
            if not db or not _ then error("test queue unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local scope = "reverse-" .. uuid.v7()
            for i = 8, 1, -1 do
                for j = 1, 4 do
                    local _, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "concurrency_test" },
                        job_type = "test.reverse.claim",
                        job_identity = { namespace = "claim", scope = scope, key = tostring(i) .. ":" .. tostring(j) },
                        concurrency_key = scope .. ":key-" .. tostring(i),
                        queue_tier = "live",
                        scheduled_at = "2000-01-01T00:00:00Z",
                    })
                    test.is_nil(err)
                end
            end
            db:release()
            local results = four("claim", scope, "app:private_queue_concurrency_test")
            -- Zero conflicts, zero deadlocks: every claimer returns cleanly,
            -- each batch holds its keys in ascending acquisition order, and
            -- no key is ever claimed twice across claimers.
            local seen = {}
            for _, result in ipairs(results) do
                test.is_nil(result.error)
                local keys = result.keys or {}
                for i = 2, #keys do
                    test.is_true(keys[i - 1] <= keys[i])
                end
                for _, key in ipairs(keys) do
                    test.is_nil(seen[key])
                    seen[key] = true
                end
            end
            -- Bounded subsequent rounds drain whatever the first round left
            -- pending. Leftovers stay due, so a short deterministic drain
            -- finishes every key with no wake, retry, or timing involved.
            local verify_db, verify_err = sql.get("app:private_queue_concurrency_test")
            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            local verify_type = tostring(verify_db:type())
            for _ = 1, 8 do
                local batch, batch_err = claim.claim_batch(verify_db, verify_type, 16)
                test.is_nil(batch_err)
                if #batch == 0 then break end
            end
            local rows, rows_err = sql.builder.select("concurrency_key", "status")
                :from("kickside_job")
                :where("concurrency_key LIKE ?", scope .. ":%")
                :run_with(verify_db):query()
            test.is_nil(rows_err)
            -- No job lost: all 32 rows still present, each either running
            -- exactly once per key or still pending behind no delay.
            test.eq(#rows, 32)
            local running_keys = {}
            local running_count = 0
            local pending_count = 0
            for _, row in ipairs(rows or {}) do
                if row.status == "running" then
                    test.is_nil(running_keys[row.concurrency_key])
                    running_keys[row.concurrency_key] = true
                    running_count = running_count + 1
                elseif row.status == "pending" then
                    pending_count = pending_count + 1
                else
                    error("reverse-key row left in unexpected status: " .. tostring(row.status))
                end
            end
            test.eq(running_count, 8)
            test.eq(pending_count, 24)
            local _, cleanup_err = sql.builder.update("kickside_job")
                :set("status", "cancelled")
                :set("lease_token", nil)
                :set("lease_until", nil)
                :where("concurrency_key LIKE ?", scope .. ":%")
                :run_with(verify_db):exec()
            test.is_nil(cleanup_err)
            verify_db:release()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
