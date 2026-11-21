-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local fs = require("fs")
local json = require("json")
local records = require("records")
local provision = require("provision")
local types = require("types")
local artifacts = require("artifacts")
local artifact_parts = require("artifact_parts")
local reader = require("reader")

local owner, stranger, delete_owner, corrupt_owner, cleanup_owner
local owner_component, delete_component, corrupt_component, cleanup_component
local uploads = {}
local seeded = {}
local volume

local PRIVATE_MISSING_PATH = "private-fixture/original-upload-bytes.txt"

local function actor(id)
    return assert(security.new_actor(id, {security_groups = {"app:uploads_test"}}))
end

local function scope(policy)
    local policies = {assert(security.policy("app:test_scope_policy"))}
    if policy then policies[#policies + 1] = assert(security.policy(policy)) end
    return assert(security.new_scope(policies))
end

local function open(definition, context, options)
    options = options or {}
    local def = assert(contract.get(definition)):with_scope(scope(options.policy))
        :with_context(context or {})
    def = def:with_actor(actor(options.actor or owner))
    local binding = definition == "wippy.session:file_provider" and "kickside.uploads:file_provider"
        or definition == "kickside.contract:deletable" and "kickside.uploads:uploads_component"
        or "kickside.uploads:content_provider"
    return def:open(binding)
end

local function check(err, kind, code)
    test.not_nil(err)
    test.is_true(errors.is(err, kind), tostring(err))
    if code then test.eq((err:details() or {}).code, code) end
end

local function check_public_storage_error(err, private_value)
    local serialized = assert(json.encode({
        kind = err:kind(), message = err:message(), retryable = err:retryable(), details = err:details(),
    }))
    test.is_true(serialized:find(private_value, 1, true) == nil, "public content error contains a private storage locator")
    test.is_nil(err:details().cause)
end

local function invoke(method, context, options, args)
    local provider, err = open("kickside.contract:content_provider", context, options)
    if err then return nil, err end
    return provider[method](provider, args or {})
end

local function provision_owner(id)
    local db = assert(sql.get("app:db"))
    assert(db:execute([[INSERT INTO app_users
        (user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], {id, id .. "@uploads.test"}))
    for _, group in ipairs({"app:uploads_test", "wippy.security:process"}) do
        assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)", {id, group}))
    end
    db:release()
    local result, err = provision.ensure_user(actor(id), security.named_scope("wippy.security:process"), id)
    test.is_nil(err, tostring(err))
    test.not_nil(result)
    return assert(types.component_id_for_owner(id))
end

local function seed(name, storage_id, upload_owner)
    local id = uuid.v4()
    local row, err = records.create(id, upload_owner or owner, 5, "text/plain", storage_id or "app:uploads",
        id, "kickside.uploads:types.generic", {filename = "notes.txt"}, "completed")
    test.is_nil(err, tostring(err))
    test.not_nil(row)
    uploads[name] = id
    seeded[#seeded + 1] = id
end

local function update(id, column, value)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute("UPDATE kickside_uploads SET " .. column .. "=$1 WHERE uuid=$2", {value, id})
    db:release()
    test.is_nil(err, tostring(err))
end

return {run = test.run_cases(function()
    test.describe("published uploads contract errors", function()
        test.before_all(function()
            owner, stranger, delete_owner = uuid.v4(), uuid.v4(), uuid.v4()
            corrupt_owner, cleanup_owner = uuid.v4(), uuid.v4()
            owner_component = provision_owner(owner)
            delete_component = provision_owner(delete_owner)
            corrupt_component = provision_owner(corrupt_owner)
            cleanup_component = provision_owner(cleanup_owner)
            volume = assert(fs.get("app:uploads"))
            seed("normal")
            assert(volume:writefile(uploads.normal, "bytes"))
            seed("invalid_owner")
            update(uploads.invalid_owner, "actor_id", "")
            seed("missing_path")
            update(uploads.missing_path, "storage_path", "")
            seed("missing_file")
            update(uploads.missing_file, "storage_path", PRIVATE_MISSING_PATH)
            seed("unavailable_storage", "app.upload_errors:unavailable_storage")
            seed("unregistered_storage", "app:private_original_volume")
            seed("unreadable_storage", "app.upload_errors:unreadable_storage")
            seed("delete_failure", "app.upload_errors:unavailable_storage", delete_owner)
            update(uploads.delete_failure, "type_id", "")
            seed("corrupt_metadata", nil, corrupt_owner)
            update(uploads.corrupt_metadata, "metadata", "{")
            seed("legacy_storage", "app.upload_errors:legacy_storage")
            local db = assert(sql.get("app:db"))
            for _ = 1, 101 do
                assert(db:execute([[INSERT INTO kickside_upload_read_model
                    (upload_id,component_id,status) VALUES ($1,$2,'completed')]], {uuid.v4(), cleanup_component}))
            end
            db:release()
        end)
        test.after_all(function()
            if not volume then return end
            for _, name in ipairs({"normal", "legacy_table", "large_table"}) do
                if uploads[name] then assert(volume:remove(uploads[name])) end
            end
            local db = assert(sql.get("app:db"))
            for _, id in ipairs(seeded) do
                local _, err = db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {id})
                test.is_nil(err, tostring(err))
            end
            db:release()
        end)
        for _, method in ipairs({"get_info", "get_content"}) do
            test.it(method .. " reports missing uploads", function()
                local value, err = invoke(method, {upload_id = uuid.v4()})
                test.is_nil(value)
                check(err, errors.NOT_FOUND, "upload_not_found")
                test.eq(err:message(), "Upload not found")
                test.is_false(err:retryable())
            end)
            test.it(method .. " refuses another owner's upload", function()
                local value, err = invoke(method, {upload_id = uploads.normal}, {actor = stranger})
                test.is_nil(value)
                check(err, errors.PERMISSION_DENIED)
                test.not_nil((err:details() or {}).code)
            end)
            for _, context in ipairs({{}, {upload_id = ""}, {upload_id = 123}}) do
                local name = context.upload_id == nil and "missing" or context.upload_id == "" and "empty" or "invalid"
                test.it(method .. " rejects " .. name .. " context", function()
                    local provider, open_err = open("kickside.contract:content_provider", context)
                    if open_err then check(open_err, errors.INVALID); return end
                    local value, err = provider[method](provider, {})
                    test.is_nil(value)
                    check(err, errors.INVALID, context.upload_id ~= nil and "upload_id_required" or nil)
                end)
            end
            test.it(method .. " reports invalid owner data", function()
                local value, err = invoke(method, {upload_id = uploads.invalid_owner})
                test.is_nil(value)
                check(err, errors.INTERNAL, "upload_owner_invalid")
                test.eq(err:message(), "Upload owner is invalid")
            end)
            test.it(method .. " preserves corrupt persisted metadata errors", function()
                local value, err = invoke(method, {upload_id = uploads.corrupt_metadata})
                test.is_nil(value)
                check(err, errors.INTERNAL, "persisted_data")
                test.is_false(err:retryable())
                test.eq(err:details().field, "kickside_uploads.metadata")
            end)
            test.it(method .. " preserves database acquisition refusals", function()
                local value, err = invoke(method, {upload_id = uploads.normal}, {policy = "app.upload_errors:deny_database"})
                test.is_nil(value)
                check(err, errors.PERMISSION_DENIED, "database_unavailable")
                test.eq(err:details().cause.kind, errors.PERMISSION_DENIED)
            end)
        end
        for _, method in ipairs({"list", "count"}) do
            test.it(method .. " preserves database acquisition refusals", function()
                local provider = assert(open("kickside.contract:resource_registry", {}, {policy = "app.upload_errors:deny_database"}))
                local value, err = provider[method](provider, {})
                test.is_nil(value)
                check(err, errors.PERMISSION_DENIED, "database_unavailable")
                test.eq(err:details().cause.kind, errors.PERMISSION_DENIED)
                test.is_true(err:message():find("Failed to " .. method .. " uploads: ", 1, true) == 1)
            end)
            test.it(method .. " excludes another owner's uploads", function()
                local provider = assert(open("kickside.contract:resource_registry", {}, {
                    actor = stranger, policy = "app.upload_errors:owner_only"}))
                local value, err = provider[method](provider, {})
                test.is_nil(err, tostring(err))
                if method == "list" then test.eq(#value.items, 0) else test.eq(value.total_count, 0) end
            end)
        end
        for _, limit in ipairs({0, 101, "bad", 1.5, false}) do
            test.it("list rejects limit " .. tostring(limit), function()
                local provider = assert(open("kickside.contract:resource_registry"))
                local value, err = provider:list({limit = limit})
                test.is_nil(value)
                check(err, errors.INVALID, "invalid_limit")
                test.eq(err:message(), "Limit must be between 1 and 100")
            end)
        end
        test.it("content reports missing original paths", function()
            local value, err = invoke("get_content", {upload_id = uploads.missing_path})
            test.is_nil(err, tostring(err))
            test.is_false(value.success)
            check(value.error, errors.INTERNAL, "upload_storage_path_missing")
            test.eq(value.error:message(), "Original upload storage path is missing")
        end)
        for _, read in ipairs({{name = "default"}, {name = "raw", args = {format = "raw", max_size = 3}}}) do
            test.it(read.name .. " content reports missing original bytes without returning the stored path", function()
                local value, err = invoke("get_content", {upload_id = uploads.missing_file}, nil, read.args)
                test.is_nil(err, tostring(err))
                test.is_false(value.success)
                check(value.error, errors.NOT_FOUND, "upload_content_read_failed")
                test.eq(value.error:message(), "Failed to read original upload content")
                test.is_false(value.error:retryable() == true)
                check_public_storage_error(value.error, PRIVATE_MISSING_PATH)
            end)
        end
        for _, row in ipairs({{"unavailable_storage", "acquire"}, {"unreadable_storage", "read"}}) do
            test.it("content preserves storage " .. row[2] .. " failures", function()
                local value, err = invoke("get_content", {upload_id = uploads[row[1]]})
                local failure = err or (value and value.error)
                check(failure, errors.UNAVAILABLE, row[2] == "acquire" and "storage_unavailable" or "upload_content_read_failed")
                test.is_true(failure:retryable())
                check_public_storage_error(failure, uploads[row[1]])
                if row[2] == "acquire" then
                    test.is_nil(value)
                    test.eq(failure:message(), "Failed to get upload storage")
                else
                    test.is_false(value.success)
                    test.eq(failure:message(), "Failed to read original upload content")
                end
            end)
        end
        test.it("content reports unregistered storage without disclosing the storage ID", function()
            local value, err = invoke("get_content", {upload_id = uploads.unregistered_storage})
            test.is_nil(value)
            check(err, errors.UNAVAILABLE, "storage_unavailable")
            check_public_storage_error(err, "app:private_original_volume")
        end)
        test.it("content classifies legacy storage dependency errors", function()
            local value, err = invoke("get_content", {upload_id = uploads.legacy_storage})
            test.is_nil(value)
            check(err, errors.UNAVAILABLE, "storage_unavailable")
            test.is_true(err:retryable())
            test.eq(err:message(), "Failed to get upload storage")
            check_public_storage_error(err, "upload test legacy storage failure")
        end)
        test.it("list preserves corrupt persisted metadata errors", function()
            local provider = assert(open("kickside.contract:resource_registry", {}, {
                actor = corrupt_owner, policy = "app.upload_errors:owner_only"}))
            local value, err = provider:list({})
            test.is_nil(value)
            check(err, errors.INTERNAL, "persisted_data")
            test.is_false(err:retryable())
            test.eq(err:details().field, "kickside_uploads.metadata")
        end)
        for _, raw in ipairs({false, true}) do
            test.it("honors a byte limit on the " .. (raw and "raw" or "default") .. " original read", function()
                local value, err = invoke("get_content", {upload_id = uploads.normal}, nil,
                    {format = raw and "raw" or nil, max_size = 3})
                test.is_nil(err, tostring(err))
                test.is_true(value.success)
                test.eq(value.content, "byt")
                test.eq(value.size, 3)
                test.eq(value.total_size, 5)
                test.is_true(value.truncated)
            end)
        end

        test.it("content reports absent extracted artifacts", function()
            local value, err = invoke("get_content", {upload_id = uploads.normal}, nil, {extracted_only = true})
            test.is_nil(err, tostring(err))
            test.is_false(value.success)
            test.eq(value.state, "unreadable")
            check(value.error, errors.NOT_FOUND, "artifact_read_failed")
            test.eq(value.error:message(), "extracted text is not available: primary content artifact not found")
            test.is_nil(value.error:retryable())
            local cause = value.error:details().cause
            test.eq(cause.details.code, "primary_artifact_missing")
            test.eq(cause.details.upload_id, uploads.normal)
            test.is_nil(cause.details.artifact_id)
        end)
        test.it("keeps native database errors when artifact queries fail", function()
            local id = uploads.normal
            local db = assert(sql.get("app:db"))
            assert(db:execute("ALTER TABLE kickside_upload_artifact_blobs RENAME TO unavailable_artifact_blobs"))
            local _, native = db:query("SELECT blob_id FROM kickside_upload_artifact_blobs")
            local primary_ok, primary, primary_err = pcall(artifact_parts.read_primary_content, id)
            local list_ok, found, list_err = pcall(artifact_parts.list_artifacts, id)
            local blob_ok, blob, blob_err = pcall(artifacts.read_blob, id)
            local artifact_ok, artifact, artifact_err = pcall(artifacts.read_artifact_content, id, id)
            assert(db:execute("ALTER TABLE unavailable_artifact_blobs RENAME TO kickside_upload_artifact_blobs"))
            db:release()

            test.not_nil(native)
            test.is_true(primary_ok, tostring(primary))
            test.is_true(blob_ok, tostring(blob))
            test.is_true(artifact_ok, tostring(artifact))
            test.is_nil(primary)
            test.is_nil(blob)
            test.is_nil(artifact)
            test.is_true(list_ok, tostring(found))
            test.is_nil(found)
            for _, failure in ipairs({
                {operation = "primary", error = primary_err},
                {operation = "list", error = list_err},
                {operation = "blob", error = blob_err},
                {operation = "artifact", error = artifact_err},
            }) do
                local err = failure.error
                test.eq(type(err), "userdata", failure.operation .. ": " .. tostring(err))
                check(err, native:kind())
                test.eq(err:retryable(), native:retryable())
                test.contains(tostring(err), "kickside_upload_artifact_blobs")
            end
        end)
        for _, backing in ipairs({"blob", "locator"}) do
            test.describe(backing .. " artifact reads", function()
                local id, artifact, path
                local bytes = "artifact bytes"

                local function set_location(storage_id, storage_path)
                    if artifact.blob_id then
                        local db = assert(sql.get("app:db"))
                        local _, err = db:execute([[UPDATE kickside_upload_artifact_blobs
                            SET storage_id=$1, storage_path=$2 WHERE blob_id=$3]],
                            {storage_id, storage_path, artifact.blob_id})
                        db:release()
                        test.is_nil(err, tostring(err))
                    else
                        update(id, "storage_id", storage_id)
                        update(id, "storage_path", storage_path)
                    end
                end

                test.before_each(function()
                    seed(backing .. " read")
                    id = uploads[backing .. " read"]
                    artifact = assert(artifacts.create_artifact({
                        upload_id = id, kind = "text", role = "primary", mime_type = "text/plain",
                        content = backing == "blob" and bytes or nil,
                        locator = {type = "upload.original"},
                    }))
                    if artifact.blob_id then
                        path = assert(artifacts.get_blob(artifact.blob_id)).storage_path
                    else
                        path = id
                        assert(volume:writefile(path, bytes))
                    end
                end)

                test.after_each(function()
                    local db = assert(sql.get("app:db"))
                    assert(db:execute("DELETE FROM kickside_upload_artifacts WHERE artifact_id=$1", {artifact.artifact_id}))
                    if artifact.blob_id then
                        assert(db:execute("DELETE FROM kickside_upload_artifact_blobs WHERE blob_id=$1", {artifact.blob_id}))
                    end
                    db:release()
                    assert(volume:remove(path))
                end)

                test.it("preserves the storage fault and reads the bytes after it clears", function()
                    set_location("app.upload_errors:unreadable_storage", path)
                    local content, err = artifacts.read_artifact_content(id, artifact.artifact_id)
                    set_location("app:uploads", path)
                    local recovered, recovery_err = artifacts.read_artifact_content(id, artifact.artifact_id)
                    test.is_nil(recovery_err, tostring(recovery_err))
                    test.eq(recovered, bytes)
                    test.is_nil(content)
                    check(err, errors.UNAVAILABLE)
                    test.is_true(err:retryable())
                    test.contains(tostring(err), "upload test storage read failed")
                end)

                test.it("preserves storage kinds independently of diagnostic text", function()
                    local function read_failure(storage_id, storage_path)
                        set_location(storage_id, storage_path)
                        local content, err = artifacts.read_artifact_content(id, artifact.artifact_id)
                        test.is_nil(content)
                        test.not_nil(err)
                        return err
                    end
                    local unavailable = read_failure("app.upload_errors:unreadable_storage", path)
                    local invalid = read_failure("app.upload_errors:invalid_storage", path)
                    local other = read_failure("app.upload_errors:unreadable_storage", path .. ".different")
                    test.eq(unavailable:message(), invalid:message())
                    test.is_true(unavailable:message() ~= other:message())
                    check(unavailable, errors.UNAVAILABLE, "upload_test_storage_unavailable")
                    check(other, errors.UNAVAILABLE, "upload_test_storage_unavailable")
                    check(invalid, errors.INVALID, "upload_test_storage_invalid")
                    test.is_true(unavailable:retryable())
                    test.is_true(other:retryable())
                    test.is_false(invalid:retryable())
                end)

                test.it("reports missing backing bytes as not found", function()
                    set_location("app:uploads", path .. ".missing")
                    local content, err = artifacts.read_artifact_content(id, artifact.artifact_id)
                    test.is_nil(content)
                    check(err, errors.NOT_FOUND)
                    test.is_false(err:retryable() == true)

                    local _, foreign = artifacts.read_artifact_content(uploads.normal, artifact.artifact_id)
                    local _, absent = artifacts.read_artifact_content(id, uuid.v4())
                    check(foreign, errors.NOT_FOUND, "artifact_reference_not_found")
                    check(absent, errors.NOT_FOUND, "artifact_reference_not_found")
                    test.is_true((err:details() or {}).code ~= "artifact_reference_not_found")
                end)

                test.it("reports a private backing path failure without disclosing the path", function()
                    local private_path = "private-fixture/primary-" .. backing .. ".txt"
                    set_location("app:uploads", private_path)
                    local value, err = invoke("get_content", {upload_id = id})
                    test.is_nil(value)
                    check(err, errors.NOT_FOUND, "artifact_read_failed")
                    test.is_false(err:retryable() == true)
                    test.eq(err:details().artifact_read_source, backing)
                    check_public_storage_error(err, private_path)
                end)

                test.it("distinguishes an unregistered volume from missing backing bytes", function()
                    for _, location in ipairs({
                        {storage_id = "app:unregistered_volume", path = path},
                        {storage_id = "app:uploads", path = "fs://app:unregistered_volume/" .. path},
                    }) do
                        set_location(location.storage_id, location.path)
                        local content, read_err = artifacts.read_artifact_content(id, artifact.artifact_id)
                        test.is_nil(content)
                        check(read_err, errors.UNAVAILABLE, "storage_unavailable")
                        test.eq(read_err:details().cause.kind, errors.NOT_FOUND)

                        local value, err = invoke("get_content", {upload_id = id}, nil, {extracted_only = true})
                        test.is_nil(err, tostring(err))
                        test.is_false(value.success)
                        test.eq(value.error:kind(), errors.UNAVAILABLE)
                        local cause = value.error:details().cause
                        test.eq(cause.details.code, "storage_unavailable")
                        test.eq(cause.details.artifact_id, artifact.artifact_id)
                        test.is_nil(cause.details.cause)
                    end
                end)

                test.it("reports malformed stored locations as invalid", function()
                    set_location("app:uploads", backing == "blob" and "fs://" or "")
                    local content, err = artifacts.read_artifact_content(id, artifact.artifact_id)
                    test.is_nil(content)
                    check(err, errors.INVALID)
                    if backing == "blob" then
                        test.is_false(err:retryable())
                    else
                        test.is_nil(err:retryable())
                    end
                end)

                test.it("extracted-only content preserves storage acquisition errors", function()
                    for _, fixture in ipairs({
                        {storage = "app.upload_errors:unavailable_storage", code = "artifact_read_failed"},
                        {storage = "app.upload_errors:legacy_storage", code = "storage_unavailable"},
                    }) do
                        set_location(fixture.storage, path)
                        local value, err = invoke("get_content", {upload_id = id}, nil, {extracted_only = true})
                        test.is_nil(err, tostring(err))
                        test.is_false(value.success)
                        test.eq(value.state, "unreadable")
                        check(value.error, errors.UNAVAILABLE, fixture.code)
                        test.is_true(value.error:retryable())
                        test.eq(value.error:message(), "extracted text is not available")
                        local cause = value.error:details().cause
                        test.eq(cause.kind, errors.UNAVAILABLE)
                        test.is_true(cause.retryable)
                        test.eq(cause.message, value.error:message())
                        test.eq(cause.details.upload_id, id)
                        test.eq(cause.details.artifact_id, artifact.artifact_id)
                        test.is_nil(value.error:details().operation)
                        test.is_nil(cause.details.cause)
                    end
                end)

                for _, fixture in ipairs({
                    {name = "invalid storage path", kind = errors.INVALID, path = "fs://", retryable = false,
                        cause_code = "invalid_storage_path", diagnostic = "Packed storage path requires an entry id and path"},
                    {name = "missing backing bytes", kind = errors.NOT_FOUND, path = "private/missing.txt",
                        diagnostic = "private/missing.txt"},
                    {name = "unavailable storage", kind = errors.UNAVAILABLE, path = "s3://private/unavailable.txt?token=fixture-secret",
                        retryable = true, storage_id = "app.upload_errors:unreadable_storage", diagnostic = "fixture-secret"},
                }) do
                    test.it("extracted-only content preserves the public error for " .. fixture.name, function()
                        set_location(fixture.storage_id or "app:uploads", fixture.path)
                        local value, err = invoke("get_content", {upload_id = id}, nil, {extracted_only = true})
                        test.is_nil(err, tostring(err))
                        test.is_false(value.success)
                        test.eq(value.state, "unreadable")
                        check(value.error, fixture.kind, "artifact_read_failed")
                        local target = backing == "blob" and "blob" or "bytes"
                        local public_message = "failed to read artifact " .. target
                        test.eq(value.error:message(), "extracted text is not available: " .. public_message)
                        test.eq(value.error:retryable(), fixture.retryable)
                        local native = value.error:details().cause
                        test.eq(native.kind, fixture.kind)
                        test.eq(native.retryable, fixture.retryable)
                        test.is_nil(native.message:find(fixture.diagnostic, 1, true))
                        test.eq(native.message, public_message)
                        local public_details = {
                            code = fixture.cause_code,
                            upload_id = id,
                            artifact_id = artifact.artifact_id,
                        }
                        for key, expected in pairs(public_details) do test.eq(native.details[key], expected) end
                        for key, actual in pairs(native.details) do test.eq(actual, public_details[key], key) end
                        test.is_nil(value.error:details().operation)
                    end)
                end
            end)
        end
        test.it("reads an existing binary-labelled table as extracted text", function()
            seed("legacy_table")
            local id = uploads.legacy_table
            local mime = "application/octet-stream"
            local bytes = "item\tquantity\nPencils\t12\n"
            update(id, "mime_type", mime)
            update(id, "metadata", '{"filename":"inventory.tsv"}')
            assert(volume:writefile(id, bytes))
            local artifact = assert(artifacts.create_artifact({
                upload_id = id, kind = "table", role = "primary", mime_type = mime,
                locator = {type = "upload.original"}, metadata = {delimiter = "tab"},
            }))

            local value, err = invoke("get_content", {upload_id = id}, nil, {extracted_only = true})
            test.is_nil(err, tostring(err))
            test.eq(value.state, "ready")
            test.eq(value.content, bytes)
            test.eq(value.artifact_id, artifact.artifact_id)
            test.eq(value.content_type, "text/tab-separated-values")
            local info = assert(invoke("get_info", {upload_id = id}))
            test.eq(info.content_type, value.content_type)
        end)
        test.it("reads only a bounded prefix of a 100 MiB legacy table", function()
            seed("large_table")
            local id = uploads.large_table
            local mime = "application/octet-stream"
            local block = ("a\tb\n"):rep(256 * 1024)
            local size = #block * 100
            update(id, "mime_type", mime)
            update(id, "metadata", '{"filename":"large.tsv"}')
            update(id, "size", size)
            local file = assert(volume:open(id, "w"))
            for _ = 1, 100 do assert(file:write(block)) end
            assert(file:close())
            assert(artifacts.create_artifact({
                upload_id = id, kind = "table", role = "primary", mime_type = mime,
                locator = {type = "upload.original"},
            }))

            local value, err = invoke("get_content", {upload_id = id}, nil, {extracted_only = true, limit = size})
            test.is_nil(err, tostring(err))
            test.is_true(value.success, tostring(value.error))
            test.eq(value.content, block:sub(1, 24 * 1024))
            test.eq(value.total_size, size)
            test.is_true(value.content_truncated)
            local trusted, trusted_err = reader.primary_text(id, 4096)
            test.is_nil(trusted_err, tostring(trusted_err))
            test.eq(trusted.text, block:sub(1, 4096))
            test.eq(trusted.chars, size)
            test.is_true(trusted.truncated)
            for _, options in ipairs({{max_size = 32}, {format = "raw", max_size = 32}}) do
                local content = assert(invoke("get_content", {upload_id = id}, nil, options))
                test.eq(content.content, block:sub(1, 32))
                test.eq(content.size, 32)
                test.eq(content.total_size, size)
                test.is_true(content.truncated)
            end
        end)
        test.it("keeps original binary bytes out of extracted text when the linked artifact is labelled text", function()
            seed("original_binary")
            local id = uploads.original_binary
            update(id, "mime_type", "image/png")
            assert(artifacts.create_artifact({
                upload_id = id, kind = "markdown", role = "primary", mime_type = "text/markdown",
                locator = {type = "upload.original"},
            }))
            local info = assert(invoke("get_info", {upload_id = id}))
            test.eq(info.content_type, "image/png")
            test.is_false(info.content_description.text_available)
            local content = assert(invoke("get_content", {upload_id = id}, nil, {extracted_only = true}))
            test.is_false(content.success)
            test.eq(content.state, "unreadable")
        end)
        for _, fixture in ipairs({
            { name = "blob", content = "derived bytes", metadata = {size = 101, original_size = 102, file_size = 103} },
            { name = "empty blob", content = "", metadata = {size = 101} },
            { name = "blobless size", metadata = {size = 101} },
            { name = "blobless original_size", metadata = {original_size = 102} },
            { name = "blobless file_size", metadata = {file_size = 103} },
            { name = "blobless absent size", metadata = {} },
        }) do
            test.it("content metadata uses canonical fields for " .. fixture.name, function()
                seed(fixture.name)
                local id = uploads[fixture.name]
                assert(volume:writefile(id, "bytes"))
                update(id, "mime_type", fixture.content ~= nil and "application/pdf" or "text/plain")
                fixture.metadata.mime_type = "image/png"
                fixture.metadata.checksum = string.rep("0", 64)
                local artifact = assert(artifacts.create_artifact({
                    upload_id = id, kind = "text", role = "primary", mime_type = "text/plain",
                    content = fixture.content, locator = {type = "upload.original"},
                    metadata = fixture.metadata,
                }))
                local info, info_err = invoke("get_info", {upload_id = id})
                test.is_nil(info_err, tostring(info_err))
                test.eq(info.artifact_id, artifact.artifact_id)
                test.eq(info.content_type, artifact.mime_type)
                test.eq(info.checksum, artifact.checksum)
                if fixture.content ~= nil then
                    test.eq(info.size, #fixture.content)
                else
                    test.is_nil(info.size, "blobless artifacts have no recorded byte size")
                end
                for _, args in ipairs({{}, {extracted_only = true}}) do
                    local content, content_err = invoke("get_content", {upload_id = id}, nil, args)
                    test.is_nil(content_err, tostring(content_err))
                    test.is_true(content.success)
                    test.eq(content.content_type, artifact.mime_type)
                    if fixture.content ~= nil then
                        test.eq(content.content, fixture.content)
                    else
                        test.eq(content.content, "bytes")
                    end
                    if not args.extracted_only then test.eq(content.checksum, artifact.checksum) end
                end
                local blob
                if artifact.blob_id then blob = assert(artifacts.get_blob(artifact.blob_id)) end
                local db = assert(sql.get("app:db"))
                assert(db:execute("DELETE FROM kickside_upload_artifacts WHERE artifact_id=$1", {artifact.artifact_id}))
                if blob then
                    assert(db:execute("DELETE FROM kickside_upload_artifact_blobs WHERE blob_id=$1", {blob.blob_id}))
                end
                db:release()
                if blob then assert(volume:remove(blob.storage_path)) end
                assert(volume:remove(id))
            end)
        end
        test.it("session file provider keeps invalid and absent attachments optional", function()
            local provider = assert(open("wippy.session:file_provider"))
            for _, args in ipairs({{}, {file_uuid = ""}, {file_uuid = 123}, {file_uuid = uuid.v4()}}) do
                local value, err = provider:get_info(args)
                test.is_nil(value)
                test.is_nil(err, tostring(err))
            end
        end)
        test.it("session file provider resolves an existing upload", function()
            local provider = assert(open("wippy.session:file_provider"))
            local value, err = provider:get_info({file_uuid = uploads.normal})
            test.is_nil(err, tostring(err))
            test.eq(value.file_uuid, uploads.normal)
            test.eq(value.filename, "notes.txt")
        end)
        test.it("session file provider preserves corrupt persisted metadata errors", function()
            local provider = assert(open("wippy.session:file_provider"))
            local value, err = provider:get_info({file_uuid = uploads.corrupt_metadata})
            test.is_nil(value)
            check(err, errors.INTERNAL, "persisted_data")
            test.is_false(err:retryable())
            test.eq(err:details().field, "kickside_uploads.metadata")
        end)
        test.it("session file provider preserves database acquisition refusals", function()
            local provider = assert(open("wippy.session:file_provider", {}, {policy = "app.upload_errors:deny_database"}))
            local value, err = provider:get_info({file_uuid = uploads.normal})
            test.is_nil(value)
            check(err, errors.PERMISSION_DENIED, "database_unavailable")
            test.eq(err:details().cause.kind, errors.PERMISSION_DENIED)
        end)
        for _, context in ipairs({{}, {component_id = ""}, {component_id = 123}}) do
            local name = context.component_id == nil and "missing" or context.component_id == "" and "empty" or "invalid"
            test.it("delete rejects " .. name .. " context", function()
                local provider, open_err = open("kickside.contract:deletable", context)
                if open_err then check(open_err, errors.INVALID); return end
                local value, err = provider:delete({})
                if context.component_id == nil then
                    test.is_nil(value)
                    check(err, errors.INVALID)
                else
                    test.is_nil(err, tostring(err))
                    test.is_false(value.success)
                    check(value.error, errors.INVALID, "component_context_required")
                end
            end)
        end
        test.it("delete preserves component-owner dependency refusals", function()
            local provider = assert(open("kickside.contract:deletable", {component_id = owner_component}, {
                policy = "app.upload_errors:deny_database"}))
            local value, err = provider:delete({})
            test.is_nil(err, tostring(err))
            test.is_false(value.success)
            check(value.error, errors.PERMISSION_DENIED, "component_owner_failed")
            test.is_true(value.error:message():find("resolve actor: ", 1, true) == 1)
        end)
        test.it("delete preserves storage failures and retains the upload", function()
            local provider = assert(open("kickside.contract:deletable", {component_id = delete_component}))
            local value, err = provider:delete({})
            test.is_nil(err, tostring(err))
            test.is_false(value.success)
            test.eq(value.deleted, 0)
            check(value.error, errors.UNAVAILABLE, "upload_test_storage_unavailable")
            test.is_true(value.error:retryable())
            test.eq(value.error:details().operation, "acquire")
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT uuid FROM kickside_uploads WHERE uuid=$1", {uploads.delete_failure}))
            db:release()
            test.eq(#rows, 1)
        end)
        test.it("delete preserves errors from listing owner uploads", function()
            local provider = assert(open("kickside.contract:deletable", {component_id = corrupt_component}))
            local value, err = provider:delete({})
            test.is_nil(err, tostring(err))
            test.is_false(value.success)
            test.eq(value.deleted, 0)
            check(value.error, errors.INTERNAL, "persisted_data")
            test.is_false(value.error:retryable())
            test.eq(value.error:details().field, "kickside_uploads.metadata")
            test.is_true(value.error:message():find("list uploads: ", 1, true) == 1)
        end)
        test.it("delete retains read-model cleanup failures for retry", function()
            local provider = assert(open("kickside.contract:deletable", {component_id = cleanup_component}))
            local value, err = provider:delete({})
            test.is_nil(err, tostring(err))
            test.is_false(value.success)
            test.eq(value.deleted, 0)
            check(value.error, errors.CONFLICT, "read_model_cleanup_failed")
            test.is_true(value.error:retryable())
            test.eq(value.error:message(), "upload read-model cleanup needs another page")
            test.eq(value.error:details().cause.kind, errors.CONFLICT)
            local retried, retry_err = provider:delete({})
            test.is_nil(retry_err, tostring(retry_err))
            test.is_true(retried.success)
            test.eq(retried.read_rows_deleted, 1)
        end)
        test.it("refuses to fence an uploads component while its principal custody is unresolved", function()
            local db = assert(sql.get("app:db"))
            assert(db:execute([[UPDATE kickside_components SET owner_type='unresolved', owner_kind=NULL,
                owner_id=NULL, custody_legacy=1 WHERE component_id=$1]], {owner_component}))
            assert(db:release())

            local service = assert(assert(contract.get("kickside.component:component_service"))
                :with_actor(actor(owner)):with_scope(scope()):open())
            local refused = assert(service:delete({component_id = owner_component}))
            local provider = assert(open("kickside.contract:deletable", {component_id = owner_component}))
            local cleanup = assert(provider:delete({}))

            db = assert(sql.get("app:db"))
            local row = assert(db:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", {owner_component}))[1]
            local upload = assert(db:query("SELECT uuid FROM kickside_uploads WHERE uuid=$1", {uploads.normal}))[1]
            assert(db:execute([[UPDATE kickside_components SET owner_type='principal',owner_kind='user',owner_id=$1
                WHERE component_id=$2]], {owner, owner_component}))
            assert(db:release())
            test.not_nil(row)
            test.is_nil(row.deleting_at)
            test.not_nil(upload)
            test.eq(refused.kind, errors.CONFLICT)
            test.eq(refused.details.code, "custody_unresolved")
            test.is_false(cleanup.success)
            check(cleanup.error, errors.CONFLICT, "custody_unresolved")
        end)
        test.it("delete is idempotent for an absent component owner", function()
            local provider = assert(open("kickside.contract:deletable", {component_id = uuid.v4()}))
            local value, err = provider:delete({})
            test.is_nil(err, tostring(err))
            test.is_true(value.success)
            test.eq(value.deleted, 0)
        end)
    end)
end)}
