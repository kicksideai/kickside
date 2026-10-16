-- Index and validate the authored nodes and explicit Start/Finish boundaries.
local M = {}
type Map = { [string]: any }
type Err = { code: string, message: string, node_id: string?, edge_id: string? }
function M.build(raw_nodes: { any }, doc: Map, blocks: Map, errors: { Err }, I: any,
    validate_config_requirements: any): { nodes: { [string]: Map }, order: { string },
    starts: { string }, finishes: { string }, error_boundaries: { string },
    entry_id: string?, synthesized_start: boolean, has_boundary: boolean }
local str, is_reserved_id, err = I.str, I.is_reserved_id, I.err
local ALL_KINDS, CONFIG_FIELDS = I.ALL_KINDS, I.CONFIG_FIELDS
local branch_predicate, is_str = I.branch_predicate, I.is_str
local exact_flow_ref, generic_object_schema = I.exact_flow_ref, I.generic_object_schema
local SYNTH_START_ID = I.SYNTH_START_ID
local M = { validate_config_requirements = validate_config_requirements }
    -- ── index + node validation ──────────────────────────────────────────
    local nodes: { [string]: Map } = {}
    local order: { string } = {}
    local starts: { string } = {}
    local finishes: { string } = {}
    local error_boundaries: { string } = {}
    for _, raw in ipairs(raw_nodes) do
        local n = type(raw) == "table" and (raw :: Map) or {}
        local id = str(n.id)
        if id == "" then
            err(errors, "node_id_required", "a node is missing its id")
        elseif is_reserved_id(id) then
            err(errors, "node_id_reserved", "reserved node id refused: " .. id, id)
        elseif nodes[id] then
            err(errors, "node_duplicate", "duplicate node id: " .. id, id)
        else
            local kind = str(n.kind)
            local declared = kind == "block" and blocks[str(n.ref)] or nil
            if n.node_type ~= nil or n.lowerer ~= nil or n.execution ~= nil then
                err(errors, "node_runtime_override_refused", "Flow nodes cannot override native execution", id)
            end
            if kind == "block" and type(declared) ~= "table" then
                err(errors, "block_unknown", "unknown Block reference: " .. tostring(n.ref), id)
            elseif not ALL_KINDS[kind] then
                err(errors, "node_kind_unknown", "unknown node kind: " .. tostring(n.kind), id)
            end
            nodes[id] = n
            order[#order + 1] = id
            if kind == "start" then starts[#starts + 1] = id end
            if kind == "finish" then finishes[#finishes + 1] = id end
            if kind == "error" then error_boundaries[#error_boundaries + 1] = id end
        end
    end

    -- Apply the required Block config contract before graph analysis. `config.inputs`
    -- is intentionally not involved: it is the engine's routed-data readiness gate,
    -- while this validates static node configuration.
    for _, problem in ipairs(M.validate_config_requirements(doc, blocks)) do
        errors[#errors + 1] = problem
    end

    local synthesized_start = false
    local has_authored_boundary = #starts > 0 or #finishes > 0 or #error_boundaries > 0
    if #starts == 0 then
        synthesized_start = true
        local start_node: Map = {
            id = SYNTH_START_ID,
            kind = "start",
            title = "Start",
            config = { input_schema = generic_object_schema() },
        }
        nodes[SYNTH_START_ID] = start_node
        table.insert(order, 1, SYNTH_START_ID)
        starts[1] = SYNTH_START_ID
    end
    local has_boundary = #starts > 0 or #finishes > 0 or #error_boundaries > 0
    if has_boundary then
        if #starts == 0 then
            err(errors, "boundary_start_missing", "workflow needs exactly one Start boundary node")
        elseif #starts > 1 then
            err(errors, "boundary_start_multiple", "workflow has more than one Start boundary node", starts[2])
        end
        if #finishes == 0 then
            if has_authored_boundary and not synthesized_start then
                err(errors, "boundary_finish_missing", "workflow boundary mode needs exactly one Finish boundary node")
            end
        elseif #finishes > 1 then
            err(errors, "boundary_finish_multiple", "workflow has more than one Finish boundary node", finishes[2])
        end
        if #error_boundaries > 1 then
            err(errors, "boundary_error_multiple", "workflow has more than one Error boundary node", error_boundaries[2])
        end
    end
    local entry_id = starts[1]

    -- ── ref / port presence (schema proxy) ───────────────────────────────
    for _, id in ipairs(order) do
        local n = (nodes[id] or {}) :: Map
        local kind = str(n.kind)
        local cfg = type(n.config) == "table" and (n.config :: Map) or {}
        if kind == "block" then
            if not is_str(n.ref) then err(errors, "block_ref_missing", "Block node requires an exact block_id", id) end
            if n.input_schema ~= nil or n.output_schema ~= nil or n.config_schema ~= nil or n.ref_label ~= nil or n.icon ~= nil then
                err(errors, "block_decoration_refused", "Block nodes persist only block_id and instance config; declaration schemas and presentation are discovered", id)
            end
        end
        local allowed_config = CONFIG_FIELDS[kind]
        if allowed_config then
            for key, _ in pairs(cfg) do
                if allowed_config[key] ~= true then
                    err(errors, "node_config_unknown", tostring(kind) .. " node config contains unsupported field " .. tostring(key), id)
                end
            end
        end
        if kind == "cycle" then
            if n.ref ~= nil then err(errors, "node_ref_refused", "Loop does not carry an executable reference", id) end
            if not is_str(cfg.continue_condition) then
                err(errors, "cycle_condition_missing", "Loop requires config.continue_condition", id)
            end
        end
        if kind == "combine" then
            local mode = str(cfg.mode)
            if mode ~= "" and mode ~= "wait_all" and mode ~= "first_wins" then
                err(errors, "combine_mode_invalid", "combine node config.mode must be wait_all or first_wins", id)
            end
        end
        if kind == "start" then
            if type(cfg.input_schema) ~= "table" then
                err(errors, "boundary_schema_missing", "Start boundary requires config.input_schema", id)
            end
        elseif kind == "finish" then
            if type(cfg.output_schema) ~= "table" then
                err(errors, "boundary_schema_missing", "Finish boundary requires config.output_schema", id)
            end
        elseif kind == "error" then
            if type(cfg.error_schema) ~= "table" then
                err(errors, "boundary_schema_missing", "Error boundary requires config.error_schema", id)
            end
        end
        if kind == "flow" then
            local _, ref_err = exact_flow_ref.validate(cfg.flow_ref)
            if ref_err then err(errors, "flow_ref_missing", "Flow node requires an exact published flow_ref: " .. ref_err, id) end
        end
        if kind == "branch" and branch_predicate(n) == "" then
            err(errors, "branch_predicate_missing", "Set the condition before publishing.", id)
        end

    end
return { nodes = nodes, order = order, starts = starts, finishes = finishes,
    error_boundaries = error_boundaries, entry_id = entry_id,
    synthesized_start = synthesized_start, has_boundary = has_boundary }
end
return M
