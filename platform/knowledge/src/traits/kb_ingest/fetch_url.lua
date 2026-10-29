local util = require("util")
local ctx = require("ctx")
local html = require("html")
local http_client = require("http_client")
local security = require("security")
local component = require("component")
local upload_lib = require("upload_lib")
local upload_tokens = require("upload_tokens")
local execution_identity = require("execution_identity")
local trace_context = require("trace_context")
local process = require("process")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local llm = require("llm")
local prompt = require("prompt")
local net_safety = require("net_safety")

local TEXT_TYPES = { "text/html", "text/plain", "text/markdown", "text/csv" }
local UPLOAD_WAIT_TIMEOUT = "120s"

-- Deadline for the server-side URL fetch before the tool reports a fetch failure.
local FETCH_TIMEOUT = "30s"

-- Token budget for the extraction LLM pass that turns raw page text into markdown.
local EXTRACT_MAX_TOKENS = 8192

local trim = util.trim

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function put_default(target: { [string]: any }, key: string, value: any): ()
    if target[key] == nil or (type(target[key]) == "string" and target[key] == "") then
        target[key] = value
    end
end

local function first_value(...): any
    for i = 1, select("#", ...) do
        local value = select(i, ...)
        if value ~= nil and not (type(value) == "string" and trim(value) == "") then return value end
    end
    return nil
end

local function source_ref_for(args: any, metadata: { [string]: any }, content_type: any, title: any): { [string]: any }
    local ref = shallow_copy(args.source_ref)
    if next(ref) == nil then ref = shallow_copy(metadata.source_ref) end
    put_default(ref, "kind", "url")
    put_default(ref, "origin", "agent.fetch_url")
    ref.source_url = args.url
    put_default(ref, "external_id", first_value(args.external_id, metadata.external_id, "url:" .. args.url))
    put_default(ref, "external_version", first_value(args.external_version, metadata.external_version))
    put_default(ref, "title", first_value(metadata.title, title))
    put_default(ref, "content_type", content_type)
    return ref
end

local function is_text_type(content_type)
    for _, t in ipairs(TEXT_TYPES) do
        if content_type:find(t, 1, true) then return true, t end
    end
    if content_type:find("text/", 1, true) then return true, "text" end
    return false, nil
end

local function extract_title(body)
    local title = body:match("<title[^>]*>(.-)</title>")
    if title then
        title = title:gsub("%s+", " "):match("^%s*(.-)%s*$")
        if title ~= "" then return title end
    end
    return nil
end

local function extract_filename(url)
    local path = url:match("://[^/]+(/.+)$") or ""
    local filename = path:match("/([^/?#]+)[?#]?[^/]*$")
    if filename and filename ~= "" then return filename end
    return "download"
end

local function wait_for_upload(response_topic: string)
    local response_ch = process.listen(response_topic)
    local timeout_ch = time.after(UPLOAD_WAIT_TIMEOUT)

    local result = channel.select({
        response_ch:case_receive(),
        timeout_ch:case_receive(),
    })

    -- Release the per-call topic subscription so the process's subs
    -- maps do not grow with every wait_for_upload call.
    process.unlisten(response_ch)

    if result.channel == timeout_ch then
        return nil, "upload processing timed out"
    end

    local msg = result.value
    local payload = msg:payload():data()

    if type(payload) == "table" and payload.success == false then
        return nil, payload.error or "upload processing failed"
    end

    return payload, nil
end

local EXTRACT_SYSTEM = [[You are a content extraction assistant. Given raw web page text and user instructions, produce clean, well-structured markdown. Output only the extracted content, no commentary or preamble.]]

local function llm_extract(raw_content: string, extract_prompt: string, model: string?)
    local builder = prompt.with_system(EXTRACT_SYSTEM) :: any
    builder:add_user("Instructions: " .. extract_prompt .. "\n\nSource content:\n" .. raw_content)

    local response, err = llm.generate(builder, {
        model = model,
        max_tokens = EXTRACT_MAX_TOKENS,
        temperature = 0.1,
    })
    if err then
        return nil, "extraction LLM failed: " .. tostring(err)
    end
    if not response or not response.result or response.result == "" then
        return nil, "extraction LLM returned empty result"
    end
    return response.result, nil
end

