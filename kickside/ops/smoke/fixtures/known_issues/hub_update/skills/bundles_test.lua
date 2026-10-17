local test = require("test")
local hash = require("hash")
local test_identity = require("test_identity")
local version_append = require("version_append")
local types = require("types")
local artifact_content_repo = require("artifact_content_repo")
local upload_record_repo = require("upload_record_repo")
local migration_runner = require("migration_runner")

local function normal_update()
    local runner = migration_runner.setup("app:db")
    local _, err = runner:find_migrations()
    test.is_nil(err, tostring(err))
    local result = runner:run()
    test.eq(result.migrations_failed, 0, tostring(result.error))
end

local function seed(record)
    local threads, threads_err = version_append.threads()
    if threads_err then return nil, threads_err end
    local append_err = version_append.append(threads, record.skill_id, types.EVENT.UPDATED, record,
        types.SKILL_IMPL, types.THREAD_CLASS)
    if append_err then return nil, append_err end
    return threads:catch_up_projection({thread_id = record.skill_id, kind = types.PROJECTION_KIND})
end

local function define_tests()
    test.describe("artifact manifests stored by earlier releases", function()
        test.it("transfers historical file bytes through normal migrations", function()
            local executor, owner = test_identity.executor("artifact_bundle_owner")
            local skill_id, create_err = executor:call("kickside.skills:skill_create", {
                name = "historical-bundle", description = "A historical artifact manifest.", body = "Initial version.",
            })
            test.is_nil(create_err, tostring(create_err)); test.not_nil(skill_id)
            local bytes = "historical\0bundle\255bytes"
            local upload, upload_err = upload_record_repo.create(skill_id, owner, #bytes,
                "application/octet-stream", "app:uploads", "fixture.bin", "skills", {}, "completed")
            test.is_nil(upload_err, tostring(upload_err)); test.not_nil(upload)
            local artifact, artifact_err = artifact_content_repo.create_artifact({upload_id = skill_id,
                kind = "file", role = "primary", mime_type = "application/octet-stream", content = bytes})
            test.is_nil(artifact_err, tostring(artifact_err)); test.not_nil(artifact)
            local record = {skill_id = skill_id, version = 2, body = "Read the guide.", file_count = 1,
                bundle_size = #bytes, files = {{path = "guide.bin", kind = "asset", size_bytes = #bytes,
                    sha256 = hash.sha256(bytes), artifact_id = artifact.artifact_id}}}
            local _, seed_err = executor:call("app.hub_update:seed_bundle", record)
            test.is_nil(seed_err, tostring(seed_err))
            normal_update()
            local file, read_err = executor:call("kickside.skills:skill_read_file", {skill_id = skill_id, path = "guide.bin", version = 2})
            test.is_nil(read_err, tostring(read_err)); test.not_nil(file)
            test.eq(file.content, bytes)
            normal_update()
            local again, again_err = executor:call("kickside.skills:skill_read_file", {skill_id = skill_id, path = "guide.bin", version = 2})
            test.is_nil(again_err, tostring(again_err)); test.eq(again.content, bytes)
            test.eq(assert(artifact_content_repo.read_artifact_content(skill_id, artifact.artifact_id)), bytes)
        end)
    end)
end
return {run = test.run_cases(define_tests), seed = seed}
