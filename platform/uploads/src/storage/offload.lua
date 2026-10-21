local fs = require("fs")
local cloudstorage = require("cloudstorage")
local hash = require("hash")
local time = require("time")
local backend = require("backend")
local locations = require("locations")
local resources = require("uploads_resources")
local storage_types = require("storage_types")
local M = {}

-- Constant-memory integrity check. This is a versioned chain of SHA-256 chunk
-- digests, not the public content SHA-256 used by artifact deduplication.
function M.fingerprint(file: any): (string?, number?, any?)
    local stat, stat_err = file:stat()
    if stat_err or not stat then return nil, nil, stat_err or "Could not inspect source" end
    local digest = "kickside-upload-placement-v1"
    local total = 0
    while true do
        local chunk, err = file:read(1024 * 1024)
        if err then
            if errors.is(err, errors.NOT_FOUND) then break end
            return nil, nil, err
        end
        if not chunk or #chunk == 0 then break end
        total = total + #chunk
        local chunk_digest, chunk_err = hash.sha256(chunk)
        if chunk_err then return nil, nil, chunk_err end
        local next_digest, digest_err = hash.sha256(digest .. chunk_digest)
        if digest_err then return nil, nil, digest_err end
        digest = next_digest
    end
    if total ~= stat.size then return nil, nil, "File changed or ended before its expected size" end
    return digest, total, nil
end

local function remove_local(storage: any, path: string): any
    local _, err = storage:remove(path)
    if err and not errors.is(err, errors.NOT_FOUND) and not tostring(err):find("no such file or directory", 1, true) then return err end
    return nil
end

function M.place(object: storage_types.Object, policy: storage_types.Policy, options: storage_types.CopyOptions?): (storage_types.Placement?, any?)
    local function guard(): (boolean?, any?)
        if type(options) == "table" and type(options.should_continue) == "function" then return options.should_continue() end
        return true, nil
    end
    local db_id = resources.get_db_id()
    local entry, entry_err = resources.storage_entry(object.storage_id)
    if entry_err then return nil, entry_err end
    -- Already-cloud originals (direct uploads) need no local reclamation.
    if entry and entry.kind == "cloudstorage.s3" then return { skipped = true }, nil end
    local source, source_err = fs.get(object.storage_id)
    if source_err then return nil, source_err end
    local location, claim_err = locations.claim(db_id, object.storage_id, object.storage_path, policy.resource_id, policy.prefix)
    if claim_err then return nil, claim_err end
    if location.state == "ready" then
        local valid, cancelled = guard()
        if not valid then return nil, cancelled end
        local cleanup_err = remove_local(source, object.storage_path)
        return cleanup_err == nil and { placed = true } or nil, cleanup_err
    end

    local file, open_err = source:open(object.storage_path, "r")
    if open_err then return nil, open_err end
    local digest, size, digest_err = M.fingerprint(file)
    if digest_err or not digest or not size then file:close(); return nil, digest_err or "Could not fingerprint source" end
    local _, seek_err = file:seek("set", 0)
    if seek_err then file:close(); return nil, seek_err end
    local cloud, cloud_err = cloudstorage.get(location.resource_id)
    if cloud_err then file:close(); return nil, cloud_err end
    local _, upload_err = cloud:upload_object(location.object_key, file, {
        content_type = object.mime_type or "application/octet-stream",
        metadata = { ["kickside-verification"] = digest },
    })
    local _, close_err = file:close()
    if upload_err or close_err then cloud:release(); return nil, upload_err or close_err end
    local head, head_err = cloud:head_object(location.object_key)
    if head_err or not head or head.size ~= size or type(head.etag) ~= "string" or head.etag == "" then
        cloud:release(); return nil, head_err or "Stored object size or ETag does not match"
    end

    -- Verify actual returned bytes under the ETag before the location becomes
    -- authoritative. Multipart ETags are not content checksums.
    local staging, temp_path, staging_err = backend.staging(resources.get_storage_id())
    if staging_err or not staging or not temp_path then cloud:release(); return nil, staging_err or "Temporary storage unavailable" end
    local verify, verify_err = staging:open(temp_path, "wx")
    if verify_err then cloud:release(); return nil, verify_err end
    local _, download_err = cloud:download_object(location.object_key, verify, { if_match = head.etag })
    cloud:release()
    local remote_digest, remote_size, fingerprint_err
    local _, verify_close_err = verify:close()
    if not download_err and not verify_close_err then
        verify, verify_err = staging:open(temp_path, "r")
        if verify_err then fingerprint_err = verify_err
        else
            remote_digest, remote_size, fingerprint_err = M.fingerprint(verify)
            local _, reader_close_err = verify:close()
            verify_close_err = reader_close_err
        end
    end
    local temp_err = remove_local(staging, temp_path)
    if download_err or fingerprint_err or verify_close_err or temp_err then
        return nil, download_err or fingerprint_err or verify_close_err or temp_err
    end
    if remote_digest ~= digest or remote_size ~= size then return nil, "Stored object integrity verification failed" end
    local valid, cancelled = guard()
    if not valid then return nil, cancelled end
    local committed, commit_err = locations.ready(db_id, location, size, digest, head.etag)
    if commit_err then return nil, commit_err end
    if not committed then
        local current, current_err = locations.get(db_id, object.storage_id, object.storage_path)
        if current_err then return nil, current_err end
        if not current or current.state ~= "ready" then return nil, "File was removed while placement was running" end
    end
    local cleanup_err = remove_local(source, object.storage_path)
    if cleanup_err then return nil, cleanup_err end
    return { placed = true }, nil
end

function M.prune(cutoff: string, limit: integer): (number?, any?)
    local db_id = resources.get_db_id()
    local rows, query_err = locations.orphans(db_id, cutoff, limit)
    if query_err then return nil, query_err end
    local count = 0
    for _, location in ipairs(rows) do
        local cloud, open_err = cloudstorage.get(location.resource_id)
        if open_err then return nil, open_err end
        local _, delete_err = cloud:delete_objects({ location.object_key })
        cloud:release()
        if delete_err then return nil, delete_err end
        local source, source_err = fs.get(location.storage_id)
        if source_err then return nil, source_err end
        local cleanup_err = remove_local(source, location.storage_path)
        if cleanup_err then return nil, cleanup_err end
        local _, forget_err = locations.forget(db_id, location)
        if forget_err then return nil, forget_err end
        count = count + 1
    end
    local staging, staging_err = fs.get(resources.get_storage_id())
    if staging_err then return nil, staging_err end
    local exists, exists_err = staging:exists(".upload-storage-tmp")
    if exists_err then return nil, exists_err end
    if exists then
        local iter, state = staging:readdir(".upload-storage-tmp")
        if not iter then return nil, state end
        local removed = 0
        for entry in iter, state do
            if removed >= limit then break end
            local path = ".upload-storage-tmp/" .. entry.name
            local stat, stat_err = staging:stat(path)
            if stat_err then return nil, stat_err end
            if stat and not stat.is_dir and tonumber(stat.modified) < time.now():unix() - 86400 then
                local remove_err = remove_local(staging, path)
                if remove_err then return nil, remove_err end
                removed = removed + 1
            end
        end
    end
    return count, nil
end

return M
