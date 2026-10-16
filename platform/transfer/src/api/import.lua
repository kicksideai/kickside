-- POST /api/v1/transfer/import   multipart/form-data, file field "file"  [?parent_id=...]
--
-- Accepts the KXB1 bundle as a proper multipart upload: the file is streamed to
-- scratch storage (no full-body buffering), read back for reconstruction, then
-- removed immediately — the upload leaves nothing behind. Reconstructs every
-- component the bundle carries, owned by the current actor. The batch is atomic:
-- any failure rolls back all components created in this call.

local http = require("http")
local security = require("security")
local fs = require("fs")
local uuid = require("uuid")
local orchestrator = require("orchestrator")
local consts = require("consts")
local portable_io = require("portable_io")

local SCRATCH_DIR = consts.SCRATCH_DIR
-- Matches the archive unpack ceiling (kickside.uploads.archive).
local MAX_BYTES = 2147483648

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    if not req:is_content_type(http.CONTENT.MULTIPART) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "request must be multipart/form-data with a 'file' field" })
        return
    end

    local form, perr = req:parse_multipart(MAX_BYTES)
    if perr or not form or not form.files or not form.files.file or #form.files.file == 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "missing 'file' field" .. (perr and (": " .. tostring(perr)) or "") })
        return
    end

    local part = form.files.file[1]
    if (tonumber(part:size()) or 0) <= 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "empty file" })
        return
    end

    local stream, serr = part:stream()
    if serr or not stream then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "stream failed: " .. tostring(serr) })
        return
    end

    local scratch_storage = consts.scratch_storage()
    local storage, ferr = fs.get(scratch_storage)
    if not storage then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "scratch storage: " .. tostring(ferr) })
        return
    end

    -- Stream the upload to scratch, read it for import, then remove it right away.
    local upload_path = SCRATCH_DIR .. "/upload-" .. uuid.v7() .. ".kxb"
    local parent_ok, parent_err = portable_io.ensure_parent(storage, upload_path)
    if not parent_ok then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(parent_err) })
        return
    end
    local staged = { storage_id = scratch_storage, files = { upload_path }, dirs = {} }
    local wok, werr = storage:writefile(upload_path, stream)
    if not wok then
        local _, cleanup_err = orchestrator.discard(staged)
        if cleanup_err then return nil, cleanup_err end
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "stage upload: " .. tostring(werr) })
        return
    end

    local parent_id = req:query("parent_id")
    if parent_id == "" then parent_id = nil end

    -- Stream the bundle straight from the staged file (header + per-part byte ranges):
    -- never load the whole bundle into memory.
    local result, err = orchestrator.import_file(storage, upload_path, {
        parent_id = parent_id,
        storage_id = scratch_storage,
    })
    local _, cleanup_err = orchestrator.discard(staged)
    if cleanup_err then return nil, cleanup_err end
    if not result then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #result.created,
        created = result.created,
        warnings = result.warnings,
    })
end

return { handler = handler }
