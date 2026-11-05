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
        test.it("does not call ~100 KB of extracted text empty", function()
            local body = large_text(100 * 1024)
            test.is_nil(page_images.ocr_text_reason(body, 20, 800))
        end)

        test.it("still calls whitespace-only text empty", function()
            test.eq(page_images.ocr_text_reason(string.rep(" \n", 60000), 20, 800), "empty_text")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
