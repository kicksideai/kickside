local test = require("test")
local funcs = require("funcs")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local security = require("security")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_record_repo = require("upload_record_repo")
local rasterizer = require("rasterizer")
local fixtures = require("fixtures")
local page_images = require("page_images")
local contract = require("contract")
local trusted_reader = require("trusted_reader")

local STORAGE_ID = "app:uploads"
-- Synthetic image-only PDF (no text layer, no embedded fonts): doc2md extracts no
-- text so the empty-document path triggers, and pdf2image rasterizes its 3 pages.
local FIXTURE_PATH = "image_only_scan.pdf"
local FIXTURE_SIZE = 118823
local FIXTURE_PAGES = 2
local RASTERIZE_PDF = "kickside.convert.pdf2image:rasterize"
local RASTERIZE_STAGE = "kickside.uploads.rasterize:stage"

local function executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function is_png(blob: any): boolean
    return type(blob) == "string" and #blob > 8 and blob:byte(1) == 0x89 and blob:sub(2, 4) == "PNG"
end
local function is_jpeg(blob: any): boolean
    return type(blob) == "string" and #blob > 3 and blob:byte(1) == 0xFF and blob:byte(2) == 0xD8 and blob:byte(3) == 0xFF
end
local function is_webp(blob: any): boolean
    return type(blob) == "string" and #blob > 12 and blob:sub(1, 4) == "RIFF" and blob:sub(9, 12) == "WEBP"
end

-- Pixel width from a baseline or progressive JPEG frame header.
local function jpeg_width(blob: string): integer?
    local at = 3
    while at + 8 <= #blob do
        if blob:byte(at) ~= 0xFF then return nil end
        local marker = blob:byte(at + 1)
        local length = blob:byte(at + 2) * 256 + blob:byte(at + 3)
        if marker == 0xC0 or marker == 0xC1 or marker == 0xC2 then
            return blob:byte(at + 7) * 256 + blob:byte(at + 8)
        end
        at = at + 2 + length
    end
    return nil
end

local function settings_instance(): any
    return assert(assert(contract.get("kickside.settings:settings")):open())
end

local function set_setting(key: string, value: any)
    test.is_true(settings_instance():set({ namespace = "kickside.uploads.rasterize", key = key, value = value }).success)
end

local function fixture_bytes(): string
    local storage = fs.get(STORAGE_ID)
    if not storage then error("fixture storage unavailable") end
    if not storage:exists(FIXTURE_PATH) then
        local write_ok, write_err = storage:writefile(FIXTURE_PATH, fixtures.pdf)
        if write_err or write_ok == false then error("fixture write failed: " .. tostring(write_err)) end
    end
    local bytes = storage:readfile(FIXTURE_PATH)
    if type(bytes) ~= "string" or bytes == "" then error("fixture unreadable") end
    return bytes
end

local function ensure_fixture(): ()
    local storage = fs.get(STORAGE_ID)
    if not storage then error("fixture storage unavailable") end
    if not storage:exists(FIXTURE_PATH) then
        local write_ok, write_err = storage:writefile(FIXTURE_PATH, fixtures.pdf)
        if write_err or write_ok == false then error("fixture write failed: " .. tostring(write_err)) end
    end
end

local function rasterize(req: any): (any, any)
    ensure_fixture()
    return funcs.call(RASTERIZE_PDF, req)
end

local function seed_document(mime: string, markdown: string): string
    ensure_fixture()
    local upload_id = uuid_v4()
    local _, upload_err = upload_record_repo.create(
        upload_id, "user-raster", FIXTURE_SIZE, mime,
        STORAGE_ID, FIXTURE_PATH, "documents", { filename = "scan.pdf" }, "completed"
    )
    test.is_nil(upload_err)

    local source, source_err = artifact_content_repo.create_artifact({
        upload_id = upload_id, kind = "file", role = "source", mime_type = mime,
        label = "scan.pdf", ordinal = 0,
        locator = { type = "upload.original", upload_id = upload_id, storage_id = STORAGE_ID, storage_path = FIXTURE_PATH },
        metadata = { source = "upload", original_upload_id = upload_id },
    })
    test.is_nil(source_err)

    local _, md_err = artifact_content_repo.create_artifact({
        upload_id = upload_id, parent_artifact_id = source.artifact_id,
        kind = "markdown", role = "primary", mime_type = "text/markdown",
        label = "scan.md", ordinal = 1, content = markdown, storage_id = STORAGE_ID,
        metadata = { source = "doc2md", source_artifact_id = source.artifact_id },
    })
    test.is_nil(md_err)
    return upload_id
