local http = require("http")
local registry = require("registry")
local system = require("system")

local M = {}

function M.describe(state, notices, runtime_version, application_id)
    local resolution = state and state.resolution
    if type(resolution) ~= "table" or type(resolution.modules) ~= "table" then
        return nil, "Installed module information is unavailable"
    end
    if type(notices) ~= "string" or notices == "" then
        return nil, "Third-party notices are unavailable"
    end
    local application_owner = nil
    for _, entry in ipairs(state.entries) do
        if tostring(entry.id) == application_id then
            application_owner = entry.registry.owner
            break
        end
    end
    local version = nil
    for _, module in ipairs(resolution.modules) do
        if module.name == application_owner then
            version = module.version
            break
        end
    end
    return { success = true, version = version, runtime_version = runtime_version, notices = notices }, nil
end

function M.handler()
    local res = http.response()
    if not res then return nil, "Failed to get HTTP context" end
    res:set_content_type("application/json")
    local snapshot, snapshot_err = registry.snapshot()
    if snapshot_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(snapshot_err) })
        return
    end
    local state, state_err = snapshot:state()
    if state_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(state_err) })
        return
    end
    local content, content_err = snapshot:get("kickside.settings:about_content")
    if content_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(content_err) })
        return
    end
    local info, info_err = M.describe(state, content.data.notices, system.version(), "app:definition")
    if info_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = info_err })
        return
    end
    res:write_json(info)
end

return M
