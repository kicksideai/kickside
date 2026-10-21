local worker_dispatch = require("worker_dispatch")
local jobs_lifecycle = require("jobs_lifecycle")
local test = require("test")
local registry = require("registry")
local funcs = require("funcs")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local security = require("security")
local json = require("json")
local compress = require("compress")
local sql = require("sql")
local time = require("time")
local errors = require("errors")
local base64 = require("base64")
local hash = require("hash")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local metadata_sanitizer = require("metadata_sanitizer")
local execution_identity = require("execution_identity")
local upload_record_repo = require("upload_record_repo")
local upload_query_repo = require("upload_query_repo")
local upload_read_model = require("upload_read_model")
local upload_lib = require("upload_lib")
local upload_tokens = require("upload_tokens")
local uploads_events = require("uploads_events")
local upload_types = require("types")
local provision = require("provision")
local pipeline_lib = require("pipeline_lib")
local process_worker = require("process_worker")
local processing_intent_repo = require("processing_intent_repo")
local process_job = require("process_job")
local callback_job = require("callback_job")
local upload_response = require("upload_response")
local processor = require("processor")
local file_provider = require("file_provider")
local IDENTITY_META_KEY = assert(execution_identity.CONTEXT_KEY, "execution_identity.CONTEXT_KEY is required")

local function field(value: any, key: string): any
    if type(value) ~= "table" then return nil end
    return value[key]
end

local function p16(n: number): string
    return string.char(math.floor(n % 256), math.floor(n / 256) % 256)
end

local function p32(n: number): string
    return string.char(math.floor(n % 256), math.floor(n / 256) % 256, math.floor(n / 65536) % 256, math.floor(n / 16777216) % 256)
end

