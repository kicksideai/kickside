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
-- With page previews on, every page also gets an image (a preview rendition
-- where neither OCR rendering nor doc2md produced one) and a thumbnail.

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

-- A page rendered for OCR, a page rendered for preview only, or the thumbnail
-- of the image that stands for a page.
local RENDITIONS: { [string]: any } = {
    page = { role = "rendered-page", ordinal = 2000, suffix = "", locator = "rasterize.page" },
    thumbnail = { role = page_images.THUMBNAIL_ROLE, ordinal = 3000, suffix = "_thumbnail", locator = "rasterize.thumbnail" },
    preview = { role = page_images.PREVIEW_ROLE, ordinal = 4000, suffix = "_preview", locator = "rasterize.preview" },
}

local function store_page(params: any, page: any, fmt: string, rendition: any, refs: any): ArtifactError?
    local page_no = tonumber(page.page) or 0
    local mime = format_mime(fmt)
    local name = "page_" .. tostring(page_no) .. rendition.suffix .. "." .. (FORMAT_EXT[fmt] or "jpg")
    local _, err = artifact_content_repo.create_artifact({
        upload_id = params.upload_id,
        parent_artifact_id = refs.source_id,
        kind = "image",
        role = rendition.role,
        mime_type = mime,
        label = name,
        ordinal = rendition.ordinal + page_no,
        content = page.bytes,
        storage_id = params.storage_id,
        blob_metadata = {
            source = "rasterize",
            original_upload_id = params.upload_id,
            image_name = name,
            mime_type = mime,
            page = page_no,
            source_artifact_id = refs.source_id,
            markdown_artifact_id = refs.markdown_id,
            image_artifact_id = refs.image_id,
        },
        locator = {
            type = rendition.locator,
            page = page_no,
            source_artifact_id = refs.source_id,
            markdown_artifact_id = refs.markdown_id,
            image_artifact_id = refs.image_id,
        },
        metadata = {
            source = "rasterize",
            name = name,
            mime_type = mime,
            page = page_no,
            original_upload_id = params.upload_id,
            parent_artifact_id = refs.source_id,
            source_artifact_id = refs.source_id,
            markdown_artifact_id = refs.markdown_id,
            image_artifact_id = refs.image_id,
        },
    })
    return err
end

