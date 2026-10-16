-- Shared scaffold for the admission suites. Each suite builds one instance
-- with its own imported modules; the constructed doubles stay per-suite.
type Map = { [string]: any }

local function new(deps: any): Map
    local test = deps.test
    local uuid = deps.uuid
    local uuid_v4 = uuid.v4
    local admission = deps.admission
    local store = deps.store

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
    local writable = constructed(deps.run_writable)
    local maintenance = constructed(deps.maintenance)

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
    -- Published client double: create is unique, start returns the id, and
    -- status/output survive caller crashes. No unpublished methods are present.
    local function new_engine()
        local engine: { [string]: any } = {}
        local calls = { create = 0, start = 0, output = 0 }
        local faults = { create_once = false, create_after = false, start_once = false,
            start_after = false, output_once = false }
        local cli: any = {}
        function cli:get_status(id: string): (any?, any?)
            if not engine[id] then return nil, "Workflow not found or access denied" end
            return engine[id].status, nil
        end
        function cli:create_workflow(_commands: any, opts: any): (any?, any?)
            calls.create = calls.create + 1
            if faults.create_once then
                faults.create_once = false
                return nil, "injected crash before create commit"
            end
            if engine[opts.dataflow_id] then return nil, "duplicate dataflow id" end
            engine[opts.dataflow_id] = { status = "pending", starts = 0 }
            if faults.create_after then
                faults.create_after = false
                return nil, "injected crash after create commit"
            end
            return opts.dataflow_id, nil
        end
        function cli:start(id: string, _options: any): (any?, any?)
            calls.start = calls.start + 1
            if faults.start_once then
                faults.start_once = false
                return nil, "injected crash before start commit"
            end
            if not engine[id] then return nil, "missing flow" end
            engine[id].status = "running"
            engine[id].starts = engine[id].starts + 1
            if faults.start_after then
                faults.start_after = false
                return nil, "injected crash after start commit"
            end
            return id, nil
        end
        function cli:execute(id: string, options: any): (any?, any?)
            local _, err = self:start(id, options)
            if err then return nil, err end
            return { success = true, pending = true, dataflow_id = id }, nil
        end
        function cli:output(id: string): (any?, any?)
            calls.output = calls.output + 1
            if faults.output_once then
                faults.output_once = false
                return nil, "injected crash during output read"
            end
            return engine[id].output or {}, nil
        end
        return engine, calls, faults, cli
    end

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
        if row == nil then return nil end
        return (row.dataflow_id) :: string
    end

    local function mark_terminal(engine: any, run_id: string)
        local id = dataflow_of(run_id)
        test.eq(type(id), "string")
        engine[id].status = "completed"
        engine[id].output = { value = "persisted output" }
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

    return {
        writable = writable,
        maintenance = maintenance,
        TEST_IDENTITY = TEST_IDENTITY,
        TEST_IDENTITY_JSON = TEST_IDENTITY_JSON,
        reserve_fixture = reserve_fixture,
        new_engine = new_engine,
        new_appender = new_appender,
        install = install,
        build_request = build_request,
        query_row = query_row,
        exec = exec,
        dataflow_of = dataflow_of,
        mark_terminal = mark_terminal,
        force_due = force_due,
        pending_count = pending_count,
    }
end

return { new = new }
