local test = require("test")
local uuid = require("uuid")
local records = require("records")
local query = require("query")
local uploads = require("uploads")
local pipeline = require("pipeline")
local teardown = require("teardown")
local context = require("context")

return {run = test.run_cases(function()
    test.describe("owner teardown distinguishes a missing upload from a failed delete stage", function()
        test.it("stops on a nested NOT_FOUND while retaining the upload for retry", function()
            local id = uuid.v4()
            context.owner = "teardown-stage:" .. uuid.v4()
            local created, create_err = records.create(id, context.owner, 1, "application/zip",
                "app:uploads", id .. ".zip", "kickside.uploads.archive:types.archive", {}, "completed")
            test.is_nil(create_err)
            test.not_nil(created)
            local original = pipeline.upload_stage_executor
            local calls = 0
            pipeline.upload_stage_executor = function()
                return {call = function()
                    calls = calls + 1
                    -- A second call bounds the pre-fix loop so the regression cannot hang.
                    return nil, errors.new({kind = calls == 1 and errors.NOT_FOUND or errors.UNAVAILABLE,
                        message = "delete-stage dependency is missing"})
                end}, nil
            end
            local ok, result = pcall(teardown.handle, {})
            pipeline.upload_stage_executor = original
            local retained, read_err = query.get(id)
            local _, cleanup_err = records.delete(id)
            test.is_nil(cleanup_err)
            test.is_true(ok, tostring(result))
            test.is_false(result.success)
            test.is_true(errors.is(result.error, errors.NOT_FOUND), tostring(result.error))
            test.eq(calls, 1, "owner teardown must not repeat a failed stage")
            test.eq(result.deleted, 0)
            test.is_nil(read_err)
            test.not_nil(retained)
        end)

        test.it("accepts NOT_FOUND when another deletion really removed the listed upload", function()
            local id = uuid.v4()
            context.owner = "teardown-concurrent:" .. uuid.v4()
            test.not_nil((records.create(id, context.owner, 1, "text/plain",
                "app:uploads", id .. ".txt", "text", {}, "completed")))
            local original = uploads.delete_upload
            local calls = 0
            uploads.delete_upload = function(upload_id: string)
                calls = calls + 1
                local _, err = records.delete(upload_id)
                if err then return nil, err end
                return nil, errors.new({kind = errors.NOT_FOUND, message = "concurrently removed"})
            end
            local ok, result = pcall(teardown.handle, {})
            uploads.delete_upload = original
            test.is_true(ok, tostring(result))
            test.is_true(result.success)
            test.eq(result.deleted, 1)
            test.eq(calls, 1)
            local missing, read_err = query.get(id)
            test.is_nil(missing)
            test.is_true(errors.is(read_err, errors.NOT_FOUND))
        end)
    end)
end)}
