-- Shared provider-attachment ingest.
--
-- A file dropped in any connected channel (Discord/Telegram/...) is pulled into
-- the SAME upload pipeline a web upload uses: download the bytes, hand them to
-- kickside.uploads:uploads, and tag the upload with the thread it came from.
-- The upload is the satellite that references the thread (via metadata); the
-- kickside_event is never modified. Conversion and storage are reused unchanged
-- downstream.

local funcs = require("funcs")
local http_client = require("http_client")
local registry = require("registry")
local upload_lib = require("upload_lib")

local M = {}

-- Skip anything larger than the document pipeline cap so we never pull a huge
-- blob just to have the processor reject it.
M.MAX_BYTES = 50 * 1024 * 1024
local FETCHER_META = "attachment.fetcher"

M.deps = { registry = registry, funcs = funcs, http = http_client, uploads = upload_lib }

local function attachment_url(att: any): string
    if type(att.url) == "string" and att.url ~= "" then return att.url end
    if type(att.ref) == "string" and att.ref ~= "" then return att.ref end
    return ""
end

local function attachment_content_type(att: any): string?
    if att.content_type ~= nil then
        if type(att.content_type) ~= "string" then return nil end
        if att.content_type ~= "" then return att.content_type end
    end
    if att.mime ~= nil then
        if type(att.mime) ~= "string" then return nil end
        if att.mime ~= "" then return att.mime end
    end
    return nil
end

-- Decide whether an attachment is ingestable. Pure; returns (ok, reason).
function M.should_ingest(att: any, max: number?): (boolean, string?)
    if type(att) ~= "table" then return false, "no attachment" end
    local a: any = att
    if attachment_url(a) == "" then return false, "no url" end
    if type(a.actor_id) ~= "string" or a.actor_id == "" then return false, "no actor" end
    if (a.content_type ~= nil and type(a.content_type) ~= "string")
        or (a.mime ~= nil and type(a.mime) ~= "string")
    then
        return false, "invalid content type"
    end
    local limit = tonumber(max) or M.MAX_BYTES
    if type(a.size) == "number" and a.size > limit then return false, "too large" end
    return true, nil
end

-- Download an attachment and push it into the upload pipeline, tagged with its
-- thread. Returns the upload record (with .uuid) or (nil, err). Best-effort —
-- callers log the error and continue (a failed attachment must not break
-- message ingestion).
local function fetcher_for(provider: string): (string?, string?)
    if provider == "" then return "", nil end

    local entries, err = M.deps.registry.find({ [".kind"] = "registry.entry", ["meta.type"] = FETCHER_META })
    if err then return nil, "attachment fetcher registry unavailable: " .. tostring(err) end
    if type(entries) ~= "table" then return nil, "attachment fetcher registry returned invalid data" end

    local found = ""
    for _, entry in ipairs(entries :: { any }) do
        local declared: any = (entry :: any).data or entry
        if tostring(declared.provider or "") == provider then
            local func = tostring(declared.fetch_func or "")
            if func ~= "" then
                if found ~= "" and found ~= func then
                    return nil, "multiple attachment fetchers declared for provider " .. provider
                end
                found = func
            end
        end
    end
    return found, nil
end

local function fetch_bytes(a: any): (string?, string?)
    local fetch, lookup_err = fetcher_for(tostring(a.source or ""))
    if lookup_err then return nil, lookup_err end

    local bytes: string? = nil
    if fetch == "" then
        local resp, derr = M.deps.http.get(attachment_url(a), {})
        if derr then return nil, "download failed: " .. tostring(derr) end
        if not resp or resp.status_code ~= 200 or type(resp.body) ~= "string" or resp.body == "" then
            return nil, "download status " .. tostring(resp and resp.status_code)
        end
        bytes = resp.body
    else
        local result, ferr = M.deps.funcs.call(fetch :: string, { ref = a.ref, component_id = a.component_id })
        if ferr then return nil, "fetch failed: " .. tostring(ferr) end
        if type(result) ~= "table" then return nil, "fetch returned no bytes" end
        local reported = tostring((result :: any).error or "")
        if reported ~= "" then return nil, "fetch failed: " .. reported end
        local fetched = (result :: any).bytes
        if type(fetched) ~= "string" or fetched == "" then return nil, "fetch returned no bytes" end
        bytes = fetched
    end

    if #(bytes :: string) > M.MAX_BYTES then return nil, "too large" end
    return bytes, nil
end

function M.ingest(att: any): (any?, string?)
    local ok, reason = M.should_ingest(att, M.MAX_BYTES)
    if not ok then return nil, reason end
    local a: any = att

    local bytes, berr = fetch_bytes(a)
    if berr ~= nil or bytes == nil then return nil, berr end
    local content_type: string? = nil
    content_type = attachment_content_type(a)

    local upload, uerr = M.deps.uploads.upload_file(
        tostring(a.actor_id),
        bytes :: string,
        tostring(a.filename or "attachment"),
        #(bytes :: string),
        content_type,
        nil,
        {
            source = a.source,
            thread_id = a.thread_id,
            external_message_id = a.external_message_id,
        }
    )
    if uerr or not upload then return nil, "upload failed: " .. tostring(uerr) end
    return upload
end

return M
