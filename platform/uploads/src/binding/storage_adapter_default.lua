-- Default file IO has no dependency on an optional storage extension.
local fs = require("fs")
local M = {}
function M.get(storage_id: string, _db_id: string, _staging_id: string, _legacy_cloud_id: string?, _query_db: any?): (any?, any?)
    return fs.get(storage_id)
end
return M
