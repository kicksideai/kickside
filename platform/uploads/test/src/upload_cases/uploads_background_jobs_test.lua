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
        test.it("does not publish a module-local processing queue", function()
            test.is_nil((registry.get("kickside.uploads:process_consumer")))
            test.is_nil((registry.get("kickside.uploads:process_queue")))
            test.is_nil((registry.get("kickside.uploads:queue_driver")))
            test.is_nil((registry.get("kickside.uploads:recover_pending")))
            test.is_nil((registry.get("kickside.uploads:recover_pending.service")))
        end)

        test.it("submits uploads to one idempotent core job", function()
            local upload_id = uuid_v4()
            local user_id = "user-job-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                10,
                "text/plain",
                "app:uploads",
                upload_id .. ".txt",
                "text",
                upload_metadata(user_id, "job.txt"),
                "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local first, first_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(first_err)
            test.not_nil(first)
            test.is_true(first.enqueued, "first job result: " .. json.encode(first))
            test.eq(first.upload_id, upload_id)

            local second, second_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(second_err)
            test.not_nil(second)
            test.is_true(second.duplicate, "second job result: " .. json.encode(second))
            test.eq(second.job_id, first.job_id)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows = sql.builder.select("id", "job_type", "worker_ref", "concurrency_key", "idempotency_key", "payload", "actor_id", "owner_kind", "owner_id")
                :from("kickside_job")
                :where(sql.builder.eq({ id = first.job_id }))
                :run_with(db):query()
            test.eq(#rows, 1)
            test.eq(rows[1].job_type, "kickside.uploads.service:process_job_proc")
            test.eq(rows[1].worker_ref, "kickside.uploads.service:process_job_proc")
            test.eq(rows[1].concurrency_key, "uploads:" .. tostring(first.thread_id))
            test.is_nil(rows[1].actor_id)
            test.eq(rows[1].owner_kind, "user")
            test.eq(rows[1].owner_id, user_id)
            local payload = json.decode(tostring(rows[1].payload))
            test.eq(payload.upload_id, upload_id)
            -- The submitter carries a hard per-attempt ceiling so the supervising
            -- worker can terminate a hung run.
            test.is_true(tonumber(payload.max_execution_ms) ~= nil and tonumber(payload.max_execution_ms) >= 1)

            local event_rows = sql.builder.select("type", "body", "external_source", "external_id", "external_version")
                :from("kickside_event")
                :where(sql.builder.eq({ thread_id = tostring(first.thread_id), type = uploads_events.TYPE.QUEUED }))
                :run_with(db):query()
            db:release()
            test.eq(#event_rows, 1)
            local event_body = json.decode(tostring(event_rows[1].body))
            test.eq(event_body.upload_id, upload_id)
            test.eq(event_rows[1].external_source, "uploads")
            test.eq(event_rows[1].external_id, upload_id)
            test.eq(event_rows[1].external_version, uploads_events.TYPE.QUEUED)
        end)

        test.it("provisions the uploads component on first ingest by a non-interactive actor", function()
            -- A bridge/service actor never passes websocket login, so the workspace
            -- plugin never runs for it. enqueue_upload_job is the lifecycle-owner moment
            -- that first materializes its uploads component. No prior provisioning here.
            local upload_id = uuid_v4()
            local user_id = "bridge-first-ingest-" .. uuid_v4()
            local component_id = uploads_events.component_id_for_owner(user_id)
            test.not_nil(component_id)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local before = sql.builder.select("id")
                :from("kickside_thread")
                :where(sql.builder.eq({ id = tostring(component_id) }))
                :run_with(db):query()
            test.eq(#before, 0, "the uploads component must not exist before first ingest")
            local before_proj = sql.builder.select("id")
                :from("kickside_projection")
                :where(sql.builder.eq({ thread_id = tostring(component_id) }))
                :run_with(db):query()
            test.eq(#before_proj, 0, "no declared projection exists before first ingest")
            db:release()

            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                10,
                "text/plain",
                "app:uploads",
                upload_id .. ".txt",
                "text",
                upload_metadata(user_id, "bridge.txt"),
                "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(queue_err)
            test.not_nil(queued)
            test.is_true(queued.enqueued)
            test.eq(queued.thread_id, component_id)

            local after_db, after_db_err = sql.get("app:db")
            test.is_nil(after_db_err)
            local after = sql.builder.select("id")
                :from("kickside_thread")
                :where(sql.builder.eq({ id = tostring(component_id) }))
                :run_with(after_db):query()
            test.eq(#after, 1, "first ingest provisions the uploads component thread")
            -- The declared projection is registered only by provisioning, so its
            -- presence proves ensure_user ran (an emitted event alone would not create it).
            local after_proj = sql.builder.select("id")
                :from("kickside_projection")
                :where(sql.builder.eq({ thread_id = tostring(component_id) }))
                :run_with(after_db):query()
            test.is_true(#after_proj >= 1, "first ingest registers the declared uploads projection")
            -- The QUEUED event lands on the freshly provisioned component thread.
            local events = sql.builder.select("type")
                :from("kickside_event")
                :where(sql.builder.eq({ thread_id = tostring(component_id), type = uploads_events.TYPE.QUEUED }))
                :run_with(after_db):query()
            after_db:release()
            test.eq(#events, 1, "the queued event is recorded on the provisioned thread")
        end)

        test.it("rejects upload jobs without a frozen execution identity", function()
            local upload_id = uuid_v4()
            local user_id = "missing-identity-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                10,
                "text/plain",
                "app:uploads",
                upload_id .. ".txt",
                "text",
                { filename = "missing-identity.txt" },
                "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local submitted, submit_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(submitted)
            test.eq(submit_err:kind(), errors.PERMISSION_DENIED)
            test.contains(tostring(submit_err), "upload execution identity is required")
        end)

        test.it("does not synthesize an actor-only executor for uploads", function()
            local executor_without_identity, executor_err = pipeline_lib.upload_stage_executor({
                uuid = uuid_v4(),
                actor_id = "owner-only-user",
                metadata = { filename = "owner-only.txt" },
            }, "upload:owner-only", {})

            test.is_nil(executor_without_identity)
            test.eq(executor_err:kind(), errors.PERMISSION_DENIED)
            test.contains(tostring(executor_err), "upload execution identity is required")
        end)

        test.it("rejects caller-owned identity on multipart upload admission", function()
            local victim = "victim-" .. uuid_v4()
            local upload, err = upload_lib.upload_file("caller-" .. uuid_v4(), "x", "forged.txt", 1,
                "text/plain", "app:uploads", upload_metadata(victim, "forged.txt"))
            test.is_nil(upload)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects caller-owned identity on presign admission", function()
            local presigned, err = upload_lib.generate_presigned_url("caller-" .. uuid_v4(),
                "forged.txt", 1, "text/plain", 900, upload_metadata("victim-" .. uuid_v4(), "forged.txt"))
            test.is_nil(presigned)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects identity replacement on presigned completion without changing the row", function()
            local owner = "owner-" .. uuid_v4()
            local upload_id = uuid_v4()
            local original = upload_metadata(owner, "pending.txt")
            local upload, create_err = upload_record_repo.create(upload_id, owner, 1, "text/plain",
                "uploads.s3", "pending/key.txt", "text", original, "pending")
            test.is_nil(create_err)
            test.not_nil(upload)
            local completed, err = upload_lib.complete_presigned_url(owner, upload_id, "etag",
                upload_metadata("victim-" .. uuid_v4(), "forged.txt"))
            test.is_nil(completed)
            test.eq(err:kind(), errors.INVALID)
            local stored, get_err = upload_query_repo.get(upload_id)
            test.is_nil(get_err)
            test.eq(stored.storage_state, "pending")
            test.eq(stored.metadata[IDENTITY_META_KEY].actor_context, original[IDENTITY_META_KEY].actor_context)
        end)

        test.it("rejects every private client metadata key", function()
            for _, key in ipairs({ "_execution_identity", "_actor_context", "__upload_token",
                "storage_id", "storage_path", "original_storage_path", "checksum" }) do
                local err = metadata_sanitizer.validate_client({ [key] = "forged" })
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
            test.is_nil(metadata_sanitizer.validate_client({ title = "safe" }))
            local nested = metadata_sanitizer.validate_client({ custom = { _execution_identity = {} } })
            test.eq(nested:kind(), errors.INVALID)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
