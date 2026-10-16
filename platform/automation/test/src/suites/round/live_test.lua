local test = require("test")
local json = require("json")
local drive = require("drive")
local slot = require("slot")
local h = require("round_harness")
local db, query, read_drive, log_rows = h.db, h.query, h.read_drive, h.log_rows
local EVENT_TYPE = h.EVENT_TYPE

type Map = { [string]: any }
return { run = test.run_cases(function()
    test.describe("automation round: schedules, controls, blocks and the live slot", function()
        local env: Map = {}
        local automation_id, thread_id = "", ""
        local append: (string) -> () = function(_: string) end
        local live_worker: string? = nil
        local live_listener: Map? = nil
        test.before_all(function()
            h.await_migrations()
            env = h.setup("round_live")
            automation_id, thread_id, append = env.automation_id, env.thread_id, env.append
        end)
        test.after_each(function()
            if live_worker then h.stop_worker(live_worker); live_worker = nil end
            if live_listener then h.close_round(live_listener); live_listener = nil end
        end)
        test.it("runs through the real drive slot worker: provision, claim, live identity, delivery, rearm", function()
            local d = db()
            local tx = d:begin()
            local _, insert_err = drive.insert_tx(tx, { automation_id = automation_id, drive_key = "live", source_kind = "event",
                source_thread_id = thread_id, action = { source_ref = "fixture:live", event_type = EVENT_TYPE },
                applied = { declaration = {}, policy = h.drive_policy(nil) } })
            if insert_err then tx:rollback() else tx:commit() end
            d:release()
            test.is_nil(insert_err, tostring(insert_err))
            local listener = h.listen_round(automation_id, "live")
            live_listener = listener
            append("live")
            local job_id, provision_err = slot.provision(automation_id, "live")
            test.is_nil(provision_err, tostring(provision_err))
            local probe_key = h.probe_key_for(job_id :: string)

            -- A live jobs worker claims the due slot and runs its round; the test
            -- waits for that round's committed effects.
            live_worker = h.start_worker()
            h.receive_logged(listener)
            h.await_worker_pass(probe_key)
            local live = read_drive(automation_id, "live")
            test.is_true(#log_rows(automation_id, "live") > 0, json.encode(live))
            test.is_true(live.event_seq > 0)
            test.eq(live.phase, drive.PHASE.ACTIVE)
            local job = query("SELECT status, scheduled_at, lease_token FROM kickside_job WHERE id = $1", { job_id })[1]
            test.eq(job.status, "pending")
            test.is_nil(job.lease_token)
        end)

    end)
end) }
