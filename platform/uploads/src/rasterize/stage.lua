type ArtifactError = string | error
local funcs = require("funcs")
local contract = require("contract")
local logger = require("logger")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local rasterizer = require("rasterizer")
local page_images = require("page_images")
local jobs = require("jobs")

-- Render the pages the page selection picks for OCR: sparse pages by default,
-- or every page. A complete set of extracted page images serves as the existing
-- no-render path for image PDFs.

local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.uploads.rasterize"

local log = logger:named("upload_rasterize")

local FORMAT_EXT: { [string]: string } = { png = "png", jpeg = "jpg", jpg = "jpg", webp = "webp" }

local function format_mime(fmt: string): string
    if fmt == "png" then return "image/png" end
    if fmt == "webp" then return "image/webp" end
    return "image/jpeg"
end

local function setting(key: string): any
    local def = contract.get(SETTINGS_CONTRACT)
    if not def then return nil end
    local inst = def:open()
    if not inst then return nil end
    local r = inst:get({ namespace = SETTINGS_NS, key = key })
    if r and r.success then return r.value end
    return nil
end

local function setting_int(key: string, default: integer): integer
    local v = tonumber(setting(key))
    if v == nil then return default end
    return math.floor(v) :: integer
end

local function setting_bool(key: string, default: boolean): boolean
    local v = setting(key)
    if v == nil or v == "" then return default end
    return v == true or tostring(v):lower() == "true"
end

local function setting_str(key: string, default: string): string
    local v = setting(key)
    if type(v) == "string" and (v :: string) ~= "" then return v :: string end
    return default
end

local function source_artifact_id(upload_id: string): string?
    local artifacts, err = artifact_parts_repo.list_artifacts(upload_id)
    if err or type(artifacts) ~= "table" then return nil end
    for _, a in ipairs(artifacts) do
        if (type(a.role) == "string" and a.role == "source") or (type(a.kind) == "string" and a.kind == "file") then
            if type(a.artifact_id) == "string" and a.artifact_id ~= "" then return a.artifact_id end
        end
    end
    return nil
end

local function store_page(params: any, page: any, fmt: string, source_id: string?, markdown_id: string?, source_checksum: string?): ArtifactError?
    local page_no = tonumber(page.page) or 0
    local mime = format_mime(fmt)
    local name = "page_" .. tostring(page_no) .. "." .. (FORMAT_EXT[fmt] or "jpg")
    local _, err = artifact_content_repo.upsert_artifact({
        upload_id = params.upload_id,
        cancel_ref = params.cancel_ref,
        parent_artifact_id = source_id,
        kind = "image",
        role = "rendered-page",
        mime_type = mime,
        label = name,
        ordinal = 2000 + page_no,
        content = page.bytes,
        storage_id = params.storage_id,
        blob_metadata = {
            source = "rasterize",
            original_upload_id = params.upload_id,
            image_name = name,
            mime_type = mime,
            page = page_no,
            source_artifact_id = source_id,
            markdown_artifact_id = markdown_id,
        },
        locator = {
            type = "rasterize.page",
            source_checksum = source_checksum,
            page = page_no,
            source_artifact_id = source_id,
            markdown_artifact_id = markdown_id,
        },
        metadata = {
            source = "rasterize",
            name = name,
            width = page.width, height = page.height, dpi = page.dpi, quality = page.quality,
            mime_type = mime,
            page = page_no,
            original_upload_id = params.upload_id,
            parent_artifact_id = source_id,
            source_artifact_id = source_id,
            markdown_artifact_id = markdown_id,
        },
    })
    return err
end

local function error_identifier(value: any): string?
    if type(value) == "string" and #value <= 64 and value:match("^[%w_][%w_.%-]*$") then return value end
    return nil
end

local function public_failure(err: any, code: string, message: string): (any, any)
    local kind
    if type(err) == "userdata" then
        local native = err :: error
        kind = error_identifier(native:kind())
        code = error_identifier((native:details() or {}).code) or code
    elseif type(err) == "table" then
        kind = error_identifier(err.kind)
        code = error_identifier(err.code) or code
    end
    return { code = code, kind = kind, error = message }, { code = code, kind = kind or type(err), message = message }
end

