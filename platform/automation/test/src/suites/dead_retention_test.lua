-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
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
        for _,legacy in ipairs({false,true}) do
            test.it("reclaims expired dead tombstones together with prepared output " .. tostring(legacy), function()
                local db=assert(sql.get("app:db"))
                local id=owner(db)
                local expiry=legacy and sql.NULL or "1900-01-01T00:00:00Z"
                for index=1,5 do
                    local key="blocked-" .. tostring(index)
                    execute(db, [[INSERT INTO kickside_trigger_item_ledger
                        (owner_id,source_port,item_key,identity_key,envelope_json,state,first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                        VALUES ($1,'source',$2,$2,'{}','dead',$3,$3,$3,$3,$4)]],{id,key,"1900-01-01T00:00:00Z",expiry})
                    execute(db, [[INSERT INTO kickside_automation_prepared
                        (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                        VALUES ($1,$2,'hash','{}','1900-01-01T00:00:00Z')]],{id,key})
                end
                execute(db, [[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,identity_key,envelope_json,state,first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                    VALUES ($1,'source','eligible','eligible','{}','dead',$2,$2,$2,$2,$3)]],
                    {id,"1901-01-01T00:00:00Z",legacy and sql.NULL or "1901-01-01T00:00:00Z"})
                local function deadline(): string?
                    local deadlines,err=ledger.retention_deadlines(db,2)
                    test.is_nil(err,tostring(err))
                    local found: string?=nil
                    for _,entry in ipairs(deadlines) do
                        local at=legacy and entry.updated_at or entry.expires_at
                        if at and (not found or at<found) then found=at end
                    end
                    return found
                end
                local before=deadline()
                local tx=assert(db:begin())
                local removed,err
                if legacy then removed,err=ledger.prune_orphans_tx(tx,"1950-01-01T00:00:00Z",2)
                else removed,err=ledger.prune_tx(tx,"1950-01-01T00:00:00Z",2) end
                test.is_nil(err,tostring(err))
                tx:commit()
                local retained=rows(db,id)
                local after=deadline()
                local prepared=assert(db:query("SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id=$1",{id}))
                test.eq(#prepared,3,"the same transaction removes exactly the expired candidates outputs")
                execute(db,"DELETE FROM kickside_automation_prepared WHERE automation_id=$1",{id})
                cleanup(db,id)
                db:release()
                test.eq(before,"1900-01-01T00:00:00Z","dead prepared output expires with its tombstone")
                test.eq(removed,2,"expired prepared output cannot block a bounded maintenance page")
                test.eq(#retained,4)
                test.eq(after,"1900-01-01T00:00:00Z","maintenance remains due until the backlog drains")
            end)
        end
        for _,legacy in ipairs({false,true}) do
            test.it("expires a full journal-referenced page without retaining a past deadline " .. tostring(legacy),function()
                local db=assert(sql.get("app:db"))
                local id=owner(db)
                local journal={}
                for index=1,3 do
                    local key="admitted-" .. tostring(index)
                    local prepared="prepared-" .. tostring(index)
                    journal[key]={prepared_key=prepared}
                    execute(db,[[INSERT INTO kickside_trigger_item_ledger
                        (owner_id,source_port,item_key,identity_key,envelope_json,state,first_failed_at,last_failed_at,created_at,updated_at,expires_at,execution_identity_json)
                        VALUES ($1,'source',$2,$2,'{}','dead',$3,$3,$3,$3,$4,$5)]],
                        {id,key,"1700-01-01T00:00:00Z",legacy and sql.NULL or "1700-01-01T00:00:00Z",json.encode({prepared_key=prepared})})
                    for _,candidate in ipairs({key,prepared}) do
                        execute(db,[[INSERT INTO kickside_automation_prepared
                            (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                            VALUES ($1,$2,'hash','{}','1700-01-01T00:00:00Z')]],{id,candidate})
                    end
                end
                execute(db,"UPDATE kickside_automation_drive SET admission_json=$1 WHERE automation_id=$2",{json.encode(journal),id})
                local tx=assert(db:begin())
                local count,err
                if legacy then count,err=ledger.prune_orphans_tx(tx,"1750-01-01T00:00:00Z",3)
                else count,err=ledger.prune_tx(tx,"1750-01-01T00:00:00Z",3) end
                if err then tx:rollback() else tx:commit() end
                local retained=rows(db,id)
                local prepared=assert(db:query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id}))
                local deadlines,deadline_err=ledger.retention_deadlines(db,3)
                execute(db,"DELETE FROM kickside_automation_prepared WHERE automation_id=$1",{id})
                cleanup(db,id);db:release()
                test.is_nil(err,tostring(err));test.is_nil(deadline_err,tostring(deadline_err))
                test.eq(count,3,"journal references protect prepared output, never expired ledger rows")
                test.eq(#retained,0,"a full page makes full progress")
                test.eq(#prepared,6,"both journal identity and prepared keys remain protected")
                for _,entry in ipairs(deadlines) do
                    test.is_true(entry.expires_at~="1700-01-01T00:00:00Z" and entry.updated_at~="1700-01-01T00:00:00Z",
                        "the drained page cannot continuously re-arm maintenance")
                end
            end)
        end
        test.it("deletes a prepared-output batch with one bounded statement",function()
            local db=assert(sql.get("app:db"))
            local id=owner(db)
            execute(db,[[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<100)
                INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,identity_key,envelope_json,state,first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                SELECT $1,'source',CAST(x AS TEXT),CAST(x AS TEXT),'{}','dead',$2,$2,$2,$2,$2 FROM n]],
                {id,"1800-01-01T00:00:00Z"})
            execute(db,[[INSERT INTO kickside_automation_prepared
                (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                SELECT owner_id,identity_key,'hash','{}',updated_at FROM kickside_trigger_item_ledger WHERE owner_id=$1]],{id})
            local tx=assert(db:begin())
            local statements=0
            local executor={db_type=function() return tx:db_type() end,query=function(_,statement,params) return tx:query(statement,params) end,
                execute=function(_,statement,params)
                    if statement:find("DELETE FROM kickside_automation_prepared",1,true) then statements=statements+1 end
                    return tx:execute(statement,params)
                end}
            local count,err=ledger.prune_tx(executor,"1850-01-01T00:00:00Z",100)
            if err then tx:rollback() else tx:commit() end
            test.is_nil(err,tostring(err))
            test.eq(count,100)
            test.eq(#rows(db,id),0)
            test.eq(#assert(db:query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id})),0)
            cleanup(db,id);db:release()
            test.eq(statements,1,"prepared cleanup sends a bounded batch instead of one request per item")
        end)
        test.it("rolls back both dead evidence deletes if prepared cleanup fails",function()
            local db=assert(sql.get("app:db"))
            local id=owner(db)
            record(db,id,ledger.STATE.DEAD)
            local key=rows(db,id)[1].identity_key
            execute(db,[[INSERT INTO kickside_automation_prepared
                (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                VALUES ($1,$2,'hash','{}','1900-01-01T00:00:00Z')]],{id,key})
            local tx=assert(db:begin())
            local executor={db_type=function() return tx:db_type() end,query=function(_,statement,params) return tx:query(statement,params) end,
                execute=function(_,statement,params)
                    if statement:find("DELETE FROM kickside_automation_prepared",1,true) then
                        return nil,errors.new({kind=errors.INTERNAL,message="injected prepared delete failure"})
                    end
                    return tx:execute(statement,params)
                end}
            local _,err=ledger.prune_tx(executor,"2002-01-01T00:00:00Z",100)
            tx:rollback()
            test.not_nil(err,"failure reaches the maintenance transaction")
            test.eq(#rows(db,id),1)
            test.eq(#assert(db:query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{id})),1)
            execute(db,"DELETE FROM kickside_automation_prepared WHERE automation_id=$1",{id})
            cleanup(db,id);db:release()
        end)
        test.it("preserves unresolved output while expiring dead items despite pending commands",function()
            local db=assert(sql.get("app:db"))
            local id,pending=owner(db),owner(db)
            for _,state in ipairs({"retrying","waiting","uncertain","parked"}) do
                execute(db,[[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,identity_key,envelope_json,state,first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                    VALUES ($1,'source',$2,$2,'{}',$2,$3,$3,$3,$3,$3)]],{id,state,"1900-01-01T00:00:00Z"})
                execute(db,[[INSERT INTO kickside_automation_prepared
                    (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                    VALUES ($1,$2,'hash','{}','1900-01-01T00:00:00Z')]],{id,state})
            end
            record(db,pending,ledger.STATE.DEAD)
            local key=rows(db,pending)[1].identity_key
            execute(db,[[INSERT INTO kickside_automation_prepared
                (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                VALUES ($1,$2,'hash','{}','1900-01-01T00:00:00Z')]],{pending,key})
            execute(db,[[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,pending_input_json,pending_drives_json,pending_step)
                VALUES ($1,1,'install','digest','install','{}','[]','install')]],{pending})
            prune(db)
            test.eq(#rows(db,id),4)
            test.eq(#rows(db,pending),0,"a pending command does not retain expired dead items")
            test.eq(#assert(db:query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id IN ($1,$2)",{id,pending})),4)
            execute(db,"DELETE FROM kickside_automation_command WHERE automation_id=$1",{pending})
            prune(db)
            test.eq(#rows(db,pending),0)
            test.eq(#assert(db:query("SELECT 1 FROM kickside_automation_prepared WHERE automation_id=$1",{pending})),0)
            execute(db,"DELETE FROM kickside_automation_prepared WHERE automation_id=$1",{id})
            cleanup(db,id);cleanup(db,pending);db:release()
        end)
        for _,legacy in ipairs({false,true}) do
            test.it("keeps dead cleanup due behind a pending command " .. tostring(legacy),function()
                local db=assert(sql.get("app:db"))
                local id=owner(db)
                record(db,id,ledger.STATE.DEAD)
                if legacy then execute(db,"UPDATE kickside_trigger_item_ledger SET expires_at=NULL WHERE owner_id=$1",{id}) end
                execute(db,[[INSERT INTO kickside_automation_command
                    (automation_id,generation,pending_request_id,pending_digest,pending_kind,pending_input_json,pending_drives_json,pending_step)
                    VALUES ($1,1,'replay','digest','control','{}','[]','control')]],{id})
                local deadlines,err=ledger.retention_deadlines(db,2)
                test.is_nil(err,tostring(err))
                local found=false
                for _,entry in ipairs(deadlines) do
                    if (legacy and entry.updated_at=="2000-01-01T00:00:00Z")
                        or (not legacy and entry.expires_at=="2001-01-01T00:00:00Z") then found=true end
                end
                local tx=assert(db:begin())
                local removed,prune_err
                if legacy then removed,prune_err=ledger.prune_orphans_tx(tx,"2002-01-01T00:00:00Z",2)
                else removed,prune_err=ledger.prune_tx(tx,"2002-01-01T00:00:00Z",2) end
                if prune_err then tx:rollback() else tx:commit() end
                execute(db,"DELETE FROM kickside_automation_command WHERE automation_id=$1",{id})
                cleanup(db,id);db:release()
                test.is_nil(prune_err,tostring(prune_err))
                test.is_true(found,"pending commands cannot hide an expiry deadline")
                test.eq(removed,1)
            end)
        end
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
                db_type = function() return tx:db_type() end,
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
