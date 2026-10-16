local sql = require("sql")
local uuid = require("uuid")
local test = require("test")
local ledger = require("round_ledger")
local prepared_retention = require("prepared_retention")
local engine = require("automation_test_engine")
local errors = require("errors")

local function db(): any
    local opened, err = sql.get("app:db")
    if err or not opened then error(tostring(err)) end
    return opened
end

local function exec(statement: string, args: { any }): ()
    local opened = db()
    local _, err = opened:execute(statement, args)
    opened:release()
    test.is_nil(err, tostring(err))
end

local function count(owner: string): integer
    local opened = db()
    local rows, err = opened:query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1", { owner })
    opened:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local function item(owner: string, key: string, state: string, updated: string): ()
    exec([[INSERT INTO kickside_trigger_item_ledger
        (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
         first_failed_at,last_failed_at,created_at,updated_at)
        VALUES ($1,'source',$2,$2,$2,'{}',$3,$4,$4,$4,$4)]], { owner, key, state, updated })
end

return test.run_cases(function()
    test.describe("automation orphan ledger retention", function()
        test.it("records ledger identities past the former per-owner count and reuses one on replay", function()
            local owner = uuid.v7()
            exec([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<100000)
                INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                 first_failed_at,last_failed_at,created_at,updated_at)
                SELECT $1,'source','seed-' || CAST(x AS TEXT),'seed-' || CAST(x AS TEXT),
                    'seed-' || CAST(x AS TEXT),'{}','resolved',$2,$2,$2,$2 FROM n]],
                { owner, "2026-01-01T00:00:00Z" })
            local now = "2026-01-01T00:00:00Z"
            local function record(key: string): error?
                local opened = db()
                local tx = assert(opened:begin())
                local _, err = ledger.record_tx(tx, owner, "source", { { item = {
                    item_key = key, dedup_key = key, op = "upsert", payload = {} },
                    state = ledger.STATE.UNCERTAIN,
                    error = { code = "uncertain", message = "send may have landed", retriable = false } } }, now, now)
                if err then tx:rollback() else tx:commit() end
                opened:release()
                return err
            end
            test.is_nil(record("edge"))
            test.is_nil(record("edge"), "an uncertain replay reuses its ledger identity")
            test.is_nil(record("over"))
            test.eq(count(owner), 100002)
            exec("DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1", { owner })
        end)
        test.it("keeps prepared retry evidence when its drive is temporarily absent", function()
            local protected, orphan = uuid.v7(), uuid.v7()
            item(protected, "retry", "retrying", "1900-01-01T00:00:00Z")
            for _, id in ipairs({ protected, orphan }) do
                exec([[INSERT INTO kickside_automation_prepared
                    (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                    VALUES ($1,'output','hash','{}','1900-01-01T00:00:00Z')]], { id })
            end
            local opened = db()
            local tx = assert(opened:begin())
            local removed, prune_err = prepared_retention.prune_orphans_tx(tx, "1950-01-01T00:00:00Z", 10)
            local _, commit_err = tx:commit()
            opened:release()
            local inspect = db()
            local rows, read_err = inspect:query(
                "SELECT automation_id FROM kickside_automation_prepared WHERE automation_id IN ($1,$2)",
                { protected, orphan })
            inspect:release()
            exec("DELETE FROM kickside_automation_prepared WHERE automation_id IN ($1,$2)", { protected, orphan })
            exec("DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1", { protected })
            test.is_nil(prune_err, tostring(prune_err))
            test.is_nil(commit_err, tostring(commit_err))
            test.is_nil(read_err, tostring(read_err))
            test.eq(removed, 1)
            test.eq(#rows, 1)
            test.eq(rows[1].automation_id, protected)
        end)

        test.it("drains old terminal orphans in bounded batches and preserves unresolved evidence", function()
            test.not_nil(ledger.prune_orphans_tx)
            local orphan, active, pending, recent = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            exec("INSERT INTO kickside_automation_drive (automation_id,drive_key,source_kind) VALUES ($1,'main','none')", { active })
            exec([[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,
                 pending_input_json,pending_drives_json,pending_step,next_attempt_at)
                VALUES ($1,1,'install','digest','install','{}','[]','install','2999-01-01T00:00:00Z')]], { pending })
            item(orphan, "retrying", "retrying", "1900-01-01T00:00:00Z")
            item(orphan, "uncertain", "uncertain", "1900-01-01T00:00:00Z")
            item(orphan, "resolved", "resolved", "1900-01-01T00:00:00Z")
            item(orphan, "dead", "dead", "1900-01-01T00:00:00Z")
            item(active, "live", "waiting", "1900-01-01T00:00:00Z")
            item(pending, "pending", "retrying", "1900-01-01T00:00:00Z")
            item(recent, "recent", "retrying", "2999-01-01T00:00:00Z")

            local opened = db()
            local tx = assert(opened:begin())
            local first, first_err = ledger.prune_orphans_tx(tx, "1950-01-01T00:00:00Z", 1)
            local second, second_err = ledger.prune_orphans_tx(tx, "1950-01-01T00:00:00Z", 1)
            local third, third_err = ledger.prune_orphans_tx(tx, "1950-01-01T00:00:00Z", 1)
            local _, commit_err = tx:commit()
            opened:release()
            local orphan_count, active_count, pending_count, recent_count =
                count(orphan), count(active), count(pending), count(recent)
            local retained = db()
            local states, state_err = retained:query(
                "SELECT state FROM kickside_trigger_item_ledger WHERE owner_id=$1 ORDER BY state", { orphan })
            retained:release()
            for _, owner in ipairs({ orphan, active, pending, recent }) do
                exec("DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1", { owner })
                exec("DELETE FROM kickside_automation_drive WHERE automation_id=$1", { owner })
                exec("DELETE FROM kickside_automation_command WHERE automation_id=$1", { owner })
            end
            test.is_nil(first_err, tostring(first_err))
            test.eq(first, 1, "first orphan batch")
            test.is_nil(second_err, tostring(second_err))
            test.eq(second, 1, "second orphan batch")
            test.is_nil(third_err, tostring(third_err))
            test.eq(third, 0, "unresolved rows have no age-based prune path")
            test.is_nil(commit_err, tostring(commit_err))
            test.eq(orphan_count, 2, "unresolved orphan rows remain")
            test.is_nil(state_err)
            test.eq(states[1].state, "retrying")
            test.eq(states[2].state, "uncertain")
            test.eq(active_count, 1, "active drive row")
            test.eq(pending_count, 1, "pending command row")
            test.eq(recent_count, 1, "recent orphan row")
        end)

        test.it("runs orphan cleanup from the existing dispatcher", function()
            local orphan = uuid.v7()
            item(orphan, "late", "uncertain", "2000-01-01T00:00:00Z")
            item(orphan, "terminal", "dead", "2000-01-01T00:00:00Z")
            local pass, err = engine.new().dispatch({ limit = 10 })
            local remaining = count(orphan)
            exec("DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1", { orphan })
            test.is_nil(err, tostring(err))
            test.is_true(pass.pruned_orphan_ledger >= 1)
            test.eq(remaining, 1, "the uncertain orphan remains")
        end)
    end)
end)
