local component = require("component")
local teardown = require("teardown")
local sql = require("sql")
local test = require("test")

local function cleanup(id: string): ()
    local released, release_err = component.system_delete(id)
    test.is_true(released)
    if release_err then test.is_true(release_err:details().cleanup_pending) end
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
