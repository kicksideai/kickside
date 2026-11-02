-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: { [string]: any } = {}
M.CONTENT = { JSON = "application/json" }
function M.request(): any
    return { param = function(_self: any, name: string): string return name == "id" and "item" or "1" end }
end
function M.response(): any
    M.body, M.output, M.headers, M.status = nil, nil, {}, 200
    return {
        set_status = function(_self: any, status: any) M.status = status end,
        set_content_type = function(_self: any, value: any) M.mime = value end,
        set_header = function(_self: any, key: string, value: string) M.headers[key] = value end,
        write_json = function(_self: any, value: any) M.output = value end,
        write = function(_self: any, value: any) M.body = value end,
    }
end
return M
