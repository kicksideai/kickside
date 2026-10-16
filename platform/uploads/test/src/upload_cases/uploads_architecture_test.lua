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
        test.it("exposes component-owned realtime topics for upload progress", function()
            local component_id = uploads_events.component_id_for_owner("user-1")
            test.not_nil(component_id)
            test.eq(uploads_events.component_topic(component_id), "component." .. tostring(component_id))
            -- Lifecycle milestones drive the canonical component.meta.changed realtime
            -- path; there is no bespoke per-upload status notify topic.
            test.eq(uploads_events.TYPE.QUEUED, "kickside.uploads.events:upload.queued")
            test.eq(uploads_events.TYPE.COMPLETED, "kickside.uploads.events:upload.completed")
            test.eq(uploads_events.TYPE.FAILED, "kickside.uploads.events:upload.failed")
            test.eq(uploads_events.TYPE.DELETED, "kickside.uploads.events:upload.deleted")
            test.is_nil((uploads_events :: any).TYPE.STATUS_CHANGED)
            test.is_nil((uploads_events :: any).event_topic)
            test.is_nil((uploads_events :: any).publish_status)
        end)

        -- doc2md returns extracted images by name + bytes with no mime, so the
        -- processor derives the mime from the name extension; without it the raw
        -- proxy serves application/octet-stream and the browser downloads instead of
        -- rendering the image inline for the user.
        test.it("derives an extracted image's mime from its name so the proxy renders it", function()
            test.eq(processor.image_mime({ name = "image1.jpeg" }), "image/jpeg")
            test.eq(processor.image_mime({ name = "diagram.PNG" }), "image/png")
            test.eq(processor.image_mime({ name = "logo.gif" }), "image/gif")
            -- an explicit mime from the converter always wins over the extension
            test.eq(processor.image_mime({ name = "x.png", mime_type = "image/webp" }), "image/webp")
            -- an unknown/extensionless name falls back to octet-stream
            test.eq(processor.image_mime({ name = "noext" }), "application/octet-stream")
            test.eq(processor.image_mime({ name = "data.bin" }), "application/octet-stream")
        end)

        test.it("publishes its view component and navigation item", function()
            local view = entry("kickside.uploads:uploads_view")
            test.eq(value(view, "kind"), "registry.entry")
            test.eq(meta(view).type, "view.component")
            test.eq(meta(view).tag_name, "kickside-uploads")

            local nav = entry("kickside.uploads:nav_item")
            test.eq(meta(nav).type, "ui.nav_item")
            test.eq(meta(nav).component_tag, "kickside-uploads")

            entry("kickside.uploads.api:artifacts_handler.endpoint")
            entry("kickside.uploads.api:artifact_raw_handler.endpoint")
        end)

        test.it("publishes the consolidated storage settings block", function()
            local block = entry("kickside.uploads:settings.block.storage")
            test.eq(meta(block).type, "kickside.settings:block")
            test.eq(value(block, "key"), "storage")
            test.eq(value(block, "component_tag"), "kickside-settings-storage")
            local claimed: { [string]: boolean } = {}
            for _, ns in ipairs(value(block, "namespaces") or {}) do claimed[ns] = true end
            test.is_true(claimed["kickside.uploads"])
            test.is_true(claimed["kickside.uploads.documents"])
            test.is_true(claimed["kickside.uploads.rasterize"])

            local storage_view = entry("kickside.uploads:settings_storage_view")
            test.eq(meta(storage_view).type, "view.component")
            test.eq(meta(storage_view).tag_name, "kickside-settings-storage")
            test.eq(meta(storage_view).announced, true)

            local blocks = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "kickside.settings:block" }) or {}
            local found = false
            for _, candidate in ipairs(blocks) do
                if value(candidate, "key") == "storage"
                    and value(candidate, "component_tag") == "kickside-settings-storage" then
                    found = true
                end
            end
            test.is_true(found)
        end)

        -- Authorization is declared in the canonical kickside.uploads.security slice,
        -- not the module root: an access-only policy over the upload endpoint
        -- namespaces, wired to the host user group by its user_security_scope
        -- requirement. Enforcement stays at the router boundary (endpoint_firewall);
        -- nothing here calls security.can in handler code.
        test.it("declares a canonical access policy in the security slice", function()
            local policy = entry("kickside.uploads.security:uploads_endpoint_access")
            local decl = value(policy, "policy")
            test.eq(decl.actions, "access")
            test.eq(decl.effect, "allow")

            local resources = {}
            for _, r in ipairs(decl.resources) do resources[r] = true end
            test.is_nil(resources["kickside.uploads.api:*"])
            test.is_nil(resources["kickside.uploads:*"])
            test.is_true(resources["kickside.uploads:ui_static"])
            test.is_true(resources["kickside.uploads:uploads_view"])
            test.is_true(resources["kickside.uploads:settings_storage_view"])
            local shared = entry("kickside.contract.http:user_endpoint_access")
            local admission = value(shared, "policy")
            test.eq(admission.actions, "access")
            local actor = security.new_actor("module-member", {})
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            test.eq(baseline:evaluate(actor, "access", "kickside.core.threads.api:create_thread.endpoint"), "allow")
            test.eq(baseline:evaluate(actor, "access", "kickside.uploads.api:upload_handler.endpoint"), "undefined")
            test.eq(baseline:evaluate(actor, "access", "unrelated.module:read.endpoint"), "undefined")
            local member, member_err = security.policy("kickside.uploads.security:module_access")
            test.is_nil(member_err)
            test.not_nil(member)
            test.eq(member:evaluate(actor, "access", "kickside.uploads.api:upload_handler.endpoint"), "allow")
            test.eq(member:evaluate(actor, "funcs.call", "kickside.uploads.api:upload_handler.endpoint"), "undefined")
            test.eq(member:evaluate(actor, "access", "unrelated.module:read.endpoint"), "undefined")
            test.is_nil(admission.conditions)

            -- The user group reaches the policy through its paired requirement.
            -- The requirement is mandatory at link time, so the observable groups
            -- list is exactly the harness-supplied scope: any extra entry would
            -- mean the module ships a hardcoded group of its own.
            test.eq(type(value(policy, "groups")), "table")
            test.eq(#value(policy, "groups"), 1)
            test.eq(value(policy, "groups")[1], "app.security:user")
            local req = entry("kickside.uploads.security:user_security_scope")
            test.eq(value(req, "kind"), "ns.requirement")
            test.eq(value(req, "targets")[1].entry, "kickside.uploads.security:uploads_endpoint_access")

            -- The grant no longer lives in the module-root namespace.
            local stale = registry.get("kickside.uploads:uploads_endpoint_access")
            test.is_nil(stale, "stale module-root policy must be removed after relocation")
        end)

        test.it("publishes default upload types with pipelines", function()
            for _, name in ipairs({ "images", "text" }) do
                local upload_type = entry("kickside.uploads:types." .. name)
                test.eq(meta(upload_type).type, "upload.type")
                test.eq(value(upload_type, "type_key"), name)
                test.is_true(type(value(upload_type, "extensions")) == "table")
                test.is_true(type(value(upload_type, "pipeline")) == "table")
            end

            local documents = entry("kickside.uploads.documents:types.documents")
            test.eq(meta(documents).type, "upload.type")
            test.eq(value(documents, "type_key"), "documents")
            test.eq(value(documents, "priority"), 90)
        end)

        test.it("publishes only the canonical namespaced uploads component class", function()
            local binding = entry("kickside.uploads:uploads_component")
            local classes = {}
            for _, class in ipairs(meta(binding).class or {}) do classes[class] = true end
            test.is_true(classes["kickside.uploads"], "namespaced uploads class must remain present")
            test.is_nil(classes.uploads, "legacy bare uploads class must not be published")
        end)

        test.it("resolves session file_provider attachments through the upload repo", function()
            test.is_nil(file_provider.get_info(nil))
            test.is_nil(file_provider.get_info({}))
            test.is_nil(file_provider.get_info({ file_uuid = uuid_v4() }))

            local upload_id = uuid_v4()
            local upload = create_completed_upload(upload_id, "file-provider-user", "text/plain", "attachment.txt", 42)
            local resolved = file_provider.get_info({ file_uuid = upload_id })
            test.not_nil(resolved)
            test.eq(resolved.file_uuid, upload.uuid)
            test.eq(resolved.uuid, upload.uuid)
            test.is_nil(field(resolved, "actor_id"))
            test.eq(resolved.mime_type, "text/plain")
            test.eq(resolved.size, 42)
            test.eq(resolved.filename, "attachment.txt")
            test.eq(resolved.metadata.filename, "attachment.txt")
            test.eq(resolved.metadata.upload_id, upload_id)
            test.is_nil(field(resolved, "storage_state"))
            test.is_nil(field(resolved, "storage_id"))
            test.is_nil(field(resolved, "storage_path"))
            test.is_nil(resolved.metadata.storage_id)
            test.is_nil(resolved.metadata.storage_path)
        end)

        test.it("a chat agent reads converted attachment text under the caller identity", function()
            local owner = "attachment-owner-" .. uuid_v4()
            local other = "attachment-other-" .. uuid_v4()
            local upload_id = uuid_v4()
            local marker = "Fictional dispatch: COPPER OTTER 7149. Total: $93."
            create_completed_upload(upload_id, owner, "application/pdf", "fictional-dispatch.pdf", 200)
            seed_user(other)
            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = upload_id, kind = "markdown", role = "primary",
                mime_type = "text/markdown", label = "fictional-dispatch.md", ordinal = 1,
                content = marker, storage_id = "app:uploads", metadata = {},
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)
            local function reader(user_id)
                local allow, allow_err = security.policy("app:test_scope_policy")
                local deny, deny_err = security.policy("app:attachment_owner_only")
                test.is_nil(allow_err)
                test.is_nil(deny_err)
                return funcs.new():with_actor(security.new_actor(user_id, {}))
                    :with_scope(security.new_scope({ allow, deny }))
            end
            local read, read_err = reader(owner):call("app:attachment_agent_probe", { upload_id = upload_id })
            test.is_nil(read_err)
            test.eq(read.actor_id, owner)
            test.contains(json.encode(read.messages), upload_id)
            test.contains(json.encode(read.messages), "fictional-dispatch.pdf")
            test.is_nil(read.read_error)
            test.contains(read.result.files[1].content, marker)
            test.is_nil((read.result.files[1].content:find("%PDF", 1, true)))
            local denied, denied_err = reader(other):call("app:attachment_agent_probe", { upload_id = upload_id })
            test.is_nil(denied_err)
            test.eq(denied.actor_id, other)
            test.is_nil(denied.result)
            test.not_nil(denied.read_error)
            test.is_nil((json.encode(denied):find(marker, 1, true)))
            test.eq(read.metadata.upload_id, upload_id)
            test.contains(read.instructions, "Before answering")
        end)

        test.it("stores upload and artifact timestamps as chronologically sortable RFC3339 UTC text", function()
            local user_id = "rfc3339-user-" .. uuid_v4()

            local ids: { string } = {}
            for i = 1, 3 do
                local upload_id = "rfc3339-upload-" .. i .. "-" .. uuid_v4()
                local upload, upload_err = upload_record_repo.create(
                    upload_id, user_id, 10 + i, "text/plain",
                    "app:uploads", upload_id .. ".txt", "text",
                    { filename = "rfc3339-" .. i .. ".txt" }, "uploaded"
                )
                test.is_nil(upload_err)
                test.not_nil(upload)
                ids[#ids + 1] = upload_id

                -- The repo returns the value it persisted: a parseable second-precision
                -- RFC3339 UTC string, not a number or a TIMESTAMP.
                test.eq(type(upload.created_at), "string")
                test.eq(type(upload.updated_at), "string")
                test.is_true(tostring(upload.created_at):sub(-1) == "Z")
                local pc, pc_err = time.parse(time.RFC3339, tostring(upload.created_at))
                test.is_nil(pc_err)
                test.not_nil(pc)
                local pu, pu_err = time.parse(time.RFC3339, tostring(upload.updated_at))
                test.is_nil(pu_err)
                test.not_nil(pu)
            end

            -- Artifacts carry the same contract on their own table.
            local artifact, artifact_err = artifact_content_repo.create_artifact({
                upload_id = ids[1],
                kind = "image",
                role = "extracted-image",
                mime_type = "image/png",
                label = "rfc3339.png",
                ordinal = 1,
                content = "rfc3339 artifact bytes " .. user_id,
                storage_id = "app:uploads",
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)
            test.eq(type(artifact.created_at), "string")
            local pa, pa_err = time.parse(time.RFC3339, tostring(artifact.created_at))
            test.is_nil(pa_err)
            test.not_nil(pa)

            -- Read the persisted column back: the value parses and ORDER BY created_at
            -- returns rows in chronological order (RFC3339 UTC sorts lexicographically).
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows = sql.builder.select("uuid", "created_at")
                :from("kickside_uploads")
                :where(sql.builder.eq({ actor_id = user_id }))
                :order_by("created_at ASC, uuid ASC")
                :run_with(db):query()
            db:release()
            test.eq(#rows, 3)

            local prev_unix: number? = nil
            for _, row in ipairs(rows) do
                test.eq(type(row.created_at), "string")
                local parsed, perr = time.parse(time.RFC3339, tostring(row.created_at))
                test.is_nil(perr)
                test.not_nil(parsed)
                local unix = parsed:unix()
                if prev_unix ~= nil then
                    test.is_true(unix >= prev_unix, "ORDER BY created_at must be chronological")
                end
                prev_unix = unix
            end
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
