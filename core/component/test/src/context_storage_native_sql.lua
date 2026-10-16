local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
local function builder(...)
    local query: any = {columns = {...}}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:limit(...) return self end
    function query:set_map(value) return self end
    function query:set(key, value)
        if key == "private_context" then fixture.written = value end
        return self
    end
    function query:run_with(db) return self end
    function query:query()
        fixture.reads = fixture.reads + 1
        if fixture.stage == "read" then return nil, fixture.source end
        if self.columns[1] == "record_json" then
            if fixture.stage == "replay" then return nil, fixture.source end
            return fixture.records or {}, nil
        end
        if self.columns[1] == "identity_generation" then
            if fixture.stage == "fence" then return nil, fixture.source end
            return {{identity_generation = 7, identity_hash = "hash"}}, nil
        end
        return fixture.rows or {{private_context = fixture.raw, context_revision = 7}}, nil
    end
    function query:exec()
        fixture.writes = fixture.writes + 1
        if fixture.stage == "write" then return nil, fixture.source end
        return {rows_affected = fixture.count}, nil
    end
    return query
end
return {as = sql.as, builder = {select = builder, update = builder, insert = builder, expr = sql.builder.expr}}
