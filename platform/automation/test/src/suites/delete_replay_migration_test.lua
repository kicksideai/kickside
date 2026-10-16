-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local json = require("json")
local funcs = require("funcs")
local uuid = require("uuid")

return { run = test.run_cases(function()
    test.describe("record delete delivery migration", function()
        test.it("reopens only affected delivery identities and preserves their evidence", function()
            local owner = uuid.v7()
            local db = assert(sql.get("app:db"))
            local function execute(statement, args)
                local _, err = db:execute(statement, args)
                test.is_nil(err, tostring(err))
            end
            for _, drive in ipairs({ { "main", "collection", "source", "kickside.crm.sink:crm_records" },
                { "reconcile", "reconcile", "source", "kickside.crm.sink:crm_records" },
                { "other", "collection", "other", "example:records" } }) do
                execute([[INSERT INTO kickside_automation_drive
                    (automation_id,drive_key,source_kind,action_json,sink_port)
                    VALUES ($1,$2,$3,$4,$5)]],
                    { owner, drive[1], drive[2], json.encode({ source_ref = drive[3] }), drive[4] })
            end
            local cases = {
                { "source", "same", "other-identity", "dead", "upsert", "input.kind is required" },
                { "source", "unrelated", "unrelated", "dead", "delete", "different failure" },
                { "source", "resolved", "resolved", "resolved", "delete", "input.kind is required" },
                { "other", "other", "other", "dead", "delete", "input.kind is required" },
                { "reconcile:source", "sweep", "sweep", "dead", "delete", "input.kind is required" },
            }
            for index = 1, 205 do
                cases[#cases + 1] = { "source", index == 1 and "same" or tostring(index),
                    "delete-" .. tostring(index), "dead", "delete", "sink write: input.kind is required" }
            end
            for _, row in ipairs(cases) do
                execute([[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,identity_key,dedup_key,envelope_json,state,
                     attempts,first_failed_at,last_failed_at,error_code,error_message,retriable,terminal,
                     expires_at,created_at,updated_at,execution_identity_json)
                    VALUES ($1,$2,$3,$4,$4,$5,$6,3,'2026-01-01','2026-01-02','invalid_request',$7,
                            false,true,'2099-01-01','2026-01-01','2026-01-02','preserved-identity')]],
                    { owner, row[1], row[2], row[3], json.encode({ item_key = row[2], dedup_key = row[3],
                        op = row[5], payload = {}, reservation = { key = "old" } }), row[4], row[6] })
            end
            execute("DELETE FROM _migrations WHERE id=$1", { "kickside.automation.migrations:13_record_delete_replay" })
            db:release()
            local result, err = funcs.call("kickside.automation.migrations:13_record_delete_replay", {
                database_id = "app:db", id = "kickside.automation.migrations:13_record_delete_replay", direction = "up" })
            test.is_nil(err, tostring(err))
            test.eq(result.failed, 0, json.encode(result))
            db = assert(sql.get("app:db"))
            local rows, read_err = db:query([[SELECT source_port,item_key,identity_key,state,attempts,
                envelope_json,execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id=$1]], { owner })
            test.is_nil(read_err)
            test.eq(#rows, #cases)
            local reopened = 0
            for _, row in ipairs(rows) do
                local item = assert(json.decode(row.envelope_json))
                test.eq(tonumber(row.attempts), 3)
                test.eq(row.execution_identity_json, "preserved-identity")
                if row.state == "retrying" then
                    reopened = reopened + 1
                    test.eq(item.op, "delete")
                    test.eq(item.attempt_generation, 1)
                    test.is_nil(item.reservation)
                    test.eq(row.identity_key, item.delivery_key)
                else
                    test.is_nil(item.attempt_generation)
                    test.not_nil(item.reservation)
                end
            end
            test.eq(reopened, 206)
            local drives = assert(db:query("SELECT drive_key,unresolved_count,wake_generation FROM kickside_automation_drive WHERE automation_id=$1", { owner }))
            for _, d in ipairs(drives) do
                test.eq(tonumber(d.unresolved_count), d.drive_key == "main" and 205 or (d.drive_key == "reconcile" and 1 or 0))
                test.eq(tonumber(d.wake_generation), d.drive_key == "other" and 0 or 1)
            end
            execute("DELETE FROM _migrations WHERE id=$1", { "kickside.automation.migrations:13_record_delete_replay" })
            db:release()
            result, err = funcs.call("kickside.automation.migrations:13_record_delete_replay", {
                database_id = "app:db", id = "kickside.automation.migrations:13_record_delete_replay", direction = "up" })
            test.is_nil(err)
            test.eq(result.failed, 0, json.encode(result))
            db = assert(sql.get("app:db"))
            local after = assert(db:query("SELECT COUNT(*) AS n FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND state='retrying'", { owner }))
            test.eq(tonumber(after[1].n), 206)
            execute("DELETE FROM kickside_trigger_item_ledger WHERE owner_id=$1", { owner })
            execute("DELETE FROM kickside_automation_drive WHERE automation_id=$1", { owner })
            db:release()
        end)
    end)
end) }
