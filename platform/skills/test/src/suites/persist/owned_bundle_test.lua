local test = require("test")
local sql = require("sql")
local fs = require("fs")
local hash = require("hash")
local version_append = require("version_append")
local types = require("types")
local test_identity = require("test_identity")
local skill_storage = require("skill_storage")
local function define_tests()
    test.describe("skill owns its bundled files", function()
        test.it("creates binary files without uploads rows and reads content from skill storage", function()
            local executor = test_identity.executor("owned_bundle_owner")
            local bytes = "bundle\0\255bytes"
            local skill_id, err = executor:call("kickside.skills:skill_create", {
                name = "owned-bundle", description = "Reads its own bundled guide.", body = "Read the bundled guide.",
                files = {{path = "guide.bin", kind = "asset", content = bytes}},
            })
            test.is_nil(err, tostring(err))
            test.is_true(type(skill_id) == "string" and skill_id ~= "")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err, tostring(db_err))
            test.not_nil(db)
            local rows, rows_err = db:query("SELECT COUNT(*) AS n FROM kickside_uploads WHERE uuid=$1", {skill_id})
            db:release()
            test.is_nil(rows_err, tostring(rows_err))
            test.eq(tonumber(rows[1].n), 0)
            local storage_id, id_err = skill_storage.id()
            test.is_nil(id_err, tostring(id_err))
            test.not_nil(storage_id)
            local digest, digest_err = hash.sha256(bytes)
            test.is_nil(digest_err, tostring(digest_err))
            local storage, storage_err = fs.get(storage_id :: string)
            test.is_nil(storage_err, tostring(storage_err))
            local stored, read_err = storage:readfile("skill-bundle/" .. skill_id .. "/" .. digest)
            test.is_nil(read_err, tostring(read_err))
            test.eq(stored, bytes)
            local files, files_err = executor:call("kickside.skills:skill_list_files", {skill_id = skill_id})
            test.is_nil(files_err, tostring(files_err))
            test.is_nil(files[1].sha256, "file list rows do not expose the full descriptor")
            test.is_nil(files[1].metadata, "file list rows do not expose arbitrary metadata")
            local head, head_err = executor:call("kickside.skills:skill_get", {skill_id = skill_id})
            test.is_nil(head_err, tostring(head_err))
            test.eq(head.file_count, 1)
            test.eq(#head.files, 1)
            test.eq(head.files[1].path, "guide.bin")
            test.eq(head.files[1].size_bytes, #bytes)
            test.eq(head.files[1].sha256, digest)
            test.eq(head.files[1].mime_type, files[1].mime_type)
            test.is_true(type(head.files[1].mime_type) == "string" and head.files[1].mime_type ~= "")
            local version, refine_err = executor:call("kickside.skills:skill_refine", {
                skill_id = skill_id, files = {{path = "guide.bin", kind = "asset", content = "revised\0bytes"}},
            })
            test.is_nil(refine_err, tostring(refine_err))
            local _, body_err = executor:call("kickside.skills:skill_refine", {skill_id = skill_id, body = "Updated instructions."})
            test.is_nil(body_err, tostring(body_err))
            local current, current_err = executor:call("kickside.skills:skill_read_file", {skill_id = skill_id, path = "guide.bin"})
            test.is_nil(current_err, tostring(current_err)); test.eq(current.content, "revised\0bytes")
            local original, original_err = executor:call("kickside.skills:skill_read_file", {skill_id = skill_id, path = "guide.bin", version = 1})
            test.is_nil(original_err, tostring(original_err)); test.eq(original.content, bytes)
            local deleted, delete_err = executor:call("kickside.skills:skill_delete", {skill_id = skill_id})
            test.is_nil(delete_err, tostring(delete_err)); test.eq(deleted.skill_id, skill_id)
            local exists, exists_err = storage:exists("skill-bundle/" .. skill_id)
            test.is_nil(exists_err, tostring(exists_err)); test.is_false(exists)
        end)
        test.it("rejects a body refine when the current version has no file manifest", function()
            local executor = test_identity.executor("missing_manifest_owner")
            local skill_id, create_err = executor:call("kickside.skills:skill_create", {
                name = "missing-manifest", description = "A malformed historical version.", body = "Initial.",
            })
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(skill_id)

            local threads, threads_err = version_append.threads()
            test.is_nil(threads_err, tostring(threads_err))
            test.not_nil(threads)
            local append_err = version_append.append(threads, skill_id, types.EVENT.UPDATED, {
                skill_id = skill_id,
                version = 2,
                name = "missing-manifest",
                description = "A malformed historical version.",
                body = "Current version has no manifest.",
                file_count = 1,
                bundle_size = 0,
            }, types.SKILL_IMPL, types.THREAD_CLASS)
            test.is_nil(append_err, tostring(append_err))

            local refined, refine_err = executor:call("kickside.skills:skill_refine", {
                skill_id = skill_id, body = "Must not erase a missing manifest.",
            })
            test.is_nil(refined)
            test.not_nil(refine_err)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
