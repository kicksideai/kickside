-- Canonical implementation of `kickside.agents:tools` registry contract.
--
-- Tools are function.lua entries with meta.type=tool — they live in the
-- registry, not in components. This binding is a read facade over the live
-- registry (registry.find by .kind=function.lua + meta.type=tool).

local registry = require("registry")
local tool_schema = require("tool_schema")
local tool_visibility = require("tool_visibility")

local M = {}

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function entry_to_tool(entry: any): any
    local meta: any = entry.meta or {}
    local data: any = entry.data or {}
    local tool = {
        id = entry.id,
        title = meta.title or entry.id,
        public = tool_visibility.meta_is_public(meta),
        comment = meta.comment or "",
        llm_alias = meta.llm_alias or "",
        llm_description = meta.llm_description or "",
        input_schema = tool_schema.decode(meta.input_schema),
        tags = meta.tags or {},
        modules = data.modules or {},
    }
    if meta.output_schema ~= nil then
        tool.output_schema = tool_schema.decode(meta.output_schema)
    end
    return tool
end

-- find: lookup a tool by its registry id.
-- Input:  { id }
function M.find(args: any): (any, error?)
    args = args or {}
    if not is_str(args.id) then return nil, errors.new({ kind = errors.INVALID, message = "id is required" }) end

    local entries, err = registry.find({ [".id"] = args.id })
    if err then return nil, errors.wrap(err, "registry.find") end
    if not entries or #entries == 0 then return nil, nil end

    local entry = entries[1]
    local meta: any = entry.meta or {}
    if meta.type ~= "tool" then
        return nil, errors.new({ kind = errors.INVALID, message = "entry exists but is not a tool: " .. args.id })
    end
    return entry_to_tool(entry), nil
end

-- list: enumerate tools.
-- Input:  { namespace?, tag? }
function M.list(args: any): (any, error?)
    args = args or {}

    local query: { [string]: any } = {
        [".kind"] = "function.lua",
        ["meta.type"] = "tool",
    }
    local entries, err = registry.find(query)
    if err then return nil, errors.wrap(err, "registry.find") end

    local out: { any } = {}
    local ns_prefix: any = is_str(args.namespace) and args.namespace or nil
    local tag: any = is_str(args.tag) and args.tag or nil

    for _, entry in ipairs(entries or {}) do
        local include = true
        if ns_prefix then
            local id: any = entry.id
            if type(id) ~= "string" or id:sub(1, #ns_prefix) ~= ns_prefix then
                include = false
            end
        end
        if include and tag then
            include = false
            local meta: any = entry.meta or {}
            local tags = meta.tags
            if type(tags) == "table" then
                for _, t in ipairs(tags) do
                    if t == tag then include = true; break end
                end
            end
        end
        if include and tool_visibility.entry_is_public_tool(entry) then
            out[#out + 1] = entry_to_tool(entry)
        end
    end
    return out, nil
end

return M
