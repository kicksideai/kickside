-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local adapter = require("adapter")
return {
	get_storage = function(storage_id)
		return adapter.get(storage_id, "app:db", "app:uploads", "app:objects")
	end,
}
