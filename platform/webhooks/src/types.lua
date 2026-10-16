-- DB binding for kickside.webhooks. The persist layer reads db_id() so a target_db
-- rebind reaches it.

local registry = require("registry")

local M = {}

-- Registry entry whose meta.db_id holds the configured database resource. The
-- target_db ns.requirement rewrites that field per deployment.
M.DB_CONFIG = "kickside.webhooks:db_config"

function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

return M
