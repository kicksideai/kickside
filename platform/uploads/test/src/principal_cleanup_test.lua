local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local upload_record_repo = require("upload_record_repo")
local cleanup_principal = require("cleanup_principal")
local upload_read_model = require("upload_read_model")
local upload_types = require("types")

local function count(actor_id: string): integer
    local db, open_err = sql.get("app:db")
    test.is_nil(open_err, tostring(open_err))
    local rows, read_err = db:query("SELECT COUNT(*) AS n FROM kickside_uploads WHERE actor_id=$1", { actor_id })
    db:release()
    test.is_nil(read_err, tostring(read_err))
    return tonumber(rows[1].n) :: integer
end

local run_cases = test.run_cases(function()
    test.describe("uploads principal cleanup", function()
        test.it("returns typed errors from upload read-model owner cleanup", function()
            local count, err = upload_read_model.delete_for_actor("")
            test.is_nil(count)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("retries read-model owner cleanup after one bounded page", function()
            local actor_id = "upload-model-page-" .. uuid.v4()
            local component_id = upload_types.component_id_for_owner(actor_id)
            local db = assert(sql.get("app:db"))
            for _ = 1, 101 do
                local _, insert_err = db:execute([[INSERT INTO kickside_upload_read_model
                    (upload_id,component_id,status) VALUES ($1,$2,'deleted')]],
                    { uuid.v4(), component_id })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local first = cleanup_principal.run({ principal_id = actor_id })
            db = assert(sql.get("app:db"))
            local rows, read_err = db:query(
                "SELECT COUNT(*) AS n FROM kickside_upload_read_model WHERE component_id=$1", { component_id })
            db:release()
            local remaining = rows and rows[1] and tonumber(rows[1].n)
            local second = cleanup_principal.run({ principal_id = actor_id })
            test.is_false(first.success)
            test.is_true(errors.is(first.error, errors.CONFLICT), tostring(first.error))
            test.is_nil(read_err)
            test.eq(remaining, 1)
            test.is_true(second.success, tostring(second.error))
        end)
        test.it("deletes only the principal's upload rows through their owner path", function()
            local owner, other = "upload-owner-" .. uuid.v4(), "upload-other-" .. uuid.v4()
            local owned_ids: { string } = {}
            for _, actor_id in ipairs({ owner, owner, other }) do
                local id = uuid.v4()
                local row, create_err = upload_record_repo.create(id, actor_id, 1, "text/plain",
                    "app:uploads", id .. ".txt", "text", {}, "uploaded")
                test.is_nil(create_err, tostring(create_err))
                test.not_nil(row)
                if actor_id == owner then owned_ids[#owned_ids + 1] = id end
            end
            local db, open_err = sql.get("app:db")
            test.is_nil(open_err, tostring(open_err))
            local blob_id, artifact_id, chunk_id = uuid.v4(), uuid.v4(), uuid.v4()
            local _, blob_err = db:execute([[INSERT INTO kickside_upload_artifact_blobs
                (blob_id,checksum,mime_type,size,storage_id,storage_path)
                VALUES ($1,$2,'text/plain',1,'app:uploads',$3)]],
                { blob_id, uuid.v4(), blob_id .. ".txt" })
            test.is_nil(blob_err, tostring(blob_err))
            local _, artifact_err = db:execute([[INSERT INTO kickside_upload_artifacts
                (artifact_id,upload_id,blob_id,kind,mime_type)
                VALUES ($1,$2,$3,'derived','text/plain')]], { artifact_id, owned_ids[1], blob_id })
            test.is_nil(artifact_err, tostring(artifact_err))
            local _, chunk_err = db:execute([[INSERT INTO kickside_upload_chunks
                (chunk_id,upload_id,artifact_id,kind,content)
                VALUES ($1,$2,$3,'text','content')]], { chunk_id, owned_ids[1], artifact_id })
            test.is_nil(chunk_err, tostring(chunk_err))
            for _, actor_id in ipairs({ owner, other }) do
                local _, insert_err = db:execute([[INSERT INTO kickside_upload_read_model
                    (upload_id,component_id,status) VALUES ($1,$2,'deleted')]],
                    { uuid.v4(), upload_types.component_id_for_owner(actor_id) })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local result = cleanup_principal.run({ principal_id = owner })
            test.is_true(result.success, tostring(result.error))
            test.eq(count(owner), 0)
            test.eq(count(other), 1)
            db, open_err = sql.get("app:db")
            test.is_nil(open_err, tostring(open_err))
            for _, spec in ipairs({ { "kickside_upload_artifacts", "artifact_id", artifact_id },
                { "kickside_upload_chunks", "chunk_id", chunk_id },
                { "kickside_upload_artifact_blobs", "blob_id", blob_id } }) do
                local rows, read_err = db:query("SELECT COUNT(*) AS n FROM " .. spec[1]
                    .. " WHERE " .. spec[2] .. "=$1", { spec[3] })
                test.is_nil(read_err, tostring(read_err))
                test.eq(tonumber(rows[1].n), 0, spec[1])
            end
            local owner_rows, owner_err = db:query("SELECT upload_id FROM kickside_upload_read_model WHERE component_id=$1",
                { upload_types.component_id_for_owner(owner) })
            local other_rows, other_err = db:query("SELECT upload_id FROM kickside_upload_read_model WHERE component_id=$1",
                { upload_types.component_id_for_owner(other) })
            db:release()
            test.is_nil(owner_err, tostring(owner_err))
            test.is_nil(other_err, tostring(other_err))
            test.eq(#owner_rows, 0)
            test.eq(#other_rows, 1)
            local again = cleanup_principal.run({ principal_id = owner })
            test.is_true(again.success, tostring(again.error))
        end)
    end)
end)

return { run = run_cases }
