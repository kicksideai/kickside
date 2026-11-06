local sql = require("sql")
local M = { type = sql.type, get = sql.get, builder = {}, selections = {} }
setmetatable(M.builder, { __index = sql.builder })
function M.builder.select(...): any
    M.selections[#M.selections + 1] = { ... }
    return sql.builder.select(...)
end
function M.reset() M.selections = {} end
return M