-- Build a minimal zip from { {name, data, method} } where method is 0 (store) or 8
-- (deflate). Mirrors the zip_reader round-trip helper; CRC fields are left zero.
local function build_zip(files: any): string
    local locals = {}
    local centrals = {}
    local offset = 0
    for _, f in ipairs(files) do
        local raw = f.data
        local method = f.method or 0
        local payload = raw
        if method == 8 then
            local enc, err = compress.deflate.encode(raw :: string)
            if err then error("deflate encode failed: " .. tostring(err)) end
            payload = enc
        end
        local fn = f.name
        local lfh = p32(0x04034b50) .. p16(20) .. p16(0) .. p16(method) .. p16(0) .. p16(0)
            .. p32(0) .. p32(#payload) .. p32(#raw) .. p16(#fn) .. p16(0) .. fn .. payload
        local cdh = p32(0x02014b50) .. p16(20) .. p16(20) .. p16(0) .. p16(method) .. p16(0) .. p16(0)
            .. p32(0) .. p32(#payload) .. p32(#raw) .. p16(#fn) .. p16(0) .. p16(0) .. p16(0) .. p16(0)
            .. p32(0) .. p32(offset) .. fn
        locals[#locals + 1] = lfh
        centrals[#centrals + 1] = cdh
        offset = offset + #lfh
    end
    local local_blob = table.concat(locals)
    local central_blob = table.concat(centrals)
    local eocd = p32(0x06054b50) .. p16(0) .. p16(0) .. p16(#files) .. p16(#files)
        .. p32(#central_blob) .. p32(#local_blob) .. p16(0)
    return local_blob .. central_blob .. eocd
end

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if entry[key] ~= nil then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function entry(id: string): any
    local found, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(found, id .. " is missing")
    return found
end

local function executor(user_id: string): any
    local actor: any = security.new_actor(user_id, { security_groups = { "app:uploads_test" } })
    local scope: any = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function seed_user(user_id: string): ()
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    local _, user_err = db:execute([[INSERT INTO app_users
        (user_id, email, full_name, password_hash, status)
        VALUES ($1, $2, $3, $4, 'active') ON CONFLICT (user_id) DO NOTHING]],
        { user_id, user_id .. "@uploads.test", user_id, "test-only" })
    test.is_nil(user_err)
    for _, group_id in ipairs({ "app:uploads_test", "wippy.security:process" }) do
        local _, group_err = db:execute([[INSERT INTO app_user_groups (user_id, group_id)
            VALUES ($1, $2) ON CONFLICT (user_id, group_id) DO NOTHING]], { user_id, group_id })
        test.is_nil(group_err)
    end
    db:release()
end

local function require_integration_schema(): ()
    local last_err: any = nil
    for _ = 1, 100 do
        local db, db_err = sql.get("app:db")
        if db_err or not db then
            last_err = db_err
        else
            local _, core_err = db:query("SELECT max_pruned_seq FROM kickside_thread LIMIT 0")
            local _, users_err = db:query("SELECT auth_generation FROM app_users LIMIT 0")
            db:release()
            if not core_err and not users_err then return end
            last_err = core_err or users_err
        end
        time.sleep("100ms")
    end
    error("upload integration schema did not become ready: " .. tostring(last_err))
end

local function ensure_uploads_component(user_id: string): ()
    seed_user(user_id)
    local actor: any = security.new_actor(user_id, { security_groups = { "app:uploads_test" } })
    local scope: any = security.named_scope("wippy.security:process")
    local ids, err = provision.ensure_user(actor, scope, user_id)
    test.is_nil(err)
    test.is_true(type(ids) == "table")
end

local function upload_metadata(user_id: string, filename: string): any
    seed_user(user_id)
    local row, err = execution_identity.to_row({
        version = execution_identity.VERSION,
        principal = { kind = execution_identity.KIND.USER, id = user_id },
        authorized_by = { kind = execution_identity.KIND.USER, id = user_id },
        captured_at = execution_identity.utc_now(),
    })
    test.is_nil(err)
    return {
        filename = filename,
        [IDENTITY_META_KEY] = { actor_id = row.actor_id, actor_context = row.actor_context },
    }
end

local function actor_context(user_id: string): string
    local row = upload_metadata(user_id, "fixture.txt")[IDENTITY_META_KEY]
    return row.actor_context
end

local function metadata_with_identity(user_id: string, filename: string, metadata: any): any
    local out: any = {}
    if type(metadata) == "table" then
        for k, v in pairs(metadata) do out[k] = v end
    end
    local identity = upload_metadata(user_id, filename)
    out[IDENTITY_META_KEY] = identity[IDENTITY_META_KEY]
    if out.filename == nil then out.filename = filename end
    return out
end

local function client_metadata(filename: string, metadata: any): any
    local out: any = { filename = filename }
    if type(metadata) == "table" then
        for k, v in pairs(metadata) do out[k] = v end
    end
    return out
end

local function upload_as(actor_id: string, bytes: string, filename: string, size: number,
    mime_type: string, storage_id: string?, metadata: any): (any?, any?)
    seed_user(actor_id)
    return executor(actor_id):call("app:admit_upload", {
        action = "upload", actor_id = actor_id, bytes = bytes, filename = filename,
        size = size, mime_type = mime_type, storage_id = storage_id, metadata = metadata,
    })
end

local function complete_as(actor_id: string, upload_id: string, etag: string, metadata: any): (any?, any?)
    seed_user(actor_id)
    return executor(actor_id):call("app:admit_upload", {
        action = "complete", actor_id = actor_id, upload_id = upload_id,
        etag = etag, metadata = metadata,
    })
end

local function create_completed_upload(upload_id: string, user_id: string, mime_type: string, filename: string, size: integer): any
    local upload, upload_err = upload_record_repo.create(
        upload_id,
        user_id,
        size,
        mime_type,
        "app:uploads",
        upload_id .. ".bin",
        "documents",
        { filename = filename },
        "completed"
    )
    test.is_nil(upload_err)
    test.not_nil(upload)
    return upload
end

local function create_completed_upload_with_bytes(upload_id: string, user_id: string, mime_type: string, filename: string, bytes: string, type_id: string?): any
    local storage = fs.get("app:uploads")
    test.not_nil(storage)
    local path = upload_id .. ".bin"
    local ok, write_err = storage:writefile(path, bytes)
    test.is_nil(write_err)
    test.is_true(ok)

    local upload, upload_err = upload_record_repo.create(
        upload_id,
        user_id,
        #bytes,
        mime_type,
        "app:uploads",
        path,
        type_id or "images",
        { filename = filename },
        "completed"
    )
    test.is_nil(upload_err)
    test.not_nil(upload)
    return upload
end

local function storage_has_prefix(storage, prefix: string): boolean
    local iter, state = storage:readdir(".")
    if not iter then error("failed to list upload test storage: " .. tostring(state)) end
    for item in iter, state do
        if type(item.name) == "string" and item.name:sub(1, #prefix) == prefix then
            return true
        end
    end
    return false
end

local function define_tests()
    test.describe("kickside.uploads packaging", function()
        test.before_all(require_integration_schema)
        test.it("terminal upload failures retain stored bytes and artifacts", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local upload_id = "failed-cleanup-" .. uuid_v4()
            local path = upload_id .. ".bin"
            local bytes = "failed upload bytes " .. upload_id
            local write_ok, write_err = storage:writefile(path, bytes)
            test.is_nil(write_err)
            test.is_true(write_ok ~= false)

            local upload, upload_err = upload_record_repo.create(
                upload_id, "failed-cleanup-user", #bytes, "application/pdf",
                "app:uploads", path, "documents", { filename = "failed.pdf" }, "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "partial.png",
                ordinal = 1,
                content = "partial artifact bytes " .. upload_id,
                storage_id = "app:uploads",
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)
            local artifact_path = artifact_content_repo.get_blob(artifact.blob_id).storage_path

            -- A terminally failed upload keeps its original bytes and partial artifacts,
            -- so it stays durable and re-processable.
            test.eq(bytes, (storage:readfile(path)))
            test.eq("partial artifact bytes " .. upload_id, (storage:readfile(artifact_path)))
            test.eq(1, #artifact_parts_repo.list_artifacts(upload_id))
            local blob, blob_err = artifact_content_repo.get_blob(artifact.blob_id)
            test.is_nil(blob_err)
            test.not_nil(blob)

            -- The row survives so the user still sees the failed upload.
            local row, row_err = upload_query_repo.get(upload_id)
            test.is_nil(row_err)
            test.not_nil(row)
            test.eq(upload_id, row.uuid)
        end)

        test.it("process job terminal error retains the upload's stored bytes", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local upload_id = "job-error-cleanup-" .. uuid_v4()
            local user_id = "job-error-user-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local path = upload_id .. ".bin"
            local bytes = "job error bytes " .. upload_id
            local write_ok, write_err = storage:writefile(path, bytes)
            test.is_nil(write_err)
            test.is_true(write_ok ~= false)

            -- A non-existent type id fails pipeline resolution, so the job hits its
            -- terminal error path on this (default, final) attempt.
            local upload, upload_err = upload_record_repo.create(
                upload_id, user_id, #bytes, "application/octet-stream",
                "app:uploads", path, "nonexistent-type-" .. uuid_v4(),
                upload_metadata(user_id, "job-error.bin"), "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(queue_err)
            local db = assert(sql.get("app:db"))
            local token = uuid_v4()
            local leased, lease_err = db:execute([[UPDATE kickside_job SET status='running',lease_token=$1,
                execution_seq=1,attempts=5,lease_until=$2 WHERE id=$3]],
                { token, jobs_lifecycle.future_string(tostring(db:type()), 60), queued.job_id })
            test.is_nil(lease_err)
            test.eq(tonumber(leased.rows_affected), 1)
            local job = assert(db:query("SELECT * FROM kickside_job WHERE id=$1", { queued.job_id }))[1]
            local input, _, input_err = worker_dispatch.build_worker_input(job)
            test.is_nil(input_err)
            local result, run_err = process_job.run(input)
            test.is_nil(run_err)
            test.not_nil(result)
            test.not_nil(result.job_error)
            test.eq(result.upload_id, upload_id)
            local events = assert(db:query([[SELECT type,body FROM kickside_event
                WHERE thread_id=$1 AND external_id=$2 AND type=$3]],
                { queued.thread_id, upload_id, uploads_events.TYPE.FAILED }))
            test.eq(#events, 1)
            test.eq(events[1].type, uploads_events.TYPE.FAILED)
            test.eq(json.decode(events[1].body).upload_id, upload_id)
            local settled = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", { job.id }))[1]
            test.eq(settled.status, "done")
            test.is_nil(settled.lease_token)
            local runs = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE job_id=$1", { job.id }))
            test.eq(#runs, 1)
            test.eq(runs[1].status, "completed")
            test.is_nil(runs[1].error_text)
            db:release()

            local row, row_err = upload_query_repo.get(upload_id)
            test.is_nil(row_err)
            test.eq("failed", row.storage_state)
            test.eq(bytes, (storage:readfile(path)))
        end)

        test.it("adds stage title and function id to processor errors", function()
            local upload_id = "stage-error-" .. uuid_v4()
            local user_id = "stage-error-user-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local path = upload_id .. ".txt"
            local bytes = "stage error bytes " .. upload_id
            local storage = fs.get("app:uploads")
            test.not_nil(storage)
            local write_ok, write_err = storage:writefile(path, bytes)
            test.is_nil(write_err)
            test.is_true(write_ok ~= false)

            local metadata = metadata_with_identity(user_id, "stage-error.txt", { fail_stage_test = true })
            local upload, upload_err = upload_record_repo.create(
                upload_id, user_id, #bytes, "application/x-kickside-failing-stage-test",
                "app:uploads", path, "app:types.failing", metadata, "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local success, err = pipeline_lib.process_upload(upload)
            test.is_false(success)
            test.contains(tostring(err), "upload stage")
            test.contains(tostring(err), "(app:failing_stage) failed")
            test.contains(tostring(err), "test unavailable resource: app:failing_stage")
        end)

        test.it("reports a failed stage metadata write instead of losing the document error", function()
            local upload_id, user_id = uuid_v4(), "metadata-write-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local metadata = metadata_with_identity(user_id, "scan.png", {
                stage_metadata = { ocr_error = "vision request rejected" },
            })
            local upload = assert(upload_record_repo.create(upload_id, user_id, 16, "image/png",
                "app:uploads", upload_id .. ".png", "app:types.failing", metadata, "uploaded"))
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, db:execute("ALTER TABLE kickside_uploads RENAME COLUMN metadata TO unavailable_metadata")))
            db:release()
            local ok, err = pipeline_lib.process_upload(upload)
            local restore = assert(sql.get("app:db"))
            test.is_nil(select(2, restore:execute("ALTER TABLE kickside_uploads RENAME COLUMN unavailable_metadata TO metadata")))
            restore:release()
            test.is_false(ok)
            test.contains(tostring(err), "metadata")
            local retry_ok, retry_err = pipeline_lib.process_upload(upload)
            test.is_false(retry_ok)
            test.contains(tostring(retry_err), "vision request rejected")
            local stored = assert(upload_query_repo.get(upload_id))
            test.eq(stored.metadata.ocr_error, "vision request rejected")
        end)

        test.it("conversion error metadata fails processing and remains available for reprocessing", function()
            for _, key in ipairs({ "ocr_error", "asr_error", "conversion_error" }) do
                local upload_id, user_id = uuid_v4(), "conversion-error-" .. uuid_v4()
                ensure_uploads_component(user_id)
                local metadata = metadata_with_identity(user_id, "scan.pdf", {
                    stage_metadata = { [key] = "transcription_failed" },
                })
                local upload = assert(upload_record_repo.create(upload_id, user_id, 16, "application/pdf",
                    "app:uploads", upload_id .. ".pdf", "app:types.failing", metadata, "uploaded"))
                local ok, err = pipeline_lib.process_upload(upload)
                test.is_false(ok, key .. " must fail the upload even when the stage returns success=true")
                test.contains(tostring(err), "Failing Test Stage")
                test.contains(tostring(err), "transcription_failed")
                local stored = assert(upload_query_repo.get(upload_id))
                test.eq(stored.metadata[key], "transcription_failed")
                stored.metadata.stage_metadata[key] = false
                local retry_ok, retry_err = pipeline_lib.process_upload(stored)
                test.is_nil(retry_err)
                test.is_true(retry_ok)
                test.is_false(assert(upload_query_repo.get(upload_id)).metadata[key])
            end
        end)

        test.it("conversion errors publish failed status with the reason and retain preview artifacts", function()
            local upload_id, user_id = uuid_v4(), "conversion-status-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local path, bytes = upload_id .. ".pdf", "scanned document bytes"
            local storage = assert(fs.get("app:uploads"))
            local written, write_err = storage:writefile(path, bytes)
            test.is_nil(write_err)
            test.is_true(written)
            local metadata = metadata_with_identity(user_id, "scan.pdf", {
                stage_metadata = { ocr_error = "transcription_failed" },
            })
            local upload = assert(upload_record_repo.create(upload_id, user_id, #bytes, "application/pdf",
                "app:uploads", path, "app:types.failing", metadata, "uploaded"))
            local primary = assert(artifact_content_repo.create_artifact({
                upload_id = upload_id, kind = "markdown", role = "primary", mime_type = "text/markdown",
                content = "", storage_id = "app:uploads", ordinal = 1,
            }))
            local queued = assert(process_worker.enqueue_upload_job(upload, true))
            local db = assert(sql.get("app:db"))
            local token = uuid_v4()
            test.is_nil(select(2, db:execute([[UPDATE kickside_job SET status='running',lease_token=$1,
                execution_seq=1,attempts=5,lease_until=$2 WHERE id=$3]],
                { token, jobs_lifecycle.future_string(tostring(db:type()), 60), queued.job_id })))
            local job = assert(db:query("SELECT * FROM kickside_job WHERE id=$1", { queued.job_id }))[1]
            local input, _, input_err = worker_dispatch.build_worker_input(job)
            test.is_nil(input_err)
            local result, run_err = process_job.run(input)
            test.is_nil(run_err)
            test.not_nil(result)
            test.contains(tostring(result.job_error), "transcription_failed")
            local events = assert(db:query([[SELECT type,body,created_at FROM kickside_event
                WHERE thread_id=$1 AND external_id=$2 AND type IN ($3,$4)]],
                { queued.thread_id, upload_id, uploads_events.TYPE.FAILED, uploads_events.TYPE.COMPLETED }))
            db:release()
            test.eq(#events, 1)
            test.eq(events[1].type, uploads_events.TYPE.FAILED)
            local body = json.decode(events[1].body)
            test.contains(body.error, "transcription_failed")
            test.is_nil(select(2, upload_read_model.apply_events(queued.thread_id, {
                { type = events[1].type, body = body, created_at = events[1].created_at },
            })))
            local row = assert(upload_read_model.get_for_actor(user_id, upload_id))
            test.eq(row.status, "error")
            test.contains(row.error, "transcription_failed")
            test.not_nil(upload_response.format_list_upload(row).error)
            test.eq(assert(upload_query_repo.get(upload_id)).storage_state, "failed")
            test.eq(storage:readfile(path), bytes)
            test.eq(assert(artifact_content_repo.get_artifact(upload_id, primary.artifact_id)).artifact_id, primary.artifact_id)
        end)

        test.it("allows a completion token without an optional error callback to settle failure", function()
            local upload_id, user_id = uuid_v4(), "optional-callback-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local metadata = upload_metadata(user_id, "callback.txt")
            local identity = metadata[IDENTITY_META_KEY]
            local token, token_err = upload_tokens.pack({
                upload_id = upload_id,
                function_id = "app:callback_probe",
                actor_id = identity.actor_id,
                actor_context = identity.actor_context,
            })
            test.is_nil(token_err)
            metadata.__upload_token = token
            local upload = assert(upload_record_repo.create(upload_id, user_id, 1, "text/plain",
                "app:uploads", upload_id .. ".txt", "text", metadata, "processing"))
            local ok, err = pipeline_lib.invoke_upload_token(upload, false, "conversion rejected")
            test.is_nil(err)
            test.is_true(ok)
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query([[SELECT id FROM kickside_job
                WHERE thread_id=$1 AND job_type=$2]],
                { uploads_events.component_id_for_owner(user_id), "kickside.uploads.service:callback_job" }))
            db:release()
            test.eq(#rows, 0)
        end)

        test.it("schedules upload completion callbacks as idempotent core jobs", function()
            local upload_id = uuid_v4()
            local user_id = "user-callback-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local identity = upload_metadata(user_id, "callback.txt")[IDENTITY_META_KEY]
            local trace_context = { trace_id = "trace-" .. uuid_v4(), run_id = "run-" .. uuid_v4() }
            local token, token_err = upload_tokens.pack({
                upload_id = upload_id,
                function_id = "app:callback_probe",
                actor_id = identity.actor_id,
                actor_context = identity.actor_context,
                trace_context = trace_context,
            })
            test.is_nil(token_err)
            test.not_nil(token)

            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                10,
                "text/plain",
                "app:uploads",
                upload_id .. ".txt",
                "text",
                {
                    filename = "callback.txt",
                    __upload_token = token,
                    [IDENTITY_META_KEY] = identity,
                },
                "processing",
                nil,
                trace_context
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local ok, enqueue_err = pipeline_lib.invoke_upload_token(upload, true, nil)
            test.is_nil(enqueue_err)
            test.is_true(ok)
            local dup_ok, dup_err = pipeline_lib.invoke_upload_token(upload, true, nil)
            test.is_nil(dup_err)
            test.is_true(dup_ok)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows = sql.builder.select("id", "job_type", "worker_ref", "concurrency_key", "idempotency_key", "payload", "actor_id", "owner_kind", "owner_id")
                :from("kickside_job")
                :where(sql.builder.eq({ job_type = "kickside.uploads.service:callback_job" }))
                :where(sql.builder.eq({ thread_id = uploads_events.component_id_for_owner(user_id) }))
                :run_with(db):query()
            db:release()
            test.eq(#rows, 1)
            test.eq(rows[1].worker_ref, "kickside.uploads.service:callback_job")
            test.eq(rows[1].concurrency_key, "uploads:callback:" .. uploads_events.component_id_for_owner(user_id))
            test.is_nil(rows[1].actor_id)
            test.eq(rows[1].owner_kind, "user")
            test.eq(rows[1].owner_id, user_id)

            local job_payload = json.decode(tostring(rows[1].payload))
            test.eq(job_payload.upload_id, upload_id)
            test.is_true(job_payload.success)

            local result, run_err = funcs.new():call("kickside.uploads.service:callback_job", { payload = job_payload })
            test.is_nil(run_err)
            test.is_true(result.success)

            local probe_db, probe_db_err = sql.get("app:db")
            test.is_nil(probe_db_err)
            local probe_rows = probe_db:query("SELECT upload_id, status, trace_id FROM upload_callback_probe WHERE upload_id = $1", { upload_id })
            probe_db:release()
            test.eq(#probe_rows, 1)
            test.eq(probe_rows[1].status, "completed")
            test.eq(probe_rows[1].trace_id, trace_context.trace_id)
        end)

        test.it("requires upload_id in callback tokens and refuses a token for another upload", function()
            local owner = "callback-bound-" .. uuid_v4()
            local target = uuid_v4()
            local other = uuid_v4()
            local identity = upload_metadata(owner, "callback.txt")[IDENTITY_META_KEY]
            local unbound, unbound_err = upload_tokens.pack({ function_id = "app:callback_probe",
                actor_id = identity.actor_id, actor_context = identity.actor_context })
            test.is_nil(unbound)
            test.eq(unbound_err:kind(), errors.INVALID)
            local token, token_err = upload_tokens.pack({ upload_id = other,
                function_id = "app:callback_probe", actor_id = identity.actor_id,
                actor_context = identity.actor_context })
            test.is_nil(token_err)
            local upload, create_err = upload_record_repo.create(target, owner, 1, "text/plain",
                "app:uploads", target .. ".txt", "text", upload_metadata(owner, "callback.txt"), "uploaded")
            test.is_nil(create_err)
            test.not_nil(upload)
            local result, err = callback_job.run({ payload = { upload_id = target, token = token, success = true } })
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
