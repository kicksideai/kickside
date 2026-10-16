local fixture = require("fixture")
local function builder(stage)
    local q: any = {}
    for _, name in ipairs({"set", "where", "run_with", "set_map"}) do q[name] = function(self, ...) return self end end
    function q:exec()
        if stage == "owner_update" then fixture.owner_updates = fixture.owner_updates + 1
        else fixture.owner_inserts = fixture.owner_inserts + 1 end
        if fixture.stage == stage then return nil, fixture.source end
        return {rows_affected = fixture.owner_missing and 0 or 1}, nil
    end
    return q
end
return {builder = {update = function(...) return builder("owner_update") end, insert = function(...) return builder("owner_insert") end}}
