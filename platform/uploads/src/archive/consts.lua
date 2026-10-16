local registry = require("registry")

-- Deployment-tunable limits for transparent archive unpacking. The values live on
-- the kickside.uploads.archive:config entry's meta, rewritten per deployment by the
-- archive_max_zip_bytes ns.requirement -- so operators tune the cap without editing
-- code. Defaults below apply only when the config entry/field is unset.

local M = {}

M.CONFIG = "kickside.uploads.archive:config"

-- The archive is read whole into memory, so this bounds the largest zip accepted.
local DEFAULT_MAX_ZIP_BYTES = 2 * 1024 * 1024 * 1024

local function config_meta(): any
    local entry = registry.get(M.CONFIG)
    if entry and (entry :: any).meta then return (entry :: any).meta end
    return {}
end

-- max_zip_bytes resolves the configured archive byte cap, falling back to the
-- default when the requirement has not rewritten it.
function M.max_zip_bytes(): number
    local v = tonumber(config_meta().max_zip_bytes)
    if v and v > 0 then return v end
    return DEFAULT_MAX_ZIP_BYTES
end

-- Nested-zip recursion ceiling. High by default so legitimately deep archives unpack to
-- full depth; the zip-bomb guards are the member-count and uncompressed-size caps in the
-- processor, not depth. Deployment-tunable via the config entry's max_archive_depth field.
local DEFAULT_MAX_ARCHIVE_DEPTH = 64

function M.max_archive_depth(): number
    local v = tonumber(config_meta().max_archive_depth)
    if v and v > 0 then return v end
    return DEFAULT_MAX_ARCHIVE_DEPTH
end

return M
