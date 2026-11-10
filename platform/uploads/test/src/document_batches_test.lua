local test = require("test")
local funcs = require("funcs")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local process = require("process")
local channel = require("channel")
local time = require("time")
local contract = require("contract")
local doc2md = require("doc2md")
local proc_supervisor = require("proc_supervisor")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_record_repo = require("upload_record_repo")
local fixtures = require("fixtures")

local STORAGE_ID = "app:uploads"
local PROCESSOR = "kickside.uploads.documents:processor"
local SETTINGS_NS = "kickside.uploads.documents"
local BATCH_KEY = "convert_batch_pages"

local function settings(): any
    return assert(assert(contract.get("kickside.settings:settings")):open())
end

local function set_batch_pages(value: integer)
    test.is_true(settings():set({ namespace = SETTINGS_NS, key = BATCH_KEY, value = value }).success)
end

-- Five pages: text, two images, empty, text with an image, text.
local function document(): string
    return fixtures.paged_pdf({
        { text = { "Opening page text.", "Second line of the opening page." } },
        { images = 2 },
        {},
        { text = { "Fourth page caption." }, images = 1 },
        { text = { "Closing page text." } },
    })
end

local function store(bytes: string): (string, string)
    local upload_id = "doc2md-batches-" .. uuid_v4()
    local path = upload_id .. ".pdf"
    local storage = assert(fs.get(STORAGE_ID))
    assert(storage:writefile(path, bytes))
    local upload, upload_err = upload_record_repo.create(upload_id, "test-user", #bytes, "application/pdf",
        STORAGE_ID, path, "documents", { filename = "batches.pdf", source = "uploads.test" }, "uploaded")
    test.is_nil(upload_err)
    test.not_nil(upload)
    return upload_id, path
end

local function drain(listener: any): { any }
    local received = {}
    while true do
        local selected = channel.select({ listener:case_receive(), time.after("200ms"):case_receive() })
        if selected.channel ~= listener then return received end
        received[#received + 1] = selected.value
    end
end

local run_cases = test.run_cases(function()
    test.describe("document conversion batches", function()
        test.after_each(function()
            set_batch_pages(8)
        end)

        test.it("converts a PDF in page batches, reporting progress after each batch", function()
            set_batch_pages(2)
            local bytes = document()
            local upload_id, path = store(bytes)
            local job_id, lease_token = uuid_v4(), uuid_v4()
            local controls = assert(process.listen(proc_supervisor.CONTROL_TOPIC))
            -- The test process stands in for the job's execution owner.
            local owner = proc_supervisor.execution_name(job_id, lease_token)
            local registered, register_err = process.registry.register(owner, nil, process.registry.CONSISTENT)
            test.is_nil(register_err)
            test.is_true(registered)

            local result, call_err = funcs.new():call(PROCESSOR, {
                upload_id = upload_id,
                storage_id = STORAGE_ID,
                storage_path = path,
                mime_type = "application/pdf",
                size = #bytes,
                metadata = { filename = "batches.pdf", source = "uploads.test" },
                options = { extract_images = true },
                cancel_ref = { job_id = job_id, lease_token = lease_token, execution_seq = 1 },
            })
            process.registry.unregister(owner, process.registry.CONSISTENT)
            test.is_nil(call_err)
            test.is_true(result.success, "document processor failed")

            local progress = 0
            for _, message in ipairs(drain(controls)) do
                if message.kind == "progress" and message.job_id == job_id then progress = progress + 1 end
            end
            test.eq(progress, 3, "one progress report per two-page batch of five pages")

            local whole, whole_err = doc2md.convert({ bytes = bytes }, { extract_images = true, page_markers = true })
            test.is_nil(whole_err)
            local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
            test.is_nil(primary_err)
            test.eq(primary.content, whole.markdown)

            local pages, pages_err = doc2md.page_resources({ bytes = bytes })
            test.is_nil(pages_err)
            local artifacts, artifacts_err = artifact_parts_repo.list_artifacts(upload_id)
            test.is_nil(artifacts_err)
            local images = {}
            for _, artifact in ipairs(artifacts) do
                if artifact.role == "extracted-image" then images[#images + 1] = artifact end
            end
            test.eq(#images, #whole.images)
            test.eq(result.metadata.image_artifact_count, #whole.images)
            for index, image in ipairs(whole.images) do
                local metadata = images[index].metadata
                test.eq(metadata.name, image.name)
                test.eq(metadata.page, image.page)
                test.eq(metadata.image_count, pages[image.page].image_count)
            end
        end)

        test.it("converts a document in one batch when it fits the batch size", function()
            local bytes = document()
            local upload_id, path = store(bytes)
            local result, call_err = funcs.new():call(PROCESSOR, {
                upload_id = upload_id,
                storage_id = STORAGE_ID,
                storage_path = path,
                mime_type = "application/pdf",
                size = #bytes,
                metadata = { filename = "batches.pdf", source = "uploads.test" },
                options = { extract_images = false },
            })
            test.is_nil(call_err)
            test.is_true(result.success, "document processor failed")
            local whole, whole_err = doc2md.convert({ bytes = bytes }, { page_markers = true })
            test.is_nil(whole_err)
            local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
            test.is_nil(primary_err)
            test.eq(primary.content, whole.markdown)
        end)
    end)
end)

return { run = function(options: any) return run_cases(options) end }
