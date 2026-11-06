-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: { [string]: any } = {}
function M.open(_ref: any): (any?, any?)
    M.calls = M.calls + 1
    return { get_info = function(_self: any, args: any): (any?, any?)
        M.info_calls = M.info_calls + 1
        M.info_format = args.format
        if M.info_err then return nil, M.info_err end
        return { size = M.size }, nil
    end, get_content = function(_self: any, _args: any): (any?, any?)
        M.content_calls = M.content_calls + 1
        if M.denied then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "private filename" }) end
        return { content = "file bytes", content_type = "text/plain" }, nil
    end }, nil
end
return M
