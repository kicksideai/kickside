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
        test.it("routes a binary Word template despite a guessed Graphviz content type", function()
            local user_id = "word-template-" .. uuid_v4()
            local bytes = string.char(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1) .. "Northwind template"
            local upload, err = upload_as(user_id, bytes, "Northwind.DOT", #bytes, "text/vnd.graphviz", "app:uploads", client_metadata("Northwind.DOT", {}))
            test.is_nil(err)
            test.eq(upload.type_id, "kickside.uploads.documents:types.documents")
            test.eq(upload.mime_type, "application/msword")
        end)
        test.it("keeps identical archive members separate from an earlier standalone upload", function()
            local user_id = "zip-provenance-" .. uuid_v4()
            local bytes = "Northwind warehouse marker NW-AI-731"
            local original, original_err = upload_as(user_id, bytes, "handbook.txt", #bytes, "text/plain", "app:uploads", client_metadata("handbook.txt", {}))
            test.is_nil(original_err)
            local zip = build_zip({ { name = "Northwind/handbook.txt", data = bytes } })
            local upload_id = uuid_v4()
            local storage = fs.get("app:uploads")
            local zip_path = upload_id .. ".zip"
            local _, write_err = storage:writefile(zip_path, zip)
            test.is_nil(write_err)
            local _, create_err = upload_record_repo.create(upload_id, user_id, #zip, "application/zip", "app:uploads", zip_path, "archive", metadata_with_identity(user_id, "Northwind.zip", {}), "uploaded")
            test.is_nil(create_err)
            local result, call_err = executor(user_id):call("kickside.uploads.archive:processor", {
                upload_id = upload_id, storage_id = "app:uploads", storage_path = zip_path, size = #zip,
                metadata = metadata_with_identity(user_id, "Northwind.zip", {}),
            })
            test.is_nil(call_err)
            test.eq(result.metadata.archive_member_count, 1)
            local child_id = result.metadata.child_upload_ids[1]
            test.is_true(child_id ~= original.uuid)
            local child, get_err = upload_query_repo.get(child_id)
            test.is_nil(get_err)
            test.eq(child.metadata.parent_upload_id, upload_id)
            test.eq(child.metadata.archive_path, "Northwind/handbook.txt")
            local prior, prior_err = upload_query_repo.get(original.uuid)
            test.is_nil(prior_err)
            test.is_nil(prior.metadata.parent_upload_id)
        end)
        test.it("records durable archive skip details for unsafe members", function()
            local storage = fs.get("app:uploads")
            test.not_nil(storage)

            local user_id = "skip-zip-user-" .. uuid_v4()
            local zip = build_zip({
                { name = "ok.txt", data = "hello", method = 0 },
                { name = "../evil.txt", data = "not safe", method = 0 },
            })

            local upload_id = "skip-zip-" .. uuid_v4()
            local zip_path = upload_id .. ".zip"
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
                metadata_with_identity(user_id, "skip.zip", {}),
                "uploaded"
            )
            test.is_nil(container_err)
            test.not_nil(container)

            local result, call_err = executor(user_id):call("kickside.uploads.archive:processor", {
                upload_id = upload_id,
                storage_id = "app:uploads",
                storage_path = zip_path,
                size = #zip,
                metadata = metadata_with_identity(user_id, "skip.zip", {}),
            })
            test.is_nil(call_err)
            test.is_true(result.success, "archive processor failed")
            test.eq(1, tonumber(result.metadata.archive_skipped_count))
            test.eq("table", type(result.metadata.archive_skipped_entries))
            test.eq(1, #result.metadata.archive_skipped_entries)
            test.eq("../evil.txt", result.metadata.archive_skipped_entries[1].name)
            test.eq("unsafe_path", result.metadata.archive_skipped_entries[1].reason)
            test.is_false(result.metadata.archive_skipped_entries_truncated)
        end)

        test.it("prepares all safe archive members before admitting their uploads", function()
            local user_id = "archive-prepare-" .. uuid_v4()
            local files = { { name = "../unsafe.txt", data = "unsafe" } }
            for member = 1, 8 do
                files[#files + 1] = { name = "nested/member-" .. member .. ".txt", data = "member " .. member }
            end
            local zip = build_zip(files)
            local upload_id = uuid_v4()
            local zip_path = upload_id .. ".zip"
            local _, write_err = fs.get("app:uploads"):writefile(zip_path, zip)
            test.is_nil(write_err)
            local metadata = metadata_with_identity(user_id, "bundle.zip", {})
            local _, create_err = upload_record_repo.create(upload_id, user_id, #zip, "application/zip",
                "app:uploads", zip_path, "archive", metadata, "uploaded")
            test.is_nil(create_err)
            local result, call_err = executor(user_id):call("kickside.uploads.archive:processor", {
                upload_id = upload_id, storage_id = "app:uploads", storage_path = zip_path, size = #zip,
                metadata = metadata,
            })
            test.is_nil(call_err)
            test.eq(result.metadata.archive_member_count, 8)
            for member, child_id in ipairs(result.metadata.child_upload_ids) do
                local child, get_err = upload_query_repo.get(child_id)
                test.is_nil(get_err)
                test.eq(child.metadata.archive_prepare_path, "nested/member-" .. member .. ".txt")
                test.eq(child.metadata.archive_prepare_upload_id, upload_id)
                test.eq(child.metadata.archive_prepare_count, 8)
            end
        end)

        test.it("refuses archive dispatch when member preparation fails", function()
            local user_id = "archive-prepare-failure-" .. uuid_v4()
            local zip = build_zip({ { name = "member.txt", data = "member" } })
            local upload_id = uuid_v4()
            local zip_path = upload_id .. ".zip"
            local _, write_err = fs.get("app:uploads"):writefile(zip_path, zip)
            test.is_nil(write_err)
            local metadata = metadata_with_identity(user_id, "bundle.zip", { archive_prepare_error = true })
            local _, create_err = upload_record_repo.create(upload_id, user_id, #zip, "application/zip",
                "app:uploads", zip_path, "archive", metadata, "uploaded")
            test.is_nil(create_err)
            local result, call_err = executor(user_id):call("kickside.uploads.archive:processor", {
                upload_id = upload_id, storage_id = "app:uploads", storage_path = zip_path, size = #zip,
                metadata = metadata,
            })
            test.is_nil(result)
            test.not_nil(call_err)
            test.contains(tostring(call_err), "archive preparation unavailable")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error("archive regression database unavailable") end
            local rows, query_err = db:query("SELECT COUNT(*) AS count FROM kickside_uploads WHERE actor_id = $1", { user_id })
            db:release()
            test.is_nil(query_err)
            test.eq(tonumber(rows[1].count), 1)
        end)

        test.it("does not deduplicate identical bytes across different accounts", function()
            local bytes = "cross-account content " .. uuid_v4()
            local user_a = "dedup-iso-a-" .. uuid_v4()
            local user_b = "dedup-iso-b-" .. uuid_v4()

            local a, a_err = upload_as(user_a, bytes, "a.txt", #bytes, "text/plain", "app:uploads", client_metadata("a.txt", { source = "uploads.test" }))
            test.is_nil(a_err)
            test.not_nil(a)
            test.is_nil(a.deduped)

            local b, b_err = upload_as(user_b, bytes, "b.txt", #bytes, "text/plain", "app:uploads", client_metadata("b.txt", { source = "uploads.test" }))
            test.is_nil(b_err)
            test.not_nil(b)
            -- Per-account isolation: a second account stores its own record.
            test.is_nil(b.deduped)
            test.eq(a.content_sha256, b.content_sha256)
            if a.uuid == b.uuid then
                error("content dedup leaked across accounts")
            end
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
