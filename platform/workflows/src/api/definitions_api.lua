-- Portable Flow HTTP surface. Export reads the immutable published
-- source through the definitions contract implementation; import writes a fresh
-- editable draft through the ordinary definition CQRS path and never publishes it.

local http = require("http")
local http_errors = require("http_errors")
local json = require("json")
local security = require("security")
local repo = require("workflow_repo")
local workflow = require("workflow")
local workflow_state = require("workflow_state")
local definitions = require("definitions")
local flow_contract = require("flow_contract")
local version_read = require("version_read")
local types = require("types")
local mapping = require("mapping")

local function construct(dependencies: any): any
local selected_repo = dependencies.repo or repo
local selected_workflow = dependencies.workflow or workflow
local selected_definitions = dependencies.definitions or definitions
local selected_http = dependencies.http or http
local selected_json = dependencies.json or json
local selected_security = dependencies.security or security
local M = {}

type Map = { [string]: any }

local function str(value: any): string
    return type(value) == "string" and value or ""
end

local copy_tree = mapping.copy_tree

local function import_error(code: string, message: string, details: any?): Map
    return { code = code, message = message, details = details }
end

-- Every artifact import creates a visibly distinct draft.
function M.copy_title(value: any): string
    local title = str(value)
    return "Copy of " .. (title ~= "" and title or "Flow")
end

-- validate_flow accepts exactly the source-only artifact emitted by
-- definitions.export.
function M.validate_flow(value: any): (Map?, Map?)
    local artifact, validation_err = flow_contract.validate(value)
    if validation_err then return nil, import_error("flow_invalid", validation_err:message(), validation_err:details()) end
    if not artifact then return nil, import_error("flow_invalid", "Flow artifact validation returned no artifact") end
    return artifact :: Map, nil
end

local function normalized(value: any): string
    return str(value):gsub("^%s+", ""):gsub("%s+$", ""):lower()
end

local function imported_title(base: string, rows: any): string
    local root = base ~= "" and base or "Imported Flow"
    local used: Map = {}
    for _, raw in ipairs(type(rows) == "table" and (rows :: { any }) or {}) do
        local row = type(raw) == "table" and (raw :: Map) or {}
        used[normalized(row.title)] = true
    end
    if not used[normalized(root)] then return root end
    local candidate = root .. " (imported)"
    if not used[normalized(candidate)] then return candidate end
    local n = 2
    while used[normalized(root .. " (imported " .. tostring(n) .. ")")] do n = n + 1 end
    return root .. " (imported " .. tostring(n) .. ")"
end

local function restored_title(base: string, version: number, rows: any): string
    local root = (base ~= "" and base or "Workflow") .. " (restored v" .. tostring(version) .. ")"
    local used: Map = {}
    for _, raw in ipairs(type(rows) == "table" and (rows :: { any }) or {}) do
        local row = type(raw) == "table" and (raw :: Map) or {}
        used[normalized(row.title)] = true
    end
    if not used[normalized(root)] then return root end
    local n = 2
    while used[normalized(root .. " " .. tostring(n))] do n = n + 1 end
    return root .. " " .. tostring(n)
end

local function command(ctype: string, body: any): Map return { type = ctype, body = body or {} } end

