-- Shared constants for the transfer module. scratch_storage()/SCRATCH_DIR is the
-- filesystem the orchestrator and import endpoint stage envelope/upload bytes into
-- (always removed after use). PORTABLE_CONTRACT is the instance contract used to
-- detect data-bearing components and open them for export/import_into.

local registry = require("registry")

type StorageConfig = { storage_id: string? }
type StorageConfigEntry = { data: StorageConfig? }

local M = {}

M.STORAGE_CONFIG = "kickside.transfer:storage_config"
M.SCRATCH_DIR = "transfer"
M.PORTABLE_CONTRACT = "kickside.contract:portable"

function M.scratch_storage(): string
    local entry = select(1, registry.get(M.STORAGE_CONFIG)) :: StorageConfigEntry
    local data = entry.data or (entry :: StorageConfig)
    return data.storage_id :: string
end

return M
