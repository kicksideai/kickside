-- Canonical kickside.flow/v1 artifacts and package declarations.
--
-- A package declares one artifact at registry.entry meta.type=kickside.flow,
-- data.flow. Its refs manifest points only at stable node ids and object config
-- paths. Materialization replaces those targets with typed supplied bindings and
-- returns a clean ordinary Flow document before the normal CQRS/compiler path.

local canonical_json = require("canonical_json")
local json = require("json")

local M = {}

type Map = { [any]: any }

local API_VERSION = "kickside.flow/v1"
local ARTIFACT_KIND = "flow"
local DECLARATION_TYPE = "kickside.flow"
local MAX_DEPTH = 128

local ARTIFACT_FIELDS: { [string]: boolean } = {
    api_version = true, key = true, kind = true, title = true,
    version = true, refs = true, document = true, checksum = true,
}
local DOCUMENT_FIELDS: { [string]: boolean } = {
    nodes = true, edges = true, notes = true, layout = true, params = true,
}
local REF_FIELDS: { [string]: boolean } = {
    key = true, kind = true, node_id = true, config_path = true,
}
local REF_KINDS: { [string]: boolean } = {
    component = true, flow = true, value = true,
}

-- invalid is the refusal every Flow artifact check returns: an INVALID error
-- whose details name the offending path when one exists.
local function invalid(message: string, path: string?): error
    return errors.new({ kind = errors.INVALID, message = message, details = path and { path = path } or nil })
end

M.API_VERSION = API_VERSION
M.ARTIFACT_KIND = ARTIFACT_KIND
M.DECLARATION_TYPE = DECLARATION_TYPE

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value :: string):gsub("^%s+", ""):gsub("%s+$", "")
end

local function is_positive_integer(value: any): boolean
    return type(value) == "number" and value > 0 and math.floor(value :: number) == value
end

local function is_array(value: any): boolean
    if type(value) ~= "table" then return false end
    local count, highest = 0, 0
    for key, _ in pairs(value :: Map) do
        if type(key) ~= "number" or key < 1 or math.floor(key) ~= key then return false end
        count = count + 1
        if key > highest then highest = key end
    end
    return count == highest
end

local function copy_tree(value: any, active: Map?, depth: number?, legacy_checksum: boolean?): (any?, error?)
    if type(value) ~= "table" then return value, nil end
    local stack = active or {}
    local level = depth or 1
    if level > MAX_DEPTH then return nil, invalid("value exceeds the Flow artifact nesting limit") end
    if stack[value] then return nil, invalid("cyclic table is not valid Flow data") end
    stack[value] = true
    local out: Map = not legacy_checksum and next(value) == nil and json.encode(value) == "{}" and table.create(0, 1) or {}
    for key, child in pairs(value :: Map) do
        local copied, err = copy_tree(child, stack, level + 1, legacy_checksum)
        if err then stack[value] = nil; return nil, err end
        out[key] = copied
    end
    stack[value] = nil
    return out, nil
end

-- Portable object fields retain object shape when empty.
local function normalize_empty_object(value: any): any
    if type(value) == "table" and next(value :: Map) == nil then
        return canonical_json.object({})
    end
    return value
end

local function normalize_document_object_fields(document: Map): Map
    document.params = normalize_empty_object(document.params)
    document.layout = normalize_empty_object(document.layout)
    for _, raw_node in ipairs(type(document.nodes) == "table" and (document.nodes :: { any }) or {}) do
        if type(raw_node) == "table" then
            local node = raw_node :: Map
            node.config = normalize_empty_object(node.config)
            node.retry_policy = normalize_empty_object(node.retry_policy)
        end
    end
    for _, raw_edge in ipairs(type(document.edges) == "table" and (document.edges :: { any }) or {}) do
        if type(raw_edge) == "table" and (raw_edge :: Map).transform ~= nil then
            local edge = raw_edge :: Map
            edge.transform = normalize_empty_object(edge.transform)
        end
    end
    return document
