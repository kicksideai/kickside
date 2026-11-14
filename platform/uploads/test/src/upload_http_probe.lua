local ctx = require("ctx")
local M = { CONTENT = { JSON = "application/json", MULTIPART = "multipart/form-data" }, STATUS = {
    OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, FORBIDDEN = 403, NOT_FOUND = 404, INTERNAL_ERROR = 500 },
    upload_id = nil :: string?, status = nil :: number?, body = nil :: any? }
function M.request()
    return { param = function() return ctx.get("upload_id") or M.upload_id end,
        method = function() return ctx.get("storage_method") or "GET" end,
        body_json = function() return ctx.get("storage_body"), nil end,
        is_content_type = function(_, content_type) return content_type == M.CONTENT.MULTIPART end,
        parse_multipart = function()
            local bytes = ctx.get("upload_bytes")
            return { values = {}, files = { file = { {
                name = function() return ctx.get("upload_filename") end,
                header = function() return "text/plain" end,
                size = function() return #bytes end,
                stream = function() return bytes end,
            } } } }
        end,
        query = function(_, key) return key == "token" and ctx.get("upload_token") or nil end }
end
function M.response()
    return { set_content_type = function() end,
        set_status = function(_, status) M.status = status end,
        write_json = function(_, body) M.body = body end,
        set_header = function() end, write = function(_, body) M.body = (M.body or "") .. body end }
end
function M.reset() M.status = nil; M.body = nil end
return M
