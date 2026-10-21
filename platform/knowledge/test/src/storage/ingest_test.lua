local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local fs = require("fs")
local funcs = require("funcs")
local security = require("security")
local contract = require("contract")
local json = require("json")
local env = require("env")
local records = require("records")
local artifacts = require("artifacts")
local cleanup = require("cleanup")
local locations = require("locations")
local offload = require("offload")
local policy = require("policy")
local fixture_cleanup = require("fixture_cleanup")
local DB, STORAGE = "app:db", "app:uploads"

local function execute(statement: string, args: any): ()
    local db = assert(sql.get(DB))
    local _, err = db:execute(statement, args)
    db:release()
    test.is_nil(err, tostring(err))
end

return { run = test.run_cases(function()
    test.describe("Knowledge ingestion of S3-backed uploads", function()
        local upload_id, kb_id
        test.after_all(function()
            if kb_id then fixture_cleanup.cleanup(kb_id) end
            if upload_id then
                local _, err = cleanup.delete_for_upload(upload_id)
                test.is_nil(err, tostring(err))
                execute("DELETE FROM kickside_uploads WHERE uuid=$1", { upload_id })
                local _, prune_err = offload.prune("2999-01-01T00:00:00Z", 100)
                test.is_nil(prune_err, tostring(prune_err))
            end
            local settings = assert(assert(contract.get("kickside.settings:settings")):open())
            test.is_true(settings:unset({ namespace = "kickside.uploads.storage", key = "policy" }).success)
            test.is_true(assert(funcs.call("kickside.uploads.storage.service:request", {})).success)
        end)

        test.it("queues verified remote text and stable image references through the real KB ingest API", function()
            local settings = assert(assert(contract.get("kickside.settings:settings")):open())
            local saved = settings:set({ namespace = "kickside.uploads.storage", key = "policy", value = {
                mode = "s3", resource_id = "app.storage:s3", prefix = env.get("app.storage:prefix"),
            } })
            test.is_true(saved.success, tostring(saved.error))
            test.is_true(assert(funcs.call("kickside.uploads.storage.service:request", {})).success)
            local destination = assert(policy.current())
            local owner = "kb-storage-" .. uuid.v4()
            upload_id, kb_id = uuid.v4(), uuid.v7()
            local path = "kb-storage-" .. upload_id
            local bytes = "Verified knowledge from remote storage. " .. uuid.v4()
            local storage = assert(fs.get(STORAGE))
            test.not_nil(storage:writefile(path, bytes))
            test.not_nil(assert(records.create(upload_id, owner, #bytes, "text/plain", STORAGE,
                path, "text", { filename = "remote.txt" }, "completed")))
            local primary = assert(artifacts.create_artifact({ upload_id = upload_id, kind = "markdown",
                role = "primary", mime_type = "text/markdown", content = bytes, storage_id = STORAGE, metadata = {} }))
            local image = assert(artifacts.create_artifact({ upload_id = upload_id, kind = "image",
                role = "extracted-image", mime_type = "image/png", content = "test image bytes", storage_id = STORAGE, metadata = {} }))
            for _, object in ipairs(assert(locations.objects(DB, upload_id))) do
                local result, err = offload.place(object, destination, nil)
                test.is_nil(err, tostring(err))
                test.is_true(result.placed)
                test.is_false(storage:exists(object.storage_path))
            end

            execute([[INSERT INTO kickside_components(component_id,impl_id,private_context,created_at,updated_at)
                VALUES ($1,'test.kb:embeddable','{}',0,0)]], { kb_id })
            execute([[INSERT INTO kickside_component_access
                (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,inherited,created_at)
                VALUES ($1,$2,'user',$3,$4,15,0,0)]], { uuid.v7(), owner, kb_id, kb_id })
            for key, value in pairs({ class = "knowledge_base", kb_type = "wiki", status = "ready", title = "Remote KB" }) do
                execute([[INSERT INTO kickside_component_meta(meta_id,component_id,key,value,created_at,updated_at)
                    VALUES ($1,$2,$3,$4,0,0)]], { uuid.v7(), kb_id, key, value })
            end
            local actor = assert(security.new_actor(owner, {}))
            local scope = assert(security.new_scope({ assert(security.policy("app:limited_user")),
                assert(security.policy("app:limited_no_process_scope")) }))
            local threads = assert(assert(contract.get("kickside.core:threads")):with_actor(actor):with_scope(scope):open())
            local _, ensure_err = threads:ensure_thread({ component_id = kb_id, impl_id = "app:test_engine_wiki",
                thread_class = "kickside.knowledge.injection" })
            test.is_nil(ensure_err, tostring(ensure_err))
            local result, ingest_err = funcs.new():with_actor(actor):with_scope(scope):call("app:ingest_upload_probe",
                { kb_id = kb_id, upload_id = upload_id })
            test.is_nil(ingest_err, tostring(ingest_err))
            test.not_nil(result.result, result.error)
            local db = assert(sql.get(DB))
            local events, query_err = db:query([[SELECT body FROM kickside_event
                WHERE thread_id=$1 AND type='kickside.knowledge.events:content.upserted' ORDER BY seq]], { kb_id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#events, 1)
            local body = type(events[1].body) == "table" and events[1].body or assert(json.decode(events[1].body))
            test.eq(body.content, bytes)
            test.eq(body.source_ref.upload_id, upload_id)
            test.eq(body.source_ref.artifact_id, primary.artifact_id)
            test.eq(body.metadata.image_artifacts[1].artifact_id, image.artifact_id)
            test.eq(body.metadata.image_artifacts[1].upload_id, upload_id)
            test.is_nil(body.metadata.storage_id)
            test.is_nil(body.source_ref.storage_path)
            test.eq(assert(artifacts.read_artifact_content(upload_id, image.artifact_id)), "test image bytes")
        end)
    end)
end) }
