local registry = require("registry")

local M = {}

M.PROCESS_CONFIG = "kickside.oauth:process_config"

function M.process_host(): string
    local entry = select(1, registry.get(M.PROCESS_CONFIG)) :: any
    return entry.meta.host_id :: string
end

return M
