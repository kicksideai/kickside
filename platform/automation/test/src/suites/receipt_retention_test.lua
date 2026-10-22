local sql = require("sql")
local uuid = require("uuid")
local test = require("test")
local retention = require("receipt_retention")

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
    local rows, err = opened:query("SELECT COUNT(*) AS n FROM kickside_automation_receipt WHERE owner_id=$1", { owner })
    opened:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

return test.run_cases(function()
    test.describe("automation orphan receipt retention", function()
        test.it("drains old deleted-owner receipts in bounded batches and keeps recoverable receipts", function()
            local orphan, active, pending, recent = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            exec([[INSERT INTO kickside_automation_drive (automation_id,drive_key,source_kind)
                VALUES ($1,'main','none')]], { active })
            exec([[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,
                 pending_input_json,pending_drives_json,pending_step)
                VALUES ($1,1,'install','digest','install','{}','[]','install')]], { pending })
            for _, row in ipairs({
                { orphan, "old-a", "2000-01-01T00:00:00Z" },
                { orphan, "old-b", "2000-01-01T00:00:00Z" },
                { active, "live", "2000-01-01T00:00:00Z" },
                { pending, "pending", "2000-01-01T00:00:00Z" },
                { recent, "recent", "2999-01-01T00:00:00Z" },
            }) do
                exec([[INSERT INTO kickside_automation_receipt
                    (owner_id,source_port,item_key,map_slot,identity_key,updated_at)
                    VALUES ($1,'source',$2,'slot',$2,$3)]], row)
            end
            local opened = db()
            local tx, begin_err = opened:begin()
            test.is_nil(begin_err, tostring(begin_err))
            local first, first_err = retention.prune_orphans_tx(tx, "2020-01-01T00:00:00Z", 1)
            test.is_nil(first_err, tostring(first_err))
            test.eq(first, 1)
            local second, second_err = retention.prune_orphans_tx(tx, "2020-01-01T00:00:00Z", 1)
            test.is_nil(second_err, tostring(second_err))
            test.eq(second, 1)
            local _, commit_err = tx:commit()
            opened:release()
            test.is_nil(commit_err, tostring(commit_err))
            test.eq(count(orphan), 0)
            test.eq(count(active), 1)
            test.eq(count(pending), 1)
            test.eq(count(recent), 1)
            for _, owner in ipairs({ orphan, active, pending, recent }) do
                exec("DELETE FROM kickside_automation_receipt WHERE owner_id=$1", { owner })
                exec("DELETE FROM kickside_automation_drive WHERE automation_id=$1", { owner })
                exec("DELETE FROM kickside_automation_command WHERE automation_id=$1", { owner })
            end
        end)

        test.it("retires settled event mappings by age in resumable bounded batches without deleting destinations", function()
            local owner, destination = uuid.v7(), uuid.v7()
            exec("INSERT INTO kickside_thread (id) VALUES ($1)", { destination })
            exec([[INSERT INTO kickside_automation_drive (automation_id,drive_key,source_kind,action_json)
                VALUES ($1,'main','event','{"source_ref":"events"}')]], { owner })
            for _, item in ipairs({ "first", "second", "recent" }) do
                exec([[INSERT INTO kickside_automation_receipt
                    (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                    VALUES ($1,'events',$2,'slot',$2,$3,$4)]],
                    { owner, item, '{"id":"' .. destination .. '"}',
                        item == "recent" and "2999-01-01T00:00:00Z" or "2020-01-01T00:00:00Z" })
            end
            for expected = 2, 1, -1 do
                local opened = db()
                local tx = assert(opened:begin())
                local removed, err = retention.prune_orphans_tx(tx, "2020-01-01T00:00:00Z", 1)
                test.is_nil(err, tostring(err))
                test.is_nil(select(2, tx:commit()))
                opened:release()
                test.eq(removed, 1)
                test.eq(count(owner), expected)
            end
            local opened = db()
            local tx = assert(opened:begin())
            local removed, err = retention.prune_orphans_tx(tx, "2020-01-01T00:00:00Z", 1)
            test.is_nil(err, tostring(err))
            test.is_nil(select(2, tx:commit()))
            test.eq(removed, 0)
            local destinations, read_err = opened:query("SELECT id FROM kickside_thread WHERE id=$1", { destination })
            opened:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(#destinations, 1)
            exec("DELETE FROM kickside_automation_receipt WHERE owner_id=$1", { owner })
            exec("DELETE FROM kickside_automation_drive WHERE automation_id=$1", { owner })
            exec("DELETE FROM kickside_thread WHERE id=$1", { destination })
        end)

        test.it("preserves event mappings with delivery, replay, or reconciliation obligations", function()
            for _, obligation in ipairs({ "retrying", "waiting", "uncertain", "parked", "dead", "resolved",
                    "command", "prepared", "admission", "round", "reconcile", "collection", "port", "pass" }) do
                local owner = uuid.v7()
                exec([[INSERT INTO kickside_automation_drive (automation_id,drive_key,source_kind,action_json)
                    VALUES ($1,'main','event','{"source_ref":"events"}')]], { owner })
                exec([[INSERT INTO kickside_automation_receipt
                    (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                    VALUES ($1,'events','item','slot','identity','{"id":"remote"}','2000-01-01T00:00:00Z')]], { owner })
                if obligation == "command" then
                    exec([[INSERT INTO kickside_automation_command
                        (automation_id,generation,pending_request_id,pending_digest,pending_kind,pending_input_json,pending_drives_json,pending_step)
                        VALUES ($1,1,'request','digest','resync_event','{}','[]','pins')]], { owner })
                elseif obligation == "prepared" then
                    exec([[INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                        VALUES ($1,'key','hash','{}','2000-01-01T00:00:00Z')]], { owner })
                elseif obligation == "admission" then
                    exec([[UPDATE kickside_automation_drive SET admission_json='{"delivery":{"prepared_key":"key"}}' WHERE automation_id=$1]], { owner })
                elseif obligation == "round" then
                    exec("UPDATE kickside_automation_drive SET round_token='round' WHERE automation_id=$1", { owner })
                elseif obligation == "reconcile" then
                    exec([[INSERT INTO kickside_automation_drive (automation_id,drive_key,source_kind,action_json)
                        VALUES ($1,'reconcile','reconcile','{"source_ref":"events"}')]], { owner })
                elseif obligation == "collection" then
                    exec("UPDATE kickside_automation_drive SET source_kind='collection' WHERE automation_id=$1", { owner })
                elseif obligation == "port" then
                    exec([[UPDATE kickside_automation_drive SET action_json='{"source_ref":"other"}' WHERE automation_id=$1]], { owner })
                elseif obligation == "pass" then
                    exec("UPDATE kickside_automation_receipt SET pass_id='pass' WHERE owner_id=$1", { owner })
                else
                    exec([[INSERT INTO kickside_trigger_item_ledger
                        (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,first_failed_at,last_failed_at,created_at,updated_at)
                        VALUES ($1,'events','item','item','delivery','{}',$2,'2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',
                            '2000-01-01T00:00:00Z','2000-01-01T00:00:00Z')]], { owner, obligation })
                end
                local opened = db()
                local tx = assert(opened:begin())
                local removed, err = retention.prune_orphans_tx(tx, "2020-01-01T00:00:00Z", 1000)
                test.is_nil(err, tostring(err))
                test.is_nil(select(2, tx:commit()))
                opened:release()
                test.eq(count(owner), 1, obligation)
                for _, table_name in ipairs({ "kickside_automation_receipt", "kickside_trigger_item_ledger" }) do
                    exec("DELETE FROM " .. table_name .. " WHERE owner_id=$1", { owner })
                end
                for _, table_name in ipairs({ "kickside_automation_drive", "kickside_automation_command", "kickside_automation_prepared" }) do
                    exec("DELETE FROM " .. table_name .. " WHERE automation_id=$1", { owner })
                end
            end
        end)

        test.it("retains a mapped orphan until destination deletion is proven", function()
            local owner = uuid.v7()
            exec([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                VALUES ($1,'source','ambiguous','default','ambiguous','{"id":"remote"}','2000-01-01T00:00:00Z')]], { owner })
            local opened = db()
            local tx = assert(opened:begin())
            local removed, err = retention.prune_orphans_tx(tx, "2020-01-01T00:00:00Z", 10)
            test.is_nil(err, tostring(err))
            test.eq(removed, 0)
            test.is_nil(select(2, tx:commit()))
            opened:release()
            test.eq(count(owner), 1)
            exec("DELETE FROM kickside_automation_receipt WHERE owner_id=$1", { owner })
        end)
    end)
end)
