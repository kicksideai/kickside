-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")
return {main = function(input)
    local api = assert(assert(contract.get("kickside.uploads:page_images"))
        :with_actor(security.actor()):with_scope(security.scope()):open())
    local _, err = api:read_image(input)
    if err then return nil, err end
    error("blocked renderer returns unexpectedly")
end}
