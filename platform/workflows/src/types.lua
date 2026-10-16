-- Stable vocabulary for the workflow definition plane: table names, node kinds,
-- the command dialect the canvas speaks, and the past-tense events the command
-- pipeline records on the per-workflow event stream.

local registry = require("registry")
local errors = require("errors")

local M = {}

M.DB_CONFIG = "kickside.workflows:db_config"

M.WORKFLOW_IMPL = "kickside.workflows:workflow_kind"
M.COMPONENT_CLASS = "workflow"
M.COMPONENT_SERVICE = "kickside.component:component_service"

M.VIEWPORT_NODE_ID = "__viewport__"
M.LAYOUT_NODE_ID = "__layout__"
M.DEFAULT_LAYOUT_DIRECTION = "TB"
M.LAYOUT_DIRECTIONS = { TB = true, LR = true }

M.BOUNDARY_NODE_KIND = {
    START = "start",
    FINISH = "finish",
    ERROR = "error",
}

M.BOUNDARY_NODE_KINDS = {
    start = true,
    finish = true,
    ["error"] = true,
}

M.BOUNDARY_REMOVE_REFUSED = "boundary_node_remove_refused"

M.TABLES = {
    EVENTS = "workflow_def_events",
    NODES = "workflow_def_nodes",
    EDGES = "workflow_def_edges",
    NOTES = "workflow_def_notes",
    LAYOUT = "workflow_def_layout",
    VERSIONS = "workflow_versions",
    RUNS = "workflow_runs",
    STATE = "workflow_def_state",
    HISTORY = "workflow_undo_history",
}

-- Run row lifecycle. `pending`/`running` are non-terminal; the rest are terminal.
M.RUN_STATUS = {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    TERMINATED = "terminated",
}

M.RUN_TERMINAL = {
    completed = true,
    failed = true,
    cancelled = true,
    terminated = true,
}

-- The engine dataflow statuses mapped onto run statuses by run_completed.
M.DATAFLOW_TERMINAL = {
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled",
    terminated = "terminated",
}

M.RUN_COMPLETED_FUNC = "kickside.workflows.runs:run_completed"

-- Node kinds the builder places on the canvas, each with the config fields the
-- compiler accepts, the outgoing ports it may be wired from, and the one-line
-- meaning an author needs. Notes are a separate entity, never a node kind.
-- Config is opaque JSON at command time; the compiler validates it at publish.
--
-- This table is the single description of the kind vocabulary: the command
-- validator gates `kind` against it, the compiler reads its config fields, and
-- the agent catalog projects it. A kind added here reaches all three at once.
M.NODE_KIND_SPEC = {
    -- Interface boundaries are authored on the canvas but compile to routing and
    -- schemas only. They are never executable Dataflow nodes.
    start = {
        role = "boundary",
        summary = "Declares the run input. Exactly one per workflow.",
        config = { input_schema = { required = true, type = "json-schema", about = "The object the run is launched with." } },
        ports = { "out" },
    },
    finish = {
        role = "boundary",
        summary = "Declares the successful output. Exactly one per workflow.",
        config = { output_schema = { required = true, type = "json-schema", about = "The object a completed run returns." } },
        ports = {},
    },
    ["error"] = {
        role = "boundary",
        summary = "Declares the failed output. Optional, at most one.",
        config = { error_schema = { required = true, type = "json-schema", about = "The object a failed run returns." } },
        ports = {},
    },
    -- A business step is always an exact canonical Block reference. Its typed
    -- contract lowers directly to one native Dataflow node before publication.
    block = {
        role = "step",
        summary = "Runs one catalog Block. Set node.ref to the Block's exact id; every executable step is this kind.",
        requires_ref = true,
        config = "block",
        ports = "block",
    },
    -- A nested published Flow expands into this same Dataflow; it is composition,
    -- not a spawned child run or a second orchestration model.
    flow = {
        role = "step",
        summary = "Calls an exact published workflow and continues with its result.",
        config = { flow_ref = { required = true, type = "flow_ref", about = "{ kind = \"flow\", id, version } naming a published version." } },
        ports = { "result", "failed" },
    },
    -- Branch (If) dissolves at compile time into predicate edges (no engine node).
    branch = {
        role = "logic",
        summary = "Chooses a path from a condition. Compiles away into predicate edges.",
        config = { predicate = { required = true, type = "expression", about = "expr-lang over `output`, the upstream result." } },
        ports = { "true", "false" },
    },
    cycle = {
        role = "logic",
        summary = "Repeats its body while a condition holds.",
        config = {
            continue_condition = { required = true, type = "expression", about = "expr-lang; the loop runs while this is true." },
            max_iterations = { type = "integer", about = "Upper bound on iterations." },
            initial_state = { type = "object", about = "Seed state for the first iteration." },
        },
        ports = { "body", "done" },
    },
    for_each = {
        role = "logic",
        summary = "Runs its body once per item of an upstream array.",
        config = {
            source_array_key = { type = "string", about = "Key of the array in the upstream result." },
            batch_size = { type = "integer", about = "Items processed per batch." },
            continue_on_error = { type = "boolean", about = "Keep going when one item fails." },
        },
        ports = { "body", "done" },
    },
    -- Combine owns both convergence semantics: wait_all or first_wins.
    combine = {
        role = "logic",
        summary = "Brings several paths back into one.",
        config = {
            mode = { type = "enum", values = { "wait_all", "first_wins" }, about = "Defaults to wait_all." },
            output_mode = { type = "string", about = "How the merged result is shaped." },
        },
        ports = {},
    },
}

