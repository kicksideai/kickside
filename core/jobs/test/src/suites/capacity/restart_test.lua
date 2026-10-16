-- Kill the process owning an open jobs transaction, then a process with the
-- same committed work, and keep writing from a fresh process on both engines.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local PROBE = "app:restart_probe"

local function db(): sql.DB
    local handle, err = sql.get("app:db")
    if not handle then error("test database unavailable: " .. tostring(err)) end
    if err or not handle then error("jobs restart DB unavailable: " .. tostring(err)) end
    return handle :: sql.DB
end

local function physical(owner: string, expected_jobs: integer, expected_runs: integer): ()
    local handle = db()
    local jobs, jobs_err = handle:query([[SELECT COUNT(*) AS n FROM kickside_job
        WHERE owner_kind='test' AND owner_id=$1]], { owner })
    test.is_nil(jobs_err)
    local runs, runs_err = handle:query([[SELECT COUNT(*) AS n FROM kickside_job_run
        WHERE owner_kind='test' AND owner_id=$1]], { owner })
    test.is_nil(runs_err)
    handle:release()
    test.eq(tonumber(jobs[1].n), expected_jobs)
    test.eq(tonumber(runs[1].n), expected_runs)
end

local function enqueue(owner: string, key: string): string
    local handle = db()
    local id, err = lifecycle.enqueue_job(handle, tostring(handle:type()), {
        owner_locator = { kind = "test", id = owner },
        job_identity = { namespace = "restart", scope = owner, key = key },
        job_type = "test.restart", parked = true,
    })
    handle:release()
    test.is_nil(err)
    return id :: string
end

local function lease(id: string): table
    local handle = db()
    local value, err = job_fixture.lease_own(handle, tostring(handle:type()), id)
    if not value then error("test job lease fails: " .. tostring(err)) end
    handle:release()
    test.is_nil(err)
    return { token = value.lease_token, execution_seq = tonumber(value.execution_seq) }
end

local function exit_of(events: any, pid: any): any
    while true do
        local selected = channel.select({ events:case_receive() })
        local event = selected.value
        if type(event) == "table" and tostring(event.from) == tostring(pid)
            and event.kind == process.event.EXIT then return event end
    end
end

local function ready_from(inbox: any, events: any, pid: any, nonce: string): ()
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive() })
        if selected.channel == events then
            local event = selected.value
            if type(event) == "table" and tostring(event.from) == tostring(pid) then
                error("jobs restart probe exited before its commit boundary: "
                    .. tostring(event.result and event.result.error))
            end
        end
        if selected.channel == inbox then
            local message = selected.value
            if message:topic() == "restart_ready" then
                local data = message:payload():data()
                if type(data) == "table" and data.nonce == nonce then
                    test.eq(data.pid, tostring(pid))
                    return
                end
            end
        end
    end
end

local function spawn(args: table): (any, any, any)
    local events = process.events()
    local inbox = process.inbox()
    args.parent_pid = tostring(process.pid())
    args.nonce = uuid.v7()
    local pid, err = process.spawn_monitored(PROBE, "app:processes", args)
    test.is_nil(err)
    test.not_nil(pid)
    return pid, events, { inbox = inbox, nonce = args.nonce }
end

local function kill_at(args: table): string
    local pid, events, signal = spawn(args)
    ready_from(signal.inbox, events, pid, signal.nonce)
    local _, terminate_err = process.terminate(pid)
    test.is_nil(terminate_err)
    exit_of(events, pid)
    return tostring(pid)
end

local function attempt(args: table): string
    local pid, events = spawn(args)
    local event = exit_of(events, pid)
    test.is_nil(event.result.error)
    local answer = event.result.value
    test.is_nil(answer.error)
    test.is_true(answer.accepted)
    return tostring(pid)
end

local function status(id: string): string
    local handle = db()
    local rows, err = handle:query("SELECT status FROM kickside_job WHERE id=$1", { id })
    handle:release()
    test.is_nil(err)
    return rows[1].status
end

local function define_tests()
    test.describe("jobs writes across real process restart", function()
        test.it("rolls back an uncommitted enqueue, keeps a committed one and admits the next", function()
            local owner = uuid.v7()
            local first = kill_at({ operation = "job", owner = owner, key = "first", phase = "uncommitted" })
            physical(owner, 0, 0)
            local second = kill_at({ operation = "job", owner = owner, key = "first", phase = "committed" })
            test.is_true(first ~= second)
            physical(owner, 1, 0)
            local third = attempt({ operation = "job", owner = owner, key = "second", phase = "attempt" })
            test.is_true(second ~= third)
            physical(owner, 2, 0)
        end)

        test.it("rolls back an uncommitted completion, keeps a committed one and completes the next", function()
            local owner = uuid.v7()
            local first_job = enqueue(owner, "run-first")
            local second_job = enqueue(owner, "run-second")
            local first_lease = lease(first_job)
            local second_lease = lease(second_job)
            physical(owner, 2, 0)
            local first = kill_at({ operation = "run", owner = owner, job_id = first_job,
                lease = first_lease, phase = "uncommitted" })
            physical(owner, 2, 0)
            test.eq(status(first_job), "running")
            local second = kill_at({ operation = "run", owner = owner, job_id = first_job,
                lease = first_lease, phase = "committed" })
            test.is_true(first ~= second)
            physical(owner, 2, 1)
            test.eq(status(first_job), "done")
            local third = attempt({ operation = "run", owner = owner, job_id = second_job,
                lease = second_lease, phase = "attempt" })
            test.is_true(second ~= third)
            physical(owner, 2, 2)
            test.eq(status(second_job), "done")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
