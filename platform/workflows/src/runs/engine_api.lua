-- Workflows consumes the published Dataflow client only. Engine ownership and
-- duplicate start fencing belong to Dataflow, not to a workflow-side protocol.
local errors = require("errors")

local M = {}
local REQUIRED = { "create_workflow", "start", "execute", "output", "get_status" }
local TERMINAL = { completed = true, failed = true, cancelled = true, terminated = true }

function M.require_methods(client_instance: any): (any?, any?)
    for _, name in ipairs(REQUIRED) do
        if type(client_instance[name]) ~= "function" then
            return nil, errors.new({ kind = errors.INTERNAL, retryable = false,
                message = "Dataflow client does not support " .. name,
                details = { error_kind = "deployment" } })
        end
    end
    return client_instance, nil
end

local function read_status(cli: any, id: string): (any?, any?)
    local status, err = cli:get_status(id)
    if err or type(status) ~= "string" then return nil, err or "dataflow status unavailable" end
    return { status = status }, nil
end

local function read_output(cli: any, id: string, current: any): (any?, any?)
    if TERMINAL[current.status] then
        local output, output_err = cli:output(id)
        if output_err then return nil, output_err end
        current.output = output
    end
    return current, nil
end

function M.read(cli: any, id: string): (any?, any?)
    local current, read_err = read_status(cli, id)
    if not current then return nil, read_err end
    return read_output(cli, id, current)
end

-- The reservation and its exact creation payload commit before this function.
-- A failed/ambiguous create can only retry the same unique Dataflow primary key.
-- An admitted run with a missing engine is never recreated.
function M.run(cli: any, row: any, payload: any, sync: boolean?): (any?, any?, any?)
    local id = tostring(row.dataflow_id)
    local current, read_err = read_status(cli, id)
    if not current then
        if row.admission_state == "admitted" then return nil, read_err, nil end
        local created, create_err = cli:create_workflow(payload.commands, payload.options)
        current, read_err = read_status(cli, id)
        if not current then return nil, create_err or read_err or "dataflow creation unavailable", nil end
        if not create_err and created ~= id then return nil, "create_workflow returned a different id", nil end
    end
    local execution: any = nil
    -- Admission records a successful durable activation request. Status may
    -- still lag that request; observing an admitted run never starts it again.
    if current.status == "pending" and row.admission_state == "admitted" then
        current.status = "running"
    end
    if current.status == "pending" then
        local started, start_err: any
        if sync then
            execution, start_err = cli:execute(id, payload.start_options)
            started = execution
        else
            started, start_err = cli:start(id, payload.start_options)
        end
        -- A lost response may have committed start or even completion. Read
        -- the same persisted flow before deciding whether admission is pending.
        current, read_err = read_status(cli, id)
        if not current then return nil, read_err or start_err, execution end
        if current.status == "pending" then
            if start_err or not started then return nil, start_err or "dataflow start unavailable", execution end
            -- start's successful response means durable execution was requested;
            -- the orchestrator may not have written running yet, or may be parked.
            current.status = "running"
        end
        if type(execution) == "table" then current.error = execution.error end
    end
    -- A passivated Dataflow persists waiting; its own signal/timer wake resumes it.
    if current.status == "waiting" then current.status = "running" end
    if current.status ~= "running" and not TERMINAL[current.status] then
        return nil, "unexpected dataflow status: " .. tostring(current.status), execution
    end
    current, read_err = read_output(cli, id, current)
    return current, read_err, execution
end

return M
