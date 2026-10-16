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
        test.it("sanitizes only public metadata views without mutating stored metadata", function()
            local missing = metadata_sanitizer.public(nil)
            test.eq("table", type(missing))
            test.eq(0, #missing)

            local invalid = metadata_sanitizer.public("not metadata")
            test.eq("table", type(invalid))
            test.eq(0, #invalid)

            local stored = {
                filename = "safe.pdf",
                tags = { "a", "b" },
                storage_id = "app:uploads",
                storage_path = "private/path.pdf",
                original_storage_id = "app:uploads",
                original_storage_path = "private/original.pdf",
                _execution_identity = { actor_id = "u1", actor_context = "{}" },
                __upload_token = "still stored internally",
            }
            local public = metadata_sanitizer.public(stored)
            test.eq("safe.pdf", public.filename)
            test.eq(stored.tags, public.tags)
            test.eq(nil, public.storage_id)
            test.eq(nil, public.storage_path)
            test.eq(nil, public.original_storage_id)
            test.eq(nil, public.original_storage_path)
            test.eq(nil, public._execution_identity)
            test.eq(nil, public.__upload_token)
            test.eq("u1", stored._execution_identity.actor_id)
            test.eq("still stored internally", stored.__upload_token)
        end)

        test.it("keeps storage locators out of public artifact views", function()
            local public = metadata_sanitizer.public_locator({
                type = "upload.original",
                upload_id = "upload-1",
                storage_id = "app:uploads",
                storage_path = "private/path.pdf",
                checksum = "abc",
                _execution_identity = { actor_id = "u1", actor_context = "{}" },
                page = 3,
                __debug = "internal",
            })
            test.eq("upload.original", public.type)
            test.eq("upload-1", public.upload_id)
            test.eq(3, public.page)
            test.eq(nil, public.storage_id)
            test.eq(nil, public.storage_path)
            test.eq(nil, public.checksum)
            test.eq(nil, public._execution_identity)
            test.eq(nil, public.__debug)
        end)

        test.it("packs narrow upload read capabilities without execution identity", function()
            local upload_id = "read-token-" .. uuid_v4()
            local token, err = upload_tokens.pack_read({
                upload_id = upload_id,
                artifact_id = "artifact-1",
                audience = "uploads.test",
                expires_in = 60,
            })
            test.is_nil(err)
            test.not_nil(token)

            local payload, unpack_err = upload_tokens.unpack_read(token, {
                upload_id = upload_id,
                artifact_id = "artifact-1",
            })
            test.is_nil(unpack_err)
            test.eq(payload.purpose, "upload.read")
            test.eq(payload.upload_id, upload_id)
            test.eq(payload.artifact_id, "artifact-1")
            test.eq(payload.actor_id, nil)
            test.eq(payload.actor_context, nil)

            local wrong_upload, wrong_upload_err = upload_tokens.unpack_read(token, { upload_id = "other-upload" })
            test.is_nil(wrong_upload)
            test.eq(wrong_upload_err, "Upload token does not match upload")

            local wrong_artifact, wrong_artifact_err = upload_tokens.unpack_read(token, {
                upload_id = upload_id,
                artifact_id = "artifact-2",
            })
            test.is_nil(wrong_artifact)
            test.eq(wrong_artifact_err, "Upload token does not match artifact")

            local whole_upload, whole_upload_err = upload_tokens.unpack_read(token, {
                upload_id = upload_id,
                artifact_id = false,
            })
            test.is_nil(whole_upload)
            test.eq(whole_upload_err, "Upload token does not match artifact")

            local tampered, tampered_err = upload_tokens.unpack_read(token .. "00", { upload_id = upload_id })
            test.is_nil(tampered)
            test.eq(tampered_err, "Invalid upload token signature")
        end)

        test.it("completes direct S3 uploads with durable metadata and a full returned row", function()
            local user_id = "s3-user-" .. uuid_v4()
            local upload_id = "s3-upload-" .. uuid_v4()
            local metadata = upload_metadata(user_id, "direct.pdf")
            metadata.keep = "old"
            metadata.__upload_token = "old-token"
            local trace_context = {
                trace_id = "trace-" .. uuid_v4(),
                run_id = "run-" .. uuid_v4(),
                correlation_key = "upload:s3:" .. uuid_v4(),
            }
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                123,
                "application/pdf",
                "uploads.s3",
                "old/key.pdf",
                "documents",
                metadata,
                "pending"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local bad_complete, bad_complete_err = upload_lib.complete_s3_upload(
                user_id,
                upload_id,
                "etag-bad",
                nil,
                {},
                "bad-trace"
            )
            test.is_nil(bad_complete)
            test.eq(bad_complete_err:kind(), errors.INVALID)
            test.eq(tostring(bad_complete_err), "trace_context must be an object")
            local still_pending = upload_query_repo.get(upload_id)
            test.eq("pending", still_pending.storage_state)

            local completed, complete_err = upload_lib.complete_s3_upload(
                user_id,
                upload_id,
                "etag-1",
                "new/key.pdf",
                { title = "Direct", __upload_token = "new-token", trace_context = { trace_id = "metadata-must-not-win" } },
                trace_context
            )
            test.is_nil(complete_err)
            test.not_nil(completed)
            test.eq("uploaded", completed.storage_state)
            test.is_true(completed.processing_intent_state == "pending"
                or completed.processing_intent_state == "acknowledged")
            test.is_true(tonumber(completed.processing_max_execution_ms) > 0)
            test.eq(123, tonumber(completed.size))
            test.eq("application/pdf", completed.mime_type)
            test.eq("new/key.pdf", completed.storage_path)
            test.not_nil(completed.created_at)
            test.eq("direct.pdf", completed.metadata.filename)
            test.eq("old", completed.metadata.keep)
            test.eq("Direct", completed.metadata.title)
            test.eq("new-token", completed.metadata.__upload_token)
            test.eq("etag-1", completed.metadata.s3_etag)
            test.is_nil(completed.metadata.trace_context)
            test.eq(trace_context.trace_id, completed.trace_context.trace_id)
            test.eq(trace_context.run_id, completed.trace_context.run_id)
            test.eq(trace_context.correlation_key, completed.trace_context.correlation_key)

            local retried, retry_err = upload_lib.complete_s3_upload(
                user_id,
                upload_id,
                "etag-2",
                nil,
                { retry_seen = true },
                { trace_id = "retry-must-not-overwrite" }
            )
            test.is_nil(retry_err)
            test.not_nil(retried)
            test.eq("uploaded", retried.storage_state)
            test.is_true(retried.processing_intent_state == "pending"
                or retried.processing_intent_state == "acknowledged")
            test.eq(completed.processing_max_execution_ms, retried.processing_max_execution_ms)
            test.eq("Direct", retried.metadata.title)
            test.is_true(retried.metadata.retry_seen)
            test.eq("etag-2", retried.metadata.s3_etag)
            test.eq(trace_context.trace_id, retried.trace_context.trace_id)

        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
