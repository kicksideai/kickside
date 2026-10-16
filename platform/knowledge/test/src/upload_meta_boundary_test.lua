local test = require("test")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local artifact_content_repo = require("artifact_content_repo")

local DB = "app:db"
local CALLBACK = "kickside.knowledge.injection:on_upload_complete"

local function db()
    local d, err = sql.get(DB)
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

local function scope()
    local pol, err = security.policy("app:user")
    if not pol then error("test policy missing: " .. tostring(err)) end
    return security.new_scope({ pol })
end

local function insert_meta(d: any, component_id: string, key: string, value: string): ()
    local _, err = sql.builder.insert("kickside_component_meta")
        :set_map({
            meta_id = uuid.v7(),
            component_id = component_id,
            key = key,
            value = value,
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if err then error("meta insert failed: " .. tostring(err)) end
end

local function meta_value(d: any, component_id: string, key: string): any
    local rows, err = sql.builder.select("value")
        :from("kickside_component_meta")
        :where("component_id = ?", component_id)
        :where("key = ?", key)
        :run_with(d):query()
    if err then error("meta read failed: " .. tostring(err)) end
    return rows and rows[1] and rows[1].value or nil
end

local function seed_kb(component_id: string, owner: string): ()
    local d = db()
    local _, comp_err = sql.builder.insert("kickside_components")
        :set_map({
            component_id = component_id,
            impl_id = "kickside.knowledge:knowledge_base",
            private_context = "{}",
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if comp_err then
        d:release()
        error("component insert failed: " .. tostring(comp_err))
    end

    local _, access_err = sql.builder.insert("kickside_component_access")
        :set_map({
            access_id = uuid.v7(),
            subject_id = owner,
            subject_type = "user",
            component_id = component_id,
            source_component_id = component_id,
            access_mask = 15,
            inherited = 0,
            created_at = 0,
        })
        :run_with(d):exec()
    if access_err then
        d:release()
        error("access insert failed: " .. tostring(access_err))
    end

    insert_meta(d, component_id, "class", "knowledge_base")
    insert_meta(d, component_id, "status", "ready")
    insert_meta(d, component_id, "document_count", "2")
    insert_meta(d, component_id, "embedding_count", "92")
    insert_meta(d, component_id, "last_error", "")
    d:release()
end

local function cleanup(component_id: string): ()
    local d = db()
    sql.builder.delete("kickside_component_access"):where("component_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_component_meta"):where("component_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_components"):where("component_id = ?", component_id):run_with(d):exec()
    d:release()
end

local function cleanup_upload(upload_id: string): ()
    local d = db()
    sql.builder.delete("kickside_uploads"):where("uuid = ?", upload_id):run_with(d):exec()
    d:release()
end

local function seed_upload_without_primary(upload_id: string, owner: string): ()
    local d = db()
    local _, err = sql.builder.insert("kickside_uploads")
        :set_map({
            uuid = upload_id,
            actor_id = owner,
            size = 12,
            mime_type = "application/octet-stream",
            storage_state = "uploaded",
            storage_id = "app:uploads",
            storage_path = "missing-primary.bin",
            type_id = "binary",
            created_at = 0,
            updated_at = 0,
            metadata = "{}",
        })
        :run_with(d):exec()
    d:release()
    if err then error("upload insert failed: " .. tostring(err)) end
end

local function seed_upload_with_empty_primary(upload_id: string, owner: string): ()
    seed_upload_without_primary(upload_id, owner)
    local artifact, err = artifact_content_repo.create_artifact({
        upload_id = upload_id,
        kind = "markdown",
        role = "primary",
        mime_type = "text/markdown",
        label = "empty.md",
        ordinal = 1,
        content = "",
        storage_id = "app:uploads",
        metadata = { filename = "empty-primary.pdf" },
    })
    if err or not artifact then error("artifact insert failed: " .. tostring(err)) end
end

local function define_tests()
    test.describe("Knowledge upload/meta boundary", function()
        test.it("does not mutate KB public meta when an upload callback reports failure", function()
            local owner = "upload-boundary-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {})
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope()):call(CALLBACK, {
                upload_id = "missing-primary-" .. uuid.v4(),
                status = "error",
                error = "primary content artifact not found",
                params = { kb_id = component_id },
            })
            test.is_nil(call_err)
            test.not_nil(result)
            test.is_true(result.success == true)
            test.is_true(result.skipped == true)
            test.is_true(result.terminal_upload_error == true)

            local d = db()
            test.eq("ready", meta_value(d, component_id, "status"))
            test.eq("2", meta_value(d, component_id, "document_count"))
            test.eq("92", meta_value(d, component_id, "embedding_count"))
            test.eq("", meta_value(d, component_id, "last_error"))
            d:release()

            cleanup(component_id)
        end)

        test.it("acks terminal upload failures even when a response target is provided", function()
            local owner = "upload-failed-waiter-" .. uuid.v4()
            local component_id = uuid.v7()
            local topic = "kb.upload.failed." .. uuid.v4()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {})
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope()):call(CALLBACK, {
                upload_id = "failed-upload-" .. uuid.v4(),
                status = "error",
                error = "converter crashed",
                params = { kb_id = component_id, respond_to = topic },
            })
            test.is_nil(call_err)
            test.not_nil(result)
            test.is_true(result.success == true)
            test.is_true(result.skipped == true)
            test.is_true(result.terminal_upload_error == true)
            test.eq("converter crashed", result.error)

            local d = db()
            test.eq("ready", meta_value(d, component_id, "status"))
            test.eq("2", meta_value(d, component_id, "document_count"))
            test.eq("92", meta_value(d, component_id, "embedding_count"))
            test.eq("", meta_value(d, component_id, "last_error"))
            d:release()

            cleanup(component_id)
        end)

        test.it("acks completed uploads with no primary content artifact without touching KB meta", function()
            local owner = "upload-no-primary-" .. uuid.v4()
            local component_id = uuid.v7()
            local upload_id = "no-primary-" .. uuid.v4()
            cleanup(component_id)
            cleanup_upload(upload_id)
            seed_kb(component_id, owner)
            seed_upload_without_primary(upload_id, owner)

            local actor = security.new_actor(owner, {})
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope()):call(CALLBACK, {
                upload_id = upload_id,
                status = "completed",
                mime_type = "application/octet-stream",
                size = 12,
                metadata = { filename = "missing-primary.bin" },
                params = { kb_id = component_id },
            })

            test.is_nil(call_err)
            test.not_nil(result)
            test.is_true(result.success == true)
            test.is_true(result.skipped == true)

            local d = db()
            test.eq("ready", meta_value(d, component_id, "status"))
            test.eq("2", meta_value(d, component_id, "document_count"))
            test.eq("92", meta_value(d, component_id, "embedding_count"))
            test.eq("", meta_value(d, component_id, "last_error"))
            d:release()

            cleanup_upload(upload_id)
            cleanup(component_id)
        end)

        test.it("acks completed uploads with empty primary content without touching KB meta", function()
            local owner = "upload-empty-primary-" .. uuid.v4()
            local component_id = uuid.v7()
            local upload_id = "empty-primary-" .. uuid.v4()
            cleanup(component_id)
            cleanup_upload(upload_id)
            seed_kb(component_id, owner)
            seed_upload_with_empty_primary(upload_id, owner)

            local actor = security.new_actor(owner, {})
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope()):call(CALLBACK, {
                upload_id = upload_id,
                status = "completed",
                mime_type = "application/pdf",
                size = 12,
                metadata = { filename = "empty-primary.pdf" },
                params = { kb_id = component_id },
            })

            test.is_nil(call_err)
            test.not_nil(result)
            test.is_true(result.success == true)
            test.is_true(result.skipped == true)

            local d = db()
            test.eq("ready", meta_value(d, component_id, "status"))
            test.eq("2", meta_value(d, component_id, "document_count"))
            test.eq("92", meta_value(d, component_id, "embedding_count"))
            test.eq("", meta_value(d, component_id, "last_error"))
            d:release()

            cleanup_upload(upload_id)
            cleanup(component_id)
        end)

        test.it("rejects binary primary artifacts before document ingestion", function()
            local owner = "upload-binary-" .. uuid.v4()
            local component_id = uuid.v7()
            local upload_id = "binary-primary-" .. uuid.v4()
            seed_kb(component_id, owner)
            seed_upload_without_primary(upload_id, owner)
            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = upload_id, kind = "markdown", role = "primary", mime_type = "image/png",
                label = "binary.png", ordinal = 1, content = "binary image bytes", storage_id = "app:uploads", metadata = {},
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)
            local actor = security.new_actor(owner, {})
            local refusal, probe_err = funcs.new():with_actor(actor):with_scope(scope()):call("app:ingest_upload_probe", {
                upload_id = upload_id, kb_id = component_id,
            })
            test.is_nil(probe_err)
            test.eq(refusal.invalid, true)
            test.contains(refusal.error, "no text was extracted")
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope()):call(CALLBACK, {
                upload_id = upload_id, status = "completed", params = { kb_id = component_id },
            })
            test.is_nil(call_err)
            test.eq(result.success, true)
            test.eq(result.skipped, true)
            local d = db()
            test.eq("2", meta_value(d, component_id, "document_count"))
            d:release()
            cleanup_upload(upload_id)
            cleanup(component_id)
        end)

        test.it("treats upload callbacks for a deleted KB as a handled cancellation", function()
            local owner = "upload-cancel-" .. uuid.v4()
            local deleted_kb = uuid.v7()

            local actor = security.new_actor(owner, {})
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope()):call(CALLBACK, {
                upload_id = "stale-upload-" .. uuid.v4(),
                status = "completed",
                mime_type = "text/plain",
                size = 12,
                metadata = { filename = "stale.txt" },
                params = { kb_id = deleted_kb },
            })

            test.is_nil(call_err)
            test.not_nil(result)
            test.is_true(result.success == true)
            test.is_true(result.cancelled == true)
            test.eq(deleted_kb, result.kb_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
