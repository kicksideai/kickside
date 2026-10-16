local security = require("security")
local base64 = require("base64")

local upload_lib = require("upload_lib")
local upload_read_model = require("upload_read_model")
local upload_status = require("upload_status")

-- Inline content arrives inside a tool call's JSON arguments, so it is bounded
-- by what a tool call can reasonably carry. Larger files go through the HTTP
-- upload endpoint or FetchURL.
local MAX_CONTENT_BYTES = 10 * 1024 * 1024

-- Longest encoded text that can decode to MAX_CONTENT_BYTES, allowing a CRLF
-- after every 76 characters as MIME encoders wrap. Checked before decoding so an
-- oversized argument is never decoded.
local MAX_ENCODED_CHARS = 4 * math.ceil(MAX_CONTENT_BYTES / 3)
local MAX_ENCODED_TEXT = MAX_ENCODED_CHARS + 2 * math.ceil(MAX_ENCODED_CHARS / 76)

local SOURCE = "agent.upload_file"

local M = {}

M.MAX_CONTENT_BYTES = MAX_CONTENT_BYTES

-- Dependency seam: production wires the real modules; tests replace these fields.
M.deps = {
    uploads = upload_lib,
    read_model = upload_read_model,
    actor = function() return security.actor() end,
}

-- Standard base64 (RFC 4648 section 4): padded, standard alphabet, line breaks
-- ignored. Returns the decoded bytes or an error message.
local function decode_content(encoded: any): (string?, string?)
    if type(encoded) ~= "string" or encoded == "" then
        return nil, "content_base64 is required"
    end
    if #encoded > MAX_ENCODED_TEXT then
        return nil, "content exceeds the " .. MAX_CONTENT_BYTES .. " byte limit"
    end
    local decoded, err = base64.decode(encoded)
    if err or type(decoded) ~= "string" then
        return nil, "content_base64 is not valid standard base64 (padded, no data: prefix): " .. tostring(err)
    end
    if decoded == "" then
        return nil, "content is empty"
    end
    if #decoded > MAX_CONTENT_BYTES then
        return nil, "content exceeds the " .. MAX_CONTENT_BYTES .. " byte limit"
    end
    return decoded, nil
end

local function handle(args)
    args = type(args) == "table" and args or {}

    local actor = M.deps.actor()
    if not actor or tostring(actor:id() or "") == "" then
        return nil, errors.new({ message = "Authentication required to upload a file", kind = errors.PERMISSION_DENIED })
    end

    local filename = args.filename
    if type(filename) ~= "string" or filename == "" then
        return nil, errors.new({ message = "filename is required", kind = errors.INVALID })
    end

    local content_type = args.content_type
    if content_type ~= nil and type(content_type) ~= "string" then
        return nil, errors.new({ message = "content_type must be a string", kind = errors.INVALID })
    end

    local bytes, decode_err = decode_content(args.content_base64)
    if not bytes then
        return nil, errors.new({ message = tostring(decode_err), kind = errors.INVALID })
    end

    local metadata = { filename = filename, source = SOURCE }
    if type(args.title) == "string" and args.title ~= "" then
        metadata.title = args.title
    end

    -- The same call the HTTP upload endpoint makes: it freezes the acting user's
    -- execution identity, stores the bytes, and submits the processing job.
    local upload, upload_err = M.deps.uploads.upload_file(
        actor:id(), bytes, filename, #bytes, content_type, nil, metadata
    )
    if upload_err or not upload then
        return nil, errors.new({ message = tostring("upload failed: " .. tostring(upload_err or "no upload returned")), kind = errors.INTERNAL })
    end
    local upload_id = tostring(upload.uuid or "")
    if upload_id == "" then
        return nil, errors.new({ message = "upload failed: missing upload id", kind = errors.INTERNAL })
    end

    local status, row, status_err = upload_status.read(M.deps.read_model, actor:id(), upload_id)
    if status == "failed" then
        return nil, errors.new({ message = tostring(status_err or (row and row.error) or "upload processing failed"),
            kind = errors.INTERNAL, details = { upload_id = upload_id } })
    end
    return {
        upload_id = upload_id,
        status = status,
        processed = status == "completed",
        deduped = upload.deduped == true,
        size = #bytes,
        message = upload.deduped == true
            and "These bytes are already in your uploads; the existing upload is returned."
            or "File stored in uploads. Processing continues in the background unless status is completed.",
    }
end

M.handle = handle
return M
