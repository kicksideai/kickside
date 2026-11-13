-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local text_trim = require("text_trim")
local page_images = require("page_images")

local LINE = "Section 1.1: the intake service shall validate consignor and consignee.\n"

local function large_text(bytes: integer): string
    return string.rep(LINE, math.floor(bytes / #LINE))
end

local function define_tests()
    test.describe("text_trim", function()
        test.it("trims short strings and gives empty for non-strings", function()
            test.eq(text_trim.trim("  a b \t\n"), "a b")
            test.eq(text_trim.trim("ab"), "ab")
            test.eq(text_trim.trim(""), "")
            test.eq(text_trim.trim(nil), "")
            test.eq(text_trim.trim(42), "")
        end)

        test.it("gives empty for a string of whitespace only", function()
            test.eq(text_trim.trim(string.rep(" \t\r\n", 30000)), "")
        end)

        test.it("trims ~100 KB of text the anchored pattern gives up on", function()
            local body = large_text(100 * 1024)
            local trimmed_body = body:sub(1, #body - 1)
            test.eq(#text_trim.trim("  \n" .. body .. " \t\n"), #trimmed_body)
            test.eq(text_trim.trim("  \n" .. body .. " \t\n"), trimmed_body)
        end)
    end)

    test.describe("page_images on large text", function()
        test.it("uses committed page outcomes before reconsidering text length", function()
            local pages = page_images.text_pages("<!-- page 1 -->\n\nshort\n\n<!-- page 2 -->", {{page = 1, status = "readable"}, {page = 2, status = "failed"}})
            test.is_nil(page_images.ocr_text_reason(pages[1].text, 1, 800, pages[1].status))
            test.eq(page_images.ocr_text_reason(pages[2].text, 1, 800, pages[2].status), "failed_page")
            test.is_nil(page_images.ocr_text_reason("", 1, 800, "blank"))
        end)

        test.it("selects sparse text by length and preserves prose, code, spaced CJK and numeric tables", function()
            test.is_nil(page_images.ocr_text_reason(string.rep("A readable paragraph has ordinary words. ", 100), 1, 800))
            test.eq(page_images.ocr_text_reason("Figure 1: a short caption.", 1, 800), "sparse_text_per_page")
            test.is_nil(page_images.ocr_text_reason(string.rep("x ! @ # q % ^ & z ", 200), 1, 800))
            test.is_nil(page_images.ocr_text_reason(string.rep("x = y + z; ", 200), 1, 800))
            test.is_nil(page_images.ocr_text_reason(string.rep("中 文 字 符 ", 200), 1, 800))
            test.is_nil(page_images.ocr_text_reason(string.rep("2026 15.50 1200 800 99% 2030\n", 100), 1, 800))
        end)
        test.it("verifies explicit page coverage rather than image count", function()
            local function image(page) return {metadata = {page = page}} end
            test.is_true(page_images.complete_coverage({image(2), image(1)}, 2))
            test.is_false(page_images.complete_coverage({image(1), image(1)}, 2))
            test.is_false(page_images.complete_coverage({image(1), image(3)}, 2))
            test.is_false(page_images.complete_coverage({image(1), {metadata = {}}}, 2))
            test.is_true(page_images.complete_coverage({{metadata = {}}, {metadata = {}}}, 2))
        end)

        test.it("does not call ~100 KB of extracted text empty", function()
            local body = large_text(100 * 1024)
            test.is_nil(page_images.ocr_text_reason(body, 20, 800))
        end)

        test.it("still calls whitespace-only text empty", function()
            test.eq(page_images.ocr_text_reason(string.rep(" \n", 60000), 20, 800), "empty_text")
        end)
    end)

    test.describe("page_images page selection", function()
        local RICH = string.rep("A readable paragraph from the text layer. ", 60)

        test.it("selects every page with a text layer under the all selection", function()
            test.eq(page_images.ocr_text_reason(RICH, 1, 800, nil, page_images.SELECT_ALL), "all_pages")
            test.eq(page_images.ocr_document_reason(RICH, 1, 800, 1000, page_images.SELECT_ALL), "all_pages")
            test.eq(page_images.ocr_text_reason("", 1, 800, nil, page_images.SELECT_ALL), "empty_text")
            test.eq(page_images.ocr_text_reason(RICH, 1, 800, "failed", page_images.SELECT_ALL), "failed_page")
            test.is_nil(page_images.ocr_text_reason(RICH, 1, 800, "readable", page_images.SELECT_ALL))
            test.is_nil(page_images.ocr_text_reason("", 1, 800, "blank", page_images.SELECT_ALL))
        end)

        test.it("replaces the text layer of a selected text page with its OCR text", function()
            local content = "<!-- page 1 -->\n\n" .. RICH .. "\n\n<!-- page 2 -->\n\n" .. RICH
            local sections = {}
            for _, page in ipairs(page_images.text_pages(content)) do
                if page_images.needs_ocr_text(page.text, 1, 800, page.status, page_images.SELECT_ALL) then
                    sections[#sections + 1] = {page = page.page, text = "OCR transcript of page " .. page.page}
                end
            end
            test.eq(#sections, 2)
            test.eq(page_images.replace_pages(content, sections),
                "<!-- page 1 -->\n\nOCR transcript of page 1\n\n<!-- page 2 -->\n\nOCR transcript of page 2")
        end)

        test.it("keeps existing page text when OCR returns blank or fails", function()
            for _, body in ipairs({RICH, "A short text layer."}) do
                local content = "<!-- page 1 -->\n\n" .. body .. "\n\n<!-- page 2 -->\n\nOther page"
                for _, blank in ipairs({"", " \t\r\n"}) do
                    test.eq(page_images.replace_pages(content, {{page = 1, text = blank}}), content)
                end
                test.eq(page_images.replace_pages(content, {}), content)
                test.eq(page_images.replace_pages(content, {{page = 1}}), content)
                test.is_true(page_images.needs_ocr_text(body, 1, 800, "blank", page_images.SELECT_ALL))
                test.eq(page_images.ocr_text_reason(body, 1, 800, "failed", page_images.SELECT_ALL), "failed_page")
            end
        end)

        test.it("keeps unmarked text unless every page has usable replacement text", function()
            local original = "Unmarked document text."
            for _, missing in ipairs({false, "", " \t\n"}) do
                local replacements = {{page = 1, text = "First OCR page"}, {page = 2, text = missing or nil}}
                test.eq(page_images.replace_pages(original, replacements), original)
            end
            test.eq(page_images.replace_pages(original, {}), original)
            test.eq(page_images.replace_pages(original, {{page = 1, text = "First OCR page"}, {page = 2, text = "Second OCR page"}}),
                "<!-- page 1 -->\n\nFirst OCR page\n\n<!-- page 2 -->\n\nSecond OCR page")
        end)

        test.it("commits blank OCR only for a page without usable text", function()
            local content = "<!-- page 1 -->\n\n \t\n"
            local replaced = page_images.replace_pages(content, {{page = 1, text = " \t\n"}})
            test.eq(replaced, "<!-- page 1 -->\n\n")
            local page = page_images.text_pages(replaced, {{page = 1, status = "blank"}})[1]
            test.eq(page.status, "blank")
            test.is_false(page_images.needs_ocr_text(page.text, 1, 800, page.status, page_images.SELECT_SPARSE))
            test.is_false(page_images.needs_ocr_text(page.text, 1, 800, page.status, page_images.SELECT_ALL))
        end)

        -- Golden results from page_images predicates at 3fff84187005155c49d2c96bb4f0184319668ac5.
        local GOLDEN = {
            {nil, nil, nil, nil, {"empty_text", false, false, "failed_page", "empty_text"}, "empty_text"},
            {42, 0, -1, 0, {"empty_text", false, false, "failed_page", "empty_text"}, "empty_text"},
            {"", 1, 800, 1000000, {"empty_text", false, false, "failed_page", "empty_text"}, "empty_text"},
            {" \t\n", 2, 800, 1000000, {"empty_text", false, false, "failed_page", "empty_text"}, "empty_text"},
            {"caption", 1, 800, 1000000, {"sparse_text_per_page", false, false, "failed_page", "sparse_text_per_page"}, "sparse_text_per_page"},
            {string.rep("x", 800), 1, 800, 1000, {"sparse_text_per_page", false, false, "failed_page", "sparse_text_per_page"}, "sparse_text_per_page"},
            {string.rep("x", 801), 1, 800, 1000, {false, false, false, "failed_page", false}, false},
            {string.rep("x", 2000), 2, 800, 1000, {"text_does_not_cover_pages", false, false, "failed_page", "text_does_not_cover_pages"}, "text_does_not_cover_pages"},
            {string.rep("x", 3200), 2, 800, 1000000, {false, false, false, "failed_page", false}, "low_text_to_source_ratio"},
            {string.rep("x", 6400), 2, 800, 1000000, {false, false, false, "failed_page", false}, false},
            {string.rep("x", 3000), 1, 800, 1000000, {false, false, false, "failed_page", false}, "low_text_to_source_ratio"},
            {string.rep("x", 3000), 1, 800, 1000, {false, false, false, "failed_page", false}, false},
            {"caption", "2", "4", 1000, {"sparse_text_per_page", false, false, "failed_page", "sparse_text_per_page"}, "sparse_text_per_page"},
            {"x", -2, 0, 1000, {"sparse_text_per_page", false, false, "failed_page", "sparse_text_per_page"}, "sparse_text_per_page"},
        }

        test.it("matches the recorded default predicates with absent and sparse selection", function()
            for _, sample in ipairs(GOLDEN) do
                local text, pages, max_text, size = sample[1], sample[2], sample[3], sample[4]
                for _, selection in ipairs({false, page_images.SELECT_SPARSE}) do
                    for index, status in ipairs({false, "readable", "blank", "failed", "unknown"}) do
                        local expected = sample[5][index] or nil
                        test.eq(page_images.ocr_text_reason(text, pages, max_text, status or nil, selection or nil), expected)
                        test.eq(page_images.needs_ocr_text(text, pages, max_text, status or nil, selection or nil), expected ~= nil)
                    end
                    test.eq(page_images.ocr_document_reason(text, pages, max_text, size, selection or nil), sample[6] or nil)
                    test.eq(page_images.needs_ocr_document(text, pages, max_text, size, selection or nil), sample[6] ~= false)
                end
            end
        end)

        test.it("keeps sparse replacement limited to sparse pages", function()
            test.is_nil(page_images.ocr_text_reason(RICH, 1, 800, nil, page_images.SELECT_SPARSE))
            local content = "<!-- page 1 -->\n\n" .. RICH .. "\n\n<!-- page 2 -->\n\nFigure 1."
            local sections = {}
            for _, page in ipairs(page_images.text_pages(content)) do
                if page_images.needs_ocr_text(page.text, 1, 800, page.status, page_images.SELECT_SPARSE) then
                    sections[#sections + 1] = {page = page.page, text = "OCR transcript"}
                end
            end
            test.eq(#sections, 1)
            test.eq(page_images.replace_pages(content, sections),
                "<!-- page 1 -->\n\n" .. RICH .. "\n\n<!-- page 2 -->\n\nOCR transcript")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
