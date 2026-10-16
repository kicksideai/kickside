local test = require("test")
local errors = require("errors")
local uuid = require("uuid")
local uploads = require("upload_lib")
local archive_delete = require("archive_delete")

local run_cases = test.run_cases(function()
    test.describe("archive member deletion", function()
        test.it("classifies an already-deleted upload for archive retries", function()
            local deleted, err = uploads.delete_upload(uuid.v4())
            test.is_nil(deleted)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
        end)

        test.it("reports child failure and can retry after earlier children were removed", function()
            local original = uploads.delete_upload
            local calls: { string } = {}
            uploads.delete_upload = function(id: string)
                calls[#calls + 1] = id
                if id == "child-b" then
                    return nil, errors.new({ message = "injected child failure", kind = errors.UNAVAILABLE })
                end
                return { deleted = true }, nil
            end
            local args = { upload_id = "container", metadata = { child_upload_ids = { "child-a", "child-b" } } }
            local failed, failure_err = archive_delete.handle(args)
            uploads.delete_upload = original
            test.is_nil(failed)
            test.is_true(errors.is(failure_err, errors.UNAVAILABLE), tostring(failure_err))
            test.eq(#calls, 2)

            uploads.delete_upload = function(id: string)
                if id == "child-a" then
                    return nil, errors.new({ message = "Upload not found", kind = errors.NOT_FOUND })
                end
                return { deleted = true }, nil
            end
            local retried, retry_err = archive_delete.handle(args)
            uploads.delete_upload = original
            test.is_nil(retry_err, tostring(retry_err))
            test.is_true(retried.success)
            test.eq(retried.removed, 1)
        end)
    end)
end)

return { run = run_cases }
