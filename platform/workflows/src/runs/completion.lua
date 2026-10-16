local runs_read = require("runs_read")
local function attach(M: any, I: any): ()
local types, store, log = I.types, I.store, I.log
local json = I.json
local row_to_run, run_by_id = I.row_to_run, I.run_by_id
local string_value = I.string_value
local admission = require("admission")
local engine_api = require("engine_api")
type Map = { [string]: any }

-- ── completion (durable engine on_complete hook) ───────────────────────────────
local function completion_read_error(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = errors.UNAVAILABLE,
        retryable = true }) :: error)
end

local function output_sample_for(dataflow_id: any): any
    local id = string_value(dataflow_id)
    if not id then return nil end
    local cli, cerr = I.client_new()
    if not cli then
        log:warn("workflow child output read skipped", { dataflow_id = id, error = tostring(cerr) })
        return nil
    end
    local out, err = cli:output(id)
    if err then
        log:warn("workflow child output read failed", { dataflow_id = id, error = tostring(err) })
        return nil
    end
    return out
end

function M.output_for_run(run_id: any): (any?, string?)
    local run, rerr = run_by_id(run_id)
    if rerr then return nil, rerr end
    if not run then return nil, "run not found: " .. tostring(run_id) end
    if run.status ~= types.RUN_STATUS.COMPLETED then return nil, "run is not completed: " .. tostring(run.status) end
    return output_sample_for(run.dataflow_id), nil
end

-- run_completed(args) — args identify the run by run_id or dataflow_id and carry the
-- terminal status + error. Idempotent: a duplicate delivery does not double-count.
function M.run_completed(args: any): (Map?, any?)
    local a = type(args) == "table" and (args :: Map) or {}
    local run: Map? = nil
    if type(a.run_id) == "string" and a.run_id ~= "" then
        local db, db_err = store.open_db()
        if not db then return nil, db_err end
        local rows, query_err = db:query("SELECT * FROM " .. types.TABLES.RUNS .. " WHERE run_id = $1", { a.run_id })
        db:release()
        if query_err then return nil, completion_read_error("run read failed", query_err) end
        if type(rows) == "table" and rows[1] then
            local converted = row_to_run(rows[1])
            if type(converted) == "table" then run = converted :: Map end
        end
    elseif type(a.dataflow_id) == "string" and a.dataflow_id ~= "" then
        local db, db_err = store.open_db()
        if not db then return nil, db_err end
        local rows, query_err = db:query("SELECT * FROM " .. types.TABLES.RUNS .. " WHERE dataflow_id = $1", { a.dataflow_id })
        db:release()
        if query_err then return nil, completion_read_error("run read failed", query_err) end
        if type(rows) == "table" and rows[1] then
            local converted = row_to_run(rows[1])
            if type(converted) == "table" then run = converted :: Map end
        end
    end
    if not run then return { ok = true, changed = false, missing = true }, nil end

    local dataflow_id = string_value((run :: Map).dataflow_id)
    if not dataflow_id then return nil, "run has no dataflow id" end
    local cli, client_err = I.client_new()
    if client_err then return nil, client_err end
    if not cli then return nil, errors.new({ kind = errors.UNAVAILABLE,
        message = "dataflow client unavailable", retryable = true }) end
    local supported, support_err = engine_api.require_methods(cli)
    if support_err or not supported then return nil, support_err end
    local current, read_err = engine_api.read(cli, dataflow_id)
    if read_err or not current then return nil, read_err end
    local mapped = admission.terminal_status(current.status)
    if not mapped then
        return { ok = true, changed = false, deferred = true, status = current.status }, nil
    end
    current.error = a.error
    local merged, merge_err = admission.merge(run, current)
    if merge_err then return nil, merge_err end
    return { ok = true, changed = merged and merged.changed == true, status = mapped }, nil
end

-- ── run inspection (past-run replay feed) ──────────────────────────────────────
-- run_node_headers — dataflow node headers (no data payloads) with their def_node_id.
function M.run_node_headers(workflow_id: any, run_id: any): (any?, any?)
    local run, rerr, has_engine = I.read_run(workflow_id, run_id)
    if rerr then return nil, rerr end
    if not run or not (run :: Map).dataflow_id then return nil, "run has no dataflow" end
    if not has_engine then return {}, nil end
    local reader = I.node_reader()
    local nodes, err = reader.with_dataflow(tostring((run :: Map).dataflow_id)):fetch_options({ metadata = true }):all()
    if err then return nil, err end
    local out: { any } = {}
    for _, n in ipairs(nodes or {}) do
        local node: any = n
        local md = type(node.metadata) == "table" and node.metadata or {}
        out[#out + 1] = {
            engine_node_id = node.node_id,
            def_node_id = (md :: Map).def_node_id,
            type = node.type,
            status = node.status,
            title = (md :: Map).title,
        }
    end
    return out, nil
