-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fs = require("fs")
local uuid = require("uuid")
local adapter = require("storage_adapter")
local records = require("upload_record_repo")
local artifacts = require("artifact_content_repo")

local function unique_path(prefix: string): string
    return prefix .. "-" .. uuid.v4()
end

return { run = test.run_cases(function()
    test.describe("packed upload storage paths", function()
        test.it("resolves packed filesystem paths and rejects unsupported schemes", function()
            local path = unique_path("packed-adapter")
            local bytes = "packed filesystem bytes"
            local destination = assert(fs.get("app:other_uploads"))
            assert(destination:writefile(path, bytes))

            local storage = assert(adapter.get("app:uploads", "app:db", "app:uploads", nil, nil))
            local actual, read_err = storage:readfile("fs://app:other_uploads/" .. path)
            destination:remove(path)

            test.is_nil(read_err)
            test.eq(bytes, actual)
            assert(storage:write_file(path, bytes, { atomic = true }))
            test.eq(bytes, assert(storage:read_file(path)))
            test.is_true(storage:exists(path))
            test.eq(#bytes, assert(storage:stat(path)).size)
            assert(storage:remove(path))

            local _, scheme_err = storage:readfile("unsupported://app:other_uploads/" .. path)
            test.not_nil(scheme_err)
            test.is_true(errors.is(scheme_err, errors.INVALID))
            test.contains(tostring(scheme_err), "unsupported")
        end)

        test.it("preserves the default filesystem working directory for relative operations", function()
            local storage = assert(adapter.get("app:uploads"))
            local directory = unique_path("adapter-directory")
            local filename = unique_path("adapter-note")
            assert(storage:mkdir(directory))
            assert(storage:chdir(directory))
            assert(storage:writefile(filename, "relative bytes"))
            local actual = assert(storage:readfile(filename))
            local working = storage:pwd()
            assert(storage:remove(filename))
            local _, parent_err = storage:chdir("..")
            assert(storage:remove(directory))
            test.is_nil(parent_err, tostring(parent_err))
            test.eq("/" .. directory, working)
            test.eq("relative bytes", actual)
        end)

        test.it("reads upload-original artifacts from the upload's current packed location", function()
            local upload_id = unique_path("packed-original")
            local old_path = upload_id .. ".old"
            local new_path = upload_id .. ".new"
            local bytes = "relocated original bytes"
            local source = assert(fs.get("app:uploads"))
            local destination = assert(fs.get("app:other_uploads"))
            assert(source:writefile(old_path, bytes))
            assert(destination:writefile(new_path, bytes))

            local upload, create_err = records.create(upload_id, "packed-owner", #bytes, "text/plain",
                "app:uploads", old_path, "generic", { filename = "packed.txt" }, "completed")
            test.is_nil(create_err)
            test.not_nil(upload)

            local artifact, artifact_err = artifacts.create_artifact({
                upload_id = upload_id,
                kind = "file",
                role = "source",
                mime_type = "text/plain",
                label = "packed.txt",
                ordinal = 0,
                locator = {
                    type = "upload.original",
                    upload_id = upload_id,
                    storage_id = "app:uploads",
                    storage_path = old_path,
                },
            })
            test.is_nil(artifact_err)
            test.not_nil(artifact)

            local _, update_err = records.update_storage(upload_id, "app:uploads", "fs://app:other_uploads/" .. new_path)
            test.is_nil(update_err)
            source:remove(old_path)

            local actual, read_err = artifacts.read_artifact_content(upload_id, artifact.artifact_id)
            destination:remove(new_path)
            test.is_nil(read_err)
            test.eq(bytes, actual)
        end)
    end)
end) }
