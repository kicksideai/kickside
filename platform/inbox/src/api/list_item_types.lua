-- GET /inbox/item-types — the declared inbox item types and their render metadata
-- (icon, category, component tag/path), so the UI renders each item via its
-- item type's web component without hardcoding the set.

local http = require("http")
local item_types = require("inbox_item_types")

local function handler()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, item_types = item_types.all() })
end

return { handler = handler }
