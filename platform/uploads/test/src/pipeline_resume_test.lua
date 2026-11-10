-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local pipeline = require("pipeline")
local upload_type = require("upload_type")
local records = require("records")
local query = require("query")
local content = require("content")
local parts = require("parts")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local time = require("time")
local fs = require("fs")
local funcs = require("funcs")
local fixtures = require("fixtures")
local sql = require("sql")
local jobs = require("jobs")
local claim = require("claim")
local page_images = require("page_images")
local contract = require("contract")
local upload_lib = require("upload_lib")
local process_worker = require("process_worker")

local function seed()
    return assert(records.create(uuid.v4(), "resume-test", 12, "application/pdf", "app:uploads",
        "resume.pdf", "documents", {}, "uploaded"))
end

local function attempt()
    local job = assert(jobs.enqueue({namespace = "resume-test", scope = uuid.v4(), key = "process",
        job_type = "kickside.uploads.service:process_job_proc", max_attempts = 5,
        owner_locator = {kind = "test", id = "resume-test"}, immutable_payload = {}}))
    local db = assert(sql.get("app:db"))
    local tx = assert(db:begin())
    local token = uuid.v4()
    local leased = assert(claim.lease_row(tx, assert(db:type()), job.id, token,
        time.now():add("60s"):utc():format_rfc3339(), time.now():utc():format_rfc3339()))
    assert(tx:commit())
    db:release()
    return {cancel_ref = {job_id = job.id, lease_token = token, execution_seq = leased.execution_seq}}
end

