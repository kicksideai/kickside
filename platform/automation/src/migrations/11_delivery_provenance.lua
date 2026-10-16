return require("migration").define(function()
    migration("11 delivery provenance", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    for _, statement in ipairs({
                        "ALTER TABLE kickside_automation_drive ADD COLUMN admission_json TEXT",
                        "ALTER TABLE kickside_automation_prepared ADD COLUMN execution_identity_json TEXT",
                        "ALTER TABLE kickside_trigger_item_ledger ADD COLUMN execution_identity_json TEXT",
                        "ALTER TABLE kickside_trigger_item_ledger ADD COLUMN identity_parked BOOLEAN NOT NULL DEFAULT false",
                    }) do
                        local _, err = db:execute(statement)
                        if err then error(tostring(err)) end
                    end
                end)
            end)
        end
    end)
end)
