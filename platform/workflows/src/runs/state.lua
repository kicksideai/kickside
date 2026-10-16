-- The run launcher and runs read model. launch loads a published version and simulate
-- compiles the working document; both remint their command stream to fresh per-run
-- node/data uuids (preserving every
-- metadata.def_node_id), creates a fresh dataflow, and starts it ASYNC under the current
-- ambient identity (the trigger worker already runs trigger_apply under the frozen
-- installer identity, so a triggered launch inherits it). The workflow_runs table is the
-- durable, searchable run history the list UI reads — it never touches the engine tables.
-- Dataflow's durable on_complete delivery idempotently closes the corresponding run.

local json = require("json")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local logger = require("logger")
local time = require("time")
local store_state = require("store_state")
local types = require("types")
local store = require("store")
local version_read = require("version_read")
local version_publish = require("version_publish")
local compiler = require("compiler")
local schema_validate = require("schema_validate")
local client = require("client")
local dataflow_repo = require("dataflow_repo")
local node_reader = require("node_reader")
local data_reader = require("data_reader")
local workflow_repo = require("workflow_repo")
local exact_automation_ref = require("automation_ref")
local execution_identity = require("execution_identity")
local persisted_json = require("persisted_json")

local State = {}

function State.new(dependencies: any?): (any, any)
local deps = type(dependencies) == "table" and dependencies or {}
local M = {}
local I = {}

type Map = { [string]: any }

local RUN_DEDUP_MAX_LENGTH = 128
local THREADS_CONTRACT = "kickside.core:threads"
local RUN_EVENT_SOURCE = "kickside.workflows.runs"
local RUN_EVENT = {
    STARTED = "kickside.workflows.runs.events:started",
    FINISHED = "kickside.workflows.runs.events:finished",
    FAILED = "kickside.workflows.runs.events:failed",
}

local log = logger:named("workflows.runs")
local security_actor: () -> any? = deps.security_actor or security.actor
local security_scope: () -> any? = deps.security_scope or security.scope
local threads_contract: () -> (any?, any?) = deps.threads_contract or function(): (any?, any?)
    return contract.get(THREADS_CONTRACT)
end

local LAUNCH_ERROR_MT = {
    __tostring = function(err: Map): string
        return type(err.message) == "string" and err.message or "workflow launch failed"
    end,
}

local function launch_error(code: string, message: any, details: any?): Map
    local err: Map = {
        code = code ~= "" and code or "launch_failed",
        message = tostring(message or "workflow launch failed"),
    }
    if type(details) == "table" then err.details = details end
    return setmetatable(err, LAUNCH_ERROR_MT)
end

function M.launch_error(code: string, message: any, details: any?): Map
    return launch_error(code, message, details)
end

function M.error_code(err: any): string
    if type(err) == "table" and type((err :: Map).code) == "string" and (err :: Map).code ~= "" then
        return tostring((err :: Map).code)
    end
    return "workflow_failed"
end

function M.error_message(err: any): string
    if type(err) == "table" and type((err :: Map).message) == "string" and (err :: Map).message ~= "" then
        return tostring((err :: Map).message)
    end
    return tostring(err or "workflow launch failed")
end

local function append_event(component_id: string, event: Map): (any?, any?)
    local actor = security_actor()
    if not actor or tostring(actor:id() or "") == "" then return nil, errors.new({ message = "authenticated actor is required", kind = errors.PERMISSION_DENIED }) end
    local scope = security_scope()
    if not scope then return nil, errors.new({ message = "security scope is required", kind = errors.PERMISSION_DENIED }) end
    local def, gerr = threads_contract()
    if gerr then return nil, gerr end
    if not def then return nil, errors.new({ message = "threads contract unavailable", kind = errors.UNAVAILABLE }) end
    local inst, oerr = (def :: any):with_actor(actor):with_scope(scope):open()
    if oerr then return nil, oerr end
    if not inst then return nil, errors.new({ message = "threads open failed", kind = errors.INTERNAL }) end
    local payload = {
        component_id = component_id,
        impl_id = "kickside.workflows:workflow_kind",
        thread_class = "flow",
        type = event.type,
        role = event.role,
        body = event.body,
        content = event.content,
        trace_context = event.trace_context,
        external = event.external,
    }
    local res, call_err = (inst :: any):emit(payload)
    if call_err then return nil, call_err end
    if type(res) == "table" and (res :: Map).success == false then
        return nil, (res :: Map).error or errors.new({ message = "emit failed", kind = errors.INTERNAL })
    end
    return res, nil
end

-- Timestamps are RFC3339 UTC strings in TEXT columns. The sortable format keeps the
-- started_at DESC read-model ordering correct.
local now = store_state.now

local now_iso = now

local new_id = uuid.v4

local function actor_id(): string?
    local actor = security.actor()
    local id = actor and actor:id() or nil
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

I.json, I.security, I.contract, I.logger, I.time = json, security, contract, logger, time
I.types, I.store, I.version_read, I.version_publish, I.compiler, I.schema_validate =
    types, store, deps.version_read or version_read, deps.version_publish or version_publish, compiler, schema_validate
I.client, I.dataflow_repo, I.log = client, dataflow_repo, log
I.client_new = deps.client_new or client.new
I.dataflow_get = deps.dataflow_get or dataflow_repo.get
I.node_reader = deps.node_reader or function(): any return node_reader end
I.data_reader = deps.data_reader or function(): any return data_reader end
I.require_workflow_access = deps.require_workflow_access or workflow_repo.require_access
I.security_actor = security_actor
I.security_scope = security_scope
I.threads_contract = threads_contract
I.append_event = deps.append_event or append_event
I.exact_automation_ref = exact_automation_ref
I.execution_identity = execution_identity
I.RUN_DEDUP_MAX_LENGTH = RUN_DEDUP_MAX_LENGTH
I.RUN_EVENT_SOURCE, I.RUN_EVENT = RUN_EVENT_SOURCE, RUN_EVENT
I.launch_error, I.err_message, I.now, I.now_iso = launch_error, M.error_message, now, now_iso
I.decode_json, I.new_id, I.actor_id = persisted_json.decode_table, new_id, deps.actor_id or actor_id

return M, I
end

local default, default_private = State.new()
State.launch_error = default.launch_error
State.error_code = default.error_code
State.error_message = default.error_message
State.append_event = default_private.append_event

return State
