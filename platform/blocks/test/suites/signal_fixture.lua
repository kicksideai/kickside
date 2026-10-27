local client = require("client")
local consts = require("consts")
local uuid = require("uuid")

local function create(args: { state: string }): (any?, any?)
    local cli, err = client.new()
    if err then return nil, err end
    local node_id, yield_id = uuid.v4(), uuid.v4()
    local commands = {{ type = consts.COMMAND_TYPES.CREATE_NODE, payload = {
        node_id = node_id, node_type = "kickside.blocks:await",
        status = args.state == "declared" and consts.STATUS.PENDING
            or (args.state == "arming" and consts.STATUS.RUNNING or consts.STATUS.WAITING),
        config = {signal_id = "review", arm_id = "app:external_arm"},
    } }}
    if args.state ~= "declared" then
        commands[#commands + 1] = {type = consts.COMMAND_TYPES.CREATE_DATA, payload = {
            data_id = uuid.v4(), node_id = node_id, data_type = consts.DATA_TYPE.NODE_YIELD,
            key = yield_id, content_type = consts.CONTENT_TYPE.JSON,
            content = {yield_id = yield_id, yield_context = {wait_for_signal = true, signal_id = "review"}},
        }}
    end
    if args.state == "closed" then
        commands[#commands + 1] = {type = consts.COMMAND_TYPES.CREATE_DATA, payload = {
            data_id = uuid.v4(), node_id = node_id, data_type = consts.DATA_TYPE.NODE_YIELD_RESULT,
            key = yield_id, content_type = consts.CONTENT_TYPE.JSON, content = {outcome = "approve"},
        }}
    end
    local id, create_err = cli:create_workflow(commands)
    if create_err then return nil, create_err end
    return {dataflow_id = id, signal_id = "review", node_id = node_id}, nil
end
return {create = create}
