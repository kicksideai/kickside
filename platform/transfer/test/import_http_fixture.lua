local state = require("state")
local M = { CONTENT = { JSON = "application/json", MULTIPART = "multipart/form-data" },
    STATUS = { UNAUTHORIZED = 401, BAD_REQUEST = 400, INTERNAL_ERROR = 500, OK = 200 } }
function M.actor() return {} end
function M.response()
    return {
        set_content_type = function() end,
        set_status = function(_self, status) M.status = status end,
        write_json = function(_self, body) M.body = body end,
        set_header = function() end,
        set_transfer = function() end,
        write = function(_self, bytes) M.body = (M.body or "") .. bytes end,
        flush = function() end,
    }
end
function M.request()
    return {
        is_content_type = function() return true end,
        parse_multipart = function()
            return { files = { file = {{ size = function() return 1 end, stream = function() return "stream", nil end }} } }, nil
        end,
        query = function() return "" end,
        body = function() return '{"component_ids":["original-component"]}', nil end,
    }
end
function M.import_file()
    local err = state.failure("import")
    if err then return nil, err end
    return { created = {}, warnings = {} }, nil
end
return M
