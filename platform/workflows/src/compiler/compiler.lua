-- Compiler facade. compile(document) validates the canvas graph and materializes the
-- engine command stream in one call (two-phase internally: graph.build is pure and
-- freezes the artifact + the exact-id allowlist; materialize.emit lowers to raw
-- CREATE_NODE/CREATE_DATA with node ids = the stable def_node_ids). Validation errors
-- are returned structured so publish reports them and refuses. remint mints fresh
-- per-run node/data uuids from the frozen command stream while preserving every
-- metadata.def_node_id, and injects the run input — this is what the launcher calls
-- per run so each run is an independent dataflow.

local graph = require("graph")
local materialize = require("materialize")
local consts = require("consts")
local expr = require("expr")

local M = {}

type Map = { [string]: any }

-- Expose the module-owned required-config gate independently of a full graph
-- compile so the run plane can defend a newly-published artifact before launch.
function M.validate_config_requirements(document: any, blocks: any): { Map }
    return graph.validate_config_requirements(document, blocks)
end

-- compile(document, opts) -> (result, err). opts: { workflow_id, version }.
-- result: { ok, errors, commands, allowlist, entry_id }. err is non-nil only on an
-- internal materialization failure over an already-validated graph.
function M.compile(document: any, opts: any): (Map?, string?)
    opts = type(opts) == "table" and opts or {}
    local ir, errors = graph.build(document, opts)
    if not ir or #errors > 0 then
        return { ok = false, errors = errors, commands = {}, allowlist = { tools = {}, agents = {}, signals = {}, ports = {} } }, nil
    end
    local commands, merr = materialize.emit(ir, opts)
    if not commands then
        errors[#errors + 1] = { code = "materialize_failed", message = tostring(merr) }
        return { ok = false, errors = errors, commands = {}, allowlist = (ir :: Map).allowlist }, nil
    end
    return {
        ok = true,
        errors = {},
        commands = commands,
        allowlist = (ir :: Map).allowlist,
        entry_id = (ir :: Map).entry_id,
        input_schema = (ir :: Map).input_schema,
        synthesized_start = (ir :: Map).synthesized_start == true,
    }, nil
end

local function is_entry_marker(value: string): boolean
    return value == "__entry_input__" or value:sub(1, 16) == "__entry_input__:"
end

local function deep_copy(v: any): any
    if type(v) ~= "table" then return v end
    local out: any = {}
    for k, item in pairs(v :: { [any]: any }) do out[k] = deep_copy(item) end
    return out
end

-- remint(commands, gen_id, input, opts) -> (fresh_commands, id_map). gen_id() must return a
-- fresh unique id per call (uuid.v7 in production). Rewrites every CREATE_NODE node_id
-- and every data_targets[].node_id / CREATE_DATA node_id to a fresh id via a stable
-- def_node_id -> fresh_id map, assigns a fresh data_id to every CREATE_DATA, injects
-- `input` as the content of the workflow-input and entry-input rows, preserves
-- metadata.def_node_id, and installs the run identity in each node's function context.
-- opts.nested remints the stream for INLINE expansion inside a running dataflow
-- (a Flow node expanding a child Flow): a terminal there is not the dataflow's
-- output but the expanding node's, so its workflow-output targets become
-- node-output ones -- the rows the engine collects as the expanding node's
-- result and routes on the parent's edges.
-- The dataflow func executor makes config.context available through ctx.get(), which
-- preserves the normal default flow input (unlike config.args). Pure (no engine,
-- no uuid dep) so it is unit-testable.
function M.remint(commands: any, gen_id: any, input: any, opts: any?): ({ Map }?, Map?, string?)
    opts = type(opts) == "table" and opts or {}
    local run_id = type((opts :: Map).run_id) == "string" and (opts :: Map).run_id or nil
    local dataflow_id = type((opts :: Map).dataflow_id) == "string" and (opts :: Map).dataflow_id or nil
    local workflow_stack = type((opts :: Map).workflow_stack) == "table" and (opts :: Map).workflow_stack or nil
    local depth = tonumber((opts :: Map).depth)
    local nested = (opts :: Map).nested == true
    local list = type(commands) == "table" and (commands :: { Map }) or {}
    local id_map: Map = {}
    for _, cmd in ipairs(list) do
        local c = cmd :: Map
        if c.type == "CREATE_NODE" then
            local p = type(c.payload) == "table" and (c.payload :: Map) or {}
            local old = tostring(p.node_id or "")
            if old ~= "" and not id_map[old] then id_map[old] = gen_id() end
        end
    end

    local out: { Map } = {}
    for _, cmd in ipairs(list) do
        local c = deep_copy(cmd) :: Map
        local p = type(c.payload) == "table" and (c.payload :: Map) or {}
        if c.type == "CREATE_NODE" then
            local old = tostring(p.node_id or "")
            if id_map[old] then p.node_id = id_map[old] end
            local parent = tostring(p.parent_node_id or "")
            if parent ~= "" and id_map[parent] then p.parent_node_id = id_map[parent] end
            local cfg = type(p.config) == "table" and (p.config :: Map) or nil
            local md = type(p.metadata) == "table" and (p.metadata :: Map) or {}
            -- Keep execution identity in persisted node config so it survives restarts.
            -- Function nodes expose config.context through ctx.get(); native process
            -- nodes consume the same context directly from their node config. Blocks
            -- execute on behalf of the workflow component, so component_id names it
            -- the same way a contract binding names the component it runs for.
            if cfg and run_id then
                local context: Map = type(cfg.context) == "table" and (cfg.context :: Map) or {}
                local flow_id = tostring(md.workflow_id or "")
                local flow_version = tonumber(md.version) or tonumber((opts :: Map).version) or 0
                if flow_id ~= "" then context.component_id = flow_id end
                context.run_context = {
                    run_id = run_id,
                    dataflow_id = dataflow_id,
                    flow_ref = flow_id ~= "" and flow_version > 0 and { kind = "flow", id = flow_id, version = flow_version } or nil,
                    def_node_id = tostring(md.def_node_id or old),
                    workflow_stack = workflow_stack and deep_copy(workflow_stack) or nil,
                    depth = depth,
                }
                cfg.context = context
            end
            local targets = type(p.config) == "table" and (p.config :: Map).data_targets or nil
            if type(targets) == "table" then
                for _, t in ipairs(targets :: { Map }) do
                    local tn = tostring(t.node_id or "")
                    if tn ~= "" and id_map[tn] then t.node_id = id_map[tn] end
                    if nested and t.data_type == consts.DATA_TYPE.WORKFLOW_OUTPUT then
                        t.data_type = consts.DATA_TYPE.NODE_OUTPUT
                    end
                end
            end
            local error_targets = type(p.config) == "table" and (p.config :: Map).error_targets or nil
            if type(error_targets) == "table" then
                for _, t in ipairs(error_targets :: { Map }) do
                    local tn = tostring(t.node_id or "")
                    if tn ~= "" and id_map[tn] then t.node_id = id_map[tn] end
                    if nested and t.data_type == consts.DATA_TYPE.WORKFLOW_OUTPUT then
                        t.data_type = consts.DATA_TYPE.NODE_OUTPUT
                    end
                end
            end
        elseif c.type == "CREATE_DATA" then
            local marker = tostring(p.data_id or "")
            p.data_id = gen_id()
            local entry_marker = is_entry_marker(marker)
            if entry_marker then
                local condition = type(p._workflow_input_condition) == "string" and p._workflow_input_condition or nil
                local transform = type(p._workflow_input_transform) == "string" and p._workflow_input_transform or nil
                p._workflow_input_condition = nil
                p._workflow_input_transform = nil
                if condition then
                    local allowed, condition_err = expr.eval(condition, { output = input })
                    if condition_err then return nil, nil, "workflow input condition failed: " .. tostring(condition_err) end
                    if not allowed then goto continue end
                end
                if transform then
                    local transformed, transform_err = expr.eval(transform, { output = input })
                    if transform_err then return nil, nil, "workflow input mapping failed: " .. tostring(transform_err) end
                    p.content = transformed
                elseif input ~= nil then
                    p.content = input
                end
            elseif marker == "__workflow_input__" and input ~= nil then
                p.content = input
            end
            local tn = tostring(p.node_id or "")
            if tn ~= "" and id_map[tn] then p.node_id = id_map[tn] end
        end
        out[#out + 1] = c
        ::continue::
    end
    return out, id_map, nil
end

return M
