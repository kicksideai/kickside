-- The dataflow engine vocabulary the compiler materializes against: node executor
-- registry ids (the node_type on a CREATE_NODE), command stream op types, node
-- status, and the data-type discriminators on CREATE_DATA / data_targets. Verified
-- against the vendored engine registry (platform/agents/.wippy/vendor/wippy/dataflow
-- /node/*/_index.yaml) and wippy/dataflow consts.lua.

local M = {}

M.NODE_TYPE = {
    FUNC = "userspace.dataflow.node.func:node",
    CYCLE = "userspace.dataflow.node.cycle:cycle",
    PARALLEL = "userspace.dataflow.node.parallel:parallel",
    STATE = "userspace.dataflow.node.state:state",
}

M.COMMAND_TYPES = {
    CREATE_NODE = "CREATE_NODE",
    CREATE_DATA = "CREATE_DATA",
}

M.STATUS = {
    TEMPLATE = "template",
    PENDING = "pending",
}

M.DATA_TYPE = {
    NODE_OUTPUT = "node.output",
    NODE_INPUT = "node.input",
    WORKFLOW_OUTPUT = "dataflow.output",
    WORKFLOW_INPUT = "dataflow.input",
}

M.CONTENT_TYPE = {
    JSON = "application/json",
    TEXT = "text/plain",
    REFERENCE = "dataflow/reference",
}

-- The module runtime funcs the compiler binds structural nodes to.
M.RUNTIME = {
    EXPAND_FLOW = "kickside.workflows.runtime:expand_flow",
}

return M