local function render_call(entry: any, ref: any, pages: { integer }, opts: any, attempt: string): ({ any }?, any?, any?)
    local res, call_err = funcs.call(entry.processor_func :: string, {
        ref = ref,
        dpi = opts.dpi,
        format = opts.format,
        quality = opts.quality,
        pages = pages,
    })
    if call_err ~= nil or type(res) ~= "table" or res.err ~= nil then
        local err = call_err or (type(res) == "table" and res.err)
        local failure, diagnostic = public_failure(err, "render_failed", "Unable to render document pages.")
        diagnostic.first_page, diagnostic.last_page, diagnostic.attempt = pages[1], pages[#pages], attempt
        return nil, failure, diagnostic
    end
    local ok = type(res.ok) == "table" and res.ok or {}
    return ok.pages or {}, nil
end

-- Heartbeat the processing job after a rendered batch. A job that no longer
-- holds its lease stops rendering, as its fenced page writes would.
local function heartbeat(params: any): string?
    local ref = type(params.cancel_ref) == "table" and params.cancel_ref or nil
    if not ref or type(ref.job_id) ~= "string" or ref.job_id == "" then return nil end
    local alive, err = jobs.heartbeat(ref.job_id, { token = ref.lease_token, execution_seq = ref.execution_seq })
    if err then return tostring(err) end
    if alive ~= true then return "job no longer holds its lease" end
    return nil
end

-- Re-render only the offending page. Preserve the configured DPI on a byte-only
-- overshoot when a lower JPEG/WebP quality is sufficient.
local function fit_page(entry: any, ref: any, page: any, opts: any): (any?, any?, any?)
    local dpi, quality = opts.dpi, opts.quality
    while true do
        local width, height = page_images.pixel_size(page.bytes)
        local edge, size = math.max(width or 0, height or 0), #page.bytes
        local over_edge = opts.max_edge > 0 and edge > opts.max_edge
        if not over_edge and size <= opts.max_bytes then
            page.width, page.height, page.dpi, page.quality = width, height, dpi, quality
            return page, nil, nil
        end
        if not over_edge and opts.format ~= "png" and quality > 65 then
            quality = math.max(65, quality - 15)
        elseif dpi > 1 then
            local scale = math.min(0.8, math.sqrt(opts.max_bytes / size))
            if over_edge then scale = math.min(scale, opts.max_edge / edge) end
            dpi = math.max(1, math.floor(dpi * scale))
        else
            return nil, {page = page.page, code = "image_too_large", error = "Page exceeds OCR image limits.",
                size = size, width = width, height = height}, nil
        end
        local smaller, err, diagnostic = render_call(entry, ref, {page.page},
            {dpi = dpi, quality = quality, format = opts.format}, "fit_page")
        if err or not smaller or #smaller ~= 1 or smaller[1].page ~= page.page then
            local failure = err or {code = "render_failed", error = "Unable to resize document page."}
            failure.page = page.page
            return nil, failure, diagnostic
        end
        page = smaller[1]
    end
end

-- Probe the first failed batch page by page. If no page renders, report one
-- document failure and stop; otherwise retain per-page failures and usable pages.
local function render_pages(params: any, entry: any, ref: any, selected: { integer }, opts: any, source_id: string?, markdown_id: string?, source_checksum: string?): (integer, { any }, string?, any?)
    local rendered = 0
    local failures: { any } = {}
    local diagnosed = false
    local diagnostic
    local function store_all(pages: { any }): string?
        for _, p in ipairs(pages) do
            local fitted, failure, detail = fit_page(entry, ref, p, opts)
            if failure then
                diagnostic = diagnostic or detail
                failures[#failures + 1] = failure
            else
                local store_err = store_page(params, fitted, opts.format :: string, source_id, markdown_id, source_checksum)
                if store_err ~= nil then return tostring(store_err) end
                rendered = rendered + 1
            end
        end
        return nil
    end
    local page = 1
    while page <= #selected do
        local last = math.min((page + opts.batch - 1) :: number, #selected)
        local selector: { integer } = {}
        for p = page, last do selector[#selector + 1] = selected[p] end

        local pages, render_err, batch_diagnostic = render_call(entry, ref, selector, opts, "batch")
        if render_err == nil then
            local store_err = store_all(pages :: { any })
            if store_err then return rendered, failures, store_err, diagnostic end
        elseif #selector == 1 then
            if not diagnosed then return rendered, { render_err }, nil, batch_diagnostic end
            diagnostic = diagnostic or batch_diagnostic
            render_err.page = selector[1]
            failures[#failures + 1] = render_err
        else
            local all_probes_failed = true
            for _, number in ipairs(selector) do
                local single, single_err, probe_diagnostic = render_call(entry, ref, { number }, opts, "single_page_probe")
                if single_err ~= nil then
                    diagnostic = diagnostic or probe_diagnostic
                    single_err.page = number
                    failures[#failures + 1] = single_err
                else
                    all_probes_failed = false
                    local store_err = store_all(single :: { any })
                    if store_err then return rendered, failures, store_err, diagnostic end
                end
            end
            if not diagnosed and all_probes_failed then return rendered, { render_err }, nil, batch_diagnostic end
            diagnosed = true
        end
        page = last + 1
        local heartbeat_err = heartbeat(params)
        if heartbeat_err then return rendered, failures, heartbeat_err, diagnostic end
    end
    return rendered, failures, nil, diagnostic
end

local function process(params: any): any
    -- A universal best-effort stage must never fail the upload: malformed params is a
    -- no-op, not a throw (which the pipeline would record as a failed upload).
    if type(params) ~= "table" or type(params.upload_id) ~= "string" then
        return { success = true, completed = false }
    end
    local upload_id = params.upload_id :: string

    local mime = type(params.mime_type) == "string" and params.mime_type or ""

    -- Fast bail for the common case: nothing can rasterize this mime (non-PDF uploads).
    local entry = rasterizer.find_by_mime(mime)
    if not entry then return { success = true } end

    if not setting_bool("rasterize_empty_enabled", true) then return { success = true } end

    local max_text = setting_int("rasterize_max_text_bytes", page_images.DEFAULT_MAX_TEXT_BYTES_PER_PAGE)
    local selection = setting_str("rasterize_page_selection", page_images.SELECT_SPARSE)
    local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
    if primary_err or type(primary) ~= "table" then return { success = true, completed = false } end

    local source_id = type(primary.artifact) == "table" and primary.artifact.parent_artifact_id or source_artifact_id(upload_id)
    local markdown_id = type(primary.artifact) == "table" and primary.artifact.artifact_id or nil

    local ref = { storage_id = params.storage_id, storage_path = params.storage_path }

    local count_res, count_err = funcs.call(entry.processor_func :: string, { ref = ref, count_only = true })
    if count_err ~= nil or type(count_res) ~= "table" or type(count_res.ok) ~= "table" then
        local err = count_err or (type(count_res) == "table" and count_res.err)
        local failure, diagnostic = public_failure(err, "page_count_failed", "Unable to count document pages.")
        diagnostic.attempt = "count"
        log:warn("rasterize page count failed", { upload_id = upload_id, error = failure.error, diagnostic = diagnostic })
        return { success = true, completed = false, metadata = { rasterize_failures = { failure } } }
    end
    local total = tonumber(count_res.ok.total)
    if not total then return { success = true, completed = false } end
    if total < 1 then return { success = true, metadata = { rasterize_failures = false } } end
    local text_pages = page_images.text_pages(primary.content, primary.metadata and primary.metadata.ocr_page_outcomes)
    local selected: { integer } = {}
    local ocr_reason
    if #text_pages > 0 then
        for _, page in ipairs(text_pages) do
            local reason = page_images.ocr_text_reason(page.text, 1, max_text, page.status, selection)
            if reason then
                selected[#selected + 1] = page.page
                ocr_reason = ocr_reason or reason
            end
        end
    else
        local min_source = setting_int("rasterize_min_source_bytes", 4096)
        if (tonumber(params.size) or 0) < min_source then return { success = true } end
        ocr_reason = page_images.ocr_document_reason(primary.content, total, max_text, params.size, selection)
        if ocr_reason then for page = 1, total do selected[#selected + 1] = page end end
    end
    if #selected == 0 then return { success = true, metadata = { rasterize_failures = false } } end

    -- Skip rendering when doc2md already extracted exactly one full-page image per page
    -- (the PDF's pages are images). Those extracted images are the pages -- re-rendering
    -- would duplicate them and discard the originals. Strict 1:1 match only; anything
    -- else (multi-image pages, logos, partial coverage) falls through to rendering.
    local min_page_bytes = setting_int("rasterize_min_page_bytes", page_images.DEFAULT_MIN_PAGE_BYTES)
    local max_bytes = math.max(1, math.min(page_images.MAX_OCR_BYTES, setting_int("rasterize_max_bytes", page_images.MAX_OCR_BYTES)))
    local max_edge = math.max(0, setting_int("rasterize_max_long_edge", page_images.DEFAULT_MAX_LONG_EDGE))
    local function usable(image: any): boolean
        local meta = image.metadata or {}
        local width, height = tonumber(meta.width), tonumber(meta.height)
        if page_images.ocr_image_error(image.mime_type, tonumber(image.size) or 0,
            math.max(width or 0, height or 0), max_bytes, max_edge) then return false end
        if max_edge > 0 and (not width or not height) then
            local bytes = artifact_content_repo.read_artifact_content(upload_id, image.artifact_id)
            if type(bytes) ~= "string" then return false end
            width, height = page_images.pixel_size(bytes)
            return #bytes <= max_bytes and math.max(width or 0, height or 0) <= max_edge
        end
        return true
    end
    local cached, candidates = page_images.page_candidates(upload_id, min_page_bytes)
    local extracted = {}
    for _, image in ipairs(candidates) do
        if usable(image) then extracted[#extracted + 1] = image end
    end
    if #cached == 0 and page_images.complete_coverage(extracted, total) then
        log:info("pages already extracted by doc2md; skipping rasterize", {
            upload_id = upload_id, total_pages = total, extracted_pages = #extracted,
            reason = ocr_reason,
        })
        return { success = true, metadata = { rasterize_skipped = true, rasterize_failures = false } }
    end

    local available = page_images.numbered_images(extracted)
    for _, image in ipairs(cached) do
        if type(image.metadata) == "table" and image.metadata.page then
            available[image.metadata.page] = usable(image) and image or nil
        end
    end
    local missing: { integer } = {}
    for _, page in ipairs(selected) do if not available[page] then missing[#missing + 1] = page end end
    selected = missing
    if #selected == 0 then
        return { success = true, metadata = { rasterize_skipped = true, rasterize_failures = false } }
    end

    log:info("rasterizing document for OCR", {
        upload_id = upload_id,
        reason = ocr_reason,
        text_bytes = type(primary.content) == "string" and #(primary.content :: string) or 0,
        total_pages = total,
        extracted_page_images = #extracted,
    })

    local opts = {
        max_bytes = max_bytes, max_edge = max_edge,
        dpi = setting_int("rasterize_dpi", 150),
        batch = math.max(1, setting_int("rasterize_batch_pages", 8)),
        format = setting_str("rasterize_format", "jpeg"),
        quality = setting_int("rasterize_quality", 90),
    }

    local rendered, failures, stage_err, diagnostic = render_pages(params, entry, ref, selected, opts, source_id, markdown_id,
        type(primary.artifact) == "table" and type(primary.artifact.locator) == "table"
            and primary.artifact.locator.source_checksum or nil)
    if stage_err ~= nil then
        log:error("rasterize stage failed", { upload_id = upload_id, rendered = rendered, total = total, error = stage_err })
        return { success = false, error = "rasterize: " .. stage_err }
    end
    if #failures > 0 then
        log:warn("rasterize render failed", { upload_id = upload_id, rendered = rendered, failed = #failures,
            total = total, error = failures[1].error, diagnostic = diagnostic,
            failed_first_page = failures[1].page or (diagnostic and diagnostic.first_page),
            failed_last_page = failures[#failures].page or selected[#selected] })
    end

    log:info("rasterized empty document", {
        upload_id = upload_id, rendered_pages = rendered, total_pages = total,
        format = opts.format, rasterizer = entry.id, reason = ocr_reason,
    })

    local completed = #failures == 0
    local stored = page_images.numbered_images(page_images.rendered(upload_id))
    for _, page in ipairs(selected) do
        if not stored[page] then completed = false end
    end
    -- Pages that did not render stay without an image, so OCR records them as
    -- failed pages; their render errors are reported here.
    return { success = true, completed = completed, metadata = { rendered_page_count = rendered, rasterize_reason = ocr_reason,
        rasterize_failures = #failures > 0 and failures or false } }
end

return { process = process }
