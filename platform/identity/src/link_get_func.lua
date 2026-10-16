local link_service = require("link_service")

local M = {}

function M.get(args: any): (any?, error?)
    local link_id = type(args) == "table" and (args :: any).link_id or nil
    return link_service.link_get(link_id)
end

return M
