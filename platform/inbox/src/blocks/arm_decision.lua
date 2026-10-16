local decision_content = require("decision_content")
local security = require("security")
local contract = require("contract")
local inbox_writer = require("inbox_writer")
local inbox_reader = require("inbox_reader")
local component = require("component")

local M = {}

type Map = { [string]: any }

local DIRECTORY = "kickside.contract:directory"
local ITEM_TYPE = "flow_decision"

local function str(value: any): string
    return type(value) == "string" and value or ""
end

local function actor_id(): string
    local actor = security.actor()
    return actor and str(actor:id()) or ""
end

local function copy_map(value: any): Map
    local out: Map = {}
    if type(value) == "table" then for key, item in pairs(value :: Map) do out[key] = item end end
    return out
end

local function decision_params(args: Map): (Map?, string?)
    local config = type(args.config) == "table" and (args.config :: Map) or {}
    local emit = config
    local dataflow_id, signal_id = str(args.dataflow_id), str(args.signal_id)
    if dataflow_id == "" then return nil, "dataflow_id is required" end
    if signal_id == "" then return nil, "signal_id is required" end

    local run_context = type(args.run_context) == "table" and (args.run_context :: Map) or {}
    -- A Workflow writes its identity into run_context.flow_ref, the versioned
    -- reference the compiler stamps on every node, so that is where the arm
    -- reads it from when the caller passed none of its own.
    local flow_ref = type(run_context.flow_ref) == "table" and (run_context.flow_ref :: Map) or {}
    local context_workflow_id = str(run_context.workflow_id) ~= "" and str(run_context.workflow_id)
        or str(flow_ref.id)
    local workflow_id = str(args.workflow_id) ~= "" and str(args.workflow_id)
        or (str(config.workflow_id) ~= "" and str(config.workflow_id) or context_workflow_id)
    local run_id = str(args.run_id) ~= "" and str(args.run_id)
        or (str(config.run_id) ~= "" and str(config.run_id) or str(run_context.run_id))
    local assignee = str(emit.assignee)
    if assignee == "" then assignee = actor_id() end
    if assignee == "" then return nil, "an authenticated workflow actor or explicit assignee is required" end

    local metadata = copy_map(emit.metadata)
    metadata.workflow_id = workflow_id
    metadata.run_id = run_id
    metadata.dataflow_id = dataflow_id
    metadata.signal_id = signal_id
    metadata.prompt = emit.prompt
    metadata.form = type(emit.form) == "table" and emit.form or nil
    metadata.approve_label = emit.approve_label
    metadata.reject_label = emit.reject_label
    metadata.assignee = assignee
    metadata.input = args.input
    metadata.context = args.context

    local content, content_err = decision_content.render(args.input, args.context)
    if content_err then return nil, content_err end
    local prompt = str(emit.prompt)
    local item_id = "workflow-decision:" .. dataflow_id .. ":" .. signal_id
    return {
        id = item_id,
        item_type = ITEM_TYPE,
        title = prompt ~= "" and prompt or "Workflow decision",
        content = content,
        priority = str(emit.priority) ~= "" and str(emit.priority) or "normal",
        metadata = metadata,
        source_id = item_id,
        trace_context = {
            trace_id = "workflow:" .. (run_id ~= "" and run_id or dataflow_id),
            run_id = run_id ~= "" and run_id or dataflow_id,
            correlation_key = signal_id,
        },
    }, nil
end

local function directory_instance(): (any?, string?)
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then return nil, "assignment requires an authenticated actor and scope" end
    local definition, get_err = contract.get(DIRECTORY)
    if get_err or not definition then return nil, "principal directory unavailable: " .. tostring(get_err) end
    local instance, open_err = definition:with_actor(actor):with_scope(scope):open()
    if open_err or not instance then return nil, "principal directory unavailable: " .. tostring(open_err) end
    return instance, nil
end

local function require_assignee(assignee: string): string?
    local directory, directory_err = directory_instance()
    if not directory then return directory_err end
    local result, exists_err = directory:exists({ type = "user", id = assignee })
    if exists_err then return "could not validate assignee: " .. tostring(exists_err) end
    if type(result) ~= "table" or (result :: Map).exists ~= true then
        return "assignee does not exist: " .. assignee
    end
    return nil
end

function M.preview_decision(args: any): (Map?, string?)
    return decision_params(type(args) == "table" and (args :: Map) or {})
end

function M.create_decision(args: any): (any?, string?)
    local params = type(args) == "table" and type((args :: Map).params) == "table" and ((args :: Map).params :: Map) or nil
    if not params then return nil, "params is required" end
    local id = str((params :: Map).id)
    if id == "" then return nil, "params.id is required" end
    local existing, read_err = inbox_reader.get(id)
    if read_err then return nil, "could not inspect existing decision: " .. tostring(read_err) end
    if type(existing) == "table" then
        -- Pending and resolved items are both authoritative history. A revived Await
        -- re-arms the same stable correlation and must never append/reopen it.
        return existing, nil
    end
    return inbox_writer.create(params)
end

function M.arm_decision(args: any): (any?, string?)
    local a = type(args) == "table" and (args :: Map) or {}
    local params, params_err = decision_params(a)
    if not params then return nil, params_err end
    local assignee = str(((params :: Map).metadata :: Map).assignee)
    local assignee_err = require_assignee(assignee)
    if assignee_err then return nil, assignee_err end

    if assignee == actor_id() then return M.create_decision({ params = params }) end

    if security.can("inbox.assign", "user:" .. assignee) ~= true then
        return nil, "Inbox assignment access denied"
    end
    local component_id = component.singleton_component_id(assignee, "kickside.inbox")
    local definition, get_err = contract.get("kickside.core:threads")
    if get_err or not definition then return nil, "Inbox threads unavailable: " .. tostring(get_err) end
    local threads, open_err = definition:with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err or not threads then return nil, "Inbox threads unavailable: " .. tostring(open_err) end
    local metadata = copy_map(params.metadata)
    metadata.assigned_by = actor_id()
    local _, emit_err = threads:emit({
        component_id = component_id,
        type = "kickside.inbox.events:item.created",
        body = {
            id = params.id, item_type = params.item_type, title = params.title,
            content = params.content, metadata = metadata, source_id = params.source_id,
            priority = params.priority, actor_id = assignee, created_at = os.time(),
        },
        trace_context = params.trace_context,
        external = {
            external_source = "kickside.inbox", external_id = "item:" .. params.id,
            external_version = "1",
        },
    })
    if emit_err then return nil, tostring(emit_err) end
    return { id = params.id, item_type = params.item_type, title = params.title }, nil
end

return M
