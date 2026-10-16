local security = require("security")
local http_client = require("http_client")
local time = require("time")

local upload_lib = require("upload_lib")
local upload_read_model = require("upload_read_model")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_type = require("upload_type")
local net_safety = require("net_safety")
local upload_status = require("upload_status")

-- Deadline for the download GET before the tool reports a fetch failure.
local FETCH_TIMEOUT = "60s"

-- Deadline for the lightweight HEAD/ranged probe used by check_only and size detection.
local PROBE_TIMEOUT = "20s"

local POLL_INTERVAL = "1s"
local DEFAULT_TIMEOUT_SECONDS = 120
local MIN_TIMEOUT_SECONDS = 1
local MAX_TIMEOUT_SECONDS = 600

local M = {}

-- Dependency seam: production wires the real modules; tests replace these fields
-- with fakes to drive the tool without real network, storage, or clock.
M.deps = {
    http = http_client,
    uploads = upload_lib,
    read_model = upload_read_model,
    artifacts = artifact_parts_repo,
    upload_type = upload_type,
    net_safety = net_safety,
    actor = function() return security.actor() end,
    now = function() return time.now():unix() end,
    sleep = function(duration) time.sleep(duration) end,
}

local function header_value(headers, name)
    if type(headers) ~= "table" then return nil end
    local target = name:lower()
    for k, v in pairs(headers) do
        if type(k) == "string" and k:lower() == target then
            return v
        end
    end
    return nil
end

local function file_extension(filename)
    return filename:match("%.([^%.]+)$") or ""
end

local function extract_filename(url)
    local path = url:match("://[^/]+(/.+)$") or ""
    local filename = path:match("/([^/?#]+)[?#]?[^/]*$")
    if filename and filename ~= "" then return filename end
    return "download"
end

-- Prefer Content-Length; fall back to the total in a Content-Range header on a
-- ranged probe response (bytes 0-0/<total>).
local function parse_size(headers)
    local n = tonumber(header_value(headers, "content-length"))
    if n and n >= 0 then return math.floor(n) end
    local range = header_value(headers, "content-range")
    if type(range) == "string" then
        local total = tonumber(range:match("/(%d+)%s*$"))
        if total and total >= 0 then return math.floor(total) end
    end
    return nil
end

local function clamp_timeout(value)
    local n = tonumber(value)
    if not n then return DEFAULT_TIMEOUT_SECONDS end
    n = math.floor(n)
    if n < MIN_TIMEOUT_SECONDS then return MIN_TIMEOUT_SECONDS end
    if n > MAX_TIMEOUT_SECONDS then return MAX_TIMEOUT_SECONDS end
    return n
end

local function content_type_supported(content_type, filename)
    local entry = M.deps.upload_type.find_by_mime_or_ext(content_type, file_extension(filename))
    return entry ~= nil
end

-- Probe the URL for content-type + size without downloading the body: HEAD first,
-- falling back to a single-byte ranged GET when the origin rejects HEAD.
local function probe_url(url)
    local resp, err = M.deps.http.head(url, { timeout = PROBE_TIMEOUT })
    if not err and resp and resp.status_code >= 200 and resp.status_code < 400 then
        return {
            content_type = header_value(resp.headers, "content-type") or "",
            size = parse_size(resp.headers),
        }, nil
    end

    local ranged, ranged_err = M.deps.http.get(url, {
        timeout = PROBE_TIMEOUT,
        headers = { Range = "bytes=0-0" },
    })
    if ranged_err then
        return nil, "fetch failed: " .. tostring(ranged_err)
    end
    if not ranged or ranged.status_code < 200 or ranged.status_code >= 400 then
        return nil, "HTTP " .. tostring(ranged and ranged.status_code or "unknown")
    end
    return {
        content_type = header_value(ranged.headers, "content-type") or "",
        size = parse_size(ranged.headers),
    }, nil
end

-- Read the upload's durable lifecycle status from the projection read model.
local function read_status(actor_id, upload_id)
    return upload_status.read(M.deps.read_model, actor_id, upload_id)
end

-- Bounded durable poll: loop the read-model status until a terminal state or the
-- deadline elapses. This reads persisted upload state, not an in-process queue.
local function wait_for_terminal(actor_id, upload_id, timeout_seconds)
    local deadline = M.deps.now() + timeout_seconds
    while true do
        local status, row, err = read_status(actor_id, upload_id)
        if status == "completed" then
            return status, row, nil
        end
        if status == "failed" then
            local message = err
            if row and type(row.error) == "string" and row.error ~= "" then
                message = row.error
            end
            return status, row, message or "upload processing failed"
        end
        if M.deps.now() >= deadline then
            return "processing", row, nil
        end
        M.deps.sleep(POLL_INTERVAL)
    end
end

