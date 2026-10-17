local M = {}
M.CONTENT = {JSON = "application/json"}
M.STATUS = {SERVICE_UNAVAILABLE = 503}
function M.request() return {query = function() return nil end} end
function M.response() return {set_content_type = function() end, set_status = function() end, write_json = function() end} end
return M
