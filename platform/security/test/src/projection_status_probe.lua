-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local api_errors = require("api_errors")
local handler = require("projection_status")

local function run()
    local response = {}
    local output = {
        set_content_type = function() end,
        set_status = function(_, status) response.status = status end,
        write_json = function(_, body) response.body = body end,
    }
    local original = api_errors.context
    api_errors.context = function() return output, {}, nil end
    local ok, result, err = pcall(handler.handler)
    api_errors.context = original
    if not ok then error(result) end
    if err then return nil, err end
    return response, nil
end

return {run = run}
