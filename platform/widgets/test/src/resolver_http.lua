local M = {writes = 0}
M.CONTENT = {JSON = "application/json"}
M.STATUS = {UNAUTHORIZED = 401}
function M.request() return {query = function() return "any-class" end} end
function M.response()
    return {set_content_type = function() end, set_status = function() end,
        write_json = function() M.writes = M.writes + 1 end}
end
return M
