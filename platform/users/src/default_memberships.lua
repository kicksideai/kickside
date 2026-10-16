local registry = require("registry")
local sources = require("user_group_sources_repo")

local M = {}

function M.run()
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "kickside.users.default_membership" })
    if err then error("default membership declarations unavailable: " .. tostring(err)) end
    for _, entry in ipairs(entries or {}) do
        local data = entry.data or entry
        local result, initialize_err = sources.initialize_default_group(data.group_id, tostring(entry.id))
        if initialize_err or not result then error("default membership initialization failed: " .. tostring(initialize_err)) end
    end
    return { status = "success" }
end

return M
