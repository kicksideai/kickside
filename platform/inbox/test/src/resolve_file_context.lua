-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: { [string]: any } = {}
M.CONTENT = { JSON = "application/json" }
M.STATUS = { OK = 200, UNAUTHORIZED = 401, BAD_REQUEST = 400 }
function M.request(): any
    return {
        param = function(_self: any, key: string): string return key == "id" and "review" or "approve" end,
        body = function(): string return "" end,
    }
end
function M.response(): any
    M.output, M.status, M.committed, M.file_reads = nil, nil, false, 0
    return {
        set_content_type = function() end,
        set_status = function(_self: any, value: integer) M.status = value end,
        write_json = function(_self: any, value: any) M.output = value end,
    }
end
function M.actor(): any return {} end
function M.apply(): (any?, any?)
    M.committed = true
    return { id = "review", status = "approved", action = "approve",
        files = { { component_id = "private:provider", context = { secret = "private" } } } }, nil
end
function M.list(): (any?, any?)
    M.file_reads = M.file_reads + 1
    return nil, errors.new({ kind = errors.UNAVAILABLE, message = "file provider unavailable" })
end
return M
