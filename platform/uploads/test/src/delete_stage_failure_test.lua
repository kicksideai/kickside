local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local errors = require("errors")
local records = require("upload_record_repo")
local uploads = require("upload_lib")
local pipeline = require("pipeline_lib")
local events = require("uploads_events")

local function count(id: string): integer
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_uploads WHERE uuid=$1", { id })
    db:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local run_cases = test.run_cases(function()
    test.describe("uploads delete-stage failure", function()
        test.it("retains the upload until its on_delete stage succeeds", function()
            local id = uuid.v4()
            local owner = "upload-stage-failure:" .. uuid.v4()
            local created, create_err = records.create(id, owner, 1, "application/zip",
                "app:uploads", id .. ".zip", "kickside.uploads.archive:types.archive", {}, "completed")
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(created)

            local original_executor = pipeline.upload_stage_executor
            local original_emit = events.emit
            local stage_calls = 0
            pipeline.upload_stage_executor = function()
                return { call = function()
                    stage_calls = stage_calls + 1
                    if stage_calls == 1 then return nil, "injected stage failure" end
                    return { success = true }, nil
                end }, nil
            end
            events.emit = function() return true, nil end
            local failed, delete_err = uploads.delete_upload(id)
            pipeline.upload_stage_executor = original_executor
            events.emit = original_emit
            test.is_nil(failed)
            test.is_true(errors.is(delete_err, errors.UNAVAILABLE), tostring(delete_err))
            test.eq(count(id), 1)

            pipeline.upload_stage_executor = function()
                return { call = function()
                    stage_calls = stage_calls + 1
                    return { success = true }, nil
                end }, nil
            end
            events.emit = function() return true, nil end
            local deleted, retry_err = uploads.delete_upload(id)
            pipeline.upload_stage_executor = original_executor
            events.emit = original_emit
            test.is_nil(retry_err, tostring(retry_err))
            test.not_nil(deleted)
            test.eq(stage_calls, 2)
            test.eq(count(id), 0)
        end)
    end)
end)

return { run = run_cases }
