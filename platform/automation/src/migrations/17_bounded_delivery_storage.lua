return require("migration").define(function()
    migration("17 bounded delivery storage", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local function execute(statement)
                        local _,err=db:execute(statement)
                        if err then error(tostring(err)) end
                    end
                    -- Historical observations are disposable; admission evidence
                    -- remains in the ledger. Drop before allocating new indexes.
                    execute("DROP TABLE kickside_automation_delivery_history")
                    execute([[CREATE TABLE kickside_automation_delivery_history (
                        automation_id TEXT NOT NULL, drive_key TEXT NOT NULL, round_token TEXT NOT NULL,
                        source_port TEXT NOT NULL, item_key TEXT NOT NULL, identity_key TEXT NOT NULL,
                        state TEXT NOT NULL, execution_identity_json TEXT, error_json TEXT, attempt_family TEXT,
                        round_at TEXT NOT NULL, expires_at TEXT NOT NULL,
                        PRIMARY KEY (automation_id,drive_key,round_token,source_port,item_key,identity_key))]])
                    execute([[CREATE INDEX idx_automation_delivery_history_page ON kickside_automation_delivery_history
                        (automation_id,round_at,drive_key,round_token,source_port,item_key,identity_key)]])
                    execute([[CREATE INDEX idx_automation_delivery_history_drive ON kickside_automation_delivery_history
                        (automation_id,drive_key,round_at,round_token,source_port,item_key,identity_key)]])
                    execute([[CREATE INDEX idx_automation_delivery_history_expiry ON kickside_automation_delivery_history
                        (expires_at,automation_id,drive_key,round_token,source_port,item_key,identity_key)]])
                    execute([[CREATE INDEX idx_automation_delivery_history_outcomes ON kickside_automation_delivery_history
                        (automation_id,source_port,item_key,identity_key)]])
                    execute([[CREATE INDEX idx_automation_delivery_history_family ON kickside_automation_delivery_history
                        (automation_id,source_port,item_key,attempt_family)]])

                end)
            end)
        end
    end)
end)
