type ArtifactError = string | error
local funcs = require("funcs")
local contract = require("contract")
local logger = require("logger")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local rasterizer = require("rasterizer")
local page_images = require("page_images")

-- Render sparse pages for OCR, retaining usable text pages. A complete set of
-- extracted page images serves as the existing no-render path for image PDFs.

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

local function store_page(params: any, page: any, fmt: string, source_id: string?, markdown_id: string?): ArtifactError?
    local page_no = tonumber(page.page) or 0
    local mime = format_mime(fmt)
    local name = "page_" .. tostring(page_no) .. "." .. (FORMAT_EXT[fmt] or "jpg")
    local _, err = artifact_content_repo.create_artifact({
        upload_id = params.upload_id,
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
            page = page_no,
            source_artifact_id = source_id,
            markdown_artifact_id = markdown_id,
        },
        metadata = {
            source = "rasterize",
            name = name,
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

local function public_failure(err: any, code: string, message: string): any
    local kind
    if type(err) == "userdata" then
        local native = err :: error
        kind = error_identifier(native:kind())
        code = error_identifier((native:details() or {}).code) or code
    elseif type(err) == "table" then
        kind = error_identifier(err.kind)
        code = error_identifier(err.code) or code
    end
    return { code = code, kind = kind, error = message }
end

local function render_call(entry: any, ref: any, pages: { integer }, opts: any): ({ any }?, any?)
    local res, call_err = funcs.call(entry.processor_func :: string, {
        ref = ref,
        dpi = opts.dpi,
        format = opts.format,
        quality = opts.quality,
        pages = pages,
    })
    if call_err ~= nil or type(res) ~= "table" or res.err ~= nil then
        local err = call_err or (type(res) == "table" and res.err)
        return nil, public_failure(err, "render_failed", "Unable to render document pages.")
    end
    local ok = type(res.ok) == "table" and res.ok or {}
    return ok.pages or {}, nil
end

-- Probe the first failed batch page by page. If no page renders, report one
-- document failure and stop; otherwise retain per-page failures and usable pages.
local function render_pages(params: any, entry: any, ref: any, selected: { integer }, opts: any, source_id: string?, markdown_id: string?): (integer, { any }, string?)
    local rendered = 0
    local failures: { any } = {}
    local diagnosed = false
    local function store_all(pages: { any }): string?
        for _, p in ipairs(pages) do
            local store_err = store_page(params, p, opts.format :: string, source_id, markdown_id)
            if store_err ~= nil then return tostring(store_err) end
            rendered = rendered + 1
        end
        return nil
    end
    local page = 1
    while page <= #selected do
        local last = math.min((page + opts.batch - 1) :: number, #selected)
        local selector: { integer } = {}
        for p = page, last do selector[#selector + 1] = selected[p] end

        local pages, render_err = render_call(entry, ref, selector, opts)
        if render_err == nil then
            local store_err = store_all(pages :: { any })
            if store_err then return rendered, failures, store_err end
        elseif #selector == 1 then
            if not diagnosed then return rendered, { render_err }, nil end
            render_err.page = selector[1]
            failures[#failures + 1] = render_err
        else
            local before = #failures
            for _, number in ipairs(selector) do
                local single, single_err = render_call(entry, ref, { number }, opts)
                if single_err ~= nil then
                    single_err.page = number
                    failures[#failures + 1] = single_err
                else
                    local store_err = store_all(single :: { any })
                    if store_err then return rendered, failures, store_err end
                end
            end
            if not diagnosed and #failures - before == #selector then return rendered, { render_err }, nil end
            diagnosed = true
        end
        page = last + 1
    end
    return rendered, failures, nil
end

local function process(params: any): any
    -- A universal best-effort stage must never fail the upload: malformed params is a
    -- no-op, not a throw (which the pipeline would record as a failed upload).
    if type(params) ~= "table" or type(params.upload_id) ~= "string" then
        return { success = true }
    end
    local upload_id = params.upload_id :: string

    local mime = type(params.mime_type) == "string" and params.mime_type or ""

    -- Fast bail for the common case: nothing can rasterize this mime (non-PDF uploads).
    local entry = rasterizer.find_by_mime(mime)
    if not entry then return { success = true } end

    if not setting_bool("rasterize_empty_enabled", true) then return { success = true } end

    local min_source = setting_int("rasterize_min_source_bytes", 4096)
    if (tonumber(params.size) or 0) < min_source then return { success = true } end

    local max_text = setting_int("rasterize_max_text_bytes", page_images.DEFAULT_MAX_TEXT_BYTES_PER_PAGE)
    local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
    if primary_err or type(primary) ~= "table" then return { success = true } end

    local source_id = source_artifact_id(upload_id)
    local markdown_id = type(primary.artifact) == "table" and primary.artifact.artifact_id or nil

    local ref = { storage_id = params.storage_id, storage_path = params.storage_path }

    local count_res, count_err = funcs.call(entry.processor_func :: string, { ref = ref, count_only = true })
    if count_err ~= nil or type(count_res) ~= "table" or type(count_res.ok) ~= "table" then
        local err = count_err or (type(count_res) == "table" and count_res.err)
        log:warn("rasterize page count failed", { upload_id = upload_id, error = tostring(err) })
        return { success = true, metadata = { rasterize_failures = {
            public_failure(err, "page_count_failed", "Unable to count document pages.") } } }
    end
    local total = tonumber(count_res.ok.total) or 0
    if total < 1 then return { success = true, metadata = { rasterize_failures = false } } end
    local text_pages = page_images.text_pages(primary.content, primary.metadata and primary.metadata.ocr_page_outcomes)
    local selected: { integer } = {}
    local ocr_reason
    if #text_pages > 0 then
        for _, page in ipairs(text_pages) do
            local reason = page_images.ocr_text_reason(page.text, 1, max_text, page.status)
            if reason then
                selected[#selected + 1] = page.page
                ocr_reason = ocr_reason or reason
            end
        end
    else
        ocr_reason = page_images.ocr_document_reason(primary.content, total, max_text, params.size)
        if ocr_reason then for page = 1, total do selected[#selected + 1] = page end end
    end
    if #selected == 0 then return { success = true, metadata = { rasterize_failures = false } } end

    -- Skip rendering when doc2md already extracted exactly one full-page image per page
    -- (the PDF's pages are images). Those extracted images are the pages -- re-rendering
    -- would duplicate them and discard the originals. Strict 1:1 match only; anything
    -- else (multi-image pages, logos, partial coverage) falls through to rendering.
    local min_page_bytes = setting_int("rasterize_min_page_bytes", page_images.DEFAULT_MIN_PAGE_BYTES)
    local extracted = page_images.extracted_pages(upload_id, min_page_bytes)
    if page_images.complete_coverage(extracted, total) then
        log:info("pages already extracted by doc2md; skipping rasterize", {
            upload_id = upload_id, total_pages = total, extracted_pages = #extracted,
            reason = ocr_reason,
        })
        return { success = true, metadata = { rasterize_skipped = true, rasterize_failures = false } }
    end

    local available = page_images.numbered_images(extracted)
    for _, image in ipairs(page_images.rendered(upload_id)) do
        if type(image.metadata) == "table" and image.metadata.page then available[image.metadata.page] = image end
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
        dpi = setting_int("rasterize_dpi", 150),
        batch = math.max(1, setting_int("rasterize_batch_pages", 8)),
        format = setting_str("rasterize_format", "jpeg"),
        quality = setting_int("rasterize_quality", 90),
    }

    local rendered, failures, stage_err = render_pages(params, entry, ref, selected, opts, source_id, markdown_id)
    if stage_err ~= nil then
        log:error("rasterize stage failed", { upload_id = upload_id, rendered = rendered, total = total, error = stage_err })
        return { success = false, error = "rasterize: " .. stage_err }
    end
    if #failures > 0 then
        log:warn("rasterize render failed", { upload_id = upload_id, rendered = rendered, failed = #failures,
            total = total, error = failures[1].error })
    end

    log:info("rasterized empty document", {
        upload_id = upload_id, rendered_pages = rendered, total_pages = total,
        format = opts.format, rasterizer = entry.id, reason = ocr_reason,
    })

    -- Pages that did not render stay without an image, so OCR records them as
    -- failed pages; their render errors are reported here.
    return { success = true, metadata = { rendered_page_count = rendered, rasterize_reason = ocr_reason,
        rasterize_failures = #failures > 0 and failures or false } }
end

return { process = process }
