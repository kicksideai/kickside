local test = require("test")
local reader = require("trusted_reader")

local function not_found()
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "not found" })
end

local function stub(over: any)
    local base = {
        query = { get = function(id)
            if id ~= "up-1" then return not_found() end
            return { uuid = "up-1", storage_state = "completed", mime_type = "application/pdf", size = 24713,
                created_at = "2026-11-04T12:00:00Z",
                metadata = { filename = "brief.pdf", source = "hubspot", __upload_token = "secret",
                    crm_files = { crm_id = "c1", record_id = "person:1", provider = "hubspot", ref = "42" } } }, nil
        end },
        parts = {
            read_primary_content = function(_id)
                return { content = "# Brief\nпривет", mime_type = "text/markdown", metadata = { pages = 3 },
                    artifact = { artifact_id = "a-primary" } }, nil
            end,
            list_artifacts = function(_id)
                return { { artifact_id = "a-primary", role = "primary", mime_type = "text/markdown" } }, nil
            end,
        },
        content = {
            get_artifact = function(upload_id, artifact_id)
                if upload_id ~= "up-1" or artifact_id ~= "a-img" then return not_found() end
                return { artifact_id = "a-img", upload_id = "up-1", mime_type = "image/png" }, nil
            end,
            read_artifact_content = function(_u, _a) return "PNGBYTES", nil end,
        },
    }
    for key, value in pairs(over or {}) do base[key] = value end
    reader.deps = base
end

local function define_tests()
    test.describe("trusted_reader", function()
        local original = reader.deps
        test.after_each(function() reader.deps = original end)

        test.it("reports upload facts with the stored filename", function()
            stub()
            local info = reader.info("up-1")
            test.eq(info.status, "completed")
            test.eq(info.filename, "brief.pdf")
            test.eq(info.mime_type, "application/pdf")
            test.eq(info.size, 24713)
            local _, err = reader.info("missing")
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("returns provenance without private keys", function()
            stub()
            local p = reader.provenance("up-1")
            test.eq(p.source, "hubspot")
            test.eq(p.crm_files.record_id, "person:1")
            test.is_nil(p.__upload_token)
        end)

        test.it("returns the primary text and cuts it without splitting a UTF-8 character", function()
            stub()
            local full = reader.primary_text("up-1")
            test.eq(full.text, "# Brief\nпривет")
            test.eq(full.truncated, false)
            test.eq(full.artifact_id, "a-primary")
            test.eq(full.metadata.pages, 3)
            -- "# Brief\n" is 8 bytes, each Cyrillic letter is 2: 11 bytes would split "р".
            local cut = reader.primary_text("up-1", 11)
            test.eq(cut.text, "# Brief\nп")
            test.eq(cut.truncated, true)
            test.eq(cut.chars, #"# Brief\nпривет")
        end)

        test.it("gives the source image only for image uploads", function()
            stub()
            test.is_nil(reader.source_image("up-1"))
            stub({ parts = { list_artifacts = function()
                return { { artifact_id = "a-img", role = "source", mime_type = "image/PNG", size = 8 },
                    { artifact_id = "a-ocr", role = "primary", mime_type = "text/markdown" } }, nil
            end } })
            local img = reader.source_image("up-1")
            test.eq(img.artifact_id, "a-img")
            test.eq(img.content_type, "image/png")
            test.eq(img.size, 8)
        end)

        test.it("reads image bytes of this upload only and within the cap", function()
            stub()
            local img = reader.image_bytes("up-1", "a-img")
            test.eq(img.bytes, "PNGBYTES")
            test.eq(img.content_type, "image/png")
            local _, foreign = reader.image_bytes("up-2", "a-img")
            test.is_true(errors.is(foreign, errors.NOT_FOUND))
            local _, big = reader.image_bytes("up-1", "a-img", 4)
            test.is_true(errors.is(big, errors.INVALID))
        end)

        test.it("refuses a non-image artifact", function()
            stub({ content = {
                get_artifact = function() return { artifact_id = "a-primary", upload_id = "up-1", mime_type = "text/markdown" }, nil end,
                read_artifact_content = function() return "text", nil end,
            } })
            local _, err = reader.image_bytes("up-1", "a-primary")
            test.is_true(errors.is(err, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
