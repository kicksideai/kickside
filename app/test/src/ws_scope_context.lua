-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local headers = {}
return {
    METHOD = {GET = "GET"},
    headers = headers,
    request = function() return {method = function() return "GET" end} end,
    response = function() return {
        set_header = function(_, key, value) headers[key] = value end,
        set_status = function() end, write_json = function() end,
    } end,
}
