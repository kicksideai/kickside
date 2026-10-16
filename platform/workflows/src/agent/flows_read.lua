-- Read-only Workflow-management tool for agents: the authoring vocabulary, the
-- actor's workflow list, one workflow's folded definition state, its published
-- versions, and the portable published-Flow artifact. Per-row authorization
-- comes from the repo's access-masked component queries and require_access,
-- never from this layer.

local security = require("security")
local flows_support = require("flows_support")
local repo = require("workflow_repo")
local workflow = require("workflow")
local version_read = require("version_read")
local definitions_api = require("definitions_api")
local types = require("types")
local block_catalog = require("block_catalog")
local published_catalog = require("published_catalog")
local runs_read = require("runs_read")
local runs_debug = require("runs_debug")
local runs_completion = require("runs_completion")
local exec_api = require("exec_api")

type Map = { [string]: any }

local require_id = flows_support.require_id
local tool_result = require("tool_result")

local function page(rows: any, args: Map): (any?, integer?, error?)
    local limit = args.limit == nil and 25 or args.limit
    local offset = args.offset == nil and 0 or args.offset
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 100 then
        return nil, nil, errors.new({ message = "limit must be an integer in [1,100]", kind = errors.INVALID })
    end
    if type(offset) ~= "number" or offset ~= math.floor(offset) or offset < 0 then
        return nil, nil, errors.new({ message = "offset must be a non-negative integer", kind = errors.INVALID })
    end
    local values = type(rows) == "table" and rows or {}
    local out: { any } = {}
    local finish = math.min(#values, (offset :: integer) + (limit :: integer))
    for index = (offset :: integer) + 1, finish do out[#out + 1] = values[index] end
    return out, finish < #values and finish or nil, nil
end


-- The authoring vocabulary, projected from the same declarations the command
-- validator and the compiler read. Nothing here is authored twice: kinds and
-- their config come from types.NODE_KIND_SPEC, command names from types.COMMAND,
-- steps from the Block catalog, and callable workflows from the published
-- catalog. A new kind, command or Block shows up here without an edit. Every
-- row is the full record; catalog_id selects one row by its `<section>:<id>`.
local function catalog_row(section: string, id: string, record: Map): Map
    local row: Map = {}
    for key, value in pairs(record) do row[key] = value end
    row.section = section
    row.id = id
    return row
end

local function catalog_summary(record: Map): Map
    local row: Map = { section = record.section, id = record.id, label = record.label }
    if record.section == "node_kinds" then
        row.kind = record.kind
        row.role = record.role
        row.summary = record.summary
        row.requires_ref = record.requires_ref
    elseif record.section == "commands" then
        row.type = record.type
    elseif record.section == "blocks" then
        for _, key in ipairs({ "ref", "category", "icon", "hue", "waits", "source_kind", "tool" }) do
            row[key] = record[key]
        end
    elseif record.section == "flows" then
        row.title = record.title
        row.flow_ref = record.flow_ref
        row.result_source = record.result_source
    elseif record.section == "examples" then
        row.then_publish = record.then_publish
    end
    return row
end

local function flow_row(descriptor: Map): Map
    local ref = descriptor.flow_ref :: Map
    local row = catalog_row("flows", tostring(ref.id), descriptor)
    row.label = descriptor.title
    return row
end

local function do_catalog(args: Map): (any, error?)
    local rows: { Map } = {}
    for kind, spec in pairs(types.NODE_KIND_SPEC) do
        local item = spec :: Map
        rows[#rows + 1] = catalog_row("node_kinds", tostring(kind), { kind = kind, label = item.summary, role = item.role,
            summary = item.summary, ports = item.ports, requires_ref = item.requires_ref == true and true or nil, config = item.config })
    end
    for _, name in pairs(types.COMMAND) do
        rows[#rows + 1] = catalog_row("commands", tostring(name), { label = name, type = name })
    end
    local catalog, catalog_err = block_catalog.catalog()
    if catalog_err then return nil, catalog_err end
    local example_ref = ""
    for _, block in pairs(catalog :: Map) do
        local item = block :: Map
        if item.public == true then
            local record: Map = {}
            for key, value in pairs(item) do
                if key ~= "declaration" then record[key] = value end
            end
            record.ref = item.id
            rows[#rows + 1] = catalog_row("blocks", tostring(item.id), record)
            if example_ref == "" or tostring(item.id) < example_ref then example_ref = tostring(item.id) end
        end
    end
    local example: Map = { label = "Complete publishable workflow", commands = {},
        then_publish = "flows_manage { action = \"publish\", id = <the id from create> }" }
    if example_ref ~= "" then
        local shape: Map = { type = "object", properties = { note = { type = "string" } } }
        example.commands = {
            { type = types.COMMAND.NODE_ADD, body = { id = "start", kind = "start", title = "Start", config = { input_schema = shape } } },
            { type = types.COMMAND.NODE_ADD, body = { id = "step", kind = "block", ref = example_ref, title = "Do the work" } },
            { type = types.COMMAND.NODE_ADD, body = { id = "finish", kind = "finish", title = "Finish", config = { output_schema = shape } } },
            { type = types.COMMAND.EDGE_ADD, body = { id = "e1", source_id = "start", source_port = "out", target_id = "step" } },
            { type = types.COMMAND.EDGE_ADD, body = { id = "e2", source_id = "step", target_id = "finish" } },
        }
    end
    rows[#rows + 1] = catalog_row("examples", "publishable", example)
    table.sort(rows, function(a, b) return tostring(a.section) .. ":" .. tostring(a.id) < tostring(b.section) .. ":" .. tostring(b.id) end)
    local selector = type(args.catalog_id) == "string" and args.catalog_id or ""
    if selector ~= "" then
        local item: Map? = nil
        local workflow_id = selector:match("^flows:(.+)$")
        if workflow_id then
            local descriptors, err = published_catalog.catalog({id = workflow_id, limit = 1})
            if err then return nil, err end
            if descriptors and descriptors[1] then item = flow_row(descriptors[1] :: Map) end
        else
            for _, row in ipairs(rows) do
                if tostring(row.section) .. ":" .. tostring(row.id) == selector then item = row end
            end
        end
        if not item then return tool_result.fail(errors.NOT_FOUND, "catalog item not found: " .. selector) end
        return { success = true, id = selector, item = item }
    end
    local selected, next_offset, page_err = page(rows, args)
    if page_err then return nil, page_err end
    local limit = args.limit == nil and 25 or args.limit
    local offset = args.offset == nil and 0 or args.offset
    if not next_offset then
        local flow_offset = math.max(0, offset - #rows)
        local remaining = limit - #selected
        if remaining > 0 then
            local descriptors, err, flow_next = published_catalog.catalog({limit = remaining, offset = flow_offset})
            if err then return nil, err end
            for _, item in ipairs(descriptors or {}) do
                selected[#selected + 1] = flow_row(item :: Map)
            end
            next_offset = flow_next and (#rows + flow_next) :: integer or nil
        else
            next_offset = (offset + #selected) :: integer
        end
    end
    local summaries: { Map } = {}
    for _, record in ipairs(selected or {}) do summaries[#summaries + 1] = catalog_summary(record :: Map) end
    return { success = true, catalog = summaries, count = #summaries, next_offset = next_offset }
end

local function workflow_summary(record: Map): Map
    local row: Map = {}
    for _, key in ipairs({ "id", "title", "status", "created_at", "updated_at", "parent_id", "parent_name", "breadcrumb",
        "published_version", "published_def_seq", "has_draft_changes", "last_run" }) do
        row[key] = record[key]
    end
    return row
end

local function do_list(args: Map): (any, error?)
    local _, _, control_err = page({}, args)
    if control_err then return nil, control_err end
    local rows, err, next_offset = repo.list({ published_only = args.published == true,
        limit = args.limit, offset = args.offset })
    if err then return nil, err end
    local summaries: { Map } = {}
    for _, record in ipairs(rows or {}) do summaries[#summaries + 1] = workflow_summary(record :: Map) end
    return { success = true, count = #summaries, workflows = summaries, next_offset = next_offset }
end

local function run_summary(record: Map): Map
    local row: Map = {}
    for _, key in ipairs({ "run_id", "flow_ref", "draft_ref", "automation_ref", "trigger_kind", "origin", "status", "started_at", "finished_at", "dataflow_status" }) do
        row[key] = record[key]
    end
    return row
end

local function event_summary(record: Map): Map
    local row: Map = {}
    for _, key in ipairs({ "seq", "occurred_at", "source", "type", "engine_node_id" }) do row[key] = record[key] end
    return row
end

local function do_read(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local access_err = repo.require_access(id :: string, repo.ACCESS.READ :: number)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local state, err = workflow.state(id :: string)
    if err then return nil, err end
    return { success = true, id = id, state = state }
end

local function do_versions(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local access_err = repo.require_access(id :: string, repo.ACCESS.READ :: number)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local rows, err = version_read.list(id :: string)
    if err then return nil, err end
    local out, next_offset, page_err = page(rows, args)
    if page_err then return nil, page_err end
    return { success = true, id = id, versions = out, next_offset = next_offset }
end

local function do_export(args: Map): (any, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local flow, err = definitions_api.export_flow(id :: string)
    if err then return nil, err end
    if not flow then return tool_result.fail(errors.INTERNAL, "export returned no Flow") end
    return { success = true, flow = flow }
end

local function do_run_read(args: Map, action: string): (any, error?)
    local id, id_err = require_id(args)
    if id_err then return nil, id_err end
    local access_err = repo.require_access(id :: string, repo.ACCESS.READ :: number)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local limit, offset = args.limit, args.offset
    local options = { limit = limit, offset = offset, status = args.status }
    if action == "runs" or action == "events" or action == "node_data" then
        local ceiling = action == "node_data" and 500 or 200
        if limit ~= nil and (type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > ceiling) then
            return tool_result.fail(errors.INVALID, "limit must be an integer in [1," .. tostring(ceiling) .. "]")
        end
        if offset ~= nil and (type(offset) ~= "number" or offset ~= math.floor(offset) or offset < 0) then
            return tool_result.fail(errors.INVALID, "offset must be a non-negative integer")
        end
    end
    if action == "runs" then
        if args.status ~= nil then
            local declared = false
            for _, value in pairs(types.RUN_STATUS) do if args.status == value then declared = true end end
            if not declared then return tool_result.fail(errors.INVALID, "unknown run status: " .. tostring(args.status)) end
        end
        local rows, err, next_offset = runs_read.list_runs(id, options)
        if err then return nil, err end
        local summaries: { Map } = {}
        for _, record in ipairs(rows or {}) do summaries[#summaries + 1] = run_summary(record :: Map) end
        return { success = true, runs = summaries, count = #summaries, next_offset = next_offset }, nil
    end
    if type(args.run_id) ~= "string" or args.run_id == "" then return tool_result.fail(errors.INVALID, "run_id is required") end
    if action == "run_detail" then
        local detail, err = exec_api.run_detail_response(id :: string, args.run_id :: string)
        if err then return nil, err end
        if not detail then return tool_result.fail(errors.NOT_FOUND, "run not found") end
        return detail, nil
    end
    if action == "events" then
        local timeline, err = runs_debug.run_timeline(id, args.run_id, options)
        if err then return nil, err end
        if not timeline then return tool_result.fail(errors.NOT_FOUND, "run not found") end
        local events: { Map } = {}
        for _, event in ipairs((timeline :: Map).events or {}) do events[#events + 1] = event_summary(event :: Map) end
        (timeline :: Map).events = events
        return { success = true, timeline = timeline }, nil
    end
    if action == "event_detail" then
        local detail, err = runs_debug.run_event_detail(id, args.run_id, args.event_seq)
        if err then return nil, err end
        if not detail then return tool_result.fail(errors.NOT_FOUND, "event not found") end
        return { success = true, event = detail }, nil
    end
    if action == "export_run" then
        local export, err = runs_debug.run_export(id, args.run_id)
        if err then return nil, err end
        if not export then return tool_result.fail(errors.NOT_FOUND, "run not found") end
        return { success = true, export = export }, nil
    end
    if type(args.node_id) ~= "string" or args.node_id == "" then return tool_result.fail(errors.INVALID, "node_id is required") end
    local detail, detail_err = runs_debug.debug_detail(id, args.run_id)
    if detail_err then return nil, detail_err end
    if not detail then return tool_result.fail(errors.NOT_FOUND, "run not found") end
    local found = false
    for _, node in ipairs(detail.nodes or {}) do if node.def_node_id == args.node_id then found = true end end
    if not found then return tool_result.fail(errors.NOT_FOUND, "node does not belong to this run") end
    local rows, err, next_offset = runs_completion.run_node_data(id, args.run_id, args.node_id, options)
    if err then return nil, err end
    return { success = true, data = rows or {}, next_offset = next_offset }, nil
end

local function handler(args: any): (any, error?)
    local a: Map = (type(args) == "table") and args or {}
    if not security.actor() then return tool_result.fail(errors.PERMISSION_DENIED, "authentication required") end

    local action = tostring(a.action or "")
    if action == "catalog" then return do_catalog(a) end
    if action == "list" then return do_list(a) end
    if action == "read" then return do_read(a) end
    if action == "versions" then return do_versions(a) end
    if action == "export" then return do_export(a) end
    if action == "runs" or action == "run_detail" or action == "node_data" or action == "events" or action == "event_detail" or action == "export_run" then
        return do_run_read(a, action)
    end
    return tool_result.fail(errors.INVALID, "unknown action: " .. action)
end

return { handler = handler }
