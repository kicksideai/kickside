-- Template for the migration a hot install adds alongside new code: it creates
-- the schema the upgraded code converges against by lifting the refusal the
-- boot test installs on the lifecycle thread's retention policy.

local TRIGGER = "lifecycle_boot_pending_schema"

return require("migration").define(function()
    migration("lifecycle boot pending schema", function()
        database("postgres", function()
            up(function(db)
                local _, trigger_err = db:execute("DROP TRIGGER " .. TRIGGER .. " ON kickside_retention_policy")
                if trigger_err then error(trigger_err) end
                local _, function_err = db:execute("DROP FUNCTION " .. TRIGGER .. "()")
                if function_err then error(function_err) end
            end)
            down(function(_db) end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, trigger_err = db:execute("DROP TRIGGER " .. TRIGGER)
                if trigger_err then error(trigger_err) end
            end)
            down(function(_db) end)
        end)
    end)
end)
