local ctx = require("ctx")
local M = { CONTENT = { JSON = "application/json" }, STATUS = {
    OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, FORBIDDEN = 403, NOT_FOUND = 404, INTERNAL_ERROR = 500 } }
function M.request()
    return { param = function() return ctx.get("upload_id") end,
        method = function() return ctx.get("storage_method") or "GET" end,
        body_json = function() return ctx.get("storage_body"), nil end,
        query = function() return nil end }
end
function M.response()
    return { set_content_type = function() end,
        set_status = function(_, status) M.status = status end,
        write_json = function(_, body) M.body = body end,
        set_header = function() end, write = function(_, body) M.body = (M.body or "") .. body end }
end
function M.reset() M.status = nil; M.body = nil end
return M
