-- Blocks owns destination inspection; external arm owners use authorize_arm.
local sql = require("sql")
local json = require("json")
local consts = require("consts")
local dataflow_repo = require("dataflow_repo")
local data_reader = require("data_reader")
local error_envelope = require("error_envelope")

local M = {}
type Map = { [string]: any }

function M.failure(err: any, message: string, code: string, kind: string, retryable: boolean): error
    if type(err) == "userdata" then
        local native = err :: error
        local details = native:details() or {}
        return error_envelope.wrap(native, message, {code = details.code or code, blocks_code = code})
    end
    return errors.new({message = message, kind = kind, retryable = retryable,
        details = {code = code, cause = err}})
end

function M.ids(args: any): (string, string, error?)
    local a = type(args) == "table" and (args :: Map) or {}
    if type(a.dataflow_id) ~= "string" or a.dataflow_id == "" then
        return "", "", M.failure(nil, "dataflow_id is required", "BLOCK_DATAFLOW_ID_REQUIRED", errors.INVALID, false)
    end
    if type(a.signal_id) ~= "string" or a.signal_id == "" then
        return "", "", M.failure(nil, "signal_id is required", "BLOCK_SIGNAL_ID_REQUIRED", errors.INVALID, false)
    end
    return a.dataflow_id, a.signal_id, nil
end

function M.get(dataflow_id: string): (Map?, error?)
    -- Dataflow's get() conflates absent rows and database failures as strings.
    -- Read this one row natively until its repository exposes typed absence.
    local db, db_err = sql.get(consts.APP_DB)
    if not db then
        return nil, M.failure(db_err, "Flow lookup unavailable", "BLOCK_FLOW_LOOKUP_FAILED", errors.UNAVAILABLE, true)
    end
    local rows, read_err = sql.builder.select("actor_id", "actor_context", "status", "metadata")
        :from("dataflows"):where("dataflow_id = ?", dataflow_id):limit(1):run_with(db):query()
    db:release()
    if read_err then
        return nil, M.failure(read_err, "Flow lookup failed", "BLOCK_FLOW_LOOKUP_FAILED", errors.UNAVAILABLE, true)
    end
    if not rows or not rows[1] then
        return nil, M.failure(nil, "Flow not found", "BLOCK_FLOW_NOT_FOUND", errors.NOT_FOUND, false)
    end
    local row = rows[1] :: Map
    if type(row.metadata) == "string" and row.metadata ~= "" then
        local metadata, decode_err = json.decode(row.metadata)
        if decode_err then
            return nil, M.failure(decode_err, "Flow metadata invalid", "BLOCK_FLOW_METADATA_INVALID", errors.INTERNAL, false)
        end
        row.metadata = metadata
    end
    return row, nil
end

local function content(value: any): (Map?, error?)
    if type(value) == "table" then return value :: Map, nil end
    local decoded, err = json.decode(value)
    if err or type(decoded) ~= "table" then
        return nil, M.failure(err, "Signal wait record invalid", "BLOCK_SIGNAL_STATE_INVALID", errors.INTERNAL, false)
    end
    return decoded :: Map, nil
end

function M.pending(dataflow_id: string, signal_id: string, flow: Map): (Map?, error?)
    local status = flow.status
    if status == consts.STATUS.COMPLETED_SUCCESS or status == consts.STATUS.COMPLETED_FAILURE
        or status == consts.STATUS.CANCELLED or status == consts.STATUS.TERMINATED then
        return nil, M.failure(nil, "Flow is closed", "BLOCK_SIGNAL_NOT_FOUND", errors.NOT_FOUND, false)
    end
    local nodes, nodes_err = dataflow_repo.get_nodes_for_dataflow(dataflow_id)
    if nodes_err then
        return nil, M.failure(nodes_err, "Signal nodes lookup failed", "BLOCK_SIGNAL_LOOKUP_FAILED", errors.UNAVAILABLE, true)
    end
    local candidates: Map = {}
    for _, node in ipairs(nodes or {}) do
        -- During arm invocation the yield is durable but passivation has not
        -- changed RUNNING to WAITING yet.
        if node.type == "kickside.blocks:await" and
            (node.status == consts.STATUS.WAITING or node.status == consts.STATUS.PENDING
                or node.status == consts.STATUS.RUNNING) then
            candidates[node.node_id] = node
        end
    end
    -- Read Dataflow's durable yield and result records through its reader API.
    -- A declaration alone is insufficient; a committed result closes the wait
    -- even before the resumed node persists its terminal status.
    local ok, records, records_err = pcall(function()
        return data_reader.with_dataflow(dataflow_id)
            :with_data_types(consts.DATA_TYPE.NODE_YIELD, consts.DATA_TYPE.NODE_YIELD_RESULT)
            :fetch_options({resolve_references = false}):all()
    end)
    if not ok or records_err then
        return nil, M.failure(records_err or records, "Signal wait lookup failed", "BLOCK_SIGNAL_LOOKUP_FAILED", errors.UNAVAILABLE, true)
    end
    local satisfied: Map = {}
    for _, record in ipairs(records or {}) do
        if record.type == consts.DATA_TYPE.NODE_YIELD_RESULT then
            satisfied[record.key or record.discriminator] = true
        end
    end
    local pending: Map = {}
    local closed: Map = {}
    for _, record in ipairs(records or {}) do
        if record.type == consts.DATA_TYPE.NODE_YIELD and candidates[record.node_id] then
            local value, decode_err = content(record.content)
            if decode_err then return nil, decode_err end
            local wait = type(value.yield_context) == "table" and value.yield_context or {}
            if wait.wait_for_signal == true and wait.signal_id == signal_id then
                if satisfied[value.yield_id] then closed[record.node_id] = true end
                pending[record.node_id] = candidates[record.node_id]
            end
        end
    end
    for id, node in pairs(pending) do
        if not closed[id] then return node, nil end
    end
    return nil, M.failure(nil, "Pending Block signal not found", "BLOCK_SIGNAL_NOT_FOUND", errors.NOT_FOUND, false)
end

return M
