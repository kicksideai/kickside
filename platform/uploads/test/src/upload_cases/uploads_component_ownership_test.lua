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
        test.it("does not let a caller choose another upload owner", function()
            local caller = "caller-" .. uuid_v4()
            seed_user(caller)
            local victim = "victim-" .. uuid_v4()
            local upload, err = executor(caller):call("app:admit_upload", {
                action = "upload", actor_id = victim, bytes = "x", filename = "owner.txt",
                size = 1, mime_type = "text/plain", storage_id = "app:uploads",
                metadata = { filename = "owner.txt" },
            })
            test.is_nil(upload)
            test.eq(err:kind(), errors.PERMISSION_DENIED)
        end)

        test.it("admits the authenticated owner without actor creation authority", function()
            local owner = "normal-upload-" .. uuid_v4()
            seed_user(owner)
            local actor = assert(security.new_actor(owner, { security_groups = { "app:uploads_test" } }))
            local scope = assert(security.new_scope({
                assert(security.policy("app:test_scope_policy")),
                assert(security.policy("app:no_actor_creation")),
            }))
            local upload, err = funcs.new():with_actor(actor):with_scope(scope):call("app:admit_upload", {
                action = "upload", actor_id = owner, bytes = "normal admission", filename = "normal.txt",
                size = 16, mime_type = "text/plain", storage_id = "app:uploads", metadata = {},
            })
            test.is_nil(err, tostring(err))
            test.not_nil(upload)
            test.eq(upload.actor_id, owner)
            local persisted, persisted_err = upload_query_repo.get(upload.uuid)
            test.is_nil(persisted_err)
            test.not_nil(persisted.processing_job_id)
        end)

        test.it("deletes an owned archive with stages without deferred-owner authority", function()
            local owner = "member-delete-" .. uuid_v4()
            ensure_uploads_component(owner)
            local id = uuid_v4()
            local storage = assert(fs.get("app:uploads"))
            local bytes = build_zip({})
            local _, store_err = storage:writefile(id .. ".zip", bytes)
            test.is_nil(store_err, tostring(store_err))
            local upload, create_err = upload_record_repo.create(id, owner, #bytes, "application/zip",
                "app:uploads", id .. ".zip", "kickside.uploads.archive:types.archive",
                upload_metadata(owner, "owned.zip"), "completed")
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(upload)
            local actor = assert(security.new_actor(owner, { security_groups = { "app:uploads_test" } }))
            local scope = assert(security.new_scope({
                assert(security.policy("app:test_scope_policy")),
                assert(security.policy("app:no_deferred_owner")),
                assert(security.policy("app:no_actor_creation")),
            }))
            local result, err = funcs.new():with_actor(actor):with_scope(scope):call("app:admit_upload", {
                action = "delete", upload_id = id,
            })
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            local remaining, read_err = upload_query_repo.get(id)
            test.is_nil(remaining)
            test.not_nil(read_err)
        end)

        test.it("uses the real Users resolver to stop revoked upload work", function()
            local owner = "revoked-upload-" .. uuid_v4()
            local upload_id = uuid_v4()
            local metadata = upload_metadata(owner, "revoked.txt")
            local upload, create_err = upload_record_repo.create(upload_id, owner, 1, "text/plain",
                "app:uploads", upload_id .. ".txt", "text", metadata, "uploaded")
            test.is_nil(create_err)
            test.not_nil(upload)
            local live, live_err = pipeline_lib.upload_stage_executor(upload, "upload:live", {})
            test.is_nil(live_err)
            test.not_nil(live)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, suspend_err = db:execute("UPDATE app_users SET status = 'suspended' WHERE user_id = $1", { owner })
            test.is_nil(suspend_err)
            db:release()

            local stage, stage_err = pipeline_lib.upload_stage_executor(upload, "upload:revoked", {})
            test.is_nil(stage)
            test.eq(stage_err:kind(), errors.PERMISSION_DENIED)
            local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(queued)
            test.eq(queue_err:kind(), errors.PERMISSION_DENIED)
            local identity = metadata[IDENTITY_META_KEY]
            local token, token_err = upload_tokens.pack({ upload_id = upload_id,
                function_id = "app:callback_probe", actor_id = identity.actor_id,
                actor_context = identity.actor_context })
            test.is_nil(token_err)
            local callback, callback_err = callback_job.run({ payload = {
                upload_id = upload_id, token = token, success = true } })
            test.is_nil(callback)
            test.eq(callback_err:kind(), errors.PERMISSION_DENIED)
        end)

        test.it("refuses a legacy uploader identity before running a stage", function()
            local stage_executor, identity_err = pipeline_lib.upload_stage_executor({
                uuid = uuid_v4(),
                actor_id = "legacy-user",
                metadata = {
                    [IDENTITY_META_KEY] = {
                        actor_id = "legacy-user",
                        actor_context = '{"version":1,"scope_id":"wippy.security:process"}',
                    },
                },
            }, "upload:legacy", {})

            test.is_nil(stage_executor)
            test.eq(identity_err:kind(), errors.INVALID)
            test.contains(tostring(identity_err), "unsupported execution identity version")
        end)

        test.it("rolls upload creation back when job admission fails and retries atomically", function()
            local user_id = "user-enqueue-retry-" .. uuid_v4()
            local bytes = "retry job outage " .. uuid_v4()
            ensure_uploads_component(user_id)
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, db:execute("ALTER TABLE kickside_job RENAME TO kickside_job_unavailable")))
            db:release()
            local upload, upload_err = upload_as(user_id, bytes, "retry.txt", #bytes,
                "text/plain", "app:uploads", { filename = "retry.txt" })
            local rows, list_err = upload_query_repo.list_by_actor(user_id, 10, 0)
            local restore = assert(sql.get("app:db"))
            test.is_nil(select(2, restore:execute("ALTER TABLE kickside_job_unavailable RENAME TO kickside_job")))
            restore:release()
            test.is_nil(upload)
            test.not_nil(upload_err)
            test.is_nil(list_err)
            test.eq(#rows, 0)
            local retried, retry_err = upload_as(user_id, bytes, "retry.txt", #bytes,
                "text/plain", "app:uploads", { filename = "retry.txt" })
            test.is_nil(retry_err)
            local stored = assert(upload_query_repo.get(retried.uuid))
            test.eq(stored.processing_intent_state, "acknowledged")
            test.not_nil(stored.processing_job_id)
            local jobs_db = assert(sql.get("app:db"))
            local jobs = assert(jobs_db:query("SELECT id FROM kickside_job WHERE id=$1", { stored.processing_job_id }))
            local events = assert(jobs_db:query("SELECT id FROM kickside_event WHERE external_id=$1 AND type=$2",
                { stored.uuid, uploads_events.TYPE.QUEUED }))
            jobs_db:release()
            test.eq(#jobs, 1)
            test.eq(#events, 1)
            test.eq(bytes, (fs.get("app:uploads"):readfile(stored.storage_path)))
        end)

        test.it("deleting an upload cancels its core processing job", function()
            local upload_id = uuid_v4()
            local user_id = "user-cancel-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                10,
                "text/plain",
                "app:uploads",
                upload_id .. ".txt",
                "text",
                upload_metadata(user_id, "cancel.txt"),
                "uploaded", nil, nil, true
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local queued, queue_err = process_worker.enqueue_upload_job(upload, true)
            test.is_nil(queue_err)
            test.is_true(queued.enqueued)
            local _, ack_err = processing_intent_repo.acknowledge_enqueue(upload_id, queued.job_id)
            test.is_nil(ack_err)

            local _, delete_err = upload_lib.delete_upload(upload_id)
            test.is_nil(delete_err)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows = sql.builder.select("status", "last_error")
                :from("kickside_job")
                :where(sql.builder.eq({ id = queued.job_id }))
                :run_with(db):query()
            db:release()
            test.eq(#rows, 1)
            test.eq(rows[1].status, "cancelled")
            test.eq(rows[1].last_error, "cancelled")
        end)

        test.it("upload job target treats deleted uploads as idempotent", function()
            local missing, missing_err = process_job.run({ payload = { upload_id = uuid_v4() } })
            test.is_nil(missing_err)
            test.is_true(missing.skipped)
            test.is_true(missing.cancelled)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
