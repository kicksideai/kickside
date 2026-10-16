-- Shared helpers for the shell's declarative discovery (navigation, System tabs,
-- account menu). Each contribution is a registry.entry of a ui.* meta.type whose
-- display fields live at the entry top level (entry.data); these validate and
-- normalize the common fields so a malformed contribution can never inject markup
-- or unbounded strings into the shell. registry.find runs as the caller, so a
-- contribution the caller cannot read is simply absent.
local registry = require("registry")
local security = require("security")

local M = {}

function M.as_string(value, fallback, max_len)
    if type(value) ~= "string" or value == "" then return fallback end
    if max_len and #value > max_len then return string.sub(value, 1, max_len) end
    return value
end

function M.is_key(value)
    return type(value) == "string" and string.match(value, "^[%w][%w_.:-]*$") ~= nil
end

function M.is_icon(value)
    return type(value) == "string" and string.match(value, "^[%w_-]+:[%w_.-]+$") ~= nil
end

function M.is_component_tag(value)
    return type(value) == "string"
        and #value <= 80
        and string.match(value, "^[a-z][a-z0-9]*%-[a-z0-9][a-z0-9%-]*$") ~= nil
        and string.match(value, "%-$") == nil
end

-- A header link target: a same-origin path or an absolute http(s) URL. Restricted
-- character set keeps it injection-safe.
function M.is_url(value)
    if type(value) ~= "string" or #value > 200 then return false end
    if string.match(value, "^/[%w/_.:~%-]*$") ~= nil then return true end
    return string.match(value, "^https?://[%w/_.:~%-?&=#%%]+$") ~= nil
end

-- discover(meta_type) -> (entries, err). The ui.<kind> registry entries visible to
-- the caller; the handler reads each entry's .data fields.
function M.discover(meta_type)
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = meta_type,
    })
    if err then return nil, err end
    local visible = {}
    for _, entry in ipairs(entries or {}) do
        local data = entry.data or entry
        if data.access == nil or (type(data.access) == "string" and data.access ~= ""
            and security.can("access", data.access)) then
            visible[#visible + 1] = entry
        end
    end
    return visible, nil
end

-- Stable order: numeric order ascending, then key.
function M.sort_by_order(rows)
    table.sort(rows, function(a, b)
        if a.order ~= b.order then return a.order < b.order end
        return tostring(a.key) < tostring(b.key)
    end)
end

return M
