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
        test.it("rejects malformed explicit upload trace_context", function()
            local user_id = "trace-invalid-user-" .. uuid_v4()
            local bytes = "invalid trace upload " .. uuid_v4()

            local upload, upload_err = upload_as(
                user_id,
                bytes,
                "invalid-trace.txt",
                #bytes,
                "text/plain",
                "app:uploads",
                client_metadata("invalid-trace.txt", { source = "uploads.test", trace_context = "bad" })
            )

            test.is_nil(upload)
            test.eq(tostring(upload_err), "trace_context must be an object")
        end)

        test.it("ignores malformed upload tokens instead of inventing trace", function()
            local user_id = "trace-bad-token-user-" .. uuid_v4()
            local bytes = "bad token trace upload " .. uuid_v4()

            local upload, upload_err = upload_as(
                user_id,
                bytes,
                "bad-token-trace.txt",
                #bytes,
                "text/plain",
                "app:uploads",
                client_metadata("bad-token-trace.txt", { source = "uploads.test", __upload_token = "not-a-packed-token" })
            )

            test.is_nil(upload_err)
            test.not_nil(upload)
            test.is_nil(upload.trace_context)
            test.is_nil(upload.metadata.trace_context)
        end)

        test.it("attaches a later duplicate upload trace to the canonical row", function()
            local user_id = "trace-dedup-user-" .. uuid_v4()
            local bytes = "dedup trace upload " .. uuid_v4()
            local trace_context = {
                trace_id = "trace-" .. uuid_v4(),
                run_id = "run-" .. uuid_v4(),
                correlation_key = "upload:dedup:" .. uuid_v4(),
            }

            local first, first_err = upload_as(
                user_id,
                bytes,
                "dedup-first.txt",
                #bytes,
                "text/plain",
                "app:uploads",
                client_metadata("dedup-first.txt", { source = "uploads.test" })
            )
            test.is_nil(first_err)
            test.not_nil(first)
            test.is_nil(first.trace_context)

            local second, second_err = upload_as(
                user_id,
                bytes,
                "dedup-second.txt",
                #bytes,
                "text/plain",
                "app:uploads",
                client_metadata("dedup-second.txt", { source = "uploads.test", trace_context = trace_context })
            )
            test.is_nil(second_err)
            test.not_nil(second)
            test.is_true(second.deduped)
            test.eq(first.uuid, second.uuid)
            test.eq(trace_context.trace_id, second.trace_context.trace_id)

            local stored, stored_err = upload_query_repo.get(first.uuid)
            test.is_nil(stored_err)
            test.eq(trace_context.trace_id, stored.trace_context.trace_id)
            test.eq(trace_context.run_id, stored.trace_context.run_id)
            test.eq(trace_context.correlation_key, stored.trace_context.correlation_key)
        end)

        test.it("ingests a duplicate zip member once", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local user_id = "dedup-zip-user-" .. uuid_v4()
            local member_bytes = "duplicate member " .. uuid_v4()
            local zip = build_zip({
                { name = "a/dup.txt", data = member_bytes, method = 0 },
                { name = "b/dup.txt", data = member_bytes, method = 8 },
            })

            local upload_id = "dedup-zip-" .. uuid_v4()
            local zip_path = upload_id .. ".zip"
            local trace_context = {
                trace_id = "trace-" .. uuid_v4(),
                run_id = "run-" .. uuid_v4(),
                correlation_key = "archive:test:" .. uuid_v4(),
            }
            local write_ok, write_err = storage:writefile(zip_path, zip)
            test.is_nil(write_err)
            test.is_true(write_ok ~= false)

            local container, container_err = upload_record_repo.create(
                upload_id,
                user_id,
                #zip,
                "application/zip",
                "app:uploads",
                zip_path,
                "archive",
                metadata_with_identity(user_id, "batch.zip", { __upload_token = "kb-upload-token" }),
                "uploaded"
            )
            upload_record_repo.update_trace_context(upload_id, trace_context)
            test.is_nil(container_err)
            test.not_nil(container)
            container.trace_context = trace_context

            local result, call_err = executor(user_id):call("kickside.uploads.archive:processor", {
                upload_id = upload_id,
                storage_id = "app:uploads",
                storage_path = zip_path,
                size = #zip,
                metadata = metadata_with_identity(user_id, "batch.zip", { __upload_token = "kb-upload-token" }),
                trace_context = trace_context,
            })
            test.is_nil(call_err)
            test.is_true(result.success, "archive processor failed")
            test.eq("", result.metadata.__upload_token)
            test.eq("table", type(result.metadata.__upload_tokens))
            test.eq(0, #result.metadata.__upload_tokens)

            -- Both members provenance-link to a single deduplicated upload record.
            local child_ids = result.metadata.child_upload_ids or {}
            test.eq(2, #child_ids)
            test.eq(child_ids[1], child_ids[2])

            local member_upload, member_err = upload_query_repo.get(child_ids[1])
            test.is_nil(member_err)
            test.not_nil(member_upload)
            test.not_nil(member_upload.content_sha256)
            test.eq("kb-upload-token", member_upload.metadata.__upload_token)
            test.eq(trace_context.trace_id, member_upload.trace_context.trace_id)
            test.eq(trace_context.run_id, member_upload.trace_context.run_id)
            test.eq(trace_context.correlation_key, member_upload.trace_context.correlation_key)
            test.eq("a/dup.txt", member_upload.metadata.archive_path)

            local matched = upload_query_repo.find_by_content_hash(user_id, member_upload.content_sha256)
            test.not_nil(matched)
            test.eq(child_ids[1], matched.uuid)
        end)

        test.it("rebinds a trusted archive callback token to its extracted upload", function()
            local user_id = "archive-token-" .. uuid_v4()
            local upload_id = uuid_v4()
            local zip = build_zip({ { name = "member.txt", data = "member", method = 0 } })
            local storage = fs.get("app:uploads")
            local path = upload_id .. ".zip"
            local written, write_err = storage:writefile(path, zip)
            test.is_nil(write_err)
            test.is_true(written ~= false)
            local identity = upload_metadata(user_id, "container.zip")[IDENTITY_META_KEY]
            local token, token_err = upload_tokens.pack({ upload_id = upload_id,
                function_id = "app:callback_probe", actor_id = identity.actor_id,
                actor_context = identity.actor_context })
            test.is_nil(token_err)
            local metadata = metadata_with_identity(user_id, "container.zip", { __upload_token = token })
            local container, create_err = upload_record_repo.create(upload_id, user_id, #zip, "application/zip",
                "app:uploads", path, "archive", metadata, "uploaded")
            test.is_nil(create_err)
            test.not_nil(container)
            local result, call_err = executor(user_id):call("kickside.uploads.archive:processor", {
                upload_id = upload_id, storage_id = "app:uploads", storage_path = path,
                size = #zip, metadata = metadata,
            })
            test.is_nil(call_err)
            test.is_true(result.success)
            test.eq(result.metadata.archive_skipped_count, 0, json.encode(result.metadata.archive_skipped_entries))
            test.eq(#result.metadata.child_upload_ids, 1)
            local child_id = result.metadata.child_upload_ids[1]
            test.is_true(child_id ~= upload_id)
            local child, child_err = upload_query_repo.get(child_id)
            test.is_nil(child_err)
            local rebound, rebound_err = upload_tokens.unpack(child.metadata.__upload_token)
            test.is_nil(rebound_err)
            test.eq(rebound.upload_id, child_id)
            test.eq(rebound.actor_id, user_id)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
