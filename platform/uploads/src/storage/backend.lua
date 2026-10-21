local fs = require("fs")
local cloudstorage = require("cloudstorage")
local uuid = require("uuid")
local registry = require("registry")
local locations = require("locations")
local M = {}

function M.staging(staging_id: string): (any?, string?, any?)
    local storage, open_err = fs.get(staging_id)
    if open_err then return nil, nil, open_err end
    local exists, exists_err = storage:exists(".upload-storage-tmp")
    if exists_err then return nil, nil, exists_err end
    if not exists then
        local _, mkdir_err = storage:mkdir(".upload-storage-tmp")
        if mkdir_err then
            local present = storage:exists(".upload-storage-tmp")
            if not present then return nil, nil, mkdir_err end
        end
    end
    return storage, ".upload-storage-tmp/" .. uuid.v4(), nil
end

local function remove_local(storage: any, path: string): (boolean?, any?)
    local ok, err = storage:remove(path)
    if err and (errors.is(err, errors.NOT_FOUND) or tostring(err):find("no such file or directory", 1, true)) then return true, nil end
    return ok, err
end

-- Native S3 downloads stream to a unique temporary file. The application sees
-- the same read/stat/seek interface as a local file; temporary bytes are removed
-- when it closes. No credentials or presigned URLs cross the content contract.
function M.cloud(resource_id: string, staging_id: string, etag: string?): any
    local function acquire(): (any?, any?) return cloudstorage.get(resource_id) end
    local adapter = {}
    function adapter:stat(path: string): (any?, any?)
        local storage, err = acquire()
        if err then return nil, err end
        local head, head_err = storage:head_object(path)
        storage:release()
        if head_err then return nil, head_err end
        return { size = head.size, name = path, is_dir = false, type = "file", modified = head.last_modified }, nil
    end
    function adapter:exists(path: string): (boolean, any?)
        local stat, err = self:stat(path)
        if err and not errors.is(err, errors.NOT_FOUND) then return false, err end
        return stat ~= nil, nil
    end
    function adapter:open(path: string, mode: string?): (any?, any?)
        if mode ~= nil and mode ~= "r" then
            return nil, errors.new({ message = "cloud file handles are read-only", kind = errors.INVALID })
        end
        local staging, temp_path, staging_err = M.staging(staging_id)
        if staging_err or not staging or not temp_path then return nil, staging_err or "Temporary storage unavailable" end
        local file, open_err = staging:open(temp_path, "wx")
        if open_err then return nil, open_err end
        local storage, storage_err = acquire()
        if storage_err then file:close(); remove_local(staging, temp_path); return nil, storage_err end
        local head, head_err = storage:head_object(path)
        if head_err then
            storage:release(); file:close(); remove_local(staging, temp_path); return nil, head_err
        end
        if etag and etag ~= "" and head.etag ~= etag then
            storage:release(); file:close(); remove_local(staging, temp_path)
            return nil, errors.new({ message = "stored object has changed", kind = errors.CONFLICT })
        end
        local _, download_err = storage:download_object(path, file, { if_match = head.etag })
        storage:release()
        if download_err then file:close(); remove_local(staging, temp_path); return nil, download_err end
        local _, writer_close_err = file:close()
        if writer_close_err then remove_local(staging, temp_path); return nil, writer_close_err end
        file, open_err = staging:open(temp_path, "r")
        if open_err then remove_local(staging, temp_path); return nil, open_err end
        local stat, stat_err = file:stat()
        local _, seek_err = file:seek("set", 0)
        if stat_err or seek_err or not stat or stat.size ~= head.size then
            file:close(); remove_local(staging, temp_path)
            return nil, stat_err or seek_err or errors.new({ message = "incomplete cloud download", kind = errors.INTERNAL })
        end
        local handle = {}
        function handle:read(size: any): (any?, any?) return file:read(size) end
        function handle:seek(whence: any, offset: any): (any?, any?) return file:seek(whence, offset) end
        function handle:stat(): (any?, any?) return file:stat() end
        function handle:scanner(split: any): (any?, any?) return file:scanner(split) end
        function handle:close(): (any?, any?)
            local ok, close_err = file:close()
            local _, remove_err = remove_local(staging, temp_path)
            return ok, close_err or remove_err
        end
        return handle, nil
    end
    function adapter:readfile(path: string): (string?, any?)
        local file, open_err = self:open(path, "r")
        if open_err then return nil, open_err end
        local chunks: { string } = {}
        while true do
            local chunk, read_err = file:read(1024 * 1024)
            if read_err then
                if errors.is(read_err, errors.NOT_FOUND) then break end
                file:close(); return nil, read_err
            end
            if not chunk or #chunk == 0 then break end
            chunks[#chunks + 1] = chunk
        end
        local _, close_err = file:close()
        if close_err then return nil, close_err end
        return table.concat(chunks), nil
    end
    function adapter:writefile(path: string, content: any): (any?, any?)
        local storage, err = acquire()
        if err then return nil, err end
        local ok, write_err = storage:upload_object(path, content)
        storage:release()
        return ok, write_err
    end
    function adapter:remove(path: string): (any?, any?)
        local storage, err = acquire()
        if err then return nil, err end
        local ok, delete_err = storage:delete_objects({ path })
        storage:release()
        return ok, delete_err
    end
    return adapter
end

function M.get(storage_id: string, db_id: string, staging_id: string, legacy_cloud_id: string?, query_db: any?): (any?, any?)
    local physical_id = storage_id == "uploads.s3" and legacy_cloud_id or storage_id
    local entry = physical_id and registry.get(physical_id) or nil
    if storage_id == "uploads.s3" or (entry and entry.kind == "cloudstorage.s3") then
        if not physical_id or physical_id == "" then return nil, "S3 storage is not configured" end
        return M.cloud(physical_id, staging_id), nil
    end
    local local_storage, local_err = fs.get(storage_id)
    if local_err then return nil, local_err end
    local adapter = {}
    local function resolve(path: string): (any?, string?, any?)
        local location, err = locations.get(db_id, storage_id, path, query_db)
        if err then return nil, nil, err end
        if location and location.state == "ready" then
            return M.cloud(location.resource_id, staging_id, location.etag), location.object_key, nil
        end
        return local_storage, path, nil
    end
    -- A placement can commit and unlink local bytes after resolution but before
    -- the filesystem operation. Re-resolve a local miss once so readers cross
    -- that handoff without a transient NOT_FOUND. Other IO errors stay intact.
    local function read(method: string, path: string, ...: any): (any?, any?)
        local storage, key, err = resolve(path)
        if err then return nil, err end
        local value, io_err = storage[method](storage, key, ...)
        local missing = (method == "exists" and value == false and io_err == nil)
            or (io_err ~= nil and errors.is(io_err, errors.NOT_FOUND))
        if storage ~= local_storage or not missing then return value, io_err end
        local current, current_key, current_err = resolve(path)
        if current_err then return nil, current_err end
        if current == local_storage then return value, io_err end
        return current[method](current, current_key, ...)
    end
    function adapter:open(path: string, mode: string?): (any?, any?)
        if mode == nil or mode == "r" then return read("open", path, "r") end
        local storage, key, err = resolve(path)
        if err then return nil, err end
        return storage:open(key, mode or "r")
    end
    function adapter:readfile(path: string): (any?, any?)
        return read("readfile", path)
    end
    function adapter:writefile(path: string, content: any): (any?, any?)
        local location, err = locations.get(db_id, storage_id, path, query_db)
        if err then return nil, err end
        if location then return nil, errors.new({ message = "placed content is immutable", kind = errors.CONFLICT }) end
        return local_storage:writefile(path, content)
    end
    function adapter:stat(path: string): (any?, any?)
        return read("stat", path)
    end
    function adapter:exists(path: string): (any?, any?)
        local present, err = read("exists", path)
        return present == true, err
    end
    function adapter:remove(path: string): (any?, any?)
        local location, err = locations.get(db_id, storage_id, path, query_db)
        if err then return nil, err end
        if location then
            local _, delete_err = M.cloud(location.resource_id, staging_id):remove(location.object_key)
            if delete_err then return nil, delete_err end
        end
        -- Keep the placement as a durable orphan-cleanup record until the owner
        -- deletes its upload/blob row. No nested writer transaction is needed.
        return remove_local(local_storage, path)
    end
    return adapter, nil
end

return M
