-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local catalog = require("catalog")
local records = require("records")
local resources = require("resources")
local sql = require("sql")
local artifacts = require("artifacts")
local configured_env = require("configured_env")
local cleanup = require("cleanup")
local adapter = require("adapter")
local cloud = require("cloud")

local cases = {
    {name = "retains a packed original while its legacy spelling is cleaned", row_storage_id = "app:uploads", row_packed = true, lookup_storage_id = "uploads.s3", expected = true},
    {name = "retains a legacy original while its packed spelling is cleaned", row_storage_id = "uploads.s3", lookup_storage_id = "app:uploads", lookup_packed = true, expected = true},
    {name = "treats URI-like text inside a legacy key literally", row_storage_id = "uploads.s3", lookup_storage_id = "uploads.s3", literal = true, expected = true},
    {name = "retains a shared packed blob while its legacy spelling is cleaned", row_storage_id = "app:uploads", row_packed = true, blob = true, lookup_storage_id = "uploads.s3", expected = true},
    {name = "does not alias a different native cloud authority", row_storage_id = "uploads.s3", lookup_storage_id = "app:uploads", lookup_packed = true, lookup_resource = "app:other-objects", expected = false},
    {name = "does not alias a similarly named local file", row_storage_id = "app:uploads", lookup_storage_id = "uploads.s3", expected = false},
    {name = "retains ambiguous raw references when the mapping is absent", row_storage_id = "uploads.s3", lookup_storage_id = "app:uploads", lookup_packed = true, missing = true, expected = true},
    {name = "retains ambiguous raw references when the mapping is empty", row_storage_id = "uploads.s3", lookup_storage_id = "app:uploads", lookup_packed = true, empty = true, expected = true},
    {name = "cleans packed-only objects without a legacy mapping", row_storage_id = "app:uploads", lookup_storage_id = "app:uploads", lookup_packed = true, missing = true, expected = false},
    {name = "does not mistake a nested S3 URI for a raw legacy key", row_storage_id = "uploads.s3", nested = "s3", lookup_storage_id = "app:uploads", expected = false},
    {name = "does not mistake a nested filesystem URI for a raw legacy key", row_storage_id = "uploads.s3", nested = "fs", lookup_storage_id = "app:uploads", expected = false},
    {name = "recognizes an explicitly packed legacy-ID row in its own authority", row_storage_id = "uploads.s3", row_packed = true, lookup_storage_id = "app:uploads", lookup_packed = true, expected = true},
}
return {run = test.run_cases(function()
    test.describe("legacy and packed physical references", function()
        for _, case in ipairs(cases) do
            test.it(case.name, function()
                local id, key = uuid.v4(), "legacy/" .. uuid.v4()
                if case.literal then key = key .. "/note://source" end
                local row_path = case.row_packed and "s3://app:objects/" .. key or key
                local lookup_path = case.lookup_packed and "s3://" .. (case.lookup_resource or "app:objects") .. "/" .. key or key
                if case.nested then
                    row_path = case.nested .. "://app:other-objects/" .. key
                    lookup_path = "s3://app:objects/" .. row_path
                end
                if case.missing then configured_env.failure = errors.new({kind = errors.NOT_FOUND, message = "optional mapping absent"}) end
                if case.empty then configured_env.resource_id = "" end
                local db = assert(resources.get_db())
                local parents = {}
                if case.blob then
                    assert(sql.builder.insert("kickside_upload_artifact_blobs"):set_map({
                        blob_id = id, checksum = id, mime_type = "text/plain", size = sql.as.int(1),
                        storage_id = case.row_storage_id, storage_path = row_path, metadata = "{}",
                        created_at = "fixture", updated_at = "fixture",
                    }):run_with(db):exec())
                    for index = 1, 2 do
                        local upload_id = uuid.v4()
                        assert(records.create(upload_id, "shared-blob-owner", 1, "text/plain", "app:uploads",
                            "shared-parent-" .. upload_id, "generic", {}, "completed"))
                        assert(artifacts.create_artifact({upload_id = upload_id, blob_id = id, kind = "text",
                            role = "derived", mime_type = "text/plain", label = "shared", ordinal = index}))
                        parents[#parents + 1] = upload_id
                    end
                else
                    assert(records.create(id, "legacy-reference-owner", 1, "text/plain", case.row_storage_id,
                        row_path, "generic", {}, "completed"))
                end
                local ok, failure = pcall(function()
                    local present, err = catalog.contains(db, case.lookup_storage_id, lookup_path)
                    test.is_nil(err, tostring(err))
                    test.eq(present, case.expected)
                end)
                configured_env.failure, configured_env.resource_id = nil, "app:objects"
                if case.blob then
                    for _, upload_id in ipairs(parents) do
                        assert(sql.builder.delete("kickside_upload_artifacts"):where("upload_id = ?", upload_id):run_with(db):exec())
                        assert(records.delete(upload_id))
                    end
                    assert(sql.builder.delete("kickside_upload_artifact_blobs"):where("blob_id = ?", id):run_with(db):exec())
                else
                    assert(records.delete(id))
                end
                db:release()
                if not ok then error(failure) end
            end)
        end
        test.it("preserves optional absence and native configuration failures", function()
            local db = assert(resources.get_db())
            local ok, failure = pcall(function()
                for _, kind in ipairs({errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.UNAVAILABLE}) do
                    local denied = errors.new({kind = kind, message = "configured resource lookup failed"})
                    configured_env.failure = denied
                    local present, err = catalog.contains(db, "app:uploads", "s3://app:objects/" .. uuid.v4())
                    if kind == errors.NOT_FOUND then
                        test.is_nil(err)
                        test.is_false(present)
                    else
                        test.is_nil(present)
                        test.eq(err, denied)
                    end
                end
            end)
            configured_env.failure = nil
            db:release()
            if not ok then error(failure) end
        end)
        test.it("does not delete an object retained by a packed reference after legacy relocation", function()
            local id, key = uuid.v4(), "retained/" .. uuid.v4()
            local native = assert(cloud.get("app:objects"))
            assert(native:upload_object(key, "retained bytes"))
            local upload = assert(records.create(id, "legacy-cleanup-owner", 14, "text/plain", "uploads.s3",
                "s3://app:objects/" .. key, "generic", {}, "completed"))
            local db = assert(resources.get_db())
            local tx = assert(db:begin())
            upload.metadata = assert(cleanup.enqueue_tx(tx, id, {{storage_id = "uploads.s3", storage_path = key}}))
            assert(tx:commit())
            db:release()
            local get_storage = resources.get_storage
            local removals = 0
            resources.get_storage = function(storage_id, ...)
                if storage_id ~= "uploads.s3" then return get_storage(storage_id, ...) end
                local storage = assert(adapter.get(storage_id, "app:db", "app:uploads", "app:objects"))
                local remove = storage.remove
                storage.remove = function(self, path)
                    removals = removals + 1
                    return remove(self, path)
                end
                return storage, nil
            end
            local ok, failure = pcall(function()
                local result, err = cleanup.flush(upload)
                test.is_nil(err, tostring(err))
                test.not_nil(result)
                test.eq(removals, 0)
                test.eq(assert(native:head_object(key)).size, 14)
            end)
            resources.get_storage = get_storage
            assert(native:delete_objects({key}))
            native:release()
            assert(records.delete(id))
            if not ok then error(failure) end
        end)
    end)
end)}
