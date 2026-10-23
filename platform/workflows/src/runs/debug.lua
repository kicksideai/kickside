-- Read-only runtime-debug projection. Workflows owns run identity and lifecycle;
-- the engine owns the raw dataflow/node/data records. This adapter intentionally
-- exposes only the fields the workflow inspector can safely correlate, redacting
-- secret-shaped values before an export or timeline can leave the module.
local runs_read = require("runs_read")
local function attach(M: any, I: any): ()
type Map = { [string]: any }

local function secret_key(key: any): boolean
    local k = tostring(key or ""):lower():gsub("[^%w]", "")
    return k:find("secret", 1, true) ~= nil or k:find("token", 1, true) ~= nil
        or k:find("password", 1, true) ~= nil or k:find("credential", 1, true) ~= nil
        or k:find("authorization", 1, true) ~= nil or k:find("cookie", 1, true) ~= nil
        or k:find("apikey", 1, true) ~= nil or k:find("privatekey", 1, true) ~= nil
        or k:find("accesskey", 1, true) ~= nil
end

local function safe_copy(value: any, key: any?): any
    if key ~= nil and secret_key(key) then return "[redacted]" end
    if type(value) ~= "table" then return value end
    local out: Map = {}
    for k, v in pairs(value :: Map) do out[k] = safe_copy(v, k) end
    return out
end

local function all(query: any): (any?, error?)
    local rows, err = query:all()
    if err then return nil, err end
    return type(rows) == "table" and rows or {}, nil
end

local function engine_snapshot(run: Map, has_engine: boolean?): (Map?, error?, any?, boolean)
    if not has_engine then return nil, nil, nil, false end
    local dataflow_id = tostring(run.dataflow_id)
    local flow, flow_err = I.dataflow_get(dataflow_id)
    if flow_err then return nil, flow_err, nil, false end
    if type(flow) ~= "table" then return nil, nil, nil, false end
    local nodes_query, nqerr = I.node_reader().with_dataflow(dataflow_id)
    if nqerr then return nil, nqerr, nil, false end
    if not nodes_query then return nil, errors.new({ kind = errors.INTERNAL, message = "node reader unavailable" }), nil, false end
    local nodes, nerr = all(nodes_query:fetch_options({ config = true, metadata = true }))
    if nerr then return nil, nerr, nil, false end
    local data_query = I.data_reader().with_dataflow(dataflow_id):fetch_options({
        content = true, metadata = true, resolve_references = true,
    }):order_by("created_at", "ASC")
    local data, derr = all(data_query)
    if derr then return nil, derr, nil, false end
    local input = nil
    local error_routed = false
    for _, row in ipairs(data or {}) do
        if tostring((row :: Map).type or "") == "dataflow.output"
            and tostring((row :: Map).discriminator or "") == "error" then error_routed = true end
        if input == nil and tostring((row :: Map).type or "") == "dataflow.input" then
            input = (row :: Map).content
            if type(input) == "string" then
                local decoded, decode_err = I.decode_json(input, "dataflow.input.content")
                if decode_err then return nil, decode_err, nil, false end
                input = decoded
            end
        end
    end
    local safe_flow = safe_copy(flow) :: Map
    -- The workflow inspector does not surface the engine actor context. Keep the
    -- export on that same identity boundary even though generic Keeper detail has it.
    safe_flow.actor_id = nil
    safe_flow.actor_context = nil
    return { dataflow = safe_flow, nodes = safe_copy(nodes), data = safe_copy(data) }, nil, input, error_routed
end

local function execution_identity(run: Map, snapshot: any): Map?
    if type(snapshot) ~= "table" then return nil end
    local flow = ((snapshot :: Map).dataflow :: Map?)
    if type(flow) ~= "table" then return nil end
    local metadata = type(flow.metadata) == "table" and (flow.metadata :: Map) or {}
    -- Engine 0.4.28 records no PID/process host on ordinary dataflows. Preserve a
    -- future engine-provided identity without inventing one for historical rows.
    local process_id = metadata.process_id or metadata.process_identity or metadata.pid
    if process_id == nil then return nil end
    return { id = tostring(process_id), host = metadata.process_host, pid = metadata.pid }
end

-- debug_detail augments the established run detail without making old rows fail:
-- a pre-dataflow run simply has no execution field and an empty node list.
function M.debug_detail(workflow_id: any, run_id: any): (Map?, error?)
    local run, rerr, has_engine = I.read_run(workflow_id, run_id)
    if rerr then return nil, rerr end
    if not run then return nil, nil end
    local snapshot, serr, input, error_routed = engine_snapshot(run :: Map, has_engine)
    if serr then return nil, serr end
    local execution: Map = {
        dataflow_id = (run :: Map).dataflow_id,
    }
    if type(snapshot) == "table" then
        local flow = ((snapshot :: Map).dataflow :: Map?)
        if type(flow) == "table" then
            execution.parent_dataflow_id = flow.parent_dataflow_id
            execution.dataflow_status = flow.status
            I.apply_live_status(run, flow)
            local metadata = type(flow.metadata) == "table" and (flow.metadata :: Map) or {}
            (run :: Map).error_details = metadata.error_details
            execution.dataflow_type = flow.type
            execution.created_at = flow.created_at
            execution.updated_at = flow.updated_at
        end
        local process = execution_identity(run :: Map, snapshot)
        if process then execution.process = process end
    end
    local nodes: { any } = {}
    for _, raw in ipairs(type(snapshot) == "table" and (((snapshot :: Map).nodes :: any) or {}) or {}) do
        local node = type(raw) == "table" and (raw :: Map) or {}
        local metadata = type(node.metadata) == "table" and (node.metadata :: Map) or {}
        nodes[#nodes + 1] = {
            engine_node_id = node.node_id,
            parent_engine_node_id = node.parent_node_id,
            def_node_id = metadata.def_node_id,
            type = node.type,
            status = node.status,
            title = metadata.title,
            created_at = node.created_at,
            updated_at = node.updated_at,
        }
    end
    return { run = run, execution = execution, nodes = nodes, snapshot = snapshot, input = input, error_routed = error_routed }, nil
