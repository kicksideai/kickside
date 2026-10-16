local sql = require("sql")
local fixture = require("fixture")
return {get = fixture.get, builder = {expr = sql.builder.expr, select = function(...)
    local query: any = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:order_by(...) return self end
    function query:run_with(...) return self end
    function query:query() return fixture.meta() end
    return query
end}}
