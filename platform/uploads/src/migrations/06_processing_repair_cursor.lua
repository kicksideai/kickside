return require("migration").define(function()
    migration("06 processing repair cursor", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            database(engine, function()
                up(function(db)
                    for _, statement in ipairs({
                        "CREATE TABLE IF NOT EXISTS kickside_upload_processing_repair (id INTEGER PRIMARY KEY CHECK (id=1), after_id TEXT NOT NULL DEFAULT '')",
                        "INSERT INTO kickside_upload_processing_repair(id) VALUES (1) ON CONFLICT (id) DO NOTHING",
                        "CREATE INDEX IF NOT EXISTS idx_upload_processing_repair_window ON kickside_uploads(uuid) WHERE storage_state='uploaded'",
                    }) do
                        local _, err = db:execute(statement)
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