local function define_tests()
    test.describe("upload pipeline durable resume", function()
        test.it("retains completed stages when the pipeline relocates the unchanged source", function()
            local upload = seed()
            local opts = attempt()
            local calls = 0
            local get_pipeline, stage_executor, relocate = upload_type.get_pipeline,
                pipeline.upload_stage_executor, pipeline.apply_relocation
            upload_type.get_pipeline = function() return {{func = "relocate"}, {func = "ocr"}} end
            pipeline.apply_relocation = function(current, target)
                if target then
                    assert(records.update_storage(current.uuid, current.storage_id, target.storage_path))
                    current.storage_path = target.storage_path
                end
                return current
            end
            pipeline.upload_stage_executor = function()
                return {call = function(_, stage)
                    if stage == "relocate" then
                        calls = calls + 1
                        return {success = true, relocation = {storage_path = "relocated.pdf"}}
                    end
                    return nil, "interrupted OCR"
                end}
            end
            local ok, err = pcall(function()
                local processed, process_err = pipeline.process_upload(upload, opts)
                test.is_false(processed, tostring(process_err))
                processed, process_err = pipeline.process_upload(assert(query.get(upload.uuid)), opts)
                test.is_false(processed, tostring(process_err))
                test.eq(calls, 1)
            end)
            upload_type.get_pipeline, pipeline.upload_stage_executor, pipeline.apply_relocation =
                get_pipeline, stage_executor, relocate
            if not ok then error(err) end
        end)

        test.it("repeated document conversion and rasterization keep one artifact per output", function()
            local upload = seed()
            local storage = assert(fs.get("app:uploads"))
            local path = upload.uuid .. ".pdf"
            assert(storage:writefile(path, fixtures.pdf))
            local ok, err = pcall(function()
                local params = {upload_id = upload.uuid, storage_id = "app:uploads", storage_path = path,
                    mime_type = "application/pdf", size = 120000, metadata = {filename = "scan.pdf"}}
                for _ = 1, 3 do
                    local converted, convert_err = funcs.call("kickside.uploads.documents:processor", params)
                    test.is_nil(convert_err, tostring(convert_err))
                    test.is_true(converted.success)
                    local rendered, render_err = funcs.call("kickside.uploads.rasterize:stage", params)
                    test.is_nil(render_err, tostring(render_err))
                    test.is_true(rendered.success)
                end
                local artifacts = assert(parts.list_artifacts(upload.uuid))
                local primary, source, pages = 0, 0, {}
                for _, artifact in ipairs(artifacts) do
                    if artifact.role == "primary" then primary = primary + 1 end
                    if artifact.role == "source" then source = source + 1 end
                    if artifact.role == "rendered-page" then
                        local page = artifact.metadata.page
                        pages[page] = (pages[page] or 0) + 1
                    end
                end
                test.eq(primary, 1)
                test.eq(source, 1)
                test.eq(pages[1], 1)
                test.eq(pages[2], 1)
                test.eq(#artifacts, 4)
                local previous = assert(parts.get_primary_content_artifact(upload.uuid))
                assert(content.update_content(upload.uuid, previous.artifact_id, "old recognized text", {
                    metadata = {ocr_page_outcomes = {{page = 1, status = "readable"}}},
                }))
                assert(funcs.call("kickside.uploads.documents:processor", params))
                local regenerated = assert(parts.read_primary_content(upload.uuid))
                test.is_true(regenerated.content ~= "old recognized text")
                test.is_nil(regenerated.metadata.ocr_page_outcomes)
                local replaced = fixtures.pdf:gsub("1 0 0 rg", "0 1 0 rg")
                test.is_true(replaced ~= fixtures.pdf)
                assert(storage:writefile(path, replaced))
                local converted, convert_err = funcs.call("kickside.uploads.documents:processor", params)
                test.is_nil(convert_err, tostring(convert_err))
                test.is_true(converted.success)
                local rendered, render_err = funcs.call("kickside.uploads.rasterize:stage", params)
                test.is_nil(render_err, tostring(render_err))
                test.is_true(rendered.success)
                local current = assert(parts.get_primary_content_artifact(upload.uuid))
                test.eq(current.artifact_id, previous.artifact_id)
                test.is_true(current.parent_artifact_id ~= previous.parent_artifact_id)
                for _, artifact in ipairs(assert(parts.list_artifacts(upload.uuid))) do
                    if artifact.role == "rendered-page" then
                        test.eq(artifact.parent_artifact_id, current.parent_artifact_id)
                    end
                end
            end)
            assert(storage:remove(path))
            if not ok then error(err) end
        end)

        test.it("resumes in a fresh process after termination during OCR", function()
            local upload = seed()
            local opts = attempt()
            local topic = "resume.test." .. uuid.v4()
            local listener = assert(process.listen(topic))
            local events = process.events()
            local child
            local function receive(ch)
                local selected = channel.select({ch:case_receive(), time.after("5s"):case_receive()})
                test.eq(selected.channel, ch, "child replies within 5s")
                return selected.value
            end
            local function exited(pid)
                while true do
                    local event = receive(events)
                    if tostring(event.from) == tostring(pid) and event.kind == process.event.EXIT then return end
                end
            end
            local ok, err = pcall(function()
                child = assert(process.spawn_monitored("app:pipeline_resume_child", "app:processes", {
                    upload_id = upload.uuid, cancel_ref = opts.cancel_ref, parent = tostring(process.pid()), topic = topic, interrupt = true,
                }))
                test.is_true(receive(listener).ocr_started)
                test.eq(assert(query.get(upload.uuid)).metadata.__pipeline.completed, 2)
                process.terminate(tostring(child))
                exited(child)
                child = nil
                child = assert(process.spawn_monitored("app:pipeline_resume_child", "app:processes", {
                    upload_id = upload.uuid, cancel_ref = opts.cancel_ref, parent = tostring(process.pid()), topic = topic,
                }))
                test.is_true(receive(listener).completed)
                exited(child)
                child = nil
                local artifacts = assert(parts.list_artifacts(upload.uuid))
                test.eq(#artifacts, 3)
                for _, artifact in ipairs(artifacts) do
                    test.eq(artifact.metadata.conversions or artifact.metadata.renders, 1)
                end
                test.eq(assert(parts.read_primary_content(upload.uuid)).content, "page one\npage two")
            end)
            if child then process.terminate(tostring(child)); exited(child) end
            process.unlisten(listener)
            if not ok then error(err) end
        end)

        test.it("rejects artifact and stage outcome writes from a lost attempt", function()
            local upload = seed()
            local ref = {job_id = uuid.v4(), lease_token = uuid.v4(), execution_seq = 1}
            local artifact, artifact_err = content.upsert_artifact({upload_id = upload.uuid, role = "primary",
                kind = "markdown", ordinal = 1, content = "stale", storage_id = "app:uploads", cancel_ref = ref})
            test.is_nil(artifact)
            test.contains(tostring(artifact_err), "lease")
            local updated, metadata_err = records.update_metadata(upload.uuid, {__pipeline = {completed = 1}}, ref)
            test.is_nil(updated)
            test.contains(tostring(metadata_err), "lease")
            test.is_nil(assert(query.get(upload.uuid)).metadata.__pipeline)
            test.eq(#assert(parts.list_artifacts(upload.uuid)), 0)
        end)

        test.it("resumes after interrupted OCR without repeating completed stages", function()
            local upload = seed()
            local opts = attempt()
            local calls = {convert = 0, rasterize = 0, ocr = 0}
            local get_pipeline, stage_executor = upload_type.get_pipeline, pipeline.upload_stage_executor
            upload_type.get_pipeline = function()
                return {{func = "convert"}, {func = "rasterize"}, {func = "ocr"}}
            end
            pipeline.upload_stage_executor = function()
                return {call = function(_, stage)
                    calls[stage] = assert(calls[stage], "unexpected pipeline stage") + 1
                    if stage == "convert" then
                        assert(content.upsert_artifact({upload_id = upload.uuid, role = "primary", kind = "markdown",
                            content = "", mime_type = "text/markdown", storage_id = "app:uploads", ordinal = 1}))
                    elseif stage == "rasterize" then
                        for page = 1, 2 do
                            assert(content.upsert_artifact({upload_id = upload.uuid, role = "rendered-page", kind = "image",
                                content = "image" .. page, mime_type = "image/png", storage_id = "app:uploads",
                                ordinal = page, metadata = {page = page}}))
                        end
                    elseif calls.ocr == 1 then
                        return nil, "attempt terminated during OCR"
                    else
                        local primary = assert(parts.get_primary_content_artifact(upload.uuid))
                        assert(content.update_content(upload.uuid, primary.artifact_id, "page one\npage two"))
                    end
                    return {success = true, metadata = {[stage .. "_complete"] = true}}
                end}
            end
            local ok, err = pcall(function()
                local first, first_err = pipeline.process_upload(upload, opts)
                test.is_false(first)
                test.contains(tostring(first_err), "terminated during OCR")
                local second, second_err = pipeline.process_upload(assert(query.get(upload.uuid)), opts)
                test.is_nil(second_err)
                test.is_true(second)
                test.eq(calls.convert, 1)
                test.eq(calls.rasterize, 1)
                test.eq(calls.ocr, 2)
                test.eq(assert(parts.read_primary_content(upload.uuid)).content, "page one\npage two")
                for _ = 1, 3 do assert(pipeline.process_upload(assert(query.get(upload.uuid)), opts)) end
                test.eq(#assert(parts.list_artifacts(upload.uuid)), 3)
                test.eq(calls.ocr, 2)
                -- A new processing job starts every stage, including for unchanged bytes.
                assert(records.update_storage(upload.uuid, "app:uploads", "replacement.pdf"))
                local changed = assert(query.get(upload.uuid))
                assert(pipeline.process_upload(changed, attempt()))
                test.eq(calls.convert, 2)
                test.eq(calls.rasterize, 2)
                test.eq(calls.ocr, 3)
                test.eq(#assert(parts.list_artifacts(upload.uuid)), 3)
            end)
            upload_type.get_pipeline, pipeline.upload_stage_executor = get_pipeline, stage_executor
            if not ok then error(err) end
        end)

        for _, failure in ipairs({"count-error", "render-error", "partial"}) do
            test.it("retries rasterization after " .. failure .. " and renders only missing pages", function()
                local upload, opts = seed(), attempt()
                upload.mime_type, upload.size = "application/x-upload-resume-test", 120000
                upload.storage_path = upload.uuid .. ".render"
                local storage = assert(fs.get("app:uploads"))
                assert(storage:writefile(upload.storage_path, failure))
                assert(content.create_artifact({upload_id = upload.uuid, role = "primary", kind = "markdown",
                    content = "<!-- page 1 -->\n<!-- page 2 -->", storage_id = "app:uploads", ordinal = 1}))
                local settings = assert(assert(contract.get("kickside.settings:settings")):open())
                local previous = assert(settings:get({namespace = "kickside.uploads.rasterize", key = "rasterize_batch_pages"}))
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_batch_pages", value = 1}).success)
                local renders, ocr = 0, 0
                local get_pipeline, stage_executor = upload_type.get_pipeline, pipeline.upload_stage_executor
                upload_type.get_pipeline = function() return {{func = "rasterize"}, {func = "enrich"}, {func = "ocr"}} end
                pipeline.upload_stage_executor = function()
                    return {call = function(_, stage, params)
                        if stage == "rasterize" then
                            renders = renders + 1
                            local result = assert(funcs.call("kickside.uploads.rasterize:stage", params))
                            if renders == 1 then test.is_false(result.completed)
                            else test.eq(result.metadata.rendered_page_count, failure == "count-error" and 2 or 1) end
                            return result
                        end
                        if stage == "ocr" then
                            ocr = ocr + 1
                            if ocr == 1 then return nil, "OCR interrupted" end
                        end
                        return {success = true}
                    end}
                end
                local ok, err = pcall(function()
                    local processed, process_err = pipeline.process_upload(upload, opts)
                    test.is_false(processed, tostring(process_err))
                    test.eq(assert(query.get(upload.uuid)).metadata.__pipeline.completed, 0)
                    assert(storage:writefile(upload.storage_path, "complete"))
                    processed, process_err = pipeline.process_upload(upload, opts)
                    test.is_true(processed, tostring(process_err))
                    test.eq(renders, 2)
                    local images = page_images.rendered(upload.uuid)
                    test.eq(#images, 2)
                    test.eq(images[1].metadata.page, 1)
                    test.eq(images[2].metadata.page, 2)
                end)
                upload_type.get_pipeline, pipeline.upload_stage_executor = get_pipeline, stage_executor
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_batch_pages", value = previous.value}).success)
                assert(storage:remove(upload.storage_path))
                if not ok then error(err) end
            end)
        end

        test.it("a new job reruns completed stages after OCR fails", function()
            local upload = seed()
            local opts = attempt()
            local calls = {convert = 0, rasterize = 0, ocr = 0}
            local get_pipeline, stage_executor, enqueue = upload_type.get_pipeline,
                pipeline.upload_stage_executor, process_worker.enqueue_upload_job
            process_worker.enqueue_upload_job = function()
                opts = attempt()
                return {job_id = opts.cancel_ref.job_id}
            end
            upload_type.get_pipeline = function() return {{func = "convert"}, {func = "rasterize"}, {func = "ocr"}} end
            pipeline.upload_stage_executor = function()
                return {call = function(_, stage)
                    calls[stage] = assert(calls[stage], "unexpected pipeline stage") + 1
                    if stage == "ocr" and calls.ocr < 3 then return nil, "OCR failed" end
                    return {success = true}
                end}
            end
            local ok, err = pcall(function()
                local processed, process_err = pipeline.process_upload(upload, opts)
                test.is_false(processed, tostring(process_err))
                processed, process_err = pipeline.process_upload(assert(query.get(upload.uuid)), opts)
                test.is_false(processed, tostring(process_err))
                test.eq(calls.convert, 1)
                test.eq(calls.rasterize, 1)
                assert(records.mark_storage_failed(upload.uuid))
                test.not_nil(assert(upload_lib.retry_upload(upload.uuid)))
                processed, process_err = pipeline.process_upload(assert(query.get(upload.uuid)), opts)
                test.is_true(processed, tostring(process_err))
                test.eq(calls.convert, 2)
                test.eq(calls.rasterize, 2)
                test.eq(calls.ocr, 3)
            end)
            process_worker.enqueue_upload_job = enqueue
            upload_type.get_pipeline, pipeline.upload_stage_executor = get_pipeline, stage_executor
            if not ok then error(err) end
        end)

        test.it("best effort stages cannot advance the completed prefix past missing outputs", function()
            local upload, opts = seed(), attempt()
            local calls = {render = 0, enrich = 0, ocr = 0}
            local get_pipeline, stage_executor = upload_type.get_pipeline, pipeline.upload_stage_executor
            upload_type.get_pipeline = function() return {{func = "render"}, {func = "enrich"}, {func = "ocr"}} end
            pipeline.upload_stage_executor = function()
                return {call = function(_, stage)
                    calls[stage] = assert(calls[stage], "unexpected pipeline stage") + 1
                    if stage == "render" then return {success = true, completed = calls.render > 1} end
                    if stage == "ocr" and calls.ocr == 1 then return nil, "OCR failed" end
                    return {success = true}
                end}
            end
            local ok, err = pcall(function()
                local processed, process_err = pipeline.process_upload(upload, opts)
                test.is_false(processed, tostring(process_err))
                processed, process_err = pipeline.process_upload(assert(query.get(upload.uuid)), opts)
                test.is_true(processed, tostring(process_err))
                test.eq(calls.render, 2)
                test.eq(calls.enrich, 2)
            end)
            upload_type.get_pipeline, pipeline.upload_stage_executor = get_pipeline, stage_executor
            if not ok then error(err) end
        end)

        test.it("reads and replaces the same primary when historical timestamps tie", function()
            local upload = seed()
            local sources, primaries = {}, {}
            local ids = {uuid.v4(), uuid.v4()}
            table.sort(ids, function(a, b) return a > b end)
            for i = 1, 2 do
                sources[i] = assert(content.create_artifact({upload_id = upload.uuid, role = "source",
                    kind = "file", ordinal = 0}))
                primaries[i] = assert(content.create_artifact({upload_id = upload.uuid, artifact_id = ids[i], role = "primary",
                    kind = "markdown", ordinal = 1, parent_artifact_id = sources[i].artifact_id,
                    content = "old" .. i, storage_id = "app:uploads"}))
                assert(content.create_artifact({upload_id = upload.uuid, role = "rendered-page", kind = "image",
                    ordinal = 2001, parent_artifact_id = sources[i].artifact_id, metadata = {page = 1},
                    content = "image" .. i, storage_id = "app:uploads"}))
            end
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_upload_artifacts SET created_at=$1 WHERE upload_id=$2",
                {"2026-01-01T00:00:00Z", upload.uuid}))
            db:release()
            local index: integer = primaries[1].artifact_id < primaries[2].artifact_id and 1 or 2
            local chosen = primaries[index]
            test.eq(assert(parts.get_primary_content_artifact(upload.uuid)).artifact_id, chosen.artifact_id)
            local list = assert(parts.list_artifacts(upload.uuid))
            local first
            for _, artifact in ipairs(list) do if artifact.role == "primary" then first = artifact; break end end
            test.eq(first.artifact_id, chosen.artifact_id)
            local images = page_images.rendered(upload.uuid)
            test.eq(#images, 1)
            test.eq(images[1].parent_artifact_id, chosen.parent_artifact_id)
            local updated = assert(content.upsert_artifact({upload_id = upload.uuid, role = "primary", kind = "markdown",
                ordinal = 1, content = "new", storage_id = "app:uploads", parent_artifact_id = chosen.parent_artifact_id}))
            test.eq(updated.artifact_id, chosen.artifact_id)
            test.eq(assert(parts.read_primary_content(upload.uuid)).content, "new")
        end)

        test.it("reuses artifact identity when a stage writes again before its outcome commits", function()
            local upload = seed()
            local first
            for attempt = 1, 5 do
                for page = 1, 2 do
                    local artifact = assert(content.upsert_artifact({upload_id = upload.uuid, role = "rendered-page",
                        kind = "image", ordinal = page, content = "page" .. page, storage_id = "app:uploads",
                        metadata = {page = page}}))
                    if page == 1 then
                        if first then test.eq(artifact.artifact_id, first) end
                        first = artifact.artifact_id
                    end
                end
            end
            test.eq(#assert(parts.list_artifacts(upload.uuid)), 2)
        end)
    end)
end

return {run = test.run_cases(define_tests)}