local function document_to_commands(document: any): { Map }
    local doc = type(document) == "table" and (document :: Map) or {}
    local out: { Map } = {}
    if type(doc.params) == "table" then
        local keys: { string } = {}; for key, _ in pairs(doc.params :: Map) do keys[#keys + 1] = tostring(key) end; table.sort(keys)
        for _, key in ipairs(keys) do out[#out + 1] = command(types.COMMAND.PARAM_SET, { key=key, value=(doc.params :: Map)[key] }) end
    end
    for _, node in ipairs(type(doc.nodes) == "table" and doc.nodes or {}) do out[#out + 1] = command(types.COMMAND.NODE_ADD, copy_tree(node)) end
    for _, note in ipairs(type(doc.notes) == "table" and doc.notes or {}) do out[#out + 1] = command(types.COMMAND.NOTE_ADD, copy_tree(note)) end
    for _, edge in ipairs(type(doc.edges) == "table" and doc.edges or {}) do out[#out + 1] = command(types.COMMAND.EDGE_ADD, copy_tree(edge)) end
    local layout = type(doc.layout) == "table" and (doc.layout :: Map) or {}
    local positions = type(layout.positions) == "table" and (layout.positions :: Map) or {}
    local ids: { string } = {}; for id, _ in pairs(positions) do ids[#ids + 1] = tostring(id) end; table.sort(ids)
    for _, id in ipairs(ids) do local body=copy_tree(positions[id]); if type(body)=="table" then (body :: Map).node_id=id; out[#out+1]=command(types.COMMAND.LAYOUT_SET_POSITION,body) end end
    if type(layout.viewport)=="table" then out[#out+1]=command(types.COMMAND.LAYOUT_SET_VIEWPORT,copy_tree(layout.viewport)) end
    if layout.direction ~= nil then out[#out+1]=command(types.COMMAND.LAYOUT_SET_DIRECTION,{ direction=layout.direction }) end
    return out
end

local function import_materialized(source: Map, actor: any): (Map?, Map?)
    local doc = copy_tree(source.document) :: Map
    local params: Map = type(doc.params) == "table" and (doc.params :: Map) or {}
    doc.params = params

    local commands = document_to_commands(doc)
    local wf = selected_workflow
    local empty = workflow_state.empty_state()
    local _, command_err = workflow_state.validate_and_fold(empty, commands)
    if command_err then return nil, import_error("flow_invalid", "Flow document is invalid: " .. tostring(command_err)) end

    local repo_mod = selected_repo
    local rows, list_err = repo_mod.list()
    if list_err then return nil, import_error("import_list_failed", tostring(list_err)) end
    -- The Flow document is replayed as param.set commands, so its title is the
    -- source of truth over artifact presentation metadata.
    local source_title = str(params.title) ~= "" and str(params.title) or str(source.title)
    local title = imported_title(M.copy_title(source_title), rows)
    local created, create_err = repo_mod.create(title)
    if create_err or not created then return nil, import_error("import_create_failed", tostring(create_err or "Flow create failed")) end
    local flow_id = str((created :: Map).id)
    if flow_id == "" then return nil, import_error("import_create_failed", "Flow create returned no id") end

    local actor_id = str(actor)
    local applied, apply_err = wf.apply(flow_id, commands, actor_id ~= "" and actor_id or "flow_import")
    if apply_err or not applied then
        local _, cleanup_err = repo_mod.delete(flow_id)
        local message = "Flow document apply failed: " .. tostring(apply_err or "no result")
        if cleanup_err then message = message .. "; Flow cleanup failed: " .. tostring(cleanup_err) end
        return nil, import_error("flow_invalid", message)
    end
    return {
        flow_id = flow_id,
        title = title,
        status = "draft",
        published = false,
        key = source.key,
        checksum = source.checksum,
    }, nil
end

-- import_flow(flow, bindings, actor) -> a fresh editable Flow draft.
function M.import_flow(flow: any, bindings: any, actor: any): (Map?, Map?)
    local materialized, materialize_err = flow_contract.materialize(flow, bindings)
    if materialize_err then return nil, import_error("flow_invalid", materialize_err:message(), materialize_err:details()) end
    if not materialized then return nil, import_error("flow_invalid", "Flow materialization returned no document") end
    return import_materialized(materialized :: Map, actor)
end

-- Package declarations have one production shape: registry.entry with
-- meta.type=kickside.flow and the artifact at data.flow.
function M.import_declaration(entry: any, bindings: any, actor: any): (Map?, Map?)
    local materialized, materialize_err = flow_contract.materialize_declaration(entry, bindings)
    if materialize_err then return nil, import_error("flow_invalid", materialize_err:message(), materialize_err:details()) end
    if not materialized then return nil, import_error("flow_invalid", "Flow declaration materialization returned no document") end
    return import_materialized(materialized :: Map, actor)
end

-- restore_version creates a completely new draft from the frozen source document.
-- The source Flow/version remains untouched; the destination stream records an
-- immutable lineage marker after its ordinary graph-creation command batch.
function M.restore_version(source_flow_id: any, version: any, actor: any): (Map?, any?)
    local source_id = str(source_flow_id)
    local number = tonumber(version)
    if source_id == "" or not number or number < 1 then return nil, errors.new({ message = "version not found", kind = errors.NOT_FOUND }) end
    local repo_mod = selected_repo
    local access_err = repo_mod.require_access(source_id, repo_mod.ACCESS.READ :: number)
    if access_err then return nil, access_err end
    -- Restore the immutable authored document, not the read-side projection returned
    -- by version_read.get (which decorates Block nodes from today's declarations).
    local frozen, verr = version_read.get_source(source_id, number)
    if verr then return nil, verr end
    if not frozen then return nil, errors.new({ message = "version not found", kind = errors.NOT_FOUND }) end
    local source = frozen :: Map
    local document = copy_tree(source.document) :: Map
    local commands = document_to_commands(document)
    local wf = selected_workflow
    local _, command_err = workflow_state.validate_and_fold(workflow_state.empty_state(), commands)
    if command_err then return nil, errors.new({ message = "frozen version is invalid: " .. tostring(command_err), kind = errors.INVALID }) end
    local rows, list_err = repo_mod.list()
    if list_err then return nil, list_err end
    local params = type((document :: Map).params) == "table" and ((document :: Map).params :: Map) or {}
    local title = restored_title(str(params.title), number, rows)
    local created, create_err = repo_mod.create(title)
    if create_err or not created then return nil, create_err or errors.new({ message = "restore create failed", kind = errors.INTERNAL }) end
    local draft_id = str((created :: Map).id)
    if draft_id == "" then return nil, errors.new({ message = "restore create returned no id", kind = errors.INTERNAL }) end
    local actor_id = str(actor)
    local applied, apply_err = wf.apply(draft_id, commands, actor_id ~= "" and actor_id or "workflow_restore")
    if apply_err or not applied then
        repo_mod.delete(draft_id)
        return nil, errors.wrap(apply_err or errors.new({ message = "no result", kind = errors.INTERNAL }), "frozen document apply failed")
    end
    local lineage, lineage_err = wf.apply_events(draft_id, { {
        type = types.EVENT.VERSION_RESTORED,
        body = { source_flow_id = source_id, source_version = number, source_def_seq = source.def_seq },
    } }, actor_id ~= "" and actor_id or "workflow_restore")
    if lineage_err or not lineage then
        repo_mod.delete(draft_id)
        return nil, errors.wrap(lineage_err or errors.new({ message = "no result", kind = errors.INTERNAL }), "restore lineage failed")
    end
    return {
        flow_id = draft_id,
        title = title,
        status = "draft",
        published = false,
        restored_from = { flow_id = source_id, version = number, def_seq = source.def_seq },
    }, nil
end

local function actor_id(): string?
    local security_mod = selected_security
    local actor = security_mod.actor()
    local id = actor and actor:id() or nil
    return type(id) == "string" and id ~= "" and id or nil
end

function M.export_flow(flow_id: any): (Map?, error?)
    local id = str(flow_id)
    local repo_mod = selected_repo
    local access_err = repo_mod.require_access(id, repo_mod.ACCESS.READ :: number)
    if access_err then return nil, access_err end
    local head, head_err = version_read.head(id)
    if head_err then return nil, head_err end
    local version = tonumber(head)
    if not version or version < 1 then return nil, errors.new({ message = "workflow has no published version", kind = errors.CONFLICT }) end
    return (selected_definitions).export({ kind = "flow", id = id, version = version })
end

function M.export_handler()
    local http_mod = selected_http
    local req = http_mod.request()
    local res = http_mod.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http_mod.CONTENT.JSON)
    if not actor_id() then
        res:set_status(http_mod.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end
    local id = tostring(req:param("id") or "")
    local source, export_err = M.export_flow(id)
    if export_err or not source then
        res:set_status((http_errors.classify(export_err)))
        res:write_json({ success = false, error = tostring(export_err or "export failed") })
        return
    end
    res:set_status(http_mod.STATUS.OK)
    res:write_json({ success = true, flow = source })
end

function M.import_handler()
    local http_mod = selected_http
    local json_mod = selected_json
    local req = http_mod.request()
    local res = http_mod.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http_mod.CONTENT.JSON)
    local actor = actor_id()
    if not actor then
        res:set_status(http_mod.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end
    local raw = req:body()
    local request, decode_err = json_mod.decode(type(raw) == "string" and raw or "")
    if decode_err or type(request) ~= "table" or type((request :: Map).flow) ~= "table" then
        res:set_status(http_mod.STATUS.BAD_REQUEST)
        res:write_json({ success = false, code = "flow_invalid", error = "request.flow artifact object is required" })
        return
    end
    local imported, import_err = M.import_flow((request :: Map).flow, (request :: Map).bindings or {}, actor)
    if import_err or not imported then
        local problem = type(import_err) == "table" and (import_err :: Map) or import_error("flow_invalid", tostring(import_err or "import failed"))
        res:set_status(http_mod.STATUS.BAD_REQUEST)
        res:write_json({ success = false, code = problem.code, error = problem.message, details = problem.details })
        return
    end
    res:set_status(http_mod.STATUS.OK)
    res:write_json({ success = true, flow = imported })
end

M.new = construct
return M
end

return construct({})
