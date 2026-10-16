-- Canonical actor-scoped discovery of workflows that can be executed now. This
-- read-only catalog is shared by the broad Run Flow agent face, automation
-- binding discovery, and picker API projections; execution remains owned by the
-- native Dataflow execution.

local version_read = require("version_read")
local workflow_repo = require("workflow_repo")

local M = {}

type Map = { [string]: any }

local function str(v: any): string
    return type(v) == "string" and v or ""
end

local function map(v: any): Map
    return type(v) == "table" and (v :: Map) or {}
end

local function generic_object_schema(): Map
    local result: Map = {
        ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
        type = "object",
        additionalProperties = true,
    }
    return result
end

local function version_row(workflow_id: string, version: any): (Map?, error?)
    local v = tonumber(version)
    if not v or v < 1 or v ~= math.floor(v) then return nil, errors.new({ kind = errors.INVALID, message = "exact published Flow version required" }) end
    local row, err = version_read.get(workflow_id, v)
    if err then return nil, err end
    if not row then return nil, errors.new({ kind = errors.NOT_FOUND, message = "version not found: " .. tostring(v) }) end
    return row :: Map, nil
end

local function descriptor(workflow_id: string, known_row: any?): (Map?, error?)
    local access_err = workflow_repo.require_access(workflow_id, workflow_repo.ACCESS.READ :: number)
    if access_err then return nil, access_err end

    local item = map(known_row)
    if str(item.id) ~= workflow_id then return nil, errors.new({ kind = errors.NOT_FOUND, message = "workflow is unavailable" }) end
    local published_version = tonumber(item.published_version)
    if not published_version or published_version < 1 then return nil, errors.new({ kind = errors.NOT_FOUND, message = "workflow has no published version" }) end
    local row, rerr = version_row(workflow_id, published_version)
    if rerr then return nil, rerr end
    if not row then return nil, errors.new({ kind = errors.NOT_FOUND, message = "published workflow not found" }) end
    local iface = map(row.interface)
    local document = map(row.document)
    local params = map(document.params)
    local description = str(params.description)
    if description == "" then description = str(params.llm_description) end
    if description == "" then description = str(params.summary) end
    local title = str(item.title)
    if title == "" then title = "Workflow " .. workflow_id end
    local result: Map = {
        id = "kickside.workflows.call:" .. workflow_id,
        title = title,
        description = description,
        flow_ref = {
            kind = "flow",
            id = workflow_id,
            version = row.version,
        },
        input_schema = row.input_schema or iface.input_schema or generic_object_schema(),
        output_schema = iface.output_schema or generic_object_schema(),
        result_source = "finish",
    }
    if type(iface.error_schema) == "table" then
        result.error_schema = iface.error_schema
        result.error_source = "error"
    end
    return result, nil
end

-- catalog returns only workflows the ambient actor can bind and launch: the
-- component-list read gate, a fresh READ recheck, and the lifecycle/publish
-- gates all agree before a descriptor is emitted. READ is the use grant — a
-- read-only share can bind and launch a published Flow; the write paths keep
-- their own WRITE gates.
function M.catalog(args: any?): ({ Map }?, error?, integer?)
    local options: Map = type(args) == "table" and args or {}
    local rows, lerr, next_offset = workflow_repo.list({published_only = true,
        limit = options.limit, offset = options.offset, id = options.id})
    if lerr then return nil, lerr end
    local out: { Map } = {}
    for _, raw in ipairs(type(rows) == "table" and rows or {}) do
        local item = map(raw)
        local workflow_id = str(item.id)
        local published_version = tonumber(item.published_version)
        if workflow_id ~= "" and published_version and published_version > 0 then
            local item_descriptor, derr = descriptor(workflow_id, item)
            if derr then return nil, derr end
            out[#out + 1] = item_descriptor
        end
    end
    return out, nil, next_offset
end

-- bindable_items is the compact projection used by declaration pickers. Keeping the
-- projection beside catalog() prevents automation and API consumers from inventing
-- different definitions of "published and callable" while leaving the agent descriptor
-- shape untouched.
function M.bindable_items(args: any?): ({ Map }?, error?, integer?)
    local descriptors, err, next_offset = M.catalog(args)
    if err then return nil, err end
    local items: { Map } = {}
    for _, raw in ipairs(descriptors or {}) do
        local item = map(raw)
        local ref = map(item.flow_ref)
        local workflow_id = str(ref.id)
        if workflow_id ~= "" then
            local title = str(item.title)
            if title == "" then title = workflow_id end
            items[#items + 1] = {
                id = workflow_id,
                label = title,
                title = title,
                icon = "tabler:route",
                flow_ref = ref,
            }
        end
    end
    return items, nil, next_offset
end

return M
