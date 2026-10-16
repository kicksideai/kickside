-- SQL layer for the workflow definition plane. Appends events to the per-workflow
-- stream and projects each event into the read-model tables; both happen on the
-- same handle so the writer can wrap them in one transaction. Also serves the
-- table-backed reads (snapshot, per-entity lists, event tail).

local json = require("json")
local mapping = require("mapping")
local sql = require("sql")
local time = require("time")
local types = require("types")
local schema_json = require("schema_json")
local block_catalog = require("block_catalog")

local State = {}

-- Timestamps are RFC3339 UTC strings in TEXT columns on both dialects (house
-- convention); the sortable format keeps created_at/updated_at ordering correct.
local function now(offset_seconds: number?): string
    return time.now():utc():add((offset_seconds or 0) * time.SECOND):format(time.RFC3339)
end

State.now = now

local function exec(h: any, query: string, params: any?): error?
    local _, err = h:execute(query, params or {})
    if err then return err end
    return nil
end

State.exec = exec

function State.new(): (any, any)
local M = { _internals = {} }
local I = M._internals

type Map = { [string]: any }

local T = types.TABLES
local E = types.EVENT

-- Definition edits are exactly the events emitted by the command pipeline. Keep
-- this derived from the command vocabulary so newly added commands count as edits,
-- while non-projected system markers remain outside draft-change detection.
local DEFINITION_EDIT_EVENT_TYPES: { string } = {}
for _, etype in pairs(types.COMMAND_TO_EVENT) do
    if type(etype) == "string" and etype ~= "" then
        DEFINITION_EDIT_EVENT_TYPES[#DEFINITION_EDIT_EVENT_TYPES + 1] = etype
    end
end
table.sort(DEFINITION_EDIT_EVENT_TYPES)

local function encode(v: any): string
    local raw = type(v) == "table" and v or {}
    local out, err = json.encode(raw)
    if err or not out then return "{}" end
    return out
end

local function decode(raw: any): any
    if raw == nil or raw == "" then return {} end
    if type(raw) == "table" then return raw end
    local out, err = json.decode(tostring(raw))
    if err or type(out) ~= "table" then return {} end
    return out
end

local copy_tree = mapping.copy_tree

local function same_tree(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    local ta = a :: Map
    local tb = b :: Map
    for key, value in pairs(ta) do
        if not same_tree(value, tb[key]) then return false end
    end
    for key, _ in pairs(tb) do
        if ta[key] == nil then return false end
    end
    return true
end

local function encode_optional(v: any): string?
    if v == nil then return nil end
    if type(v) == "string" then return v end
    local out, err = json.encode(type(v) == "table" and v or {})
    if err or not out then return "{}" end
    return out
end

local function encode_schema_optional(v: any): string?
    if v == nil then return nil end
    if type(v) == "string" then return v end
    return encode_optional(schema_json.normalize_schema(v))
end

local function encode_config(v: any): string
    return encode(schema_json.normalize_config_schemas(type(v) == "table" and v or {}))
end

local function decode_optional(raw: any): any
    if raw == nil or raw == "" then return nil end
    if type(raw) == "table" then return raw end
    local out, err = json.decode(tostring(raw))
    if err or type(out) ~= "table" then return raw end
    return out
end

local function query(h: any, q: string, params: any): (any, error?)
    local rows, err = h:query(q, params or {})
    if err then return nil, err end
    if type(rows) ~= "table" then return nil, errors.new({message = "workflow query returned no result",
        kind = errors.INTERNAL, retryable = false}) end
    return rows, nil
end

local function schema_or_nil(raw: any): any?
    local schema = decode_optional(raw)
    if type(schema) ~= "table" then return nil end
    return schema_json.normalize_schema(schema)
end

local function sorted_keys(map: any): { string }
    local out: { string } = {}
    if type(map) ~= "table" then return out end
    for key, _ in pairs(map :: { [string]: any }) do
        if type(key) == "string" and key ~= "" then out[#out + 1] = key end
    end
    table.sort(out)
    return out
end

local function schema_keys(schema: any): { string }
    if type(schema) ~= "table" then return {} end
    return sorted_keys((schema :: any).properties)
end

local function schema_count(schema: any): number
    return #schema_keys(schema)
end

local function cfg_of(node: any): any
    return type(node) == "table" and type((node :: any).config) == "table" and (node :: any).config or {}
end

local function schema_from_config(node: any, key: string): any?
    local cfg = cfg_of(node)
    return schema_or_nil((cfg :: any)[key])
end

local function boundary_marker(kind: string, schema_key: string): any
    return {
        role = kind,
        pinned = true,
        schema_key = schema_key,
        removable = false,
    }
end

local function generic_object_schema(): any
    return {
        ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
        type = "object",
        additionalProperties = true,
    }
end

local function boundary_nodes(nodes: any): any
    local out: any = { starts = {}, finishes = {}, errors = {} }
    local seen: { [string]: boolean } = {}
    local function visit(node: any)
        if type(node) ~= "table" then return end
        local id = tostring((node :: any).id or "")
        if id ~= "" and seen[id] then return end
        if id ~= "" then seen[id] = true end
        local kind = tostring((node :: any).kind or "")
        if kind == types.BOUNDARY_NODE_KIND.START then
            out.starts[#out.starts + 1] = node
        elseif kind == types.BOUNDARY_NODE_KIND.FINISH then
            out.finishes[#out.finishes + 1] = node
        elseif kind == types.BOUNDARY_NODE_KIND.ERROR then
            out.errors[#out.errors + 1] = node
        end
    end
    if type(nodes) == "table" then
        local has_array = false
        for _, node in ipairs(nodes :: { any }) do
            has_array = true
            visit(node)
        end
        local keyed: { string } = {}
        for key, _ in pairs(nodes :: { [string]: any }) do
            if not has_array or type(key) ~= "number" then keyed[#keyed + 1] = tostring(key) end
        end
        table.sort(keyed)
        for _, key in ipairs(keyed) do visit((nodes :: any)[key]) end
    end
    return out
end

function M.boundary_nodes(nodes: any): any
    return boundary_nodes(nodes)
end

-- A workflow interface is declared in the graph by boundary nodes only:
-- Start.config.input_schema, Finish.config.output_schema, and optional
-- Error.config.error_schema. Definition params never define routed schemas.
function M.interface_from_nodes(nodes: any): any?
    local b = boundary_nodes(nodes)
    if #(b.starts :: { any }) ~= 1 or #(b.finishes :: { any }) ~= 1 then return nil end
    local input_schema = schema_from_config((b.starts :: { any })[1], "input_schema")
    local output_schema = schema_from_config((b.finishes :: { any })[1], "output_schema")
    if not input_schema or not output_schema then return nil end
    local error_schema: any? = nil
    if #(b.errors :: { any }) >= 1 then error_schema = schema_from_config((b.errors :: { any })[1], "error_schema") end
    local input_keys = schema_keys(input_schema)
    local output_keys = schema_keys(output_schema)
    local out: any = {
        input_schema = input_schema,
        output_schema = output_schema,
        error_schema = error_schema,
        input_count = schema_count(input_schema),
        output_count = schema_count(output_schema),
        error_count = schema_count(error_schema),
        input_keys = input_keys,
        output_keys = output_keys,
        error_keys = schema_keys(error_schema),
        boundary_node_ids = {
            start = tostring(((b.starts :: { any })[1] :: any).id or ""),
            finish = tostring(((b.finishes :: { any })[1] :: any).id or ""),
            error = #(b.errors :: { any }) >= 1 and tostring(((b.errors :: { any })[1] :: any).id or "") or nil,
        },
    }
    if error_schema == nil then out.error_schema = nil end
    return out
end

function M.interface_from_document(document: any): any?
    local doc = type(document) == "table" and document or {}
    return M.interface_from_nodes((doc :: any).nodes)
end

function M.start_input_schema_from_nodes(nodes: any): any
    local b = boundary_nodes(nodes)
    if #(b.starts :: { any }) == 1 then
        local schema = schema_from_config((b.starts :: { any })[1], "input_schema")
        if schema then return schema end
    end
    return generic_object_schema()
end

function M.start_input_schema_from_document(document: any): any
    local doc = type(document) == "table" and document or {}
    return M.start_input_schema_from_nodes((doc :: any).nodes)
end

local function attach_boundary_faces(node: any): ()
    if type(node) ~= "table" then return end
    local n = node :: any
    local kind = tostring(n.kind or "")
    if kind == types.BOUNDARY_NODE_KIND.START then
        n.pinned = true
        n.deletable = false
        n.boundary = boundary_marker("start", "input_schema")
        n.output_schema = schema_from_config(n, "input_schema")
        n.ports = {
            { id = "out", label = "Input", direction = "out", schema = n.output_schema },
        }
    elseif kind == types.BOUNDARY_NODE_KIND.FINISH then
        n.pinned = true
        n.deletable = false
        n.boundary = boundary_marker("finish", "output_schema")
        n.input_schema = schema_from_config(n, "output_schema")
        n.output_schema = n.input_schema
        n.ports = {
            { id = "in", label = "Output", direction = "in", schema = n.input_schema },
        }
    elseif kind == types.BOUNDARY_NODE_KIND.ERROR then
        n.pinned = true
        n.deletable = false
        n.boundary = boundary_marker("error", "error_schema")
        n.input_schema = schema_from_config(n, "error_schema")
        n.output_schema = n.input_schema
        n.ports = {
            { id = "in", label = "Error", direction = "in", schema = n.input_schema },
        }
    end
end

function M.version_interface(h: any, workflow_id: string, version: any?): (any?, error?)
    local params: { any } = { workflow_id }
    local where_version = ""
    if tonumber(version) then
        params[#params + 1] = tonumber(version)
        where_version = " AND version = $" .. tostring(#params)
    end
    local rows, err = query(h, "SELECT version, def_seq, document, created_at FROM " .. T.VERSIONS ..
        " WHERE workflow_id = $1" .. where_version .. " ORDER BY version DESC LIMIT 1", params)
    if err then return nil, err end
    if type(rows) ~= "table" or not rows[1] then return nil, nil end
    local r: any = rows[1]
    local doc = decode(r.document)
    local iface = M.interface_from_document(doc)
    if type(iface) == "table" then
        (iface :: any).version = tonumber(r.version) or 0
        (iface :: any).def_seq = tonumber(r.def_seq) or 0
        (iface :: any).created_at = r.created_at
    end
    return iface, nil
end

function M.latest_published_interface(h: any, workflow_id: string): (any?, error?)
    local iface, err = M.version_interface(h, workflow_id, nil)
    if err then return nil, err end
    if not iface then
        return { version = nil, def_seq = nil, interface = nil }, nil
    end
    return {
        version = tonumber((iface :: any).version) or 0,
        def_seq = tonumber((iface :: any).def_seq) or 0,
        created_at = (iface :: any).created_at,
        interface = iface,
    }, nil
end

function M.latest_run_summary(h: any, workflow_id: string): (any?, error?)
    local rows, err = query(h, "SELECT run_id, status, error, started_at, finished_at FROM " .. T.RUNS ..
        " WHERE workflow_id = $1 ORDER BY started_at DESC, run_id DESC LIMIT 1", { workflow_id })
    if err then return nil, err end
    if type(rows) ~= "table" or not rows[1] then return nil, nil end
    local r: any = rows[1]
    return {
        run_id = tostring(r.run_id or ""),
        status = tostring(r.status or ""),
        error = r.error,
        started_at = r.started_at,
        finished_at = r.finished_at,
    }, nil
end

local function generic_call_port_schema(): Map
    return {
        ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
        type = "object",
        additionalProperties = true,
    }
end

function M.decorate_snapshot(h: any, snapshot: any): (any, error?)
    if type(snapshot) ~= "table" then return snapshot, nil end
    local s = snapshot :: any
    local nodes = type(s.nodes) == "table" and (s.nodes :: { any }) or {}
    s.nodes = nodes
    for _, node in ipairs(nodes) do attach_boundary_faces(node) end
    local iface = M.interface_from_document({ nodes = nodes, params = s.params })
    s.interface = iface
    local cache: { [string]: any } = {}
    local blocks, catalog_err = block_catalog.catalog()
    if catalog_err then return nil, catalog_err end
    for _, node in ipairs(nodes) do
        if type(node) == "table" and tostring((node :: any).kind or "") == "block" then
            local declared = (blocks :: any)[tostring((node :: any).ref or "")]
            if type(declared) == "table" then
                local d = declared :: any
                ; (node :: any).ref_label = d.label
                ; (node :: any).icon = d.icon
                ; (node :: any).input_schema = d.input_schema
                ; (node :: any).output_schema = d.output_schema
                ; (node :: any).error_schema = d.error_schema
                ; (node :: any).config_schema = d.config_schema
                ; (node :: any).ports = copy_tree(d.ports)
            end
        end
        if type(node) == "table" and tostring((node :: any).kind or "") == "flow" then
            local cfg = cfg_of(node)
            local flow_ref = type((cfg :: any).flow_ref) == "table" and (cfg :: any).flow_ref or {}
            local workflow_id = tostring(flow_ref.id or "")
            local child_iface: any = nil
            if workflow_id ~= "" then
                local key = workflow_id .. "@" .. tostring(flow_ref.version or "")
                if cache[key] == nil then
                    local child, err = M.version_interface(h, workflow_id, flow_ref.version)
                    if err then return nil, err end
                    cache[key] = child or false
                end
                child_iface = cache[key]
            end
            if type(child_iface) == "table" then
                (node :: any).child_interface = child_iface
                ; (node :: any).input_schema = (child_iface :: any).input_schema
                ; (node :: any).output_schema = (child_iface :: any).output_schema
            end
            local child = type(child_iface) == "table" and (child_iface :: Map) or {}
            local ports: { Map } = {
                { id = "result", label = "Finished", direction = "out", schema = type(child.output_schema) == "table" and child.output_schema or generic_call_port_schema() },
            }
            if type(child.error_schema) == "table" then
                ports[#ports + 1] = { id = "failed", label = "Failed", direction = "out", schema = child.error_schema }
            end
            ; (node :: any).ports = ports
        end
    end
    return snapshot, nil
end

local function num(v: any): number?
    if v == nil then return nil end
    return tonumber(v)
end

function M.open_db(): (any?, any?)
    local db_id, config_err = types.db_id()
    if config_err or not db_id then return nil, config_err end
    local db, err = sql.get(db_id)
    if err then return nil, errors.wrap(err, "workflows db unavailable") end
    if not db then return nil, errors.new({message = "workflows db unavailable",
        kind = errors.INTERNAL, retryable = false}) end
    return db, nil
end

I.json, I.mapping, I.sql, I.time = json, mapping, sql, time
I.types, I.schema_json, I.block_catalog = types, schema_json, block_catalog
I.T, I.E, I.DEFINITION_EDIT_EVENT_TYPES = T, E, DEFINITION_EDIT_EVENT_TYPES
I.now, I.encode, I.decode, I.copy_tree, I.same_tree = now, encode, decode, copy_tree, same_tree
I.encode_optional, I.encode_schema_optional, I.encode_config, I.decode_optional = encode_optional, encode_schema_optional, encode_config, decode_optional
I.exec, I.query, I.num = exec, query, num

return M, I
end

return State
