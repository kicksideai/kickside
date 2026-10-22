local test = require("test")
local uuid = require("uuid")
local errors = require("errors")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_record_repo = require("upload_record_repo")
local upload_query_repo = require("upload_query_repo")
local artifact_content_repo = require("artifact_content_repo")
local upload_read_model = require("upload_read_model")
local upload_types = require("upload_types")
local resources = require("uploads_resources")

local function define_tests()
    test.describe("upload_record_repo.create", function()
        test.it("deletes an already removed record idempotently", function()
            local removed, err = upload_record_repo.delete(uuid.v4())
            test.is_nil(err)
            test.not_nil(removed)
            test.is_true(removed.deleted)
        end)

        test.it("rejects corrupt artifact and chunk JSON without replacing persisted values", function()
            local id = uuid.v4()
            test.not_nil((upload_record_repo.create(id, "json-owner", 1, "text/plain",
                "app:uploads", "unit/" .. id, "text", {}, "completed")))
            local db = assert(resources.get_db())
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_upload_artifacts
                (artifact_id,upload_id,kind,role,mime_type,locator,metadata) VALUES ($1,$1,'text','part','text/plain','{}','{}')]], {id})))
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_upload_chunks
                (chunk_id,upload_id,kind,content,locator,metadata) VALUES ($1,$1,'text','body','{}','{}')]], {id})))
            for _, field in ipairs({"locator", "metadata"}) do
                test.is_nil(select(2, db:execute("UPDATE kickside_upload_artifacts SET " .. field .. "=$1 WHERE artifact_id=$2", {"{broken", id})))
                for _, read in ipairs({function() return artifact_content_repo.get_artifact(id, id) end,
                    function() return artifact_parts_repo.list_artifacts(id) end,
                    function() return artifact_parts_repo.count_artifact_parts(id) end,
                    function() return artifact_parts_repo.list_artifact_parts(id, 20, 0) end}) do
                    local value, err = read()
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                end
                test.is_nil(select(2, db:execute("UPDATE kickside_upload_artifacts SET " .. field .. "='{}' WHERE artifact_id=$1", {id})))
                test.is_nil(select(2, db:execute("UPDATE kickside_upload_chunks SET " .. field .. "=$1 WHERE chunk_id=$2", {"{broken", id})))
                for _, read in ipairs({function() return artifact_parts_repo.list_chunks(id) end,
                    function() return artifact_parts_repo.list_chunk_summaries(id) end}) do
                    local value, err = read()
                    test.is_nil(value)
                    test.is_true(errors.is(err, errors.INTERNAL))
                end
                test.is_nil(select(2, db:execute("UPDATE kickside_upload_chunks SET " .. field .. "='{}' WHERE chunk_id=$1", {id})))
            end
            db:release()
            test.not_nil((upload_record_repo.delete(id)))
        end)

        test.it("rejects malformed lifecycle bodies before writing the read model", function()
            local counts, err = upload_read_model.apply_events("json-component", {
                {type = upload_types.EVENT.COMPLETED, body = "{broken", seq = 1},
            })
            test.is_nil(counts)
            test.is_true(errors.is(err, errors.INTERNAL))
        end)

        test.it("reports an existing upload id as a typed conflict", function()
            local upload_id = "upload-repo-conflict-" .. uuid.v4()
            local created, create_err = upload_record_repo.create(
                upload_id,
                "actor-" .. uuid.v4(),
                12,
                "text/plain",
                "app:uploads",
                "unit/" .. upload_id,
                "text",
                {},
                "completed"
            )
            test.is_nil(create_err)
            test.not_nil(created)

            local duplicate, duplicate_err = upload_record_repo.create(
                upload_id,
                "other-actor-" .. uuid.v4(),
                12,
                "text/plain",
                "app:uploads",
                "unit/" .. upload_id .. "-other",
                "text",
                {},
                "completed"
            )
            upload_record_repo.delete(upload_id)

            test.is_nil(duplicate)
            test.not_nil(duplicate_err)
            test.is_true(errors.is(duplicate_err, errors.CONFLICT))
        end)

        test.it("reports missing primary content as typed not found", function()
            local content, err = artifact_parts_repo.read_primary_content("no-primary-" .. uuid.v4())
            test.is_nil(content)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("refuses a dedup hit whose persisted metadata is corrupt", function()
            local upload_id = "upload-corrupt-" .. uuid.v4()
            local actor = "actor-" .. uuid.v4()
            local digest = uuid.v4()
            local created, create_err = upload_record_repo.create(upload_id, actor, 12,
                "text/plain", "app:uploads", "unit/" .. upload_id, "text", {}, "completed", digest)
            test.is_nil(create_err)
            test.not_nil(created)
            local db = select(1, resources.get_db())
            test.not_nil(db)
            local _, corrupt_err = (db :: any):execute(
                "UPDATE kickside_uploads SET metadata = $1 WHERE uuid = $2", { "{broken", upload_id })
            ;(db :: any):release()
            test.is_nil(corrupt_err)
            local fetched, fetch_err = upload_query_repo.get(upload_id)
            test.is_nil(fetched)
            test.is_true(errors.is(fetch_err, errors.INTERNAL))
            local duplicate, duplicate_err = upload_record_repo.create("other-" .. uuid.v4(), actor,
                12, "text/plain", "app:uploads", "unit/other", "text", {}, "completed", digest)
            upload_record_repo.delete(upload_id)
            test.is_nil(duplicate)
            test.not_nil(duplicate_err)
            test.is_true(errors.is(duplicate_err, errors.INTERNAL))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