end

-- run_node_data — data rows for one def_node_id, ordered by data_id ASC (uuid v7,
-- engine's own tiebreak), paged. The replay/inspection feed (V4.7). The third
-- value is the offset of the following page, absent on the last page.
function M.run_node_data(workflow_id: any, run_id: any, def_node_id: any, opts: any): (any?, error?, integer?)
    opts = type(opts) == "table" and opts or {}
    local limit = math.max(1, math.min(500, tonumber((opts :: Map).limit) or 100))
    local offset = math.max(0, tonumber((opts :: Map).offset) or 0)
    local run, rerr = M.get_run(workflow_id, run_id)
    if rerr then return nil, rerr end
    if not run or not (run :: Map).dataflow_id then return nil, errors.new({ kind = errors.INTERNAL, message = "run has no dataflow" }) end
    local dataflow_id = tostring((run :: Map).dataflow_id)

    -- map the stable def_node_id back to the run's engine node ids.
    local headers, herr = M.run_node_headers(workflow_id, run_id)
    if herr then return nil, herr end
    local engine_ids: { string } = {}
    for _, h in ipairs(headers or {}) do
        if tostring((h :: Map).def_node_id) == tostring(def_node_id) then engine_ids[#engine_ids + 1] = tostring((h :: Map).engine_node_id) end
    end
    if #engine_ids == 0 then return {}, nil end

    local reader = I.data_reader()
    local q = reader.with_dataflow(dataflow_id):with_nodes(table.unpack(engine_ids)):order_by("data_id", "ASC")
    local all_rows, err = q:all()
    if err then return nil, err end
    local results: { any } = {}
    local ids: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, row in ipairs(all_rows or {}) do
        if row.type == "node.result" then
            local content = row.content
            if type(content) == "string" and tostring(row.content_type):find("json", 1, true) then
                local decoded, decode_err = json.decode(content)
                if decode_err then return nil, decode_err end
                content = decoded
            end
            if type(content) == "table" and type(content.data_ids) == "table" then
                results[#results + 1] = { row = row, content = content }
                for _, data_id in ipairs(content.data_ids) do
                    if type(data_id) ~= "string" then return nil, errors.new({ kind = errors.INVALID, message = "invalid step output reference" }) end
                    if not seen[data_id] then seen[data_id] = true; ids[#ids + 1] = data_id end
                end
            end
        end
    end
    if #ids > 0 then
        local outputs, output_err = reader.with_dataflow(dataflow_id):with_data(table.unpack(ids)):all()
        if output_err then return nil, output_err end
        local by_id: { [string]: any } = {}
        for _, row in ipairs(outputs or {}) do
            local content = row.content
            if type(content) == "string" and tostring(row.content_type):find("json", 1, true) then
                local decoded, decode_err = json.decode(content)
                if decode_err then return nil, decode_err end
                content = decoded
            end
            by_id[row.data_id] = { content = content }
        end
        for _, result in ipairs(results) do
            local values: { any } = {}
            for _, data_id in ipairs(result.content.data_ids) do
                local output = by_id[data_id]
                if not output then return nil, errors.new({ kind = errors.INTERNAL, message = "step output reference is unavailable: " .. data_id }) end
                values[#values + 1] = output.content
            end
            if #values > 0 then
                result.content.output = #values == 1 and values[1] or values
                result.row.content = result.content
            end
        end
    end
    -- The reader has no LIMIT/OFFSET; page the ordered result in memory.
    local out: { any } = {}
    local from = offset + 1
    local to = offset + limit
    local total = #(all_rows or {})
    for i = from, math.min(to, total) do out[#out + 1] = (all_rows :: { any })[i] end
    if to < total then return out, nil, math.floor(to) end
    return out, nil
end

end

local default, private = runs_read.new()
attach(default, private)
return {
    output_for_run = default.output_for_run,
    run_completed = default.run_completed,
    run_node_headers = default.run_node_headers,
    run_node_data = default.run_node_data,
    attach = attach,
}
