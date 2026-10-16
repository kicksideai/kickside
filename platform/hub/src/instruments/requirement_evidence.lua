local hub = require("hub")
local registry = require("registry")
local keyset = require("keyset")

local M = {}

M._hub = nil
M._registry = nil

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function valid_component(value: any): boolean
    local component = trim(value)
    return component ~= "" and #component <= 200
        and component:match("^[%w][%w%._%-]*/[%w][%w%._%-]*$") ~= nil
end

local function artifact_entry(entry: any): any
    local full: { [string]: any } = {}
    for key, value in pairs(entry) do full[key] = value end
    if full.source == nil and type(full.data) == "table" then full.source = full.data.source end
    return full
end

local function artifact_summary(entry: any): any
    local meta = type(entry.meta) == "table" and entry.meta or {}
    return { id = entry.id, kind = entry.kind, title = meta.title }
end

-- inspect_module pages one exact artifact's registry entries in id order.
-- Passing entry_id reads that entry's complete metadata, data, and source.
function M.inspect_module(args: any): (any?, any?)
    args = type(args) == "table" and args or {}
    local component = trim(args.component)
    local version = trim(args.version)
    if not valid_component(component) or version == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "component and exact version are required" })
    end
    local entry_id = trim(args.entry_id)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local pkg, open_err = (M._hub or hub).versions.open(component, { version = version })
    if open_err then return nil, open_err end
    if not pkg then return nil, errors.new({ kind = errors.NOT_FOUND, message = "artifact not found: " .. component .. "@" .. version }) end
    local entries, entries_err = pkg:entries({ include_data = entry_id ~= "" })
    local metadata, metadata_err = nil, nil
    if entry_id ~= "" and entries_err == nil then metadata, metadata_err = pkg:metadata() end
    local _, close_err = pkg:close()
    if entries_err then return nil, entries_err end
    if metadata_err then return nil, metadata_err end
    if close_err then return nil, close_err end
    if type(entries) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "artifact returned no entry list" }) end
    if entry_id ~= "" then
        for _, entry in ipairs(entries :: { any }) do
            if type(entry) == "table" and entry.id == entry_id then
                return { component = component, version = version, metadata = metadata or {}, entry = artifact_entry(entry) }, nil
            end
        end
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "artifact entry not found: " .. entry_id })
    end
    local rows: { any } = {}
    for _, entry in ipairs(entries :: { any }) do
        if type(entry) == "table" then rows[#rows + 1] = artifact_summary(entry) end
    end
    local page, next_cursor = keyset.page(rows, keyset.field("id"), limit :: integer, cursor)
    return { component = component, version = version, entries = page,
        truncated = next_cursor ~= nil, next_cursor = next_cursor }, nil
end

function M.inspect_registry(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local ids = args.ids
    if type(ids) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "ids array is required" }) end
    local out: { any } = {}
    local seen: { [string]: boolean } = {}
    for _, raw in ipairs(ids :: { any }) do
        local id = trim(raw)
        if #id <= 240 and id ~= "" and id:find(":", 1, true) and not seen[id] then
            seen[id] = true
            local entry, get_err = (M._registry or registry).get(id)
            out[#out + 1] = entry or { id = id, error = tostring(get_err or "not found") }
        end
    end
    return { entries = out }, nil
end

return M
