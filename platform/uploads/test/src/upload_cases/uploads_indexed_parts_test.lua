local test = require("test")
local registry = require("registry")
local funcs = require("funcs")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local security = require("security")
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
    ensure_uploads_component(user_id)
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
    ensure_uploads_component(user_id)
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
        test.it("reads a relocated raw image through content and file views when the primary artifact has no blob", function()
            ensure_uploads_component("test-user")
            local upload_id = uuid_v4()
            local path = upload_id .. ".webp"
            local relocated_path = "fs://app:other_uploads/" .. path
            local bytes = "RIFF\0\0\0\0WEBPVP8 " .. string.rep("x", 69450)
            local original = assert(fs.get("app:other_uploads"))
            local written, write_err = original:writefile(path, bytes)
            test.is_nil(write_err)
            test.is_true(written)
            local upload, upload_err = upload_record_repo.create(upload_id, "test-user", #bytes,
                "image/webp", "app:uploads", path, "images", { filename = "original.webp" }, "completed")
            test.is_nil(upload_err)
            test.not_nil(upload)
            local _, relocation_err = upload_record_repo.update_storage(upload_id, "app:uploads", relocated_path)
            test.is_nil(relocation_err)
            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = upload_id, kind = "image", role = "primary", mime_type = "image/webp",
                label = "original.webp", locator = {
                    type = "upload.original", storage_id = "app:uploads", storage_path = relocated_path,
                },
            })
            test.is_nil(artifact_err)
            test.is_nil(artifact.blob_id)
            local result, err = executor("test-user"):with_context({ upload_id = upload_id }):call(
                "kickside.uploads.binding:get_content_func", { format = "base64" })
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
            test.eq(result.content, bytes)
            test.eq(result.size, #bytes)
            test.eq(result.content_type, "image/webp")

            local files, files_err = executor("test-user"):call("kickside.uploads.traits:view_files", {
                upload_ids = { upload_id },
            })
            test.is_nil(files_err)
            test.eq("original.webp", files.files[1].filename)
            test.is_true(files.files[1].image_attached)
            test.eq(1, #files._images)
            local decoded, decode_err = base64.decode(files._images[1].source.data)
            test.is_nil(decode_err)
            test.eq(bytes, decoded)
        end)

        test.it("paginates artifact parts after dedupe and filters derived images", function()
            local upload_id = "artifact-parts-page-" .. uuid_v4()
            local upload, upload_err = upload_record_repo.create(
                upload_id,
                "test-user",
                100,
                "application/pdf",
                "app:uploads",
                upload_id .. ".pdf",
                "documents",
                { filename = "source.pdf" },
                "completed"
            )
            test.is_nil(upload_err)
            test.not_nil(upload)

            local specs = {
                { label = "source.pdf", kind = "binary", role = "source", mime_type = "application/pdf", content = "source", ordinal = 0 },
                { label = "source.md", kind = "markdown", role = "primary", mime_type = "text/markdown", content = "# source", ordinal = 1 },
                { label = "page1_logo.png", kind = "image", role = "extracted-image", mime_type = "image/png", content = "logo bytes", ordinal = 2 },
                { label = "page2_logo.png", kind = "image", role = "extracted-image", mime_type = "image/png", content = "logo bytes", ordinal = 3 },
                { label = "page3_chart.png", kind = "image", role = "extracted-image", mime_type = "image/png", content = "chart bytes", ordinal = 4 },
                { label = "page3_note.txt", kind = "text", role = "extracted-text", mime_type = "text/plain", content = "note bytes", ordinal = 5 },
            }

            for _, spec in ipairs(specs) do
                local artifact, artifact_err = artifact_content_repo.create_artifact({
                    upload_id = upload_id,
                    kind = spec.kind,
                    role = spec.role,
                    mime_type = spec.mime_type,
                    label = spec.label,
                    ordinal = spec.ordinal,
                    content = spec.content,
                    storage_id = "app:uploads",
                    metadata = { name = spec.label },
                })
                test.is_nil(artifact_err)
                test.not_nil(artifact)
            end

            local all_occurrences, all_occurrences_err = artifact_parts_repo.count_artifact_parts(upload_id, {
                include_duplicates = true,
            })
            test.is_nil(all_occurrences_err)
            test.eq(4, all_occurrences)

            local all_unique, all_unique_err = artifact_parts_repo.count_artifact_parts(upload_id)
            test.is_nil(all_unique_err)
            test.eq(3, all_unique)

            local image_unique, image_unique_err = artifact_parts_repo.count_artifact_parts(upload_id, {
                images_only = true,
            })
            test.is_nil(image_unique_err)
            test.eq(2, image_unique)

            local second_image_page, second_image_page_err = artifact_parts_repo.list_artifact_parts(upload_id, 1, 1, {
                images_only = true,
            })
            test.is_nil(second_image_page_err)
            test.eq(1, #second_image_page)
            test.eq("page3_chart.png", second_image_page[1].label)

            local image_occurrences, image_occurrences_err = artifact_parts_repo.list_artifact_parts(upload_id, 10, 0, {
                images_only = true,
                include_duplicates = true,
            })
            test.is_nil(image_occurrences_err)
            test.eq(3, #image_occurrences)
            test.eq("page1_logo.png", image_occurrences[1].label)
            test.eq("page2_logo.png", image_occurrences[2].label)
            test.eq("page3_chart.png", image_occurrences[3].label)
        end)

        test.it("ListFiles and CountFiles return upload records and counts", function()
            local user_id = "list-files-" .. uuid_v4()
            local first_id = "list-files-a-" .. uuid_v4()
            local second_id = "list-files-b-" .. uuid_v4()
            create_completed_upload(first_id, user_id, "text/plain", "first.txt", 10)
            create_completed_upload(second_id, user_id, "text/plain", "second.txt", 20)

            local counted, count_err = executor(user_id):call("kickside.uploads.traits:count_files", {})
            test.is_nil(count_err)
            test.is_true(counted.success)
            test.eq(counted.count, 2)

            local first, first_err = executor(user_id):call("kickside.uploads.traits:list_files", { limit = 1 })
            test.is_nil(first_err)
            test.is_true(first.success)
            test.eq(first.count, 1)
            test.is_true(first.has_more)
            test.eq(first.next_after_file_id, first.files[1].id)
            test.is_nil(first.files[1].metadata, "list rows must not expose arbitrary upload metadata")
            local second, second_err = executor(user_id):call("kickside.uploads.traits:list_files", {
                limit = 1, after_file_id = first.next_after_file_id,
            })
            test.is_nil(second_err)
            test.eq(second.count, 1)
            test.is_false(second.has_more)
            test.is_nil(second.next_after_file_id)
            local names = { [first.files[1].filename] = true, [second.files[1].filename] = true }
            test.is_true(names["first.txt"])
            test.is_true(names["second.txt"])
        end)

        for _, column in ipairs({ "created_at", "size" }) do
            for _, direction in ipairs({ "asc", "desc" }) do
                test.it("ListFiles pages by " .. column .. " " .. direction .. " with tied values", function()
                    local prefix = "ordered-files-" .. uuid_v4()
                    local user_id = prefix .. "-user"
                    local ids = { prefix .. "-a", prefix .. "-b", prefix .. "-c", prefix .. "-d" }
                    local values = { 20, 30, 10, 20 }
                    local db, db_err = sql.get("app:db")
                    test.is_nil(db_err)
                    for index, id in ipairs(ids) do
                        create_completed_upload(id, user_id, "text/plain", tostring(index) .. ".txt", values[index])
                        local _, update_err = db:execute("UPDATE kickside_uploads SET created_at=$1 WHERE uuid=$2",
                            { "2026-01-01T00:00:" .. tostring(values[index]) .. "Z", id })
                        test.is_nil(update_err)
                    end
                    db:release()
                    local expected = direction == "asc" and { ids[3], ids[1], ids[4], ids[2] }
                        or { ids[2], ids[1], ids[4], ids[3] }
                    local after_id = nil
                    for index, id in ipairs(expected) do
                        local page, page_err = executor(user_id):call("kickside.uploads.traits:list_files", {
                            limit = 1, sort = column, sort_order = direction, after_file_id = after_id,
                        })
                        test.is_nil(page_err)
                        test.eq(page.count, 1, "page " .. tostring(index))
                        test.eq(page.files[1].id, id)
                        test.eq(page.has_more, index < #expected)
                        after_id = page.next_after_file_id
                    end
                end)
            end
        end

        test.it("ListFiles refuses missing and other-account cursors without exposing files", function()
            local prefix = "scoped-files-" .. uuid_v4()
            create_completed_upload(prefix .. "-a", prefix .. "-owner", "text/plain", "owned.txt", 1)
            create_completed_upload(prefix .. "-b", prefix .. "-other", "text/plain", "other.txt", 2)
            for _, cursor in ipairs({ prefix .. "-missing", prefix .. "-b" }) do
                local page, page_err = executor(prefix .. "-owner"):call("kickside.uploads.traits:list_files", {
                    limit = 1, after_file_id = cursor,
                })
                test.is_nil(page_err)
                test.eq(page.count, 0)
                test.is_false(page.has_more)
                test.is_nil(page.next_after_file_id)
            end
        end)

        test.it("unrestricted upload queries keep pagination across accounts and retain filters", function()
            local prefix = "admin-files-" .. uuid_v4()
            local mime = "application/x-" .. prefix
            create_completed_upload(prefix .. "-a", prefix .. "-one", mime, "large.txt", 20)
            create_completed_upload(prefix .. "-b", prefix .. "-two", mime, "small.txt", 10)
            local first, first_err = upload_query_repo.list_with_filters({
                limit = 1, sort = "size", filters = { content_types = { mime } },
            })
            test.is_nil(first_err)
            test.eq(#first, 1)
            test.eq(first[1].uuid, prefix .. "-a")
            local second, second_err = upload_query_repo.list_with_filters({
                limit = 1, sort = "size", after_id = first[1].uuid, filters = { content_types = { mime } },
            })
            test.is_nil(second_err)
            test.eq(#second, 1)
            test.eq(second[1].uuid, prefix .. "-b")
        end)

        test.it("ViewFiles returns the whole text content of a long document", function()
            local upload_id = "view-whole-" .. uuid_v4()
            local content = string.rep("A", 40000) .. "TAIL"
            create_completed_upload(upload_id, "test-user", "application/pdf", "large.pdf", #content)

            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "markdown",
                role = "primary",
                mime_type = "text/markdown",
                label = "large.md",
                ordinal = 1,
                content = content,
                storage_id = "app:uploads",
                metadata = { filename = "large.pdf" },
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)

            local result, call_err = executor("test-user"):call("kickside.uploads.traits:view_files", {
                upload_ids = { upload_id },
            })
            test.is_nil(call_err)
            local first = result.files[1]
            test.eq(first.total_size, 40004)
            test.eq(first.content, content)
            test.is_nil(first.next_offset)
            test.is_nil(first.content_omitted)
        end)

        test.it("ViewFiles keeps document artifact lists small by default", function()
            local upload_id = "view-artifact-page-" .. uuid_v4()
            create_completed_upload(upload_id, "test-user", "application/pdf", "images.pdf", 100)

            local primary, primary_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "markdown",
                role = "primary",
                mime_type = "text/markdown",
                label = "images.md",
                ordinal = 1,
                content = "# Images",
                storage_id = "app:uploads",
                metadata = { filename = "images.pdf" },
            })
            test.is_nil(primary_err)
            test.not_nil(primary)

            for i = 1, 25 do
                local artifact, artifact_err = artifact_content_repo.create_artifact({
                    upload_id = upload_id,
                    kind = "image",
                    role = "extracted-image",
                    mime_type = "image/png",
                    label = "page" .. tostring(i) .. "_Im1.png",
                    ordinal = 100 + i,
                    content = "image-" .. tostring(i),
                    storage_id = "app:uploads",
                    metadata = { name = "page" .. tostring(i) .. "_Im1.png" },
                })
                test.is_nil(artifact_err)
                test.not_nil(artifact)
            end

            local result, call_err = executor("test-user"):call("kickside.uploads.traits:view_files", {
                upload_ids = { upload_id },
            })
            test.is_nil(call_err)
            local file = result.files[1]
            test.eq(#file.image_artifacts, 20)
            test.eq(file.artifact_parts_total, 25)
            test.eq(file.image_artifacts[1].filename, "page1_Im1.png")
            test.eq(file.image_artifacts[20].filename, "page20_Im1.png")
        end)

        test.it("ViewFiles inlines a large image artifact whole", function()
            local upload_id = "view-image-whole-" .. uuid_v4()
            create_completed_upload(upload_id, "test-user", "application/pdf", "large-image.pdf", 100)

            local large_image = string.rep("x", 1024 * 1024 + 1)
            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = upload_id,
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "page1_large.png",
                ordinal = 1,
                content = large_image,
                storage_id = "app:uploads",
                metadata = { name = "page1_large.png" },
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)

            local result, call_err = executor("test-user"):call("kickside.uploads.traits:view_files", {
                artifact_refs = {
                    { upload_id = upload_id, artifact_id = artifact.artifact_id },
                },
            })
            test.is_nil(call_err)
            test.eq(result.files[1].filename, "page1_large.png")
            test.is_true(result.files[1].image_attached)
            test.is_nil(result.files[1].image_omitted)
            test.eq(#result._images, 1)
            test.eq(base64.decode(result._images[1].source.data), large_image)
        end)

        test.it("ViewFiles returns raw image uploads as structured images through the content provider", function()
            local upload_id = "view-raw-image-" .. uuid_v4()
            local png = "\137PNG\r\n\26\nraw-image-bytes-" .. upload_id
            create_completed_upload_with_bytes(upload_id, "test-user", "image/png", "raw.png", png, "images")

            local result, call_err = executor("test-user"):call("kickside.uploads.traits:view_files", {
                upload_ids = { upload_id },
            })
            test.is_nil(call_err)

            local decoded = result
            test.eq(decoded.files[1].filename, "raw.png")
            test.is_true(decoded.files[1].image_attached)
            test.is_nil(decoded.files[1].content)
            test.eq(type(decoded._images), "table")
            test.eq(1, #decoded._images)
            test.eq("image", decoded._images[1].type)
            test.eq("base64", decoded._images[1].source.type)
            test.eq("image/png", decoded._images[1].source.mime_type)
            test.is_true(type(decoded._images[1].source.data) == "string" and decoded._images[1].source.data ~= "")
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
