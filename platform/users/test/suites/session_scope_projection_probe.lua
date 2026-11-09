-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local http = require("http")
local M = {}

function M.resolve(): ()
    local request, response = http.request(), http.response()
    local body, body_err = request:body_json()
    if body_err then
        response:set_status(400)
        response:write_json({error = tostring(body_err)})
        return
    end
    local resolved, resolve_err = funcs.call("kickside.security.runtime:resolve_groups", body)
    if resolve_err then
        response:set_status(500)
        response:write_json({error = tostring(resolve_err)})
        return
    end
    response:write_json(resolved)
end

return M
