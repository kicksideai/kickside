-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: { [string]: any } = {}
M.CONTENT = { JSON = "application/json" }
M.STATUS = { OK = 200, UNAUTHORIZED = 401, BAD_REQUEST = 400, INTERNAL_ERROR = 500 }
function M.request()
    local request = {}
    function request:body(): (any, any?) return M.input, nil end
    function request:param(key: string): string? return key == "id" and (M.id :: string) or nil end
    function request:query(key: string): string? return key == "status" and "all" or nil end
    return request
end
function M.response(): any
    return { set_content_type = function() end,
        set_status = function(_self: any, status: integer) M.status = status end,
        write_json = function(_self: any, body: any) M.output = body end }
end
return M
