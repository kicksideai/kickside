-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fetch_url = require("fetch_url")
local http_stub = require("http_stub")
local llm_stub = require("llm_stub")

local function define_tests()
    test.describe("kb_ingest fetch_url extraction", function()
        test.it("extracts from the complete fetched page", function()
            local page = string.rep("Line of page text about the product.\n", 4000)
            local source_text = nil
            http_stub.get = function()
                return { status_code = 200, headers = { ["Content-Type"] = "text/plain" }, body = page }, nil
            end
            llm_stub.generate = function(builder)
                for _, message in ipairs(builder:get_messages()) do
                    if message.role == "user" then
                        for _, part in ipairs(message.content) do
                            source_text = part.text
                        end
                    end
                end
                return { result = "# Extracted" }, nil
            end

            local result, err = fetch_url.handle({
                url = "https://example.com/page.txt",
                kb_id = "kb-fetch-url",
                extract_prompt = "Summarize the page",
                embed = false,
            })
            test.is_nil(err)
            test.eq(result.content, "# Extracted")
            test.not_nil(source_text)
            local _, source_start = source_text:find("Source content:\n", 1, true)
            local extracted_from = source_text:sub(source_start + 1)
            test.eq(#extracted_from, #page)
            test.is_true(extracted_from == page, "the extraction prompt carries the complete page")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
