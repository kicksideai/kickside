-- Generic UI-contribution discovery. Modules contribute UI surfaces by declaring
-- a registry.entry with a `ui.<kind>` meta.type (e.g. ui.command); a consumer asks
-- for that type and gets the normalized records. This is the one discovery seam
-- for declarative UI contributions — adding a new kind needs no new library,
-- endpoint, or security grant, only a meta.type and a consumer that requests it.
--
-- Discovers by meta.type and skips
-- meta.private/meta.internal, normalize the common fields (label/icon/order) and
-- pass the type-specific declarative fields (e.g. component_tag, hotkey) through.

local shell = require("shell")

local M = {}

-- Only `ui.*` types are discoverable through this seam, so it can never be used
-- to dump arbitrary registry entries.
local function valid_type(t: any): boolean
    return type(t) == "string" and string.match(t, "^ui%.[%w_.]+$") ~= nil
end

local function safe_string(value: any, fallback: string, max_len: integer): string
    if type(value) ~= "string" or value == "" then return fallback end
    if #value > max_len then return string.sub(value, 1, max_len) end
    return value
end

local function safe_icon(value: any): string
    if type(value) == "string" and string.match(value, "^[%w_-]+:[%w_.-]+$") then return value end
    return "tabler:square"
end

-- Keys owned by the record shape or internal to discovery; everything else in
-- meta is a declarative, type-specific field passed through verbatim.
local RESERVED: { [string]: boolean } = {}
RESERVED["type"] = true
RESERVED["private"] = true
RESERVED["internal"] = true
RESERVED["id"] = true
RESERVED["order"] = true

local function normalize(entry: any): any
    local e = entry :: { id: string, meta: any }
    local meta = e.meta or {}
    local record: { [string]: any } = {}
    -- Pass through declarative meta (component_tag, hotkey, path, name, ...) as
    -- scalars; the consumer reads what its kind needs.
    for k, v in pairs(meta :: { [string]: any }) do
        if not RESERVED[k] and (type(v) == "string" or type(v) == "number" or type(v) == "boolean") then
            record[k] = v
        end
    end
    record.id = e.id or ""
    record.type = meta.type
    record.label = safe_string(meta.title, "", 120)
    record.icon = safe_icon(meta.icon)
    record.order = tonumber(meta.order) or 500
    return record
end

-- list returns the normalized contributions of one ui.* type, ordered by
-- meta.order then label. Invalid types and private/internal entries yield nothing.
function M.list(contribution_type: string): (any?, any?)
    local out: { any } = {}
    if not valid_type(contribution_type) then return out end
    local entries, err = shell.discover(contribution_type)
    if err then return nil, err end
    for _, entry in ipairs(entries) do
        local e = entry :: { meta: any }
        local meta = e.meta or {}
        if not meta.private and not meta.internal then
            out[#out + 1] = normalize(entry)
        end
    end
    table.sort(out, function(a: any, b: any): boolean
        local ao = (a :: any).order or 500
        local bo = (b :: any).order or 500
        if ao ~= bo then return ao < bo end
        return tostring((a :: any).label or "") < tostring((b :: any).label or "")
    end)
    return out
end

-- collect returns { [type] = { records } } for several types in one pass.
function M.collect(types: { string }): (any?, any?)
    local result: { [string]: { any } } = {}
    for _, t in ipairs(types) do
        if valid_type(t) then
            local items, err = M.list(t)
            if err then return nil, err end
            result[t] = items
        end
    end
    return result
end

return M
