local test = require("test")
local fs = require("fs")
local uuid = require("uuid")
local pipeline = require("pipeline")
local records = require("upload_record_repo")
local queries = require("upload_query_repo")
local artifacts = require("artifact_content_repo")
local uploads = require("upload_lib")
local events = require("uploads_events")
local resources = require("uploads_resources")
local storage_catalog = require("storage_catalog")
local sql = require("sql")
local execution_identity = require("execution_identity")

local SOURCE = "app:uploads"
local DESTINATION = "app:other_uploads"

local function path(prefix)
    return prefix .. "-" .. uuid.v4()
end

local function write(storage, key, content)
    local ok, err = storage:writefile(key, content)
    test.is_nil(err, tostring(err))
    test.is_true(ok ~= false)
end

local function remove(storage, key)
    local _, err = storage:remove(key)
    test.is_nil(err, tostring(err))
end

local function create_upload(source, upload_id, source_path, bytes, owner)
    write(source, source_path, bytes)
    local upload, err = records.create(upload_id, owner or "relocation-owner", #bytes, "text/plain", SOURCE,
        source_path, "generic", { filename = "relocation.txt" }, "completed")
    test.is_nil(err, tostring(err))
    test.not_nil(upload)
    return upload
end

local function pipeline_metadata(user_id, relocation_storage_path, blob_id, relocation_blob_path)
    local db = assert(sql.get("app:db"))
    test.is_nil(select(2, db:execute([[INSERT INTO app_users
        (user_id,email,full_name,password_hash,status) VALUES ($1,$2,$3,$4,'active')
        ON CONFLICT (user_id) DO NOTHING]], { user_id, user_id .. "@test.invalid", user_id, "test" })))
    for _, group_id in ipairs({ "app:uploads_test", "wippy.security:process" }) do
        test.is_nil(select(2, db:execute([[INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)
            ON CONFLICT (user_id,group_id) DO NOTHING]], { user_id, group_id })))
    end
    db:release()
    local row, row_err = execution_identity.to_row({
        version = execution_identity.VERSION,
        principal = { kind = execution_identity.KIND.USER, id = user_id },
        authorized_by = { kind = execution_identity.KIND.USER, id = user_id },
        captured_at = execution_identity.utc_now(),
    })
    test.is_nil(row_err, tostring(row_err))
    return {
        filename = "relocation.txt",
        [execution_identity.CONTEXT_KEY] = { actor_id = row.actor_id, actor_context = row.actor_context },
        relocation_storage_path = relocation_storage_path,
        relocation_blob_id = blob_id,
        relocation_blob_path = relocation_blob_path,
    }
end

