-- Presets: named bundles of tool ids a credential can be minted with, declared in
-- the registry (meta.type = mcp.preset). They are the "traits" knob -- a user picks
-- a preset (reader, workspace_agent, ...) instead of hand-listing tool ids, and a
-- platform-level MCP is just an admin-minted credential with a broad preset over a
-- platform-root scope. Discovery is registry-driven, so a module ships a preset by
-- declaring an entry; nothing here enumerates them.

local registry = require("registry")
local consts = require("mcp_consts")
local traits = require("mcp_traits")

local M = {}

local function entry_tool_ids(entry: any): { string }
    local meta: any = entry.meta or {}
    local ids: { string } = {}
    if type(meta.tool_ids) == "table" then
        for _, id in ipairs(meta.tool_ids :: { any }) do
            if type(id) == "string" and id ~= "" then ids[#ids + 1] = id :: string end
        end
    end
    return ids
end

-- list: every declared preset, for the create UI.
function M.list(): (any?, any?)
    local entries, err = registry.find({ ["meta.type"] = consts.PRESET_META_TYPE })
    if err then return nil, err end
    local out: { any } = {}
    for _, e in ipairs(entries or {}) do
        local meta: any = e.meta or {}
        out[#out + 1] = {
            id = tostring(e.id),
            name = type(meta.title) == "string" and meta.title or tostring(e.id),
            description = type(meta.comment) == "string" and meta.comment or "",
            tool_ids = entry_tool_ids(e),
        }
    end
    return out, nil
end

-- Resolve a preset name (or full entry id). The found flag keeps an unknown
-- preset distinct from a valid preset whose tool bundle is intentionally empty.
function M.resolve(preset: any): ({ string }?, boolean, any?)
    if type(preset) ~= "string" or preset == "" then return {}, false, nil end
    local entries, err = registry.find({ ["meta.type"] = consts.PRESET_META_TYPE })
    if err then return nil, false, err end
    for _, e in ipairs(entries or {}) do
        local meta: any = e.meta or {}
        if tostring(e.id) == preset or meta.title == preset then
            return entry_tool_ids(e), true, nil
        end
    end
    return {}, false, nil
end

function M.apply(policy: any): (any?, any?)
    local out = {}
    for key, value in pairs(policy or {}) do out[key] = value end
    if out.preset == nil or out.preset == "" then return out, nil end
    local preset_ids, found, preset_err = M.resolve(out.preset)
    if preset_err then return nil, preset_err end
    if not found then
        return nil, errors.new({ message = "unknown preset: " .. tostring(out.preset),
            kind = errors.INVALID, retryable = false })
    end
    local ids = {}
    for _, id in ipairs(out.allowed_tool_ids or {}) do ids[#ids + 1] = id end
    for _, id in ipairs(preset_ids) do ids[#ids + 1] = id end
    local expanded, expansion_err = traits.expand_tool_ids(ids)
    if expansion_err then return nil, expansion_err end
    out.allowed_tool_ids = expanded
    out.allowed_trait_ids = out.allowed_trait_ids or {}
    out.restrict_traits = true
    return out, nil
end

return M