end

local function rendered_pages(upload_id: string): { any }
    local artifacts, err = artifact_parts_repo.list_artifacts(upload_id)
    test.is_nil(err)
    local out = {}
    for _, a in ipairs(artifacts or {}) do
        if a.kind == "image" and a.role == "rendered-page" then out[#out + 1] = a end
    end
    table.sort(out, function(a, b) return (tonumber(a.ordinal) or 0) < (tonumber(b.ordinal) or 0) end)
    return out :: { any }
end

local function artifacts_with_role(upload_id: string, role: string): { any }
    local artifacts, err = artifact_parts_repo.list_artifacts(upload_id)
    test.is_nil(err)
    local out = {}
    for _, a in ipairs(artifacts or {}) do
        if a.kind == "image" and a.role == role then out[#out + 1] = a end
    end
    table.sort(out, function(a, b) return (tonumber(a.metadata.page) or 0) < (tonumber(b.metadata.page) or 0) end)
    return out :: { any }
end

local function text_layer(pages: integer): string
    local out = {}
    for page = 1, pages do
        out[#out + 1] = "<!-- page " .. page .. " -->\n\n" .. string.rep("A usable text layer. ", 100)
    end
    return table.concat(out, "\n\n")
end

local function run_stage(upload_id: string, mime: string, size: any?): any
    local result, err = executor("user-raster"):call(RASTERIZE_STAGE, {
        upload_id = upload_id, mime_type = mime,
        storage_id = STORAGE_ID, storage_path = FIXTURE_PATH,
        size = size ~= nil and size or FIXTURE_SIZE,
    })
    test.is_nil(err)
    return result
end

local function define_tests()
    test.describe("kickside.uploads.rasterize discovery", function()
        test.it("resolves a PDF rasterizer by mime", function()
            local pdf = rasterizer.find_by_mime("application/pdf")
            test.not_nil(pdf)
            test.eq(pdf.processor_func, RASTERIZE_PDF)
        end)

        test.it("returns nil for mimes no rasterizer handles", function()
            test.is_nil(rasterizer.find_by_mime("image/png"))
            test.is_nil(rasterizer.find_by_mime("text/plain"))
            test.is_nil(rasterizer.find_by_mime("application/zip"))
            test.is_nil(rasterizer.find_by_mime(""))
            test.is_nil(rasterizer.find_by_mime(nil))
        end)
    end)

    test.describe("kickside.convert.pdf2image:rasterize adapter", function()
        test.it("reports the page count without rendering", function()
            local res, err = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = FIXTURE_PATH }, count_only = true })
            test.is_nil(err)
            test.eq(res.ok.total, FIXTURE_PAGES)
            test.is_nil(res.ok.pages)
        end)

        test.it("renders a single selected page with its page number", function()
            local res = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = FIXTURE_PATH }, pages = { 2 }, format = "png" })
            test.eq(#res.ok.pages, 1)
            test.eq(res.ok.pages[1].page, 2)
            test.is_true(is_png(res.ok.pages[1].bytes))
        end)

        test.it("renders an explicit page list preserving page numbers", function()
            local selected_pages: { integer } = {}
            for i = 1, FIXTURE_PAGES do selected_pages[i] = i end
            local res = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = FIXTURE_PATH }, pages = selected_pages })
            test.eq(#res.ok.pages, FIXTURE_PAGES)
            for i = 1, FIXTURE_PAGES do
                test.eq(res.ok.pages[i].page, i)
                test.is_true(is_png(res.ok.pages[i].bytes))
            end
        end)

        test.it("renders every page when no selector is given", function()
            local res = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = FIXTURE_PATH } })
            test.eq(res.ok.total, FIXTURE_PAGES)
            test.eq(#res.ok.pages, FIXTURE_PAGES)
        end)

        test.it("honours the requested output format", function()
            local jpg = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = FIXTURE_PATH }, pages = { 1 }, format = "jpeg" })
            test.is_true(is_jpeg(jpg.ok.pages[1].bytes))
            local webp = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = FIXTURE_PATH }, pages = { 1 }, format = "webp" })
            test.is_true(is_webp(webp.ok.pages[1].bytes))
        end)

        test.it("resolves a raw bytes reference", function()
            local res = rasterize({ ref = { bytes = fixture_bytes() }, count_only = true })
            test.eq(res.ok.total, FIXTURE_PAGES)
        end)

        test.it("returns a structured error for an unusable reference", function()
            local res = rasterize({ ref = {} })
            test.not_nil(res.err)
            test.eq(type(res.err.message), "string")
        end)

        test.it("returns an error when the storage pointer is missing", function()
            local res = rasterize({ ref = { storage_id = STORAGE_ID, storage_path = "does-not-exist.pdf" }, count_only = true })
            test.not_nil(res.err)
        end)

        test.it("returns an error for non-PDF bytes", function()
            local res = rasterize({ ref = { bytes = "not a pdf at all" } })
            test.not_nil(res.err)
        end)
    end)

    test.describe("kickside.uploads.rasterize page previews", function()
        test.it("renders a preview and a smaller thumbnail of every page of a text-layer document", function()
            local upload_id = seed_document("application/pdf", text_layer(FIXTURE_PAGES))
            test.eq(#page_images.pages(upload_id), 0)
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.is_nil(result.metadata)
            test.eq(#rendered_pages(upload_id), 0)

            local previews = artifacts_with_role(upload_id, "page-preview")
            local thumbnails = artifacts_with_role(upload_id, "page-thumbnail")
            test.eq(#previews, FIXTURE_PAGES)
            test.eq(#thumbnails, FIXTURE_PAGES)
            local pages = page_images.pages(upload_id)
            test.eq(#pages, FIXTURE_PAGES)
            for i = 1, FIXTURE_PAGES do
                test.eq(pages[i].page, i)
                test.eq(pages[i].image.artifact_id, previews[i].artifact_id)
                test.eq(pages[i].thumbnail.artifact_id, thumbnails[i].artifact_id)
                test.eq(thumbnails[i].metadata.image_artifact_id, previews[i].artifact_id)
                test.eq(thumbnails[i].mime_type, "image/jpeg")
                local image_bytes = assert(artifact_content_repo.read_artifact_content(upload_id, previews[i].artifact_id))
                local thumbnail_bytes = assert(artifact_content_repo.read_artifact_content(upload_id, thumbnails[i].artifact_id))
                local image_width, thumbnail_width = jpeg_width(image_bytes), jpeg_width(thumbnail_bytes)
                test.not_nil(image_width)
                test.not_nil(thumbnail_width)
                test.is_true((thumbnail_width :: integer) < (image_width :: integer))
            end
            -- Previews are page renditions, not content parts of the upload.
            test.eq(artifact_parts_repo.count_artifact_parts(upload_id), 0)
        end)

        test.it("publishes OCR renders and extracted scans as page images without rendering previews", function()
            local upload_id = seed_document("application/pdf", "<!-- page 1 -->\n\n<!-- page 2 -->")
            local scan = assert(artifact_content_repo.create_artifact({ upload_id = upload_id,
                kind = "image", role = "extracted-image", mime_type = "image/png", ordinal = 1001,
                content = string.rep("S", 60000), storage_id = STORAGE_ID, metadata = { page = 1 } }))
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, 1)
            local images = rendered_pages(upload_id)
            test.eq(#images, 1)
            test.eq(images[1].metadata.page, 2)
            test.eq(#artifacts_with_role(upload_id, "page-preview"), 0)
            local pages = page_images.pages(upload_id)
            test.eq(#pages, 2)
            test.eq(pages[1].image.artifact_id, scan.artifact_id)
            test.eq(pages[2].image.artifact_id, images[1].artifact_id)
            test.eq(pages[1].thumbnail.metadata.image_artifact_id, scan.artifact_id)
            test.eq(pages[2].thumbnail.metadata.image_artifact_id, images[1].artifact_id)
        end)

        test.it("keeps the published page map when the stage runs again", function()
            local upload_id = seed_document("application/pdf", text_layer(FIXTURE_PAGES))
            run_stage(upload_id, "application/pdf")
            local first = page_images.pages(upload_id)
            local again = run_stage(upload_id, "application/pdf")
            test.is_true(again.success)
            test.eq(#artifacts_with_role(upload_id, "page-preview"), FIXTURE_PAGES)
            test.eq(#artifacts_with_role(upload_id, "page-thumbnail"), FIXTURE_PAGES)
            local second = page_images.pages(upload_id)
            test.eq(#second, FIXTURE_PAGES)
            for i = 1, FIXTURE_PAGES do
                test.eq(second[i].image.artifact_id, first[i].image.artifact_id)
                test.eq(second[i].thumbnail.artifact_id, first[i].thumbnail.artifact_id)
            end
        end)

        test.it("renders previews of a source below the OCR size threshold", function()
            local upload_id = seed_document("application/pdf", text_layer(FIXTURE_PAGES))
            local result = run_stage(upload_id, "application/pdf", 10)
            test.is_true(result.success)
            test.eq(#page_images.pages(upload_id), FIXTURE_PAGES)
        end)

        test.it("renders no previews when page previews are off", function()
            local upload_id = seed_document("application/pdf", text_layer(FIXTURE_PAGES))
            set_setting("rasterize_page_previews", false)
            local result = run_stage(upload_id, "application/pdf")
            set_setting("rasterize_page_previews", true)
            test.is_true(result.success)
            test.eq(#artifacts_with_role(upload_id, "page-preview"), 0)
            test.eq(#artifacts_with_role(upload_id, "page-thumbnail"), 0)
            test.eq(#page_images.pages(upload_id), 0)
        end)

        test.it("exposes the page map to trusted readers", function()
            local upload_id = seed_document("application/pdf", text_layer(FIXTURE_PAGES))
            run_stage(upload_id, "application/pdf")
            local pages = page_images.pages(upload_id)
            local trusted, err = trusted_reader.pages(upload_id)
            test.is_nil(err)
            test.eq(#(trusted :: { any }), FIXTURE_PAGES)
            for i = 1, FIXTURE_PAGES do
                local entry = (trusted :: { any })[i]
                test.eq(entry.page, i)
                test.eq(entry.image_artifact_id, pages[i].image.artifact_id)
                test.eq(entry.image_content_type, "image/jpeg")
                test.eq(entry.thumbnail_artifact_id, pages[i].thumbnail.artifact_id)
                test.eq(entry.thumbnail_content_type, "image/jpeg")
            end
        end)
    end)

    test.describe("kickside.uploads.rasterize stage", function()
        test.it("renders a page with a large image and an additional small image", function()
            local upload_id = seed_document("application/pdf", "<!-- page 1 -->\n\n<!-- page 2 -->")
            for _, size in ipairs({60000, 100}) do
                local _, err = artifact_content_repo.create_artifact({upload_id = upload_id,
                    kind = "image", role = "extracted-image", mime_type = "image/png", ordinal = size,
                    content = string.rep("I", size), storage_id = STORAGE_ID, metadata = {page = 1}})
                test.is_nil(err)
            end
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            local images = rendered_pages(upload_id)
            test.eq(#images, 2)
            test.eq(images[1].metadata.page, 1)
            test.eq(images[2].metadata.page, 2)
        end)

        test.it("keeps ambiguous numbered images unavailable after a render failure", function()
            local upload_id = seed_document("application/pdf", "<!-- page 1 -->")
            for index = 1, 2 do
                local _, err = artifact_content_repo.create_artifact({upload_id = upload_id,
                    kind = "image", role = "extracted-image", mime_type = "image/png", ordinal = index,
                    content = string.rep(tostring(index), 60000), storage_id = STORAGE_ID, metadata = {page = 1}})
                test.is_nil(err)
            end
            local settings = assert(assert(contract.get("kickside.settings:settings")):open())
            test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_format", value = "invalid"}).success)
            local result, err = executor("user-raster"):call(RASTERIZE_STAGE, {upload_id = upload_id,
                mime_type = "application/pdf", size = FIXTURE_SIZE, storage_id = STORAGE_ID, storage_path = FIXTURE_PATH})
            test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_format", value = "jpeg"}).success)
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(#rendered_pages(upload_id), 0)
            test.eq(#page_images.page_set(upload_id, 51200), 0)
        end)

        test.it("renders only sparse marker-delimited pages with their original numbers", function()
            for _, sparse_page in ipairs({ 1, 2 }) do
                local pages = {}
                for page = 1, 2 do
                    local body = page == sparse_page and "" or string.rep("A usable text layer. ", 100)
                    pages[#pages + 1] = "<!-- page " .. page .. " -->\n\n" .. body
                end
                local upload_id = seed_document("application/pdf", table.concat(pages, "\n\n"))
                local result = run_stage(upload_id, "application/pdf")
                test.is_true(result.success)
                test.eq(result.metadata.rendered_page_count, 1)
                local images = rendered_pages(upload_id)
                test.eq(#images, 1)
                test.eq(images[1].metadata.page, sparse_page)
                test.eq(tonumber(images[1].ordinal), 2000 + sparse_page)
            end
        end)

        test.it("rasterizes every page of an empty document into rendered-page artifacts (jpeg)", function()
            local upload_id = seed_document("application/pdf", "")
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "empty_text")

            local pages = rendered_pages(upload_id)
            test.eq(#pages, FIXTURE_PAGES)
            for i = 1, FIXTURE_PAGES do
                test.eq(pages[i].mime_type, "image/jpeg")
                test.eq(pages[i].role, "rendered-page")
                test.eq(tonumber(pages[i].ordinal), 2000 + i)
                test.eq(pages[i].metadata.name, "page_" .. tostring(i) .. ".jpg")
                test.eq(tonumber(pages[i].metadata.page), i)
            end
        end)

        test.it("skips rendering when doc2md already extracted one large image per page", function()
            local upload_id = seed_document("application/pdf", "")
            -- simulate doc2md extracting one full-page-sized image per page
            for p = 1, FIXTURE_PAGES do
                local _, err = artifact_content_repo.create_artifact({
                    upload_id = upload_id, kind = "image", role = "extracted-image", mime_type = "image/jpeg",
                    label = "page" .. tostring(p) .. ".jpg", ordinal = 1000 + p,
                    content = string.rep("X", 60000), storage_id = STORAGE_ID,
                    metadata = { name = "page" .. tostring(p) .. ".jpg", page = p },
                })
                test.is_nil(err)
            end
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.is_true(result.metadata ~= nil and result.metadata.rasterize_skipped == true)
            test.eq(#rendered_pages(upload_id), 0)
        end)

        test.it("still renders when extracted images do not cover every page", function()
            local upload_id = seed_document("application/pdf", "")
            -- only one large extracted image for a 3-page doc -> not a full page set
            local _, err = artifact_content_repo.create_artifact({
                upload_id = upload_id, kind = "image", role = "extracted-image", mime_type = "image/jpeg",
                label = "logo.jpg", ordinal = 1001, content = string.rep("X", 60000), storage_id = STORAGE_ID,
                metadata = { name = "logo.jpg" },
            })
            test.is_nil(err)
            local result = run_stage(upload_id, "application/pdf")
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "empty_text")
        end)

        test.it("treats whitespace-only extracted text as empty", function()
            local upload_id = seed_document("application/pdf", "   \n  \t ")
            local result = run_stage(upload_id, "application/pdf")
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "empty_text")
        end)

        test.it("rasterizes sparse extracted text per page", function()
            local upload_id = seed_document("application/pdf",
                "# 56ZF-28495 Robot Numbering Standard\n\n" ..
                "Drawing Number Description Revision Date\n\n" ..
                "| 28495-01.dwg Robot Number | ing Standard | 0 5 - 21 -0 8 |\n\n" ..
                "| 28495-02.dwg Robot Number | ing Standard | 0 5 - 21 -0 8 |")
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "sparse_text_per_page")
        end)

        test.it("rasterizes mixed text/image documents when text cannot cover all pages", function()
            local upload_id = seed_document("application/pdf", string.rep("real text from one page. ", 90))
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "text_does_not_cover_pages")
        end)

        test.it("rasterizes image-heavy documents when extracted text is tiny relative to source size", function()
            local upload_id = seed_document("application/pdf", string.rep("real extracted text. ", 300))
            local result = run_stage(upload_id, "application/pdf", 1000000)
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "low_text_to_source_ratio")
        end)

        test.it("skips a document that already has extractable text", function()
            local upload_id = seed_document("application/pdf", string.rep("real extracted text. ", 300))
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.is_nil(result.metadata)
            test.eq(#rendered_pages(upload_id), 0)
        end)

        test.it("no-ops for a non-rasterizable mime", function()
            local upload_id = seed_document("image/png", "")
            local result = run_stage(upload_id, "image/png")
            test.is_true(result.success)
            test.eq(#rendered_pages(upload_id), 0)
        end)

        test.it("skips a source smaller than the minimum size", function()
            local upload_id = seed_document("application/pdf", "")
            local result = run_stage(upload_id, "application/pdf", 10)
            test.is_true(result.success)
            test.is_nil(result.metadata)
            test.eq(#rendered_pages(upload_id), 0)
        end)

        test.it("no-ops on malformed params instead of failing the upload", function()
            local result, err = executor("user-raster"):call(RASTERIZE_STAGE, { mime_type = "application/pdf" })
            test.is_nil(err)
            test.is_true(result.success)
        end)
    end)
end

local function run(options: any): any
    return test.run_cases(define_tests)(options)
end

return { run = run }
