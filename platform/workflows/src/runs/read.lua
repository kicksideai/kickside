-- Read model, launch validation, and lifecycle event formatting.
local state = require("runs_state")

local function new(dependencies: any?): (any, any)
local M, I = state.new(dependencies)
local json, types, store = I.json, I.types, I.store
local run_time = require("run_time")
local schema_validate, log = I.schema_validate, I.log
local RUN_EVENT_SOURCE, RUN_EVENT = I.RUN_EVENT_SOURCE, I.RUN_EVENT
type Map = { [string]: any }

-- ── read model ────────────────────────────────────────────────────────────────

local function row_to_run(r: any): Map
    local flow_id = tostring(r.workflow_id or "")
    local version = tonumber(r.version) or 0
    local out: Map = {
        run_id = tostring(r.run_id or ""),
        dataflow_id = r.dataflow_id,
        trigger_kind = tostring(r.trigger_kind or "manual"),
        trigger_id = r.trigger_id,
        dedup_key = r.dedup_key,
        origin = tostring(r.origin or "published"),
        status = tostring(r.status or "pending"),
        error = r.error,
        started_at = r.started_at,
        finished_at = r.finished_at,
        invocation_id = r.invocation_id,
    }
    if version > 0 then
        out.flow_ref = { kind = "flow", id = flow_id, version = version }
    else
        out.draft_ref = { kind = "flow", id = flow_id, def_seq = tonumber(r.draft_def_seq) or 0 }
    end
    local revision = tonumber(r.binding_revision)
    if type(r.binding_id) == "string" and r.binding_id ~= "" and revision and revision > 0 then
        out.automation_ref = { kind = "automation", id = r.binding_id, revision = revision }
    end
    return out
end

local function has_engine(run: Map): boolean
    return not (run.status == types.RUN_STATUS.PENDING and run.admission_state == "unadmitted")
        and type(run.dataflow_id) == "string" and run.dataflow_id ~= ""
end

local function run_by_id(run_id: any): (Map?, error?)
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows, err = db:query("SELECT * FROM " .. types.TABLES.RUNS .. " WHERE run_id = $1 LIMIT 1", { tostring(run_id) })
    db:release()
    if err then return nil, err end
    if type(rows) ~= "table" or not rows[1] then return nil, nil end
    return row_to_run(rows[1]), nil
end

local function read_run(workflow_id: any, run_id: any): (Map?, error?, boolean?)
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows, err = db:query("SELECT * FROM " .. types.TABLES.RUNS .. " WHERE workflow_id = $1 AND run_id = $2", { tostring(workflow_id), tostring(run_id) })
    db:release()
    if err then return nil, err end
    if type(rows) ~= "table" or not rows[1] then return nil, nil end
    return row_to_run(rows[1]), nil, has_engine(rows[1])
end
I.read_run = read_run

function M.get_run(workflow_id: any, run_id: any): (Map?, error?)
    local run, err = read_run(workflow_id, run_id)
    return run, err
end

local function apply_live_status(run: Map, flow: any): ()
    if not types.RUN_TERMINAL[run.status] and type(flow) == "table" and flow.status ~= nil then
        run.dataflow_status = tostring(flow.status)
    end
end
I.apply_live_status = apply_live_status

