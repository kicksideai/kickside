local ctx = require("ctx")
local uuid = require("uuid")
local version_read = require("version_read")
local compiler = require("compiler")
local schema_validate = require("schema_validate")
local exact_flow_ref = require("flow_ref")

local M = {}
type Map = { [string]: any }
local MAX_FLOW_DEPTH = 8

local function map(v: any): Map return type(v) == "table" and (v :: Map) or {} end
local function str(v: any): string return type(v) == "string" and v or "" end

M._get_version = function(id: string, version: number): (Map?, string?)
    local value, err = version_read.get(id, version)
    return type(value) == "table" and map(value) or nil, err and tostring(err) or nil
end
M._validate_input = function(schema: any, input: any): string? return schema_validate.validate(schema, input, "input") end
M._remint = function(commands: any, input: any, opts: Map): (any, any, any) return compiler.remint(commands, uuid.v4, input, opts) end
M._run_context = function(): Map return map(ctx.get("run_context")) end

function M.run(args: any): (Map?, string?)
    local a = map(args)
    local ref, ref_err = exact_flow_ref.validate(a.flow_ref)
    if ref_err or not ref then return nil, "nested Flow requires an exact flow_ref: " .. tostring(ref_err) end
    local workflow_id = ref.id
    local version = ref.version
    local input = type(a.input) == "table" and a.input or {}
    local run_context = M._run_context()
    local workflow_stack: { any } = {}
    for _, item in ipairs(type(run_context.workflow_stack) == "table" and run_context.workflow_stack or {}) do
        local id = str(item)
        if id == workflow_id then return nil, "recursive Flow composition rejected: " .. workflow_id end
        if id ~= "" then workflow_stack[#workflow_stack + 1] = id end
    end
    workflow_stack[#workflow_stack + 1] = workflow_id
    local depth = (tonumber(run_context.depth) or math.max(0, #workflow_stack - 2)) + 1
    if depth > MAX_FLOW_DEPTH then return nil, "Flow composition depth exceeded: " .. tostring(depth) end

    local frozen, ferr = M._get_version(workflow_id, version)
    if ferr or not frozen then return nil, tostring(ferr or "Flow version not found") end
    local input_err = M._validate_input(map(frozen).input_schema, input)
    if input_err then return nil, input_err end
    local commands = map(frozen).compiled_commands
    if type(commands) ~= "table" then return nil, "Flow version has no compiled commands" end
    local reminted, _, remint_err = M._remint(commands, input, {
        run_id = run_context.run_id,
        dataflow_id = run_context.dataflow_id,
        version = version,
        workflow_stack = workflow_stack,
        depth = depth,
        nested = true,
    })
    if remint_err or type(reminted) ~= "table" then return nil, tostring(remint_err or "Flow input could not be routed") end
    return { _control = { commands = reminted } }, nil
end

return M
