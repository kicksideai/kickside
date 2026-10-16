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
