-- GET /ui/contributions?types=ui.command,ui.xyz — the single discovery endpoint
-- for declarative UI contributions. Returns { contributions: { [type] = [records] } }
-- for the requested ui.* types. Modules add a new contribution kind by declaring
-- registry entries with that meta.type; the shell asks for the type — no new
-- endpoint, library, or security grant per kind.

local http = require("http")
local contributions = require("contributions")

local MAX_TYPES = 16

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local types_param = req:query("types") or ""
    local types: { string } = {}
    for t in string.gmatch(types_param, "([^,]+)") do
        local trimmed = (t:gsub("^%s+", ""):gsub("%s+$", ""))
        if trimmed ~= "" and #types < MAX_TYPES then
            types[#types + 1] = trimmed
        end
    end

    if #types == 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "types query parameter is required (comma-separated ui.* types)",
        })
        return
    end

    local collected, err = contributions.collect(types)
    if err then return nil, err end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, contributions = collected })
end

return { handler = handler }
