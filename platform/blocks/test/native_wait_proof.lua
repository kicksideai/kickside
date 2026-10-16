local client = require("client")
local consts = require("consts")
local uuid_v4 = require("uuid").v4

local M = {}

function M.start(): (any?, string?)
    local c, client_err = client.new()
    if not c then return nil, tostring(client_err) end
    local node_id = uuid_v4()
    local dataflow_id, create_err = c:create_workflow({
        {
            type = consts.COMMAND_TYPES.CREATE_NODE,
            payload = {
                node_id = node_id,
                node_type = "kickside.blocks:await",
                status = consts.STATUS.PENDING,
                config = {
                    signal_id = "native-wait-restart",
                    arm_id = "app:native_wait_arm",
                    block_config = {},
                    context = {
                        run_context = {
                            flow_ref = { kind = "flow", id = "native-wait-flow", version = 1 },
                            run_id = "native-wait-run",
                            extension = { owner = "proof" },
                        },
                    },
                    data_targets = {
                        { data_type = consts.DATA_TYPE.WORKFLOW_OUTPUT, content_type = consts.CONTENT_TYPE.JSON, key = "result" },
                    },
                },
                metadata = { title = "Native wait restart proof", def_node_id = "wait" },
            },
        },
        {
            type = consts.COMMAND_TYPES.CREATE_DATA,
            payload = {
                data_id = uuid_v4(), node_id = node_id,
                data_type = consts.DATA_TYPE.NODE_INPUT,
                discriminator = "default",
                content = { marker = "parked-before-restart" },
                content_type = consts.CONTENT_TYPE.JSON,
            },
        },
    }, { type = "native-wait-proof", metadata = { title = "Native wait restart proof" } })
    if create_err or not dataflow_id then return nil, tostring(create_err) end
    local started, start_err = c:start(dataflow_id)
    if start_err or not started then return nil, tostring(start_err) end
    return { dataflow_id = dataflow_id, node_id = node_id, signal_id = "native-wait-restart" }, nil
end

return M
