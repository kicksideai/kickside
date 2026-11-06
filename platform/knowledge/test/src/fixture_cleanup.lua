local component = require("component")
local teardown = require("teardown")
local sql = require("sql")
local test = require("test")
local time = require("time")

local function cleanup(id: string): ()
    local released, release_err = component.system_delete(id)
    if not released then
        test.not_nil(release_err)
        test.is_true(release_err:details().cleanup_pending)
        local deadline = time.now():add("20s")
        while time.now():before(deadline) do
            local db = assert(sql.get("app:db"))
            local rows, read_err = db:query("SELECT status,last_error FROM kickside_job WHERE owner_kind='component' AND owner_id=$1 ORDER BY created_at DESC LIMIT 1", {id})
            local _, release_err = db:release()
            test.is_nil(read_err, tostring(read_err)); test.is_nil(release_err, tostring(release_err))
            test.not_nil(rows[1], "accepted deletion has a Jobs row")
            test.is_true(rows[1].status ~= "dead", tostring(rows[1].last_error))
            if rows[1].status == "done" then released = true; break end
            time.sleep("10ms")
        end
    end
    test.is_true(released, "component deletion job completes fixture cleanup")
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    local finished = false
    for _ = 1, 40 do
        local result, err = teardown.purge_thread(db, id, nil)
        if err then
            test.is_true(err:details().cleanup_pending)
        else
            test.is_true(result.purged)
            finished = true
            break
        end
    end
    test.is_true(finished)
    for _, table_name in ipairs({ "kickside_components", "kickside_thread" }) do
        local column = table_name == "kickside_components" and "component_id" or "id"
        local rows, read_err = db:query("SELECT " .. column .. " FROM " .. table_name .. " WHERE " .. column .. "=$1", { id })
        test.is_nil(read_err)
        test.eq(#rows, 0)
    end
    local _, release_db_err = db:release()
    test.is_nil(release_db_err)
end
return { cleanup = cleanup }
