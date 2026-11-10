local pipeline = require("pipeline")
local upload_type = require("upload_type")
local query = require("query")
local content = require("content")
local parts = require("parts")
local process = require("process")
local channel = require("channel")

local function main(input)
    local upload = assert(query.get(input.upload_id))
    upload_type.get_pipeline = function()
        return {{func = "convert"}, {func = "rasterize"}, {func = "ocr"}}
    end
    pipeline.upload_stage_executor = function()
        return {call = function(_, stage)
            if stage == "convert" then
                local artifacts = assert(parts.list_artifacts(upload.uuid))
                local calls = 1
                for _, artifact in ipairs(artifacts) do
                    if artifact.role == "primary" then calls = artifact.metadata.conversions + 1 end
                end
                assert(content.upsert_artifact({upload_id = upload.uuid, role = "primary", kind = "markdown",
                    content = "", mime_type = "text/markdown", storage_id = "app:uploads", ordinal = 1,
                    metadata = {conversions = calls}}))
            elseif stage == "rasterize" then
                local artifacts = assert(parts.list_artifacts(upload.uuid))
                local calls = 1
                for _, artifact in ipairs(artifacts) do
                    if artifact.role == "rendered-page" then calls = artifact.metadata.renders + 1; break end
                end
                for page = 1, 2 do
                    assert(content.upsert_artifact({upload_id = upload.uuid, role = "rendered-page", kind = "image",
                        content = "image" .. page, storage_id = "app:uploads", ordinal = page,
                        metadata = {page = page, renders = calls}}))
                end
            else
                local primary = assert(parts.read_primary_content(upload.uuid))
                if input.interrupt then
                    assert(content.update_content(upload.uuid, primary.artifact.artifact_id, "page one", {
                        metadata = {ocr_page_outcomes = {{page = 1, status = "readable"}}},
                    }))
                    assert(process.send(input.parent, input.topic, {ocr_started = true}))
                    local wait = assert(process.listen("resume.test.wait"))
                    channel.select({wait:case_receive()})
                else
                    assert(primary.content == "page one", "conversion preserves the OCR page checkpoint")
                    assert(primary.metadata.ocr_page_outcomes[1].page == 1)
                    assert(content.update_content(upload.uuid, primary.artifact.artifact_id, "page one\npage two"))
                end
            end
            return {success = true}
        end}
    end
    local ok, err = pipeline.process_upload(upload)
    assert(ok, tostring(err))
    assert(process.send(input.parent, input.topic, {completed = true}))
end

return {main = main}
