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
        test.it("retains one upload per bound callback token even for identical bytes", function()
            local owner = "bound-dedup-" .. uuid_v4()
            local identity = upload_metadata(owner, "bound.txt")[IDENTITY_META_KEY]
            local ids = { uuid_v4(), uuid_v4() }
            for _, upload_id in ipairs(ids) do
                local token, token_err = upload_tokens.pack({ upload_id = upload_id,
                    function_id = "app:callback_probe", actor_id = identity.actor_id,
                    actor_context = identity.actor_context })
                test.is_nil(token_err)
                local upload, upload_err = upload_as(owner, "same bytes", "bound.txt", 10,
                    "text/plain", "app:uploads", { __upload_token = token })
                test.is_nil(upload_err)
                test.eq(upload.uuid, upload_id)
                test.is_nil(upload.deduped)
            end
            local first, first_err = upload_query_repo.get(ids[1])
            local second, second_err = upload_query_repo.get(ids[2])
            test.is_nil(first_err)
            test.is_nil(second_err)
            test.not_nil(first)
            test.not_nil(second)
        end)

        test.it("reports missing callback function and upload as typed failures", function()
            local owner = "callback-missing-" .. uuid_v4()
            local upload_id = uuid_v4()
            local identity = upload_metadata(owner, "callback.txt")[IDENTITY_META_KEY]
            local token, token_err = upload_tokens.pack({ upload_id = upload_id,
                function_id = "app:callback_probe", actor_id = identity.actor_id,
                actor_context = identity.actor_context })
            test.is_nil(token_err)
            local missing, missing_err = callback_job.run({ payload = {
                upload_id = upload_id, token = token, success = true } })
            test.is_nil(missing)
            test.eq(missing_err:kind(), errors.NOT_FOUND)
            local upload, create_err = upload_record_repo.create(upload_id, owner, 1, "text/plain",
                "app:uploads", upload_id .. ".txt", "text", upload_metadata(owner, "callback.txt"), "uploaded")
            test.is_nil(create_err)
            test.not_nil(upload)
            local skipped, skip_err = callback_job.run({ payload = {
                upload_id = upload_id, token = token, success = false } })
            test.is_nil(skipped)
            test.eq(skip_err:kind(), errors.INVALID)
        end)

        test.it("keeps invalid callback admissions visible instead of skipping enqueue", function()
            local upload = { uuid = uuid_v4(), actor_id = "callback-invalid-owner",
                metadata = { __upload_token = "not-a-callback-token" } }
            local queued, err = pipeline_lib.invoke_upload_token(upload, true, nil)
            test.is_false(queued)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("lists and counts only declared upload types across search and paging", function()
            local actor = "declared-types-" .. uuid_v4()
            ensure_uploads_component(actor)
            local upload_id = "declared-" .. uuid_v4()
            local row, create_err = upload_record_repo.create(upload_id, actor, 17, "text/plain",
                "app:uploads", upload_id .. ".txt", "kickside.uploads:types.text",
                { filename = "visible-notes.txt" }, "uploaded")
            test.is_nil(create_err)
            test.not_nil(row)
            local hidden, hidden_err = upload_record_repo.create("foreign-" .. uuid_v4(), actor, 1,
                "application/x-foreign", "app:uploads", "foreign-container", "foreign.artifacts:container",
                { filename = "hidden-notes.txt" }, "uploaded")
            test.is_nil(hidden_err)
            test.not_nil(hidden)
            for _, filter in ipairs({ {}, { q = "notes" } }) do
                local rows, list_err = upload_read_model.list_for_actor(actor, 1, 0, filter)
                test.is_nil(list_err)
                test.eq(1, #rows)
                test.eq(upload_id, rows[1].uuid)
                local count, count_err = upload_read_model.count_for_actor(actor, filter)
                test.is_nil(count_err)
                test.eq(1, count)
                local page, page_err = upload_read_model.list_for_actor(actor, 1, 1, filter)
                test.is_nil(page_err)
                test.eq(0, #page)
            end
        end)

        test.it("materializes upload lifecycle events into one read model", function()
            local user_id = "user-read-model-" .. uuid_v4()
            local upload_id = "read-model-" .. uuid_v4()
            local component_id = upload_types.component_id_for_owner(user_id)
            test.not_nil(component_id)
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                user_id,
                17,
                "text/plain",
                "app:uploads",
                upload_id .. ".txt",
                "kickside.uploads:types.text",
                { filename = "read-model.txt" },
                "uploaded"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local queued_counts, queued_err = upload_read_model.apply_events(component_id, {
                {
                    id = "evt-queued-" .. uuid_v4(),
                    seq = 1,
                    type = uploads_events.TYPE.QUEUED,
                    created_at = "2026-01-01T00:00:00Z",
                    trace_context = { trace_id = "trace-read-model" },
                    body = {
                        upload_id = upload_id,
                        filename = "read-model.txt",
                        mime_type = "text/plain",
                        type_id = "kickside.uploads:types.text",
                        size = 17,
                    },
                },
            })
            test.is_nil(queued_err)
            test.eq(0, queued_counts.file_count)
            test.eq(1, queued_counts.pending_count)

            local pending_rows, pending_err = upload_read_model.list_for_actor(user_id, 10, 0, { status = "processing" })
            test.is_nil(pending_err)
            test.eq(#pending_rows, 1)
            test.eq(pending_rows[1].uuid, upload_id)
            test.eq(pending_rows[1].status, "processing")
            test.eq(pending_rows[1].storage_state, "uploaded")

            local completed_counts, completed_err = upload_read_model.apply_events(component_id, {
                {
                    id = "evt-completed-" .. uuid_v4(),
                    seq = 2,
                    type = uploads_events.TYPE.COMPLETED,
                    created_at = "2026-01-01T00:01:00Z",
                    body = {
                        upload_id = upload_id,
                        filename = "read-model.txt",
                        mime_type = "text/plain",
                        type_id = "kickside.uploads:types.text",
                        size = 17,
                    },
                },
            })
            test.is_nil(completed_err)
            test.eq(1, completed_counts.file_count)
            test.eq(0, completed_counts.pending_count)
            test.eq(17, completed_counts.total_bytes)
            test.eq(upload_id, completed_counts.last_upload_id)

            local row, get_err = upload_read_model.get_for_actor(user_id, upload_id)
            test.is_nil(get_err)
            test.eq(row.status, "completed")
            test.eq(row.storage_state, "uploaded")
            test.eq(row.error, nil)

            local _, stale_err = upload_read_model.apply_events(component_id, {
                {
                    id = "evt-stale-" .. uuid_v4(),
                    seq = 1,
                    type = uploads_events.TYPE.FAILED,
                    created_at = "2026-01-01T00:02:00Z",
                    body = {
                        upload_id = upload_id,
                        error = "must not win",
                    },
                },
            })
            test.is_nil(stale_err)
            row, get_err = upload_read_model.get_for_actor(user_id, upload_id)
            test.is_nil(get_err)
            test.eq(row.status, "completed")
            test.eq(row.error, nil)

            -- The processing job owns the terminal storage mark at its write point;
            -- readers see the stored state without repair passes.
            local _, mark_err = upload_record_repo.mark_storage_completed(upload_id)
            test.is_nil(mark_err)
            local terminal_row, terminal_err = upload_query_repo.get(upload_id)
            test.is_nil(terminal_err)
            test.eq("completed", terminal_row.storage_state)

            local deleted_counts, deleted_err = upload_read_model.apply_events(component_id, {
                {
                    id = "evt-deleted-" .. uuid_v4(),
                    seq = 3,
                    type = uploads_events.TYPE.DELETED,
                    created_at = "2026-01-01T00:03:00Z",
                    body = { upload_id = upload_id },
                },
            })
            test.is_nil(deleted_err)
            test.eq(0, deleted_counts.file_count)
            test.eq(0, deleted_counts.pending_count)

            local deleted, deleted_get_err = upload_read_model.get_for_actor(user_id, upload_id)
            test.is_nil(deleted)
            test.eq(deleted_get_err, "Upload not found")
            local visible_count, count_err = upload_read_model.count_for_actor(user_id, {})
            test.is_nil(count_err)
            test.eq(0, visible_count)
        end)

        test.it("keeps internal upload metadata out of public responses", function()
            local public = metadata_sanitizer.public({
                filename = "safe.pdf",
                _execution_identity = { actor_id = "u1", actor_context = "{}" },
                __upload_token = "secret",
                __debug = "internal",
                source = "uploads.test",
            })
            test.eq("safe.pdf", public.filename)
            test.eq("uploads.test", public.source)
            test.eq(nil, public._execution_identity)
            test.eq(nil, public.__upload_token)
            test.eq(nil, public.__debug)
        end)

        test.it("keeps storage_state out of public upload API responses", function()
            local upload = {
                uuid = "upload-1",
                size = 17,
                mime_type = "text/plain",
                storage_state = "uploaded",
                status = "completed",
                error = nil,
                created_at = "2026-01-01T00:00:00Z",
                updated_at = "2026-01-01T00:01:00Z",
                metadata = {
                    filename = "safe.txt",
                    description = "A complete document description that belongs on the detail response.",
                    storage_id = "app:uploads",
                    storage_path = "private/safe.txt",
                },
            }

            local listed = upload_response.format_list_upload(upload)
            test.eq("upload-1", listed.uuid)
            test.eq("completed", listed.status)
            test.eq("safe.txt", listed.filename)
            test.is_nil(listed.meta, "list rows must not expose arbitrary upload metadata")
            test.eq(nil, listed.storage_state)

            local fetched = upload_response.format_get_upload(upload)
            test.eq("upload-1", fetched.uuid)
            test.eq("completed", fetched.status)
            test.eq("A complete document description that belongs on the detail response.", fetched.meta.description)
            test.eq(nil, fetched.storage_state)
            test.eq(nil, fetched.meta.storage_id)
            test.eq(nil, fetched.meta.storage_path)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
