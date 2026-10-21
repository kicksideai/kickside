local uploads_resources = require("uploads_resources")
local funcs = require("funcs")
local upload_type = require("upload_type")
local logger = require("logger")
local consts = require("consts")
local zip_reader = require("zip_reader")
local upload_lib = require("upload_lib")
local upload_query_repo = require("upload_query_repo")

-- Archive processor: transparent zip support. Each member is extracted and pushed
-- back through the normal upload path (upload_lib.upload_file), so it is typed and
-- pipelined exactly as if uploaded directly -- a CSV inside a zip is handled like a
-- top-level CSV, a nested zip re-enters this processor (bounded by depth). The zip
-- upload itself becomes a container record listing its members for provenance and
-- cascade delete; it produces no content artifacts of its own.

local log = logger:named("uploads.archive")

-- nested-zip recursion ceiling is deployment-tunable via consts.max_archive_depth()
local MAX_MEMBERS = 10000                          -- members per archive
local MAX_TOTAL_UNCOMP = 16 * 1024 * 1024 * 1024   -- declared expansion ceiling (bomb guard)
local MAX_ENTRY_UNCOMP = 2 * 1024 * 1024 * 1024    -- per-member decompressed cap
local MAX_SKIPPED_ENTRY_DETAILS = 500
-- The archive byte cap (whole file is read into memory) is deployment-configurable
-- via the kickside.uploads:archive_max_zip_bytes requirement; consts reads it.

-- Metadata keys never inherited by members: per-file identity and internal
-- fields. Upload completion tokens are deliberately copied to members so a
-- KB-targeted zip ingests the extracted files, not the container.
local INHERIT_SKIP = { filename = true, original_filename = true, _execution_identity = true }

-- Reject absolute paths and parent-directory traversal (zip-slip); return a clean
-- relative path or nil.
local function safe_relpath(name: string): string?
    local p = name:gsub("\\", "/")
    if p == "" or p:sub(1, 1) == "/" then return nil end
    for seg in p:gmatch("[^/]+") do
        if seg == ".." then return nil end
    end
    return p
end

local function basename(p: string): string
    return p:match("[^/]+$") or p
end

local function child_metadata(parent_meta: any, relpath: string, depth: number, parent_upload_id: string): { [string]: any }
    local out: { [string]: any } = {}
    if type(parent_meta) == "table" then
        for k, v in pairs(parent_meta) do
            local key = tostring(k)
            if not INHERIT_SKIP[k] and (key:sub(1, 2) ~= "__" or key == "__upload_token" or key == "__upload_tokens") then
                out[k] = v
            end
        end
    end
    out.parent_upload_id = parent_upload_id
    out.archive_path = relpath
    out.archive_depth = depth
    -- Carry the originating archive's name down every member, inherited unchanged through
    -- nested archives, so a consumer can group an unpacked tree under a folder named after
    -- the zip. filename is INHERIT_SKIP'd, so the top archive's name is read directly.
    out.archive_root = (type(parent_meta) == "table" and (parent_meta.archive_root or parent_meta.filename)) or nil
    return out
end

