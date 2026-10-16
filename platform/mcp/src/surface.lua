-- The per-credential REAL tool surface (meta-tools are layered on in the
-- dispatcher). The visible real tools are the union of: the tool ids of the
-- credential's ACTIVE traits, plus any direct allowed_tool_ids. Traits the
-- credential may not activate contribute nothing. The empty surface is valid -- a
-- credential with no active traits and no direct tools sees only meta-tools, and
-- discovers/activates capability packs at runtime via find_traits + use_trait.

local registry = require("registry")
local json = require("json")
local canonical_json = require("canonical_json")
local consts = require("mcp_consts")
local traits = require("mcp_traits")

local M = {}
local reserved_names: { [string]: boolean } = {}
for _, definition in ipairs(consts.META_TOOL_DEFS) do reserved_names[definition.name] = true end

local function invalid_tool_schema(id: any, field: string, reason: string): any
    return errors.new({
        kind = errors.INVALID,
        message = "invalid " .. field .. " for " .. tostring(id) .. ": " .. reason,
        retryable = false,
        details = { code = "INVALID_TOOL_SCHEMA", tool_id = tostring(id), field = field },
    })
end

local function tool_name(entry: any): string
    local meta: any = entry.meta or {}
    if type(meta.llm_alias) == "string" and meta.llm_alias ~= "" then
        return meta.llm_alias :: string
    end
    local id = tostring(entry.id)
    local seg = id:match("[^:%.]+$") or id
    return (seg:gsub("[^%w_]", "_"))
end

local function declared_schema(schema: any, id: any, field: string): (any?, any?)
    if schema == nil then return nil, nil end
    if type(schema) == "string" then
        local decoded, decode_err = json.decode(schema)
        if decode_err then return nil, invalid_tool_schema(id, field, tostring(decode_err)) end
        if not schema:match("^%s*{") then return nil, invalid_tool_schema(id, field, "expected an object") end
        schema = decoded
    end
    if type(schema) ~= "table" then return nil, invalid_tool_schema(id, field, "expected an object") end
    for key in pairs(schema) do
        if type(key) ~= "string" then return nil, invalid_tool_schema(id, field, "expected an object") end
    end
    return canonical_json.normalize_schema(schema), nil
end

local function tool_descriptor(entry: any, name: string): (any?, any?)
    local meta: any = entry.meta or {}
    local desc = meta.llm_description
    if type(desc) ~= "string" or desc == "" then
        desc = type(meta.comment) == "string" and meta.comment or ""
    end
    local schema, schema_err = declared_schema(meta.input_schema, entry.id, "input_schema")
    if schema_err then return nil, schema_err end
    if schema == nil then schema = { type = "object", properties = canonical_json.object({}) } end
    local output, output_err = declared_schema(meta.output_schema, entry.id, "output_schema")
    if output_err then return nil, output_err end
    return { name = name, description = desc, inputSchema = schema, outputSchema = output }, nil
end

-- direct_tool_ids: the credential's direct tool grants (allowed_tool_ids, including
-- expanded presets) as concrete tool ids, with <ns>:* grants expanded like trait tools.
function M.direct_tool_ids(principal: any): ({ string }?, any?)
    local declared: { string } = {}
    for id, ok in pairs(((principal :: any).allowed_tool_ids or {}) :: { [string]: boolean }) do
        if ok then declared[#declared + 1] = id end
    end
    return traits.expand_tool_ids(declared)
end

-- active_tool_ids: the set of real registry tool ids a principal can currently
-- reach -- its active traits' tools, bounded to allowed traits, plus direct tools.
function M.active_tool_ids(principal: any): ({ [string]: boolean }?, any?)
    local p: any = principal
    -- Active traits, intersected with the credential's allowed-trait ceiling.
    local active: { string } = {}
    local allowed = p.allowed_trait_ids
    for _, tid in ipairs((p.active_trait_ids or {}) :: { string }) do
        if traits.is_allowed(tid, allowed, p.restrict_traits) then
            active[#active + 1] = tid
        end
    end
    local set, trait_err = traits.resolve_tool_ids(active)
    if trait_err then return nil, trait_err end
    -- Direct tools always count.
    local direct, direct_err = M.direct_tool_ids(principal)
    if direct_err then return nil, direct_err end
    for _, id in ipairs(direct) do set[id] = true end
    return set
end

-- build: REAL tool descriptors + a name->id map for the principal's current
-- surface. Skips ids that are missing or not tools.
function M.build(principal: any): (any?, any?, any?)
    local descriptors: { any } = {}
    local name_to_id: { [string]: string } = {}
    local active, active_err = M.active_tool_ids(principal)
    if active_err then return nil, nil, active_err end
    for id, ok in pairs(active) do
        if ok then
            local entries, err = registry.find({ [".id"] = id })
            if err then return nil, nil, err end
            if entries and #entries > 0 then
                local entry = entries[1]
                local meta: any = entry.meta or {}
                if meta.type == consts.TOOL_META_TYPE then
                    local name = tool_name(entry)
                    if name_to_id[name] or reserved_names[name] then
                        local colliding_ids = { tostring(entry.id) }
                        if name_to_id[name] then colliding_ids[#colliding_ids + 1] = name_to_id[name] end
                        return nil, nil, errors.new({ kind = errors.CONFLICT,
                            message = "MCP tool name collision: " .. name, retryable = false,
                            details = { code = "TOOL_NAME_COLLISION", name = name,
                                tool_ids = colliding_ids } })
                    end
                    local descriptor, descriptor_err = tool_descriptor(entry, name)
                    if descriptor_err then return nil, nil, descriptor_err end
                    name_to_id[name] = tostring(entry.id)
                    descriptors[#descriptors + 1] = descriptor
                end
            end
        end
    end
    return descriptors, name_to_id
end

-- descriptor_for: resolve one allowed/available tool id into a descriptor (for
-- find_tools over the available catalog). Returns nil if not a tool.
function M.descriptor_for(id: string): (any?, any?)
    local entries, err = registry.find({ [".id"] = id })
    if err then return nil, err end
    if not entries or #entries == 0 then return nil end
    local entry = entries[1]
    local meta: any = entry.meta or {}
    if meta.type ~= consts.TOOL_META_TYPE then return nil end
    return tool_descriptor(entry, tool_name(entry))
end

return M
