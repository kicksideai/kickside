local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
local insert_stages = {"component", "access", "audit", "owner", "metadata"}
local function builder(operation)
    local q: any = {}
    for _, name in ipairs({"set", "where", "run_with", "set_map", "suffix"}) do q[name] = function(self, ...) return self end end
    function q:exec()
        local stage
        if operation == "insert" then fixture.inserts = fixture.inserts + 1; stage = insert_stages[fixture.inserts]
        else fixture.updates = fixture.updates + 1; stage = fixture.updates == 1 and "placement" or "descendant" end
        if fixture.stage == stage then return nil, fixture.source end
        if stage == "audit" and fixture.stage == "audit-proof" then
            if fixture.audit_reply == nil then return nil, nil end
            return {rows_affected = fixture.audit_reply}, nil
        end
        return {rows_affected = 1}, nil
    end
    return q
end
return {as = sql.as, builder = {insert = function(...) return builder("insert") end, update = function(...) return builder("update") end}}
