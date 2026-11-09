-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fs = require("fs")
local M = {}
local fail_remove = false
M.cleanup_error = errors.new({ message = "native temporary removal failed", kind = errors.PERMISSION_DENIED })
M.failed_path = nil
function M.fail_cleanup(value)
	fail_remove = value
end
function M.get(id)
	local volume: any, err = fs.get(id)
	if err then
		return nil, err
	end
	return setmetatable({}, {
		__index = function(_, method)
			return function(_, ...)
				if method == "remove" and fail_remove then
					M.failed_path = select(1, ...)
					return nil, M.cleanup_error
				end
				return volume[method](volume, ...)
			end
		end,
	}),
		nil
end
return M
