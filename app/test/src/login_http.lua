local M = {}
M.STATUS = {INTERNAL_ERROR = 500, OK = 200}
function M.request() return {header = function() return nil end} end
function M.response()
    return {set_status = function() end, set_content_type = function() end,
        write = function() end, set_header = function() end}
end
return M
