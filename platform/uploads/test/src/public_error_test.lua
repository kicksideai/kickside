local test = require("test")
local response = require("upload_response")
return { run = test.run_cases(function()
    test.describe("upload public processing errors", function()
        test.it("exposes a clean message in list and detail without mutating diagnostic state", function()
            local raw = 'upload stage "Converting to Markdown" (kickside.uploads.documents:processor) failed: kickside.uploads.documents:processor:211: PDF parsing error: startxref not found'
            local upload = { uuid = "file", status = "error", error = raw, metadata = {} }
            for _, format in ipairs({ response.format_list_upload, response.format_get_upload }) do
                local result = format(upload)
                test.eq(result.error, "Upload processing failed. Check the file and try again.")
            end
            test.eq(upload.error, raw)
        end)
        test.it("does not invent errors for successful uploads", function()
            test.is_nil(response.format_list_upload({ status = "completed", metadata = {} }).error)
        end)
    end)
end) }