return { run = test.run_cases(function()
    test.describe("upload stage relocation", function()
        for _, retryable in ipairs({ false, true }) do
            test.it("preserves native stage failure classification for retryable=" .. tostring(retryable), function()
                local id, owner = path("stage-error"), path("stage-error-owner")
                local upload = create_upload(assert(fs.get(SOURCE)), id, id, "stage source", owner)
                upload.type_id = "app:types.relocation"
                upload.metadata = pipeline_metadata(owner)
                upload.metadata.stage_failure_kind = retryable and errors.UNAVAILABLE or errors.PERMISSION_DENIED
                upload.metadata.stage_failure_retryable = retryable
                local success, err, _, retriable = pipeline.process_upload(upload)
                test.is_false(success)
                test.eq("userdata", type(err), tostring(err))
                test.eq(upload.metadata.stage_failure_kind, err:kind())
                test.eq(retryable, err:retryable())
                test.eq(retryable, retriable)
                test.eq("stage_failure", err:details().code)
                remove(assert(fs.get(SOURCE)), id)
                records.delete(id)
            end)
        end

        test.it("resolves original-backed artifacts through the canonical upload reader", function()
            local get = queries.get
            local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "upload lookup unavailable",
                details = { code = "upload_reader" } })
            local seen
            queries.get = function(id) seen = id; return nil, source end
            local resolved, err = artifacts.resolve_storage({ upload_id = "original-reader", locator = { type = "upload.original" } })
            queries.get = get
            test.eq("original-reader", seen)
            test.is_nil(resolved)
            test.eq(source, err)
        end)

        test.it("commits original and derived locations before removing superseded bytes", function()
            local source = assert(fs.get(SOURCE))
            local destination = assert(fs.get(DESTINATION))
            local upload_id = path("relocation-upload")
            local original_path = path("relocation-original")
            local original_bytes = "original relocation bytes"
            local upload = create_upload(source, upload_id, original_path, original_bytes)

            local blob, blob_err = artifacts.create_blob("text/plain", "derived relocation bytes", {}, {})
            test.is_nil(blob_err, tostring(blob_err))
            test.not_nil(blob)
            local artifact, artifact_err = artifacts.create_artifact({
                upload_id = upload_id, blob_id = blob.blob_id, kind = "text", role = "part",
                mime_type = "text/plain", label = "derived.txt",
            })
            test.is_nil(artifact_err, tostring(artifact_err))
            test.not_nil(artifact)
            local original_artifact, original_artifact_err = artifacts.create_artifact({
                upload_id = upload_id, kind = "file", role = "source", mime_type = "text/plain",
                label = "source.txt", locator = {
                    type = "upload.original", upload_id = upload_id, storage_id = SOURCE, storage_path = original_path,
                },
            })
            test.is_nil(original_artifact_err, tostring(original_artifact_err))
            test.not_nil(original_artifact)

            local new_original = path("relocation-new-original")
            local new_blob = path("relocation-new-blob")
            write(destination, new_original, original_bytes)
            write(destination, new_blob, "derived relocation bytes")
            local original_target = "fs://" .. DESTINATION .. "/" .. new_original
            local blob_target = "fs://" .. DESTINATION .. "/" .. new_blob

            local relocated, relocation_err = pipeline.apply_relocation(upload, {
                storage_path = original_target,
                blobs = { { blob_id = blob.blob_id, storage_path = blob_target } },
            })
            test.is_nil(relocation_err, tostring(relocation_err))
            test.eq(original_target, relocated.storage_path)

            local persisted, persisted_err = queries.get(upload_id)
            test.is_nil(persisted_err, tostring(persisted_err))
            test.eq(original_target, persisted.storage_path)
            local moved_blob, moved_blob_err = artifacts.get_blob(blob.blob_id)
            test.is_nil(moved_blob_err, tostring(moved_blob_err))
            test.eq(blob_target, moved_blob.storage_path)
            local derived, derived_err = artifacts.read_artifact_content(upload_id, artifact.artifact_id)
            test.is_nil(derived_err, tostring(derived_err))
            test.eq("derived relocation bytes", derived)
            local original, original_err = artifacts.read_artifact_content(upload_id, original_artifact.artifact_id)
            test.is_nil(original_err, tostring(original_err))
            test.eq(original_bytes, original)

            local old_original = source:exists(original_path)
            local old_blob = source:exists(blob.storage_path)
            test.is_false(old_original)
            test.is_false(old_blob)
            remove(destination, new_original)
            remove(destination, new_blob)
            records.delete(upload_id)
        end)

        test.it("validates relative blob targets on the blob's own volume", function()
            local source = assert(fs.get(SOURCE))
            local destination = assert(fs.get(DESTINATION))
            local upload_id = path("relocation-volumes")
            local original_path, new_original = path("volumes-old"), path("volumes-new")
            local upload = create_upload(source, upload_id, original_path, "original")
            local blob = assert(artifacts.create_blob("text/plain", "distinct volume blob", {}, {storage_id = DESTINATION}))
            local artifact = assert(artifacts.create_artifact({upload_id = upload_id, blob_id = blob.blob_id,
                kind = "text", mime_type = "text/plain", label = "blob.txt"}))
            local new_blob = path("volumes-new-blob")
            write(source, new_original, "original")
            write(destination, new_blob, "distinct volume blob")
            local relocated, err = pipeline.apply_relocation(upload, {storage_path = new_original,
                blobs = {{blob_id = blob.blob_id, storage_path = new_blob}}})
            test.is_nil(err, tostring(err))
            test.not_nil(relocated)
            test.eq("distinct volume blob", assert(artifacts.read_artifact_content(upload_id, artifact.artifact_id)))
            test.is_false(source:exists(original_path))
            test.is_false(destination:exists(blob.storage_path))
            remove(source, new_original)
            remove(destination, new_blob)
            records.delete(upload_id)
        end)

        test.it("rejects a blob that does not belong to the relocating upload", function()
            local source = assert(fs.get(SOURCE))
            local destination = assert(fs.get(DESTINATION))
            local owner_id = path("relocation-owner")
            local other_id = path("relocation-other")
            local owner_path = path("relocation-owner-source")
            local other_path = path("relocation-other-source")
            local owner = create_upload(source, owner_id, owner_path, "owner")
            create_upload(source, other_id, other_path, "other")
            local blob, blob_err = artifacts.create_blob("text/plain", "other derived", {}, {})
            test.is_nil(blob_err, tostring(blob_err))
            test.is_nil(select(2, artifacts.create_artifact({ upload_id = other_id, blob_id = blob.blob_id,
                kind = "text", mime_type = "text/plain", label = "other.txt" })))
            local target_original = path("unowned-target")
            local target_blob = path("unowned-blob")
            write(destination, target_original, "owner")
            write(destination, target_blob, "other derived")

            local relocated, relocation_err = pipeline.apply_relocation(owner, {
                storage_path = "fs://" .. DESTINATION .. "/" .. target_original,
                blobs = { { blob_id = blob.blob_id, storage_path = "fs://" .. DESTINATION .. "/" .. target_blob } },
            })
            test.is_nil(relocated)
            test.not_nil(relocation_err)
            local persisted = assert(queries.get(owner_id))
            test.eq(owner_path, persisted.storage_path)
            test.is_true(source:exists(owner_path))
            test.is_true(destination:exists(target_original))
            test.is_true(destination:exists(target_blob))
            remove(source, owner_path)
            remove(source, other_path)
            remove(source, blob.storage_path)
            remove(destination, target_original)
            remove(destination, target_blob)
            records.delete(owner_id)
            records.delete(other_id)
        end)

        test.it("keeps a packed authority when a completion callback supplies a raw key", function()
            local upload_id = path("relocation-finalize")
            local packed_path = "s3://app:packed-storage/objects/" .. upload_id
            local upload, create_err = records.create(upload_id, "relocation-owner", 1, "text/plain", SOURCE,
                packed_path, "generic", {}, "pending")
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(upload)
            local db = assert(resources.get_db())
            local tx = assert(db:begin())
            local finalized, finalize_err = records.finalize_tx(tx, "sqlite", upload_id, {}, nil,
                "completed/" .. upload_id, nil, nil)
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(finalize_err, tostring(finalize_err))
            test.is_nil(commit_err, tostring(commit_err))
            local completed_path = "s3://app:packed-storage/completed/" .. upload_id
            test.eq(completed_path, finalized.storage_path)
            local persisted = assert(queries.get(upload_id))
            test.eq(completed_path, persisted.storage_path)
            records.delete(upload_id)
        end)

        test.it("deletes relocated original and derived bytes through the upload delete path", function()
            local source = assert(fs.get(SOURCE))
            local destination = assert(fs.get(DESTINATION))
            local upload_id = path("relocation-delete")
            local original_path = path("relocation-delete-original")
            local original_bytes = "relocated original bytes"
            local upload = create_upload(source, upload_id, original_path, original_bytes,
                "relocation-owner:" .. uuid.v4())
            local blob = assert(artifacts.create_blob("text/plain", "relocated derived bytes", {}, {}))
            assert(artifacts.create_artifact({ upload_id = upload_id, blob_id = blob.blob_id,
                kind = "text", mime_type = "text/plain", label = "derived.txt" }))
            local relocated_original = path("relocation-delete-new-original")
            local relocated_blob = path("relocation-delete-new-blob")
            write(destination, relocated_original, original_bytes)
            write(destination, relocated_blob, "relocated derived bytes")
            local relocated, relocation_err = pipeline.apply_relocation(upload, {
                storage_path = "fs://" .. DESTINATION .. "/" .. relocated_original,
                blobs = {{ blob_id = blob.blob_id, storage_path = "fs://" .. DESTINATION .. "/" .. relocated_blob }},
            })
            test.is_nil(relocation_err, tostring(relocation_err))
            test.not_nil(relocated)

            local original_emit = events.emit
            events.emit = function() return true, nil end
            local deleted, delete_err = uploads.delete_upload(upload_id)
            events.emit = original_emit
            test.is_nil(delete_err, tostring(delete_err))
            test.not_nil(deleted)
            test.is_false(destination:exists(relocated_original))
            test.is_false(destination:exists(relocated_blob))
            local persisted = assert(resources.get_db())
            local rows, rows_err = persisted:query("SELECT blob_id FROM kickside_upload_artifact_blobs WHERE blob_id=$1", { blob.blob_id })
            persisted:release()
            test.is_nil(rows_err, tostring(rows_err))
            test.eq(0, #rows)
        end)

        test.it("keeps bytes when a raw location is relocated to its packed filesystem spelling", function()
            local source = assert(fs.get(SOURCE))
            local upload_id = path("relocation-raw-alias")
            local shared_path = path("relocation-raw-alias-bytes")
            local upload = create_upload(source, upload_id, shared_path, "raw alias bytes")

            local relocated, relocation_err = pipeline.apply_relocation(upload, {
                storage_path = "fs://" .. SOURCE .. "/" .. shared_path,
            })
            test.is_nil(relocation_err, tostring(relocation_err))
            test.not_nil(relocated)
            test.is_true(source:exists(shared_path))

            remove(source, shared_path)
            records.delete(upload_id)
        end)

        test.it("keeps packed filesystem bytes referenced through another home volume", function()
            local source = assert(fs.get(SOURCE))
            local destination = assert(fs.get(DESTINATION))
            local shared_path = path("relocation-fs-alias-bytes")
            local first_id = path("relocation-fs-alias-first")
            local second_id = path("relocation-fs-alias-second")
            local next_path = path("relocation-fs-alias-next")
            write(destination, shared_path, "filesystem alias bytes")
            local packed_path = "fs://" .. DESTINATION .. "/" .. shared_path
            local first = assert(records.create(first_id, "relocation-owner", 21, "text/plain", SOURCE,
                packed_path, "generic", {}, "completed"))
            assert(records.create(second_id, "relocation-owner", 21, "text/plain", DESTINATION,
                packed_path, "generic", {}, "completed"))
            write(source, next_path, "filesystem alias bytes")

            local relocated, relocation_err = pipeline.apply_relocation(first, { storage_path = next_path })
            test.is_nil(relocation_err, tostring(relocation_err))
            test.not_nil(relocated)
            test.is_true(destination:exists(shared_path))

            remove(source, next_path)
            remove(destination, shared_path)
            records.delete(first_id)
            records.delete(second_id)
        end)

        test.it("recognizes packed S3 bytes referenced through another home volume", function()
            local first_id = path("relocation-s3-alias-first")
            local second_id = path("relocation-s3-alias-second")
            local shared_path = "s3://app:packed-storage/" .. path("relocation-s3-alias-bytes")
            assert(records.create(first_id, "relocation-owner", 1, "text/plain", SOURCE,
                shared_path, "generic", {}, "completed"))
            assert(records.create(second_id, "relocation-owner", 1, "text/plain", DESTINATION,
                shared_path, "generic", {}, "completed"))
            local _, update_err = records.update_storage(first_id, SOURCE, path("relocation-s3-alias-next"))
            test.is_nil(update_err, tostring(update_err))
            local db = assert(resources.get_db())
            local present, contains_err = storage_catalog.contains(db, SOURCE, shared_path)
            db:release()
            test.is_nil(contains_err, tostring(contains_err))
            test.is_true(present)
            records.delete(first_id)
            records.delete(second_id)
        end)

        test.it("passes committed relocation values to later stages", function()
            local source = assert(fs.get(SOURCE))
            local destination = assert(fs.get(DESTINATION))
            local upload_id = path("relocation-pipeline")
            local owner = path("relocation-pipeline-owner")
            local old_original = path("relocation-pipeline-original")
            local upload = create_upload(source, upload_id, old_original, "pipeline original", owner)
            local blob = assert(artifacts.create_blob("text/plain", "pipeline blob", {}, {}))
            test.is_nil(select(2, artifacts.create_artifact({ upload_id = upload_id, blob_id = blob.blob_id,
                kind = "text", mime_type = "text/plain", label = "pipeline.txt" })))
            local new_original = path("relocation-pipeline-new-original")
            local new_blob = path("relocation-pipeline-new-blob")
            write(destination, new_original, "pipeline original")
            write(destination, new_blob, "pipeline blob")
            upload.type_id = "app:types.relocation"
            local original_target = "fs://" .. DESTINATION .. "/" .. new_original
            local blob_target = "fs://" .. DESTINATION .. "/" .. new_blob
            upload.metadata = pipeline_metadata(owner, original_target, blob.blob_id, blob_target)
            local db = assert(resources.get_db())
            test.is_nil(select(2, db:execute("UPDATE kickside_uploads SET type_id=$1,metadata=$2 WHERE uuid=$3", {
                upload.type_id, require("json").encode(upload.metadata), upload_id,
            })))
            db:release()
            local success, pipeline_err, processed = pipeline.process_upload(upload)
            test.is_nil(pipeline_err, tostring(pipeline_err))
            test.is_true(success)
            test.eq(original_target, processed.storage_path)
            local persisted = assert(queries.get(upload_id))
            test.eq(original_target, persisted.storage_path)
            test.eq(original_target, persisted.metadata.observed_storage_path)
            remove(destination, new_original)
            remove(destination, new_blob)
            records.delete(upload_id)
        end)
    end)
end) }
