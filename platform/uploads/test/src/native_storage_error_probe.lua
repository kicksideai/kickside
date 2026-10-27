-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local adapter = require("adapter")
return {run = function(args)
    local storage = assert(adapter.get("app:uploads"))
    local value, err = storage:stat(args.kind .. "://app:objects/key")
    return {returned = true, missing = value == nil, denied = errors.is(err, errors.PERMISSION_DENIED),
        not_found = errors.is(err, errors.NOT_FOUND), message = tostring(err)}
end}
