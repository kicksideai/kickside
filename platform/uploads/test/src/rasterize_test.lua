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

    test.describe("kickside.uploads.rasterize stage", function()
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
