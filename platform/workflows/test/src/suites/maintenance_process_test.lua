-- Deterministic maintenance orchestration and boot recovery coverage.
local test = require("test")
local uuid = require("uuid")
local json = require("json")
local process = require("process")
local channel = require("channel")
local store = require("store")
local admission = require("admission")
local maintenance = require("maintenance")
local maintenance_loop = require("maintenance_loop")
local maintenance_schedule = require("maintenance_schedule")
local maintenance_wake = require("maintenance_wake")
local policy_config = require("policy_config")
local run_time = require("run_time")

type Map = { [string]: any }

local function make_driver(select_steps: any, deadlines: { any }, ticks: { any }?, options: any?): any
    local trace: { string } = {}
    local timers: { any } = {}
    local calls: { any } = {}
    local subscriptions: { any } = {}
    local inbox = { kind = "inbox" }
    local registry_channel = { kind = "registry" }
    local events = { kind = "events" }
    local function receive_case(self: any): any return { channel = self } end
    inbox.case_receive = receive_case
    registry_channel.case_receive = receive_case
    events.case_receive = receive_case
    local function channel_for(step: string, cases: { any }): any
        for _, case in ipairs(cases) do
            local source = case.channel
            if step == source.kind or (step == "timer" and source.kind == "timer") then return source end
        end
        error("requested " .. step .. " channel is not selectable")
    end
    local fake_channel = {
        select = function(cases: { any }): any
            local step = type(select_steps) == "function" and select_steps(cases)
                or table.remove(select_steps, 1)
            if not step then error("maintenance loop selected more times than scripted") end
            local selected = channel_for(step, cases)
            if step == "inbox" then
                return { channel = selected, ok = true, value = { topic = function(): string
                    return maintenance_wake.TOPIC
                end } }
            end
            if step == "events" then
                return { channel = selected, ok = true, value = { kind = "cancel" } }
            end
            if step == "registry" then
                return { channel = selected, ok = true, value = { kind = "registry.commit" } }
            end
            return { channel = selected, ok = true, value = true }
        end,
    }
    local fake_time = {
        MILLISECOND = 1000000,
        now = function(): any return {
            utc = function(self: any): any return self end,
            add = function(self: any, _duration: number): any return self end,
            format = function(_self: any, _layout: string): string return "retry-deadline" end,
        } end,
        after = function(duration: string): any
            local timer = { kind = "timer", duration = duration }
            timer.case_receive = receive_case
            timers[#timers + 1] = timer
            return timer
        end,
    }
    local fake_process = {
        event = { CANCEL = "cancel", OUTDATED = "outdated" },
        registry = {
            register = function(): (boolean, nil) trace[#trace + 1] = "register"; return true, nil end,
            unregister = function(): (boolean, nil) trace[#trace + 1] = "unregister"; return true, nil end,
        },
        inbox = function(): any return inbox end,
        events = function(): any return events end,
        upgrade = function(): () trace[#trace + 1] = "upgrade" end,
    }
    local scheduler = options and options.schedule or {
        next_deadline_ms = function(): (any, nil) return table.remove(deadlines, 1), nil end,
    }
    local deps = {
        time = fake_time,
        channel = fake_channel,
        process = fake_process,
        registry_events = {
            subscribe = function(namespace: string, topic: string): (any, nil)
                trace[#trace + 1] = "subscribe"
                subscriptions[#subscriptions + 1] = { namespace = namespace, topic = topic }
                return { channel = function(): any return registry_channel end,
                    close = function(): () trace[#trace + 1] = "close" end }, nil
            end,
        },
        maintenance_wake = { register = function(): (boolean, nil) return true, nil end,
            unregister = function(): (boolean, nil) return true, nil end, TOPIC = maintenance_wake.TOPIC },
        schedule = scheduler,
        run_time = options and options.run_time or nil,
        policy = { policy = function(): (any, nil) return { completion_initial_ms = 5000 }, nil end },
        funcs = { call = function(_entry: string, args: any): (any, nil)
            calls[#calls + 1] = args
            trace[#trace + 1] = args.recover and "boot_tick" or "tick"
            if options and options.func_call then return options.func_call(_entry, args) end
            local result = ticks and table.remove(ticks, 1) or nil
            return result or { continue_immediately = false }, nil
        end },
        logger = { named = function(): any return { warn = function(): () end } end },
    }
    return { deps = deps, trace = trace, timers = timers, calls = calls, subscriptions = subscriptions }
end

local function reserve_args(): Map
    local run_id, dataflow_id = uuid.v4(), uuid.v4()
    local payload, encode_err = json.encode({ version = 1, input = {}, commands = {},
        options = { dataflow_id = dataflow_id, metadata = { run_id = run_id } }, start_options = {} })
    if encode_err then error(tostring(encode_err)) end
    return {
        run_id = run_id, dataflow_id = dataflow_id, workflow_id = uuid.v4(), version = 1,
        trigger_kind = "manual", origin = "published", execution_identity_json =
            '{"version":2,"principal":{"kind":"user","id":"maintenance-test"}}',
        creation_payload_json = payload,
    }
end

local function rows(sql_text: string, params: { any }): { Map }
    local db, open_err = store.open_db()
    if open_err or not db then error(tostring(open_err)) end
    local result, read_err = db:query(sql_text, params)
    db:release()
    if read_err then error(tostring(read_err)) end
    return result :: { Map }
end

local function define_tests()
    test.describe("workflow maintenance owner process", function()
        test.it("exits a cancelled standby without running recovery and closes its subscription", function()
            local driver = make_driver({}, {})
            driver.deps.maintenance_wake.register = function() return nil, nil, true end
            maintenance_loop.run(driver.deps)
            test.eq(#driver.calls, 0)
            test.eq(driver.trace[1], "subscribe")
            test.eq(driver.trace[2], "close")
        end)
        test.it("handles a committed run wake in an already-running owner", function()
            local inbox = process.inbox()
            local registered, register_err = maintenance_wake.register()
            test.is_nil(register_err)
            test.is_true(registered == true)

            local args = reserve_args()
            local reservation, reserve_err = admission.reserve(args)
            test.is_nil(reserve_err)
            test.not_nil(reservation)
            local received = channel.select({ inbox:case_receive() })
            test.eq(received.value:topic(), maintenance_wake.TOPIC)
            local committed = rows("SELECT run_id FROM workflow_runs WHERE run_id=$1", { args.run_id })
            test.eq(#committed, 1, "wake was delivered before the run commit became visible")

            local unregistered, unregister_err = maintenance_wake.unregister()
            test.is_nil(unregister_err)
            test.is_true(unregistered == true)
        end)

        test.it("runs a worker tick when the owner inbox receives a committed-change wake", function()
            local driver = make_driver({ "inbox", "events" }, { nil })
            maintenance_loop.run(driver.deps)
            test.eq(#driver.calls, 2)
            test.eq(driver.calls[1].recover, true)
            test.eq(driver.calls[2].recover, false)
            test.eq(driver.trace[2], "boot_tick")
            test.eq(driver.trace[3], "tick")
        end)

        test.it("runs a worker tick when registry.commit is received", function()
            local driver = make_driver({ "registry", "events" }, { nil })
            maintenance_loop.run(driver.deps)
            test.eq(#driver.calls, 2)
            test.eq(driver.calls[1].recover, true)
            test.eq(driver.calls[2].recover, false)
            test.eq(driver.trace[1], "subscribe")
            test.eq(driver.subscriptions[1].namespace, "registry")
            test.eq(driver.subscriptions[1].topic, "registry.commit")
        end)

        test.it("retries a failed boot maintenance tick from its exact retry timer", function()
            local retry_delays = { 1000, 0 }
            local failed_once = false
            local driver = make_driver({ "timer", "events" }, { nil, nil }, nil, {
                run_time = { until_ms = function(_deadline: string): (number, nil)
                    return table.remove(retry_delays, 1) or 0, nil
                end },
                func_call = function(_entry: string, _args: any): (any?, any?)
                    if not failed_once then failed_once = true; return nil, "simulated maintenance failure" end
                    return { continue_immediately = false }, nil
                end,
            })
            maintenance_loop.run(driver.deps)
            test.eq(#driver.calls, 2)
            test.eq(driver.calls[1].recover, true)
            test.eq(driver.calls[2].recover, true)
            test.eq(#driver.timers, 1)
            test.eq(driver.timers[1].duration, "1000ms")
        end)

        test.it("fires the earliest exact deadline once and rearms from the next schedule", function()
            local driver = make_driver({ "timer", "events" }, { 1250, 3000 })
            maintenance_loop.run(driver.deps)
            test.eq(#driver.calls, 2)
            test.eq(driver.calls[1].recover, true)
            test.eq(driver.calls[2].recover, false)
            test.eq(#driver.timers, 2)
            test.eq(driver.timers[1].duration, "1250ms")
            test.eq(driver.timers[2].duration, "3000ms")
            test.eq(driver.trace[1], "subscribe", "registry events must be subscribed before boot recovery")
        end)

        test.it("arms due and overdue work with a positive timer duration", function()
            for _, deadline in ipairs({ 0, -5, 0.5 }) do
                local driver = make_driver({ "timer", "events" }, { deadline, 3000 })
                maintenance_loop.run(driver.deps)
                test.eq(driver.timers[1].duration, "1ms")
                test.eq(#driver.calls, 2)
                test.eq(driver.calls[2].recover, false)
            end
        end)

        test.it("creates no timer when no work has a pending deadline", function()
            local driver = make_driver({ "events" }, { nil })
            maintenance_loop.run(driver.deps)
            test.eq(#driver.calls, 1)
            test.eq(driver.calls[1].recover, true)
            test.eq(#driver.timers, 0)
        end)

        test.it("boot recovery publishes a persisted terminal event after restart", function()
            local args = reserve_args()
            local reservation, reserve_err = admission.reserve(args)
            test.is_nil(reserve_err)
            test.not_nil(reservation)
            local db, open_err = store.open_db()
            test.is_nil(open_err)
            local _, update_err = db:execute([[UPDATE workflow_runs SET status='completed', finished_at=$1,
                completion_check_at=NULL,  terminal_event_pending=TRUE,
                terminal_event_check_at='2000-01-01T00:00:00Z', public_meta_refreshed_at=$1 WHERE run_id=$2]],
                { (reservation :: Map).row.started_at, args.run_id })
            db:release()
            test.is_nil(update_err)

            local published: { any } = {}
            local fake_client = {}
            function fake_client:get_status(): (any, nil) error("publication must not read the engine") end
            function fake_client:create_workflow(): (any, nil) error("publication must not create a flow") end
            function fake_client:start(): (any, nil) error("publication must not start a flow") end
            function fake_client:execute(): (any, nil) error("publication must not execute a flow") end
            function fake_client:output(): (any, nil) error("publication must not read output") end
            local owner = maintenance.new({ client_new = function(): (any, nil) return fake_client, nil end,
                append_event = function(_workflow: string, event: any): (boolean, nil)
                    published[#published + 1] = event
                    return true, nil
                end })
            local result, tick_err = owner.tick(nil, args.run_id, true)
            test.is_nil(tick_err)
            test.eq((result :: Map).published, 1)
            test.eq(#published, 1)
            local pending = rows("SELECT terminal_event_pending FROM workflow_runs WHERE run_id=$1", { args.run_id })
            test.is_true(pending[1].terminal_event_pending == false or tonumber(pending[1].terminal_event_pending) == 0)
        end)

        test.it("schedules the earliest persisted completion, publication, or retention deadline", function()
            local completion_args, publication_args, retention_args = reserve_args(), reserve_args(), reserve_args()
            for _, args in ipairs({ completion_args, publication_args, retention_args }) do
                local reservation, reserve_err = admission.reserve(args)
                test.is_nil(reserve_err)
                test.not_nil(reservation)
            end
            local settings, settings_err = policy_config.policy()
            test.is_nil(settings_err)
            local retention_ms = settings.retention_runs_days * 24 * 60 * 60 * 1000

            local function execute(sql_text: string, params: { any }): ()
                local db, open_err = store.open_db()
                if open_err or not db then error(tostring(open_err)) end
                local _, execute_err = db:execute(sql_text, params)
                db:release()
                if execute_err then error(tostring(execute_err)) end
            end

            local scenarios = {
                { completion = "1900-01-01T00:00:00Z", publication = "1901-01-01T00:00:00Z",
                    retention = "1902-01-01T00:00:00Z", earliest = "1900-01-01T00:00:00Z" },
                { completion = "1901-01-01T00:00:00Z", publication = "1900-01-01T00:00:00Z",
                    retention = "1902-01-01T00:00:00Z", earliest = "1900-01-01T00:00:00Z" },
                { completion = "1901-01-01T00:00:00Z", publication = "1902-01-01T00:00:00Z",
                    retention = "1900-01-01T00:00:00Z", earliest = "1900-01-01T00:00:00Z" },
            }
            for _, scenario in ipairs(scenarios) do
                local retention_finished_at, finish_err = run_time.after_ms(scenario.retention, -retention_ms)
                test.is_nil(finish_err)
                execute("UPDATE workflow_runs SET status='running',completion_check_at=$1 WHERE run_id=$2",
                    { scenario.completion, completion_args.run_id })
                execute([[UPDATE workflow_runs SET status='completed',completion_check_at=NULL,
                    terminal_event_pending=TRUE,terminal_event_check_at=$1,
                    finished_at='1903-01-01T00:00:00Z' WHERE run_id=$2]],
                    { scenario.publication, publication_args.run_id })
                execute([[UPDATE workflow_runs SET status='completed',completion_check_at=NULL,
                    terminal_event_pending=FALSE,terminal_event_check_at=NULL,
                    finished_at=$1 WHERE run_id=$2]],
                    { retention_finished_at, retention_args.run_id })

                local expected_ms, expected_err = run_time.until_ms(scenario.earliest)
                test.is_nil(expected_err)
                local actual_ms, schedule_err = maintenance_schedule.next_deadline_ms()
                test.is_nil(schedule_err)
                test.is_true(actual_ms ~= nil)
                test.is_true(math.abs((actual_ms :: number) - (expected_ms :: number)) < 1000,
                    "scheduler did not choose " .. scenario.earliest)
            end

            execute("UPDATE workflow_runs SET status='running',completion_check_at='2099-01-01T00:00:00Z' WHERE run_id=$1",
                { completion_args.run_id })
            execute([[UPDATE workflow_runs SET terminal_event_check_at='2099-01-01T00:00:00Z'
                WHERE run_id=$1]], { publication_args.run_id })
            execute([[UPDATE workflow_runs SET finished_at=$1 WHERE run_id=$2]],
                { run_time.after_ms("2099-01-01T00:00:00Z", -retention_ms), retention_args.run_id })
        end)

        test.it("boot recovers due completion rows across multiple maintenance batches", function()
            local workflow_id = uuid.v4()
            for _ = 1, 101 do
                local args = reserve_args()
                args.workflow_id = workflow_id
                args.trigger_id = uuid.v4()
                args.dedup_key = uuid.v4()
                local reservation, reserve_err = admission.reserve(args)
                test.is_nil(reserve_err)
                test.not_nil(reservation)
                local db, open_err = store.open_db()
                test.is_nil(open_err)
                local _, update_err = db:execute([[UPDATE workflow_runs SET started_at='1900-01-01T00:00:00Z',
                    completion_check_at='1900-01-01T00:00:00Z' WHERE run_id=$1]], { args.run_id })
                db:release()
                test.is_nil(update_err)
            end

            local fake_client = {}
            local observed = 0
            function fake_client:get_status(_dataflow: string): (any, nil)
                observed = observed + 1
                return "running", nil
            end
            function fake_client:start(): (any, nil) error("running flow must not start again") end
            function fake_client:create_workflow(): (any, nil) error("running flow must not be recreated") end
            function fake_client:execute(): (any, nil) error("running flow must not execute again") end
            function fake_client:output(): (any, nil) return {}, nil end
            local owner = maintenance.new({ client_new = function(): (any, nil) return fake_client, nil end })
            local driver = make_driver(function(_cases: { any }): string
                local pending = rows([[SELECT run_id FROM workflow_runs WHERE workflow_id=$1
                    AND status IN ('pending','running') AND completion_check_at <= $2]],
                    { workflow_id, admission.now() })
                return #pending > 0 and "timer" or "events"
            end, {}, nil, {
                schedule = maintenance_schedule,
                func_call = function(_entry: string, args: any): (any?, any?)
                    return owner.worker(args)
                end,
            })
            maintenance_loop.run(driver.deps)

            test.is_true(#driver.calls >= 2, "boot completion recovery did not cross a batch boundary")
            test.eq(driver.calls[1].recover, true)
            for index = 2, #driver.calls do test.eq(driver.calls[index].recover, false) end
            test.is_true(observed >= 101)
            local recovered = rows("SELECT run_id FROM workflow_runs WHERE workflow_id=$1 AND status='running'",
                { workflow_id })
            test.eq(#recovered, 101)
        end)
    end)
end

return test.run_cases(define_tests)
