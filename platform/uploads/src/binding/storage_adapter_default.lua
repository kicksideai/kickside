local fs = require("fs")
local cloudstorage = require("cloudstorage")
local uuid = require("uuid")
local time = require("time")
local logger = require("logger")
local log = logger:named("uploads.storage")
local storage_location = require("storage_location")

local M = {}
local SIGNED_URL_EXPIRATION = 15 * 60

local function invalid(message: string): any
    return errors.new({ message = message, kind = errors.INVALID, retryable = false })
end

local function cloud_open(storage: any, key: string, volume: any, mode: string?): (any?, any?)
    if mode ~= nil and mode ~= "r" then
        storage:release()
        return nil, invalid("Cloud file handles are read-only")
    end
    local head, head_err = storage:head_object(key)
    if head_err then storage:release(); return nil, head_err end
    local path = ".upload-read-" .. uuid.v4()
    local writer, writer_err = volume:open(path, "wx")
    if writer_err then storage:release(); return nil, writer_err end
    local _, download_err = storage:download_object(key, writer, { if_match = head.etag })
    storage:release()
    local _, close_err = writer:close()
    if download_err or close_err then
        local _, remove_err = volume:remove(path)
        if remove_err then log:warn("Upload read temporary removal failed", {error = tostring(remove_err)}) end
        if download_err and close_err then log:warn("Upload read writer close failed", {error = tostring(close_err)}) end
        return nil, download_err or close_err
    end
    local reader, read_err = volume:open(path, "r")
    if read_err then
        local _, remove_err = volume:remove(path)
        if remove_err then log:warn("Upload read temporary removal failed", {error = tostring(remove_err)}) end
        return nil, read_err
    end
    local handle: any = {}
    function handle:read(size) return reader:read(size) end
    function handle:seek(whence, offset) return reader:seek(whence, offset) end
    function handle:stat() return reader:stat() end
    function handle:scanner(split) return reader:scanner(split) end
    function handle:close()
        local ok, err = reader:close()
        local _, remove_err = volume:remove(path)
        if err and remove_err then log:warn("Upload read temporary removal failed", {error = tostring(remove_err)}) end
        return ok, err or remove_err
    end
    return handle, nil
end

function M.get(storage_id: string, _db_id: string, _staging_id: string, _legacy_cloud_id: string?, _query_db: any?): (any?, any?)
    local volume, volume_err = fs.get(storage_id)
    if volume_err then return nil, volume_err end
    local adapter: any = {}
    local function resolve(path: string): (any?, string?, string?, any?)
        local location, location_err = storage_location.parse(storage_id, path)
        if location_err or not location then return nil, nil, nil, location_err end
        if path == location.key then return volume, location.key, location.scheme, nil end
        if location.scheme == "fs" then
            local storage, err = fs.get(location.authority)
            return storage, location.key, location.scheme, err
        end
        -- Remove after wippyai/runtime#1018 returns acquisition errors.
        local ok, storage, err = pcall(cloudstorage.get, location.authority)
        if not ok then
            return nil, nil, nil, errors.new({message = tostring(storage), kind = errors.PERMISSION_DENIED, retryable = false})
        end
        return storage, location.key, location.scheme, err
    end
    function adapter:signed_url(path: string, options: any?): (string?, number?, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return nil, nil, err end
        if scheme == "fs" then return nil, nil, nil end
        local expiration = options and options.expiration or SIGNED_URL_EXPIRATION
        local expires_at = time.now():unix() + expiration
        local url, sign_err = storage:presigned_get_url(key, {expiration = expiration})
        storage:release()
        if sign_err then return nil, nil, sign_err end
        return url, expires_at, nil
    end
    function adapter:open(path: string, mode: string?): (any?, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return nil, err end
        if scheme == "fs" then return storage:open(key, mode) end
        return cloud_open(storage, key :: string, volume, mode)
    end
    function adapter:stat(path: string): (any?, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return nil, err end
        if scheme == "fs" then return storage:stat(key) end
        local head, head_err = storage:head_object(key)
        storage:release()
        if head_err then return nil, head_err end
        return { size = head.size, name = key, is_dir = false, type = "file", modified = head.last_modified }, nil
    end
    function adapter:exists(path: string): (boolean, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return false, err end
        if scheme == "fs" then return storage:exists(key) end
        local head, head_err = storage:head_object(key)
        storage:release()
        if head_err and not errors.is(head_err, errors.NOT_FOUND) then return false, head_err end
        return head ~= nil, nil
    end
    function adapter:readfile(path: string): (string?, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return nil, err end
        if scheme == "fs" then return storage:readfile(key) end
        local reader, open_err = cloud_open(storage, key :: string, volume, "r")
        if open_err then return nil, open_err end
        local chunks = {}
        while true do
            local chunk, read_err = reader:read(1024 * 1024)
            if read_err and not errors.is(read_err, errors.NOT_FOUND) then
                local _, close_err = reader:close()
                if close_err then log:warn("Upload read handle close failed", {error = tostring(close_err)}) end
                return nil, read_err
            end
            if not chunk or #chunk == 0 then break end
            chunks[#chunks + 1] = chunk
        end
        local _, close_err = reader:close()
        if close_err then return nil, close_err end
        return table.concat(chunks), nil
    end
    function adapter:remove(path: string): (any?, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return nil, err end
        if scheme == "fs" then return storage:remove(key) end
        local value, remove_err = storage:delete_objects({ key })
        storage:release()
        return value, remove_err
    end
    function adapter:writefile(path: string, content: any, options: any): (any?, any?)
        local storage, key, scheme, err = resolve(path)
        if err then return nil, err end
        if scheme == "fs" then return storage:writefile(key, content, options) end
        if options ~= nil then
            storage:release()
            return nil, invalid("Cloud writefile does not accept filesystem write options")
        end
        local value, write_err = storage:upload_object(key, content, {})
        storage:release()
        return value, write_err
    end
    for _, method in ipairs({ "mkdir", "readdir", "isdir", "chdir" }) do
        adapter[method] = function(_self, path, ...)
            local storage, key, scheme, err = resolve(path)
            if err then return nil, err end
            if scheme == "fs" then return storage[method](storage, key, ...) end
            storage:release()
            return nil, invalid("Cloud storage does not support " .. method)
        end
    end
    function adapter:pwd() return volume:pwd() end
    adapter.read_file = adapter.readfile
    adapter.write_file = adapter.writefile
    return adapter, nil
end

return M
