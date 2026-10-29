-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local function describe()
    return {context_schema = {
        type = "object", required = {"record_id"},
        properties = {record_id = {type = "string"}, category = {type = "string", enum = {ctx.get("component_id")}}},
    }}
end
return {describe = describe}
