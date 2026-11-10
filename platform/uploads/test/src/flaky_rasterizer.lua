-- Test-only convert.rasterizer: a three-page document whose page 2 cannot render.
-- Any render request that includes page 2 fails as a whole, like a converter call
-- that exceeds its deadline.
local FAILING_PAGE = 2
local TOTAL = 3

local function run(req: any): any
    req = type(req) == "table" and req or {}
    if req.count_only == true then return { ok = { total = TOTAL } } end
    local pages = {}
    for _, page in ipairs(type(req.pages) == "table" and req.pages or {}) do
        if page == FAILING_PAGE then
            return { err = { message = "render: page " .. tostring(page) .. " exceeded its deadline" } }
        end
        pages[#pages + 1] = { page = page, bytes = "\255\216\255page-" .. tostring(page), format = req.format }
    end
    return { ok = { total = TOTAL, pages = pages } }
end

return { run = run }
