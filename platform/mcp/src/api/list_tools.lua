-- GET /mcp/tools — the catalog of tools a credential can be allowed to surface, so
-- the create UI can offer a picker. Reads the live registry tool entries
-- (meta.type=tool); returns id + display name + description only.

local http = require("http")
local registry = require("registry")
local security = require("security")
local consts = require("mcp_consts")

local function tool_name(entry: any): string
    local meta: any = entry.meta or {}
    if type(meta.llm_alias) == "string" and meta.llm_alias ~= "" then
        return meta.llm_alias :: string
    end
    local id = tostring(entry.id)
    return (id:match("[^:%.]+$") or id)
end

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local entries, err = registry.find({ [".kind"] = "function.lua", ["meta.type"] = consts.TOOL_META_TYPE })
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "registry.find: " .. tostring(err) })
        return
    end

    local tools = {}
    for _, e in ipairs(entries or {}) do
        local meta: any = e.meta or {}
        local desc = meta.llm_description
        if type(desc) ~= "string" or desc == "" then desc = type(meta.comment) == "string" and meta.comment or "" end
        tools[#tools + 1] = { id = tostring(e.id), name = tool_name(e), description = desc, tags = meta.tags or {} }
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, tools = tools })
end

return { handler = handler }
