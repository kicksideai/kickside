-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local drive = require("drive")
local h = require("round_harness")
local repair = require("repair")

return {run = test.run_cases(function()
    test.describe("stranded drive repair with a live worker", function()
        local worker, listener
        test.after_each(function()
            if worker then h.stop_worker(worker); worker = nil end
            if listener then h.close_round(listener); listener = nil end
        end)
        test.it("delivers a repaired event drive on an already running pool without another producer wake", function()
            h.await_migrations()
            local env = h.setup("drive_repair_live")
            local db = h.db()
            local tx = assert(db:begin())
            local _, insert_err = drive.insert_tx(tx, {
                automation_id = env.automation_id, drive_key = "repair", source_kind = "event",
                source_thread_id = env.thread_id,
                action = {source_ref = "fixture:repair", event_type = h.EVENT_TYPE},
                applied = {declaration = {}, policy = h.drive_policy(nil)},
            })
            test.is_nil(insert_err, tostring(insert_err))
            local _, update_err = tx:execute("UPDATE kickside_automation_drive SET job_id=$1"
                .. " WHERE automation_id=$2 AND drive_key='repair'", {uuid.v7(), env.automation_id})
            test.is_nil(update_err, tostring(update_err))
            assert(tx:commit())
            db:release()
            listener = h.listen_round(env.automation_id, "repair")
            env.append("repair backlog")
            worker = h.start_worker()
            h.await_worker_pass("repair-ready-" .. uuid.v7())
            db = h.db()
            local result = repair({db = db, id = "app:drive-repair-live:" .. uuid.v7()})
            db:release()
            test.eq(result.status, "complete", tostring(result.error))
            -- Nothing enqueues or wakes workers between repair and this receipt.
            h.receive_logged(listener)
            -- The sink receipt precedes the round's cursor commit. Wait for
            -- that durable state, rather than racing its acknowledgement.
            local deadline = time.after("5s")
            local repaired = h.read_drive(env.automation_id, "repair")
            while repaired.event_seq == 0 do
                local got = channel.select({deadline:case_receive(), time.after("10ms"):case_receive()})
                if got.channel == deadline then error("repaired round did not commit its cursor") end
                repaired = h.read_drive(env.automation_id, "repair")
            end
            test.is_true(repaired.event_seq > 0)
            test.eq(repaired.phase, drive.PHASE.ACTIVE)
        end)
    end)
end)}
