local test = require("test")
local uuid = require("uuid")
local writable_module = require("run_writable")
local maintenance_module = require("maintenance")
local function constructed(module: any): any
    local dependencies: { [string]: any } = {}
    local instance = module.new(dependencies)
    return setmetatable({}, {
        __index = function(_self: any, key: string): any
            if key:sub(1, 1) == "_" then return dependencies[key:sub(2)] end
            return instance[key]
        end,
        __newindex = function(_self: any, key: string, value: any): ()
            dependencies[key:sub(2)] = value
            instance = module.new(dependencies)
        end,
    })
end
local writable = constructed(writable_module)
local maintenance = constructed(maintenance_module)
local admission = require("admission")
local store = require("store")

local sc = require("admission_scaffold").new({ test = test, uuid = uuid, run_writable = writable_module,
    maintenance = maintenance_module, admission = admission, store = store })
local new_engine = sc.new_engine

local TEST_IDENTITY = {
    version = 2,
    principal = { kind = "user", id = "admission-test" },
    authorized_by = { kind = "user", id = "admission-test" },
    captured_at = "2026-09-26T00:00:00Z",
}
local TEST_IDENTITY_JSON =
    '{"version":2,"principal":{"kind":"user","id":"admission-test"},' ..
    '"authorized_by":{"kind":"user","id":"admission-test"},"captured_at":"2026-09-26T00:00:00Z"}'

local function reserve_fixture(args: any): (any?, any?)
    local run_id, dataflow_id = uuid.v4(), uuid.v4()
    args.run_id, args.dataflow_id = run_id, dataflow_id
    args.creation_payload_json = '{"version":1,"input":{},"commands":[],"options":' ..
        '{"dataflow_id":"' .. dataflow_id .. '","metadata":{"run_id":"' .. run_id .. '"}},' ..
        '"start_options":{}}'
    return admission.reserve(args)
end

