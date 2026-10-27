-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function get(args)
    if type(args) ~= "table" or args.namespace ~= "app.capacity" then
        return { success = false, error = "undeclared setting" }
    end
    if args.key == "global_limit" or args.key == "concurrency_key_limit" then
        return { success = true, value = 2 }
    end
    return { success = false, error = "undeclared setting" }
end

return { get = get }
