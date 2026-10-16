-- Generic Signal resume owned by Blocks/Dataflow rather than the optional visual
-- Workflows plugin.

local funcs = require("funcs")
local security = require("security")
local client = require("client")
local dataflow_repo = require("dataflow_repo")
local execution_frame = require("execution_frame")

local M = {}

type Map = { [string]: any }

local RESUME_UNDER_IDENTITY = "kickside.blocks:resume_under_identity"

local function signal(dataflow_id: string, signal_id: string, payload: any): (Map?, string?)
    local cli, client_err = client.new()
    if not cli then return nil, tostring(client_err or "Dataflow client unavailable") end
    local result, err = cli:signal(dataflow_id, signal_id, payload)
    if err then return nil, tostring(err) end
    return {
        ok = true,
        dataflow_id = dataflow_id,
        signal_id = signal_id,
        commit_id = type(result) == "table" and (result :: Map).commit_id or nil,
    }, nil
end

function M.resume_under_identity(args: any): (Map?, string?)
    if not security.actor() or not security.scope() then
        return nil, "Signal identity was not reconstructed"
    end
    local a = type(args) == "table" and (args :: Map) or {}
    local dataflow_id = tostring(a.dataflow_id or "")
    local signal_id = tostring(a.signal_id or "")
    if dataflow_id == "" then return nil, "dataflow_id is required" end
    if signal_id == "" then return nil, "signal_id is required" end
    return signal(dataflow_id, signal_id, type(a.payload) == "table" and a.payload or {})
end

function M.resume(args: any): (Map?, string?)
    local a = type(args) == "table" and (args :: Map) or {}
    local dataflow_id = tostring(a.dataflow_id or "")
    local signal_id = tostring(a.signal_id or "")
    if dataflow_id == "" then return nil, "dataflow_id is required" end
    if signal_id == "" then return nil, "signal_id is required" end
    local payload = type(a.payload) == "table" and a.payload or (type(a.data) == "table" and a.data or {})
    -- Dataflow freezes the authorizing identity on the Flow itself. A webhook,
    -- inbox callback, or process restart therefore resumes under that durable
    -- identity without depending on whichever visual plugin authored the graph.
    -- The row's context format belongs to Dataflow: its execution frame decodes
    -- every shape it has ever written and applies the same reconstruction rigor
    -- the engine's own orchestrator revival uses.
    local flow_row, flow_err = dataflow_repo.get(dataflow_id)
    if flow_err or type(flow_row) ~= "table" then
        return nil, "Flow identity unavailable: " .. tostring(flow_err or "not found")
    end
    local metadata = type((flow_row :: Map).metadata) == "table" and (flow_row :: Map).metadata or nil
    if metadata and type(metadata.run_id) == "string" and metadata.run_id ~= "" then
        local handler = metadata.resume_handler
        if type(handler) ~= "string" or handler == "" then
            return nil, "Flow resume handler unavailable"
        end
        return funcs.call(handler, {
            dataflow_id = dataflow_id,
            signal_id = signal_id,
            payload = payload,
        })
    end
    local actor, scope, frame_err = execution_frame.reconstruct(
        tostring((flow_row :: Map).actor_id or ""),
        (flow_row :: Map).actor_context
    )
    if frame_err or not actor or not scope then
        return nil, "Flow identity invalid: " .. tostring(frame_err or "missing actor or scope")
    end
    local resumed, resume_err = funcs.new():with_actor(actor):with_scope(scope):call(RESUME_UNDER_IDENTITY, {
        dataflow_id = dataflow_id,
        signal_id = signal_id,
        payload = payload,
    })
    if resume_err then return nil, tostring(resume_err) end
    if type(resumed) ~= "table" then return nil, "Signal resume returned an invalid result" end
    return resumed :: Map, nil
end

return M