local function render_pages(entry: any, ref: any, selected: { integer }, opts: any, store: (page: any) -> ArtifactError?): (integer, string?)
    local rendered = 0
    local page = 1
    while page <= #selected do
        local last = math.min((page + opts.batch - 1) :: number, #selected)
        local selector: { integer } = {}
        for p = page, last do selector[#selector + 1] = selected[p] end

        local res, call_err = funcs.call(entry.processor_func :: string, {
            ref = ref,
            dpi = opts.dpi,
            format = opts.format,
            quality = opts.quality,
            pages = selector,
        })
        if call_err ~= nil then return rendered, tostring(call_err) end
        if type(res) ~= "table" then return rendered, "rasterize: empty render result" end
        if res.err ~= nil then
            local msg = (type(res.err) == "table" and res.err.message) or tostring(res.err)
            return rendered, tostring(msg)
        end

        local ok = type(res.ok) == "table" and res.ok or {}
        for _, p in ipairs(ok.pages or {}) do
            local store_err = store(p)
            if store_err ~= nil then return rendered, tostring(store_err) end
            rendered = rendered + 1
        end

        page = last + 1
    end
    return rendered, nil
end

-- Pages needing OCR, by their own text when the primary carries page markers,
-- else by the whole document.
local function ocr_pages(primary: any, total: number, max_text: integer, size: any): ({ integer }, string?)
    local selected: { integer } = {}
    local reason
    local text_pages = page_images.text_pages(primary.content, primary.metadata and primary.metadata.ocr_page_outcomes)
    if #text_pages > 0 then
        for _, page in ipairs(text_pages) do
            local page_reason = page_images.ocr_text_reason(page.text, 1, max_text, page.status)
            if page_reason then
                selected[#selected + 1] = page.page
                reason = reason or page_reason
            end
        end
    else
        reason = page_images.ocr_document_reason(primary.content, total, max_text, size)
        if reason then for page = 1, total do selected[#selected + 1] = page end end
    end
    return selected, reason
end

local function render_opts(dpi_key: string, dpi_default: integer): any
    return {
        dpi = setting_int(dpi_key, dpi_default),
        batch = math.max(1, setting_int("rasterize_batch_pages", 8)),
        format = setting_str("rasterize_format", "jpeg"),
        quality = setting_int("rasterize_quality", 90),
    }
end

-- Render the pages that need OCR and have no page image yet. Returns the stage
-- metadata of the OCR rendering, or nil when no page needs OCR.
local function render_ocr_pages(params: any, entry: any, ref: any, primary: any, total: number, min_page_bytes: integer, refs: any): any?
    local upload_id = params.upload_id :: string
    local max_text = setting_int("rasterize_max_text_bytes", page_images.DEFAULT_MAX_TEXT_BYTES_PER_PAGE)
    local selected, ocr_reason = ocr_pages(primary, total, max_text, params.size)
    if #selected == 0 then return nil end

    -- Skip rendering when doc2md already extracted exactly one full-page image per page
    -- (the PDF's pages are images). Those extracted images are the pages -- re-rendering
    -- would duplicate them and discard the originals. Strict 1:1 match only; anything
    -- else (multi-image pages, logos, partial coverage) falls through to rendering.
    local extracted = page_images.extracted_pages(upload_id, min_page_bytes)
    if page_images.complete_coverage(extracted, total :: integer) then
        log:info("pages already extracted by doc2md; skipping rasterize", {
            upload_id = upload_id, total_pages = total, extracted_pages = #extracted,
            reason = ocr_reason,
        })
        return { rasterize_skipped = true }
    end

    local available = page_images.numbered_images(extracted)
    for _, image in ipairs(page_images.rendered(upload_id)) do
        if type(image.metadata) == "table" and image.metadata.page then available[image.metadata.page] = image end
    end
    local missing: { integer } = {}
    for _, page in ipairs(selected) do if not available[page] then missing[#missing + 1] = page end end
    if #missing == 0 then return { rasterize_skipped = true } end

    log:info("rasterizing document for OCR", {
        upload_id = upload_id,
        reason = ocr_reason,
        text_bytes = type(primary.content) == "string" and #(primary.content :: string) or 0,
        total_pages = total,
        extracted_page_images = #extracted,
    })

    local opts = render_opts("rasterize_dpi", 150)
    local rendered, render_err = render_pages(entry, ref, missing, opts, function(p: any): ArtifactError?
        return store_page(params, p, opts.format :: string, RENDITIONS.page, refs)
    end)
    if render_err ~= nil then
        log:warn("rasterize render failed", { upload_id = upload_id, rendered = rendered, total = total, error = render_err })
        if rendered == 0 then return nil end
    end

    log:info("rasterized empty document", {
        upload_id = upload_id, rendered_pages = rendered, total_pages = total,
        format = opts.format, rasterizer = entry.id, reason = ocr_reason,
    })

    return { rendered_page_count = rendered, rasterize_reason = ocr_reason }
end

-- Give every page an image and a thumbnail. A page without an image from OCR
-- rendering or doc2md gets a preview rendition. A page keeps the thumbnail,
-- and so the image, it was first published with.
local function render_previews(params: any, entry: any, ref: any, total: number, min_page_bytes: integer, refs: any)
    local upload_id = params.upload_id :: string
    local images = page_images.page_image_map(upload_id, min_page_bytes)
    local missing: { integer } = {}
    for page = 1, total do if not images[page] then missing[#missing + 1] = page end end

    local opts = render_opts("rasterize_dpi", 150)
    local previewed = 0
    if #missing > 0 then
        local render_err
        previewed, render_err = render_pages(entry, ref, missing, opts, function(p: any): ArtifactError?
            return store_page(params, p, opts.format :: string, RENDITIONS.preview, refs)
        end)
        if render_err ~= nil then
            log:warn("rasterize preview render failed", { upload_id = upload_id, rendered = previewed, total = total, error = render_err })
        end
        images = page_images.page_image_map(upload_id, min_page_bytes)
    end

    local thumbnails, thumbnails_err = page_images.thumbnails(upload_id)
    if thumbnails_err then
        log:warn("rasterize thumbnail listing failed", { upload_id = upload_id, error = tostring(thumbnails_err) })
        return
    end
    local published = {}
    for _, thumbnail in ipairs(thumbnails) do published[tonumber(thumbnail.metadata.page)] = true end
    local wanted: { integer } = {}
    for page = 1, total do
        if images[page] and not published[page] then wanted[#wanted + 1] = page end
    end

    local thumbnail_opts = render_opts("rasterize_thumbnail_dpi", 36)
    local thumbnailed, thumbnail_err = render_pages(entry, ref, wanted, thumbnail_opts, function(p: any): ArtifactError?
        local image = images[math.tointeger(tonumber(p.page)) :: integer]
        return store_page(params, p, thumbnail_opts.format :: string, RENDITIONS.thumbnail,
            { source_id = refs.source_id, image_id = image.artifact_id })
    end)
    if thumbnail_err ~= nil then
        log:warn("rasterize thumbnail render failed", { upload_id = upload_id, rendered = thumbnailed, total = total, error = thumbnail_err })
    end

    log:info("rendered page previews", {
        upload_id = upload_id, previews = previewed, thumbnails = thumbnailed, total_pages = total, rasterizer = entry.id,
    })
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

    local previews = setting_bool("rasterize_page_previews", true)
    local ocr = setting_bool("rasterize_empty_enabled", true)
        and (tonumber(params.size) or 0) >= setting_int("rasterize_min_source_bytes", 4096)
    if not previews and not ocr then return { success = true } end

    local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
    if primary_err or type(primary) ~= "table" then primary = nil end
    if not previews and not (ocr and primary) then return { success = true } end

    local refs = {
        source_id = source_artifact_id(upload_id),
        markdown_id = primary and type(primary.artifact) == "table" and primary.artifact.artifact_id or nil,
    }
    local ref = { storage_id = params.storage_id, storage_path = params.storage_path }

    local count_res, count_err = funcs.call(entry.processor_func :: string, { ref = ref, count_only = true })
    if count_err ~= nil or type(count_res) ~= "table" or type(count_res.ok) ~= "table" then
        log:warn("rasterize page count failed", { upload_id = upload_id, error = tostring(count_err) })
        return { success = true }
    end
    local total = tonumber(count_res.ok.total) or 0
    if total < 1 then return { success = true } end

    local min_page_bytes = setting_int("rasterize_min_page_bytes", page_images.DEFAULT_MIN_PAGE_BYTES)
    local metadata = nil
    if ocr and primary then
        metadata = render_ocr_pages(params, entry, ref, primary, total, min_page_bytes, refs)
    end
    if previews then render_previews(params, entry, ref, total, min_page_bytes, refs) end

    return { success = true, metadata = metadata }
end

return { process = process }
