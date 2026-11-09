-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Blocks owns authorization and its error contract; Dataflow owns storage reads.
local inspection = require("inspection")
local consts = require("consts")
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

local function inspected_failure(err: any, message: string, fallback: string, codes: Map): error
    if type(err) ~= "userdata" then
        return M.failure(err, message, fallback, errors.UNAVAILABLE, true)
    end
    local details = (err :: error):details() or {}
    return error_envelope.wrap(err, message, {
        code = codes[details.code] or details.code or fallback,
        blocks_code = codes[details.code] or fallback,
    })
end

function M.get(dataflow_id: string): (Map?, error?)
    local flow, err = inspection.flow(dataflow_id)
    if err then
        return nil, inspected_failure(err, "Flow lookup failed", "BLOCK_FLOW_LOOKUP_FAILED", {
            DATAFLOW_FLOW_NOT_FOUND = "BLOCK_FLOW_NOT_FOUND",
            DATAFLOW_FLOW_METADATA_INVALID = "BLOCK_FLOW_METADATA_INVALID",
        })
    end
    return flow, nil
end

function M.pending(dataflow_id: string, signal_id: string, flow: Map): (Map?, error?)
    local status = flow.status
    if status == consts.STATUS.COMPLETED_SUCCESS or status == consts.STATUS.COMPLETED_FAILURE
        or status == consts.STATUS.CANCELLED or status == consts.STATUS.TERMINATED then
        return nil, M.failure(nil, "Flow is closed", "BLOCK_SIGNAL_NOT_FOUND", errors.NOT_FOUND, false)
    end
    local node, err = inspection.pending_signal(dataflow_id, signal_id, "kickside.blocks:await")
    if err then
        return nil, inspected_failure(err, "Signal lookup failed", "BLOCK_SIGNAL_LOOKUP_FAILED", {
            DATAFLOW_SIGNAL_NOT_FOUND = "BLOCK_SIGNAL_NOT_FOUND",
            DATAFLOW_SIGNAL_STATE_INVALID = "BLOCK_SIGNAL_STATE_INVALID",
        })
    end
    return node, nil
end

return M
