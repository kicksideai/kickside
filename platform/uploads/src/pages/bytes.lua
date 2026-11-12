-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local resources = require("resources")
local binding_errors = require("binding_errors")
local hash = require("hash")
local logger = require("logger")
local types = require("types")
local log = logger:named("uploads.storage")
local M = {}

local function storage_failure(cause: error): error
    log:warn("page source could not be read", {error = tostring(cause)})
    return errors.new({kind = cause:kind(), message = "page source could not be read",
        retryable = cause:retryable(), details = {code = (cause:details() or {}).code or "page_image_storage_failed"}})
end

function M.read(location: types.PageLocation, limit: integer, limit_code: string, checksum: string?): (string?, error?)
    if location.size and location.size > limit then
        return nil, binding_errors.new(errors.INVALID, "Content exceeds byte limit", limit_code)
    end
    local storage, storage_err = resources.get_storage(location.storage_id)
    if storage_err then return nil, storage_failure(storage_err) end
    local stat, stat_err = storage:stat(location.storage_path)
    if stat_err then return nil, storage_failure(stat_err) end
    if not stat or type(stat.size) ~= "number" then
        return nil, binding_errors.new(errors.INVALID, "Content size is unavailable", "page_image_storage_failed")
    end
    if stat.size > limit then return nil, binding_errors.new(errors.INVALID, "Content exceeds byte limit", limit_code) end
    local file, open_err = storage:open(location.storage_path, "r")
    if open_err then return nil, storage_failure(open_err) end
    local chunks: {string} = {}
    local length = 0
    local read_error: error?
    while length <= limit do
        local chunk, read_err = file:read(math.min(65536, limit + 1 - length))
        if read_err then
            if not errors.is(read_err, errors.NOT_FOUND) then read_error = read_err end
            break
        end
        if not chunk or #chunk == 0 then break end
        chunks[#chunks + 1] = chunk; length = length + #chunk
    end
    local _, close_err = file:close()
    local read_failure = read_error and storage_failure(read_error)
    local close_failure = close_err and storage_failure(close_err)
    if read_failure or close_failure then return nil, read_failure or close_failure end
    if length > limit then return nil, binding_errors.new(errors.INVALID, "Content exceeds byte limit", limit_code) end
    local bytes = table.concat(chunks)
    if checksum then
        local actual, hash_err = hash.sha256(bytes)
        if hash_err then return nil, hash_err end
        if actual ~= checksum then
            return nil, binding_errors.new(errors.INVALID, "Content checksum changes", "revision_mismatch")
        end
    end
    return bytes, nil
end

return M
