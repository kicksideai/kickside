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
        local SAMPLES = {
            {"", 1, nil}, {"Figure 1: a short caption.", 1, nil}, {RICH, 1, nil}, {RICH, 3, nil},
            {"short", 1, "readable"}, {"", 1, "blank"}, {RICH, 1, "failed"},
        }

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

        test.it("keeps the sparse selection identical to the default", function()
            for _, sample in ipairs(SAMPLES) do
                local text, pages, status = sample[1], sample[2], sample[3]
                test.eq(page_images.ocr_text_reason(text, pages, 800, status, page_images.SELECT_SPARSE),
                    page_images.ocr_text_reason(text, pages, 800, status))
                test.eq(page_images.ocr_document_reason(text, pages, 800, 1000000, page_images.SELECT_SPARSE),
                    page_images.ocr_document_reason(text, pages, 800, 1000000))
            end
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
