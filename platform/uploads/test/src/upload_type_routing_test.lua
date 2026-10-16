local test = require("test")
local upload_type = require("upload_type")

local function define_tests()
    test.describe("declared upload routing", function()
        for _, case in ipairs({
            { "rb", "application/x-ruby", "kickside.uploads:types.text" },
            { "bat", "application/x-msdos-program", "kickside.uploads:types.text" },
            { "ps1", "application/octet-stream", "kickside.uploads:types.text" },
            { "sql", "application/sql", "kickside.uploads:types.text" },
            { "toml", "application/octet-stream", "kickside.uploads:types.text" },
            { "yaml", "application/yaml", "kickside.uploads:types.text" },
            { "yml", "application/octet-stream", "kickside.uploads:types.text" },
            { "dot", "application/msword", "kickside.uploads.documents:types.documents" },
            { "sav", "application/octet-stream", "kickside.uploads.documents:types.documents" },
            { "svg", "image/svg+xml", "kickside.uploads:types.images" },
            { "zip", "application/zip", "kickside.uploads.archive:types.archive" },
            { "bin", "application/octet-stream", "kickside.uploads:types.generic" },
            { "dxf", "image/vnd.dxf", "kickside.uploads:types.generic" },
            { "dwg", "image/vnd.dwg", "kickside.uploads:types.generic" },
            { "png", "image/png", "kickside.uploads:types.images" },
            { "jpg", "image/jpeg", "kickside.uploads:types.images" },
            { "gif", "image/gif", "kickside.uploads:types.images" },
            { "bmp", "image/bmp", "kickside.uploads:types.images" },
            { "webp", "image/webp", "kickside.uploads:types.images" },
            { "tif", "image/tiff", "kickside.uploads:types.images" },
            { "ico", "image/vnd.microsoft.icon", "kickside.uploads:types.images" },
            { "ico", "image/x-icon", "kickside.uploads:types.images" },
        }) do
            test.it("routes " .. case[1] .. " through its declared pipeline", function()
                local entry, err = upload_type.find_by_mime_or_ext(case[2], case[1])
                test.is_nil(err)
                test.not_nil(entry)
                test.eq(entry.id, case[3])
            end)
        end
        test.it("keeps an explicit Graphviz MIME distinct from a Word template", function()
            local entry, err = upload_type.find_by_mime_or_ext("text/vnd.graphviz", "dot")
            test.is_nil(err)
            test.eq(entry.id, "kickside.uploads:types.text")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
