local artifact_parts_repo = require("artifact_parts_repo")
local doc2md = require("doc2md")
local trim = require("text_trim").trim

-- Single source of truth for "what is a page image" of a document, shared by the
-- rasterize stage (which decides whether to skip rendering) and the OCR stage (which
-- decides what to transcribe). Keeping both on the same definition prevents the two
-- decisions from diverging.
local M = {}

M.DEFAULT_MIN_PAGE_BYTES = 51200
M.DEFAULT_MAX_TEXT_BYTES_PER_PAGE = 800
M.DEFAULT_CONFIDENT_TEXT_BYTES_PER_PAGE = 1600
M.DEFAULT_MIN_TEXT_SOURCE_RATIO = 0.02
-- Page selection: SELECT_SPARSE picks pages whose text layer is missing or sparse;
-- SELECT_ALL picks every page that has no committed OCR outcome.
M.SELECT_SPARSE = "sparse"
M.SELECT_ALL = "all"

local function sorted_by_ordinal(list: { any }): { any }
    table.sort(list, function(a, b) return (tonumber(a.ordinal) or 0) < (tonumber(b.ordinal) or 0) end)
    return list :: { any }
end

-- Derived images belong to the primary document's source revision. Historical
-- source artifacts remain addressable when an upload's bytes are replaced.
local function document_artifacts(upload_id: string): { any }
    local artifacts = artifact_parts_repo.list_artifacts(upload_id) or {}
    local source_id
    for _, artifact in ipairs(artifacts) do
        if artifact.role == "primary" and artifact.parent_artifact_id then
            source_id = artifact.parent_artifact_id
            break
        end
    end
    if not source_id then return artifacts end
    local current = {}
    for _, artifact in ipairs(artifacts) do
        if not artifact.parent_artifact_id or artifact.parent_artifact_id == source_id then
            current[#current + 1] = artifact
        end
    end
    return current
end

-- Rendered-page screenshots produced by the rasterizer.
function M.rendered(upload_id: string): { any }
    local artifacts = document_artifacts(upload_id)
    local out = {}
    for _, a in ipairs(artifacts) do
        if a.kind == "image" and a.role == "rendered-page" then out[#out + 1] = a end
    end
    return sorted_by_ordinal(out)
end

-- doc2md-extracted images large enough to be full pages (a page scan, not a logo or
-- inline figure). Byte size is the page-size proxy: a scanned page is substantial,
-- decorations are not. When in doubt the set is smaller, so the rasterizer renders.
function M.extracted_pages(upload_id: string, min_bytes: integer): { any }
    local artifacts = document_artifacts(upload_id)
    local counts = {}
    for _, a in ipairs(artifacts) do
        local page = type(a.metadata) == "table" and tonumber(a.metadata.page) or nil
        if a.kind == "image" and a.role == "extracted-image" and page then counts[page] = (counts[page] or 0) + 1 end
    end
    local out = {}
    for _, a in ipairs(artifacts) do
        if a.kind == "image" and a.role == "extracted-image" and (tonumber(a.size) or 0) >= min_bytes then
            local page = type(a.metadata) == "table" and tonumber(a.metadata.page) or nil
            if not page or (counts[page] == 1 and (not a.metadata.image_count or a.metadata.image_count == 1)) then
                out[#out + 1] = a
            end
        end
    end
    table.sort(out, function(a, b)
        local ap = type(a.metadata) == "table" and tonumber(a.metadata.page) or nil
        local bp = type(b.metadata) == "table" and tonumber(b.metadata.page) or nil
        return (ap or tonumber(a.ordinal) or 0) < (bp or tonumber(b.ordinal) or 0)
    end)
    return out
end

function M.complete_coverage(images: { any }, total: integer): boolean
    if #images ~= total then return false end
    local seen, numbered = {}, 0
    for _, image in ipairs(images) do
        local page = type(image.metadata) == "table" and tonumber(image.metadata.page) or nil
        if page then
            if page < 1 or page > total or page % 1 ~= 0 or seen[page] then return false end
            seen[page] = true
            numbered = numbered + 1
        end
    end
    return numbered == 0 or numbered == total
end

-- Only one large extracted image on a numbered page can stand for that page.
-- Multiple image resources require a rendered composite of the page.
function M.numbered_images(images: { any }): any
    local pages, counts = {}, {}
    for _, image in ipairs(images) do
        local page = type(image.metadata) == "table" and tonumber(image.metadata.page) or nil
        if page and page >= 1 and page % 1 == 0 then
            counts[page] = (counts[page] or 0) + 1
            pages[page] = image
        end
    end
    for page, count in pairs(counts) do if count ~= 1 then pages[page] = nil end end
    return pages
end

-- Screenshots take precedence for their page; uniquely numbered extracted scans
-- supply the remaining pages. Unnumbered artifacts retain the earlier selection.
function M.page_set(upload_id: string, min_bytes: integer): ({ any }, string)
    local rendered = M.rendered(upload_id)
    local extracted = M.extracted_pages(upload_id, min_bytes)
    local numbered = M.numbered_images(extracted)
    local legacy = true
    for _, artifact in ipairs(document_artifacts(upload_id)) do
        if artifact.kind == "image" and artifact.role == "extracted-image"
            and type(artifact.metadata) == "table" and artifact.metadata.page ~= nil then legacy = false; break end
    end
    if next(numbered) == nil and legacy then
        if #rendered > 0 then return rendered, "rendered" end
        return extracted, "extracted"
    end
    for _, image in ipairs(rendered) do
        local page = type(image.metadata) == "table" and tonumber(image.metadata.page) or nil
        if page then numbered[page] = image end
    end
    local pages = {}
    for _, image in pairs(numbered) do pages[#pages + 1] = image end
    table.sort(pages, function(a, b) return a.metadata.page < b.metadata.page end)
    return pages, #rendered > 0 and "rendered" or "extracted"
end

-- Keep the original page bodies and byte boundaries so OCR can replace only
-- selected pages without rewriting text extracted from the other pages.
function M.text_pages(content: any, outcomes: any?): { any }
    if type(content) ~= "string" then return {} end
    local by_page = {}
    for _, outcome in ipairs(outcomes or {}) do by_page[outcome.page] = outcome.status end
    local markers = doc2md.markers(content)
    local pages = {}
    for index, marker in ipairs(markers) do
        if marker.kind == "page" then
            local finish = markers[index + 1] and markers[index + 1].start - 1 or #content
            pages[#pages + 1] = { page = marker.number, start = marker.start, finish = finish,
                text = content:sub(marker.finish + 1, finish), status = by_page[marker.number] }
        end
    end
    return pages
end

function M.replace_pages(content: string, replacements: { any }): string
    local by_page = {}
    for _, section in ipairs(replacements) do by_page[section.page] = section.text end
    local parts, offset = {}, 1
    for _, page in ipairs(M.text_pages(content)) do
        parts[#parts + 1] = content:sub(offset, page.start - 1)
        local replacement = by_page[page.page]
        if replacement ~= nil and (trim(replacement) ~= "" or trim(page.text) == "") then
            parts[#parts + 1] = "<!-- page " .. page.page .. " -->\n\n" .. trim(replacement)
            if page.finish < #content then parts[#parts + 1] = "\n\n" end
        else
            parts[#parts + 1] = content:sub(page.start, page.finish)
        end
        offset = page.finish + 1
    end
    parts[#parts + 1] = content:sub(offset)
    return table.concat(parts)
end

function M.needs_ocr_text(content: any, page_count: any, max_text_per_page: any, status: any?, selection: string?): boolean
    return M.ocr_text_reason(content, page_count, max_text_per_page, status, selection) ~= nil
end

function M.ocr_text_reason(content: any, page_count: any, max_text_per_page: any, status: any?, selection: string?): string?
    if status == "readable" then return nil end
    if status == "failed" then return "failed_page" end
    local text = trim(content)
    if status == "blank" and text == "" then return nil end
    if text == "" then return "empty_text" end
    if selection == M.SELECT_ALL then return "all_pages" end

    local pages = math.max(1, math.floor(tonumber(page_count) or 1))
    local per_page = math.max(1, math.floor(tonumber(max_text_per_page) or M.DEFAULT_MAX_TEXT_BYTES_PER_PAGE))
    if #text <= (pages * per_page) then return "sparse_text_per_page" end

    if pages > 1 then
        local confident_per_page = math.max(per_page + 1, M.DEFAULT_CONFIDENT_TEXT_BYTES_PER_PAGE)
        if #text < (pages * confident_per_page) then return "text_does_not_cover_pages" end
    end

    return nil
end

function M.needs_ocr_document(content: any, page_count: any, max_text_per_page: any, source_size: any, selection: string?): boolean
    return M.ocr_document_reason(content, page_count, max_text_per_page, source_size, selection) ~= nil
end

function M.ocr_document_reason(content: any, page_count: any, max_text_per_page: any, source_size: any, selection: string?): string?
    local text_reason = M.ocr_text_reason(content, page_count, max_text_per_page, nil, selection)
    if text_reason then return text_reason end

    local size = tonumber(source_size) or 0
    if size < M.DEFAULT_MIN_PAGE_BYTES then return nil end

    local text = trim(content)
    if text == "" then return "empty_text" end

    local pages = math.max(1, math.floor(tonumber(page_count) or 1))
    local confident_per_page = math.max(
        math.floor(tonumber(max_text_per_page) or M.DEFAULT_MAX_TEXT_BYTES_PER_PAGE) + 1,
        M.DEFAULT_CONFIDENT_TEXT_BYTES_PER_PAGE
    )

    if (#text / size) < M.DEFAULT_MIN_TEXT_SOURCE_RATIO and #text < (pages * confident_per_page * 2) then
        return "low_text_to_source_ratio"
    end

    return nil
end

return M
