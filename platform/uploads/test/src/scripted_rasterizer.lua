-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fs = require("fs")
local json = require("json")

local function run(req: any): any
    local storage = assert(fs.get(req.ref.storage_id))
    local document = assert(json.decode(assert(storage:readfile(req.ref.storage_path))))
    document.calls = document.calls or {}
    document.calls[#document.calls + 1] = req.count_only and "count" or req.pages
    assert(storage:writefile(req.ref.storage_path, assert(json.encode(document))))
    if req.count_only and not document.count_error then return { ok = { total = document.total } } end
    local failed = document.count_error or document.fail_all
    for _, page in ipairs(req.pages or {}) do
        for _, failing in ipairs(document.fail_pages or {}) do
            if page == failing then failed = true end
        end
    end
    if failed then
        if document.throw then error(document.failure) end
        return { err = document.failure }
    end
    local pages = {}
    for _, page in ipairs(req.pages or {}) do
        pages[#pages + 1] = { page = page, bytes = "\255\216\255page-" .. page }
    end
    return { ok = { pages = pages } }
end

return { run = run }
