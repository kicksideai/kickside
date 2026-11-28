local test = require("test")
local funcs = require("funcs")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local security = require("security")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_record_repo = require("upload_record_repo")
local upload_query_repo = require("upload_query_repo")
local rasterizer = require("rasterizer")
local fixtures = require("fixtures")
local page_images = require("page_images")
local contract = require("contract")
local json = require("json")
local time = require("time")
local stage_fixture = require("stage_fixture")
local stage_logger = require("stage_logger")
local sql = require("sql")
local process = require("process")
local channel = require("channel")
local proc_supervisor = require("proc_supervisor")

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

local function run_stage(upload_id: string, mime: string, size: any?, path: string?): any
    local result, err = executor("user-raster"):call(RASTERIZE_STAGE, {
        upload_id = upload_id, mime_type = mime,
        storage_id = STORAGE_ID, storage_path = path or FIXTURE_PATH,
        size = size ~= nil and size or FIXTURE_SIZE,
    })
    test.is_nil(err)
    return result
end

local SCRIPTED_MIME = "application/x-scripted-pdf"
local PRIVATE_ERROR = "cannot open /private/renderer/input.pdf\nstack traceback:\n renderer.lua:42"
local function scripted_document(config: any): string
    local path = uuid_v4() .. ".json"
    local written, err = assert(fs.get(STORAGE_ID)):writefile(path, assert(json.encode(config)))
    test.is_nil(err)
    test.is_true(written)
    return path
end

local function script_state(path: string): any
    local bytes, read_err = assert(fs.get(STORAGE_ID)):readfile(path)
    assert(bytes, read_err)
    return assert(json.decode(bytes))
end

local function save_stage_metadata(upload_id: string, result: any): any
    local upload = assert(upload_query_repo.get(upload_id))
    for key, value in pairs(result.metadata or {}) do upload.metadata[key] = value end
    local _, err = upload_record_repo.update_metadata(upload_id, upload.metadata)
    test.is_nil(err)
    return assert(upload_query_repo.get(upload_id)).metadata
end

