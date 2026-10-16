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
        test.it("document wrapper stores markdown as the primary artifact", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local upload_id = "doc2md-wrapper-" .. uuid_v4()
            local path = upload_id .. ".txt"
            local bytes = "Hello from document wrapper"
            local ok, write_err = storage:writefile(path, bytes)
            test.is_nil(write_err)
            test.is_true(ok ~= false)

            local upload, upload_err = upload_record_repo.create(
                upload_id,
                "test-user",
                #bytes,
                "text/plain",
                "app:uploads",
                path,
                "documents",
                { filename = "source.txt", source = "uploads.test" },
                "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local result, call_err = funcs.new():call("kickside.uploads.documents:processor", {
                upload_id = upload_id,
                storage_id = "app:uploads",
                storage_path = path,
                mime_type = "text/plain",
                size = #bytes,
                metadata = { filename = "source.txt", source = "uploads.test" },
                options = { extract_images = false },
            })
            test.is_nil(call_err)
            test.is_true(result.success, "document processor failed")
            test.not_nil(result.metadata.source_artifact_id)
            test.not_nil(result.metadata.markdown_artifact_id)
            test.eq(result.metadata.markdown_artifact_id, result.metadata.primary_artifact_id)
            test.eq(2, result.metadata.artifact_count)

            local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
            test.is_nil(primary_err)
            test.not_nil(primary)
            test.eq("text/markdown", primary.mime_type)
            test.contains(primary.content or "", "Hello from document wrapper")

            local artifacts, artifacts_err = artifact_parts_repo.list_artifacts(upload_id)
            test.is_nil(artifacts_err)
            test.eq(2, #artifacts)
            test.eq("source", artifacts[1].role)
            test.eq("primary", artifacts[2].role)
            test.eq(artifacts[1].artifact_id, artifacts[2].parent_artifact_id)
        end)

        test.it("deduplicates artifact bytes while preserving aliases", function()
            local upload_id = "artifact-dedupe-" .. uuid_v4()
            local bytes = "same image bytes"
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                "test-user",
                #bytes,
                "image/png",
                "app:uploads",
                upload_id .. ".png",
                "images",
                { filename = "source.png" },
                "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local first, first_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "image-a.png",
                ordinal = 1,
                content = bytes,
                storage_id = "app:uploads",
                metadata = { alias = "a" },
            })
            test.is_nil(first_err)
            test.not_nil(first)

            local second, second_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "image-b.png",
                ordinal = 2,
                content = bytes,
                storage_id = "app:uploads",
                metadata = { alias = "b" },
            })
            test.is_nil(second_err)
            test.not_nil(second)
            test.eq(first.blob_id, second.blob_id)
            test.eq(first.checksum, second.checksum)

            local third, third_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "image-c.png",
                ordinal = 3,
                content = bytes,
                storage_id = "app:other_uploads",
                metadata = { alias = "c" },
            })
            test.is_nil(third_err)
            test.not_nil(third)
            test.eq(first.checksum, third.checksum)
            if first.blob_id == third.blob_id then
                error("artifact blob dedupe must be scoped by storage")
            end

            local blob_content, blob_read_err, blob = artifact_content_repo.read_blob(first.blob_id)
            test.is_nil(blob_read_err)
            test.eq(bytes, blob_content)
            test.not_nil(blob)
            test.eq("app:uploads", blob.storage_id)
            test.not_nil(blob.storage_path)

            local artifacts, artifacts_err = artifact_parts_repo.list_artifacts(upload_id)
            test.is_nil(artifacts_err)
            test.eq(#artifacts, 3)
            test.eq("image-a.png", artifacts[1].label)
            test.eq("image-b.png", artifacts[2].label)
            test.eq("image-c.png", artifacts[3].label)
            test.eq("app:uploads", artifacts[1].storage_id)
            test.eq("app:other_uploads", artifacts[3].storage_id)

            local loaded, loaded_err = artifact_content_repo.get_artifact(upload_id, first.artifact_id)
            test.is_nil(loaded_err)
            test.not_nil(loaded)
            test.eq(first.artifact_id, loaded.artifact_id)

            local wrong, wrong_err = artifact_content_repo.get_artifact("other-upload", first.artifact_id)
            test.is_nil(wrong)
            test.is_true(errors.is(wrong_err, errors.NOT_FOUND))

            local chunk, chunk_err = artifact_parts_repo.create_chunk({
                upload_id = upload_id,
                artifact_id = first.artifact_id,
                kind = "text",
                content = "chunk content",
                ordinal = 1,
                token_count = 2,
                locator = { type = "document.chunk", page = 1 },
            })
            test.is_nil(chunk_err)
            test.not_nil(chunk)

            local summaries, summaries_err = artifact_parts_repo.list_chunk_summaries(upload_id)
            test.is_nil(summaries_err)
            test.eq(1, #summaries)
            test.eq(first.artifact_id, summaries[1].artifact_id)
            test.eq(13, tonumber(summaries[1].content_length))
            test.eq(nil, summaries[1].content)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
