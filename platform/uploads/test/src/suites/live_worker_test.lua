local test = require("test")
local jobs = require("jobs")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local time = require("time")
local channel = require("channel")

local function await_probe(): string
    local topic = "uploads.live.probe." .. uuid.v4()
    local signal = process.listen(topic, { message = true })
    local queued, queue_err = jobs.enqueue({ namespace = "uploads-live-probe", scope = "process",
        key = uuid.v4(), job_type = "app:live_probe", priority = -100000,
        owner_locator = { kind = "test", id = "uploads-live-probe" },
        immutable_payload = { reply_pid = tostring(process.pid()), reply_topic = topic } })
    if queue_err or not queued then error("upload worker probe enqueue failed: " .. tostring(queue_err)) end
    local selected = channel.select({ signal:case_receive(), time.after("15s"):case_receive() })
    process.unlisten(signal)
    if selected.channel ~= signal then error("upload worker did not claim probe") end
    local message = selected.value
    if message:topic() ~= topic or message:payload():data().job_id ~= queued.id then
        error("unexpected upload worker probe reply")
    end
    return tostring(queued.id)
end

local function define_tests()
    test.describe("uploads live worker", function()
        local worker_pid: string? = nil
        test.after_all(function()
            if worker_pid then process.cancel(worker_pid, "5s") end
        end)

        test.it("drives an upload process job through the resident jobs loop", function()
            local pid, spawn_err = process.spawn_monitored("app:single_worker_pool", "app:processes")
            test.is_nil(spawn_err)
            test.not_nil(pid)
            worker_pid = tostring(pid)
            -- A claimed probe proves the loop has a durable heartbeat before
            -- waking the parked upload job. The earlier ready event preceded
            -- that heartbeat, so its wake hint could miss every worker on PG.
            local first_probe_id = await_probe()

            local queued, queue_err = jobs.enqueue({
                namespace = "uploads-live-test", scope = "process", key = uuid.v4(),
                job_type = "kickside.uploads.service:process_job_proc",
                owner_locator = { kind = "test", id = "uploads-live-test" },
                immutable_payload = { upload_id = uuid.v4() },
                parked = true,
            })
            test.is_nil(queue_err)
            test.not_nil(queued)
            local woken, wake_err = jobs.wake_job(queued.id)
            test.is_nil(wake_err)
            test.is_true(woken.woken)
            -- One claim loop processes the earlier due upload before this
            -- later probe; the reply therefore follows durable completion.
            local second_probe_id = await_probe()

            local db, open_err = sql.get("app:db")
            test.is_nil(open_err)
            local rows, read_err = db:query("SELECT status,execution_seq FROM kickside_job WHERE id=$1", { queued.id })
            test.is_nil(read_err)
            local identities, identity_err = db:query(
                "SELECT id,job_identity,owner_id FROM kickside_job WHERE id=$1 OR id=$2 OR id=$3",
                { queued.id, first_probe_id, second_probe_id })
            test.is_nil(identity_err)
            test.eq(#identities, 3)
            for _, row in ipairs(identities) do
                local identity = tostring(row.job_identity)
                if tostring(row.id) == tostring(queued.id) then
                    test.eq(identity:sub(1, #"17:uploads-live-test"), "17:uploads-live-test")
                    test.eq(tostring(row.owner_id), "uploads-live-test")
                else
                    test.eq(identity:sub(1, #"18:uploads-live-probe"), "18:uploads-live-probe")
                    test.eq(tostring(row.owner_id), "uploads-live-probe")
                end
            end
            local runs, run_err = db:query("SELECT status,finished_at FROM kickside_job_run WHERE job_id=$1", { queued.id })
            test.is_nil(run_err)
            db:release()
            test.eq(rows[1].status, "done")
            test.is_true(tonumber(rows[1].execution_seq) >= 1)
            -- The skipped upload still has a durable completed claim record.
            test.eq(#runs, 1)
            test.eq(runs[1].status, "completed")
            test.not_nil(runs[1].finished_at)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