local function process(params: any): any
    if not params.upload_id or not params.storage_id or not params.storage_path then
        error("missing required parameters")
    end

    local upload_id = params.upload_id :: string
    local parent_meta = type(params.metadata) == "table" and params.metadata or {}
    local depth = tonumber(parent_meta.archive_depth) or 0

    -- Stop expanding past the nesting ceiling; the container still completes.
    if depth >= consts.max_archive_depth() then
        log:warn("archive nesting depth reached, not expanding", { upload_id = upload_id, depth = depth })
        return {
            success = true,
            metadata = { archive = true, archive_member_count = 0, archive_note = "max nesting depth reached" },
        }
    end

    local upload, get_err = upload_query_repo.get(upload_id)
    if get_err or not upload then
        error("failed to load upload record: " .. tostring(get_err))
    end
    local actor_id = tostring(upload.actor_id)
    local trace_context = type(params.trace_context) == "table" and params.trace_context or upload.trace_context

    -- Reject oversize archives before reading them into memory. The cap is
    -- deployment-configurable via the archive_max_zip_bytes requirement.
    local max_zip_bytes = consts.max_zip_bytes()
    local declared = tonumber(params.size)
    if declared and declared > max_zip_bytes then
        error("archive too large: " .. tostring(declared) .. " bytes (max " .. tostring(max_zip_bytes) .. ")")
    end

    local storage = uploads_resources.get_storage(params.storage_id :: string)
    if not storage then error("failed to get storage") end
    if not storage:exists(params.storage_path :: string) then error("file does not exist in storage") end

    local bytes = storage:readfile(params.storage_path :: string)
    if type(bytes) ~= "string" or bytes == "" then error("failed to read archive") end
    if #bytes > max_zip_bytes then
        error("archive too large: " .. tostring(#bytes) .. " bytes (max " .. tostring(max_zip_bytes) .. ")")
    end

    local entries, list_err = zip_reader.list(bytes)
    if not entries then error("not a readable zip: " .. tostring(list_err)) end

    -- Bomb guards from the central directory (cheap, before any decompression).
    local total_uncomp = 0
    local file_count = 0
    for _, e in ipairs(entries) do
        if not e.is_dir then
            total_uncomp = total_uncomp + (tonumber(e.uncomp_size) or 0)
            file_count = file_count + 1
        end
    end
    if file_count > MAX_MEMBERS then
        error("archive has too many members: " .. tostring(file_count) .. " (max " .. tostring(MAX_MEMBERS) .. ")")
    end
    if total_uncomp > MAX_TOTAL_UNCOMP then
        error("archive expands too large: " .. tostring(total_uncomp) .. " bytes")
    end

    local paths: { string } = {}
    for _, entry in ipairs(entries) do
        local path = safe_relpath(tostring(entry.name))
        if not entry.is_dir and not entry.encrypted and path then paths[#paths + 1] = path end
    end
    local preparers, prepare_err = upload_type.get_archive_preparers()
    if prepare_err then error("archive preparation discovery failed: " .. tostring(prepare_err)) end
    local member_metadata: { [string]: any } = {}
    for _, stage in ipairs(preparers) do
        local prepared, err = funcs.new():call(stage.func, {
            upload_id = upload_id, metadata = parent_meta, archive_members = paths,
        })
        if err or not prepared or prepared.success ~= true then
            error("archive preparation failed: " .. tostring(err or (prepared and prepared.error) or "missing success"))
        end
        if prepared.members ~= nil then
            if type(prepared.members) ~= "table" then error("archive preparation members must be a table") end
            for _, path in ipairs(paths) do
                local fields = prepared.members[path]
                if fields ~= nil then
                    if type(fields) ~= "table" then error("archive preparation member metadata must be a table") end
                    local merged = member_metadata[path] or {}
                    for key, value in pairs(fields) do merged[key] = value end
                    member_metadata[path] = merged
                end
            end
        end
    end

    local child_ids: { string } = {}
    local skipped = 0
    local skipped_entries: { table } = {}
    local skipped_truncated = false
    local function record_skip(name: any, reason: string, detail: any?)
        skipped = skipped + 1
        if #skipped_entries < MAX_SKIPPED_ENTRY_DETAILS then
            skipped_entries[#skipped_entries + 1] = {
                name = tostring(name or ""),
                reason = reason,
                detail = detail and tostring(detail) or nil,
            }
        else
            skipped_truncated = true
        end
    end
    for _, e in ipairs(entries) do
        if not e.is_dir then
            local rel = safe_relpath(tostring(e.name))
            if not rel or e.encrypted then
                record_skip(e.name, e.encrypted and "encrypted" or "unsafe_path")
                log:warn("skipped archive entry", { upload_id = upload_id, name = e.name, encrypted = e.encrypted })
            else
                local member, ex_err = zip_reader.extract(bytes, e, MAX_ENTRY_UNCOMP)
                if not member then
                    record_skip(e.name, "extract_failed", ex_err)
                    log:warn("failed to extract archive entry", { upload_id = upload_id, name = e.name, error = ex_err })
                else
                    local meta = child_metadata(parent_meta, rel, depth + 1, upload_id)
                    for key, value in pairs(member_metadata[rel] or {}) do meta[key] = value end
                    if type(trace_context) == "table" then
                        meta.trace_context = trace_context
                    end
                    local child, up_err = upload_lib.upload_file(actor_id, member, basename(rel), #member, nil, params.storage_id :: string, meta, upload_id)
                    if child and child.uuid then
                        child_ids[#child_ids + 1] = tostring(child.uuid)
                    else
                        -- Unsupported member type or write failure: skip the member,
                        -- never fail the whole archive.
                        record_skip(e.name, "upload_not_ingested", up_err)
                        log:info("archive member not ingested", { upload_id = upload_id, name = e.name, error = tostring(up_err) })
                    end
                end
            end
        end
    end

    log:info("archive unpacked", { upload_id = upload_id, members = #child_ids, skipped = skipped })
    return {
        success = true,
        metadata = {
            archive = true,
            archive_member_count = #child_ids,
            archive_skipped_count = skipped,
            archive_skipped_entries = skipped_entries,
            archive_skipped_entries_truncated = skipped_truncated,
            child_upload_ids = child_ids,
            -- The container has no primary artifact; its extracted members carry
            -- the token and invoke the KB ingest callback when they complete.
            __upload_token = "",
            __upload_tokens = {},
        },
    }
end

return { process = process }
