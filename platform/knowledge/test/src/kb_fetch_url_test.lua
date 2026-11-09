-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fetch_url = require("fetch_url")
local http_stub = require("http_stub")
local llm_stub = require("llm_stub")
local component_stub = require("component_stub")

local function define_tests()
	test.describe("kb_ingest fetch_url extraction", function()
        for _, engine in ipairs({ "document", "wiki", "memory" }) do
            test.it("admits fetched text through the " .. engine .. " binding", function()
                local request = nil
                local receipt = { success = true, thread_id = "kb-fetch-url", external_id = "url:page", external_version = "v2",
                    trace_context = { trace_id = "fetch-trace" }, source_ref = { kind = "url" } }
                if engine == "memory" then receipt.run_id = "derive-run" else receipt.projection_id = "projection" end
                component_stub.open = function(id, access, contract_id)
                    test.eq(id, "kb-fetch-url")
                    test.eq(access, component_stub.ACCESS.WRITE)
                    test.eq(contract_id, "kickside.contract:embeddable")
                    return { embed_content = function(_, args) request = args; return receipt, nil end }, nil
                end
                http_stub.get = function()
                    return { status_code = 200, headers = { ["Content-Type"] = "text/plain" }, body = "Reference text" }, nil
                end
                local result, err = fetch_url.handle({ url = "https://example.com/page.txt", kb_id = "kb-fetch-url", external_version = "v2" })
                test.is_nil(err, tostring(err))
                test.not_nil(request)
                test.eq(request.content, "Reference text")
                test.eq(request.source_ref.kind, "url")
                test.eq(request.external_version, "v2")
                for key, value in pairs(receipt) do test.eq(result[key], value, key) end
            end)
        end
        test.it("returns the bound engine's refusal without admitting a document", function()
            component_stub.open = function()
                return { embed_content = function() return { success = false, error = "content admission refused" }, nil end }, nil
            end
            http_stub.get = function()
                return { status_code = 200, headers = { ["Content-Type"] = "text/plain" }, body = "Reference text" }, nil
            end
            local result, err = fetch_url.handle({ url = "https://example.com/page.txt", kb_id = "kb-fetch-url" })
            test.is_nil(result)
            test.contains(tostring(err), "content admission refused")
        end)
		test.it("extracts from the complete fetched page", function()
			local page = string.rep("Line of page text about the product.\n", 4000)
			local source_text: string? = nil
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
			local captured = assert(source_text, "Extraction includes a user message")
			local _, source_start = captured:find("Source content:\n", 1, true)
			local extracted_from = captured:sub(assert(source_start, "Source content marker is present") + 1)
			test.eq(#extracted_from, #page)
			test.is_true(extracted_from == page, "the extraction prompt carries the complete page")
		end)
	end)
end

return { run = test.run_cases(define_tests) }
