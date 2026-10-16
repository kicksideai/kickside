local registry = require("registry")
local errors = require("errors")

type StorageConfig = { storage_id: string? }
type StorageConfigEntry = { data: StorageConfig? }

local M = {}

M.CONFIG = "kickside.skills:storage_config"

function M.id(): (string?, error?)
    local entry, err = registry.get(M.CONFIG)
    if err then return nil, err end
    if not entry then return nil, errors.new({kind = errors.UNAVAILABLE, message = "storage config missing"}) end
    local data = (entry :: StorageConfigEntry).data
    if type(data) ~= "table" then
        return nil, errors.new({kind = errors.UNAVAILABLE, message = "skill storage requirement missing"})
    end
    if type(data.storage_id) ~= "string" or data.storage_id == "" then
        return nil, errors.new({kind = errors.UNAVAILABLE, message = "skill storage requirement missing"})
    end
    return data.storage_id, nil
end

return M
