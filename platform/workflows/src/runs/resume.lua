-- Await resumes load authority from the immutable workflow run, never from the
-- callback's actor or payload. The Dataflow client may load only an owned flow,
-- so the final signal is sent inside this resolved run frame.
local store = require("store")
local dataflow_repo = require("dataflow_repo")
local execution_identity = require("execution_identity")

local M = {}

type Map = { [string]: any }

local function failure(message: string, kind: string): error
    return (errors.new({ message = message, kind = kind }) :: error)
end

function M.resume(args: any): (any?, error?)
    if type(args) ~= "table" then
        return nil, failure("resume arguments are required", errors.INVALID)
    end
    local a = args :: Map
    if type(a.dataflow_id) ~= "string" or a.dataflow_id == ""
        or type(a.signal_id) ~= "string" or a.signal_id == "" then
        return nil, failure("dataflow_id and signal_id are required", errors.INVALID)
    end
    if a.payload ~= nil and type(a.payload) ~= "table" then
        return nil, failure("signal payload must be an object", errors.INVALID)
    end

    local db, open_err = store.open_db()
    if open_err or not db then return nil, open_err end
    local rows, read_err = db:query(
        "SELECT run_id, execution_identity_json FROM workflow_runs WHERE dataflow_id=$1 LIMIT 2",
        { a.dataflow_id })
    db:release()
    if read_err then return nil, read_err end
    if type(rows) ~= "table" or #rows ~= 1 then
        return nil, failure("workflow run not found or ambiguous", errors.PERMISSION_DENIED)
    end
    local run = rows[1] :: Map
    if type(run.execution_identity_json) ~= "string" or run.execution_identity_json == "" then
        return nil, failure("workflow run has no declared execution identity", errors.PERMISSION_DENIED)
    end

    local flow, flow_err = dataflow_repo.get(a.dataflow_id)
    if flow_err then
        return nil, failure(flow_err, errors.UNAVAILABLE)
    end
    if type(flow) ~= "table" then return nil, failure("flow unavailable", errors.UNAVAILABLE) end
    local metadata = type((flow :: Map).metadata) == "table" and (flow :: Map).metadata or nil
    if not metadata or metadata.run_id ~= run.run_id then
        return nil, failure("flow admission does not match the workflow run", errors.PERMISSION_DENIED)
    end
    local identity, identity_err = execution_identity.from_row((flow :: Map).actor_id,
        run.execution_identity_json)
    if identity_err or not identity then return nil, identity_err end

    return execution_identity.run_as(identity, "kickside.blocks:resume_under_identity", {
        dataflow_id = a.dataflow_id,
        signal_id = a.signal_id,
        payload = a.payload or {},
    }, {
        deferred_owner = "kickside.workflows.runs:resume",
        execution_root = identity.component_id,
    })
end

return M
