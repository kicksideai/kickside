local sql = require("sql")
local uuid = require("uuid")
local fs = require("fs")
local funcs = require("funcs")
local test = require("test")
local cleanup = require("artifact_cleanup_repo")

local function db(): any
    local opened, err = sql.get("app:db")
    if err or not opened then error(tostring(err)) end
    return opened
end

local function exec(statement: string, args: { any }): ()
    local opened = db()
    local _, err = opened:execute(statement, args)
    opened:release()
    test.is_nil(err, tostring(err))
end

local function count(id: string): integer
    local opened = db()
    local rows, err = opened:query("SELECT COUNT(*) AS n FROM kickside_upload_artifact_blobs WHERE blob_id=$1", { id })
    opened:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local function blob(age: string): (string, string)
    local id = uuid.v4()
    local path = "orphan-retention-" .. id .. ".txt"
    local storage = assert(fs.get("app:uploads"))
    local _, write_err = storage:writefile(path, "orphan bytes")
    test.is_nil(write_err, tostring(write_err))
    exec([[INSERT INTO kickside_upload_artifact_blobs
        (blob_id,checksum,mime_type,size,storage_id,storage_path,created_at,updated_at)
        VALUES ($1,$2,'text/plain',12,'app:uploads',$3,$4,$4)]], { id, id, path, age })
    return id, path
end

return test.run_cases(function()
    test.describe("upload orphan blob retention", function()
        test.it("drains old unreferenced blobs in bounded batches while preserving shared and recent bytes", function()
            test.not_nil(cleanup.prune_orphan_blobs)
            -- Future fixture dates isolate manual batches from the live retention sweeper.
            local old_a, path_a = blob("2998-01-01T00:00:00Z")
            local old_b, path_b = blob("2998-01-01T00:00:00Z")
            local live, live_path = blob("2998-01-01T00:00:00Z")
            local recent, recent_path = blob("2999-01-01T00:00:00Z")
            local upload = uuid.v4()
            exec([[INSERT INTO kickside_uploads
                (uuid,actor_id,size,mime_type,storage_state,storage_id,storage_path,type_id)
                VALUES ($1,'blob-retention',1,'text/plain','completed','app:uploads',$1,'text')]], { upload })
            exec([[INSERT INTO kickside_upload_artifacts
                (artifact_id,upload_id,blob_id,kind,mime_type)
                VALUES ($1,$2,$3,'derived','text/plain')]], { uuid.v4(), upload, live })

            local first, first_err = cleanup.prune_orphan_blobs("2998-12-31T00:00:00Z", 1)
            test.is_nil(first_err, tostring(first_err))
            test.eq(first, 1)
            local second, second_err = cleanup.prune_orphan_blobs("2998-12-31T00:00:00Z", 1)
            test.is_nil(second_err, tostring(second_err))
            test.eq(second, 1)
            local storage = assert(fs.get("app:uploads"))
            test.eq(count(old_a) + count(old_b), 0)
            test.is_nil((storage:readfile(path_a)))
            test.is_nil((storage:readfile(path_b)))
            test.eq(count(live), 1)
            test.eq(storage:readfile(live_path), "orphan bytes")
            test.eq(count(recent), 1)
            test.eq(storage:readfile(recent_path), "orphan bytes")

            exec("DELETE FROM kickside_upload_artifacts WHERE upload_id=$1", { upload })
            exec("DELETE FROM kickside_uploads WHERE uuid=$1", { upload })
            exec("DELETE FROM kickside_upload_artifact_blobs WHERE blob_id=$1 OR blob_id=$2", { live, recent })
            storage:remove(live_path)
            storage:remove(recent_path)
        end)

        test.it("runs orphan collection from the existing uploads retention callback", function()
            local id, path = blob("1900-01-01T00:00:00Z")
            local result, call_err = funcs.new():call("kickside.uploads:retention", {})
            test.is_nil(call_err, tostring(call_err))
            test.is_true(result.success, tostring(result.error))
            test.eq(count(id), 0)
            test.is_nil((assert(fs.get("app:uploads")):readfile(path)))
        end)
    end)
end)