end

function M.run_export(workflow_id: any, run_id: any): (Map?, error?)
    local detail, err = M.debug_detail(workflow_id, run_id)
    if err or not detail then return detail, err end
    local d = detail :: Map
    local raw = type(d.snapshot) == "table" and (d.snapshot :: Map) or {}
    return {
        schema_version = 1,
        kind = "flow_run_export",
        run = d.run,
        execution = d.execution,
        dataflow = raw.dataflow,
        nodes = raw.nodes or {},
        data = raw.data or {},
    }, nil
end

local function add_event(
    events: { Map },
    occurred_at: any,
    source: string,
    event_type: string,
    raw: any,
    node_id: any?,
    phase: number?
)
    events[#events + 1] = {
        occurred_at = occurred_at,
        source = source,
        type = event_type,
        engine_node_id = node_id,
        raw = safe_copy(raw),
        -- Workflow run rows currently store timestamps at a lower precision than
        -- engine rows.  Keep lifecycle boundaries semantic when those timestamps
        -- tie (or surround nanosecond engine events in the same second): start is
        -- always first, engine activity is chronological, and terminal is last.
        _phase = phase or 1,
        _ordinal = #events + 1,
    }
end

local function timeline(workflow_id: any, run_id: any, opts: any): (Map?, error?)
    local detail, err = M.debug_detail(workflow_id, run_id)
    if err or not detail then return detail, err end
    local d = detail :: Map
    local run = d.run :: Map
    local snapshot = type(d.snapshot) == "table" and (d.snapshot :: Map) or {}
    local events: { Map } = {}
    add_event(events, run.started_at, "flow_run", "flow.started", run, nil, 0)
    if run.finished_at then
        add_event(events, run.finished_at, "flow_run", run.status == "completed" and "flow.finished" or "flow.failed", run, nil, 2)
    end
    for _, raw in ipairs(type(snapshot.nodes) == "table" and (snapshot.nodes :: { any }) or {}) do
        local node = raw :: Map
        add_event(events, node.created_at, "engine", "node.created", node, node.node_id)
        if node.updated_at and node.updated_at ~= node.created_at then
            add_event(events, node.updated_at, "engine", "node.updated", node, node.node_id)
        end
    end
    for _, raw in ipairs(type(snapshot.data) == "table" and (snapshot.data :: { any }) or {}) do
        local data = raw :: Map
        add_event(events, data.created_at, "engine", "data." .. tostring(data.type or "recorded"), data, data.node_id)
    end
    table.sort(events, function(a: Map, b: Map)
        local ap, bp = tonumber(a._phase) or 1, tonumber(b._phase) or 1
        if ap ~= bp then return ap < bp end
        local at, bt = tostring(a.occurred_at or ""), tostring(b.occurred_at or "")
        if at == bt then return (tonumber(a._ordinal) or 0) < (tonumber(b._ordinal) or 0) end
        return at < bt
    end)
    local o = type(opts) == "table" and (opts :: Map) or {}
    local limit = math.max(1, math.min(200, tonumber(o.limit) or 100))
    local offset = math.max(0, tonumber(o.offset) or 0)
    local page: { Map } = {}
    for i = offset + 1, math.min(offset + limit, #events) do
        local item = events[i]
        item._phase = nil
        item._ordinal = nil
        item.seq = i
        page[#page + 1] = item
    end
    return {
        events = page,
        count = #events,
        limit = limit,
        offset = offset,
        next_offset = offset + #page < #events and offset + #page or nil,
    }, nil
end

function M.run_timeline(workflow_id: any, run_id: any, opts: any): (Map?, error?)
    return timeline(workflow_id, run_id, opts)
end

function M.run_event_detail(workflow_id: any, run_id: any, seq: any): (Map?, error?)
    local number = tonumber(seq)
    if not number or number < 1 or number ~= math.floor(number) then
        return nil, errors.new({ kind = errors.INVALID, message = "event_seq must be a positive integer" })
    end
    local full, err = timeline(workflow_id, run_id, { limit = 1, offset = number - 1 })
    if err or not full then return full, err end
    local event = ((full :: Map).events or {})[1]
    if not event then return nil, nil end
    return event :: Map, nil
end

end

local default, private = runs_read.new()
attach(default, private)
return {
    debug_detail = default.debug_detail,
    run_export = default.run_export,
    run_timeline = default.run_timeline,
    run_event_detail = default.run_event_detail,
    attach = attach,
}