local function define_tests()
    test.describe("workflow admission and recovery", function()
        local old_repo, old_version_read, old_compiler = writable._repo, writable._version_read, writable._compiler
        local old_writer_client, old_checker_client = writable._client_new, maintenance._client_new
        local old_identity_loader = writable._load_identity
        local old_append = maintenance._append_event
        test.after_all(function()
            writable._repo, writable._version_read, writable._compiler = old_repo, old_version_read, old_compiler
            writable._client_new, maintenance._client_new = old_writer_client, old_checker_client
            writable._load_identity = old_identity_loader
            maintenance._append_event = old_append
        end)

        test.it("dedups at capacity and recovers 25 lost callbacks with one event each", function()
            local engine: { [string]: any } = {}
            local events: { [string]: number } = {}
            local fail_once = true
            local cli: any = {}
            function cli:get_status(id: string): (any?, any?)
                if not engine[id] then return nil, "Workflow not found or access denied" end
                return engine[id].status, nil
            end
            function cli:create_workflow(_commands: any, opts: any): (any?, any?)
                if engine[opts.dataflow_id] then return nil, "duplicate dataflow id" end
                engine[opts.dataflow_id] = { status = "pending" }
                return opts.dataflow_id, nil
            end
            function cli:start(id: string, _options: any): (any?, any?)
                engine[id].status = "running"
                return id, nil
            end
            function cli:execute(id: string, _options: any): (any?, any?)
                return { success = true, pending = true, dataflow_id = id }, nil
            end
            function cli:output(_id: string): (any?, any?) return {}, nil end
            writable._repo = { ACCESS = { READ = 1 }, require_access = function() return nil end }
            writable._version_read = { get = function() return { compiled_commands = {}, input_schema = { type = "object" } }, nil end }
            writable._compiler = { remint = function() return {}, {}, nil end }
            writable._client_new = function() return cli, nil end
            writable._load_identity = function() return TEST_IDENTITY, nil end
            maintenance._client_new = function() return cli, nil end
            maintenance._append_event = function(_flow_id: string, event: any): (any?, any?)
                local id = event.external.external_id
                if not events[id] then events[id] = 1 end
                if fail_once then fail_once = false; return nil, "injected crash after durable append" end
                return { success = true }, nil
            end

            local trigger = "automation-" .. uuid.v4()
            local flow = "flow-" .. uuid.v4()
            local function request(key: string): any
                return { config = { flow_ref = { kind = "flow", id = flow, version = 1 } },
                    sink_op = "create", identity_key = key, idempotency_key = "delivery:" .. key,
                    origin = trigger, automation_ref = { kind = "automation", id = trigger, revision = 1 }, input = { value = key } }
            end
            local results: { any } = {}
            for i = 1, 25 do results[i] = writable.write(request("item-" .. tostring(i))) end
            local duplicate = writable.write(request("item-1"))
            local full = writable.write(request("item-26"))
            local marked_terminal = 0
            for _, result in ipairs(results) do
                local db = store.open_db()
                local rows = db:query("SELECT dataflow_id FROM workflow_runs WHERE run_id=$1", { result.dest_ref and result.dest_ref.run_id or "" })
                db:release()
                local id = rows and rows[1] and rows[1].dataflow_id
                if id and engine[id] then
                    marked_terminal = marked_terminal + 1
                    engine[id] = { status = "completed" }
                end
            end
            local due_db = store.open_db()
            local _, force_due_err = due_db:execute("UPDATE workflow_runs SET completion_check_at=$1 WHERE trigger_id=$2",
                { admission.now(), trigger })
            due_db:release()
            local first_tick, tick_err = maintenance.tick(50)
            local db = store.open_db()
            local _, due_err = db:execute("UPDATE workflow_runs SET terminal_event_check_at=$1 WHERE trigger_id=$2 AND terminal_event_pending",
                { admission.now(), trigger })
            db:release()
            local second_tick, second_err = maintenance.tick(50)
            local twenty_sixth = writable.write(request("item-26"))
            local original_loader = writable._load_identity
            writable._load_identity = function()
                return {
                    version = 2,
                    principal = { kind = "user", id = "different-user" },
                    authorized_by = { kind = "user", id = "different-user" },
                    captured_at = TEST_IDENTITY.captured_at,
                }, nil
            end
            local foreign_dedup = writable.write(request("item-1"))
            writable._load_identity = original_loader
            db = store.open_db()
            local counts, count_err = db:query("SELECT status,COUNT(*) AS n FROM workflow_runs WHERE trigger_id=$1 GROUP BY status", { trigger })
            local pending_events, pending_err = db:query("SELECT COUNT(*) AS n FROM workflow_runs WHERE trigger_id=$1 AND terminal_event_pending", { trigger })
            local identities, identity_err = db:query(
                "SELECT COUNT(*) AS n FROM workflow_runs WHERE trigger_id=$1 AND execution_identity_json IS NOT NULL",
                { trigger })
            db:release()
            local published = 0
            for _, count in pairs(events) do published = published + count end
            for _, result in ipairs(results) do test.eq(result.success, true) end
            test.eq(duplicate.success, true)
            test.eq(duplicate.dest_ref.run_id, results[1].dest_ref.run_id)
            test.eq(full.success, false)
            test.eq(full.error.scope, "capacity")
            test.is_nil(tick_err)
            test.is_nil(force_due_err)
            test.is_nil(due_err)
            test.is_nil(second_err)
            test.is_nil(count_err)
            test.is_nil(pending_err)
            test.is_nil(identity_err)
            test.eq(tonumber(identities[1].n), 26)
            test.eq(first_tick.checked, 25)
            test.eq(marked_terminal, 25)
            test.eq(first_tick.failures, 1)
            test.eq(second_tick.published, 1)
            test.eq(twenty_sixth.success, true)
            test.eq(foreign_dedup.success, false)
            test.eq(foreign_dedup.error.code, "permission_denied")
            test.eq(published, 25)
            test.eq(tonumber(pending_events[1].n), 0)
            local completed = 0
            for _, row in ipairs(counts or {}) do if row.status == "completed" then completed = tonumber(row.n) or 0 end end
            test.eq(completed, 25)
        end)

        -- Thread-event stand-in with unique-index semantics: a repeat append
        -- for one run is a duplicate success, never a second durable event.
        local function new_appender()
            local handle = { fail_for = {}, physical = {} }
            local function append(_flow_id: string, event: any): (any?, any?)
                local id = event.external.external_id
                if handle.fail_for[id] then
                    handle.fail_for[id] = nil
                    return nil, "injected crash before durable append"
                end
                if handle.physical[id] then
                    return { success = true, duplicate = true }, nil
                end
                handle.physical[id] = 1
                return { success = true, duplicate = false }, nil
            end
            return handle, append
        end

        local function install(cli: any, append: any)
            writable._repo = { ACCESS = { READ = 1 }, require_access = function() return nil end }
            writable._version_read = { get = function()
                return { compiled_commands = {}, input_schema = { type = "object" } }, nil
            end }
            writable._compiler = { remint = function() return {}, {}, nil end }
            writable._client_new = function() return cli, nil end
            writable._load_identity = function() return TEST_IDENTITY, nil end
            maintenance._client_new = function() return cli, nil end
            maintenance._append_event = append
        end

        local function build_request(trigger: string, flow: string, key: string): any
            return { config = { flow_ref = { kind = "flow", id = flow, version = 1 } },
                sink_op = "create", identity_key = key, idempotency_key = "delivery:" .. key,
                origin = trigger, automation_ref = { kind = "automation", id = trigger, revision = 1 }, input = { value = key } }
        end

        local function query_row(sql_text: string, params: { any }): any
            local db = store.open_db()
            local rows, err = db:query(sql_text, params)
            db:release()
            test.is_nil(err)
            return rows and rows[1] or nil
        end

        local function exec(sql_text: string, params: { any })
            local db = store.open_db()
            local _, err = db:execute(sql_text, params)
            db:release()
            test.is_nil(err)
        end

        local function dataflow_of(run_id: string): string?
            local row = query_row("SELECT dataflow_id FROM workflow_runs WHERE run_id=$1", { run_id })
            return row and row.dataflow_id
        end

        local function mark_terminal(engine: any, run_id: string)
            local id = dataflow_of(run_id)
            test.eq(type(id), "string")
            engine[id] = { status = "completed" }
        end

        local function force_due(trigger: string)
            exec("UPDATE workflow_runs SET completion_check_at=$1 WHERE trigger_id=$2",
                { admission.now(), trigger })
            exec("UPDATE workflow_runs SET terminal_event_check_at=$1 WHERE trigger_id=$2 AND terminal_event_pending",
                { admission.now(), trigger })
        end

        local function pending_count(trigger: string): number
            local row = query_row("SELECT COUNT(*) AS n FROM workflow_runs WHERE trigger_id=$1 AND terminal_event_pending",
                { trigger })
            return tonumber(row.n) or -1
        end

        test.it("admits a new run when a source revision has a new delivery idempotency key", function()
            local _, _, _, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local first_request = build_request(trigger, flow, "record-stable")
            first_request.idempotency_key = "delivery-revision-1"
            first_request.input = { value = "revision-1" }
            local first = writable.write(first_request)

            local second_request = build_request(trigger, flow, "record-stable")
            second_request.idempotency_key = "delivery-revision-2"
            second_request.input = { value = "revision-2" }
            local second = writable.write(second_request)

            test.eq(first.success, true)
            test.eq(second.success, true)
            test.is_true(first.dest_ref.run_id ~= second.dest_ref.run_id,
                "a new delivery idempotency key must admit the revised source item")
        end)

        test.it("returns idempotency_conflict when a delivery key changes normalized input or Flow reference", function()
            local _, _, _, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local first_request = build_request(trigger, flow, "record-1")
            first_request.idempotency_key = "delivery-fixed"
            first_request.input = { value = "original" }
            local first = writable.write(first_request)

            local changed_input = build_request(trigger, flow, "record-1")
            changed_input.idempotency_key = "delivery-fixed"
            changed_input.input = { value = "changed" }
            local input_result = writable.write(changed_input)

            local changed_flow = build_request(trigger, flow, "record-1")
            changed_flow.config.flow_ref.version = 2
            changed_flow.idempotency_key = "delivery-fixed"
            changed_flow.input = { value = "original" }
            local flow_result = writable.write(changed_flow)

            test.eq(first.success, true)
            test.eq(input_result.success, false)
            test.eq(input_result.error.code, "idempotency_conflict")
            test.eq(flow_result.success, false)
            test.eq(flow_result.error.code, "idempotency_conflict")
        end)

        test.it("checks an existing delivery key before reminting a candidate graph", function()
            local _, _, _, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local remints = 0
            writable._compiler = { remint = function() remints = remints + 1; return {}, {}, nil end }
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local request = build_request(trigger, flow, "record-1")
            request.idempotency_key = "delivery-fixed"
            local first = writable.write(request)
            local after_first = remints
            local replay_request = build_request(trigger, flow, "record-1")
            replay_request.idempotency_key = "delivery-fixed"
            local replay = writable.write(replay_request)

            test.eq(first.success, true)
            test.eq(replay.success, true)
            test.eq(replay.dest_ref.run_id, first.dest_ref.run_id)
            test.eq(remints, after_first, "a replay should not remint a candidate graph")
        end)

        -- A34: a run without a v2 identity stays fail-closed; maintenance adopts
        -- identities first and never activates or observes such a run.





    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