end

-- canonical_text(value) -> the canonical JSON of a Flow value (kickside
-- contract codec: keys sorted at every depth), or its refusal as text.
local function canonical_text(value: any): (string?, error?)
    local text, err = canonical_json.encode(value)
    if err then return nil, err end
    return text, nil
end

local function checksum(artifact: any): (string?, error?)
    if type(artifact) ~= "table" then return nil, invalid("Flow artifact must be an object") end
    -- v1 checksums historically erase empty-object capacity. Preserve that
    -- wire contract while ordinary copies retain the original JSON data shape.
    local unsigned, copy_err = copy_tree(artifact, nil, nil, true)
    if copy_err then return nil, copy_err end
    ;(unsigned :: Map).checksum = nil
    local digest, digest_err = canonical_json.hash(unsigned)
    if digest_err then return nil, digest_err end
    if not digest then return nil, errors.new({ kind = errors.INTERNAL, message = "Flow artifact checksum returned no digest" }) end
    return digest, nil
end

M.checksum = checksum

local function exact_fields(value: Map, allowed: { [string]: boolean }, path: string): error?
    for key, _ in pairs(value) do
        if type(key) ~= "string" or not allowed[key] then return invalid(path .. "." .. tostring(key) .. " is not declared", path .. "." .. tostring(key)) end
    end
    return nil
end

local function forbidden_placeholder(value: any, path: string, active: Map?, depth: number?): error?
    if type(value) == "string" and (value :: string):match("^%s*%${[^}]+}%s*$") then
        return invalid(path .. " uses forbidden ${slot} syntax", path)
    end
    if type(value) ~= "table" then return nil end
    local stack = active or {}
    local level = depth or 1
    if level > MAX_DEPTH then return invalid(path .. " exceeds the Flow artifact nesting limit", path) end
    if stack[value] then return invalid(path .. " contains a cyclic table", path) end
    stack[value] = true
    if (value :: Map).kind == "slot" then
        stack[value] = nil
        return invalid(path .. " uses forbidden {kind=slot} syntax", path)
    end
    for key, child in pairs(value :: Map) do
        local err = forbidden_placeholder(child, path .. "." .. tostring(key), stack, level + 1)
        if err then stack[value] = nil; return err end
    end
    stack[value] = nil
    return nil
end

local function validate_document(document: any): (Map?, error?)
    if type(document) ~= "table" then return nil, invalid("document must be an object") end
    local doc = document :: Map
    local fields_err = exact_fields(doc, DOCUMENT_FIELDS, "document")
    if fields_err then return nil, fields_err end
    if not is_array(doc.nodes) or not is_array(doc.edges) then return nil, invalid("document requires nodes and edges arrays") end
    if doc.notes ~= nil and not is_array(doc.notes) then return nil, invalid("document.notes must be an array") end
    if doc.layout ~= nil and type(doc.layout) ~= "table" then return nil, invalid("document.layout must be an object") end
    if doc.params ~= nil and type(doc.params) ~= "table" then return nil, invalid("document.params must be an object") end

    local nodes: Map = {}
    for index, raw in ipairs(doc.nodes :: { any }) do
        if type(raw) ~= "table" then return nil, invalid("document.nodes[" .. tostring(index) .. "] must be an object") end
        local node = raw :: Map
        local id = trim(node.id)
        if id == "" or id ~= node.id then return nil, invalid("document.nodes[" .. tostring(index) .. "].id must be a trimmed non-empty string") end
        if nodes[id] then return nil, invalid("document node id is duplicated: " .. id) end
        nodes[id] = node
    end
    local placeholder_err = forbidden_placeholder(doc, "document")
    if placeholder_err then return nil, placeholder_err end
    local _, encode_err = canonical_text(doc)
    if encode_err then return nil, encode_err end
    return nodes, nil