-- list_runs pages a workflow's runs newest first; the third value is the offset
-- of the following page, absent on the last page.
function M.list_runs(workflow_id: any, opts: any): (any?, error?, integer?)
    opts = type(opts) == "table" and opts or {}
    local limit = math.max(1, math.min(200, tonumber((opts :: Map).limit) or 50))
    local offset = math.max(0, tonumber((opts :: Map).offset) or 0)
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local wheres = { "workflow_id = $1" }
    local params: { any } = { tostring(workflow_id) }
    if type((opts :: Map).status) == "string" and (opts :: Map).status ~= "" then
        params[#params + 1] = (opts :: Map).status
        wheres[#wheres + 1] = "status = $" .. tostring(#params)
    end
    params[#params + 1] = limit + 1
    local limit_mark = "$" .. tostring(#params)
    params[#params + 1] = offset
    local offset_mark = "$" .. tostring(#params)
    local rows, err = db:query(
        "SELECT * FROM " .. types.TABLES.RUNS .. " WHERE " .. table.concat(wheres, " AND ") ..
        " ORDER BY started_at DESC, run_id DESC LIMIT " .. limit_mark .. " OFFSET " .. offset_mark, params)
    db:release()
    if err then return nil, err end
    local page_rows = rows or {}
    local next_offset: integer? = nil
    if #page_rows > limit then
        page_rows[#page_rows] = nil
        next_offset = math.floor(offset + limit)
    end
    local out: { any } = {}
    for _, r in ipairs(page_rows) do
        local run = row_to_run(r)
        if not types.RUN_TERMINAL[run.status] and has_engine(r) then
            local flow, flow_err = I.dataflow_get(run.dataflow_id)
            if flow_err then return nil, flow_err end
            apply_live_status(run, flow)
        end
        out[#out + 1] = run
    end
    return out, nil, next_offset
end

local function first_compile_error(compiled: any): string
    local c = type(compiled) == "table" and (compiled :: Map) or {}
    local errors = type(c.errors) == "table" and (c.errors :: { any }) or {}
    local first = type(errors[1]) == "table" and (errors[1] :: Map) or nil
    if first then
        if type(first.message) == "string" and first.message ~= "" then return first.message end
        if type(first.code) == "string" and first.code ~= "" then return first.code end
    end
    return "compile failed"
end

local function safe_get(tbl: any, key: any): any
    if type(tbl) ~= "table" then return nil end
    return rawget(tbl, key)
end

local function schema_type(schema: any): any
    local t = safe_get(schema, "type")
    if type(t) == "table" then return safe_get(t, 1) or safe_get(t, "1") end
    return t
end

local function sample_of_schema(schema: any): any
    local s = type(schema) == "table" and schema or {}
    local t = schema_type(s)
    local properties = safe_get(s, "properties")
    if t == "object" or type(properties) == "table" then
        local out: Map = {}
        if type(properties) == "table" then
            for key, prop in pairs(properties) do
                out[tostring(key)] = sample_of_schema(prop)
            end
        end
        return out
    elseif t == "array" then
        return { sample_of_schema(safe_get(s, "items")) }
    elseif t == "number" or t == "integer" then
        return 1
    elseif t == "boolean" then
        return true
    end
    return "value"
end

local function validate_start_input(schema: any, input: any): string?
    local payload = type(input) == "table" and input or {}
    local err = schema_validate.validate(schema, payload, "input")
    if err then return "input does not match Start schema: " .. err end
    return nil
end

local function copy_map(raw: any): Map?
    if type(raw) ~= "table" then return nil end
    local out: Map = {}
    for k, v in pairs(raw :: Map) do out[k] = v end
    return out
end

local function string_value(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function lifecycle_trace_context(run: Map, opts: Map): Map
    local trace = copy_map(opts.trace_context) or {}
    if trace.run_id == nil then trace.run_id = run.run_id end
    if trace.trace_id == nil then trace.trace_id = "workflow:" .. tostring(run.run_id or "") end
    if trace.correlation_key == nil then
        trace.correlation_key = string_value(run.dedup_key) or string_value(run.trigger_id) or run.run_id
    end
    return trace
end

local function lifecycle_error(status: string, err_msg: any): Map?
    if status == types.RUN_STATUS.COMPLETED or not types.RUN_TERMINAL[status] then return nil end
    if type(err_msg) == "table" then
        local e = err_msg :: Map
        return {
            code = string_value(e.code) or status,
            message = string_value(e.message) or string_value(e.error) or status,
        }
    end
    return {
        code = status,
        message = type(err_msg) == "string" and err_msg ~= "" and err_msg or status,
    }
end

local function lifecycle_payload(run: Map, status: string, opts: Map): Map
    local trace = lifecycle_trace_context(run, opts)
    local flow_ref = type(run.flow_ref) == "table" and copy_map(run.flow_ref) or nil
    local draft_ref = type(run.draft_ref) == "table" and copy_map(run.draft_ref) or nil
    local source = flow_ref or draft_ref or {}
    local origin = {
        type = string_value(run.origin) or "published",
        id = tostring((source :: Map).id or ""),
    }
    local body: Map = {
        run_id = tostring(run.run_id or ""),
        status = status,
        dataflow_id = string_value(run.dataflow_id),
        started_at = string_value(run.started_at),
        trace_context = trace,
        origin = origin,
    }
    if flow_ref then body.flow_ref = flow_ref else body.draft_ref = draft_ref end
    if type(run.automation_ref) == "table" then body.automation_ref = copy_map(run.automation_ref) end
    local ended_at = string_value(opts.ended_at)
    if ended_at then
        body.ended_at = ended_at
        body.duration_ms = run_time.duration_ms(run.started_at, ended_at)
    end
    for _, key in ipairs({ "trigger_id", "invocation_id" }) do
        local value = string_value(opts[key]) or string_value(run[key])
        if value then body[key] = value end
    end
    if type(opts.output_ref) == "table" then body.output_ref = opts.output_ref end
    if opts.output_sample ~= nil then body.output_sample = opts.output_sample end
    if type(opts.authority_identity) == "table" then body.authority_identity = opts.authority_identity end
    local err = lifecycle_error(status, opts.error)
    if err then body.error = err end
    return body
end

local function terminal_event_type(status: string): string?
    if status == types.RUN_STATUS.COMPLETED then return tostring(RUN_EVENT.FINISHED) end
    if types.RUN_TERMINAL[status] then return tostring(RUN_EVENT.FAILED) end
    return nil
end

local function emit_lifecycle_event(workflow_id: string, event_type: string, run: Map, status: string, opts: Map?): ()
    local event_opts = type(opts) == "table" and (opts :: Map) or {}
    local body = lifecycle_payload(run, status, event_opts)
    local event: Map = {
        type = event_type,
        role = "system",
        body = body,
        content = { content_type = "application/json", content_mode = "inline" },
        trace_context = body.trace_context,
        external = {
            external_source = RUN_EVENT_SOURCE,
            external_id = tostring(run.run_id or ""),
            external_version = event_type,
        },
    }
    local _, err = I.append_event(workflow_id, event)
    if err then
        log:warn("workflow lifecycle event emit failed", { workflow_id = workflow_id, type = event_type, error = tostring(err) })
    end
end

I.row_to_run, I.run_by_id = row_to_run, run_by_id
I.first_compile_error = first_compile_error
I.validate_start_input, I.sample_of_schema, I.safe_get = validate_start_input, sample_of_schema, safe_get
I.copy_map, I.string_value = copy_map, string_value
I.duration_ms, I.lifecycle_error = run_time.duration_ms, lifecycle_error
I.terminal_event_type, I.emit_lifecycle_event = terminal_event_type, emit_lifecycle_event
M.row_to_run, M.terminal_event_type = row_to_run, terminal_event_type

return M, I
end

local default = select(1, new())
default.new = new
return default
