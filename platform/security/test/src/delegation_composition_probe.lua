local scopes = require("scopes")
local composition = require("composition")
local sql = require("sql")
local json = require("json")
local M = {}
function M.run(args)
    local original = composition.authorize_mutation
    local calls = 0
    if args.race then
        composition.authorize_mutation = function(ids, gate, retained)
            local result, err = original(ids, gate, retained)
            calls = calls + 1
            if not err and calls == (args.operation == "delete" and 1 or 2) then
                local db = assert(sql.get("app:db"))
                local _, write_err = db:execute("UPDATE kickside_security_scopes SET policies=$1 WHERE slug=$2",
                    {assert(json.encode({"app:managed_execution_delegation"})), args.slug})
                db:release()
                assert(not write_err, tostring(write_err))
            end
            return result, err
        end
    end
    local ok, result, err, committed = pcall(function()
        if args.operation == "delete" then return scopes.delete(args.slug) end
        return scopes.upsert(args, "forged-grantor")
    end)
    composition.authorize_mutation = original
    if not ok then error(result) end
    return result, err, committed
end
return M
