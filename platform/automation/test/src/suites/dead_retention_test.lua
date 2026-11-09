-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local ledger = require("ledger")

local function execute(db: sql.DB, statement: string, params: table)
    local _, err = db:execute(statement, params)
    if err then error(tostring(err)) end
end
local function rows(db: sql.DB, owner: string): table
    local result, err = db:query("SELECT * FROM kickside_trigger_item_ledger WHERE owner_id=$1 ORDER BY item_key", {owner})
    if err then error(tostring(err)) end
    return result
end
local function owner(db: sql.DB): string
    local id = uuid.v7()
    execute(db, "INSERT INTO kickside_automation_drive (automation_id,drive_key,source_kind) VALUES ($1,'main','none')", {id})
    return id
end
local function record(db: sql.DB, id: string, state: string)
    local tx = assert(db:begin())
    local _, err = ledger.record_tx(tx, id, "source", {{item = {
        item_key = "item", dedup_key = "item", op = "upsert", payload = {value = 1}},
        state = state, error = {code = "invalid", retriable = false}}},
        "2000-01-01T00:00:00Z", "2001-01-01T00:00:00Z")
    if err then tx:rollback(); error(tostring(err)) end
    local _, commit_err = tx:commit()
    if commit_err then error(tostring(commit_err)) end
end
local function prune(db: sql.DB): integer
    local tx = assert(db:begin())
    local count, err = ledger.prune_tx(tx, "2002-01-01T00:00:00Z", 1000)
    if err then tx:rollback(); error(tostring(err)) end
    local _, commit_err = tx:commit()
    if commit_err then error(tostring(commit_err)) end
    return count
end
local function cleanup(db: sql.DB, id: string)
    execute(db, "DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1", {id})
    execute(db, "DELETE FROM kickside_automation_drive WHERE automation_id=$1", {id})
end

return test.run_cases(function()
    test.describe("dead delivery evidence retention", function()
        test.it("expires failed delivery tombstones after their dedupe window", function()
            local db = assert(sql.get("app:db"))
            local id = owner(db)
            record(db, id, ledger.STATE.RETRYING)
            record(db, id, ledger.STATE.DEAD)
            local row = rows(db, id)[1]
            test.eq(row.state, "dead")
            test.eq(tonumber(row.attempts), 2)
            test.eq(row.expires_at,"2001-01-01T00:00:00Z")
            prune(db)
            test.eq(#rows(db, id), 0)
            cleanup(db, id)
            db:release()
        end)
        test.it("expires both terminal states and preserves all unresolved states", function()
            local db = assert(sql.get("app:db"))
            local id = owner(db)
            for _, state in ipairs({"retrying", "waiting", "uncertain", "parked", "dead", "resolved"}) do
                execute(db, [[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                        first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                    VALUES ($1,'source',$2,$2,$2,'{}',$2,$3,$3,$3,$3,$3)]],
                    {id, state, "2000-01-01T00:00:00Z"})
            end
            prune(db)
            local retained = rows(db, id)
            test.eq(#retained, 4)
            for _,row in ipairs(retained) do test.is_true(row.state ~= "dead" and row.state ~= "resolved") end
            cleanup(db, id)
            db:release()
        end)
        test.it("rechecks unresolved state before deleting a previously terminal GC candidate", function()
            local db = assert(sql.get("app:db"))
            local id = owner(db)
            record(db, id, ledger.STATE.DEAD)
            record(db, id, ledger.STATE.RESOLVED)
            local tx = assert(db:begin())
            local changed = false
            local executor = {
                query = function(_self: any, statement: string, params: table): (any, error?)
                    local result, err = tx:query(statement, params)
                    if not err and not changed then
                        changed = true
                        local _, update_err = tx:execute(
                            "UPDATE kickside_trigger_item_ledger SET state='retrying' WHERE owner_id=$1", {id})
                        if update_err then return nil, update_err end
                    end
                    return result, err
                end,
                execute = function(_self: any, statement: string, params: table): (any, error?)
                    return tx:execute(statement, params)
                end,
            }
            local count, err = ledger.prune_tx(executor, "2002-01-01T00:00:00Z", 1000)
            local commit_err: error? = nil
            if err then
                tx:rollback()
            else
                local _, finish_err = tx:commit()
                commit_err = finish_err
            end
            local retained = rows(db, id)
            cleanup(db, id)
            db:release()
            test.is_nil(err)
            test.is_nil(commit_err)
            test.eq(count, 0)
            test.eq(#retained, 1)
            test.eq(retained[1].state, "retrying")
        end)
        test.it("ages terminal rows from earlier releases without requiring owner deletion", function()
            local db = assert(sql.get("app:db"))
            local id = owner(db)
            record(db, id, ledger.STATE.DEAD)
            execute(db, "UPDATE kickside_trigger_item_ledger SET expires_at=NULL WHERE owner_id=$1", {id})
            prune(db)
            test.eq(#rows(db, id), 1)
            local tx = assert(db:begin())
            test.is_nil(select(2, ledger.prune_orphans_tx(tx, "2002-01-01T00:00:00Z", 1000)))
            tx:commit()
            test.eq(#rows(db, id), 0)
            execute(db, "DELETE FROM kickside_automation_drive WHERE automation_id=$1", {id})
            tx = assert(db:begin())
            test.is_nil(select(2, ledger.prune_orphans_tx(tx, "2002-01-01T00:00:00Z", 1000)))
            tx:commit()
            test.eq(#rows(db, id), 0)
            db:release()
        end)
    end)
end)