-- Surface what a completed upload exposes: the extracted primary text and the
-- references of every derived artifact. An upload without primary text (an
-- image, for one) has no markdown; any other read failure is the caller's error.
local function completed_extras(upload_id, content_type)
    local result = { content_type = content_type }

    local primary, primary_err = M.deps.artifacts.read_primary_content(upload_id)
    if primary_err and not errors.is(primary_err, errors.NOT_FOUND) then
        return nil, primary_err
    end
    if primary and type(primary.content) == "string" then
        local mime = primary.mime_type or content_type or ""
        if mime:find("text", 1, true) or mime:find("json", 1, true) or mime == "" then
            result.markdown = primary.content
            result.content_type = mime
        end
    end

    local artifacts, artifacts_err = M.deps.artifacts.list_artifacts(upload_id)
    if artifacts_err then return nil, artifacts_err end
    if #artifacts > 0 then
        local refs = {}
        for _, a in ipairs(artifacts) do
            refs[#refs + 1] = {
                artifact_id = a.artifact_id,
                label = a.label,
                kind = a.kind,
                mime_type = a.mime_type,
                role = a.role,
            }
        end
        result.artifacts = refs
        result.artifact_count = #artifacts
    end

    return result, nil
end

local function handle(args)
    args = args or {}

    local actor = M.deps.actor()
    if not actor or tostring(actor:id() or "") == "" then
        return nil, errors.new({ message = "Authentication required to fetch a URL", kind = errors.PERMISSION_DENIED })
    end

    local url = args.url
    if type(url) ~= "string" or url == "" then
        return nil, errors.new({ message = "url is required", kind = errors.INVALID })
    end

    -- The URL is model-chosen, so guard against SSRF before any server-side fetch.
    local url_ok, url_reason = M.deps.net_safety.is_safe_public_url(url)
    if not url_ok then
        return nil, errors.new({ message = tostring(url_reason or "url not allowed"), kind = errors.PERMISSION_DENIED })
    end

    local filename = args.filename
    if type(filename) ~= "string" or filename == "" then
        filename = extract_filename(url)
    end

    if args.check_only == true then
        local probe, probe_err = probe_url(url)
        if probe_err then
            return nil, errors.new({ message = tostring(probe_err), kind = errors.INTERNAL })
        end
        return {
            url = url,
            content_type = probe.content_type,
            size = probe.size,
            filename = filename,
            supported = content_type_supported(probe.content_type, filename),
        }
    end

    local resp, fetch_err = M.deps.http.get(url, { timeout = FETCH_TIMEOUT })
    if fetch_err then
        return nil, errors.new({ message = tostring("fetch failed: " .. tostring(fetch_err)), kind = errors.INTERNAL })
    end
    if not resp or resp.status_code < 200 or resp.status_code >= 400 then
        return nil, errors.new({ message = tostring("HTTP " .. tostring(resp and resp.status_code or "unknown")), kind = errors.INTERNAL })
    end
    local body = resp.body or ""
    if #body == 0 then
        return nil, errors.new({ message = "empty response body", kind = errors.INTERNAL })
    end

    local content_type = header_value(resp.headers, "content-type") or ""

    -- upload_file freezes the current actor's execution identity and drives the
    -- processing pipeline; the tool runs as the calling agent's identity.
    local upload, upload_err = M.deps.uploads.upload_file(
        actor:id(), body, filename, #body, content_type, nil,
        { filename = filename, source = "agent.fetch_url", source_url = url }
    )
    if upload_err then
        return nil, errors.new({ message = tostring("upload failed: " .. tostring(upload_err)), kind = errors.INTERNAL })
    end
    local upload_id = tostring(upload.uuid or "")
    if upload_id == "" then
        return nil, errors.new({ message = "upload failed: missing upload id", kind = errors.INTERNAL })
    end

    if args.wait ~= true then
        local status, row, status_err = read_status(actor:id(), upload_id)
        if status == "failed" then
            return nil, errors.new({ message = tostring(status_err or (row and row.error) or "upload processing failed"),
                kind = errors.INTERNAL, details = { upload_id = upload_id } })
        end
        return {
            upload_id = upload_id,
            status = status,
            processed = status == "completed",
            message = "File stored in uploads. Processing is not guaranteed complete unless status is completed.",
        }
    end

    local timeout_seconds = clamp_timeout(args.timeout_seconds)
    local status, row, message = wait_for_terminal(actor:id(), upload_id, timeout_seconds)

    if status == "completed" then
        local extras, extras_err = completed_extras(upload_id, (row and row.mime_type) or content_type)
        if extras_err then
            return nil, errors.new({ message = "processed upload could not be read: " .. tostring(extras_err),
                kind = errors.INTERNAL, details = { upload_id = upload_id } })
        end
        return {
            upload_id = upload_id,
            status = "completed",
            content_type = extras.content_type,
            markdown = extras.markdown,
            artifacts = extras.artifacts,
            artifact_count = extras.artifact_count,
            message = "File fetched and processed.",
        }
    end

    if status == "failed" then
        return nil, errors.new({ message = message or "upload processing failed", kind = errors.INTERNAL,
            details = { upload_id = upload_id, status = "failed" } })
    end

    -- Bounded wait elapsed before a terminal state; processing continues async.
    return {
        upload_id = upload_id,
        status = "processing",
        processed = false,
        processing_timed_out = true,
        message = "File stored in uploads, but processing did not finish within " .. tostring(timeout_seconds) .. "s. Do not treat extracted content as ready until status is completed.",
    }
end

M.handle = handle
return M
