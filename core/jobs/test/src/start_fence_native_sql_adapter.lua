local native = require("sql")
local fixture = require("fixture")
type DB = native.DB
type Transaction = native.Transaction
local function builder(table_name, operation)
    local query = {}
    function query:set(...) return self end
    function query:where(...) return self end
    function query:run_with(tx) self.tx = tx; return self end
    function query:exec(): (any, error?)
        local stage = operation == "delete" and "delete" or
            (table_name == "kickside_job" and (fixture.mode == "mark" and "lock" or "update") or "update")
        return self.tx:execute(stage)
    end
    return query
end
return {type = native.type, builder = {
    update = function(name) return builder(name, "update") end,
    delete = function(name) return builder(name, "delete") end,
    eq = function(value) return value end,
    expr = function(value, ...) return value end,
}}
