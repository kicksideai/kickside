-- Bounded ledger pages keep round persistence ordered and atomic.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local round_ledger = require("round_ledger")
local drive = require("drive")
local h = require("round_harness")

type Map = { [string]: any }

local DB = "app:db"

local function query(statement: string, params: { any }?): { Map }
    local db, db_err = sql.get(DB)
    if db_err or not db then error("database unavailable: " .. tostring(db_err)) end
    local rows, err = db:query(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
    return rows :: { Map }
end

local function stamped(id: string, round_until: string?): Map
    local db, db_err = sql.get(DB)
    if db_err or not db then error("database unavailable: " .. tostring(db_err)) end
    local tx = db:begin()
    local _, insert_err = drive.insert_tx(tx, { automation_id = id, drive_key = "main",
        source_kind = "collection", job_id = uuid.v7() })
    if insert_err then tx:rollback(); db:release(); error(tostring(insert_err)) end
    tx:commit()
    db:release()
    local deadline = round_until or "2999-01-01T00:00:00Z"
    local opened, db_err = sql.get(DB)
    if db_err or not opened then error("database unavailable: " .. tostring(db_err)) end
    local _, update_err = opened:execute("UPDATE kickside_automation_drive SET round_token=$1,round_until=$2"
        .. " WHERE automation_id=$3 AND drive_key='main'", { "round-" .. id, deadline, id })
    opened:release()
    if update_err then error(tostring(update_err)) end
    local job = h.running_job()
    return { automation_id = id, drive_key = "main", source_port = "fixture:records",
        ledger_port = "fixture:records", delivery_revision = 1, fence = { round_token = "round-" .. id,
        revision = 1, rewind_generation = 0, command_generation = 0, round_until = deadline,
        job = { id = job.id, lease_token = job.lease_token, execution_seq = job.execution_seq } } }
end

local function run()
    test.describe("bounded round persistence pages", function()
        test.it("loses a stale-read reservation CAS without overwriting uncertainty or charging debt", function()
            local id = uuid.v7()
            local db, db_err = sql.get(DB)
            if db_err or not db then error("database unavailable: " .. tostring(db_err)) end
            local tx = db:begin()
            local item = { item_key = "competing", dedup_key = "competing" }
            local binding = { key = "delivery", op = "upsert", hash = "payload" }
            local first, _, first_err = round_ledger.reserve_uncertain_tx(tx, id, "fixture:records", item, binding,
                "2026-09-30T00:00:00Z")
            test.is_nil(first_err, tostring(first_err))
            test.is_true(first.send)
            local hidden = false
            local stale = {
                db_type = function() return tx:db_type() end,
                query = function(_, statement, params)
                    if not hidden and string.find(statement, "SELECT state,envelope_json,error_code", 1, true) then
                        hidden = true
                        return {}, nil
                    end
                    return tx:query(statement, params)
                end,
                execute = function(_, statement, params) return tx:execute(statement, params) end,
            }
            local second, delta, err = round_ledger.reserve_uncertain_tx(stale, id, "fixture:records", item, binding,
                "2026-09-30T00:00:01Z")
            local rows = tx:query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1", { id })
            tx:rollback()
            db:release()
            test.is_nil(err, tostring(err))
            test.is_false(second.send, "a lost insert/CAS must never authorize a second send")
            test.eq(second.state, "uncertain")
            test.eq(delta, 0)
            test.eq(tonumber(rows[1].n), 1)
        end)

        test.it("writes a bounded ledger page under ascending primary keys", function()
            local outcomes: { Map } = {}
            for i = 1, 250 do
                local key = "failed-" .. tostring(i)
                outcomes[#outcomes + 1] = { item = { item_key = key, dedup_key = key },
                    state = round_ledger.STATE.RETRYING, next_attempt_at = "2099-01-01T00:00:00Z",
                    error = { code = "unavailable", message = "retry", retriable = true } }
            end
            local writes = 0
            local executor = {
                db_type = function() return sql.type.SQLITE, nil end,
                query = function() return {}, nil end,
                execute = function()
                    writes = writes + 1
                    return { rows_affected = 1 }, nil
                end,
            }
            local delta, err = round_ledger.record_tx(executor, uuid.v7(), "fixture:records",
                outcomes, "2026-09-27T00:00:00Z", "2099-01-01T00:00:00Z")
            test.is_nil(err, tostring(err))
            test.eq(delta, 250)
            test.is_true(writes <= 7, "ledger writes exceeded the bounded page statement budget")
        end)

        test.it("persists and resolves ledger outcomes across bounded SQL batches", function()
            local id = uuid.v7()
            stamped(id)
            local outcomes: { Map } = {}
            local resolved: { Map } = {}
            for i = 1, 120 do
                local key = "ledger-" .. tostring(i)
                local item = { item_key = key, dedup_key = key }
                outcomes[#outcomes + 1] = { item = item, state = round_ledger.STATE.RETRYING,
                    next_attempt_at = "2099-01-01T00:00:00Z",
                    error = { code = "unavailable", message = "retry", retriable = true } }
                resolved[#resolved + 1] = { item = item, state = round_ledger.STATE.RESOLVED }
            end
            local db, db_err = sql.get(DB)
            if db_err or not db then error("database unavailable: " .. tostring(db_err)) end
            local tx = db:begin()
            local added, add_err = round_ledger.record_tx(tx, id, "fixture:records", outcomes,
                "2026-09-27T00:00:00Z", "2099-01-01T00:00:00Z")
            test.is_nil(add_err, tostring(add_err))
            test.eq(added, 120)
            local _, commit_err = tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            local settle = db:begin()
            local removed, remove_err = round_ledger.record_tx(settle, id, "fixture:records", resolved,
                "2026-09-27T00:00:01Z", "2099-01-01T00:00:00Z")
            test.is_nil(remove_err, tostring(remove_err))
            test.eq(removed, -120)
            local _, settle_err = settle:commit()
            test.is_nil(settle_err, tostring(settle_err))
            db:release()
            local rows = query("SELECT state,COUNT(*) AS n FROM kickside_trigger_item_ledger"
                .. " WHERE owner_id=$1 GROUP BY state", { id })
            test.eq(#rows, 1)
            test.eq(rows[1].state, round_ledger.STATE.RESOLVED)
            test.eq(tonumber(rows[1].n), 120)
        end)
    end)
end

return test.run_cases(run)
