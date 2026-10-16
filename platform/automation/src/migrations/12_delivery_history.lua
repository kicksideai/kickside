return require("migration").define(function()
    migration("12 delivery history", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    for _, statement in ipairs({
                        [[CREATE TABLE kickside_automation_delivery_history (
                            automation_id TEXT NOT NULL, drive_key TEXT NOT NULL, round_token TEXT NOT NULL,
                            source_port TEXT NOT NULL, item_key TEXT NOT NULL, identity_key TEXT NOT NULL,
                            state TEXT NOT NULL, execution_identity_json TEXT, error_json TEXT,
                            round_at TEXT NOT NULL, expires_at TEXT NOT NULL,
                            PRIMARY KEY (automation_id, drive_key, round_token, source_port, item_key, identity_key))]],
                        "CREATE INDEX idx_automation_delivery_history_page ON kickside_automation_delivery_history (automation_id, round_at, drive_key, round_token, source_port, item_key, identity_key)",
                        "CREATE INDEX idx_automation_delivery_history_expiry ON kickside_automation_delivery_history (expires_at, automation_id, drive_key, round_token, source_port, item_key, identity_key)",
                    }) do
                        local _, err = db:execute(statement)
                        if err then error(tostring(err)) end
                    end
                end)
            end)
        end
    end)
end)