local function safe_warnings(): {any}
    local warnings = {}
    for _, record in ipairs(stage_logger.records) do
        local encoded = assert(json.encode(record))
        test.is_nil((encoded:find("/private/", 1, true)))
        test.is_nil((encoded:find("stack traceback", 1, true)))
        test.is_nil((encoded:find("renderer.lua:42", 1, true)))
        test.is_true(#encoded < 1024)
        if record.level == "warn" then warnings[#warnings + 1] = record end
    end
    test.eq(#warnings, 1)
    return warnings
end

local function define_tests()
    test.describe("kickside.uploads.rasterize discovery", function()
        test.it("resolves a PDF rasterizer by mime", function()
            local pdf = rasterizer.find_by_mime("application/pdf")
            test.not_nil(pdf)
            test.eq(pdf.processor_func, RASTERIZE_PDF)
        end)

        test.it("returns nil for mimes no rasterizer handles", function()
            for _, mime in ipairs({"image/png", "text/plain", "application/zip", ""}) do
                local found, err = rasterizer.find_by_mime(mime)
                test.is_nil(found); test.is_nil(err, tostring(err))
            end
            local found, err = rasterizer.find_by_mime(nil)
            test.is_nil(found); test.is_nil(err, tostring(err))
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
        for _, spec in ipairs({
            {name = "returned string", failure = PRIVATE_ERROR, kind = "string", code = "render_failed"},
            {name = "returned classification", failure = {kind = "invalid", code = "bad_document", message = PRIVATE_ERROR},
                kind = "invalid", code = "bad_document"},
            {name = "invalid classification", failure = {kind = PRIVATE_ERROR, code = string.rep("x", 65), message = PRIVATE_ERROR},
                kind = "table", code = "render_failed"},
            {name = "thrown string", failure = PRIVATE_ERROR, throw = true, code = "render_failed"},
        }) do
            for _, partial in ipairs({false, true}) do
                test.it("bounds and redacts " .. spec.name .. (partial and " page failures" or " document failures"), function()
                    local path = scripted_document({total = 16, fail_all = not partial,
                        fail_pages = partial and {2, 10} or nil, failure = spec.failure, throw = spec.throw})
                    local upload_id = seed_document(SCRIPTED_MIME, "")
                    stage_logger.records = {}
                    local result = stage_fixture.process({upload_id = upload_id, mime_type = SCRIPTED_MIME,
                        storage_id = STORAGE_ID, storage_path = path, size = FIXTURE_SIZE})
                    test.is_true(result.success); test.eq(result.completed, false)
                    test.eq(result.metadata.rendered_page_count, partial and 14 or 0)
                    local failures = result.metadata.rasterize_failures
                    test.eq(#failures, partial and 2 or 1)
                    test.eq(failures[1].code, spec.code)
                    test.eq(failures[1].error, "Unable to render document pages.")
                    test.eq(failures[1].page, partial and 2 or nil)
                    local warnings = safe_warnings()
                    test.eq(#stage_logger.records, 3)
                    test.eq(warnings[1].fields.failed_first_page, partial and 2 or 1)
                    test.eq(warnings[1].fields.failed_last_page, partial and 10 or 16)
                    local diagnostic = warnings[1].fields.diagnostic
                    test.not_nil(diagnostic)
                    test.eq(diagnostic.message, "Unable to render document pages.")
                    test.eq(diagnostic.code, spec.code)
                    test.eq(diagnostic.kind, spec.kind or failures[1].kind)
                    test.not_nil(diagnostic.kind)
                    test.eq(diagnostic.attempt, partial and "single_page_probe" or "batch")
                    test.eq(diagnostic.first_page, partial and 2 or 1)
                    test.eq(diagnostic.last_page, partial and 2 or 8)
                    test.eq(#script_state(path).calls, partial and 19 or 10)
                end)
            end
            test.it("redacts " .. spec.name .. " page count failures", function()
                local path = scripted_document({total = 16, count_error = true,
                    failure = spec.failure, throw = spec.throw})
                local upload_id = seed_document(SCRIPTED_MIME, "")
                stage_logger.records = {}
                local result = stage_fixture.process({upload_id = upload_id, mime_type = SCRIPTED_MIME,
                    storage_id = STORAGE_ID, storage_path = path, size = FIXTURE_SIZE})
                test.is_true(result.success); test.eq(result.completed, false)
                local failures = result.metadata.rasterize_failures
                test.eq(#failures, 1)
                local expected_code = spec.code == "bad_document" and spec.code or "page_count_failed"
                test.eq(failures[1].code, expected_code)
                test.eq(failures[1].error, "Unable to count document pages.")
                local diagnostic = safe_warnings()[1].fields.diagnostic
                test.eq(#stage_logger.records, 1)
                test.eq(diagnostic.code, expected_code)
                test.eq(diagnostic.kind, spec.kind or failures[1].kind)
                test.eq(diagnostic.attempt, "count")
                test.eq(#script_state(path).calls, 1)
            end)
        end

        test.it("reports the remaining range when a later batch cannot render", function()
            local path = scripted_document({total = 24, fail_pages = {9, 10, 11, 12, 13, 14, 15, 16},
                failure = PRIVATE_ERROR})
            local upload_id = seed_document(SCRIPTED_MIME, "")
            stage_logger.records = {}
            local result = stage_fixture.process({upload_id = upload_id, mime_type = SCRIPTED_MIME,
                storage_id = STORAGE_ID, storage_path = path, size = FIXTURE_SIZE})
            test.is_true(result.success)
            test.eq(result.completed, false)
            test.eq(result.metadata.rendered_page_count, 8)
            local failures = result.metadata.rasterize_failures
            test.eq(#failures, 1)
            test.is_nil(failures[1].page)
            local fields = safe_warnings()[1].fields
            test.eq(fields.diagnostic.first_page, 9)
            test.eq(fields.diagnostic.last_page, 16)
            test.eq(fields.failed_first_page, 9)
            test.eq(fields.failed_last_page, 24)
            test.eq(#script_state(path).calls, 11)
        end)

        test.it("keeps individual failures when a rescued page exceeds the image limit", function()
            local path = scripted_document({total = 2, fail_pages = {1}, large_page = 2,
                always_large = true, failure = PRIVATE_ERROR})
            local id = seed_document(SCRIPTED_MIME, "")
            local result = run_stage(id, SCRIPTED_MIME, FIXTURE_SIZE, path)
            test.eq(result.completed, false)
            local failures = result.metadata.rasterize_failures
            test.eq(#failures, 2)
            test.eq(failures[1].page, 1)
            test.eq(failures[1].code, "render_failed")
            test.eq(failures[2].page, 2)
            test.eq(failures[2].code, "image_too_large")
            test.eq(#rendered_pages(id), 0)
        end)

        test.it("refits only the page exceeding the byte budget and retains its effective quality", function()
            local path = scripted_document({total = 2, large_page = 2})
            local id = seed_document(SCRIPTED_MIME, "<!-- page 1 -->\n\n<!-- page 2 -->")
            local result = run_stage(id, SCRIPTED_MIME, FIXTURE_SIZE, path)
            test.is_true(result.completed)
            local pages = rendered_pages(id)
            test.eq(pages[1].metadata.quality, 90)
            test.eq(pages[2].metadata.quality, 75)
            test.eq(pages[2].metadata.dpi, 150)
            local calls = script_state(path).calls
            test.eq(#calls, 3)
            test.eq(#calls[3], 1)
            test.eq(calls[3][1], 2)
        end)

        test.it("replaces an oversized cached render even when the extracted scan covers the page", function()
            local path = scripted_document({total = 1})
            local id = seed_document(SCRIPTED_MIME, "<!-- page 1 -->")
            local old, err = artifact_content_repo.create_artifact({upload_id = id, kind = "image",
                role = "rendered-page", mime_type = "image/jpeg", ordinal = 2001,
                content = string.rep("x", 3932161), storage_id = STORAGE_ID, metadata = {page = 1}})
            test.is_nil(err)
            local _, scan_err = artifact_content_repo.create_artifact({upload_id = id, kind = "image",
                role = "extracted-image", mime_type = "image/png", ordinal = 1,
                content = string.rep("x", 60000), storage_id = STORAGE_ID,
                metadata = {page = 1, width = 200, height = 300}})
            test.is_nil(scan_err)
            test.is_true(run_stage(id, SCRIPTED_MIME, FIXTURE_SIZE, path).completed)
            local pages = page_images.page_set(id, 51200)
            test.eq(#pages, 1)
            test.eq(pages[1].artifact_id, old.artifact_id)
            test.is_true(pages[1].size < 3932161)
        end)

        test.it("renders an octet-stream scan and fits a poster to the OCR dimensions", function()
            local id = seed_document("application/pdf", "<!-- page 1 -->")
            local path = id .. ".pdf"
            local storage = assert(fs.get(STORAGE_ID))
            assert(storage:writefile(path, fixtures.poster))
            local _, err = artifact_content_repo.create_artifact({upload_id = id, kind = "image",
                role = "extracted-image", mime_type = "application/octet-stream", ordinal = 1,
                content = string.rep("x", 60000), storage_id = STORAGE_ID, metadata = {page = 1}})
            test.is_nil(err)
            local result = run_stage(id, "application/pdf", FIXTURE_SIZE, path)
            test.is_true(result.completed)
            local pages = page_images.page_set(id, 51200)
            test.eq(#pages, 1)
            local page = pages[1]
            test.eq(page.role, "rendered-page")
            test.eq(page.mime_type, "image/jpeg")
            test.is_true(page.metadata.dpi < 150)
            test.eq(page.metadata.quality, 90)
            local bytes = assert(artifact_content_repo.read_artifact_content(id, page.artifact_id))
            local width, height = page_images.pixel_size(bytes)
            test.eq(width, page.metadata.width)
            test.eq(height, page.metadata.height)
            test.is_true(height > width and height <= 2576)
            test.is_true(#bytes <= 3932160)
            test.is_true(run_stage(id, "application/pdf", FIXTURE_SIZE, path).metadata.rasterize_skipped)
        end)

        test.it("reuses and orders mixed numeric and string page identities", function()
            local id = seed_document(SCRIPTED_MIME, "<!-- page 1 -->\n\n<!-- page 2 -->")
            for page = 1, 2 do
                local _, err = artifact_content_repo.create_artifact({upload_id = id, kind = "image",
                    role = page == 1 and "extracted-image" or "rendered-page", mime_type = "image/png",
                    ordinal = 2000 + page, content = string.rep("I", 60000),
                    storage_id = STORAGE_ID, metadata = {page = page == 1 and page or tostring(page),
                        width = 100, height = 200}})
                test.is_nil(err)
            end
            local images = page_images.page_set(id, 51200)
            test.eq(#images, 2)
            test.eq(images[1].metadata.page, 1)
            test.eq(images[2].metadata.page, 2)
            local path = scripted_document({total = 2})
            local result = run_stage(id, SCRIPTED_MIME, FIXTURE_SIZE, path)
            test.is_true(result.metadata.rasterize_skipped)
            test.eq(#script_state(path).calls, 1)
        end)

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
            local path = scripted_document({total = 1, fail_all = true, failure = "renderer refuses the document"})
            local upload_id = seed_document(SCRIPTED_MIME, "<!-- page 1 -->")
            for index = 1, 2 do
                local _, err = artifact_content_repo.create_artifact({upload_id = upload_id,
                    kind = "image", role = "extracted-image", mime_type = "image/png", ordinal = index,
                    content = string.rep(tostring(index), 60000), storage_id = STORAGE_ID, metadata = {page = 1}})
                test.is_nil(err)
            end
            local result, err = executor("user-raster"):call(RASTERIZE_STAGE, {upload_id = upload_id,
                mime_type = SCRIPTED_MIME, size = FIXTURE_SIZE, storage_id = STORAGE_ID, storage_path = path})
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(#rendered_pages(upload_id), 0)
            test.eq(#page_images.page_set(upload_id, 51200), 0)
        end)

        test.it("renders the other pages and reports each page that fails to render", function()
            local flaky = "application/x-kickside-flaky-pdf"
            local upload_id = seed_document(flaky, "")
            local result = run_stage(upload_id, flaky)
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, 2)
            local failures = result.metadata.rasterize_failures
            test.not_nil(failures)
            test.eq(#failures, 1)
            test.eq(failures[1].page, 2)
            test.eq(failures[1].error, "Unable to render document pages.")
            test.eq(failures[1].code, "render_failed")
            local images = rendered_pages(upload_id)
            test.eq(#images, 2)
            test.eq(images[1].metadata.page, 1)
            test.eq(images[2].metadata.page, 3)
        end)

        test.it("reports one document failure when the renderer refuses every page", function()
            local path = scripted_document({total = 2, fail_all = true, failure = "renderer refuses the document"})
            local upload_id = seed_document(SCRIPTED_MIME, "")
            local result = run_stage(upload_id, SCRIPTED_MIME, nil, path)
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, 0)
            test.eq(#result.metadata.rasterize_failures, 1)
            test.is_nil(result.metadata.rasterize_failures[1].page)
            test.not_nil(result.metadata.rasterize_failures[1].error)
        end)

        test.it("bounds a document-wide failure to one batch and its individual pages", function()
            local path = scripted_document({ total = 16, fail_all = true,
                failure = { code = "renderer_unavailable", kind = "unavailable", message = PRIVATE_ERROR } })
            local upload_id = seed_document(SCRIPTED_MIME, "")
            local started = time.now():unix_nano()
            local result = run_stage(upload_id, SCRIPTED_MIME, nil, path)
            test.is_true(time.now():unix_nano() - started < 5 * time.SECOND)
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, 0)
            test.eq(#script_state(path).calls, 10) -- Count, batch, then eight individual pages.
            local failures = result.metadata.rasterize_failures
            test.eq(#failures, 1)
            test.is_nil(failures[1].page)
            test.eq(failures[1].code, "renderer_unavailable")
            test.eq(failures[1].kind, "unavailable")
            test.eq(failures[1].error, "Unable to render document pages.")
        end)

        test.it("keeps private renderer text out of count and render failures", function()
            for _, failure in ipairs({ PRIVATE_ERROR, { code = "bad_document", kind = "invalid", message = PRIVATE_ERROR },
                { code = PRIVATE_ERROR, kind = PRIVATE_ERROR, message = PRIVATE_ERROR } }) do
                for _, count_error in ipairs({ false, true }) do
                    local path = scripted_document({ total = 1, fail_all = true, count_error = count_error, failure = failure })
                    local result = run_stage(seed_document(SCRIPTED_MIME, ""), SCRIPTED_MIME, nil, path)
                    test.is_true(result.success)
                    local reported = result.metadata.rasterize_failures[1]
                    test.eq(reported.error, count_error and "Unable to count document pages." or "Unable to render document pages.")
                    local expected = type(failure) == "table" and failure.code == "bad_document" and "bad_document"
                        or (count_error and "page_count_failed" or "render_failed")
                    test.eq(reported.code, expected)
                    test.is_nil((assert(json.encode(result.metadata)):find("private", 1, true)))
                    test.is_nil((assert(json.encode(result.metadata)):find("stack", 1, true)))
                end
            end
            for _, count_error in ipairs({ false, true }) do
                local path = scripted_document({ total = 1, fail_all = true, count_error = count_error,
                    throw = true, failure = PRIVATE_ERROR })
                local result = run_stage(seed_document(SCRIPTED_MIME, ""), SCRIPTED_MIME, nil, path)
                test.eq(result.metadata.rasterize_failures[1].error,
                    count_error and "Unable to count document pages." or "Unable to render document pages.")
            end
        end)

        test.it("continues rescuing pages across batches after partial render success", function()
            local path = scripted_document({ total = 16, fail_pages = { 2, 10 }, failure = "page cannot render" })
            local upload_id = seed_document(SCRIPTED_MIME, "")
            local result = run_stage(upload_id, SCRIPTED_MIME, nil, path)
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, 14)
            test.eq(#result.metadata.rasterize_failures, 2)
            test.eq(result.metadata.rasterize_failures[1].page, 2)
            test.eq(result.metadata.rasterize_failures[2].page, 10)
            test.eq(#rendered_pages(upload_id), 14)
        end)

        test.it("clears recorded failures on every clean reconciliation skip", function()
            for _, skip in ipairs({ "nothing_missing", "no_selected_pages", "extracted_coverage", "no_pages" }) do
                local markdown = skip == "no_selected_pages" and string.rep("Usable text. ", 1000) or ""
                local upload_id = seed_document(SCRIPTED_MIME, markdown)
                local failed_path = scripted_document({ total = 2, count_error = true, failure = PRIVATE_ERROR })
                local failed = run_stage(upload_id, SCRIPTED_MIME, nil, failed_path)
                test.eq(#save_stage_metadata(upload_id, failed).rasterize_failures, 1)
                if skip == "nothing_missing" or skip == "extracted_coverage" then
                    for page = 1, 2 do
                        local _, err = artifact_content_repo.create_artifact({ upload_id = upload_id, kind = "image",
                            role = skip == "nothing_missing" and "rendered-page" or "extracted-image",
                            mime_type = "image/jpeg", ordinal = 2000 + page, content = string.rep("X", 60000),
                            storage_id = STORAGE_ID, metadata = { page = page } })
                        test.is_nil(err)
                    end
                end
                local clean_path = scripted_document({ total = skip == "no_pages" and 0 or 2 })
                local clean = run_stage(upload_id, SCRIPTED_MIME, nil, clean_path)
                test.is_true(clean.success)
                test.eq(#script_state(clean_path).calls, 1)
                test.eq(save_stage_metadata(upload_id, clean).rasterize_failures, false)
            end
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

        test.it("renders text-layer pages when the page selection is all", function()
            local text_layer = string.rep("A usable text layer. ", 100)
            local markdown = "<!-- page 1 -->\n\n" .. text_layer .. "\n\n<!-- page 2 -->\n\n" .. text_layer
            local upload_id = seed_document("application/pdf", markdown)
            local settings = assert(assert(contract.get("kickside.settings:settings")):open())
            test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_page_selection", value = "all"}).success)
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_page_selection", value = "sparse"}).success)
            test.is_true(result.success)
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(result.metadata.rasterize_reason, "all_pages")
            local images = rendered_pages(upload_id)
            test.eq(#images, FIXTURE_PAGES)
            for page = 1, FIXTURE_PAGES do test.eq(images[page].metadata.page, page) end
            test.eq(assert(artifact_parts_repo.read_primary_content(upload_id)).content, markdown)
        end)

        test.it("leaves text-layer pages unrendered under the default sparse selection", function()
            local text_layer = string.rep("A usable text layer. ", 100)
            local markdown = "<!-- page 1 -->\n\n" .. text_layer .. "\n\n<!-- page 2 -->\n\n" .. text_layer
            local upload_id = seed_document("application/pdf", markdown)
            local result = run_stage(upload_id, "application/pdf")
            test.is_true(result.success)
            test.eq(result.metadata.rasterize_failures, false)
            test.is_nil(result.metadata.rendered_page_count)
            test.eq(#rendered_pages(upload_id), 0)
            test.eq(assert(artifact_parts_repo.read_primary_content(upload_id)).content, markdown)
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

        test.it("heartbeats the processing job after each rendered batch without rewriting it", function()
            local job_id = uuid_v4()
            local db = assert(sql.get("app:db"))
            assert(sql.builder.insert("kickside_job"):set_map({ id = job_id, job_type = "raster.fixture",
                job_identity = job_id, owner_kind = "installation", owner_id = "raster-fixture", status = "running",
                lease_token = "raster-lease", execution_seq = 1, lease_until = "2100-01-01 00:00:00" })
                :run_with(db):exec())
            local controls = assert(process.listen(proc_supervisor.CONTROL_TOPIC))
            local name = proc_supervisor.execution_name(job_id, "raster-lease")
            assert(process.registry.register(name, nil, process.registry.CONSISTENT))
            local path = scripted_document({total = 16})
            local rendered, err = executor("user-raster"):call(RASTERIZE_STAGE, {
                upload_id = seed_document(SCRIPTED_MIME, ""), mime_type = SCRIPTED_MIME,
                storage_id = STORAGE_ID, storage_path = path, size = FIXTURE_SIZE,
                cancel_ref = { job_id = job_id, lease_token = "raster-lease", execution_seq = 1 },
            })
            test.is_nil(err)
            test.is_true(rendered.success, json.encode(rendered))
            test.eq(rendered.metadata.rendered_page_count, 16)
            for _ = 1, 2 do
                local signal = channel.select({controls:case_receive(), time.after("5s"):case_receive()})
                test.eq(signal.channel, controls)
                test.eq(signal.value.kind, "heartbeat")
                test.eq(signal.value.job_id, job_id)
                test.eq(signal.value.lease_token, "raster-lease")
                test.eq(signal.value.execution_seq, 1)
            end
            test.is_true(channel.select({controls:case_receive(), default = true}).default)
            test.is_nil(assert(db:query("SELECT heartbeat_at FROM kickside_job WHERE id=$1", {job_id}))[1].heartbeat_at)
            assert(process.registry.unregister(name, process.registry.CONSISTENT))
            assert(sql.builder.delete("kickside_job"):where("id = ?", job_id):run_with(db):exec())
            db:release()
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
            test.eq(result.metadata.rasterize_failures, false)
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

        test.it("renders sparse marked pages even when the source is smaller than the size threshold", function()
            test.is_true(#fixtures.pdf < 4096)
            local upload_id = seed_document("application/pdf", "<!-- page 1 -->\n\n<!-- page 2 -->\n")
            local result = run_stage(upload_id, "application/pdf", #fixtures.pdf)
            test.is_true(result.success)
            test.not_nil(result.metadata)
            test.eq(result.metadata.rendered_page_count, FIXTURE_PAGES)
            test.eq(#rendered_pages(upload_id), FIXTURE_PAGES)
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
