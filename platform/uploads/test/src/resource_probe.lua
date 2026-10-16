local resources = require("uploads_resources")
return { run = function()
    local db, db_err = resources.get_db()
    if db_err then error(db_err) end
    db:release()
    local storage, storage_err = resources.get_storage()
    if storage_err then error(storage_err) end
    return { database = db ~= nil, storage = storage ~= nil, storage_id = resources.get_storage_id() }
end }
