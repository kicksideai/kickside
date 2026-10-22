local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local fs = require("fs")
local security = require("security")
local provision = require("provision")
local component = require("component")
local records = require("upload_record_repo")
local upload_types = require("types")

local function count(table_name: string, column: string, id: string): integer
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE " .. column .. "=$1", { id })
    db:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local function seed_owner_upload(): any
    local owner = "uploads-component-delete-" .. uuid.v4()
    local db = assert(sql.get("app:db"))
    local _, user_err = db:execute([[INSERT INTO app_users
        (user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], { owner, owner .. "@uploads.test" })
    test.is_nil(user_err, tostring(user_err))
    for _, group_id in ipairs({ "app:uploads_test", "wippy.security:process" }) do
        local _, group_err = db:execute([[INSERT INTO app_user_groups (user_id,group_id)
            VALUES ($1,$2)]], { owner, group_id })
        test.is_nil(group_err, tostring(group_err))
    end
    db:release()
    local actor = security.new_actor(owner, { security_groups = { "app:uploads_test" } })
    local scope = security.named_scope("wippy.security:process")
    local ids, ensure_err = provision.ensure_user(actor, scope, owner)
    test.is_nil(ensure_err, tostring(ensure_err))
    test.not_nil(ids)
    local component_id = assert(upload_types.component_id_for_owner(owner))
    local id = uuid.v4()
    local blob_id, artifact_id, chunk_id = uuid.v4(), uuid.v4(), uuid.v4()
    local storage = assert(fs.get("app:uploads"))
    local _, stored_err = storage:writefile(id .. ".txt", "source bytes")
    test.is_nil(stored_err, tostring(stored_err))
    local _, artifact_stored_err = storage:writefile(blob_id .. ".txt", "derived bytes")
    test.is_nil(artifact_stored_err, tostring(artifact_stored_err))
    local created, create_err = records.create(id, owner, 1, "text/plain",
        "app:uploads", id .. ".txt", "text", {}, "completed")
    test.is_nil(create_err, tostring(create_err))
    test.not_nil(created)
    db = assert(sql.get("app:db"))
    local _, model_err = db:execute([[INSERT INTO kickside_upload_read_model
        (upload_id,component_id,status) VALUES ($1,$2,'completed')]], { id, component_id })
    test.is_nil(model_err, tostring(model_err))
    local _, blob_err = db:execute([[INSERT INTO kickside_upload_artifact_blobs
        (blob_id,checksum,mime_type,size,storage_id,storage_path)
        VALUES ($1,$1,'text/plain',13,'app:uploads',$2)]], { blob_id, blob_id .. ".txt" })
    test.is_nil(blob_err, tostring(blob_err))
    local _, artifact_err = db:execute([[INSERT INTO kickside_upload_artifacts
        (artifact_id,upload_id,blob_id,kind,mime_type)
        VALUES ($1,$2,$3,'derived','text/plain')]], { artifact_id, id, blob_id })
    test.is_nil(artifact_err, tostring(artifact_err))
    local _, chunk_err = db:execute([[INSERT INTO kickside_upload_chunks
        (chunk_id,upload_id,artifact_id,kind,content)
        VALUES ($1,$2,$3,'text','chunk')]], { chunk_id, id, artifact_id })
    db:release()
    test.is_nil(chunk_err, tostring(chunk_err))
    return {
        owner = owner, component_id = component_id, id = id, blob_id = blob_id,
        artifact_id = artifact_id, chunk_id = chunk_id, storage = storage,
    }
end

return test.run_cases(function()
    test.describe("uploads component owner deletion", function()
        test.it("removes upload and materialized rows while the component is deleting", function()
            local seed = seed_owner_upload()
            local deleted, delete_err = component.system_delete(seed.component_id)
            test.is_true(deleted, tostring(delete_err))
            test.is_nil(delete_err, tostring(delete_err))
            test.eq(count("kickside_components", "component_id", seed.component_id), 0, "component row")
            test.eq(count("kickside_uploads", "uuid", seed.id), 0, "upload row")
            test.eq(count("kickside_upload_read_model", "upload_id", seed.id), 0, "materialized row")
            test.eq(count("kickside_upload_artifacts", "artifact_id", seed.artifact_id), 0, "artifact row")
            test.eq(count("kickside_upload_chunks", "chunk_id", seed.chunk_id), 0, "chunk row")
            test.eq(count("kickside_upload_artifact_blobs", "blob_id", seed.blob_id), 0, "blob row")
            test.is_nil((seed.storage:readfile(seed.id .. ".txt")))
            test.is_nil((seed.storage:readfile(seed.blob_id .. ".txt")))
        end)

        test.it("counts an upload that another teardown removes first as deleted", function()
            local db = assert(sql.get("app:db"))
            local dialect = tostring((db:type()))
            db:release()
            if dialect ~= tostring(sql.type.SQLITE) then return end
            local seed = seed_owner_upload()
            -- The trigger removes the upload row while its teardown runs, the same
            -- state a concurrent teardown leaves.
            local trigger = "uploads_teardown_race_" .. seed.id:gsub("-", "_")
            db = assert(sql.get("app:db"))
            local _, trigger_err = db:execute("CREATE TRIGGER " .. trigger
                .. " AFTER DELETE ON kickside_upload_artifacts WHEN OLD.upload_id = '" .. seed.id
                .. "' BEGIN DELETE FROM kickside_uploads WHERE uuid = OLD.upload_id; END")
            db:release()
            test.is_nil(trigger_err, tostring(trigger_err))

            local deleted, delete_err = component.system_delete(seed.component_id)
            db = assert(sql.get("app:db"))
            db:execute("DROP TRIGGER IF EXISTS " .. trigger)
            db:release()
            test.is_true(deleted, tostring(delete_err))
            test.is_nil(delete_err, tostring(delete_err))
            test.eq(count("kickside_components", "component_id", seed.component_id), 0, "component row")
            test.eq(count("kickside_uploads", "uuid", seed.id), 0, "upload row")
            test.eq(count("kickside_upload_read_model", "upload_id", seed.id), 0, "materialized row")
        end)
    end)
end)
