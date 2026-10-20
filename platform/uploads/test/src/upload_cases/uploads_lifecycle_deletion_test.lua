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
        test.it("deleting an upload reclaims its now-unreferenced artifact blobs", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local lone_id = "blob-gc-lone-" .. uuid_v4()
            local lone_bytes = "lone blob bytes " .. lone_id
            create_completed_upload(lone_id, "test-user", "application/pdf", "lone.pdf", #lone_bytes)
            local lone, lone_err = artifact_content_repo.create_artifact({
                upload_id = lone_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "lone.png",
                ordinal = 1,
                content = lone_bytes,
                storage_id = "app:uploads",
            })
            test.is_nil(lone_err)
            test.not_nil(lone)
            test.not_nil(lone.blob_id)

            -- Two uploads share the same content-addressed blob (same storage + checksum):
            -- deleting one must keep the blob alive for the survivor.
            local shared_bytes = "shared blob bytes " .. lone_id
            local doomed_id = "blob-gc-doomed-" .. uuid_v4()
            create_completed_upload(doomed_id, "test-user", "application/pdf", "doomed.pdf", #shared_bytes)
            local doomed, doomed_err = artifact_content_repo.create_artifact({
                upload_id = doomed_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "doomed.png",
                ordinal = 1,
                content = shared_bytes,
                storage_id = "app:uploads",
            })
            test.is_nil(doomed_err)
            test.not_nil(doomed)

            local survivor_id = "blob-gc-survivor-" .. uuid_v4()
            create_completed_upload(survivor_id, "test-user", "application/pdf", "survivor.pdf", #shared_bytes)
            local survivor, survivor_err = artifact_content_repo.create_artifact({
                upload_id = survivor_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "survivor.png",
                ordinal = 1,
                content = shared_bytes,
                storage_id = "app:uploads",
            })
            test.is_nil(survivor_err)
            test.not_nil(survivor)
            test.eq(doomed.blob_id, survivor.blob_id)

            local lone_path = artifact_content_repo.get_blob(lone.blob_id).storage_path
            local shared_path = artifact_content_repo.get_blob(doomed.blob_id).storage_path
            test.eq(lone_bytes, (storage:readfile(lone_path)))
            test.eq(shared_bytes, (storage:readfile(shared_path)))

            -- Delete the lone upload: its only blob is now unreferenced and must be gone.
            local deleted, delete_err = upload_lib.delete_upload(lone_id)
            test.is_nil(delete_err)
            test.not_nil(deleted)

            local remaining_artifacts = artifact_parts_repo.list_artifacts(lone_id)
            test.eq(0, #remaining_artifacts)

            local lone_blob, lone_blob_err = artifact_content_repo.get_blob(lone.blob_id)
            test.is_nil(lone_blob)
            test.is_true(errors.is(lone_blob_err, errors.NOT_FOUND))
            test.is_nil((storage:readfile(lone_path)))

            -- Delete one of the two uploads sharing a blob: the blob and its bytes stay
            -- because the survivor's artifact still references it.
            local _, doomed_delete_err = upload_lib.delete_upload(doomed_id)
            test.is_nil(doomed_delete_err)

            local shared_blob, shared_blob_err = artifact_content_repo.get_blob(doomed.blob_id)
            test.is_nil(shared_blob_err)
            test.not_nil(shared_blob)
            test.eq(shared_bytes, (storage:readfile(shared_path)))

            -- Once the survivor is gone too, the shared blob is reclaimed.
            local _, survivor_delete_err = upload_lib.delete_upload(survivor_id)
            test.is_nil(survivor_delete_err)

            local gone_blob, gone_blob_err = artifact_content_repo.get_blob(doomed.blob_id)
            test.is_nil(gone_blob)
            test.is_true(errors.is(gone_blob_err, errors.NOT_FOUND))
            test.is_nil((storage:readfile(shared_path)))
        end)

        test.it("deduplicates identical bytes uploaded twice by one account", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local user_id = "dedup-user-" .. uuid_v4()
            local bytes = "identical content " .. uuid_v4()

            local first, first_err = upload_as(user_id, bytes, "first.txt", #bytes, "text/plain", "app:uploads", client_metadata("first.txt", { source = "uploads.test" }))
            test.is_nil(first_err)
            test.not_nil(first)
            test.not_nil(first.content_sha256)
            test.is_nil(first.deduped)

            local first_path = first.storage_path
            test.eq(bytes, (storage:readfile(first_path)))

            local second, second_err = upload_as(user_id, bytes, "second.txt", #bytes, "text/plain", "app:uploads", client_metadata("second.txt", { source = "uploads.test" }))
            test.is_nil(second_err)
            test.not_nil(second)
            -- The duplicate resolves to the first record; no second blob is stored.
            test.eq(first.uuid, second.uuid)
            test.is_true(second.deduped)
            test.eq(first.content_sha256, second.content_sha256)

            -- Exactly one record carries this content for the account.
            local matched, matched_err = upload_query_repo.find_by_content_hash(user_id, first.content_sha256)
            test.is_nil(matched_err)
            test.not_nil(matched)
            test.eq(first.uuid, matched.uuid)
            test.eq(bytes, (storage:readfile(first_path)))
        end)

        test.it("uploads identical bytes again as a new upload after the first one failed", function()
            local user_id = "dedup-failed-user-" .. uuid_v4()
            local bytes = "failed content " .. uuid_v4()

            local first, first_err = upload_as(user_id, bytes, "scan.txt", #bytes, "text/plain", "app:uploads", client_metadata("scan.txt", { source = "uploads.test" }))
            test.is_nil(first_err)
            test.not_nil(first)
            local _, mark_err = upload_record_repo.mark_storage_failed(first.uuid)
            test.is_nil(mark_err)

            local second, second_err = upload_as(user_id, bytes, "scan.txt", #bytes, "text/plain", "app:uploads", client_metadata("scan.txt", { source = "uploads.test" }))
            test.is_nil(second_err)
            test.not_nil(second)
            test.is_nil(second.deduped)
            test.is_true(second.uuid ~= first.uuid)
            test.eq(first.content_sha256, second.content_sha256)

            local failed, failed_err = upload_query_repo.get(first.uuid)
            test.is_nil(failed_err)
            test.eq("failed", failed.storage_state)
            test.is_nil(failed.content_sha256)
        end)

        -- The HTTP create endpoint parses the multipart body and hands the stream to
        -- upload_lib.upload_file under the request actor; the reference upload below
        -- is that same call. The tool upload must be indistinguishable from it.
        test.it("UploadFile creates the upload the HTTP upload path creates, owned by the acting user", function()
            local user_id = "inline-upload-user-" .. uuid_v4()
            ensure_uploads_component(user_id)
            local tool_bytes = "RIFF\0\0\0\0WEBPVP8 tool " .. uuid_v4()
            local http_bytes = "RIFF\0\0\0\0WEBPVP8 http " .. uuid_v4()

            local result, call_err = executor(user_id):call("kickside.uploads.traits:upload_file", {
                filename = "hero.webp",
                content_type = "image/webp",
                content_base64 = base64.encode(tool_bytes),
                title = "Hero image",
            })
            test.is_nil(call_err)
            test.not_nil(result)
            test.is_nil(result.error, tostring(result.error))
            test.not_nil(result.upload_id)
            test.is_true(result.status == "processing" or result.status == "completed", tostring(result.status))

            local reference, reference_err = upload_as(
                user_id, http_bytes, "hero-http.webp", #http_bytes, "image/webp", nil,
                client_metadata("hero-http.webp", {})
            )
            test.is_nil(reference_err)
            test.not_nil(reference)

            local via_tool = upload_query_repo.get(result.upload_id)
            local via_http = upload_query_repo.get(reference.uuid)
            test.not_nil(via_tool)
            test.not_nil(via_http)

            test.eq(via_tool.actor_id, user_id)
            test.eq(via_tool.actor_id, via_http.actor_id)
            test.eq(via_tool.type_id, "kickside.uploads:types.images")
            test.eq(via_tool.type_id, via_http.type_id)
            test.eq(via_tool.mime_type, "image/webp")
            test.eq(via_tool.mime_type, via_http.mime_type)
            test.eq(via_tool.storage_id, via_http.storage_id)
            test.eq(via_tool.size, #tool_bytes)
            test.eq(via_tool.content_sha256, (hash.sha256(tool_bytes)))
            test.eq(via_tool.metadata.filename, "hero.webp")
            test.eq(via_tool.metadata.title, "Hero image")
            test.eq(via_tool.metadata[IDENTITY_META_KEY].actor_id, user_id)
            test.eq(via_http.metadata[IDENTITY_META_KEY].actor_id, user_id)

            local storage = fs.get(via_tool.storage_id)
            test.not_nil(storage)
            test.eq(storage:readfile(via_tool.storage_path), tool_bytes)

            local tool_status = upload_read_model.get_for_actor(user_id, via_tool.uuid)
            local http_status = upload_read_model.get_for_actor(user_id, via_http.uuid)
            test.not_nil(tool_status)
            test.not_nil(http_status)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            for _, upload_id in ipairs({ via_tool.uuid, via_http.uuid }) do
                local stored, stored_err = upload_query_repo.get(upload_id)
                test.is_nil(stored_err)
                local jobs = sql.builder.select("job_type")
                    :from("kickside_job")
                    :where(sql.builder.eq({ id = stored.processing_job_id }))
                    :run_with(db):query()
                test.eq(#jobs, 1, "one processing job per upload")
                test.eq(jobs[1].job_type, "kickside.uploads.service:process_job_proc")

                local queued = sql.builder.select("external_source")
                    :from("kickside_event")
                    :where(sql.builder.eq({ external_id = upload_id, type = uploads_events.TYPE.QUEUED }))
                    :run_with(db):query()
                test.eq(#queued, 1, "one queued event per upload")
                test.eq(queued[1].external_source, "uploads")
            end
            db:release()

            local other, other_err = upload_read_model.get_for_actor("someone-else-" .. uuid_v4(), via_tool.uuid)
            test.is_nil(other)
            test.not_nil(other_err)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
