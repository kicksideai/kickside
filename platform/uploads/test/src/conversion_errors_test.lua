-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local records = require("records")
local uuid = require("uuid")
local fs = require("fs")
local funcs = require("funcs")

local function convert(bytes: string): (any, any)
    local upload_id = "conversion-error-" .. uuid.v4()
    local path = upload_id .. ".pdf"
    local storage = assert(fs.get("app:uploads"))
    assert(storage:writefile(path, bytes))
    assert(records.create(upload_id, "conversion-error-user", #bytes, "application/pdf", "app:uploads",
        path, "documents", { filename = "scan.pdf" }, "uploaded"))
    return funcs.new():call("app:classified_documents_processor", {
        upload_id = upload_id,
        storage_id = "app:uploads",
        storage_path = path,
        mime_type = "application/pdf",
        size = #bytes,
        metadata = { filename = "scan.pdf" },
        options = { extract_images = true },
    })
end

local function define_tests()
    test.describe("document conversion errors", function()
        test.it("keeps a retryable conversion failure retryable", function()
            local result, err = convert("convert-unavailable")
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(err:retryable())
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.contains(tostring(err), "converter call deadline exceeded")
        end)

        test.it("keeps a retryable page resource failure retryable", function()
            local result, err = convert("pages-unavailable")
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(err:retryable())
            test.eq(err:kind(), errors.UNAVAILABLE)
        end)

        test.it("keeps an undecodable document permanent", function()
            local result, err = convert("convert-invalid")
            test.is_nil(result)
            test.not_nil(err)
            test.is_false(err:retryable())
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("converts a document whose converter succeeds", function()
            local result, err = convert("converts")
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(result.metadata.image_artifact_count, 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
