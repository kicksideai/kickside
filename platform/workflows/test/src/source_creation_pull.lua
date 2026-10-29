-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function pull()
    return {items = {{item_key = "item", dedup_key = "item:1", op = "upsert", payload = {sku = "item", quantity = 1}}}, has_more = false}
end
return {pull = pull}
