-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}
M.LEGACY_S3 = "uploads.s3"

local function invalid(message: string): any
    return errors.new({ message = message, kind = errors.INVALID, retryable = false,
        details = {code = "invalid_storage_path"} })
end

function M.is_legacy_key(storage_id: string, path: any): boolean
    return storage_id == M.LEGACY_S3 and type(path) == "string"
        and path:sub(1, 5) ~= "s3://" and path:sub(1, 5) ~= "fs://"
end

function M.parse(storage_id: string, path: any, legacy_cloud_id: string?): (any?, any?)
    if type(path) ~= "string" then return nil, invalid("Storage path must be a string") end
    if M.is_legacy_key(storage_id, path) then
        if type(legacy_cloud_id) ~= "string" or legacy_cloud_id == "" then
            return nil, errors.new({message = "S3 storage is not configured",
                kind = errors.UNAVAILABLE, retryable = false, details = {code = "s3_not_configured"}})
        end
        return {scheme = "s3", authority = legacy_cloud_id, key = path}, nil
    end
    local separator = path:find("://", 1, true)
    if not separator then
        return { scheme = "fs", authority = storage_id, key = path }, nil
    end
    local scheme = path:sub(1, separator - 1)
    if scheme ~= "fs" and scheme ~= "s3" then
        return nil, invalid("Unsupported storage scheme: " .. scheme)
    end
    local slash = path:find("/", separator + 3, true)
    if not slash or slash == separator + 3 or slash == #path then
        return nil, invalid("Packed storage path requires an entry id and path")
    end
    return {
        scheme = scheme,
        authority = path:sub(separator + 3, slash - 1),
        key = path:sub(slash + 1),
    }, nil
end

function M.packed(location: any): string
    return location.scheme .. "://" .. location.authority .. "/" .. location.key
end

return M