end

local function validate_config_path(raw: any, path: string): ({ string }?, error?)
    if not is_array(raw) or #(raw :: { any }) == 0 then return nil, invalid(path .. " must be a non-empty field-name array", path) end
    local out: { string } = {}
    for index, segment in ipairs(raw :: { any }) do
        local field = trim(segment)
        if type(segment) ~= "string" or field == "" or field ~= segment then
            return nil, invalid(path .. "[" .. tostring(index) .. "] must be a trimmed non-empty field name", path)
        end
        if field:match("^%d+$") then return nil, invalid(path .. " must not address array indexes", path) end
        if field:find("/", 1, true) or field == "." or field == ".." then
            return nil, invalid(path .. " must use field names, not JSON pointers", path)
        end
        out[#out + 1] = field
    end
    return out, nil
end

local function paths_overlap(left: { string }, right: { string }): boolean
    local limit = math.min(#left, #right)
    for index = 1, limit do if left[index] ~= right[index] then return false end end
    return true
end

local function validate_refs(raw_refs: any, nodes: Map): (Map?, error?)
    if not is_array(raw_refs) then return nil, invalid("refs must be an array") end
    local requirements: Map = {}
    local targets: { Map } = {}
    for index, raw in ipairs(raw_refs :: { any }) do
        local path = "refs[" .. tostring(index) .. "]"
        if type(raw) ~= "table" then return nil, invalid(path .. " must be an object", path) end
        local ref = raw :: Map
        local fields_err = exact_fields(ref, REF_FIELDS, path)
        if fields_err then return nil, fields_err end
        local key, kind, node_id = trim(ref.key), trim(ref.kind), trim(ref.node_id)
        if key == "" or key ~= ref.key then return nil, invalid(path .. ".key must be a trimmed non-empty string", path) end
        if not REF_KINDS[kind] or kind ~= ref.kind then return nil, invalid(path .. ".kind must be component, flow, or value", path) end
        if node_id == "" or node_id ~= ref.node_id or nodes[node_id] == nil then
            return nil, invalid(path .. ".node_id does not identify a document node", path)
        end
        local config_path, config_err = validate_config_path(ref.config_path, path .. ".config_path")
        if config_err or not config_path then return nil, config_err end
        local prior_kind = requirements[key]
        if prior_kind and prior_kind ~= kind then return nil, invalid("ref key " .. key .. " declares conflicting kinds") end
        requirements[key] = kind
        for _, prior in ipairs(targets) do
            if prior.node_id == node_id and paths_overlap(prior.config_path, config_path) then
                return nil, invalid("ref targets overlap at node " .. node_id)
            end
        end
        targets[#targets + 1] = { key = key, kind = kind, node_id = node_id, config_path = config_path }
    end
    return { requirements = requirements, targets = targets }, nil
end

local function validate_artifact(artifact: any, verify_checksum: boolean): (Map?, error?)
    if type(artifact) ~= "table" then return nil, invalid("Flow artifact object is required") end
    local source = artifact :: Map
    local fields_err = exact_fields(source, ARTIFACT_FIELDS, "flow")
    if fields_err then return nil, fields_err end
    if source.api_version ~= API_VERSION then return nil, invalid("api_version must be " .. API_VERSION) end
    if source.kind ~= ARTIFACT_KIND then return nil, invalid("kind must be flow") end
    if trim(source.key) == "" or trim(source.key) ~= source.key then return nil, invalid("key must be a trimmed non-empty string") end
    if type(source.title) ~= "string" or trim(source.title) == "" or trim(source.title) ~= source.title then
        return nil, invalid("title must be a trimmed non-empty string")
    end
    if not is_positive_integer(source.version) then return nil, invalid("version must be a positive integer") end
    local nodes, document_err = validate_document(source.document)
    if document_err or not nodes then return nil, document_err end
    local refs, refs_err = validate_refs(source.refs, nodes)
    if refs_err or not refs then return nil, refs_err end
    if type(source.checksum) ~= "string" or #source.checksum ~= 64 or not (source.checksum :: string):match("^[0-9a-f]+$") then
        return nil, invalid("checksum must be a lowercase 64-character sha256 hex digest")
    end
    if verify_checksum then
        local actual, checksum_err = checksum(source)
        if checksum_err or not actual then return nil, checksum_err end
        if actual ~= source.checksum then return nil, invalid("checksum does not match Flow artifact") end
    end
    local copied, copy_err = copy_tree(source)
    if copy_err then return nil, copy_err end
    return { artifact = copied, refs = refs }, nil
end

function M.build(args: any): (Map?, error?)
    local source = type(args) == "table" and (args :: Map) or {}
    local document, document_err = copy_tree(source.document)
    if document_err then return nil, document_err end
    if type(document) ~= "table" then return nil, invalid("document must be an object", "document") end
    document = normalize_document_object_fields(document :: Map)
    local refs, refs_err = copy_tree(type(source.refs) == "table" and source.refs or {})
    if refs_err then return nil, refs_err end
    local artifact: Map = {
        api_version = API_VERSION,
        key = source.key,
        kind = ARTIFACT_KIND,
        title = source.title,
        version = source.version,
        refs = refs,
        document = document,
        checksum = string.rep("0", 64),
    }
    local _, validation_err = validate_artifact(artifact, false)
    if validation_err then return nil, validation_err end
    local digest, digest_err = checksum(artifact)
    if digest_err then return nil, digest_err end
    if not digest then return nil, errors.new({ kind = errors.INTERNAL, message = "Flow artifact checksum returned no digest" }) end
    artifact.checksum = digest
    return artifact, nil
end

function M.validate(artifact: any): (Map?, error?)
    local checked, err = validate_artifact(artifact, true)
    if err or not checked then return nil, err end
    return checked.artifact :: Map, nil
end

function M.validate_declaration(entry: any): (Map?, error?)
    if type(entry) ~= "table" then return nil, invalid("Flow registry declaration object is required") end
    local declaration = entry :: Map
    if declaration.kind ~= "registry.entry" then return nil, invalid("Flow declaration kind must be registry.entry") end
    local meta = type(declaration.meta) == "table" and (declaration.meta :: Map) or {}
    if meta.type ~= DECLARATION_TYPE then return nil, invalid("Flow declaration meta.type must be " .. DECLARATION_TYPE) end
    local data = type(declaration.data) == "table" and (declaration.data :: Map) or {}
    if type(data.flow) ~= "table" then return nil, invalid("Flow declaration data.flow is required") end
    return M.validate(data.flow)
end

local function validate_binding(kind: string, binding: any, key: string): (any?, error?)
    local path = "bindings." .. key
    if type(binding) ~= "table" then return nil, invalid(path .. " must be an object", path) end
    local value = binding :: Map
    if value.kind ~= kind then return nil, invalid(path .. ".kind must be " .. kind, path) end
    if kind == "component" then
        local fields_err = exact_fields(value, { kind = true, id = true }, path)
        if fields_err then return nil, fields_err end
        if trim(value.id) == "" or trim(value.id) ~= value.id then return nil, invalid(path .. ".id must be a trimmed non-empty component id", path) end
        return value.id, nil
    end
    if kind == "flow" then
        local fields_err = exact_fields(value, { kind = true, id = true, version = true }, path)
        if fields_err then return nil, fields_err end
        if trim(value.id) == "" or trim(value.id) ~= value.id or not is_positive_integer(value.version) then
            return nil, invalid(path .. " must be an exact {kind='flow', id, version} binding", path)
        end
        return copy_tree(value)
    end
    local fields_err = exact_fields(value, { kind = true, value = true }, path)
    if fields_err then return nil, fields_err end
    if value.value == nil then return nil, invalid(path .. ".value is required", path) end
    local placeholder_err = forbidden_placeholder(value.value, path .. ".value")
    if placeholder_err then return nil, placeholder_err end
    return copy_tree(value.value)
end

local function set_target(document: Map, target: Map, value: any): error?
    local node: Map? = nil
    for _, raw in ipairs(document.nodes :: { any }) do
        if type(raw) == "table" and (raw :: Map).id == target.node_id then node = raw :: Map; break end
    end
    if not node then return invalid("ref target node disappeared: " .. tostring(target.node_id)) end
    if type(node.config) ~= "table" or (#(node.config :: { any }) > 0 and is_array(node.config)) then
        return invalid("node " .. target.node_id .. " config must be an object")
    end
    local cursor = node.config :: Map
    local config_path = target.config_path :: { string }
    for index = 1, #config_path - 1 do
        local child = cursor[config_path[index]]
        if type(child) ~= "table" or (#(child :: { any }) > 0 and is_array(child)) then
            return invalid("ref target " .. target.node_id .. ".config." .. table.concat(config_path, ".") .. " must traverse objects")
        end
        cursor = child :: Map
    end
    local leaf = config_path[#config_path]
    if cursor[leaf] == nil then return invalid("ref target " .. target.node_id .. ".config." .. table.concat(config_path, ".") .. " is unresolved") end
    cursor[leaf] = value
    return nil
end

function M.materialize(artifact: any, raw_bindings: any): (Map?, error?)
    local checked, artifact_err = validate_artifact(artifact, true)
    if artifact_err or not checked then return nil, artifact_err end
    local bindings = raw_bindings == nil and {} or raw_bindings
    if type(bindings) ~= "table" or (#(bindings :: { any }) > 0 and is_array(bindings)) then return nil, invalid("bindings must be an object") end
    local requirements = (checked.refs :: Map).requirements :: Map
    for key, _ in pairs(bindings :: Map) do
        if type(key) ~= "string" or requirements[key] == nil then return nil, invalid("unexpected binding: " .. tostring(key), "bindings." .. tostring(key)) end
    end
    local values: Map = {}
    for key, kind in pairs(requirements) do
        local binding = (bindings :: Map)[key]
        if binding == nil then return nil, invalid("missing binding: " .. tostring(key), "bindings." .. tostring(key)) end
        local value, binding_err = validate_binding(tostring(kind), binding, tostring(key))
        if binding_err then return nil, binding_err end
        values[key] = value
    end

    local artifact_copy = checked.artifact :: Map
    local document, copy_err = copy_tree(artifact_copy.document)
    if copy_err then return nil, copy_err end
    local params = type((document :: Map).params) == "table" and ((document :: Map).params :: Map) or {}
    ;(document :: Map).params = params
    if params.key ~= nil and params.key ~= artifact_copy.key then
        return nil, invalid("document.params.key conflicts with Flow artifact key", "document.params.key")
    end
    params.key = artifact_copy.key
    for _, target in ipairs((checked.refs :: Map).targets :: { Map }) do
        local value, value_err = copy_tree(values[target.key])
        if value_err then return nil, value_err end
        local target_err = set_target(document :: Map, target, value)
        if target_err then return nil, target_err end
    end
    local unresolved_err = forbidden_placeholder(document, "document")
    if unresolved_err then return nil, unresolved_err end
    local _, encode_err = canonical_text(document)
    if encode_err then return nil, encode_err end
    return {
        key = artifact_copy.key,
        title = artifact_copy.title,
        version = artifact_copy.version,
        checksum = artifact_copy.checksum,
        document = document,
    }, nil
end

function M.materialize_declaration(entry: any, bindings: any): (Map?, error?)
    local artifact, declaration_err = M.validate_declaration(entry)
    if declaration_err or not artifact then return nil, declaration_err end
    return M.materialize(artifact, bindings)
end

return M
