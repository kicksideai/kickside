local native = require("native")
local fixture = require("fixture")
type ReaderState = native.ReaderState
local M = {in_clause = native.in_clause}
M.ReaderState = ReaderState
local function query()
    local value: any = {}
    function value:limit(...) return self end
    function value:run_with(...) return self end
    function value:query() return fixture.query() end
    return value
end
function M.select(...)
    if fixture.stage == "build" then return nil, fixture.source end
    return query(), nil
end
function M.count(...) return query() end
function M.implementation_candidates(...)
    if fixture.stage == "candidate" then error(fixture.source) end
    return query()
end
return M
