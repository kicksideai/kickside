local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
local function select(...)
    local q: any = {}
    for _, name in ipairs({"from", "where", "limit", "order_by", "suffix", "run_with"}) do
        q[name] = function(self, ...) return self end
    end
    function q:query() return fixture.rows, fixture.source end
    return q
end
return {type = sql.type, builder = {select = select}}
