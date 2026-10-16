local M: { [string]: any } = {}
M.CONTENT = { JSON = "application/json" }
M.STATUS = { OK = 200, UNAUTHORIZED = 401, BAD_REQUEST = 400, INTERNAL_ERROR = 500, CONFLICT = 409 }
function M.request(): any
    return { param = function(_self, name) return name == "id" and "item" or "dismiss" end,
        body = function() return "", nil end }
end
function M.response(): any
    return { set_content_type = function() end,
        set_status = function(_self, value) M.status = value end,
        write_json = function(_self, value) M.output = value end }
end
return M
