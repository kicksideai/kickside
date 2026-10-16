-- Primary-key acquisition order for batched round-ledger writes.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local channel = require("channel")
local round_ledger = require("round_ledger")

type Map = { [string]: any }
local DB = "app:db"
-- The upsert includes expires_at, so each item contributes 19 values.
local LAST_KEY_IN_50_ROW_BATCH = 3 + 49 * 19

local function define_tests()
    test.describe("round ledger lock order", function()
        test.it("orders and admits mixed-precision stored retry times at their exact instants", function()
            local owner = uuid.v7()
            local db, db_err = sql.get(DB)
            test.is_nil(db_err)
            local tx, tx_err = db:begin()
            test.is_nil(tx_err)
            local _, record_err = round_ledger.record_tx(tx, owner, "fixture:precision", {
                { item = { item_key = "legacy", dedup_key = "legacy" }, state = "waiting",
                    next_attempt_at = "2030-01-01T00:00:00Z" },
                { item = { item_key = "precise", dedup_key = "precise" }, state = "waiting",
                    next_attempt_at = "2030-01-01T00:00:00.123Z" },
            }, "2026-10-08T00:00:00Z", "2099-01-01T00:00:00Z")
            test.is_nil(record_err)
            local earliest, earliest_err = round_ledger.next_attempt(tx, owner, "fixture:precision")
            local observations = {}
            for _, case in ipairs({ { now = "2030-01-01T00:00:00Z", count = 1 },
                { now = "2030-01-01T00:00:00.122Z", count = 1 },
                { now = "2030-01-01T00:00:00.123Z", count = 2 } }) do
                local due, due_err = round_ledger.due_tx(tx, owner, "fixture:precision", case.now, 10)
                observations[#observations + 1] = {due = due, err = due_err, count = case.count}
            end
            local _, rollback_err = tx:rollback()
            db:release()
            test.is_nil(rollback_err)
            test.is_nil(earliest_err)
            test.eq(earliest, "2030-01-01T00:00:00Z")
            for _, observed in ipairs(observations) do
                test.is_nil(observed.err)
                test.eq(#observed.due, observed.count)
            end
        end)

        test.it("acquires ledger keys in primary-key order across SQL batches", function()
            local queries: { Map } = {}
            local writes: { Map } = {}
            local executor = {
                db_type = function() return sql.type.POSTGRES, nil end,
                query = function(_, statement: string, params: { any })
                    queries[#queries + 1] = { statement = statement, params = params }
                    return {}, nil
                end,
                execute = function(_, statement: string, params: { any })
                    writes[#writes + 1] = { statement = statement, params = params }
                    return { rows_affected = 1 }, nil
                end,
            }
            local outcomes: { Map } = {}
            for i = 120, 1, -1 do
                local key = string.format("key-%03d", i)
                outcomes[#outcomes + 1] = { item = { item_key = key, dedup_key = key },
                    state = round_ledger.STATE.RETRYING, next_attempt_at = "2099-01-01T00:00:00Z" }
            end
            local delta, err = round_ledger.record_tx(executor, uuid.v7(), "fixture:records", outcomes,
                "2026-09-27T00:00:00Z", "2099-01-01T00:00:00Z")
            test.is_nil(err, tostring(err))
            test.eq(delta, 120)
            test.contains(queries[1].statement, "ORDER BY owner_id, source_port, item_key, identity_key FOR UPDATE")
            test.eq(queries[1].params[3], "key-001")
            test.eq(queries[1].params[4], "key-002")
            test.eq(queries[1].params[122], "key-120")
            test.eq(#writes, 3)
            for index = 1, 3 do
                test.contains(writes[index].statement, "ORDER BY 1, 2, 3, 5")
            end
            test.eq(writes[1].params[3], "key-001")
            test.eq(writes[1].params[LAST_KEY_IN_50_ROW_BATCH], "key-050")
            test.eq(writes[2].params[3], "key-051")
            test.eq(writes[3].params[3], "key-101")
        end)

        test.it("serializes opposite-order overlapping ledger pages on PostgreSQL", function()
            local probe, db_err = sql.get(DB)
            if db_err or not probe then error("database unavailable: " .. tostring(db_err)) end
            local dialect = probe:type()
            probe:release()
            if dialect ~= sql.type.POSTGRES then return end
            local owner = uuid.v7()
            local forward: { Map } = {}
            local reverse: { Map } = {}
            for i = 1, 100 do
                local key = string.format("overlap-%03d", i)
                forward[#forward + 1] = { item = { item_key = key, dedup_key = key },
                    state = round_ledger.STATE.RETRYING, next_attempt_at = "2099-01-01T00:00:00Z" }
            end
            for i = #forward, 1, -1 do reverse[#reverse + 1] = forward[i] end
            local seed, db_err = sql.get(DB)
            if db_err or not seed then error("database unavailable: " .. tostring(db_err)) end
            local seed_tx = seed:begin()
            local _, seed_err = round_ledger.record_tx(seed_tx, owner, "fixture:overlap", forward,
                "2026-09-27T00:00:00Z", "2099-01-01T00:00:00Z")
            test.is_nil(seed_err, tostring(seed_err))
            local _, seed_commit_err = seed_tx:commit()
            test.is_nil(seed_commit_err)
            seed:release()

            local stages = channel.new(3)
            local permit_a, permit_b = channel.new(1), channel.new(1)
            local done = channel.new(2)
            local function run(label: string, outcomes: { Map }, permit: any)
                coroutine.spawn(function()
                    local db, db_err = sql.get(DB)
                    if db_err or not db then error("database unavailable: " .. tostring(db_err)) end
                    local tx = db:begin()
                    local writes = 0
                    local executor = {
                        db_type = function() return sql.type.POSTGRES, nil end,
                        query = function(_, statement: string, params: { any })
                            -- B's ordered prelock will block on A's held rows.
                            -- Signal before that blocking call so the parent
                            -- can release A without a clock-based fallback.
                            if label == "b" and statement:find(" FOR UPDATE", 1, true) then
                                stages:send({ label = label, phase = "prelock" })
                            end
                            return tx:query(statement, params)
                        end,
                        execute = function(_, statement: string, params: { any })
                            local result, err = tx:execute(statement, params)
                            writes = writes + 1
                            if writes == 1 and not err then
                                stages:send({ label = label, phase = "write", first_key = params[3],
                                    last_key = params[LAST_KEY_IN_50_ROW_BATCH] })
                                permit:receive()
                            end
                            return result, err
                        end,
                    }
                    local _, err = round_ledger.record_tx(executor, owner, "fixture:overlap", outcomes,
                        "2026-09-27T00:00:01Z", "2099-01-01T00:00:00Z")
                    if err then tx:rollback() else local _, commit_err = tx:commit(); err = commit_err end
                    db:release()
                    done:send({ label = label, err = err })
                end)
            end
            run("a", forward, permit_a)
            local a = stages:receive()
            test.eq(a.label, "a")
            test.eq(a.phase, "write")
            test.eq(a.first_key, "overlap-001")
            test.eq(a.last_key, "overlap-050")
            run("b", reverse, permit_b)
            -- Under the old order B must return from its disjoint first
            -- write before A is released. The fixed order reaches B's
            -- blocking prelock instead. Neither branch advances on time.
            local b = stages:receive()
            test.eq(b.label, "b")
            if b.phase == "write" then
                test.eq(b.first_key, "overlap-100")
                test.eq(b.last_key, "overlap-051")
            else
                test.eq(b.phase, "prelock")
            end
            permit_a:send(true)
            permit_b:send(true)
            for _ = 1, 2 do
                local result = done:receive()
                test.is_nil(result.err, tostring(result.err))
            end
        end)

    end)
end

return test.run_cases(define_tests)
