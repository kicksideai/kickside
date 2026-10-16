local registry = require("registry")

local M = {
    CONFIG = "kickside.core:db_config",
}

local function invalid_config(field: string): error
    return errors.new({message = "Core database configuration is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "core_database_config", field = field, entry = M.CONFIG}})
end

-- Namespace expansion rewrites this registry entry together with every core
-- migration. Runtime callers resolve it instead of maintaining an independent
-- environment knob that could point at a different database than the schema.
function M.id(): string
    local entry, err = registry.get(M.CONFIG)
    if err then error(errors.wrap(err, "Core database configuration unavailable")) end
    if type(entry) ~= "table" then error(invalid_config("entry")) end
    if type(entry.meta) ~= "table" then error(invalid_config("meta")) end
    local db_id = entry.meta.db_id
    if type(db_id) ~= "string" or db_id == "" then error(invalid_config("meta.db_id")) end
    return db_id
end

return M
