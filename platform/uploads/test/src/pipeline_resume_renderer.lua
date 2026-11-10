-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fs = require("fs")

local function render(params)
    local storage = assert(fs.get(params.ref.storage_id))
    local mode = assert(storage:readfile(params.ref.storage_path))
    if params.count_only then
        if mode == "count-error" then return {err = {message = "page count failed"}} end
        return {ok = {total = 2}}
    end
    local pages = {}
    for _, page in ipairs(params.pages) do
        if page == 2 and mode == "render-error" then return {err = {message = "render failed"}} end
        if page ~= 2 or mode ~= "partial" then pages[#pages + 1] = {page = page, bytes = "image" .. page} end
    end
    return {ok = {pages = pages}}
end

return {render = render}
