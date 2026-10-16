local http = require("http")
local security = require("security")
local registry = require("registry")

-- Namespaces a user can scope a master agent to, for the namespace picker. Two
-- kinds, derived only from what the user can see (the registry hides private and
-- out-of-scope entries by default):
--   trait   the namespaces of the public traits the curator could activate.
--   agent   the synthetic `user_agent` (the user's own agents) plus the
--           namespaces of the public system agents the roster could reach.
-- A namespace is everything before an id's last colon, matching master_ns.

local TRAIT_TYPE = "agent.trait"
local AGENT_TYPE = "agent.gen1"
local DEFAULT_CLASS = "public"

local function namespace_of(id)
    if type(id) ~= "string" then return "" end
    local ns = id:match("^(.*):")
    return ns or ""
end

local function class_is_public(class)
    if class == nil or class == "" or class == DEFAULT_CLASS then return true end
    if type(class) == "table" then
        for _, c in ipairs(class) do
            if c == DEFAULT_CLASS then return true end
        end
    end
    return false
end

-- Distinct namespaces of public, non-private entries of a registry type,
-- accumulated into seen so callers can collect several kinds without duplicates.
local function collect(meta_type, predicate, seen, out, kind)
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = meta_type })
    if err or not entries then return end
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        if not meta.private and meta.public == true and predicate(meta) then
            local ns = namespace_of(entry.id)
            if ns ~= "" and not seen[ns] then
                seen[ns] = true
                out[#out + 1] = { id = ns, label = ns, kind = kind }
            end
        end
    end
end

local function handler()
    local res = http.response()
    if not res then return end
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local seen = {}
    local namespaces = {}

    -- The user's own agents live under the synthetic user_agent namespace.
    seen["user_agent"] = true
    namespaces[#namespaces + 1] = { id = "user_agent", label = "Your agents", kind = "agent" }

    collect(AGENT_TYPE, function(meta) return class_is_public(meta.class) end, seen, namespaces, "agent")
    collect(TRAIT_TYPE, function(_meta) return true end, seen, namespaces, "trait")

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, count = #namespaces, namespaces = namespaces })
end

return { handler = handler }
