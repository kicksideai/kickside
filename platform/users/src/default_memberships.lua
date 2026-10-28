local registry = require("registry")
local sources = require("user_group_sources_repo")
local consts = require("user_consts")

local M = {}

function M.run()
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "kickside.users.default_membership" })
    if err then error("default membership declarations unavailable: " .. tostring(err)) end
    for _, entry in ipairs(entries or {}) do
        local data = entry.data or entry
        local result, initialize_err = sources.initialize_default_group(data.group_id, tostring(entry.id))
        if initialize_err or not result then error("default membership initialization failed: " .. tostring(initialize_err)) end
    end
    for from, to in pairs(consts.get_config().membership_aliases) do
        local result, migrate_err = sources.upgrade_memberships(from, to)
        if migrate_err or not result then error("membership upgrade failed: " .. tostring(migrate_err)) end
    end
    return { status = "success" }
end

return M
