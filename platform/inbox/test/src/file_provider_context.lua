-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: { [string]: any } = {}
function M.locked(err: any): boolean return errors.is(err, errors.PERMISSION_DENIED) or errors.is(err, errors.NOT_FOUND) end
function M.open(_ref: any): (any?, any?)
    M.calls = M.calls + 1
    return { get_content = function(_self: any, _args: any): (any?, any?)
        if M.denied then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "private filename" }) end
        return { content = "file bytes", content_type = "text/plain" }, nil
    end }, nil
end
return M
