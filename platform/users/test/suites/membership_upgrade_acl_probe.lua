-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local reader = require("reader")
local security = require("security")
return {read = function(args)
    return reader.new():with_user(security.actor():id()):with_components(args.id):with_access_mask(1):exists()
end}
