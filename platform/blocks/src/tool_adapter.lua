local json = require("json")

local M = {}

type Map = { [string]: any }

local function map(value: any): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function text(value: any): string
    return type(value) == "string" and value or ""
end

local function copy(value: any): any
    if type(value) ~= "table" then return value end
    local out: Map = next(value) == nil and json.encode(value) == "{}" and table.create(0, 1) or {}
    for key, item in pairs(value :: Map) do out[key] = copy(item) end
    return out
end

local function decode_schema(value: any): Map
    if type(value) == "table" then return copy(value) :: Map end
    if type(value) == "string" and value ~= "" then
        local decoded, err = json.decode(value)
        if not err and type(decoded) == "table" then return copy(decoded) :: Map end
    end
    return {}
end

local function config_schema(input: Map): Map
    if input.type ~= "object" then
        return { type = "object", properties = {}, additionalProperties = true }
    end
    local config = copy(input) :: Map
    -- A Flow may fix any subset of a tool's arguments. Required inputs not fixed
    -- here remain ordinary incoming data and are still enforced by the tool call.
    config.required = nil
    return config
end

function M.visible(entry: any): boolean
    if type(entry) ~= "table" then return false end
    local row = entry :: Map
    local meta = row.meta
    if row.kind ~= "function.lua" or type(meta) ~= "table" then return false end
    local frame = map(row.security)
    if frame.actor ~= nil or frame.scope ~= nil then return false end
    local m = meta :: Map
    return m.type == "tool"
        and m.public == true
        and (m.private == nil or m.private == false)
end

function M.describe(entry: any): (Map?, string?)
    if not M.visible(entry) then return nil, "entry is not a public registry tool" end
    local row = entry :: Map
    local id = text(row.id)
    if id == "" or id ~= id:match("^([^%s:]+:[^%s:]+)$") then
        return nil, "Tool id must be an exact namespace:name id"
    end
    local meta = map(row.meta)
    local input = decode_schema(meta.input_schema)
    local output = decode_schema(meta.output_schema)
    local error_schema: Map = {
        type = "object",
        additionalProperties = false,
        required = { "code", "message" },
        properties = {
            code = { type = "string" },
            message = { type = "string" },
        },
    }
    return {
        id = id,
        title = text(meta.title) ~= "" and meta.title or (text(meta.name) ~= "" and meta.name or id),
        description = text(meta.llm_description) ~= "" and meta.llm_description
            or (text(meta.description) ~= "" and meta.description or meta.comment),
        public = true,
        source_kind = "tool",
        tool = true,
        input = input,
        config = config_schema(input),
        output = output,
        error = error_schema,
        ports = {
            { id = "result", label = "Result", direction = "out", schema = copy(output) },
            { id = "failed", label = "Failed", direction = "out", schema = copy(error_schema) },
        },
        presentation = {
            category = "Tools",
            icon = text(meta.icon) ~= "" and meta.icon or "tabler:tool",
            hue = "blue",
            blurb = text(meta.llm_description) ~= "" and meta.llm_description
                or (text(meta.description) ~= "" and meta.description or meta.comment),
        },
        execution = { kind = "tool", tool_id = id },
    }, nil
end

M.decode_schema = decode_schema

return M
