-- GET /renderers — the renderer descriptors the <wc-resource-view> host
-- dispatches over. Renderers are a registry concern: a viewer is added by
-- registering a kickside.renderer entry, not by editing the host. Descriptors
-- use component_tag so only view.component rows own meta.tag_name.

local http = require("http")
local registry = require("registry")

local RENDERER_META_TYPE = "kickside.renderer"

local function is_tag(value)
    return type(value) == "string"
        and #value <= 80
        and string.match(value, "^[a-z][a-z0-9]*%-[a-z0-9][a-z0-9%-]*$") ~= nil
        and string.match(value, "%-$") == nil
end

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = RENDERER_META_TYPE,
    })
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "failed to load renderers" })
        return
    end

    local renderers = {}
    for _, entry in ipairs(entries or {}) do
        local m = (type(entry.meta) == "table") and entry.meta or {}
        local types = m.content_types
        local component_tag = m.component_tag
        if is_tag(component_tag) and type(types) == "table" and #types > 0 then
            local clean = {}
            for _, t in ipairs(types) do
                if type(t) == "string" and t ~= "" then clean[#clean + 1] = t end
            end
            if #clean > 0 then
                renderers[#renderers + 1] = {
                    tag_name = component_tag,
                    label = (type(m.title) == "string" and m.title) or component_tag,
                    priority = tonumber(m.priority) or 0,
                    content_types = clean,
                }
            end
        end
    end

    table.sort(renderers, function(a, b)
        if a.priority ~= b.priority then return a.priority > b.priority end
        return tostring(a.tag_name) < tostring(b.tag_name)
    end)

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, renderers = renderers })
end

return {
    RENDERER_META_TYPE = RENDERER_META_TYPE,
    handler = handler,
}
