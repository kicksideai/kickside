local registry = require("registry")

local M = {}
local ENTRY = "kickside.uploads:policy"
local DAY_MS = 86400000

local function invalid(message: string): error
    return (errors.new({ message = ENTRY .. ": " .. message, kind = errors.INVALID }) :: error)
end

function M.resolve(meta: any): (any?, error?)
    local retention = type(meta) == "table" and meta.retention or nil
    if type(retention) ~= "table" then return nil, invalid("retention section is required") end
    local raw = retention.deleted_read_model
    if type(raw) ~= "string" then return nil, invalid("retention.deleted_read_model must be a duration") end
    local days = string.match(raw, "^(%d+)d$")
    local n = days and tonumber(days) or nil
    if not n or n < 1 or n > 365 then
        return nil, invalid("retention.deleted_read_model must be 1d..365d")
    end
    local batch = retention.batch_deleted_read_model
    if type(batch) ~= "number" or batch ~= math.floor(batch) or batch < 1 or batch > 500 then
        return nil, invalid("retention.batch_deleted_read_model must be an integer in [1,500]")
    end
    local blob_days = type(retention.orphan_blob) == "string"
        and tonumber(string.match(retention.orphan_blob, "^(%d+)d$")) or nil
    if not blob_days or blob_days < 1 or blob_days > 365 then
        return nil, invalid("retention.orphan_blob must be 1d..365d")
    end
    local blob_batch = retention.batch_orphan_blob
    if type(blob_batch) ~= "number" or blob_batch ~= math.floor(blob_batch)
        or blob_batch < 1 or blob_batch > 500 then
        return nil, invalid("retention.batch_orphan_blob must be an integer in [1,500]")
    end
    return { deleted_read_model_ms = n * DAY_MS, batch_deleted_read_model = batch,
        orphan_blob_ms = blob_days * DAY_MS, batch_orphan_blob = blob_batch }, nil
end

function M.policy(): (any?, error?)
    local entry, get_err = registry.get(ENTRY)
    if get_err or type(entry) ~= "table" then
        return nil, (errors.new({ message = ENTRY .. " unavailable: " .. tostring(get_err),
            kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    return M.resolve(entry.meta)
end

return M
