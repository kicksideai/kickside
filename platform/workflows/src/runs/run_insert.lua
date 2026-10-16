-- The one workflow run row insertion used by binding admission and launch.
-- Its caller holds the trigger gate.
local M = {}

type Map = { [string]: any }

function M.insert_tx(tx: any, run: Map): error?
    local cols: { string } = {}
    local marks: { string } = {}
    local values: { any } = {}
    local function put(column: string, value: any): ()
        if value == nil then return end
        cols[#cols + 1] = column
        values[#values + 1] = value
        marks[#marks + 1] = "$" .. tostring(#values)
    end
    put("run_id", run.run_id)
    put("workflow_id", run.workflow_id)
    put("version", run.version)
    put("draft_def_seq", run.draft_def_seq)
    put("dataflow_id", run.dataflow_id)
    put("trigger_kind", run.trigger_kind)
    put("trigger_id", run.trigger_id)
    put("dedup_key", run.dedup_key)
    put("admission_hash", run.admission_hash)
    put("origin", run.origin)
    put("status", run.status)
    put("started_at", run.started_at)
    put("invocation_id", run.invocation_id)
    put("binding_id", run.binding_id)
    put("binding_revision", run.binding_revision)
    put("admission_state", run.admission_state)
    put("completion_check_at", run.completion_check_at)
    put("execution_identity_json", run.execution_identity_json)
    put("creation_payload_json", run.creation_payload_json)
    local result, err = tx:execute("INSERT INTO workflow_runs (" .. table.concat(cols, ",")
        .. ") VALUES (" .. table.concat(marks, ",") .. ") ON CONFLICT DO NOTHING", values)
    if err then return err end
    if not result or tonumber(result.rows_affected) == nil then
        return (errors.new({ message = "workflow run insert returned no affected-row count",
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    if tonumber(result.rows_affected) ~= 1 then
        return (errors.new({ message = "workflow run insert conflicted", kind = errors.CONFLICT,
            retryable = false }) :: error)
    end
    return nil
end

return M
