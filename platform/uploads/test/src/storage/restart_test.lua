-- Run this entry twice against the same dedicated SQLite file or PostgreSQL
-- database. The first process leaves a placed original; the second process must
-- reconstruct its overlay from SQL and read it with placement disabled.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local fs = require("fs")
local registry = require("registry")
local funcs = require("funcs")
local contract = require("contract")
local env = require("env")
local records = require("records")
local locations = require("locations")
local policy = require("policy")
local offload = require("offload")
local resources = require("resources")
local OWNER, STORAGE = "storage-restart-test", "app:uploads"
local BYTES = "Durable placement survives a cold runtime and source resource edits."

return { run = test.run_cases(function()
    test.describe("storage cold restart", function()
        test.it("prepares a durable placement or verifies its reconstruction in a fresh runtime", function()
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT * FROM kickside_uploads WHERE actor_id=$1", { OWNER }))
            db:release()
            if #rows == 0 then
                local settings = assert(assert(contract.get("kickside.settings:settings")):open())
                local saved = settings:set({ namespace = "kickside.uploads.storage", key = "policy", value = {
                    mode = "s3", resource_id = "app.upload_storage:s3", prefix = env.get("app.upload_storage:prefix"),
                } })
                test.is_true(saved.success, tostring(saved.error))
                test.is_true(assert(funcs.call("kickside.uploads.storage.service:request", {})).success)
                local id = uuid.v4()
                test.not_nil(assert(fs.get(STORAGE)):writefile(id, BYTES))
                test.not_nil(assert(records.create(id, OWNER, #BYTES, "text/plain", STORAGE, id, "text", {}, "completed")))
                local placed, place_err = offload.place({ storage_id = STORAGE, storage_path = id, mime_type = "text/plain" },
                    assert(policy.current()), nil)
                test.is_nil(place_err, tostring(place_err))
                test.is_true(placed.placed)
                test.is_true(settings:unset({ namespace = "kickside.uploads.storage", key = "policy" }).success)
                test.is_true(assert(funcs.call("kickside.uploads.storage.service:request", {})).success)
            else
                test.eq(#rows, 1)
                local file = rows[1]
                test.eq(assert(policy.current()).mode, "local")
                local location = assert(locations.get("app:db", STORAGE, file.storage_path, nil))
                test.not_nil(registry.get(location.resource_id))
                test.is_false(assert(fs.get(STORAGE)):exists(file.storage_path))
                local storage = assert(resources.get_storage(STORAGE))
                local bytes, read_err = storage:readfile(file.storage_path)
                test.is_nil(read_err, tostring(read_err))
                test.eq(bytes, BYTES)
                test.not_nil(storage:remove(file.storage_path))
                db = assert(sql.get("app:db"))
                local _, delete_err = db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", { file.uuid })
                db:release()
                test.is_nil(delete_err, tostring(delete_err))
                test.eq(assert(offload.prune("2999-01-01T00:00:00Z", 100)), 1)
            end
        end)
    end)
end) }
