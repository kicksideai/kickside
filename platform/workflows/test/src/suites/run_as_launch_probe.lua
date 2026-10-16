local runs = require("runs")

local function stub_client(): any
    local statuses: any = {}
    return {
        create_workflow = function(_self: any, _commands: any, options: any): (any?, any?)
            statuses[options.dataflow_id] = "pending"
            return options.dataflow_id, nil
        end,
        get_status = function(_self: any, dataflow_id: string): (any?, any?) return statuses[dataflow_id], nil end,
        start = function(_self: any, dataflow_id: string, _options: any): (any?, any?)
            statuses[dataflow_id] = "running"
            return dataflow_id, nil
        end,
        execute = function(_self: any, dataflow_id: string, _options: any): (any?, any?)
            statuses[dataflow_id] = "completed"
            return { success = true, dataflow_id = dataflow_id }, nil
        end,
        output = function(_self: any, _dataflow_id: string): (any?, any?) return {}, nil end,
    }, nil
end

local function launch(args: any): any
    runs._client_new = stub_client
    runs._update_public_meta = function(_component_id: string, _patch: any): () end
    local result, launch_err = runs.launch(args.workflow_id, { version = 1, input = {}, mode = "sync" })
    if launch_err then return { success = false, error = tostring(launch_err) } end
    return { success = true, run_id = result.run_id }
end

return { launch = launch }