local function handle(args)
    args = args or {}
    if not args.url or args.url == "" then
        return nil, errors.new({ message = "url is required", kind = errors.INVALID })
    end

    local kb_id_raw = args.kb_id or ctx.get("kb_id")
    if not kb_id_raw then
        return nil, errors.new({ message = "no kb_id available, use SelectKB first or provide kb_id", kind = errors.INVALID })
    end
    local kb_id = kb_id_raw :: string

    -- Gate KB access before touching the network, so the tool cannot be used as
    -- an SSRF probe against a KB the caller has no write access to.
    local engine, access_err = component.open(
        kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable"
    )
    if access_err then
        return nil, errors.new({ message = tostring("cannot access KB: " .. tostring(access_err)), kind = errors.PERMISSION_DENIED })
    end

    -- The URL is model-chosen here, so guard against SSRF before fetching it
    -- server-side (loopback / RFC1918 / cloud-metadata / internal hosts).
    local url_ok, url_reason = net_safety.is_safe_public_url(args.url)
    if not url_ok then
        return nil, errors.new({ message = tostring(url_reason or "url not allowed"), kind = errors.PERMISSION_DENIED })
    end

    local resp, fetch_err = http_client.get(args.url, { timeout = FETCH_TIMEOUT })
    if fetch_err then
        return nil, errors.new({ message = tostring("fetch failed: " .. tostring(fetch_err)), kind = errors.INTERNAL })
    end
    if not resp or resp.status_code < 200 or resp.status_code >= 400 then
        return nil, errors.new({ message = tostring("HTTP " .. tostring(resp and resp.status_code or "unknown")), kind = errors.INTERNAL })
    end

    local raw_headers = resp.headers or {}
    local content_type = ""
    for k, v in pairs(raw_headers) do
        if k:lower() == "content-type" then
            content_type = v
            break
        end
    end
    local is_text, matched_type = is_text_type(content_type)

    if is_text then
        local content: string = (resp.body or "") :: string
        local title = nil
        if matched_type == "text/html" then
            title = extract_title(content)
            local policy = html.sanitize.strict_policy()
            content = policy:sanitize(content)
        end
        if content == "" then
            return nil, errors.new({ message = "no content extracted from URL", kind = errors.INTERNAL })
        end

        title = title or args.url
        local stored_content_type = matched_type
        if stored_content_type == "text/html" or stored_content_type == "text" or stored_content_type == "" then
            stored_content_type = "text/plain"
        end

        local extract_prompt = args.extract_prompt or ctx.get("extract_prompt")
        if type(extract_prompt) == "string" and extract_prompt ~= "" then
            local extract_model = (type(args.extract_model) == "string") and (args.extract_model :: string) or nil
            local extracted, extract_err = llm_extract(content, extract_prompt :: string, extract_model)
            if extract_err then
                return nil, errors.new({ message = tostring(extract_err), kind = errors.INTERNAL })
            end
            content = (extracted or "") :: string
            stored_content_type = "text/markdown"
        end

        local should_embed = args.embed ~= false
        if should_embed then
            local metadata = shallow_copy(args.metadata)
            metadata.title = trim(metadata.title) ~= "" and metadata.title or title
            metadata.source_url = args.url
            metadata.source = trim(metadata.source) ~= "" and metadata.source or "agent.fetch_url"
            put_default(metadata, "source_mime", content_type)
            local source_ref = source_ref_for(args, metadata, stored_content_type, title)
            put_default(metadata, "external_id", source_ref.external_id)
            put_default(metadata, "external_version", source_ref.external_version)
            local queued, ingest_err = assert(engine, "embeddable binding required"):embed_content({
                content = content,
                content_type = stored_content_type,
                title = title,
                metadata = metadata,
                external_id = source_ref.external_id,
                external_version = source_ref.external_version,
                source_ref = source_ref,
            })
            if ingest_err or not queued or queued.success ~= true then
                ingest_err = ingest_err or (queued and queued.error)
                return nil, errors.new({ message = "fetched but ingest enqueue failed: " .. tostring(ingest_err), kind = errors.INTERNAL })
            end

            return {
                success = true,
                status = "queued",
                content_length = #content,
                title = title,
                source_url = args.url,
                kb_id = kb_id,
                thread_id = queued and queued.thread_id,
                projection_id = queued and queued.projection_id,
                run_id = queued and queued.run_id,
                external_id = queued and queued.external_id,
                external_version = queued and queued.external_version,
                trace_context = queued and queued.trace_context,
                source_ref = queued and queued.source_ref,
                message = "URL content fetched and queued for KB ingestion.",
            }
        end

        return {
            success = true,
            status = "fetched",
            content = content,
            content_type = stored_content_type,
            title = title,
            source_url = args.url,
        }
    end

    local body_bytes = resp.body or ""
    if #body_bytes == 0 then
        return nil, errors.new({ message = "empty response body", kind = errors.INTERNAL })
    end

    local actor = security.actor()
    if not actor then
        return nil, errors.new({ message = "no actor context", kind = errors.PERMISSION_DENIED })
    end
    -- Freeze the authorizing identity so on-upload-complete embedding runs as this
    -- actor and scope. Fail-closed: without a reconstructable identity, no token.
    local identity, capture_err = execution_identity.capture()
    if not identity then
        return nil, errors.new({ message = tostring("failed to capture execution identity: " .. tostring(capture_err)), kind = errors.INTERNAL })
    end
    local identity_row, identity_row_err = execution_identity.to_row(identity)
    if not identity_row then
        return nil, errors.new({ message = tostring("failed to serialize execution identity: " .. tostring(identity_row_err)), kind = errors.INTERNAL })
    end

    local filename = extract_filename(args.url)

    local wait_mode = args.wait ~= false
    local response_topic = nil
    if wait_mode then
        response_topic = "injection.upload." .. uuid.v4()
    end

    local token_trace = trace_context.begin("kb.upload")
    local token_params = { kb_id = kb_id, trace_context = token_trace }
    if response_topic then
        token_params.respond_to = response_topic
    end

    local token, token_err = upload_tokens.pack({
        upload_id = uuid.v4(),
        function_id = "kickside.knowledge.injection:on_upload_complete",
        actor_id = identity_row.actor_id,
        actor_context = identity_row.actor_context,
        params = token_params,
    })
    if token_err then
        return nil, errors.new({ message = tostring("upload token error: " .. token_err), kind = errors.INTERNAL })
    end

    local upload_metadata = shallow_copy(args.metadata)
    upload_metadata.__upload_token = token
    upload_metadata.trace_context = token_trace
    upload_metadata.source_url = args.url
    upload_metadata.source = trim(upload_metadata.source) ~= "" and upload_metadata.source or "agent.fetch_url"
    put_default(upload_metadata, "external_id", args.external_id)
    put_default(upload_metadata, "external_version", args.external_version)
    put_default(upload_metadata, "source_mime", content_type)
    upload_metadata.source_ref = source_ref_for(args, upload_metadata, content_type, filename)
    put_default(upload_metadata, "external_id", upload_metadata.source_ref.external_id)
    put_default(upload_metadata, "external_version", upload_metadata.source_ref.external_version)
    local upload, upload_err = upload_lib.upload_file(
        actor:id(), body_bytes, filename, #body_bytes, content_type, nil,
        upload_metadata
    )
    if upload_err then
        return nil, errors.new({ message = tostring("upload failed: " .. upload_err), kind = errors.INTERNAL })
    end

    local returned_source_ref = shallow_copy(upload_metadata.source_ref)
    returned_source_ref.upload_id = upload.uuid

    if not wait_mode then
        return {
            success = true,
            status = "uploaded_pending_kb_enqueue",
            upload_id = upload.uuid,
            filename = filename,
            kb_id = kb_id,
            source_url = args.url,
            external_id = upload_metadata.external_id,
            external_version = upload_metadata.external_version,
            trace_context = token_trace,
            source_ref = returned_source_ref,
            message = "File uploaded for processing; KB ingestion will be queued by the upload completion callback.",
        }
    end

    local result, wait_err = wait_for_upload(response_topic :: string)
    if wait_err then
        return nil, errors.new({ message = "file uploaded but processing failed: " .. tostring(wait_err),
            kind = errors.INTERNAL, details = { upload_id = upload.uuid, filename = filename } })
    end
    local queued = type(result) == "table" and result or {}

    return {
        success = true,
        status = "queued",
        upload_id = upload.uuid,
        filename = filename,
        kb_id = kb_id,
        thread_id = queued.thread_id,
        projection_id = queued.projection_id,
        run_id = queued.run_id,
        cursor_id = queued.cursor_id,
        external_source = queued.external_source,
        external_id = queued.external_id or upload_metadata.external_id,
        external_version = queued.external_version or upload_metadata.external_version,
        trace_context = queued.trace_context or token_trace,
        source_ref = queued.source_ref or returned_source_ref,
        message = "File fetched, processed, and queued for KB ingestion.",
    }
end

return { handle = handle }