-- The kind gate itself: the set of names NODE_KIND_SPEC describes.
M.NODE_KINDS = (function(): { [string]: boolean }
    local out: { [string]: boolean } = {}
    for kind, _ in pairs(M.NODE_KIND_SPEC) do out[kind] = true end
    return out
end)()

-- The config fields the compiler accepts per kind, derived from the same spec.
-- Kinds whose config is owned elsewhere (a Block's own config_schema) are absent.
M.NODE_CONFIG_FIELDS = (function(): { [string]: { [string]: boolean } }
    local out: { [string]: { [string]: boolean } } = {}
    for kind, spec in pairs(M.NODE_KIND_SPEC) do
        local fields = (spec :: any).config
        if type(fields) == "table" then
            local allowed: { [string]: boolean } = {}
            for field, _ in pairs(fields :: { [string]: any }) do allowed[field] = true end
            out[kind] = allowed
        end
    end
    return out
end)()

-- Command dialect the canvas emits.
M.COMMAND = {
    NODE_ADD = "node.add",
    NODE_UPDATE = "node.update",
    NODE_REMOVE = "node.remove",
    EDGE_ADD = "edge.add",
    EDGE_UPDATE = "edge.update",
    EDGE_REMOVE = "edge.remove",
    NOTE_ADD = "note.add",
    NOTE_UPDATE = "note.update",
    NOTE_REMOVE = "note.remove",
    LAYOUT_SET_POSITION = "layout.set-position",
    LAYOUT_CLEAR_POSITION = "layout.clear-position",
    LAYOUT_SET_VIEWPORT = "layout.set-viewport",
    LAYOUT_SET_DIRECTION = "layout.set-direction",
    PARAM_SET = "param.set",
    LABELS_SET = "labels.set",
}

-- Past-tense events the pipeline records and broadcasts.
local EVENT_NS = "kickside.workflows.events:"
M.EVENT_NS = EVENT_NS
M.EVENT = {
    NODE_ADDED = EVENT_NS .. "node.added",
    NODE_UPDATED = EVENT_NS .. "node.updated",
    NODE_REMOVED = EVENT_NS .. "node.removed",
    EDGE_ADDED = EVENT_NS .. "edge.added",
    EDGE_UPDATED = EVENT_NS .. "edge.updated",
    EDGE_REMOVED = EVENT_NS .. "edge.removed",
    NOTE_ADDED = EVENT_NS .. "note.added",
    NOTE_UPDATED = EVENT_NS .. "note.updated",
    NOTE_REMOVED = EVENT_NS .. "note.removed",
    LAYOUT_POSITION_SET = EVENT_NS .. "layout.position-set",
    LAYOUT_POSITION_CLEARED = EVENT_NS .. "layout.position-cleared",
    LAYOUT_VIEWPORT_SET = EVENT_NS .. "layout.viewport-set",
    LAYOUT_DIRECTION_SET = EVENT_NS .. "layout.direction-set",
    PARAM_SET = EVENT_NS .. "param.set",
    LABELS_SET = EVENT_NS .. "labels.set",
    -- Non-projected log marker appended on publish so the canvas log records the
    -- publish and clients see it realtime. Never routed through the command pipeline.
    VERSION_PUBLISHED = EVENT_NS .. "version.published",
    -- Provenance marker on a new editable draft created from an immutable version.
    -- It never mutates or republishes the source version.
    VERSION_RESTORED = EVENT_NS .. "version.restored",
}

-- Maps each command to the event it records. The single source of truth for which
-- command types are accepted.
M.COMMAND_TO_EVENT = {
    [M.COMMAND.NODE_ADD] = M.EVENT.NODE_ADDED,
    [M.COMMAND.NODE_UPDATE] = M.EVENT.NODE_UPDATED,
    [M.COMMAND.NODE_REMOVE] = M.EVENT.NODE_REMOVED,
    [M.COMMAND.EDGE_ADD] = M.EVENT.EDGE_ADDED,
    [M.COMMAND.EDGE_UPDATE] = M.EVENT.EDGE_UPDATED,
    [M.COMMAND.EDGE_REMOVE] = M.EVENT.EDGE_REMOVED,
    [M.COMMAND.NOTE_ADD] = M.EVENT.NOTE_ADDED,
    [M.COMMAND.NOTE_UPDATE] = M.EVENT.NOTE_UPDATED,
    [M.COMMAND.NOTE_REMOVE] = M.EVENT.NOTE_REMOVED,
    [M.COMMAND.LAYOUT_SET_POSITION] = M.EVENT.LAYOUT_POSITION_SET,
    [M.COMMAND.LAYOUT_CLEAR_POSITION] = M.EVENT.LAYOUT_POSITION_CLEARED,
    [M.COMMAND.LAYOUT_SET_VIEWPORT] = M.EVENT.LAYOUT_VIEWPORT_SET,
    [M.COMMAND.LAYOUT_SET_DIRECTION] = M.EVENT.LAYOUT_DIRECTION_SET,
    [M.COMMAND.PARAM_SET] = M.EVENT.PARAM_SET,
    [M.COMMAND.LABELS_SET] = M.EVENT.LABELS_SET,
}

M.MAX_UNDO = 50
M.REALTIME_TOPIC_PREFIX = "workflow."

local function configured_value(entry_id: string, field: string): (string?, error?)
    local entry, err = registry.get(entry_id)
    local value = type(entry) == "table" and type(entry.meta) == "table" and entry.meta[field] or nil
    if type(value) ~= "string" or value == "" then
        return nil, errors.new({
            kind = errors.INTERNAL,
            message = entry_id .. ".meta." .. field .. " is required: " .. tostring(err or "missing registry configuration"),
        })
    end
    return value, nil
end

function M.db_id(): (string?, error?)
    return configured_value(M.DB_CONFIG, "db_id")
end

return M
