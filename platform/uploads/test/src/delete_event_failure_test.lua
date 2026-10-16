local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local errors = require("errors")
local records = require("upload_record_repo")
local uploads = require("upload_lib")
local events = require("uploads_events")

local function count(table_name: string, id: string): integer
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name
        .. " WHERE " .. (table_name == "kickside_uploads" and "uuid" or "upload_id") .. "=$1", { id })
    db:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local run_cases = test.run_cases(function()
    test.describe("uploads deletion event failure", function()
        test.it("keeps the owner row and live model when deletion cannot be published", function()
            local id = uuid.v4()
            local owner = "upload-event-failure:" .. uuid.v4()
            local created, create_err = records.create(id, owner, 1, "text/plain",
                "app:uploads", id .. ".txt", "text", {}, "uploaded")
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(created)
            local db = assert(sql.get("app:db"))
            local _, insert_err = db:execute([[INSERT INTO kickside_upload_read_model
                (upload_id,component_id,status) VALUES ($1,$2,'completed')]], { id, "owner:" .. owner })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))

            local original = events.emit
            events.emit = function()
                return nil, errors.new({ message = "injected append failure", kind = errors.UNAVAILABLE })
            end
            local deleted, delete_err = uploads.delete_upload(id)
            events.emit = original
            test.is_nil(deleted)
            test.is_true(errors.is(delete_err, errors.UNAVAILABLE), tostring(delete_err))
            test.eq(count("kickside_uploads", id), 1)
            test.eq(count("kickside_upload_read_model", id), 1)

            events.emit = function() return true, nil end
            local retried, retry_err = uploads.delete_upload(id)
            events.emit = original
            test.is_nil(retry_err, tostring(retry_err))
            test.not_nil(retried)
            test.eq(count("kickside_uploads", id), 0)

            db = assert(sql.get("app:db"))
            local _, model_err = db:execute("DELETE FROM kickside_upload_read_model WHERE upload_id=$1", { id })
            db:release()
            test.is_nil(model_err, tostring(model_err))
        end)
    end)
end)

return { run = run_cases }
