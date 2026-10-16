-- Empty Lua tables default to JSON arrays. Use KickSide's map-capacity convention
-- at storage and response boundaries for metadata and form objects.
local canonical_json = require("canonical_json")
local M = { object = canonical_json.object }
function M.item(item: any): any
    item.metadata = M.object(item.metadata)
    if item.form ~= nil then item.form = M.object(item.form) end
    return item
end
return M
