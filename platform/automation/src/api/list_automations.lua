-- GET /api/v1/automations — thin HTTP wrapper around
-- automations_lib.list_installed. Optional ?class=<tag> filters by
-- meta.class entries. Optional ?parent_id=<component> scopes the same canonical
-- rows to Automations placed under one owning component.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

local M = {}

local function query_options(query)
    local options = {}
    for key, value in pairs(query) do options[key] = value end
    for _, key in ipairs({"limit", "offset"}) do
        if query[key] ~= nil then
            local value = tonumber(query[key])
            if not value or value < 0 or value ~= math.floor(value) then
                return nil, errors.new({kind = errors.INVALID, message = key .. " must be a non-negative integer"})
            end
            options[key] = value
        end
    end
    return options, nil
end

function M.handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = api_errors.error("authentication_required", "authentication required") })
        return
    end

    local options, err = query_options({
        actor_id = actor:id(),
        class = req:query("class"),
        parent_id = req:query("parent_id"),
        limit = req:query("limit"),
        offset = req:query("offset"),
        source_port = req:query("source_port"),
        source_thread_id = req:query("source_thread_id"),
        source_filter = req:query("source_filter"),
    })
    local automations
    if not err then automations, err = automations_lib.list_installed(options) end
    if err then
        local status, payload = api_errors.status(err, "automation_list_failed", "could not list automations")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #automations,
        automations = automations,
    })
end

return M
