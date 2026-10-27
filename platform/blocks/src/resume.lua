-- Generic Signal resume owned by Blocks/Dataflow rather than the optional visual
-- Workflows plugin.

local funcs = require("funcs")
local security = require("security")
local client = require("client")
local destination = require("destination")
local execution_frame = require("execution_frame")

local M = {}

type Map = { [string]: any }

local RESUME_UNDER_IDENTITY = "kickside.blocks:resume_under_identity"

local function signal(dataflow_id: string, signal_id: string, payload: any): (Map?, error?)
    local cli, client_err = client.new()
    if not cli then return nil, destination.failure(client_err, "Dataflow client unavailable",
        "BLOCK_SIGNAL_CLIENT_UNAVAILABLE", errors.UNAVAILABLE, true) end
    local result, err = cli:signal(dataflow_id, signal_id, payload)
    if err then return nil, destination.failure(err, "Signal delivery failed",
        "BLOCK_SIGNAL_FAILED", errors.UNAVAILABLE, true) end
    return {
        ok = true,
        dataflow_id = dataflow_id,
        signal_id = signal_id,
        commit_id = type(result) == "table" and (result :: Map).commit_id or nil,
    }, nil
end

function M.resume_under_identity(args: any): (Map?, error?)
    if not security.actor() or not security.scope() then
        return nil, destination.failure(nil, "Signal identity was not reconstructed",
            "BLOCK_SIGNAL_IDENTITY_REQUIRED", errors.PERMISSION_DENIED, false)
    end
    local dataflow_id, signal_id, args_err = destination.ids(args)
    if args_err then return nil, args_err end
    local a = args :: Map
    local flow, flow_err = destination.get(dataflow_id)
    if flow_err then return nil, flow_err end
    local actor = security.actor()
    if flow.actor_id ~= actor:id() then
        return nil, destination.failure(nil, "Signal identity does not own the Flow",
            "BLOCK_SIGNAL_IDENTITY_MISMATCH", errors.PERMISSION_DENIED, false)
    end
    local _, signal_err = destination.pending(dataflow_id, signal_id, flow)
    if signal_err then return nil, signal_err end
    return signal(dataflow_id, signal_id, type(a.payload) == "table" and a.payload or {})
end

function M.resume(args: any): (Map?, error?)
    local dataflow_id, signal_id, args_err = destination.ids(args)
    if args_err then return nil, args_err end
    local a = args :: Map
    local payload = type(a.payload) == "table" and a.payload or (type(a.data) == "table" and a.data or {})
    -- Dataflow freezes the authorizing identity on the Flow itself. A webhook,
    -- inbox callback, or process restart therefore resumes under that durable
    -- identity without depending on whichever visual plugin authored the graph.
    -- The row's context format belongs to Dataflow: its execution frame decodes
    -- every shape it has ever written and applies the same reconstruction rigor
    -- the engine's own orchestrator revival uses.
    local flow_row, flow_err = destination.get(dataflow_id)
    if flow_err then return nil, flow_err end
    local metadata = type((flow_row :: Map).metadata) == "table" and (flow_row :: Map).metadata or nil
    if metadata and type(metadata.run_id) == "string" and metadata.run_id ~= "" then
        local handler = metadata.resume_handler
        if type(handler) ~= "string" or handler == "" then
            return nil, destination.failure(nil, "Flow resume handler unavailable",
                "BLOCK_FLOW_RESUME_HANDLER_UNAVAILABLE", errors.PERMISSION_DENIED, false)
        end
        local result, handler_err = funcs.call(handler, {
            dataflow_id = dataflow_id,
            signal_id = signal_id,
            payload = payload,
        })
        if handler_err then return nil, destination.failure(handler_err, "Flow resume handler failed",
            "BLOCK_FLOW_RESUME_HANDLER_FAILED", errors.UNAVAILABLE, true) end
        if type(result) ~= "table" then return nil, destination.failure(nil, "Flow resume handler returned an invalid result",
            "BLOCK_SIGNAL_RESULT_INVALID", errors.INTERNAL, false) end
        return result, nil
    end
    local actor, scope, frame_err = execution_frame.reconstruct(
        tostring((flow_row :: Map).actor_id or ""),
        (flow_row :: Map).actor_context
    )
    if frame_err or not actor or not scope then
        return nil, destination.failure(frame_err, "Flow identity invalid",
            "BLOCK_FLOW_IDENTITY_INVALID", errors.PERMISSION_DENIED, false)
    end
    local executor, executor_err = funcs.new()
    if not executor then return nil, destination.failure(executor_err, "Signal executor unavailable",
        "BLOCK_SIGNAL_EXECUTOR_UNAVAILABLE", errors.UNAVAILABLE, true) end
    local resumed, resume_err = executor:with_actor(actor):with_scope(scope):call(RESUME_UNDER_IDENTITY, {
        dataflow_id = dataflow_id,
        signal_id = signal_id,
        payload = payload,
    })
    if resume_err then return nil, destination.failure(resume_err, "Signal resume failed",
        "BLOCK_SIGNAL_RESUME_FAILED", errors.UNAVAILABLE, true) end
    if type(resumed) ~= "table" then return nil, destination.failure(nil, "Signal resume returned an invalid result",
        "BLOCK_SIGNAL_RESULT_INVALID", errors.INTERNAL, false) end
    return resumed :: Map, nil
end

return M
