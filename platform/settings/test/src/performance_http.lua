-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local process = require("process")
local M = {STATUS = {OK = 200}, CONTENT = {JSON = "application/json"}}
function M.request() return {body = function() return ctx.get("performance_body"), nil end} end
function M.response()
    if ctx.get("performance_no_response") then return nil end
    local result = {}
    return {set_status = function(_, status) result.status = status end,
        set_content_type = function(_, value) result.content_type = value end,
        write_json = function(_, body)
            result.body = body
            local _, err = process.send(ctx.get("performance_caller"), "performance.http.result", result)
            if err then error(err) end
        end}
end
return M
